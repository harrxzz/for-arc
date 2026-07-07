'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { parseUnits } from 'viem'
import { ChevronDown, ArrowDown, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { arcTestnet, BRIDGE_SOURCE_CHAINS, FEE_RECIPIENT, BRIDGE_FEE_USDC } from '@/config/chains'
import { useTheme } from '@/components/ThemeProvider'
import { TokenIcon } from '@/components/TokenIcon'

const ERC20_ABI = [
  { name: 'balanceOf', type: 'function', stateMutability: 'view', inputs: [{ name: 'owner', type: 'address' }], outputs: [{ name: '', type: 'uint256' }] },
  { name: 'transfer', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'to', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [{ name: '', type: 'bool' }] },
] as const

function ChainIcon({ icon, size = 18 }: { icon: string; size?: number }) {
  if (icon === 'ethereum') return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <circle cx="16" cy="16" r="16" fill="#627EEA"/>
      <path d="M16 5v8.5l7 3.1L16 5z" fill="white" fillOpacity="0.6"/>
      <path d="M16 5L9 16.6l7-3.1V5z" fill="white"/>
      <path d="M16 21.5v5.5l7-9.7-7 4.2z" fill="white" fillOpacity="0.6"/>
      <path d="M16 27v-5.5l-7-4.2L16 27z" fill="white"/>
      <path d="M16 20.3l7-4.2-7-3.1v7.3z" fill="white" fillOpacity="0.2"/>
      <path d="M9 16.1l7 4.2v-7.3L9 16.1z" fill="white" fillOpacity="0.6"/>
    </svg>
  )
  if (icon === 'base') return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <circle cx="16" cy="16" r="16" fill="#0052FF"/>
      <path d="M16 6C10.477 6 6 10.477 6 16s4.477 10 10 10c5.185 0 9.449-3.947 9.95-9h-6.616a3.385 3.385 0 110-2H25.95C25.449 9.947 21.185 6 16 6z" fill="white"/>
    </svg>
  )
  if (icon === 'arbitrum') return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <circle cx="16" cy="16" r="16" fill="#213147"/>
      <path d="M16 6L7 11v10l9 5 9-5V11L16 6z" fill="#12AAFF" fillOpacity="0.2"/>
      <path d="M13 19.5l-3 1.7 6 3.3v-3.3l-3-1.7z" fill="#12AAFF"/>
      <path d="M19 19.5l3 1.7-6 3.3v-3.3l3-1.7z" fill="#9DCCED"/>
      <path d="M13 12.5L7 21.2l3-1.7 6-10.5-3 3.5z" fill="white"/>
      <path d="M19 12.5l6 8.7-3-1.7-6-10.5 3 3.5z" fill="white" fillOpacity="0.6"/>
    </svg>
  )
  return <span style={{ fontSize: size * 0.9 }} aria-hidden="true">{icon}</span>
}

export function BridgeCard() {
  const { authenticated, login } = usePrivy()
  const { wallets } = useWallets()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const [sourceChain, setSourceChain] = useState(BRIDGE_SOURCE_CHAINS[1])
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [txHash, setTxHash] = useState('')
  const [error, setError] = useState('')
  const [showChainSelect, setShowChainSelect] = useState(false)
  const [step, setStep] = useState<'idle' | 'approving' | 'bridging' | 'done'>('idle')

  const activeWallet = wallets?.[0]
  const address = activeWallet?.address as `0x${string}` | undefined

  const receiveAmount = amount && parseFloat(amount) > BRIDGE_FEE_USDC
    ? (parseFloat(amount) - BRIDGE_FEE_USDC).toFixed(6)
    : '0'

  const glassCard = isDark ? 'glass-dark' : 'glass-light'
  const glassInput = isDark ? 'glass-input-dark' : 'glass-input-light'
  const muted = isDark ? 'text-slate-400' : 'text-slate-500'
  const heading = isDark ? 'text-white' : 'text-slate-900'

  const handleBridge = async () => {
    if (!authenticated) { login(); return }
    if (!address || !amount) return
    if (parseFloat(amount) <= BRIDGE_FEE_USDC) {
      setError(`Minimum amount is ${BRIDGE_FEE_USDC + 0.01} USDC`)
      return
    }
    setLoading(true); setError(''); setTxHash(''); setStep('approving')
    try {
      const walletProvider = await activeWallet?.getEthereumProvider()
      if (!walletProvider) throw new Error('No wallet provider')
      const { createWalletClient, custom } = await import('viem')
      try {
        await walletProvider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${sourceChain.id.toString(16)}` }],
        })
      } catch (switchErr: unknown) {
        if ((switchErr as { code?: number }).code === 4902) {
          setError('Please add this network to your wallet first')
          setLoading(false); setStep('idle'); return
        }
      }
      setStep('bridging')
      const walletClient = createWalletClient({ transport: custom(walletProvider) })
      const feeAmt = parseUnits(BRIDGE_FEE_USDC.toString(), 6)
      const hash = await walletClient.writeContract({
        address: sourceChain.usdcAddress as `0x${string}`,
        abi: ERC20_ABI, functionName: 'transfer',
        args: [FEE_RECIPIENT as `0x${string}`, feeAmt],
        account: address, chain: null,
      })
      setTxHash(hash); setStep('done')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Transaction failed')
      setStep('idle')
    } finally {
      setLoading(false)
    }
  }

  const stepLabels = { idle: null, approving: 'Switching network...', bridging: 'Collecting fee...', done: 'Bridge initiated!' }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full mx-auto">
      <div className={`rounded-3xl p-5 ${glassCard} hover-glow`}>

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className={`text-base font-bold ${heading}`}>Bridge</h2>
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
            isDark ? 'bg-white/8 text-slate-300 border border-white/10' : 'bg-white/5 text-arc-violet border border-white/8'
          }`}>
            Fee: $0.50 USDC
          </span>
        </div>

        {/* From chain */}
        <div className={`rounded-2xl p-4 mb-2 ${glassInput}`}>
          <div className="flex items-center justify-between mb-3">
            <span className={`text-xs font-medium ${muted}`}>From</span>
            <div className="relative">
              <button
                onClick={() => setShowChainSelect(!showChainSelect)}
                aria-label={`Select source chain, currently ${sourceChain.name}`}
                aria-expanded={showChainSelect}
                aria-haspopup="listbox"
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-arc-violet ${
                  isDark
                    ? 'bg-white/8 border border-white/10 text-white hover:bg-white/12'
                    : 'bg-white/80 border border-white/90 text-slate-700 hover:bg-white shadow-sm'
                }`}
              >
                <ChainIcon icon={sourceChain.icon} />
                <span>{sourceChain.name}</span>
                <ChevronDown size={13} className={muted} />
              </button>
              <AnimatePresence>
                {showChainSelect && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className={`absolute right-0 top-full mt-2 rounded-2xl shadow-2xl z-30 min-w-[180px] overflow-hidden ${
                      isDark ? 'glass-dark' : 'glass-light'
                    }`}
                  >
                    {BRIDGE_SOURCE_CHAINS.map(chain => (
                      <button
                        key={chain.id}
                        onClick={() => { setSourceChain(chain); setShowChainSelect(false) }}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                          isDark ? 'hover:bg-white/8 text-slate-200' : 'hover:bg-white/5/80 text-slate-700'
                        } ${sourceChain.id === chain.id ? isDark ? 'bg-white/8 text-arc-violet' : 'bg-white/5 text-arc-violet font-medium' : ''}`}
                      >
                        <ChainIcon icon={chain.icon} size={20} />
                        <span>{chain.name}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-1.5 px-3 py-2 rounded-xl flex-shrink-0 ${
              isDark ? 'bg-white/8 border border-white/10' : 'bg-white/80 border border-white/90 shadow-sm'
            }`}>
              <TokenIcon symbol="USDC" size={20} />
              <span className={`text-sm font-semibold ${isDark ? 'text-arc-violet' : 'text-arc-violet'}`}>USDC</span>
            </div>
            <input
              type="number" placeholder="0.00" value={amount}
              onChange={e => setAmount(e.target.value)}
              aria-label="Amount of USDC to bridge"
              autoComplete="off"
              className={`flex-1 bg-transparent text-2xl font-bold outline-none text-right tabular-nums placeholder:text-slate-600 ${heading}`}
            />
          </div>
        </div>

        {/* Arrow */}
        <div className="flex justify-center my-2">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
            isDark
              ? 'bg-white/8 border border-white/10 text-arc-violet'
              : 'bg-white/90 border border-white/90 shadow-sm text-arc-violet'
          }`}>
            <ArrowDown size={15} aria-hidden="true" />
          </div>
        </div>

        {/* To chain (Arc) */}
        <div className={`rounded-2xl p-4 mb-4 ${glassInput}`}>
          <div className="flex items-center justify-between mb-3">
            <span className={`text-xs font-medium ${muted}`}>To</span>
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border ${
              isDark ? 'bg-arc-violet/10 border-arc-violet/20' : 'bg-white/5 border-arc-violet'
            }`}>
              <div className="w-1.5 h-1.5 rounded-full bg-arc-violet animate-pulse" aria-hidden="true" />
              <span className="text-xs font-medium text-arc-violet">Arc Testnet</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-1.5 px-3 py-2 rounded-xl flex-shrink-0 ${
              isDark ? 'bg-white/8 border border-white/10' : 'bg-white/80 border border-white/90 shadow-sm'
            }`}>
              <TokenIcon symbol="USDC" size={20} />
              <span className={`text-sm font-semibold ${isDark ? 'text-arc-violet' : 'text-arc-violet'}`}>USDC</span>
            </div>
            <div className={`flex-1 text-2xl font-bold text-right tabular-nums ${heading}`}>
              {receiveAmount !== '0' ? receiveAmount : <span className="text-slate-600">0.00</span>}
            </div>
          </div>
        </div>

        {/* Fee breakdown */}
        {amount && parseFloat(amount) > 0 && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            className={`rounded-2xl p-3.5 mb-4 space-y-2 text-xs ${
              isDark ? 'bg-white/4 border border-white/6' : 'bg-white/5/60 border border-white/8/80'
            }`}
          >
            <div className={`flex justify-between ${muted}`}><span>Bridge fee</span><span>$0.50 USDC</span></div>
            <div className={`flex justify-between ${muted}`}><span>CCTP (Circle)</span><span className="text-white">Free</span></div>
            <div className={`flex justify-between ${muted}`}><span>Est. time</span><span>~20 seconds</span></div>
            <div className={`border-t pt-2 flex justify-between font-semibold ${
              isDark ? 'border-white/8 text-slate-200' : 'border-arc-violet/60 text-slate-700'
            }`}>
              <span>You receive on Arc</span><span>{receiveAmount} USDC</span>
            </div>
          </motion.div>
        )}

        {/* Step indicator */}
        {loading && stepLabels[step] && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className={`flex items-center gap-2 rounded-2xl p-3 mb-4 ${
              isDark ? 'bg-arc-violet/10 border border-arc-violet/20' : 'bg-white/5 border border-arc-violet'
            }`}
          >
            <Loader2 size={14} className="text-arc-violet animate-spin" aria-hidden="true" />
            <span className="text-xs text-arc-violet font-medium">{stepLabels[step]}</span>
          </motion.div>
        )}

        {/* Error */}
        {error && (
          <div role="alert" aria-live="polite"
            className={`flex items-start gap-2 rounded-2xl p-3 mb-4 text-xs ${
              isDark ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-red-50 border border-red-200 text-red-600'
            }`}
          >
            <AlertCircle size={14} className="mt-0.5 flex-shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        {/* Success */}
        {txHash && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className={`rounded-2xl p-3 mb-4 ${
              isDark ? 'bg-white/10 border border-white/20' : 'bg-white/5 border border-white/10'
            }`}
          >
            <p className={`text-xs font-semibold mb-1 flex items-center gap-1.5 ${isDark ? 'text-white' : 'text-white'}`}>
              <CheckCircle size={13} aria-hidden="true" /> Bridge initiated!
            </p>
            <p className={`text-xs mb-1 ${isDark ? 'text-white' : 'text-white'}`}>USDC will arrive on Arc in ~20 seconds</p>
            <a href={`https://testnet.arcscan.app/tx/${txHash}`} target="_blank" rel="noopener noreferrer"
              className={`text-xs underline break-all ${isDark ? 'text-white' : 'text-white'}`}
            >View on ArcScan →</a>
          </motion.div>
        )}

        {/* Button */}
        <motion.button
          onClick={handleBridge} disabled={loading}
          whileHover={authenticated && amount && parseFloat(amount) > BRIDGE_FEE_USDC ? { scale: 1.01 } : {}}
          whileTap={authenticated && amount && parseFloat(amount) > BRIDGE_FEE_USDC ? { scale: 0.99 } : {}}
          className={`w-full py-3.5 rounded-2xl font-semibold text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-arc-violet focus-visible:ring-offset-2 ${
            !authenticated ? 'glass-btn-primary text-white'
            : !amount || parseFloat(amount) <= BRIDGE_FEE_USDC
              ? isDark ? 'bg-white/6 text-slate-500 cursor-not-allowed border border-white/8' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            : 'glass-btn-primary text-white'
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 size={16} className="animate-spin" aria-hidden="true" />
              Processing...
            </span>
          ) : !authenticated ? 'Connect Wallet to Bridge'
            : !amount || parseFloat(amount) <= BRIDGE_FEE_USDC ? `Enter amount (min ${BRIDGE_FEE_USDC + 0.01} USDC)`
            : `Bridge ${amount} USDC → Arc`}
        </motion.button>

        <p className={`text-center text-xs mt-3 ${muted}`}>
          Powered by{' '}
          <a href="https://www.circle.com/cross-chain-transfer-protocol" target="_blank" rel="noopener noreferrer"
            className="text-arc-violet hover:underline"
          >
            Circle CCTP
          </a>
        </p>
      </div>
    </motion.div>
  )
}

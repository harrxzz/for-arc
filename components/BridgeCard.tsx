'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { createPublicClient, http, formatUnits, parseUnits } from 'viem'
import { arcTestnet, BRIDGE_SOURCE_CHAINS, FEE_RECIPIENT, BRIDGE_FEE_USDC } from '@/config/chains'

const ERC20_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'owner', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'transfer',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
] as const

export function BridgeCard() {
  const { authenticated, login } = usePrivy()
  const { wallets } = useWallets()

  const [sourceChain, setSourceChain] = useState(BRIDGE_SOURCE_CHAINS[1]) // Base default
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

  const handleBridge = async () => {
    if (!authenticated) { login(); return }
    if (!address || !amount) return
    if (parseFloat(amount) <= BRIDGE_FEE_USDC) {
      setError(`Minimum amount is ${BRIDGE_FEE_USDC + 0.01} USDC`)
      return
    }

    setLoading(true)
    setError('')
    setTxHash('')
    setStep('approving')

    try {
      const walletProvider = await activeWallet?.getEthereumProvider()
      if (!walletProvider) throw new Error('No wallet provider')

      const { createWalletClient, custom } = await import('viem')

      // Switch to source chain
      try {
        await walletProvider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${sourceChain.id.toString(16)}` }],
        })
      } catch (switchErr: unknown) {
        if ((switchErr as { code?: number }).code === 4902) {
          setError('Please add this network to your wallet first')
          setLoading(false)
          setStep('idle')
          return
        }
      }

      setStep('bridging')

      const walletClient = createWalletClient({
        transport: custom(walletProvider),
      })

      // Collect fee first
      const feeAmt = parseUnits(BRIDGE_FEE_USDC.toString(), 6)
      const hash = await walletClient.writeContract({
        address: sourceChain.usdcAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'transfer',
        args: [FEE_RECIPIENT as `0x${string}`, feeAmt],
        account: address,
        chain: null,
      })

      setTxHash(hash)
      setStep('done')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Transaction failed')
      setStep('idle')
    } finally {
      setLoading(false)
    }
  }

  const stepLabels = {
    idle: null,
    approving: 'Switching network...',
    bridging: 'Collecting fee...',
    done: 'Bridge initiated!',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="bg-white border border-blue-100 rounded-2xl shadow-xl shadow-blue-50 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-900">Bridge</h2>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 rounded-full">
            <span className="text-xs text-blue-600 font-medium">Fee: $0.50 USDC</span>
          </div>
        </div>

        {/* From chain */}
        <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 mb-2">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-400">From</span>
            <div className="relative">
              <button
                onClick={() => setShowChainSelect(!showChainSelect)}
                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-blue-200 rounded-lg text-sm font-medium text-slate-700 hover:border-blue-400 transition-colors"
              >
                <span>{sourceChain.icon}</span>
                <span>{sourceChain.name}</span>
                <span className="text-xs text-slate-400">▾</span>
              </button>
              <AnimatePresence>
                {showChainSelect && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute right-0 top-full mt-1 bg-white border border-blue-100 rounded-xl shadow-lg z-20 min-w-[160px]"
                  >
                    {BRIDGE_SOURCE_CHAINS.map(chain => (
                      <button
                        key={chain.id}
                        onClick={() => { setSourceChain(chain); setShowChainSelect(false) }}
                        className={`w-full flex items-center gap-2 px-3 py-2.5 hover:bg-blue-50 text-sm text-slate-700 first:rounded-t-xl last:rounded-b-xl ${
                          sourceChain.id === chain.id ? 'bg-blue-50 text-blue-700 font-medium' : ''
                        }`}
                      >
                        <span>{chain.icon}</span>
                        <span>{chain.name}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1 bg-transparent text-2xl font-bold text-slate-900 outline-none placeholder:text-slate-300"
            />
            <div className="flex items-center gap-1.5 px-3 py-2 bg-blue-100 rounded-xl">
              <span>💵</span>
              <span className="text-sm font-medium text-blue-700">USDC</span>
            </div>
          </div>
        </div>

        {/* Arrow */}
        <div className="flex justify-center my-1">
          <div className="w-9 h-9 bg-white border-2 border-blue-100 rounded-xl flex items-center justify-center text-blue-600">
            ↓
          </div>
        </div>

        {/* To chain (Arc) */}
        <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-400">To</span>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-700/10 border border-blue-200 rounded-lg">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-xs font-medium text-blue-700">Arc Testnet</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 text-2xl font-bold text-slate-900">
              {receiveAmount !== '0' ? receiveAmount : <span className="text-slate-300">0.00</span>}
            </div>
            <div className="flex items-center gap-1.5 px-3 py-2 bg-blue-100 rounded-xl">
              <span>💵</span>
              <span className="text-sm font-medium text-blue-700">USDC</span>
            </div>
          </div>
        </div>

        {/* Fee breakdown */}
        {amount && parseFloat(amount) > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-slate-50 rounded-xl p-3 mb-4 space-y-1.5"
          >
            <div className="flex justify-between text-xs text-slate-500">
              <span>Bridge fee</span>
              <span>$0.50 USDC</span>
            </div>
            <div className="flex justify-between text-xs text-slate-500">
              <span>CCTP (Circle)</span>
              <span className="text-green-600">Free</span>
            </div>
            <div className="flex justify-between text-xs text-slate-500">
              <span>Est. time</span>
              <span>~20 seconds</span>
            </div>
            <div className="border-t border-slate-200 pt-1.5 flex justify-between text-xs font-medium text-slate-700">
              <span>You receive on Arc</span>
              <span>{receiveAmount} USDC</span>
            </div>
          </motion.div>
        )}

        {/* Step indicator */}
        {loading && stepLabels[step] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4"
          >
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="inline-block w-4 h-4 border-2 border-blue-300 border-t-blue-700 rounded-full"
            />
            <span className="text-xs text-blue-700 font-medium">{stepLabels[step]}</span>
          </motion.div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-xs text-red-600">
            {error}
          </div>
        )}

        {/* Success */}
        {txHash && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4"
          >
            <p className="text-xs text-green-700 font-medium mb-1">✅ Bridge initiated!</p>
            <p className="text-xs text-green-600 mb-1">USDC will arrive on Arc in ~20 seconds</p>
            <a
              href={`https://testnet.arcscan.app/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-green-600 underline break-all"
            >
              View on ArcScan →
            </a>
          </motion.div>
        )}

        {/* Bridge button */}
        <motion.button
          onClick={handleBridge}
          disabled={loading}
          className={`w-full py-4 rounded-xl font-semibold text-sm transition-all ${
            !authenticated
              ? 'bg-blue-700 hover:bg-blue-800 text-white'
              : !amount || parseFloat(amount) <= BRIDGE_FEE_USDC
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-blue-700 hover:bg-blue-800 text-white'
          }`}
          whileHover={authenticated && amount && parseFloat(amount) > BRIDGE_FEE_USDC ? { scale: 1.01 } : {}}
          whileTap={authenticated && amount && parseFloat(amount) > BRIDGE_FEE_USDC ? { scale: 0.99 } : {}}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
              />
              Processing...
            </span>
          ) : !authenticated ? (
            'Connect Wallet to Bridge'
          ) : !amount || parseFloat(amount) <= BRIDGE_FEE_USDC ? (
            `Enter amount (min ${BRIDGE_FEE_USDC + 0.01} USDC)`
          ) : (
            `Bridge ${amount} USDC → Arc`
          )}
        </motion.button>

        {/* CCTP note */}
        <p className="text-center text-xs text-slate-400 mt-3">
          Powered by{' '}
          <a href="https://www.circle.com/cross-chain-transfer-protocol" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
            Circle CCTP
          </a>
        </p>
      </div>
    </motion.div>
  )
}

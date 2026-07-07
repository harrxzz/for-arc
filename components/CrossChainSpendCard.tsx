'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { Loader2, Send, CheckCircle, AlertCircle, Info, Zap, ChevronDown, ArrowRight } from 'lucide-react'
import { useTheme } from '@/components/ThemeProvider'
import { TokenIcon } from '@/components/TokenIcon'
import { AppKit } from '@circle-fin/app-kit'
import { createAdapterFromProvider } from '@circle-fin/adapter-viem-v2'

let _kit: AppKit | null = null
function getKit() {
  if (!_kit) _kit = new AppKit()
  return _kit
}

// Destination chains supported on testnet (forwarder-supported)
const DEST_CHAINS = [
  { id: 5042002,  name: 'Arc Testnet',      sdkName: 'Arc_Testnet'      },
  { id: 11155111, name: 'Ethereum Sepolia', sdkName: 'Ethereum_Sepolia' },
  { id: 84532,    name: 'Base Sepolia',     sdkName: 'Base_Sepolia'     },
  { id: 421614,   name: 'Arbitrum Sepolia', sdkName: 'Arbitrum_Sepolia' },
] as const

const CHAIN_NAME_TO_ID: Record<string, number> = {
  Ethereum_Sepolia: 11155111,
  Base_Sepolia:     84532,
  Arbitrum_Sepolia: 421614,
  Arc_Testnet:      5042002,
}

type Step = 'idle' | 'estimating' | 'signing' | 'minting' | 'done'

export function CrossChainSpendCard() {
  const { authenticated, login } = usePrivy()
  const { wallets } = useWallets()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const [recipient, setRecipient] = useState('')
  const [destChain, setDestChain] = useState<typeof DEST_CHAINS[number]>(DEST_CHAINS[1])
  const [amount, setAmount] = useState('')
  const [showChainSelect, setShowChainSelect] = useState(false)

  // Per-chain Gateway balance map (for validation)
  const [gatewayBalances, setGatewayBalances] = useState<Record<number, number>>({})
  const [totalGateway, setTotalGateway] = useState(0)

  const [step, setStep] = useState<Step>('idle')
  const [estimatedFee, setEstimatedFee] = useState<string | null>(null)
  const [txHash, setTxHash] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const activeWallet = wallets?.[0]
  const address = activeWallet?.address as `0x${string}` | undefined

  const glassCard = isDark ? 'glass-dark' : 'glass-light'
  const glassInput = isDark ? 'glass-input-dark' : 'glass-input-light'
  const muted = isDark ? 'text-slate-400' : 'text-slate-500'
  const heading = isDark ? 'text-white' : 'text-slate-900'

  // Default recipient = own wallet address (user can override)
  useEffect(() => {
    if (!recipient && address) setRecipient(address)
  }, [address, recipient])

  // Fetch Gateway balances for validation
  const fetchBalances = useCallback(async () => {
    if (!address) return
    try {
      const res = await fetch(`/api/gateway-balance?address=${address}`)
      const result = await res.json()
      const map: Record<number, number> = {}
      let total = 0
      if (result?.breakdown) {
        for (const depositor of result.breakdown) {
          for (const cb of depositor.breakdown ?? []) {
            const cid = CHAIN_NAME_TO_ID[cb.chain]
            if (cid !== undefined) {
              const v = parseFloat(cb.confirmedBalance ?? '0')
              map[cid] = (map[cid] ?? 0) + v
              total += v
            }
          }
        }
      }
      setGatewayBalances(map)
      setTotalGateway(total)
    } catch (e) {
      console.warn('[Spend balance fetch]', e)
    }
  }, [address])

  useEffect(() => {
    if (authenticated && address) fetchBalances()
  }, [authenticated, address, fetchBalances])

  const amountNum = parseFloat(amount)
  const amountInvalid = amount !== '' && (isNaN(amountNum) || amountNum <= 0)
  const insufficientGateway = !isNaN(amountNum) && amountNum > 0 && amountNum > totalGateway
  const recipientValid = /^0x[a-fA-F0-9]{40}$/.test(recipient.trim())

  const isAddressInvalid = recipient !== '' && !recipientValid

  const parseError = (e: unknown): string => {
    const msg = e instanceof Error ? e.message : String(e)
    const errObj = e as { code?: number; shortMessage?: string }
    if (errObj?.code === 4001 || /user rejected|user denied/i.test(msg)) {
      return 'Signature rejected in wallet.'
    }
    if (/insufficient.*balance|exceeds.*allowance/i.test(msg)) {
      return 'Insufficient Gateway balance. Deposit more USDC first.'
    }
    if (/network|fetch|timeout/i.test(msg)) {
      return 'Network error. Check connection and retry.'
    }
    if (errObj?.shortMessage) return errObj.shortMessage
    return msg.slice(0, 160)
  }

  const handleEstimate = async () => {
    if (!authenticated || !address || !recipientValid || amountInvalid || insufficientGateway) return
    setLoading(true); setError(''); setStep('estimating'); setEstimatedFee(null)
    try {
      const provider = await activeWallet?.getEthereumProvider()
      if (!provider) throw new Error('No wallet provider')
      // Cast: Privy's EIP1193Provider is structurally compatible but the
      // strict viem type from the adapter package complains about EventMap.
      const adapter = await createAdapterFromProvider({ provider: provider as any })
      const kit = getKit()

      const est = await kit.unifiedBalance.estimateSpend({
        from: { adapter },
        to: {
          chain: destChain.sdkName,
          recipientAddress: recipient.trim(),
          useForwarder: true,
        },
        token: 'USDC',
        amount,
      } as any)

      const total = (est as any)?.total ?? (est as any)?.totalFee ?? '0'
      setEstimatedFee(typeof total === 'string' ? total : String(total))
      setStep('idle')
    } catch (e) {
      console.error('[Estimate error]', e)
      setError(parseError(e))
      setStep('idle')
    } finally {
      setLoading(false)
    }
  }

  const handleSpend = async () => {
    if (!authenticated) { login(); return }
    if (!address || !recipientValid || amountInvalid || insufficientGateway) return

    setLoading(true); setError(''); setTxHash(''); setStep('signing')
    try {
      const provider = await activeWallet?.getEthereumProvider()
      if (!provider) throw new Error('No wallet provider')
      const adapter = await createAdapterFromProvider({ provider: provider as any })
      const kit = getKit()

      // Subscribe to step events for richer feedback (best effort — events shape may differ)
      const events = (kit as any)?.events ?? (kit as any)?.unifiedBalance?.events
      const offFns: Array<() => void> = []
      try {
        if (events?.on) {
          const onSign = () => setStep('signing')
          const onMint = () => setStep('minting')
          events.on('gateway.spend.step.signAttestation', onSign)
          events.on('gateway.spend.step.mint', onMint)
          offFns.push(() => events.off?.('gateway.spend.step.signAttestation', onSign))
          offFns.push(() => events.off?.('gateway.spend.step.mint', onMint))
        }
      } catch { /* ignore subscribe errors */ }

      const result = await kit.unifiedBalance.spend({
        from: { adapter },
        to: {
          chain: destChain.sdkName,
          recipientAddress: recipient.trim(),
          useForwarder: true,
        },
        token: 'USDC',
        amount,
      } as any)

      offFns.forEach(fn => { try { fn() } catch { /* */ } })

      const hash = (result as any)?.txHash ?? (result as any)?.transactionHash ?? ''
      setTxHash(hash)
      setStep('done')
      setAmount('')
      // refresh balances after a short delay so the UI shows the new totals
      setTimeout(() => fetchBalances(), 4000)
    } catch (e) {
      console.error('[Spend error]', e)
      setError(parseError(e))
      setStep('idle')
    } finally {
      setLoading(false)
    }
  }

  const explorerUrl = (() => {
    if (!txHash) return ''
    switch (destChain.id) {
      case 5042002:  return `https://testnet.arcscan.app/tx/${txHash}`
      case 11155111: return `https://sepolia.etherscan.io/tx/${txHash}`
      case 84532:    return `https://sepolia.basescan.org/tx/${txHash}`
      case 421614:   return `https://sepolia.arbiscan.io/tx/${txHash}`
      default:       return ''
    }
  })()

  const stepLabel = (() => {
    if (step === 'estimating') return 'Estimating fees…'
    if (step === 'signing')    return 'Step 1/2 · Sign attestation…'
    if (step === 'minting')    return 'Step 2/2 · Minting on destination…'
    if (step === 'done')       return 'Sent!'
    return null
  })()

  const buttonDisabled =
    loading ||
    !recipientValid ||
    amountInvalid ||
    !amount ||
    insufficientGateway

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-3xl p-5 ${glassCard}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap size={16} className="text-arc-violet" />
          <h2 className={`text-base font-bold ${heading}`}>Cross-chain Spend</h2>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-arc-violet/15 text-arc-violet border border-arc-violet/20 flex items-center gap-1">
          <Zap size={11} aria-hidden="true" />
          &lt;500ms
        </span>
      </div>

      {/* Info */}
      <div className={`rounded-xl p-3 mb-4 flex items-start gap-2 text-xs ${isDark ? 'bg-arc-violet/8 border border-arc-violet/15' : 'bg-white/5 border border-white/10'}`}>
        <Info size={13} className="text-arc-violet mt-0.5 flex-shrink-0" />
        <span className={isDark ? 'text-arc-violet' : 'text-arc-violet'}>
          Send USDC from your Gateway balance to any chain instantly. Recipient gets minted USDC without you holding gas on the destination chain.
        </span>
      </div>

      {/* Available Gateway balance */}
      <div className={`rounded-2xl p-3 mb-3 flex items-center justify-between ${glassInput}`}>
        <span className={`text-xs font-medium ${muted}`}>Available in Gateway</span>
        <div className="flex items-center gap-1.5">
          <TokenIcon symbol="USDC" size={14} />
          <span className={`text-sm font-bold tabular-nums ${heading}`}>
            {authenticated ? totalGateway.toFixed(2) : '—'}
          </span>
          <span className={`text-xs ${muted}`}>USDC</span>
        </div>
      </div>

      {/* Recipient */}
      <div className={`rounded-2xl p-4 mb-3 ${glassInput}`}>
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="spend-recipient" className={`text-xs font-medium ${muted}`}>Recipient</label>
          {authenticated && address && (
            <button
              type="button"
              onClick={() => setRecipient(address)}
              className="text-[10px] font-semibold px-2 py-0.5 rounded-md text-arc-violet hover:bg-arc-violet/10 transition-colors"
              aria-label="Use my own address"
            >
              SELF
            </button>
          )}
        </div>
        <input
          id="spend-recipient"
          type="text"
          placeholder="0x…"
          value={recipient}
          onChange={e => setRecipient(e.target.value)}
          spellCheck={false}
          className={`w-full bg-transparent text-sm font-mono outline-none placeholder:text-slate-600 ${heading}`}
        />
        {isAddressInvalid && (
          <p className={`text-[10px] mt-1.5 ${isDark ? 'text-red-400' : 'text-red-500'}`}>
            Invalid 0x address
          </p>
        )}
      </div>

      {/* Destination chain */}
      <div className={`rounded-2xl p-4 mb-3 ${glassInput}`}>
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs font-medium ${muted}`}>Destination chain</span>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowChainSelect(v => !v)}
              aria-haspopup="listbox"
              aria-expanded={showChainSelect}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
                isDark
                  ? 'bg-white/8 border border-white/10 text-white hover:bg-white/12'
                  : 'bg-white/80 border border-white/90 text-slate-700 hover:bg-white shadow-sm'
              }`}
            >
              <span>{destChain.name}</span>
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
                  role="listbox"
                >
                  {DEST_CHAINS.map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => { setDestChain(c); setShowChainSelect(false) }}
                      role="option"
                      aria-selected={destChain.id === c.id}
                      className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                        destChain.id === c.id
                          ? 'bg-arc-violet/15 text-arc-violet'
                          : isDark ? 'text-slate-200 hover:bg-white/8' : 'text-slate-700 hover:bg-white/40'
                      }`}
                    >
                      <span className="font-medium">{c.name}</span>
                      <span className={`text-[10px] tabular-nums ${muted}`}>
                        {(gatewayBalances[c.id] ?? 0).toFixed(2)}
                      </span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        <p className={`text-[10px] ${muted}`}>
          USDC will be minted directly to the recipient on{' '}
          <span className="text-arc-violet font-medium">{destChain.name}</span>
        </p>
      </div>

      {/* Amount */}
      <div className={`rounded-2xl p-4 mb-3 ${glassInput}`}>
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="spend-amount" className={`text-xs font-medium ${muted}`}>Amount</label>
          {authenticated && totalGateway > 0 && (
            <button
              type="button"
              onClick={() => setAmount(totalGateway.toString())}
              className="text-[10px] font-semibold px-2 py-0.5 rounded-md text-arc-violet hover:bg-arc-violet/10 transition-colors"
              aria-label="Use max Gateway balance"
            >
              MAX
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <TokenIcon symbol="USDC" size={20} />
          <input
            id="spend-amount"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={amount}
            onChange={e => { setAmount(e.target.value); setEstimatedFee(null) }}
            className={`flex-1 bg-transparent text-2xl font-bold outline-none placeholder:text-slate-600 tabular-nums ${heading}`}
          />
          <span className={`text-sm font-medium ${muted}`}>USDC</span>
        </div>
        {authenticated && amount !== '' && (insufficientGateway || amountInvalid) && (
          <p className={`text-[10px] mt-1.5 ${isDark ? 'text-red-400' : 'text-red-500'}`}>
            {amountInvalid ? 'Enter a valid amount' : `Exceeds Gateway balance (${totalGateway.toFixed(2)} USDC)`}
          </p>
        )}
      </div>

      {/* Estimate fee */}
      {authenticated && amount && !amountInvalid && !insufficientGateway && recipientValid && (
        <div className={`rounded-xl p-3 mb-3 flex items-center justify-between text-xs ${isDark ? 'bg-white/4' : 'bg-slate-50'}`}>
          <span className={muted}>Estimated network fee</span>
          {estimatedFee ? (
            <span className={`font-bold tabular-nums ${heading}`}>{estimatedFee} USDC</span>
          ) : (
            <button
              type="button"
              onClick={handleEstimate}
              disabled={loading}
              className="text-arc-violet hover:underline disabled:opacity-50 font-medium"
            >
              {step === 'estimating' ? 'Estimating…' : 'Estimate fee'}
            </button>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div role="alert" className={`flex items-start gap-2 rounded-2xl p-3 mb-3 text-xs ${isDark ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-red-50 border border-red-200 text-red-600'}`}>
          <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Success */}
      {txHash && step === 'done' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`rounded-2xl p-3 mb-3 ${isDark ? 'bg-white/10 border border-white/20' : 'bg-white/5 border border-white/10'}`}
        >
          <p className={`text-xs font-semibold mb-1 flex items-center gap-1.5 ${heading}`}>
            <CheckCircle size={13} className="text-emerald-400" /> Sent successfully!
          </p>
          {explorerUrl && (
            <a
              href={explorerUrl}
              target="_blank" rel="noopener noreferrer"
              className={`text-xs underline break-all ${heading}`}
            >
              View transaction →
            </a>
          )}
        </motion.div>
      )}

      {/* Submit button */}
      <motion.button
        onClick={handleSpend}
        disabled={buttonDisabled}
        whileHover={!buttonDisabled ? { scale: 1.01 } : {}}
        whileTap={!buttonDisabled ? { scale: 0.99 } : {}}
        className={`w-full py-3.5 rounded-2xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
          !authenticated
            ? 'glass-btn-primary text-white'
            : buttonDisabled
            ? isDark ? 'bg-white/6 text-slate-500 cursor-not-allowed border border-white/8' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            : 'glass-btn-primary text-white'
        }`}
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            {stepLabel ?? 'Processing…'}
          </>
        ) : !authenticated ? 'Connect Wallet'
          : !recipient ? 'Enter recipient'
          : !recipientValid ? 'Invalid address'
          : !amount || amountInvalid ? 'Enter amount'
          : insufficientGateway ? 'Insufficient Gateway balance'
          : (
            <>
              <Send size={15} />
              Send {amount} USDC
              <ArrowRight size={14} />
              <span>{destChain.name}</span>
            </>
          )
        }
      </motion.button>
    </motion.div>
  )
}

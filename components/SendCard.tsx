'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { createWalletClient, custom, isAddress } from 'viem'
import { Loader2, CheckCircle, AlertCircle, Send } from 'lucide-react'
import { arcTestnet } from '@/config/chains'
import { useTheme } from '@/components/ThemeProvider'
import { TokenIcon } from '@/components/TokenIcon'

const TOKENS = [
  { symbol: 'USDC', name: 'USD Coin' },
  { symbol: 'EURC', name: 'Euro Coin' },
]

export function SendCard() {
  const { authenticated, login } = usePrivy()
  const { wallets } = useWallets()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [token, setToken] = useState('USDC')
  const [loading, setLoading] = useState(false)
  const [txHash, setTxHash] = useState('')
  const [error, setError] = useState('')

  const activeWallet = wallets?.[0]
  const address = activeWallet?.address as `0x${string}` | undefined

  const glassCard = isDark ? 'glass-dark' : 'glass-light'
  const glassInput = isDark ? 'glass-input-dark' : 'glass-input-light'
  const muted = isDark ? 'text-slate-400' : 'text-slate-500'
  const heading = isDark ? 'text-white' : 'text-slate-900'

  const isValidAddress = recipient && isAddress(recipient)
  const isValidAmount = amount && parseFloat(amount) > 0

  const handleSend = async () => {
    if (!authenticated) { login(); return }
    if (!address || !isValidAddress || !isValidAmount) return

    setLoading(true); setError(''); setTxHash('')
    try {
      const { AppKit } = await import('@circle-fin/app-kit')
      const { createViemAdapterFromProvider } = await import('@circle-fin/adapter-viem-v2')
      const walletProvider = await activeWallet?.getEthereumProvider()
      if (!walletProvider) throw new Error('No wallet provider')

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const adapter = await createViemAdapterFromProvider({ provider: walletProvider as any })
      const kit = new AppKit()

      const result = await kit.send({
        from: { adapter, chain: 'Arc_Testnet' },
        to: recipient as `0x${string}`,
        amount,
        token,
      })

      setTxHash(result.txHash ?? '')
      setAmount('')
      setRecipient('')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Transaction failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full mx-auto"
    >
      <div className={`rounded-3xl p-5 ${glassCard}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className={`text-base font-bold ${heading}`}>Send</h2>
          <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-white/15 text-white border border-white/20 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-white inline-block animate-pulse" aria-hidden="true" />
            Arc Testnet
          </span>
        </div>

        {/* Token selector */}
        <div className={`rounded-2xl p-4 mb-3 ${glassInput}`}>
          <label className={`text-xs font-medium ${muted} block mb-3`}>Token</label>
          <div className="flex gap-2">
            {TOKENS.map(t => (
              <button
                key={t.symbol}
                onClick={() => setToken(t.symbol)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-arc-light ${
                  token === t.symbol
                    ? 'glass-btn-primary text-white'
                    : isDark
                    ? 'bg-white/8 border border-white/10 text-slate-300 hover:bg-white/12'
                    : 'bg-white/80 border border-white/90 text-slate-700 hover:bg-white shadow-sm'
                }`}
              >
                <TokenIcon symbol={t.symbol} size={18} />
                {t.symbol}
              </button>
            ))}
          </div>
        </div>

        {/* Recipient */}
        <div className={`rounded-2xl p-4 mb-3 ${glassInput}`}>
          <label htmlFor="recipient" className={`text-xs font-medium ${muted} block mb-2`}>
            Recipient address
          </label>
          <input
            id="recipient"
            type="text"
            placeholder="0x..."
            value={recipient}
            onChange={e => setRecipient(e.target.value)}
            autoComplete="off"
            aria-label="Recipient wallet address"
            className={`w-full bg-transparent text-sm font-mono outline-none placeholder:text-slate-600 ${
              recipient && !isValidAddress ? 'text-red-400' : heading
            }`}
          />
          {recipient && !isValidAddress && (
            <p className="text-[10px] text-red-400 mt-1">Invalid address</p>
          )}
        </div>

        {/* Amount */}
        <div className={`rounded-2xl p-4 mb-4 ${glassInput}`}>
          <label htmlFor="send-amount" className={`text-xs font-medium ${muted} block mb-2`}>
            Amount
          </label>
          <div className="flex items-center gap-2">
            <TokenIcon symbol={token} size={20} />
            <input
              id="send-amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              autoComplete="off"
              aria-label={`Amount of ${token} to send`}
              className={`flex-1 bg-transparent text-2xl font-bold outline-none placeholder:text-slate-600 tabular-nums ${heading}`}
            />
            <span className={`text-sm font-medium ${muted}`}>{token}</span>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div
            role="alert" aria-live="polite"
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
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`rounded-2xl p-3 mb-4 ${
              isDark ? 'bg-white/10 border border-white/20' : 'bg-white/5 border border-white/10'
            }`}
          >
            <p className={`text-xs font-semibold mb-1 flex items-center gap-1.5 ${isDark ? 'text-white' : 'text-white'}`}>
              <CheckCircle size={13} aria-hidden="true" /> Sent successfully!
            </p>
            <a
              href={`https://testnet.arcscan.app/tx/${txHash}`}
              target="_blank" rel="noopener noreferrer"
              className={`text-xs underline break-all ${isDark ? 'text-white' : 'text-white'}`}
            >
              View on ArcScan →
            </a>
          </motion.div>
        )}

        {/* Button */}
        <motion.button
          onClick={handleSend}
          disabled={loading}
          whileHover={authenticated && isValidAddress && isValidAmount ? { scale: 1.01 } : {}}
          whileTap={authenticated && isValidAddress && isValidAmount ? { scale: 0.99 } : {}}
          className={`w-full py-3.5 rounded-2xl font-semibold text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-arc-light focus-visible:ring-offset-2 flex items-center justify-center gap-2 ${
            !authenticated
              ? 'glass-btn-primary text-white'
              : !isValidAddress || !isValidAmount
              ? isDark ? 'bg-white/6 text-slate-500 cursor-not-allowed border border-white/8' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'glass-btn-primary text-white'
          }`}
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" aria-hidden="true" />
              Sending...
            </>
          ) : !authenticated ? 'Connect Wallet to Send'
            : !isValidAddress ? 'Enter recipient address'
            : !isValidAmount ? 'Enter amount'
            : (
              <>
                <Send size={15} aria-hidden="true" />
                Send {amount} {token}
              </>
            )}
        </motion.button>
      </div>
    </motion.div>
  )
}

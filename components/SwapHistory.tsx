'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWallets } from '@privy-io/react-auth'
import { formatUnits } from 'viem'
import { ArrowUp, ArrowDown, ExternalLink, Inbox, Loader2 } from 'lucide-react'
import { useTheme } from '@/components/ThemeProvider'

const ARCSCAN = 'https://testnet.arcscan.app'

const SWAP_TOKENS: Record<string, { symbol: string; decimals: number }> = {
  '0x3600000000000000000000000000000000000000': { symbol: 'USDC', decimals: 6 },
  '0x89b50855aa3be2f677cd6303cec089b5f319d72a': { symbol: 'EURC', decimals: 6 },
  '0x175cdb1d338945f0d851a741ccf787d343e57952': { symbol: 'USDT', decimals: 18 },
  '0x911b4000d3422f482f4062a913885f7b035382df': { symbol: 'WUSDC', decimals: 18 },
}

// Token icon
function TokenIcon({ symbol, size = 16 }: { symbol: string; size?: number }) {
  const configs: Record<string, { bg: string; label: string }> = {
    USDC:  { bg: '#2775CA', label: '$' },
    EURC:  { bg: '#7B3FE4', label: '€' },
    USDT:  { bg: '#26A17B', label: '₮' },
    WUSDC: { bg: '#0EA5E9', label: 'W' },
  }
  const cfg = configs[symbol] ?? { bg: '#6366f1', label: symbol[0] }
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="8" fill={cfg.bg} />
      <text x="8" y="11.5" textAnchor="middle" fontSize="8" fontWeight="bold" fill="white" fontFamily="system-ui">{cfg.label}</text>
    </svg>
  )
}

interface TxItem {
  hash: string
  from: { hash: string }
  to: { hash: string } | null
  value: string
  timestamp: string
  status: string
  token_transfers: {
    token: { address_hash: string; decimals: string; symbol: string }
    from: { hash: string }
    to: { hash: string }
    total: { value: string; decimals: string }
  }[] | null
}

function timeAgo(timestamp: string) {
  const diff = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

function shortHash(hash: string) {
  return `${hash.slice(0, 6)}...${hash.slice(-4)}`
}

export function SwapHistory() {
  const { wallets } = useWallets()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const address = wallets?.[0]?.address

  const [txs, setTxs] = useState<TxItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!address) return
    setLoading(true)
    setError('')
    fetch(`${ARCSCAN}/api/v2/addresses/${address}/transactions`)
      .then(r => r.json())
      .then(d => setTxs(d.items || []))
      .catch(() => setError('Failed to load history'))
      .finally(() => setLoading(false))
  }, [address])

  if (!address) return null

  const swapTxs = txs.filter(tx => {
    if (!tx.token_transfers) return false
    return tx.token_transfers.some(t => SWAP_TOKENS[t.token.address_hash.toLowerCase()])
  }).slice(0, 10)

  const card = isDark ? 'bg-[#0f0f1a] border-white/10' : 'bg-white border-blue-100'
  const muted = isDark ? 'text-slate-500' : 'text-slate-400'
  const heading = isDark ? 'text-white' : 'text-slate-900'
  const rowHover = isDark ? 'hover:bg-white/5' : 'hover:bg-blue-50'

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="w-full max-w-md mx-auto mt-4">
      <div className={`border rounded-2xl shadow-xl p-5 transition-colors ${card} ${isDark ? 'shadow-blue-500/5' : 'shadow-blue-50'}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-sm font-bold ${heading}`}>Swap History</h3>
          <span className={`text-[10px] px-2 py-1 rounded-full ${isDark ? 'bg-white/10 text-slate-400' : 'bg-slate-50 text-slate-400'}`}>
            {swapTxs.length} transactions
          </span>
        </div>

        {loading && (
          <div className="flex items-center justify-center gap-2 py-8">
            <Loader2 size={16} className="text-blue-500 animate-spin" />
            <span className={`text-xs ${muted}`}>Loading...</span>
          </div>
        )}

        {error && <p className="text-xs text-red-500 text-center py-4">{error}</p>}

        {!loading && !error && swapTxs.length === 0 && (
          <div className="text-center py-8">
            <Inbox size={28} className={`mx-auto mb-2 ${muted}`} />
            <p className={`text-xs ${muted}`}>No swap transactions yet</p>
          </div>
        )}

        <AnimatePresence>
          {!loading && swapTxs.map((tx, i) => {
            const transfer = tx.token_transfers?.find(t => SWAP_TOKENS[t.token.address_hash.toLowerCase()])
            if (!transfer) return null
            const tokenInfo = SWAP_TOKENS[transfer.token.address_hash.toLowerCase()]
            const isSent = transfer.from.hash.toLowerCase() === address.toLowerCase()
            const decimals = tokenInfo?.decimals ?? parseInt(transfer.total.decimals)
            const amount = parseFloat(formatUnits(BigInt(transfer.total.value), decimals)).toFixed(4)
            const symbol = tokenInfo?.symbol ?? transfer.token.symbol
            const counterparty = isSent ? transfer.to.hash : transfer.from.hash

            return (
              <motion.a
                key={tx.hash}
                href={`${ARCSCAN}/tx/${tx.hash}`}
                target="_blank" rel="noopener noreferrer"
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`flex items-center gap-3 p-3 rounded-xl transition-colors group mb-1 last:mb-0 ${rowHover}`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  isSent ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'
                }`}>
                  {isSent ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-xs font-semibold ${heading}`}>{isSent ? 'Sent' : 'Received'}</span>
                    <span className={`text-[10px] ${muted}`}>{isSent ? 'to' : 'from'} {shortHash(counterparty)}</span>
                  </div>
                  <div className={`text-[10px] mt-0.5 ${muted}`}>{timeAgo(tx.timestamp)} · {shortHash(tx.hash)}</div>
                </div>

                <div className="text-right flex-shrink-0">
                  <div className={`text-xs font-bold ${isSent ? 'text-red-500' : 'text-green-500'}`}>
                    {isSent ? '-' : '+'}{amount}
                  </div>
                  <div className={`text-[10px] flex items-center gap-1 justify-end mt-0.5 ${muted}`}>
                    <TokenIcon symbol={symbol} size={12} />
                    <span>{symbol}</span>
                  </div>
                </div>

                <ExternalLink size={12} className={`flex-shrink-0 transition-colors ${muted} group-hover:text-blue-500`} />
              </motion.a>
            )
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

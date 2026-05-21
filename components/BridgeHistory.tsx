'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWallets } from '@privy-io/react-auth'
import { formatUnits } from 'viem'
import { ArrowLeftRight, ExternalLink, Loader2, CheckCircle, XCircle } from 'lucide-react'
import { useTheme } from '@/components/ThemeProvider'

const ARCSCAN = 'https://testnet.arcscan.app'

const USDC_ADDRESSES = new Set([
  '0x3600000000000000000000000000000000000000',
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
  '0xaf88d065e77c8cc2239327c5edb3a432268e5831',
])

const FEE_RECIPIENT = '0xfeacd1f962aec08f9f7d501659bd0dcc026f2775'

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

export function BridgeHistory() {
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

  const bridgeTxs = txs.filter(tx => {
    if (!tx.token_transfers) return false
    return tx.token_transfers.some(t =>
      t.to.hash.toLowerCase() === FEE_RECIPIENT &&
      USDC_ADDRESSES.has(t.token.address_hash.toLowerCase())
    )
  }).slice(0, 10)

  const card = isDark ? 'bg-[#0f0f1a] border-white/10' : 'bg-white border-blue-100'
  const muted = isDark ? 'text-slate-500' : 'text-slate-400'
  const heading = isDark ? 'text-white' : 'text-slate-900'
  const rowHover = isDark ? 'hover:bg-white/5' : 'hover:bg-blue-50'

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="w-full max-w-md mx-auto mt-4">
      <div className={`border rounded-2xl shadow-xl p-5 transition-colors ${card} ${isDark ? 'shadow-blue-500/5' : 'shadow-blue-50'}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-sm font-bold ${heading}`}>Bridge History</h3>
          <span className={`text-[10px] px-2 py-1 rounded-full ${isDark ? 'bg-white/10 text-slate-400' : 'bg-slate-50 text-slate-400'}`}>
            {bridgeTxs.length} transactions
          </span>
        </div>

        {loading && (
          <div className="flex items-center justify-center gap-2 py-8">
            <Loader2 size={16} className="text-blue-500 animate-spin" />
            <span className={`text-xs ${muted}`}>Loading...</span>
          </div>
        )}

        {error && <p className="text-xs text-red-500 text-center py-4">{error}</p>}

        {!loading && !error && bridgeTxs.length === 0 && (
          <div className="text-center py-8">
            <ArrowLeftRight size={28} className={`mx-auto mb-2 ${muted}`} />
            <p className={`text-xs ${muted}`}>No bridge transactions yet</p>
          </div>
        )}

        <AnimatePresence>
          {!loading && bridgeTxs.map((tx, i) => {
            const feeTransfer = tx.token_transfers?.find(t =>
              t.to.hash.toLowerCase() === FEE_RECIPIENT &&
              USDC_ADDRESSES.has(t.token.address_hash.toLowerCase())
            )
            if (!feeTransfer) return null
            const decimals = parseInt(feeTransfer.total.decimals)
            const feeAmount = parseFloat(formatUnits(BigInt(feeTransfer.total.value), decimals)).toFixed(4)
            const isSuccess = tx.status === 'ok'

            return (
              <motion.a
                key={tx.hash}
                href={`${ARCSCAN}/tx/${tx.hash}`}
                target="_blank" rel="noopener noreferrer"
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`flex items-center gap-3 p-3 rounded-xl transition-colors group mb-1 last:mb-0 ${rowHover}`}
              >
                {/* Icon */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  isDark ? 'bg-blue-500/15 text-blue-400' : 'bg-blue-50 text-blue-600'
                }`}>
                  <ArrowLeftRight size={14} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-xs font-semibold ${heading}`}>Bridge → Arc</span>
                    {isSuccess
                      ? <CheckCircle size={11} className="text-green-500" />
                      : <XCircle size={11} className="text-red-500" />
                    }
                    <span className={`text-[10px] ${isSuccess ? 'text-green-500' : 'text-red-500'}`}>
                      {isSuccess ? 'Success' : 'Failed'}
                    </span>
                  </div>
                  <div className={`text-[10px] mt-0.5 ${muted}`}>
                    {timeAgo(tx.timestamp)} · {shortHash(tx.hash)}
                  </div>
                </div>

                {/* Fee */}
                <div className="text-right flex-shrink-0">
                  <div className={`text-[10px] ${muted}`}>Fee paid</div>
                  <div className={`text-xs font-bold ${heading}`}>{feeAmount} USDC</div>
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

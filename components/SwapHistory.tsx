'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWallets } from '@privy-io/react-auth'
import { formatUnits } from 'viem'

const ARCSCAN = 'https://testnet.arcscan.app'

// Token addresses we care about for swap history
const SWAP_TOKENS: Record<string, { symbol: string; decimals: number; icon: string }> = {
  '0x3600000000000000000000000000000000000000': { symbol: 'USDC', decimals: 6, icon: '💵' },
  '0x89b50855aa3be2f677cd6303cec089b5f319d72a': { symbol: 'EURC', decimals: 6, icon: '💶' },
  '0x175cdb1d338945f0d851a741ccf787d343e57952': { symbol: 'USDT', decimals: 18, icon: '💚' },
  '0x911b4000d3422f482f4062a913885f7b035382df': { symbol: 'WUSDC', decimals: 18, icon: '🔵' },
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
  const address = wallets?.[0]?.address

  const [txs, setTxs] = useState<TxItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!address) return
    const fetch_ = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await fetch(`${ARCSCAN}/api/v2/addresses/${address}/transactions`)
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()
        setTxs(data.items || [])
      } catch {
        setError('Failed to load history')
      } finally {
        setLoading(false)
      }
    }
    fetch_()
  }, [address])

  if (!address) return null

  // Filter: only txs involving our swap tokens
  const swapTxs = txs.filter(tx => {
    if (!tx.token_transfers) return false
    return tx.token_transfers.some(t =>
      SWAP_TOKENS[t.token.address_hash.toLowerCase()]
    )
  }).slice(0, 10)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="w-full max-w-md mx-auto mt-4"
    >
      <div className="bg-white border border-blue-100 rounded-2xl shadow-xl shadow-blue-50 p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900">Swap History</h3>
          <span className="text-[10px] text-slate-400 bg-slate-50 px-2 py-1 rounded-full">
            {swapTxs.length} transactions
          </span>
        </div>

        {/* Loading */}
        {loading && (
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="text-xs text-red-500 text-center py-4">{error}</p>
        )}

        {/* Empty */}
        {!loading && !error && swapTxs.length === 0 && (
          <div className="text-center py-8">
            <div className="text-2xl mb-2">📭</div>
            <p className="text-xs text-slate-400">No swap transactions yet</p>
          </div>
        )}

        {/* Tx list */}
        <AnimatePresence>
          {!loading && swapTxs.map((tx, i) => {
            const transfer = tx.token_transfers?.find(t =>
              SWAP_TOKENS[t.token.address_hash.toLowerCase()]
            )
            if (!transfer) return null

            const tokenInfo = SWAP_TOKENS[transfer.token.address_hash.toLowerCase()]
            const isSent = transfer.from.hash.toLowerCase() === address.toLowerCase()
            const decimals = tokenInfo?.decimals ?? parseInt(transfer.total.decimals)
            const amount = parseFloat(formatUnits(BigInt(transfer.total.value), decimals)).toFixed(4)
            const symbol = tokenInfo?.symbol ?? transfer.token.symbol
            const icon = tokenInfo?.icon ?? '🪙'
            const counterparty = isSent ? transfer.to.hash : transfer.from.hash

            return (
              <motion.a
                key={tx.hash}
                href={`${ARCSCAN}/tx/${tx.hash}`}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 transition-colors group mb-1 last:mb-0"
              >
                {/* Direction icon */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                  isSent
                    ? 'bg-red-50 text-red-500'
                    : 'bg-green-50 text-green-500'
                }`}>
                  {isSent ? '↑' : '↓'}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-slate-800">
                      {isSent ? 'Sent' : 'Received'}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {isSent ? 'to' : 'from'} {shortHash(counterparty)}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {timeAgo(tx.timestamp)} · {shortHash(tx.hash)}
                  </div>
                </div>

                {/* Amount */}
                <div className="text-right flex-shrink-0">
                  <div className={`text-xs font-bold ${isSent ? 'text-red-500' : 'text-green-600'}`}>
                    {isSent ? '-' : '+'}{amount}
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-1 justify-end">
                    <span>{icon}</span>
                    <span>{symbol}</span>
                  </div>
                </div>

                {/* Arrow */}
                <span className="text-slate-300 group-hover:text-blue-400 transition-colors text-xs">→</span>
              </motion.a>
            )
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

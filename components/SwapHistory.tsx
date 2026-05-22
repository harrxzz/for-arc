'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWallets } from '@privy-io/react-auth'
import { formatUnits } from 'viem'
import { ArrowRight, ExternalLink, Inbox, Loader2, RefreshCw } from 'lucide-react'
import { useTheme } from '@/components/ThemeProvider'
import { TokenIcon } from '@/components/TokenIcon'

const ARCSCAN = 'https://testnet.arcscan.app'
const XYLO_ROUTER = '0x73742278c31a76dBb0D2587d03ef92E6E2141023'

const TOKEN_MAP: Record<string, { symbol: string; decimals: number }> = {
  '0x3600000000000000000000000000000000000000': { symbol: 'USDC',  decimals: 6  },
  '0x89b50855aa3be2f677cd6303cec089b5f319d72a': { symbol: 'EURC',  decimals: 6  },
  '0x175cdb1d338945f0d851a741ccf787d343e57952': { symbol: 'USDT',  decimals: 18 },
  '0x911b4000d3422f482f4062a913885f7b035382df': { symbol: 'WUSDC', decimals: 18 },
}

function getToken(address: string) {
  return TOKEN_MAP[address.toLowerCase()] ?? { symbol: address.slice(0, 6) + '...', decimals: 18 }
}

interface SwapTx {
  hash: string
  tokenIn: string
  tokenOut: string
  amountIn: string
  amountOut: string
  timestamp: string
  status: string
}

function timeAgo(ts: string) {
  const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

function parseSwapTxs(items: any[]): SwapTx[] {
  const result: SwapTx[] = []
  for (const item of items) {
    // Only include txs to XyloRouter
    const toAddr = item.to?.hash?.toLowerCase() ?? ''
    if (toAddr !== XYLO_ROUTER.toLowerCase()) continue

    const decoded = item.decoded_input
    if (!decoded) continue
    const method = decoded.method_call ?? ''
    const params = decoded.parameters ?? []

    if (method.startsWith('swap(')) {
      const tuple = params[0]?.value
      if (!Array.isArray(tuple) || tuple.length < 4) continue
      const tokenIn = getToken(tuple[0])
      const tokenOut = getToken(tuple[1])
      result.push({
        hash: item.hash,
        tokenIn: tokenIn.symbol,
        tokenOut: tokenOut.symbol,
        amountIn: parseFloat(formatUnits(BigInt(tuple[2]), tokenIn.decimals)).toFixed(4),
        amountOut: parseFloat(formatUnits(BigInt(tuple[3]), tokenOut.decimals)).toFixed(4),
        timestamp: item.timestamp,
        status: item.status,
      })
    }

    if (method.startsWith('swapExactTokensForTokens(')) {
      const amountInRaw = params.find((p: any) => p.name === 'amountIn')?.value ?? '0'
      const amountOutRaw = params.find((p: any) => p.name === 'minAmountOut')?.value ?? '0'
      const path = params.find((p: any) => p.name === 'path')?.value ?? []
      if (path.length < 2) continue
      const tokenIn = getToken(path[0])
      const tokenOut = getToken(path[path.length - 1])
      result.push({
        hash: item.hash,
        tokenIn: tokenIn.symbol,
        tokenOut: tokenOut.symbol,
        amountIn: parseFloat(formatUnits(BigInt(amountInRaw), tokenIn.decimals)).toFixed(4),
        amountOut: parseFloat(formatUnits(BigInt(amountOutRaw), tokenOut.decimals)).toFixed(4),
        timestamp: item.timestamp,
        status: item.status,
      })
    }
  }
  return result
}

export function SwapHistory() {
  const { wallets } = useWallets()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const address = wallets?.[0]?.address

  const [swaps, setSwaps] = useState<SwapTx[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const muted = isDark ? 'text-slate-500' : 'text-slate-400'
  const heading = isDark ? 'text-white' : 'text-slate-900'

  const fetchHistory = useCallback(async () => {
    if (!address) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${ARCSCAN}/api/v2/addresses/${address}/transactions`)
      const data = await res.json()
      const parsed = parseSwapTxs(data.items ?? [])
      setSwaps(parsed)
    } catch {
      setError('Failed to load history')
    } finally {
      setLoading(false)
    }
  }, [address])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  if (!address) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="w-full mt-4"
    >
      <div className={`rounded-3xl overflow-hidden ${isDark ? 'glass-dark' : 'glass-light'}`}>
        {/* Header */}
        <div className={`flex items-center justify-between px-5 py-4 border-b ${isDark ? 'border-white/8' : 'border-white/60'}`}>
          <div className="flex items-center gap-2">
            <h3 className={`text-sm font-bold ${heading}`}>Swap History</h3>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${isDark ? 'bg-white/8 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
              {swaps.length} txs
            </span>
          </div>
          <button
            onClick={fetchHistory}
            aria-label="Refresh swap history"
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-arc-light ${
              isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-white/5 text-slate-500'
            }`}
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} aria-hidden="true" />
          </button>
        </div>

        {/* Content */}
        <div className="divide-y" style={{ borderColor: 'transparent' }}>
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-8">
              <Loader2 size={16} className="text-arc-light animate-spin" aria-hidden="true" />
              <span className={`text-xs ${muted}`}>Loading...</span>
            </div>
          ) : error ? (
            <p className="text-xs text-red-400 text-center py-6">{error}</p>
          ) : swaps.length === 0 ? (
            <div className="text-center py-8">
              <Inbox size={26} className={`mx-auto mb-2 ${muted}`} aria-hidden="true" />
              <p className={`text-xs ${muted}`}>No swap transactions yet</p>
            </div>
          ) : (
            <AnimatePresence>
              {swaps.map((tx, i) => (
                <motion.a
                  key={tx.hash}
                  href={`${ARCSCAN}/tx/${tx.hash}`}
                  target="_blank" rel="noopener noreferrer"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={`flex items-center gap-3 px-5 py-3 transition-colors group ${
                    isDark ? 'hover:bg-white/5' : 'hover:bg-white/5/50'
                  }`}
                  aria-label={`Swap ${tx.amountIn} ${tx.tokenIn} for ${tx.amountOut} ${tx.tokenOut}`}
                >
                  {/* Token icons */}
                  <div className="flex items-center flex-shrink-0">
                    <TokenIcon symbol={tx.tokenIn} size={20} />
                    <ArrowRight size={10} className="text-arc-light mx-1" aria-hidden="true" />
                    <TokenIcon symbol={tx.tokenOut} size={20} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className={`text-xs font-semibold ${heading} flex items-center gap-1`}>
                      <span className="tabular-nums">{tx.amountIn}</span>
                      <span className={`text-[10px] ${muted}`}>{tx.tokenIn}</span>
                      <span className={muted}>→</span>
                      <span className="tabular-nums">{tx.amountOut}</span>
                      <span className={`text-[10px] ${muted}`}>{tx.tokenOut}</span>
                    </div>
                    <div className={`text-[10px] mt-0.5 ${muted}`}>{timeAgo(tx.timestamp)}</div>
                  </div>

                  {/* Status + link */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      tx.status === 'ok'
                        ? 'bg-white/15 text-white'
                        : 'bg-red-500/15 text-red-400'
                    }`}>
                      {tx.status === 'ok' ? 'Success' : 'Failed'}
                    </span>
                    <ExternalLink size={11} className={`${muted} group-hover:text-arc-light transition-colors`} aria-hidden="true" />
                  </div>
                </motion.a>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </motion.div>
  )
}

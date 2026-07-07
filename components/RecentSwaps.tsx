'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RefreshCw, ExternalLink, ArrowRight, Inbox } from 'lucide-react'
import { formatUnits } from 'viem'
import { useTheme } from '@/components/ThemeProvider'
import { TokenIcon } from '@/components/TokenIcon'

const XYLO_ROUTER = '0x73742278c31a76dBb0D2587d03ef92E6E2141023'
const ARCSCAN = 'https://testnet.arcscan.app'

const TOKEN_MAP: Record<string, { symbol: string; decimals: number }> = {
  '0x3600000000000000000000000000000000000000': { symbol: 'USDC',  decimals: 6  },
  '0x89b50855aa3be2f677cd6303cec089b5f319d72a': { symbol: 'EURC',  decimals: 6  },
  '0x175cdb1d338945f0d851a741ccf787d343e57952': { symbol: 'USDT',  decimals: 18 },
  '0x911b4000d3422f482f4062a913885f7b035382df': { symbol: 'WUSDC', decimals: 18 },
}

function getToken(address: string) {
  return TOKEN_MAP[address.toLowerCase()] ?? { symbol: address.slice(0, 6) + '...', decimals: 18 }
}

interface SwapItem {
  hash: string
  from: string
  tokenIn: string
  tokenOut: string
  amountIn: string
  amountOut: string
  timestamp: string
}

function timeAgo(ts: string) {
  const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

function parseSwaps(items: any[]): SwapItem[] {
  const result: SwapItem[] = []
  for (const item of items) {
    if (item.status !== 'ok' && item.result !== 'success') continue
    const decoded = item.decoded_input
    if (!decoded) continue

    const method = decoded.method_call ?? ''
    const params = decoded.parameters ?? []

    // XyloRouter.swap((address tokenIn, address tokenOut, uint256 amountIn, ...))
    if (method.startsWith('swap(')) {
      const tuple = params[0]?.value
      if (!Array.isArray(tuple) || tuple.length < 4) continue
      const tokenIn = getToken(tuple[0])
      const tokenOut = getToken(tuple[1])
      const amountIn = parseFloat(formatUnits(BigInt(tuple[2]), tokenIn.decimals)).toFixed(4)
      const amountOut = parseFloat(formatUnits(BigInt(tuple[3]), tokenOut.decimals)).toFixed(4)
      result.push({
        hash: item.hash,
        from: item.from?.hash ?? '',
        tokenIn: tokenIn.symbol,
        tokenOut: tokenOut.symbol,
        amountIn,
        amountOut,
        timestamp: item.timestamp,
      })
    }

    // swapExactTokensForTokens(uint256 amountIn, uint256 minAmountOut, address[] path, ...)
    if (method.startsWith('swapExactTokensForTokens(')) {
      const amountInRaw = params.find((p: any) => p.name === 'amountIn')?.value ?? '0'
      const amountOutRaw = params.find((p: any) => p.name === 'minAmountOut')?.value ?? '0'
      const path = params.find((p: any) => p.name === 'path')?.value ?? []
      if (path.length < 2) continue
      const tokenIn = getToken(path[0])
      const tokenOut = getToken(path[path.length - 1])
      const amountIn = parseFloat(formatUnits(BigInt(amountInRaw), tokenIn.decimals)).toFixed(4)
      const amountOut = parseFloat(formatUnits(BigInt(amountOutRaw), tokenOut.decimals)).toFixed(4)
      result.push({
        hash: item.hash,
        from: item.from?.hash ?? '',
        tokenIn: tokenIn.symbol,
        tokenOut: tokenOut.symbol,
        amountIn,
        amountOut,
        timestamp: item.timestamp,
      })
    }
  }
  return result
}

export function RecentSwaps() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [swaps, setSwaps] = useState<SwapItem[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const card = isDark ? 'bg-[#0a0a0a] border-white/10' : 'bg-white border-white/8'
  const muted = isDark ? 'text-slate-400' : 'text-slate-500'
  const heading = isDark ? 'text-white' : 'text-slate-900'
  const row = isDark ? 'hover:bg-white/5 border-white/5' : 'hover:bg-white/5/50 border-white/5'

  const fetchSwaps = useCallback(async () => {
    try {
      const res = await fetch(`${ARCSCAN}/api/v2/addresses/${XYLO_ROUTER}/transactions`)
      if (!res.ok) return
      const data = await res.json()
      const parsed = parseSwaps(data.items ?? [])
      setSwaps(parsed.slice(0, 10))
      setLastUpdated(new Date())
    } catch {
      // silent fail
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSwaps()
    const interval = setInterval(fetchSwaps, 15000)
    return () => clearInterval(interval)
  }, [fetchSwaps])

  return (
    <div className={`rounded-3xl overflow-hidden transition-colors ${isDark ? 'glass-dark' : 'glass-light'}`}>
      {/* Header */}
      <div className={`flex items-center justify-between px-5 py-4 border-b ${isDark ? 'border-white/8' : 'border-white/60'}`}>
        <div className="flex items-center gap-2">
          <h3 className={`text-sm font-bold ${heading}`}>Recent Swaps</h3>
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" aria-hidden="true" />
        </div>
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className={`text-[10px] ${muted}`}>
              Updated {timeAgo(lastUpdated.toISOString())}
            </span>
          )}
          <button
            onClick={fetchSwaps}
            aria-label="Refresh recent swaps"
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-arc-violet ${
              isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-white/5 text-slate-500'
            }`}
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* List */}
      <div className={`divide-y ${isDark ? 'divide-white/5' : 'divide-white/5'}`}>
        {loading ? (
          // Skeleton
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-5 py-3.5 animate-pulse">
              <div className={`w-8 h-8 rounded-full ${isDark ? 'bg-white/10' : 'bg-white/5'}`} />
              <div className="flex-1 space-y-1.5">
                <div className={`h-3 w-32 rounded ${isDark ? 'bg-white/10' : 'bg-white/5'}`} />
                <div className={`h-2.5 w-20 rounded ${isDark ? 'bg-white/5' : 'bg-slate-100'}`} />
              </div>
              <div className={`h-3 w-16 rounded ${isDark ? 'bg-white/10' : 'bg-white/5'}`} />
            </div>
          ))
        ) : swaps.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <Inbox size={28} className={muted} aria-hidden="true" />
            <p className={`text-sm ${muted}`}>No recent swaps</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {swaps.map((swap, i) => (
              <motion.a
                key={swap.hash}
                href={`${ARCSCAN}/tx/${swap.hash}`}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className={`flex items-center gap-3 px-4 py-3 transition-colors border-b last:border-0 ${row}`}
                aria-label={`Swap ${swap.amountIn} ${swap.tokenIn} for ${swap.amountOut} ${swap.tokenOut}`}
              >
                {/* Token icons side by side */}
                <div className="flex items-center flex-shrink-0">
                  <TokenIcon symbol={swap.tokenIn} size={20} />
                  <ArrowRight size={10} className="text-arc-violet mx-1" aria-hidden="true" />
                  <TokenIcon symbol={swap.tokenOut} size={20} />
                </div>

                {/* Swap info */}
                <div className="flex-1 min-w-0">
                  <div className={`text-xs font-semibold ${heading} flex items-center gap-1`}>
                    <span className="tabular-nums">{swap.amountIn}</span>
                    <span className={`text-[10px] font-medium ${muted}`}>{swap.tokenIn}</span>
                    <span className={muted}>→</span>
                    <span className="tabular-nums">{swap.amountOut}</span>
                    <span className={`text-[10px] font-medium ${muted}`}>{swap.tokenOut}</span>
                  </div>
                  <div className={`text-[10px] mt-0.5 font-mono truncate ${muted}`}>
                    {swap.from.slice(0, 6)}...{swap.from.slice(-4)}
                  </div>
                </div>

                {/* Time + link */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <span className={`text-[10px] ${muted}`}>{timeAgo(swap.timestamp)}</span>
                  <ExternalLink size={10} className="text-arc-violet" aria-hidden="true" />
                </div>
              </motion.a>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}

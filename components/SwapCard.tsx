'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { createPublicClient, http, formatUnits, parseUnits } from 'viem'
import { ArrowUpDown, ChevronDown, Loader2, CheckCircle, AlertCircle, TrendingDown } from 'lucide-react'
import { arcTestnet, USDC_ADDRESS_ARC, FEE_RECIPIENT, SWAP_FEE_BPS } from '@/config/chains'
import { useTheme } from '@/components/ThemeProvider'
import { TokenIcon } from '@/components/TokenIcon'

const XYLO_ROUTER = '0x73742278c31a76dBb0D2587d03ef92E6E2141023' as const

const ERC20_ABI = [
  { name: 'balanceOf', type: 'function', stateMutability: 'view', inputs: [{ name: 'owner', type: 'address' }], outputs: [{ name: '', type: 'uint256' }] },
  { name: 'allowance', type: 'function', stateMutability: 'view', inputs: [{ name: 'owner', type: 'address' }, { name: 'spender', type: 'address' }], outputs: [{ name: '', type: 'uint256' }] },
  { name: 'approve', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [{ name: '', type: 'bool' }] },
  { name: 'transfer', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'to', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [{ name: '', type: 'bool' }] },
] as const

const XYLO_ROUTER_ABI = [
  {
    name: 'quote', type: 'function', stateMutability: 'view',
    inputs: [{ name: 'tokenIn', type: 'address' }, { name: 'tokenOut', type: 'address' }, { name: 'amountIn', type: 'uint256' }],
    outputs: [{ name: 'amountOut', type: 'uint256' }, { name: 'priceImpact', type: 'uint256' }],
  },
  {
    name: 'swap', type: 'function', stateMutability: 'nonpayable',
    inputs: [{ name: 'params', type: 'tuple', components: [
      { name: 'tokenIn', type: 'address' }, { name: 'tokenOut', type: 'address' },
      { name: 'amountIn', type: 'uint256' }, { name: 'minAmountOut', type: 'uint256' },
      { name: 'to', type: 'address' }, { name: 'deadline', type: 'uint256' },
    ]}],
    outputs: [{ name: 'amountOut', type: 'uint256' }],
  },
] as const

const TOKENS = [
  { symbol: 'USDC',  name: 'USD Coin',     address: USDC_ADDRESS_ARC,                              decimals: 6,  color: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' },
  { symbol: 'EURC',  name: 'Euro Coin',    address: '0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a', decimals: 6,  color: 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400' },
  { symbol: 'USDT',  name: 'Tether USD',   address: '0x175CdB1D338945f0D851A741ccF787D343E57952', decimals: 18, color: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' },
  { symbol: 'WUSDC', name: 'Wrapped USDC', address: '0x911b4000D3422F482F4062a913885f7b035382Df', decimals: 18, color: 'bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-400' },
]

const publicClient = createPublicClient({
  chain: arcTestnet,
  transport: http('https://rpc.testnet.arc.network'),
})

export function SwapCard() {
  const { authenticated, login } = usePrivy()
  const { wallets } = useWallets()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const [fromToken, setFromToken] = useState(TOKENS[0])
  const [toToken, setToToken] = useState(TOKENS[1])
  const [fromAmount, setFromAmount] = useState('')
  const [toAmount, setToAmount] = useState('')
  const [priceImpact, setPriceImpact] = useState<string | null>(null)
  const [balance, setBalance] = useState('0.00')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'idle' | 'approving' | 'swapping' | 'done'>('idle')
  const [txHash, setTxHash] = useState('')
  const [error, setError] = useState('')
  const [showFromSelect, setShowFromSelect] = useState(false)
  const [showToSelect, setShowToSelect] = useState(false)
  const [quoteLoading, setQuoteLoading] = useState(false)

  const activeWallet = wallets?.[0]
  const address = activeWallet?.address as `0x${string}` | undefined

  const card = isDark ? 'bg-[#0f0f1a] border-white/10' : 'bg-white border-blue-100'
  const input = isDark ? 'bg-white/5 border-white/10' : 'bg-blue-50/50 border-blue-100'
  const muted = isDark ? 'text-slate-400' : 'text-slate-400'
  const heading = isDark ? 'text-white' : 'text-slate-900'

  useEffect(() => {
    if (!address) return
    publicClient.readContract({
      address: fromToken.address as `0x${string}`,
      abi: ERC20_ABI, functionName: 'balanceOf', args: [address],
    }).then(bal => setBalance(parseFloat(formatUnits(bal, fromToken.decimals)).toFixed(4)))
      .catch(() => setBalance('0.00'))
  }, [address, fromToken])

  const fetchQuote = useCallback(async (amount: string) => {
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setToAmount(''); setPriceImpact(null); return
    }
    setQuoteLoading(true)
    try {
      const amountIn = parseUnits(amount, fromToken.decimals)
      const [amountOut, impact] = await publicClient.readContract({
        address: XYLO_ROUTER, abi: XYLO_ROUTER_ABI, functionName: 'quote',
        args: [fromToken.address as `0x${string}`, toToken.address as `0x${string}`, amountIn],
      })
      setToAmount(parseFloat(formatUnits(amountOut, toToken.decimals)).toFixed(6))
      setPriceImpact((Number(impact) / 100).toFixed(2))
    } catch {
      const input = parseFloat(amount)
      setToAmount(((input * (10000 - SWAP_FEE_BPS)) / 10000).toFixed(6))
      setPriceImpact(null)
    } finally {
      setQuoteLoading(false)
    }
  }, [fromToken, toToken])

  useEffect(() => {
    const t = setTimeout(() => fetchQuote(fromAmount), 500)
    return () => clearTimeout(t)
  }, [fromAmount, fromToken, toToken, fetchQuote])

  const feeAmount = fromAmount ? ((parseFloat(fromAmount) * SWAP_FEE_BPS) / 10000).toFixed(6) : '0'

  const handleSwapTokens = () => {
    setFromToken(toToken); setToToken(fromToken)
    setFromAmount(toAmount); setToAmount(fromAmount)
  }

  const handleSwap = async () => {
    if (!authenticated) { login(); return }
    if (!address || !fromAmount || parseFloat(fromAmount) <= 0) return
    setLoading(true); setError(''); setTxHash(''); setStep('approving')
    try {
      const walletProvider = await activeWallet?.getEthereumProvider()
      if (!walletProvider) throw new Error('No wallet provider')
      const { createWalletClient, custom } = await import('viem')
      const walletClient = createWalletClient({ chain: arcTestnet, transport: custom(walletProvider) })
      const amountIn = parseUnits(fromAmount, fromToken.decimals)
      const feeAmt = (amountIn * BigInt(SWAP_FEE_BPS)) / BigInt(10000)
      const swapAmountIn = amountIn - feeAmt

      await walletClient.writeContract({
        address: fromToken.address as `0x${string}`, abi: ERC20_ABI,
        functionName: 'transfer', args: [FEE_RECIPIENT as `0x${string}`, feeAmt], account: address,
      })

      const allowance = await publicClient.readContract({
        address: fromToken.address as `0x${string}`, abi: ERC20_ABI,
        functionName: 'allowance', args: [address, XYLO_ROUTER],
      })
      if (allowance < swapAmountIn) {
        await walletClient.writeContract({
          address: fromToken.address as `0x${string}`, abi: ERC20_ABI,
          functionName: 'approve', args: [XYLO_ROUTER, swapAmountIn], account: address,
        })
      }

      setStep('swapping')
      const minAmountOut = toAmount
        ? (parseUnits(toAmount, toToken.decimals) * BigInt(995)) / BigInt(1000)
        : BigInt(0)
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 300)

      const hash = await walletClient.writeContract({
        address: XYLO_ROUTER, abi: XYLO_ROUTER_ABI, functionName: 'swap',
        args: [{
          tokenIn: fromToken.address as `0x${string}`,
          tokenOut: toToken.address as `0x${string}`,
          amountIn: swapAmountIn, minAmountOut, to: address, deadline,
        }],
        account: address,
      })
      setTxHash(hash); setStep('done'); setFromAmount(''); setToAmount('')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Transaction failed')
      setStep('idle')
    } finally {
      setLoading(false)
    }
  }

  const stepLabels = { idle: null, approving: 'Collecting fee...', swapping: 'Executing swap...', done: 'Swap complete!' }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-md mx-auto">
      <div className={`border rounded-2xl shadow-xl p-6 transition-colors ${card} ${isDark ? 'shadow-blue-500/5' : 'shadow-blue-50'}`}>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-lg font-bold ${heading}`}>Swap</h2>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${isDark ? 'bg-white/10 text-slate-300' : 'bg-blue-50 text-blue-600'}`}>Fee: 0.3%</span>
            <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-green-500/10 text-green-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
              XyloNet
            </span>
          </div>
        </div>

        {/* From */}
        <div className={`border rounded-xl p-4 mb-2 transition-colors ${input}`}>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="from-amount" className={`text-xs ${muted}`}>You pay</label>
            {address && (
              <button
                onClick={() => setFromAmount(balance)}
                className="text-xs text-blue-500 hover:text-blue-400 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
                aria-label={`Set max amount: ${balance} ${fromToken.symbol}`}
              >
                Balance: {balance}
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <input
              id="from-amount"
              type="number"
              placeholder="0.00"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              aria-label={`Amount of ${fromToken.symbol} to swap`}
              aria-describedby="swap-fee-info"
              autoComplete="off"
              className={`flex-1 bg-transparent text-2xl font-bold outline-none placeholder:text-slate-300 font-variant-numeric tabular-nums ${heading}`}
            />
            <div className="relative">
              <button
                onClick={() => setShowFromSelect(!showFromSelect)}
                aria-label={`Select token to swap from, currently ${fromToken.symbol}`}
                aria-expanded={showFromSelect}
                aria-haspopup="listbox"
                className={`flex items-center gap-2 px-3 py-2 rounded-xl font-medium text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  isDark ? 'bg-white/10 hover:bg-white/15 text-white' : fromToken.color
                }`}
              >
                <TokenIcon symbol={fromToken.symbol} size={18} />
                <span>{fromToken.symbol}</span>
                <ChevronDown size={14} />
              </button>
              <AnimatePresence>
                {showFromSelect && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                    className={`absolute right-0 top-full mt-1 border rounded-xl shadow-lg z-20 min-w-[180px] ${
                      isDark ? 'bg-[#1a1a2e] border-white/10' : 'bg-white border-blue-100'
                    }`}
                  >
                    {TOKENS.filter(t => t.symbol !== toToken.symbol).map(token => (
                      <button key={token.symbol} onClick={() => { setFromToken(token); setShowFromSelect(false) }}
                        className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm first:rounded-t-xl last:rounded-b-xl transition-colors ${
                          isDark ? 'text-slate-300 hover:bg-white/10' : 'text-slate-700 hover:bg-blue-50'
                        }`}
                      >
                        <TokenIcon symbol={token.symbol} size={20} />
                        <div className="flex flex-col items-start">
                          <span className="font-medium text-xs">{token.symbol}</span>
                          <span className="text-[10px] text-slate-400">{token.name}</span>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Swap arrow */}
        <div className="flex justify-center my-1">
          <motion.button
            onClick={handleSwapTokens}
            className={`w-9 h-9 border-2 rounded-xl flex items-center justify-center transition-all ${
              isDark ? 'bg-[#0f0f1a] border-white/10 hover:border-white/30 text-blue-400' : 'bg-white border-blue-100 hover:border-blue-300 hover:bg-blue-50 text-blue-600'
            }`}
            whileHover={{ scale: 1.1, rotate: 180 }} whileTap={{ scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            <ArrowUpDown size={16} />
          </motion.button>
        </div>

        {/* To */}
        <div className={`border rounded-xl p-4 mb-4 transition-colors ${input}`}>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="to-amount" className={`text-xs ${muted}`}>You receive</label>
            {quoteLoading && <span className={`text-[10px] animate-pulse ${muted}`} aria-live="polite">Fetching quote...</span>}
          </div>
          <div className="flex items-center gap-3">
            <input
              id="to-amount"
              type="number"
              placeholder="0.00"
              value={toAmount}
              readOnly
              aria-label={`Amount of ${toToken.symbol} you will receive`}
              aria-live="polite"
              className={`flex-1 bg-transparent text-2xl font-bold outline-none placeholder:text-slate-300 tabular-nums ${heading}`}
            />
            <div className="relative">
              <button
                onClick={() => setShowToSelect(!showToSelect)}
                aria-label={`Select token to receive, currently ${toToken.symbol}`}
                aria-expanded={showToSelect}
                aria-haspopup="listbox"
                className={`flex items-center gap-2 px-3 py-2 rounded-xl font-medium text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  isDark ? 'bg-white/10 hover:bg-white/15 text-white' : toToken.color
                }`}
              >
                <TokenIcon symbol={toToken.symbol} size={18} />
                <span>{toToken.symbol}</span>
                <ChevronDown size={14} />
              </button>
              <AnimatePresence>
                {showToSelect && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                    className={`absolute right-0 top-full mt-1 border rounded-xl shadow-lg z-20 min-w-[180px] ${
                      isDark ? 'bg-[#1a1a2e] border-white/10' : 'bg-white border-blue-100'
                    }`}
                  >
                    {TOKENS.filter(t => t.symbol !== fromToken.symbol).map(token => (
                      <button key={token.symbol} onClick={() => { setToToken(token); setShowToSelect(false) }}
                        className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm first:rounded-t-xl last:rounded-b-xl transition-colors ${
                          isDark ? 'text-slate-300 hover:bg-white/10' : 'text-slate-700 hover:bg-blue-50'
                        }`}
                      >
                        <TokenIcon symbol={token.symbol} size={20} />
                        <div className="flex flex-col items-start">
                          <span className="font-medium text-xs">{token.symbol}</span>
                          <span className="text-[10px] text-slate-400">{token.name}</span>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Quote details */}
        {fromAmount && parseFloat(fromAmount) > 0 && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            id="swap-fee-info"
            className={`rounded-xl p-3 mb-4 space-y-1.5 text-xs ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}
          >
            <div className={`flex justify-between ${muted}`}>
              <span>Protocol fee (0.3%)</span>
              <span>{feeAmount} {fromToken.symbol}</span>
            </div>
            {priceImpact !== null && (
              <div className={`flex justify-between items-center ${muted}`}>
                <span className="flex items-center gap-1"><TrendingDown size={11} /> Price impact</span>
                <span className={parseFloat(priceImpact) > 1 ? 'text-orange-500' : 'text-green-500'}>{priceImpact}%</span>
              </div>
            )}
            <div className={`flex justify-between ${muted}`}>
              <span>Slippage tolerance</span><span>0.5%</span>
            </div>
            <div className={`border-t pt-1.5 flex justify-between font-medium ${isDark ? 'border-white/10 text-slate-200' : 'border-slate-200 text-slate-700'}`}>
              <span>You receive</span>
              <span>{toAmount} {toToken.symbol}</span>
            </div>
          </motion.div>
        )}

        {/* Step indicator */}
        {loading && stepLabels[step] && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className={`flex items-center gap-2 border rounded-xl p-3 mb-4 ${isDark ? 'bg-blue-500/10 border-blue-500/20' : 'bg-blue-50 border-blue-200'}`}
          >
            <Loader2 size={14} className="text-blue-500 animate-spin" />
            <span className="text-xs text-blue-500 font-medium">{stepLabels[step]}</span>
          </motion.div>
        )}

        {/* Error */}
        {error && (
          <div
            role="alert"
            aria-live="polite"
            className={`flex items-start gap-2 border rounded-xl p-3 mb-4 text-xs ${isDark ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-red-50 border-red-200 text-red-600'}`}
          >
            <AlertCircle size={14} className="mt-0.5 flex-shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        {/* Success */}
        {txHash && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className={`border rounded-xl p-3 mb-4 ${isDark ? 'bg-green-500/10 border-green-500/20' : 'bg-green-50 border-green-200'}`}
          >
            <p className={`text-xs font-medium mb-1 flex items-center gap-1.5 ${isDark ? 'text-green-400' : 'text-green-700'}`}>
              <CheckCircle size={13} /> Swap successful!
            </p>
            <a href={`https://testnet.arcscan.app/tx/${txHash}`} target="_blank" rel="noopener noreferrer"
              className={`text-xs underline break-all ${isDark ? 'text-green-400' : 'text-green-600'}`}
            >
              View on ArcScan →
            </a>
          </motion.div>
        )}

        {/* Button */}
        <motion.button
          onClick={handleSwap}
          disabled={loading || (!fromAmount && authenticated)}
          className={`w-full py-4 rounded-xl font-semibold text-sm transition-all ${
            !authenticated ? 'bg-blue-700 hover:bg-blue-800 text-white'
            : !fromAmount ? isDark ? 'bg-white/10 text-slate-500 cursor-not-allowed' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            : 'bg-blue-700 hover:bg-blue-800 text-white'
          }`}
          whileHover={authenticated && fromAmount ? { scale: 1.01 } : {}}
          whileTap={authenticated && fromAmount ? { scale: 0.99 } : {}}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 size={16} className="animate-spin" />
              {stepLabels[step] ?? 'Processing...'}
            </span>
          ) : !authenticated ? 'Connect Wallet to Swap'
            : !fromAmount ? 'Enter an amount'
            : `Swap ${fromToken.symbol} → ${toToken.symbol}`}
        </motion.button>
      </div>
    </motion.div>
  )
}

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
  { symbol: 'USDC',  name: 'USD Coin',  address: USDC_ADDRESS_ARC,                              decimals: 6 },
  { symbol: 'EURC',  name: 'Euro Coin', address: '0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a', decimals: 6 },
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

  const glassCard = isDark ? 'glass-dark' : 'glass-light'
  const glassInput = isDark ? 'glass-input-dark' : 'glass-input-light'
  const muted = isDark ? 'text-slate-400' : 'text-slate-500'
  const heading = isDark ? 'text-white' : 'text-slate-900'
  const dropdownBg = isDark ? 'glass-dark' : 'glass-light'

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

  const TokenDropdown = ({
    selected, other, show, onToggle, onSelect, inputId
  }: {
    selected: typeof TOKENS[0], other: typeof TOKENS[0],
    show: boolean, onToggle: () => void,
    onSelect: (t: typeof TOKENS[0]) => void, inputId: string
  }) => (
    <div className="relative flex-shrink-0">
      <button
        onClick={onToggle}
        aria-label={`Select token, currently ${selected.symbol}`}
        aria-expanded={show}
        aria-haspopup="listbox"
        className={`flex items-center gap-2 px-3 py-2 rounded-xl font-semibold text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-arc-violet ${
          isDark
            ? 'bg-white/8 hover:bg-white/12 text-white border border-white/10'
            : 'bg-white/80 hover:bg-white text-slate-800 border border-white/90 shadow-sm'
        }`}
      >
        <TokenIcon symbol={selected.symbol} size={20} />
        <span>{selected.symbol}</span>
        <ChevronDown size={13} className={muted} />
      </button>
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className={`absolute left-0 top-full mt-2 rounded-2xl shadow-2xl z-30 min-w-[200px] overflow-hidden ${dropdownBg}`}
          >
            {TOKENS.filter(t => t.symbol !== other.symbol).map(token => (
              <button key={token.symbol}
                onClick={() => { onSelect(token); onToggle() }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                  isDark ? 'hover:bg-white/8 text-slate-200' : 'hover:bg-white/5/80 text-slate-700'
                } ${selected.symbol === token.symbol ? isDark ? 'bg-white/8 text-arc-violet' : 'bg-white/5 text-arc-violet' : ''}`}
              >
                <TokenIcon symbol={token.symbol} size={22} />
                <div className="flex flex-col items-start">
                  <span className="font-semibold text-xs">{token.symbol}</span>
                  <span className="text-[10px] text-slate-400">{token.name}</span>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full mx-auto"
    >
      <div className={`rounded-3xl p-5 ${glassCard} hover-glow`}>

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className={`text-base font-bold ${heading}`}>Swap</h2>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
              isDark ? 'bg-white/8 text-slate-300 border border-white/10' : 'bg-white/5 text-arc-violet border border-white/8'
            }`}>0.3% fee</span>
            <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-white/15 text-white border border-white/20 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-white inline-block animate-pulse" aria-hidden="true" />
              XyloNet
            </span>
          </div>
        </div>

        {/* From */}
        <div className={`rounded-2xl p-4 mb-2 ${glassInput}`}>
          <div className="flex items-center justify-between mb-3">
            <label htmlFor="from-amount" className={`text-xs font-medium ${muted}`}>You pay</label>
            {address && (
              <button
                onClick={() => setFromAmount(balance)}
                className="text-xs text-arc-violet hover:text-arc-violet font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-arc-violet rounded"
                aria-label={`Set max: ${balance} ${fromToken.symbol}`}
              >
                Balance: {balance}
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <TokenDropdown
              selected={fromToken} other={toToken}
              show={showFromSelect} onToggle={() => setShowFromSelect(v => !v)}
              onSelect={setFromToken} inputId="from-amount"
            />
            <input
              id="from-amount"
              type="number" placeholder="0.00" value={fromAmount}
              onChange={e => setFromAmount(e.target.value)}
              aria-label={`Amount of ${fromToken.symbol} to swap`}
              aria-describedby="swap-fee-info"
              autoComplete="off"
              className={`flex-1 bg-transparent text-2xl font-bold outline-none text-right tabular-nums placeholder:text-slate-600 ${heading}`}
            />
          </div>
        </div>

        {/* Swap arrow */}
        <div className="flex justify-center my-2 relative z-10">
          <motion.button
            onClick={handleSwapTokens}
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400 }}
            aria-label="Swap token direction"
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-arc-violet ${
              isDark
                ? 'bg-white/8 border border-white/10 hover:bg-white/15 text-arc-violet'
                : 'bg-white/90 border border-white/90 shadow-sm hover:bg-white text-arc-violet'
            }`}
          >
            <ArrowUpDown size={15} aria-hidden="true" />
          </motion.button>
        </div>

        {/* To */}
        <div className={`rounded-2xl p-4 mb-4 ${glassInput}`}>
          <div className="flex items-center justify-between mb-3">
            <label htmlFor="to-amount" className={`text-xs font-medium ${muted}`}>You receive</label>
            {quoteLoading && (
              <span className={`text-[10px] animate-pulse ${muted}`} aria-live="polite">
                Fetching quote...
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <TokenDropdown
              selected={toToken} other={fromToken}
              show={showToSelect} onToggle={() => setShowToSelect(v => !v)}
              onSelect={setToToken} inputId="to-amount"
            />
            <input
              id="to-amount"
              type="number" placeholder="0.00" value={toAmount} readOnly
              aria-label={`Amount of ${toToken.symbol} you will receive`}
              aria-live="polite"
              className={`flex-1 bg-transparent text-2xl font-bold outline-none text-right tabular-nums placeholder:text-slate-600 ${heading}`}
            />
          </div>
        </div>

        {/* Quote details */}
        {fromAmount && parseFloat(fromAmount) > 0 && (
          <motion.div
            id="swap-fee-info"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className={`rounded-2xl p-3.5 mb-4 space-y-2 text-xs ${
              isDark ? 'bg-white/4 border border-white/6' : 'bg-white/5/60 border border-white/8/80'
            }`}
          >
            <div className={`flex justify-between ${muted}`}>
              <span>Protocol fee (0.3%)</span>
              <span>{feeAmount} {fromToken.symbol}</span>
            </div>
            {priceImpact !== null && (
              <div className={`flex justify-between items-center ${muted}`}>
                <span className="flex items-center gap-1">
                  <TrendingDown size={11} aria-hidden="true" /> Price impact
                </span>
                <span className={parseFloat(priceImpact) > 1 ? 'text-arc-violet' : 'text-white'}>
                  {priceImpact}%
                </span>
              </div>
            )}
            <div className={`flex justify-between ${muted}`}>
              <span>Slippage tolerance</span><span>0.5%</span>
            </div>
            <div className={`border-t pt-2 flex justify-between font-semibold ${
              isDark ? 'border-white/8 text-slate-200' : 'border-arc-violet/60 text-slate-700'
            }`}>
              <span>You receive</span>
              <span>{toAmount} {toToken.symbol}</span>
            </div>
          </motion.div>
        )}

        {/* Step indicator */}
        {loading && stepLabels[step] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
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
              <CheckCircle size={13} aria-hidden="true" /> Swap successful!
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
          onClick={handleSwap}
          disabled={loading || (!fromAmount && authenticated)}
          whileHover={authenticated && fromAmount ? { scale: 1.01 } : {}}
          whileTap={authenticated && fromAmount ? { scale: 0.99 } : {}}
          className={`w-full py-3.5 rounded-2xl font-semibold text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-arc-violet focus-visible:ring-offset-2 ${
            !authenticated
              ? 'glass-btn-primary text-white'
              : !fromAmount
              ? isDark ? 'bg-white/6 text-slate-500 cursor-not-allowed border border-white/8' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'glass-btn-primary text-white'
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 size={16} className="animate-spin" aria-hidden="true" />
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

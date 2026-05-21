'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { createPublicClient, http, formatUnits, parseUnits } from 'viem'
import { arcTestnet, USDC_ADDRESS_ARC, FEE_RECIPIENT, SWAP_FEE_BPS } from '@/config/chains'

const XYLO_ROUTER = '0x73742278c31a76dBb0D2587d03ef92E6E2141023' as const

const ERC20_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'owner', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'allowance',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'owner', type: 'address' }, { name: 'spender', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'transfer',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'to', type: 'address' }, { name: 'amount', type: 'uint256' }],
    outputs: [{ name: '', type: 'bool' }],
  },
] as const

const XYLO_ROUTER_ABI = [
  {
    name: 'quote',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'tokenIn', type: 'address' },
      { name: 'tokenOut', type: 'address' },
      { name: 'amountIn', type: 'uint256' },
    ],
    outputs: [
      { name: 'amountOut', type: 'uint256' },
      { name: 'priceImpact', type: 'uint256' },
    ],
  },
  {
    name: 'swap',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      {
        name: 'params',
        type: 'tuple',
        components: [
          { name: 'tokenIn', type: 'address' },
          { name: 'tokenOut', type: 'address' },
          { name: 'amountIn', type: 'uint256' },
          { name: 'minAmountOut', type: 'uint256' },
          { name: 'to', type: 'address' },
          { name: 'deadline', type: 'uint256' },
        ],
      },
    ],
    outputs: [{ name: 'amountOut', type: 'uint256' }],
  },
] as const

const TOKENS = [
  { symbol: 'USDC', name: 'USD Coin', address: USDC_ADDRESS_ARC, decimals: 6, icon: '💵', color: 'bg-blue-100 text-blue-700' },
  { symbol: 'EURC', name: 'Euro Coin', address: '0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a', decimals: 6, icon: '💶', color: 'bg-purple-100 text-purple-700' },
  { symbol: 'USDT', name: 'Tether USD', address: '0x175CdB1D338945f0D851A741ccF787D343E57952', decimals: 18, icon: '💚', color: 'bg-green-100 text-green-700' },
  { symbol: 'WUSDC', name: 'Wrapped USDC', address: '0x911b4000D3422F482F4062a913885f7b035382Df', decimals: 18, icon: '🔵', color: 'bg-sky-100 text-sky-700' },
]

const publicClient = createPublicClient({
  chain: arcTestnet,
  transport: http('https://rpc.testnet.arc.network'),
})

export function SwapCard() {
  const { authenticated, login } = usePrivy()
  const { wallets } = useWallets()

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

  // Fetch balance
  useEffect(() => {
    if (!address) return
    const fetchBalance = async () => {
      try {
        const bal = await publicClient.readContract({
          address: fromToken.address as `0x${string}`,
          abi: ERC20_ABI,
          functionName: 'balanceOf',
          args: [address],
        })
        setBalance(parseFloat(formatUnits(bal, fromToken.decimals)).toFixed(4))
      } catch {
        setBalance('0.00')
      }
    }
    fetchBalance()
  }, [address, fromToken])

  // Get real quote from XyloRouter
  const fetchQuote = useCallback(async (amount: string) => {
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setToAmount('')
      setPriceImpact(null)
      return
    }
    setQuoteLoading(true)
    try {
      const amountIn = parseUnits(amount, fromToken.decimals)
      const [amountOut, impact] = await publicClient.readContract({
        address: XYLO_ROUTER,
        abi: XYLO_ROUTER_ABI,
        functionName: 'quote',
        args: [
          fromToken.address as `0x${string}`,
          toToken.address as `0x${string}`,
          amountIn,
        ],
      })
      setToAmount(parseFloat(formatUnits(amountOut, toToken.decimals)).toFixed(6))
      // priceImpact is in basis points (e.g. 30 = 0.30%)
      setPriceImpact((Number(impact) / 100).toFixed(2))
    } catch {
      // Fallback: no pool exists, show estimated with fee
      const input = parseFloat(amount)
      const fee = (input * SWAP_FEE_BPS) / 10000
      setToAmount((input - fee).toFixed(6))
      setPriceImpact(null)
    } finally {
      setQuoteLoading(false)
    }
  }, [fromToken, toToken])

  // Debounce quote fetch
  useEffect(() => {
    const timer = setTimeout(() => fetchQuote(fromAmount), 500)
    return () => clearTimeout(timer)
  }, [fromAmount, fromToken, toToken, fetchQuote])

  const feeAmount = fromAmount
    ? ((parseFloat(fromAmount) * SWAP_FEE_BPS) / 10000).toFixed(6)
    : '0'

  const handleSwapTokens = () => {
    setFromToken(toToken)
    setToToken(fromToken)
    setFromAmount(toAmount)
    setToAmount(fromAmount)
  }

  const handleSwap = async () => {
    if (!authenticated) { login(); return }
    if (!address || !fromAmount || parseFloat(fromAmount) <= 0) return

    setLoading(true)
    setError('')
    setTxHash('')
    setStep('approving')

    try {
      const walletProvider = await activeWallet?.getEthereumProvider()
      if (!walletProvider) throw new Error('No wallet provider')

      const { createWalletClient, custom } = await import('viem')
      const walletClient = createWalletClient({
        chain: arcTestnet,
        transport: custom(walletProvider),
      })

      const amountIn = parseUnits(fromAmount, fromToken.decimals)
      const feeAmt = (amountIn * BigInt(SWAP_FEE_BPS)) / BigInt(10000)
      const swapAmountIn = amountIn - feeAmt

      // Step 1: Collect protocol fee
      await walletClient.writeContract({
        address: fromToken.address as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'transfer',
        args: [FEE_RECIPIENT as `0x${string}`, feeAmt],
        account: address,
      })

      // Step 2: Approve XyloRouter
      const allowance = await publicClient.readContract({
        address: fromToken.address as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'allowance',
        args: [address, XYLO_ROUTER],
      })

      if (allowance < swapAmountIn) {
        await walletClient.writeContract({
          address: fromToken.address as `0x${string}`,
          abi: ERC20_ABI,
          functionName: 'approve',
          args: [XYLO_ROUTER, swapAmountIn],
          account: address,
        })
      }

      setStep('swapping')

      // Step 3: Execute swap via XyloRouter
      const minAmountOut = toAmount
        ? (parseUnits(toAmount, toToken.decimals) * BigInt(995)) / BigInt(1000) // 0.5% slippage
        : BigInt(0)

      const deadline = BigInt(Math.floor(Date.now() / 1000) + 300) // 5 min

      const hash = await walletClient.writeContract({
        address: XYLO_ROUTER,
        abi: XYLO_ROUTER_ABI,
        functionName: 'swap',
        args: [{
          tokenIn: fromToken.address as `0x${string}`,
          tokenOut: toToken.address as `0x${string}`,
          amountIn: swapAmountIn,
          minAmountOut,
          to: address,
          deadline,
        }],
        account: address,
      })

      setTxHash(hash)
      setStep('done')
      setFromAmount('')
      setToAmount('')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Transaction failed')
      setStep('idle')
    } finally {
      setLoading(false)
    }
  }

  const stepLabels = {
    idle: null,
    approving: 'Collecting fee...',
    swapping: 'Executing swap...',
    done: 'Swap complete!',
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
          <h2 className="text-lg font-bold text-slate-900">Swap</h2>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 rounded-full">
              <span className="text-xs text-blue-600 font-medium">Fee: 0.3%</span>
            </div>
            <div className="flex items-center gap-1 px-2.5 py-1 bg-green-50 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <span className="text-xs text-green-600 font-medium">XyloNet</span>
            </div>
          </div>
        </div>

        {/* From token */}
        <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 mb-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400">You pay</span>
            {address && (
              <button
                onClick={() => setFromAmount(balance)}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                Balance: {balance}
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <input
              type="number"
              placeholder="0.00"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              className="flex-1 bg-transparent text-2xl font-bold text-slate-900 outline-none placeholder:text-slate-300"
            />
            <div className="relative">
              <button
                onClick={() => setShowFromSelect(!showFromSelect)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl font-medium text-sm ${fromToken.color} hover:opacity-80 transition-opacity`}
              >
                <span>{fromToken.icon}</span>
                <span>{fromToken.symbol}</span>
                <span className="text-xs">▾</span>
              </button>
              <AnimatePresence>
                {showFromSelect && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute right-0 top-full mt-1 bg-white border border-blue-100 rounded-xl shadow-lg z-20 min-w-[180px]"
                  >
                    {TOKENS.filter(t => t.symbol !== toToken.symbol).map(token => (
                      <button
                        key={token.symbol}
                        onClick={() => { setFromToken(token); setShowFromSelect(false) }}
                        className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-blue-50 text-sm text-slate-700 first:rounded-t-xl last:rounded-b-xl"
                      >
                        <span>{token.icon}</span>
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
            className="w-9 h-9 bg-white border-2 border-blue-100 rounded-xl flex items-center justify-center text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-all"
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            ↕
          </motion.button>
        </div>

        {/* To token */}
        <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400">You receive</span>
            {quoteLoading && (
              <span className="text-[10px] text-slate-400 animate-pulse">Fetching quote...</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <input
              type="number"
              placeholder="0.00"
              value={toAmount}
              readOnly
              className="flex-1 bg-transparent text-2xl font-bold text-slate-900 outline-none placeholder:text-slate-300"
            />
            <div className="relative">
              <button
                onClick={() => setShowToSelect(!showToSelect)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl font-medium text-sm ${toToken.color} hover:opacity-80 transition-opacity`}
              >
                <span>{toToken.icon}</span>
                <span>{toToken.symbol}</span>
                <span className="text-xs">▾</span>
              </button>
              <AnimatePresence>
                {showToSelect && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute right-0 top-full mt-1 bg-white border border-blue-100 rounded-xl shadow-lg z-20 min-w-[180px]"
                  >
                    {TOKENS.filter(t => t.symbol !== fromToken.symbol).map(token => (
                      <button
                        key={token.symbol}
                        onClick={() => { setToToken(token); setShowToSelect(false) }}
                        className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-blue-50 text-sm text-slate-700 first:rounded-t-xl last:rounded-b-xl"
                      >
                        <span>{token.icon}</span>
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
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-slate-50 rounded-xl p-3 mb-4 space-y-1.5"
          >
            <div className="flex justify-between text-xs text-slate-500">
              <span>Protocol fee (0.3%)</span>
              <span>{feeAmount} {fromToken.symbol}</span>
            </div>
            {priceImpact !== null && (
              <div className="flex justify-between text-xs text-slate-500">
                <span>Price impact</span>
                <span className={parseFloat(priceImpact) > 1 ? 'text-orange-500' : 'text-green-600'}>
                  {priceImpact}%
                </span>
              </div>
            )}
            <div className="flex justify-between text-xs text-slate-500">
              <span>Slippage tolerance</span>
              <span>0.5%</span>
            </div>
            <div className="border-t border-slate-200 pt-1.5 flex justify-between text-xs font-medium text-slate-700">
              <span>You receive</span>
              <span>{toAmount} {toToken.symbol}</span>
            </div>
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Powered by</span>
              <span>XyloNet DEX</span>
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
            <p className="text-xs text-green-700 font-medium mb-1">✅ Swap successful!</p>
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

        {/* Swap button */}
        <motion.button
          onClick={handleSwap}
          disabled={loading || (!fromAmount && authenticated)}
          className={`w-full py-4 rounded-xl font-semibold text-sm transition-all ${
            !authenticated
              ? 'bg-blue-700 hover:bg-blue-800 text-white'
              : !fromAmount
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-blue-700 hover:bg-blue-800 text-white'
          }`}
          whileHover={authenticated && fromAmount ? { scale: 1.01 } : {}}
          whileTap={authenticated && fromAmount ? { scale: 0.99 } : {}}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
              />
              {stepLabels[step] ?? 'Processing...'}
            </span>
          ) : !authenticated ? (
            'Connect Wallet to Swap'
          ) : !fromAmount ? (
            'Enter an amount'
          ) : (
            `Swap ${fromToken.symbol} → ${toToken.symbol}`
          )}
        </motion.button>
      </div>
    </motion.div>
  )
}

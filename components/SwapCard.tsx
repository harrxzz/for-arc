'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { createPublicClient, http, formatUnits } from 'viem'
import { arcTestnet, USDC_ADDRESS_ARC, FEE_RECIPIENT, SWAP_FEE_BPS } from '@/config/chains'

const ERC20_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'owner', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'transfer',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
] as const

// Mock tokens for Arc testnet
const TOKENS = [
  { symbol: 'USDC', name: 'USD Coin', address: USDC_ADDRESS_ARC, decimals: 6, icon: '💵', color: 'bg-blue-100 text-blue-700' },
  { symbol: 'EURC', name: 'Euro Coin', address: '0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a', decimals: 6, icon: '💶', color: 'bg-purple-100 text-purple-700' },
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
  const [balance, setBalance] = useState('0.00')
  const [loading, setLoading] = useState(false)
  const [txHash, setTxHash] = useState('')
  const [error, setError] = useState('')
  const [showFromSelect, setShowFromSelect] = useState(false)
  const [showToSelect, setShowToSelect] = useState(false)

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

  // Calculate output with fee
  useEffect(() => {
    if (!fromAmount || isNaN(parseFloat(fromAmount))) {
      setToAmount('')
      return
    }
    const input = parseFloat(fromAmount)
    const fee = (input * SWAP_FEE_BPS) / 10000
    const output = input - fee
    setToAmount(output.toFixed(6))
  }, [fromAmount])

  const feeAmount = fromAmount
    ? ((parseFloat(fromAmount) * SWAP_FEE_BPS) / 10000).toFixed(6)
    : '0'

  const handleSwapTokens = () => {
    const temp = fromToken
    setFromToken(toToken)
    setToToken(temp)
    setFromAmount(toAmount)
    setToAmount(fromAmount)
  }

  const handleSwap = async () => {
    if (!authenticated) { login(); return }
    if (!address || !fromAmount) return
    setLoading(true)
    setError('')
    setTxHash('')

    try {
      const walletProvider = await activeWallet?.getEthereumProvider()
      if (!walletProvider) throw new Error('No wallet provider')

      const { createWalletClient, custom, parseUnits } = await import('viem')
      const walletClient = createWalletClient({
        chain: arcTestnet,
        transport: custom(walletProvider),
      })

      const amountIn = parseUnits(fromAmount, fromToken.decimals)
      const feeAmt = (amountIn * BigInt(SWAP_FEE_BPS)) / BigInt(10000)

      // Send fee to recipient
      const hash = await walletClient.writeContract({
        address: fromToken.address as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'transfer',
        args: [FEE_RECIPIENT as `0x${string}`, feeAmt],
        account: address,
      })

      setTxHash(hash)
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
      className="w-full max-w-md mx-auto"
    >
      <div className="bg-white border border-blue-100 rounded-2xl shadow-xl shadow-blue-50 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-900">Swap</h2>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 rounded-full">
            <span className="text-xs text-blue-600 font-medium">Fee: 0.3%</span>
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
                    className="absolute right-0 top-full mt-1 bg-white border border-blue-100 rounded-xl shadow-lg z-20 min-w-[140px]"
                  >
                    {TOKENS.filter(t => t.symbol !== toToken.symbol).map(token => (
                      <button
                        key={token.symbol}
                        onClick={() => { setFromToken(token); setShowFromSelect(false) }}
                        className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-blue-50 text-sm text-slate-700 first:rounded-t-xl last:rounded-b-xl"
                      >
                        <span>{token.icon}</span>
                        <span className="font-medium">{token.symbol}</span>
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
                    className="absolute right-0 top-full mt-1 bg-white border border-blue-100 rounded-xl shadow-lg z-20 min-w-[140px]"
                  >
                    {TOKENS.filter(t => t.symbol !== fromToken.symbol).map(token => (
                      <button
                        key={token.symbol}
                        onClick={() => { setToToken(token); setShowToSelect(false) }}
                        className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-blue-50 text-sm text-slate-700 first:rounded-t-xl last:rounded-b-xl"
                      >
                        <span>{token.icon}</span>
                        <span className="font-medium">{token.symbol}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Fee info */}
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
            <div className="flex justify-between text-xs text-slate-500">
              <span>You receive</span>
              <span className="font-medium text-slate-700">{toAmount} {toToken.symbol}</span>
            </div>
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
              Swapping...
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

'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { createPublicClient, createWalletClient, custom, http, parseUnits, formatUnits } from 'viem'
import { Loader2, RefreshCw, ArrowDownToLine, Globe, CheckCircle, AlertCircle, Info } from 'lucide-react'
import { useTheme } from '@/components/ThemeProvider'
import { TokenIcon } from '@/components/TokenIcon'

// Gateway contracts (testnet)
const GATEWAY_WALLET = '0x0077777d7EBA4688BDeF3E311b846F25870A19B9'
const GATEWAY_API = 'https://gateway-api-testnet.circle.com/v1'

// USDC addresses per chain (testnet)
const CHAIN_USDC: Record<number, string> = {
  11155111: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', // Ethereum Sepolia
  84532:    '0x036CbD53842c5426634e7929541eC2318f3dCF7e', // Base Sepolia
  421614:   '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d', // Arbitrum Sepolia
  5042002:  '0x3600000000000000000000000000000000000000', // Arc Testnet
}

const CHAIN_NAMES: Record<number, string> = {
  11155111: 'Ethereum Sepolia',
  84532:    'Base Sepolia',
  421614:   'Arbitrum Sepolia',
  5042002:  'Arc Testnet',
}

const CHAIN_DOMAINS: Record<number, number> = {
  11155111: 0,
  84532:    6,
  421614:   3,
  5042002:  26,
}

const CHAIN_RPCS: Record<number, string> = {
  11155111: 'https://rpc.sepolia.org',
  84532:    'https://sepolia.base.org',
  421614:   'https://sepolia-rollup.arbitrum.io/rpc',
  5042002:  'https://rpc.testnet.arc.network',
}

const ERC20_ABI = [
  { name: 'balanceOf', type: 'function', stateMutability: 'view', inputs: [{ name: 'account', type: 'address' }], outputs: [{ type: 'uint256' }] },
  { name: 'approve', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [{ type: 'bool' }] },
  { name: 'allowance', type: 'function', stateMutability: 'view', inputs: [{ name: 'owner', type: 'address' }, { name: 'spender', type: 'address' }], outputs: [{ type: 'uint256' }] },
] as const

const GATEWAY_WALLET_ABI = [
  { name: 'deposit', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'token', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [] },
  { name: 'balanceOf', type: 'function', stateMutability: 'view', inputs: [{ name: 'token', type: 'address' }, { name: 'account', type: 'address' }], outputs: [{ type: 'uint256' }] },
] as const

interface ChainBalance {
  chainId: number
  walletBalance: string   // USDC in wallet
  gatewayBalance: string  // USDC deposited in Gateway
  loading: boolean
}

export function UnifiedBalanceCard() {
  const { authenticated, login } = usePrivy()
  const { wallets } = useWallets()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const [balances, setBalances] = useState<ChainBalance[]>(
    Object.keys(CHAIN_USDC).map(id => ({
      chainId: Number(id),
      walletBalance: '—',
      gatewayBalance: '—',
      loading: false,
    }))
  )
  const [depositChain, setDepositChain] = useState<number>(5042002)
  const [depositAmount, setDepositAmount] = useState('')
  const [depositing, setDepositing] = useState(false)
  const [txHash, setTxHash] = useState('')
  const [error, setError] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  const activeWallet = wallets?.[0]
  const address = activeWallet?.address as `0x${string}` | undefined

  const glassCard = isDark ? 'glass-dark' : 'glass-light'
  const glassInput = isDark ? 'glass-input-dark' : 'glass-input-light'
  const muted = isDark ? 'text-slate-400' : 'text-slate-500'
  const heading = isDark ? 'text-white' : 'text-slate-900'

  const fetchBalances = useCallback(async () => {
    if (!address) return
    setRefreshing(true)

    const updated = await Promise.all(
      Object.entries(CHAIN_USDC).map(async ([chainIdStr, usdcAddr]) => {
        const chainId = Number(chainIdStr)
        try {
          const client = createPublicClient({ transport: http(CHAIN_RPCS[chainId]) })

          const [walletBal, gatewayBal] = await Promise.all([
            client.readContract({ address: usdcAddr as `0x${string}`, abi: ERC20_ABI, functionName: 'balanceOf', args: [address] }),
            client.readContract({ address: GATEWAY_WALLET as `0x${string}`, abi: GATEWAY_WALLET_ABI, functionName: 'balanceOf', args: [usdcAddr as `0x${string}`, address] }),
          ])

          return {
            chainId,
            walletBalance: formatUnits(walletBal as bigint, 6),
            gatewayBalance: formatUnits(gatewayBal as bigint, 6),
            loading: false,
          }
        } catch {
          return { chainId, walletBalance: '—', gatewayBalance: '—', loading: false }
        }
      })
    )

    setBalances(updated)
    setRefreshing(false)
  }, [address])

  useEffect(() => {
    if (authenticated && address) fetchBalances()
  }, [authenticated, address, fetchBalances])

  const totalGateway = balances.reduce((sum, b) => {
    const v = parseFloat(b.gatewayBalance)
    return sum + (isNaN(v) ? 0 : v)
  }, 0)

  const handleDeposit = async () => {
    if (!authenticated) { login(); return }
    if (!address || !depositAmount || parseFloat(depositAmount) <= 0) return

    setDepositing(true); setError(''); setTxHash('')
    try {
      const provider = await activeWallet?.getEthereumProvider()
      if (!provider) throw new Error('No wallet provider')

      const walletClient = createWalletClient({ transport: custom(provider) })
      const usdcAddr = CHAIN_USDC[depositChain] as `0x${string}`
      const amount = parseUnits(depositAmount, 6)

      // Step 1: approve
      const approveTx = await walletClient.writeContract({
        address: usdcAddr,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [GATEWAY_WALLET as `0x${string}`, amount],
        account: address,
        chain: null,
      })

      // Step 2: deposit
      const depositTx = await walletClient.writeContract({
        address: GATEWAY_WALLET as `0x${string}`,
        abi: GATEWAY_WALLET_ABI,
        functionName: 'deposit',
        args: [usdcAddr, amount],
        account: address,
        chain: null,
      })

      setTxHash(depositTx)
      setDepositAmount('')
      setTimeout(() => fetchBalances(), 3000)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Deposit failed')
    } finally {
      setDepositing(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Unified Balance Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-3xl p-5 ${glassCard}`}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-base font-bold ${heading}`}>Unified Balance</h2>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-purple-500/15 text-purple-400 border border-purple-500/20 flex items-center gap-1">
              <Globe size={11} aria-hidden="true" />
              Cross-chain
            </span>
            {authenticated && (
              <motion.button
                onClick={fetchBalances}
                disabled={refreshing}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isDark ? 'bg-white/8 hover:bg-white/15' : 'bg-slate-100 hover:bg-slate-200'}`}
                aria-label="Refresh balances"
              >
                <RefreshCw size={13} className={`${refreshing ? 'animate-spin' : ''} text-blue-500`} />
              </motion.button>
            )}
          </div>
        </div>

        {/* Total */}
        <div className={`rounded-2xl p-4 mb-4 ${glassInput}`}>
          <div className={`text-xs font-medium ${muted} mb-1`}>Total Gateway Balance</div>
          <div className="flex items-center gap-2">
            <TokenIcon symbol="USDC" size={22} />
            <span className={`text-3xl font-bold tabular-nums ${heading}`}>
              {authenticated ? totalGateway.toFixed(2) : '—'}
            </span>
            <span className={`text-sm font-medium ${muted}`}>USDC</span>
          </div>
          <p className={`text-[10px] mt-1.5 ${muted}`}>
            Deposited across all chains · instant crosschain transfer
          </p>
        </div>

        {/* Per-chain breakdown */}
        <div className="space-y-2">
          {balances.map((b) => (
            <div key={b.chainId} className={`rounded-xl p-3 flex items-center justify-between ${isDark ? 'bg-white/4' : 'bg-slate-50'}`}>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${b.chainId === 5042002 ? 'bg-blue-500' : b.chainId === 84532 ? 'bg-blue-400' : b.chainId === 421614 ? 'bg-cyan-400' : 'bg-slate-400'}`} />
                <span className={`text-xs font-medium ${heading}`}>{CHAIN_NAMES[b.chainId]}</span>
              </div>
              <div className="text-right">
                <div className={`text-xs font-bold tabular-nums ${heading}`}>
                  {authenticated ? `${parseFloat(b.gatewayBalance || '0').toFixed(2)} USDC` : '—'}
                </div>
                <div className={`text-[10px] ${muted}`}>
                  wallet: {authenticated ? `${parseFloat(b.walletBalance || '0').toFixed(2)}` : '—'}
                </div>
              </div>
            </div>
          ))}
        </div>

        {!authenticated && (
          <motion.button
            onClick={login}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="w-full mt-4 py-3 rounded-2xl font-semibold text-sm glass-btn-primary text-white"
          >
            Connect Wallet to View Balances
          </motion.button>
        )}
      </motion.div>

      {/* Deposit Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`rounded-3xl p-5 ${glassCard}`}
      >
        <div className="flex items-center gap-2 mb-4">
          <ArrowDownToLine size={16} className="text-purple-400" />
          <h3 className={`text-sm font-bold ${heading}`}>Deposit to Gateway</h3>
        </div>

        {/* Info */}
        <div className={`rounded-xl p-3 mb-4 flex items-start gap-2 text-xs ${isDark ? 'bg-purple-500/8 border border-purple-500/15' : 'bg-purple-50 border border-purple-100'}`}>
          <Info size={13} className="text-purple-400 mt-0.5 flex-shrink-0" />
          <span className={isDark ? 'text-purple-300' : 'text-purple-700'}>
            Deposit USDC from any chain into Gateway to enable instant crosschain transfers (&lt;500ms).
          </span>
        </div>

        {/* Chain selector */}
        <div className={`rounded-2xl p-4 mb-3 ${glassInput}`}>
          <label className={`text-xs font-medium ${muted} block mb-2`}>Source chain</label>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(CHAIN_NAMES).map(([id, name]) => (
              <button
                key={id}
                onClick={() => setDepositChain(Number(id))}
                className={`px-3 py-2 rounded-xl text-xs font-medium transition-all text-left ${
                  depositChain === Number(id)
                    ? 'glass-btn-primary text-white'
                    : isDark
                    ? 'bg-white/8 border border-white/10 text-slate-300 hover:bg-white/12'
                    : 'bg-white/80 border border-white/90 text-slate-700 hover:bg-white shadow-sm'
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        {/* Amount */}
        <div className={`rounded-2xl p-4 mb-4 ${glassInput}`}>
          <label htmlFor="deposit-amount" className={`text-xs font-medium ${muted} block mb-2`}>Amount</label>
          <div className="flex items-center gap-2">
            <TokenIcon symbol="USDC" size={20} />
            <input
              id="deposit-amount"
              type="number"
              placeholder="0.00"
              value={depositAmount}
              onChange={e => setDepositAmount(e.target.value)}
              className={`flex-1 bg-transparent text-2xl font-bold outline-none placeholder:text-slate-600 tabular-nums ${heading}`}
            />
            <span className={`text-sm font-medium ${muted}`}>USDC</span>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div role="alert" className={`flex items-start gap-2 rounded-2xl p-3 mb-4 text-xs ${isDark ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-red-50 border border-red-200 text-red-600'}`}>
            <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Success */}
        {txHash && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`rounded-2xl p-3 mb-4 ${isDark ? 'bg-green-500/10 border border-green-500/20' : 'bg-green-50 border border-green-200'}`}
          >
            <p className={`text-xs font-semibold mb-1 flex items-center gap-1.5 ${isDark ? 'text-green-400' : 'text-green-700'}`}>
              <CheckCircle size={13} /> Deposited successfully!
            </p>
            <a
              href={`https://testnet.arcscan.app/tx/${txHash}`}
              target="_blank" rel="noopener noreferrer"
              className={`text-xs underline break-all ${isDark ? 'text-green-400' : 'text-green-600'}`}
            >
              View on ArcScan →
            </a>
          </motion.div>
        )}

        {/* Button */}
        <motion.button
          onClick={handleDeposit}
          disabled={depositing}
          whileHover={authenticated && depositAmount ? { scale: 1.01 } : {}}
          whileTap={authenticated && depositAmount ? { scale: 0.99 } : {}}
          className={`w-full py-3.5 rounded-2xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
            !authenticated
              ? 'glass-btn-primary text-white'
              : !depositAmount || parseFloat(depositAmount) <= 0
              ? isDark ? 'bg-white/6 text-slate-500 cursor-not-allowed border border-white/8' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'glass-btn-primary text-white'
          }`}
        >
          {depositing ? (
            <><Loader2 size={16} className="animate-spin" /> Depositing...</>
          ) : !authenticated ? 'Connect Wallet'
            : !depositAmount || parseFloat(depositAmount) <= 0 ? 'Enter amount'
            : <><ArrowDownToLine size={15} /> Deposit {depositAmount} USDC</>
          }
        </motion.button>
      </motion.div>
    </div>
  )
}

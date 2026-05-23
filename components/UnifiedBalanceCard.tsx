'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { createPublicClient, createWalletClient, custom, http, parseUnits, formatUnits } from 'viem'
import { Loader2, RefreshCw, ArrowDownToLine, Globe, CheckCircle, AlertCircle, Info } from 'lucide-react'
import { useTheme } from '@/components/ThemeProvider'
import { TokenIcon } from '@/components/TokenIcon'
import { AppKit } from '@circle-fin/app-kit'

// Lazy init — avoid module-level instantiation during SSR/build
let _kit: AppKit | null = null
function getKit() {
  if (!_kit) _kit = new AppKit()
  return _kit
}

// Gateway contracts (testnet)
const GATEWAY_WALLET = '0x0077777d7EBA4688BDeF3E311b846F25870A19B9'

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

// Map AppKit SDK chain names to chainId
const CHAIN_NAME_TO_ID: Record<string, number> = {
  'Ethereum_Sepolia': 11155111,
  'Base_Sepolia':     84532,
  'Arbitrum_Sepolia': 421614,
  'Arc_Testnet':      5042002,
}

const CHAIN_CONFIGS: Record<number, { id: number; name: string; nativeCurrency: { name: string; symbol: string; decimals: number }; rpcUrls: { default: { http: string[] } } }> = {
  11155111: { id: 11155111, name: 'Ethereum Sepolia', nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 }, rpcUrls: { default: { http: ['https://rpc.sepolia.org'] } } },
  84532:    { id: 84532,    name: 'Base Sepolia',     nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 }, rpcUrls: { default: { http: ['https://sepolia.base.org'] } } },
  421614:   { id: 421614,   name: 'Arbitrum Sepolia', nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 }, rpcUrls: { default: { http: ['https://sepolia-rollup.arbitrum.io/rpc'] } } },
  5042002:  { id: 5042002,  name: 'Arc Testnet',      nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 6 }, rpcUrls: { default: { http: ['https://rpc.testnet.arc.network'] } } },
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
  const [depositStep, setDepositStep] = useState<'idle' | 'approving' | 'depositing'>('idle')
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

    // Fetch wallet balances per chain via eth_call
    const updated = await Promise.all(
      Object.entries(CHAIN_USDC).map(async ([chainIdStr, usdcAddr]) => {
        const chainId = Number(chainIdStr)
        try {
          const client = createPublicClient({ chain: CHAIN_CONFIGS[chainId] as any, transport: http(CHAIN_CONFIGS[chainId].rpcUrls.default.http[0]) })
          let walletBal: bigint = BigInt(0)
          try {
            walletBal = await client.readContract({ address: usdcAddr as `0x${string}`, abi: ERC20_ABI, functionName: 'balanceOf', args: [address] }) as bigint
          } catch {}
          return {
            chainId,
            walletBalance: parseFloat(formatUnits(walletBal, 6)).toFixed(2),
            gatewayBalance: '—',
            loading: false,
          }
        } catch {
          return { chainId, walletBalance: '—', gatewayBalance: '—', loading: false }
        }
      })
    )

    // Fetch unified gateway balance via server-side API route (avoids CORS)
    try {
      const res = await fetch(`/api/gateway-balance?address=${address}`)
      const result = await res.json()
      if (result?.breakdown) {
        for (const depositor of result.breakdown) {
          for (const chainBreakdown of depositor.breakdown ?? []) {
            const chainName = chainBreakdown.chain as string
            const chainId = CHAIN_NAME_TO_ID[chainName]
            if (chainId !== undefined) {
              const idx = updated.findIndex(b => b.chainId === chainId)
              if (idx !== -1) {
                updated[idx].gatewayBalance = parseFloat(chainBreakdown.confirmedBalance ?? '0').toFixed(2)
              }
            }
          }
        }
      }
    } catch (e) {
      console.warn('[Gateway balance fetch]', e)
    }

    setBalances(updated)
    setRefreshing(false)
  }, [address, activeWallet])

  useEffect(() => {
    if (authenticated && address) fetchBalances()
  }, [authenticated, address, fetchBalances])

  const totalGateway = balances.reduce((sum, b) => {
    const v = parseFloat(b.gatewayBalance)
    return sum + (isNaN(v) ? 0 : v)
  }, 0)

  // Wallet balance on the currently selected source chain (for Max button + validation)
  const selectedWalletBalance = (() => {
    const b = balances.find(x => x.chainId === depositChain)
    if (!b) return 0
    const v = parseFloat(b.walletBalance)
    return isNaN(v) ? 0 : v
  })()

  const amountNum = parseFloat(depositAmount)
  const amountInvalid = depositAmount !== '' && (isNaN(amountNum) || amountNum <= 0)
  const insufficientBalance = !isNaN(amountNum) && amountNum > 0 && amountNum > selectedWalletBalance

  const parseError = (e: unknown): string => {
    const msg = e instanceof Error ? e.message : String(e)
    const errObj = e as { code?: number; shortMessage?: string }
    if (errObj?.code === 4001 || /user rejected|user denied/i.test(msg)) {
      return 'Transaction rejected in wallet.'
    }
    if (/insufficient funds/i.test(msg)) {
      return 'Insufficient gas on this chain. Top up native token first.'
    }
    if (/exceeds.*allowance|transfer amount exceeds balance/i.test(msg)) {
      return 'USDC balance too low on this chain.'
    }
    if (errObj?.shortMessage) return errObj.shortMessage
    return msg.slice(0, 140)
  }

  const handleDeposit = async () => {
    if (!authenticated) { login(); return }
    if (!address || !depositAmount || parseFloat(depositAmount) <= 0) return
    if (insufficientBalance) {
      setError('USDC balance too low on this chain.')
      return
    }

    setDepositing(true); setError(''); setTxHash(''); setDepositStep('idle')
    try {
      const provider = await activeWallet?.getEthereumProvider()
      if (!provider) throw new Error('No wallet provider')

      // Switch wallet to the selected chain first
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${depositChain.toString(16)}` }],
      }).catch(async (switchErr: unknown) => {
        const switchError = switchErr as { code?: number }
        if (switchError?.code === 4902) {
          const cfg = CHAIN_CONFIGS[depositChain]
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: `0x${depositChain.toString(16)}`,
              chainName: cfg.name,
              nativeCurrency: cfg.nativeCurrency,
              rpcUrls: cfg.rpcUrls.default.http,
            }],
          })
        }
        // ignore other switch errors — wallet may already be on correct chain
      })

      const chainConfig = CHAIN_CONFIGS[depositChain]
      const walletClient = createWalletClient({
        chain: chainConfig as any,
        transport: custom(provider),
      })
      const publicClient = createPublicClient({
        chain: chainConfig as any,
        transport: http(chainConfig.rpcUrls.default.http[0]),
      })

      const usdcAddr = CHAIN_USDC[depositChain] as `0x${string}`
      const amount = parseUnits(depositAmount, 6)

      // Step 1: approve — wait for receipt before depositing
      setDepositStep('approving')
      const approveTx = await walletClient.writeContract({
        address: usdcAddr,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [GATEWAY_WALLET as `0x${string}`, amount],
        account: address,
        chain: chainConfig as any,
      })
      await publicClient.waitForTransactionReceipt({ hash: approveTx })

      // Step 2: deposit
      setDepositStep('depositing')
      const depositTx = await walletClient.writeContract({
        address: GATEWAY_WALLET as `0x${string}`,
        abi: GATEWAY_WALLET_ABI,
        functionName: 'deposit',
        args: [usdcAddr, amount],
        account: address,
        chain: chainConfig as any,
      })
      await publicClient.waitForTransactionReceipt({ hash: depositTx })

      setTxHash(depositTx)
      setDepositAmount('')
      setTimeout(() => fetchBalances(), 3000)
    } catch (e: unknown) {
      console.error('[Deposit error]', e)
      setError(parseError(e))
    } finally {
      setDepositing(false)
      setDepositStep('idle')
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
            <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-arc-violet/15 text-arc-violet border border-arc-violet/20 flex items-center gap-1">
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
                <RefreshCw size={13} className={`${refreshing ? 'animate-spin' : ''} text-arc-light`} />
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
                <div className={`w-2 h-2 rounded-full ${b.chainId === 5042002 ? 'bg-arc-light' : b.chainId === 84532 ? 'bg-arc-light' : b.chainId === 421614 ? 'bg-arc-light' : 'bg-slate-400'}`} />
                <span className={`text-xs font-medium ${heading}`}>{CHAIN_NAMES[b.chainId]}</span>
              </div>
              <div className="text-right">
                <div className={`text-xs font-bold tabular-nums ${heading}`}>
                  {authenticated ? `${isNaN(parseFloat(b.gatewayBalance)) ? '0.00' : parseFloat(b.gatewayBalance).toFixed(2)} USDC` : '—'}
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
          <ArrowDownToLine size={16} className="text-arc-violet" />
          <h3 className={`text-sm font-bold ${heading}`}>Deposit to Gateway</h3>
        </div>

        {/* Info */}
        <div className={`rounded-xl p-3 mb-4 flex items-start gap-2 text-xs ${isDark ? 'bg-arc-violet/8 border border-arc-violet/15' : 'bg-white/5 border border-white/10'}`}>
          <Info size={13} className="text-arc-violet mt-0.5 flex-shrink-0" />
          <span className={isDark ? 'text-arc-light' : 'text-arc-violet'}>
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
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="deposit-amount" className={`text-xs font-medium ${muted}`}>Amount</label>
            {authenticated && (
              <button
                type="button"
                onClick={() => setDepositAmount(selectedWalletBalance.toString())}
                disabled={selectedWalletBalance <= 0}
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-md transition-colors ${
                  selectedWalletBalance > 0
                    ? 'text-arc-violet hover:bg-arc-violet/10 cursor-pointer'
                    : 'text-slate-500 cursor-not-allowed opacity-50'
                }`}
                aria-label="Use max wallet balance"
              >
                Wallet: {selectedWalletBalance.toFixed(2)} · MAX
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <TokenIcon symbol="USDC" size={20} />
            <input
              id="deposit-amount"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={depositAmount}
              onChange={e => setDepositAmount(e.target.value)}
              className={`flex-1 bg-transparent text-2xl font-bold outline-none placeholder:text-slate-600 tabular-nums ${heading}`}
            />
            <span className={`text-sm font-medium ${muted}`}>USDC</span>
          </div>
          {/* Inline validation hint */}
          {authenticated && depositAmount !== '' && (insufficientBalance || amountInvalid) && (
            <p className={`text-[10px] mt-1.5 ${isDark ? 'text-red-400' : 'text-red-500'}`}>
              {amountInvalid ? 'Enter a valid amount' : `Exceeds wallet balance (${selectedWalletBalance.toFixed(2)} USDC)`}
            </p>
          )}
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
            className={`rounded-2xl p-3 mb-4 ${isDark ? 'bg-white/10 border border-white/20' : 'bg-white/5 border border-white/10'}`}
          >
            <p className={`text-xs font-semibold mb-1 flex items-center gap-1.5 ${isDark ? 'text-white' : 'text-white'}`}>
              <CheckCircle size={13} /> Deposited successfully!
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
          onClick={handleDeposit}
          disabled={depositing || insufficientBalance || amountInvalid}
          whileHover={authenticated && depositAmount && !insufficientBalance && !amountInvalid ? { scale: 1.01 } : {}}
          whileTap={authenticated && depositAmount && !insufficientBalance && !amountInvalid ? { scale: 0.99 } : {}}
          className={`w-full py-3.5 rounded-2xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
            !authenticated
              ? 'glass-btn-primary text-white'
              : !depositAmount || amountInvalid || insufficientBalance
              ? isDark ? 'bg-white/6 text-slate-500 cursor-not-allowed border border-white/8' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'glass-btn-primary text-white'
          }`}
        >
          {depositing ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              {depositStep === 'approving' ? 'Step 1/2 · Approving USDC…'
                : depositStep === 'depositing' ? 'Step 2/2 · Depositing…'
                : 'Preparing…'}
            </>
          ) : !authenticated ? 'Connect Wallet'
            : !depositAmount || amountInvalid ? 'Enter amount'
            : insufficientBalance ? 'Insufficient balance'
            : <><ArrowDownToLine size={15} /> Deposit {depositAmount} USDC</>
          }
        </motion.button>
      </motion.div>
    </div>
  )
}

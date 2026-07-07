'use client'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { useState, useEffect, useCallback } from 'react'
import { createPublicClient, http, formatUnits } from 'viem'
import { useTheme } from '@/components/ThemeProvider'
import { RefreshCw, Wallet, ExternalLink } from 'lucide-react'

const ARC_CHAIN = {
  id: 5042002,
  name: 'Arc Testnet',
  nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 6 },
  rpcUrls: { default: { http: ['https://rpc.testnet.arc.network'] } },
} as const

const USDC = '0x3600000000000000000000000000000000000001' as `0x${string}`
const EURC = '0x89B5000000000000000000000000000000000001' as `0x${string}`

const ERC20_ABI = [
  { name: 'balanceOf', type: 'function', stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }] }
] as const

export function AgentWalletPanel() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const { authenticated, login } = usePrivy()
  const { wallets } = useWallets()
  const [usdcBal, setUsdcBal] = useState('0.00')
  const [eurcBal, setEurcBal] = useState('0.00')
  const [refreshing, setRefreshing] = useState(false)
  const card = isDark ? 'glass-dark' : 'glass-light'
  const muted = isDark ? 'text-slate-400' : 'text-slate-500'

  const wallet = wallets[0]

  const fetchBalances = useCallback(async () => {
    if (!wallet?.address) return
    setRefreshing(true)
    try {
      const client = createPublicClient({ chain: ARC_CHAIN as any, transport: http() })
      const [usdc, eurc] = await Promise.all([
        client.readContract({ address: USDC, abi: ERC20_ABI, functionName: 'balanceOf', args: [wallet.address as `0x${string}`] }),
        client.readContract({ address: EURC, abi: ERC20_ABI, functionName: 'balanceOf', args: [wallet.address as `0x${string}`] }),
      ])
      setUsdcBal(parseFloat(formatUnits(usdc, 6)).toFixed(2))
      setEurcBal(parseFloat(formatUnits(eurc, 6)).toFixed(2))
    } catch {}
    setRefreshing(false)
  }, [wallet?.address])

  useEffect(() => { fetchBalances() }, [fetchBalances])

  return (
    <div className={`rounded-2xl p-5 ${card} space-y-4`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-arc-violet/15 flex items-center justify-center">
            <Wallet size={15} className="text-arc-violet" />
          </div>
          <h2 className="text-white font-bold text-sm">Agent Wallet</h2>
        </div>
        {authenticated && (
          <button onClick={fetchBalances} className="w-7 h-7 rounded-lg bg-white/8 hover:bg-white/15 flex items-center justify-center transition-colors">
            <RefreshCw size={12} className={`text-arc-violet ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>

      {!authenticated ? (
        <div className="text-center py-6">
          <p className={`text-sm ${muted} mb-3`}>Connect wallet to use Arc Agent</p>
          <button onClick={login} className="px-4 py-2 glass-btn-primary text-white text-xs font-semibold rounded-xl">
            Connect Wallet
          </button>
        </div>
      ) : (
        <>
          <div className="rounded-xl p-3 bg-white/4 border border-white/6">
            <div className={`text-xs ${muted} mb-1`}>Connected Address</div>
            <div className="text-xs text-arc-violet font-mono truncate">{wallet?.address}</div>
            <a href={`https://testnet.arcscan.app/address/${wallet?.address}`} target="_blank" rel="noopener noreferrer"
              className={`text-[10px] ${muted} hover:text-arc-violet flex items-center gap-1 mt-1 transition-colors`}>
              View on ArcScan <ExternalLink size={9} />
            </a>
          </div>

          <div className="space-y-2">
            <div className={`text-xs font-medium ${muted}`}>Balances</div>
            {[{ symbol: 'USDC', bal: usdcBal }, { symbol: 'EURC', bal: eurcBal }].map(({ symbol, bal }) => (
              <div key={symbol} className="flex items-center justify-between rounded-xl p-3 bg-white/4 border border-white/6">
                <span className="text-xs text-white font-medium">{symbol}</span>
                <span className="text-sm font-bold text-white tabular-nums">{bal}</span>
              </div>
            ))}
          </div>

          <div className="rounded-xl p-3 bg-arc-violet/8 border border-arc-violet/15">
            <p className={`text-[11px] ${muted} leading-relaxed`}>
              Arc Agent uses your connected wallet to execute transactions. You will be prompted to approve each action.
            </p>
          </div>

          {/* Capabilities */}
          <div className="space-y-1.5">
            <div className={`text-xs font-medium ${muted}`}>Capabilities</div>
            {['Swap USDC ↔ EURC', 'Send to any address', 'Bridge cross-chain', 'Check balances'].map(cap => (
              <div key={cap} className="flex items-center gap-2 text-xs text-slate-300">
                <div className="w-1 h-1 rounded-full bg-arc-violet" />
                {cap}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

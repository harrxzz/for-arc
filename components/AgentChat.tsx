'use client'
import { useState, useRef, useEffect } from 'react'
import { useTheme } from '@/components/ThemeProvider'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { Send, Bot, User, Loader2, CheckCircle, XCircle } from 'lucide-react'
import { createPublicClient, createWalletClient, http, custom, parseUnits, formatUnits } from 'viem'
import { arcTestnet, USDC_ADDRESS_ARC, FEE_RECIPIENT, SWAP_FEE_BPS } from '@/config/chains'

const XYLO_ROUTER = '0x73742278c31a76dBb0D2587d03ef92E6E2141023' as const
const USDC = USDC_ADDRESS_ARC as `0x${string}`
const EURC = '0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a' as `0x${string}`

const ERC20_ABI = [
  { name: 'allowance', type: 'function', stateMutability: 'view',
    inputs: [{ name: 'owner', type: 'address' }, { name: 'spender', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }] },
  { name: 'approve', type: 'function', stateMutability: 'nonpayable',
    inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }],
    outputs: [{ name: '', type: 'bool' }] },
  { name: 'transfer', type: 'function', stateMutability: 'nonpayable',
    inputs: [{ name: 'to', type: 'address' }, { name: 'amount', type: 'uint256' }],
    outputs: [{ name: '', type: 'bool' }] },
] as const

const XYLO_ABI = [
  { name: 'quote', type: 'function', stateMutability: 'view',
    inputs: [{ name: 'tokenIn', type: 'address' }, { name: 'tokenOut', type: 'address' }, { name: 'amountIn', type: 'uint256' }],
    outputs: [{ name: 'amountOut', type: 'uint256' }, { name: 'priceImpact', type: 'uint256' }] },
  { name: 'swap', type: 'function', stateMutability: 'nonpayable',
    inputs: [{ name: 'params', type: 'tuple', components: [
      { name: 'tokenIn', type: 'address' }, { name: 'tokenOut', type: 'address' },
      { name: 'amountIn', type: 'uint256' }, { name: 'minAmountOut', type: 'uint256' },
      { name: 'to', type: 'address' }, { name: 'deadline', type: 'uint256' },
    ]}],
    outputs: [{ name: 'amountOut', type: 'uint256' }] },
] as const

const publicClient = createPublicClient({ chain: arcTestnet, transport: http('https://rpc.testnet.arc.network') })

type Message = {
  role: 'user' | 'agent'
  content: string
  txHash?: string
  status?: 'success' | 'error'
}

type Intent = {
  action: 'swap' | 'send' | 'bridge' | 'balance' | 'unknown'
  params: Record<string, string>
  confirmation: string
  error: string | null
}

const SUGGESTIONS = [
  'Swap 10 USDC to EURC',
  'Send 5 USDC to 0x1234...',
  'What is my balance?',
  'Bridge 20 USDC from Base to Arc',
]

export function AgentChat() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const { authenticated } = usePrivy()
  const { wallets } = useWallets()
  const [messages, setMessages] = useState<Message[]>([
    { role: 'agent', content: "Hi! I'm Arc Agent 🤖\n\nI can help you execute onchain transactions on Arc Network using natural language. Try:\n• Swap 10 USDC to EURC\n• Send 5 USDC to 0x...\n• Check my balance\n• Bridge 20 USDC from Base to Arc" }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [pendingIntent, setPendingIntent] = useState<Intent | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const card = isDark ? 'glass-dark' : 'glass-light'

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const addAgentMsg = (content: string, extra?: Partial<Message>) => {
    setMessages(prev => [...prev, { role: 'agent', content, ...extra }])
  }

  const executeIntent = async (intent: Intent) => {
    if (!wallets[0]) { addAgentMsg('Please connect your wallet first.'); return }
    const wallet = wallets[0]

    try {
      const provider = await wallet.getEthereumProvider()

      if (intent.action === 'send') {
        const { to, token, amount } = intent.params
        const tokenAddr = token === 'USDC'
          ? '0x3600000000000000000000000000000000000001'
          : '0x89B5000000000000000000000000000000000001'
        const amountBig = BigInt(Math.round(parseFloat(amount) * 1e6))
        const paddedTo = to.replace('0x', '').padStart(64, '0')
        const paddedAmt = amountBig.toString(16).padStart(64, '0')
        const data = '0xa9059cbb' + paddedTo + paddedAmt

        addAgentMsg(`Sending transaction... Please approve in your wallet.`)
        const txHash = await provider.request({
          method: 'eth_sendTransaction',
          params: [{ from: wallet.address, to: tokenAddr, data, chainId: '0x4CE452' }]
        })
        addAgentMsg(`✅ Sent ${amount} ${token} successfully!`, { txHash: txHash as string, status: 'success' })

      } else if (intent.action === 'swap') {
        const { fromToken, toToken, amount } = intent.params
        const tokenIn = fromToken === 'USDC' ? USDC : EURC
        const tokenOut = toToken === 'USDC' ? USDC : EURC
        const provider = await wallet.getEthereumProvider()
        const walletClient = createWalletClient({ chain: arcTestnet, transport: custom(provider) })
        const address = wallet.address as `0x${string}`
        const amountIn = parseUnits(amount, 6)
        const feeAmt = (amountIn * BigInt(SWAP_FEE_BPS)) / BigInt(10000)
        const swapAmountIn = amountIn - feeAmt

        addAgentMsg(`Step 1/3: Collecting fee... Please approve in your wallet.`)
        await walletClient.writeContract({
          address: tokenIn, abi: ERC20_ABI,
          functionName: 'transfer', args: [FEE_RECIPIENT as `0x${string}`, feeAmt], account: address,
        })

        addAgentMsg(`Step 2/3: Approving ${fromToken}...`)
        const allowance = await publicClient.readContract({
          address: tokenIn, abi: ERC20_ABI, functionName: 'allowance', args: [address, XYLO_ROUTER],
        })
        if (allowance < swapAmountIn) {
          await walletClient.writeContract({
            address: tokenIn, abi: ERC20_ABI,
            functionName: 'approve', args: [XYLO_ROUTER, swapAmountIn], account: address,
          })
        }

        addAgentMsg(`Step 3/3: Executing swap...`)
        const [amountOut] = await publicClient.readContract({
          address: XYLO_ROUTER, abi: XYLO_ABI, functionName: 'quote',
          args: [tokenIn, tokenOut, swapAmountIn],
        })
        const minAmountOut = (amountOut * BigInt(995)) / BigInt(1000)
        const deadline = BigInt(Math.floor(Date.now() / 1000) + 300)

        const hash = await walletClient.writeContract({
          address: XYLO_ROUTER, abi: XYLO_ABI, functionName: 'swap',
          args: [{ tokenIn, tokenOut, amountIn: swapAmountIn, minAmountOut, to: address, deadline }],
          account: address,
        })
        addAgentMsg(
          `✅ Swapped ${amount} ${fromToken} → ${formatUnits(amountOut, 6)} ${toToken}!`,
          { txHash: hash, status: 'success' }
        )
      } else if (intent.action === 'bridge') {
        addAgentMsg(`Bridge execution coming soon! For now, use the /bridge page.`)
      } else if (intent.action === 'balance') {
        addAgentMsg(`Check your balances in the wallet panel on the right →`)
      }
    } catch (e: any) {
      addAgentMsg(`❌ Transaction failed: ${e?.message || 'Unknown error'}`, { status: 'error' })
    }
    setPendingIntent(null)
  }

  const sendMessage = async (text?: string) => {
    const userMsg = (text || input).trim()
    if (!userMsg || loading) return
    setInput('')

    // Handle confirm/cancel when pending
    if (pendingIntent) {
      setMessages(prev => [...prev, { role: 'user', content: userMsg }])
      const lower = userMsg.toLowerCase()
      if (lower === 'confirm' || lower === 'yes') {
        setLoading(true)
        await executeIntent(pendingIntent)
        setLoading(false)
      } else if (lower === 'cancel' || lower === 'no') {
        setPendingIntent(null)
        addAgentMsg('Transaction cancelled.')
      } else {
        addAgentMsg('Please reply **confirm** to execute or **cancel** to abort.')
      }
      return
    }

    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setLoading(true)

    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, history: messages })
      })
      const { intent, error } = await res.json()

      if (error) { addAgentMsg(`Error: ${error}`); setLoading(false); return }

      if (intent.action === 'unknown') {
        addAgentMsg(intent.params?.message || "I didn't understand that. Try: \"Swap 10 USDC to EURC\"")
      } else if (intent.action === 'balance') {
        addAgentMsg('Check your balances in the wallet panel on the right →')
      } else {
        setPendingIntent(intent)
        addAgentMsg(`${intent.confirmation}\n\nReply **confirm** to execute or **cancel** to abort.`)
      }
    } catch {
      addAgentMsg('Something went wrong. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div className={`rounded-2xl flex flex-col ${card}`} style={{ height: '600px' }}>
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-white/8">
        <div className="w-9 h-9 rounded-xl bg-arc-violet/15 flex items-center justify-center">
          <Bot size={18} className="text-arc-violet" />
        </div>
        <div>
          <div className="text-white font-semibold text-sm">Arc Agent</div>
          <div className="text-xs text-slate-400">Powered by Claude · Arc Network</div>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-arc-violet animate-pulse" />
          <span className="text-xs text-arc-violet">Online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
              msg.role === 'agent' ? 'bg-arc-violet/15' : 'bg-white/10'
            }`}>
              {msg.role === 'agent'
                ? <Bot size={13} className="text-arc-violet" />
                : <User size={13} className="text-white" />
              }
            </div>
            <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
              msg.role === 'agent' ? 'bg-white/5 text-slate-200' : 'bg-arc-violet/15 text-white'
            }`}>
              {msg.content}
              {msg.txHash && (
                <a href={`https://testnet.arcscan.app/tx/${msg.txHash}`}
                  target="_blank" rel="noopener noreferrer"
                  className="block mt-2 text-xs text-arc-violet underline hover:opacity-80">
                  View on ArcScan →
                </a>
              )}
              {msg.status === 'success' && <CheckCircle size={12} className="inline ml-1 text-white" />}
              {msg.status === 'error' && <XCircle size={12} className="inline ml-1 text-red-400" />}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-lg bg-arc-violet/15 flex items-center justify-center">
              <Bot size={13} className="text-arc-violet" />
            </div>
            <div className="bg-white/5 rounded-2xl px-4 py-3">
              <Loader2 size={14} className="text-arc-violet animate-spin" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length === 1 && (
        <div className="px-4 pb-2 flex gap-2 flex-wrap">
          {SUGGESTIONS.map(s => (
            <button key={s} onClick={() => sendMessage(s)}
              className="text-xs px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 transition-colors">
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Confirm/Cancel buttons */}
      {pendingIntent && !loading && (
        <div className="px-4 pb-2 flex gap-2">
          <button onClick={() => sendMessage('confirm')}
            className="flex-1 py-2 rounded-xl bg-arc-violet/20 border border-arc-violet/30 text-arc-violet text-xs font-semibold hover:bg-arc-violet/30 transition-colors">
            ✓ Confirm
          </button>
          <button onClick={() => sendMessage('cancel')}
            className="flex-1 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 text-xs font-semibold hover:bg-white/10 transition-colors">
            ✕ Cancel
          </button>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-white/8">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder={pendingIntent ? 'Type confirm or cancel...' : 'e.g. Swap 10 USDC to EURC'}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none focus:border-arc-violet/40 transition-colors"
          />
          <button onClick={() => sendMessage()} disabled={!input.trim() || loading}
            className="w-10 h-10 rounded-xl bg-arc-violet/15 flex items-center justify-center hover:bg-arc-violet/25 transition-colors disabled:opacity-40">
            <Send size={14} className="text-arc-violet" />
          </button>
        </div>
      </div>
    </div>
  )
}

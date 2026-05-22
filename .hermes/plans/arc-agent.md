# Arc Agent Implementation Plan

**Goal:** Build an AI-powered onchain agent page (`/agent`) on for-arc that lets users chat with an AI to execute swap, send, and bridge transactions on Arc Network.

**Architecture:**
- New `/agent` page with chat UI + agent wallet panel
- Backend API routes handle LLM intent parsing + onchain execution
- Agent wallet is a Privy embedded wallet funded by user, executes without per-tx approval
- Claude (via FreeModel) parses natural language → structured intent → viem executes on-chain

**Tech Stack:** Next.js 16, Privy, viem, Claude API (FreeModel), XyloRouter contract, USDC/EURC contracts

---

## Phase 1: Agent Wallet + Balance UI

### Task 1: Create `/agent` page skeleton

**Files:**
- Create: `app/agent/page.tsx`

```tsx
'use client'
import { AnimatedBg } from '@/components/AnimatedBg'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { useTheme } from '@/components/ThemeProvider'
import { AgentChat } from '@/components/AgentChat'
import { AgentWalletPanel } from '@/components/AgentWalletPanel'

export default function AgentPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  return (
    <div className={`min-h-screen relative ${isDark ? 'bg-[#000000]' : 'bg-[#000000]'}`}>
      <AnimatedBg />
      <Header />
      <main className="relative z-10 pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Arc Agent</h1>
            <p className="text-slate-400 text-sm">Chat with an AI agent to execute onchain transactions</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <AgentChat />
            </div>
            <div>
              <AgentWalletPanel />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
```

---

### Task 2: AgentWalletPanel component

**Files:**
- Create: `components/AgentWalletPanel.tsx`

Shows: agent wallet address, USDC balance, deposit button, recent txs.

```tsx
'use client'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { useState, useEffect } from 'react'
import { createPublicClient, http, formatUnits } from 'viem'
import { useTheme } from '@/components/ThemeProvider'

const ARC_CHAIN = {
  id: 5042002,
  name: 'Arc Testnet',
  nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 6 },
  rpcUrls: { default: { http: ['https://rpc.testnet.arc.network'] } },
}
const USDC = '0x3600000000000000000000000000000000000001' as `0x${string}`
const ERC20_ABI = [
  { name: 'balanceOf', type: 'function', stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }] }
] as const

export function AgentWalletPanel() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const { authenticated } = usePrivy()
  const { wallets } = useWallets()
  const [balance, setBalance] = useState('0.00')
  const card = isDark ? 'glass-dark' : 'glass-light'

  const wallet = wallets[0]

  useEffect(() => {
    if (!wallet?.address) return
    const client = createPublicClient({ chain: ARC_CHAIN as any, transport: http() })
    client.readContract({
      address: USDC, abi: ERC20_ABI, functionName: 'balanceOf',
      args: [wallet.address as `0x${string}`]
    }).then(b => setBalance(formatUnits(b, 6)))
  }, [wallet?.address])

  return (
    <div className={`rounded-2xl p-5 ${card}`}>
      <h2 className="text-white font-bold text-base mb-4">Agent Wallet</h2>
      {!authenticated ? (
        <p className="text-slate-400 text-sm">Connect wallet to use agent</p>
      ) : (
        <>
          <div className="mb-4">
            <div className="text-xs text-slate-400 mb-1">Address</div>
            <div className="text-xs text-arc-light font-mono truncate">{wallet?.address}</div>
          </div>
          <div className="mb-4">
            <div className="text-xs text-slate-400 mb-1">USDC Balance</div>
            <div className="text-2xl font-bold text-white">{balance} <span className="text-sm text-slate-400">USDC</span></div>
          </div>
          <div className="text-xs text-slate-500 mt-4">
            Agent uses your connected wallet to execute transactions. Approve each action in the chat.
          </div>
        </>
      )}
    </div>
  )
}
```

---

### Task 3: AgentChat component (UI only, no LLM yet)

**Files:**
- Create: `components/AgentChat.tsx`

```tsx
'use client'
import { useState, useRef, useEffect } from 'react'
import { useTheme } from '@/components/ThemeProvider'
import { Send, Bot, User, Loader2 } from 'lucide-react'

type Message = {
  role: 'user' | 'agent'
  content: string
  status?: 'pending' | 'success' | 'error'
  txHash?: string
}

const SUGGESTIONS = [
  'Swap 10 USDC to EURC',
  'Send 5 USDC to 0x...',
  'What is my USDC balance?',
  'Bridge 20 USDC from Base to Arc',
]

export function AgentChat() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [messages, setMessages] = useState<Message[]>([
    { role: 'agent', content: 'Hi! I\'m Arc Agent. I can help you swap, send, and bridge tokens on Arc Network. What would you like to do?' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const card = isDark ? 'glass-dark' : 'glass-light'

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setLoading(true)

    // TODO: call /api/agent
    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: 'agent',
        content: 'Processing your request...'
      }])
      setLoading(false)
    }, 1000)
  }

  return (
    <div className={`rounded-2xl flex flex-col ${card}`} style={{ height: '600px' }}>
      {/* Header */}
      <div className="flex items-center gap-2 p-4 border-b border-white/8">
        <div className="w-8 h-8 rounded-xl bg-arc-light/20 flex items-center justify-center">
          <Bot size={16} className="text-arc-light" />
        </div>
        <div>
          <div className="text-white font-semibold text-sm">Arc Agent</div>
          <div className="text-xs text-slate-400">Powered by Claude + Arc Network</div>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-arc-light animate-pulse" />
          <span className="text-xs text-arc-light">Online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
              msg.role === 'agent' ? 'bg-arc-light/20' : 'bg-white/10'
            }`}>
              {msg.role === 'agent'
                ? <Bot size={14} className="text-arc-light" />
                : <User size={14} className="text-white" />
              }
            </div>
            <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
              msg.role === 'agent'
                ? 'bg-white/5 text-slate-200'
                : 'bg-arc-light/20 text-white'
            }`}>
              {msg.content}
              {msg.txHash && (
                <a href={`https://testnet.arcscan.app/tx/${msg.txHash}`}
                  target="_blank" rel="noopener noreferrer"
                  className="block mt-1 text-xs text-arc-light underline">
                  View on ArcScan →
                </a>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-lg bg-arc-light/20 flex items-center justify-center">
              <Bot size={14} className="text-arc-light" />
            </div>
            <div className="bg-white/5 rounded-2xl px-4 py-2.5">
              <Loader2 size={14} className="text-arc-light animate-spin" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length === 1 && (
        <div className="px-4 pb-2 flex gap-2 flex-wrap">
          {SUGGESTIONS.map(s => (
            <button key={s} onClick={() => setInput(s)}
              className="text-xs px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 transition-colors">
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-white/8">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder="Type a command... e.g. Swap 10 USDC to EURC"
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none focus:border-arc-light/40"
          />
          <button onClick={sendMessage} disabled={!input.trim() || loading}
            className="w-10 h-10 rounded-xl bg-arc-light/20 flex items-center justify-center hover:bg-arc-light/30 transition-colors disabled:opacity-40">
            <Send size={15} className="text-arc-light" />
          </button>
        </div>
      </div>
    </div>
  )
}
```

---

## Phase 2: LLM Intent Parser

### Task 4: API route `/api/agent`

**Files:**
- Create: `app/api/agent/route.ts`

Parses user message → structured intent using Claude.

```ts
import { NextRequest, NextResponse } from 'next/server'

const FREEMODEL_KEY = process.env.FREEMODEL_API_KEY!
const SYSTEM_PROMPT = `You are Arc Agent, an AI that helps users execute onchain transactions on Arc Network.

Parse the user's message and return a JSON object with this structure:
{
  "action": "swap" | "send" | "bridge" | "balance" | "unknown",
  "params": {
    // for swap: { fromToken: "USDC"|"EURC", toToken: "USDC"|"EURC", amount: string }
    // for send: { to: string, token: "USDC"|"EURC", amount: string }
    // for bridge: { fromChain: string, toChain: string, token: "USDC", amount: string }
    // for balance: {}
    // for unknown: { message: string }
  },
  "confirmation": "Human readable confirmation message asking user to confirm",
  "error": null | "error message if request is invalid"
}

Rules:
- Only support USDC and EURC tokens
- Amount must be a valid number string
- For send, validate address starts with 0x and is 42 chars
- If unclear, set action to "unknown" and ask for clarification
- Always respond with valid JSON only, no markdown`

export async function POST(req: NextRequest) {
  const { message, history } = await req.json()

  const messages = [
    ...(history || []).slice(-6).map((m: any) => ({
      role: m.role === 'agent' ? 'assistant' : 'user',
      content: m.content
    })),
    { role: 'user', content: message }
  ]

  const res = await fetch('https://api.freemodel.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${FREEMODEL_KEY}`
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      system: SYSTEM_PROMPT,
      messages,
      max_tokens: 500
    })
  })

  const data = await res.json()
  const text = data.choices?.[0]?.message?.content || '{}'

  try {
    const intent = JSON.parse(text)
    return NextResponse.json({ intent })
  } catch {
    return NextResponse.json({ intent: { action: 'unknown', params: { message: text }, confirmation: text, error: null } })
  }
}
```

---

### Task 5: API route `/api/agent/execute`

**Files:**
- Create: `app/api/agent/execute/route.ts`

Executes the confirmed intent on-chain using viem + user's wallet (via Privy server-side signing is not possible — execution happens client-side).

This route just validates and returns the tx calldata:

```ts
import { NextRequest, NextResponse } from 'next/server'
import { encodeFunctionData, parseUnits } from 'viem'

const XYLO_ROUTER = '0x73742278' as `0x${string}` // placeholder, use actual
const USDC = '0x3600000000000000000000000000000000000001' as `0x${string}`
const EURC = '0x89B5000000000000000000000000000000000001' as `0x${string}`

const ERC20_ABI = [
  { name: 'transfer', type: 'function', stateMutability: 'nonpayable',
    inputs: [{ name: 'to', type: 'address' }, { name: 'amount', type: 'uint256' }],
    outputs: [{ name: '', type: 'bool' }] }
] as const

export async function POST(req: NextRequest) {
  const { intent } = await req.json()

  if (intent.action === 'send') {
    const { to, token, amount } = intent.params
    const tokenAddr = token === 'USDC' ? USDC : EURC
    const amountWei = parseUnits(amount, 6)
    const data = encodeFunctionData({ abi: ERC20_ABI, functionName: 'transfer', args: [to, amountWei] })
    return NextResponse.json({ to: tokenAddr, data, value: '0' })
  }

  return NextResponse.json({ error: 'Action not yet supported' }, { status: 400 })
}
```

---

### Task 6: Wire AgentChat to API + execute tx client-side

**Files:**
- Modify: `components/AgentChat.tsx`

Replace the `sendMessage` TODO with real API call + Privy wallet execution:

```ts
const sendMessage = async () => {
  if (!input.trim() || loading) return
  const userMsg = input.trim()
  setInput('')
  const newMessages = [...messages, { role: 'user' as const, content: userMsg }]
  setMessages(newMessages)
  setLoading(true)

  try {
    // 1. Parse intent
    const res = await fetch('/api/agent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userMsg, history: messages })
    })
    const { intent } = await res.json()

    if (intent.error) {
      setMessages(prev => [...prev, { role: 'agent', content: intent.error }])
      setLoading(false)
      return
    }

    if (intent.action === 'unknown') {
      setMessages(prev => [...prev, { role: 'agent', content: intent.params.message || 'I didn\'t understand that. Try: "Swap 10 USDC to EURC"' }])
      setLoading(false)
      return
    }

    if (intent.action === 'balance') {
      setMessages(prev => [...prev, { role: 'agent', content: `Your USDC balance will be shown in the wallet panel on the right.` }])
      setLoading(false)
      return
    }

    // 2. Show confirmation
    setPendingIntent(intent)
    setMessages(prev => [...prev, {
      role: 'agent',
      content: `${intent.confirmation}\n\nReply **confirm** to execute or **cancel** to abort.`
    }])
  } catch (e) {
    setMessages(prev => [...prev, { role: 'agent', content: 'Something went wrong. Please try again.' }])
  }
  setLoading(false)
}
```

Add `pendingIntent` state and handle "confirm"/"cancel" replies to execute via Privy `sendTransaction`.

---

## Phase 3: Onchain Execution

### Task 7: Execute swap via XyloRouter

**Files:**
- Modify: `components/AgentChat.tsx`

Add swap execution using XyloRouter (same as SwapCard.tsx logic):

```ts
// When user confirms swap intent:
const wallet = wallets[0]
const provider = await wallet.getEthereumProvider()

// Approve USDC first
const approveTx = await provider.request({
  method: 'eth_sendTransaction',
  params: [{ from: wallet.address, to: USDC, data: approveCalldata }]
})

// Then swap
const swapTx = await provider.request({
  method: 'eth_sendTransaction',
  params: [{ from: wallet.address, to: XYLO_ROUTER, data: swapCalldata }]
})

setMessages(prev => [...prev, {
  role: 'agent',
  content: `✅ Swap executed!`,
  txHash: swapTx
}])
```

---

### Task 8: Execute send via ERC20 transfer

Same pattern as swap but simpler — direct ERC20 transfer.

---

## Phase 4: Navigation + Polish

### Task 9: Add Agent to Header nav

**Files:**
- Modify: `components/Header.tsx`

Add `/agent` to nav links with Bot icon.

### Task 10: Add Agent card to homepage

**Files:**
- Modify: `app/page.tsx`

Add Agent to QUICK_ACTIONS array:
```ts
{ href: '/agent', Icon: Bot, label: 'Agent', desc: 'AI-powered executor', color: 'from-white/15 to-white/8' }
```

### Task 11: Build + deploy

```bash
npm run build
vercel --prod
```

---

## Summary

| Phase | Tasks | Output |
|-------|-------|--------|
| 1 | 1-3 | UI skeleton, wallet panel, chat UI |
| 2 | 4-6 | LLM parsing, intent confirmation flow |
| 3 | 7-8 | Onchain execution (swap + send) |
| 4 | 9-11 | Nav, homepage, deploy |

**MVP scope:** swap + send via natural language chat. Bridge bisa ditambah setelah MVP.

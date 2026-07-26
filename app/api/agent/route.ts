import { NextRequest, NextResponse } from 'next/server'

const AI_KEY = process.env.FREEMODEL_API_KEY || process.env.MISTRAL_API_KEY || ''

const SYSTEM_PROMPT = `You are Arc Agent, an AI that helps users execute onchain transactions on Arc Network (a stablecoin-native L1 blockchain by Circle).

Parse the user's message and return ONLY a valid JSON object with this exact structure:
{
  "action": "swap" | "send" | "bridge" | "balance" | "unknown",
  "params": {
    // for swap: { "fromToken": "USDC" or "EURC", "toToken": "USDC" or "EURC", "amount": "10" }
    // for send: { "to": "0x...", "token": "USDC" or "EURC", "amount": "5" }
    // for bridge: { "fromChain": "Base" or "Ethereum" or "Arbitrum", "toChain": "Arc", "token": "USDC", "amount": "20" }
    // for balance: {}
    // for unknown: { "message": "clarification question" }
  },
  "confirmation": "Human readable summary of what will happen",
  "error": null
}

Rules:
- Only support USDC and EURC tokens on Arc Network
- Amount must be a positive number string
- For send action, the "to" address must start with 0x and be 42 characters
- If address is missing or invalid for send, set action to "unknown" and ask for the address
- If amount is missing, set action to "unknown" and ask for the amount
- For bridge, only support bridging TO Arc Network
- Always respond with valid JSON only — no markdown, no explanation, no code blocks
- Keep confirmation message concise and clear`

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json()

    if (typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ error: 'message required' }, { status: 400 })
    }

    if (!AI_KEY) {
      return NextResponse.json(
        { error: 'AI agent is not configured. Set MISTRAL_API_KEY or FREEMODEL_API_KEY.' },
        { status: 503 }
      )
    }

    const messages = [
      ...(Array.isArray(history) ? history : []).slice(-6).map((m: any) => ({
        role: m.role === 'agent' ? 'assistant' : 'user',
        content: m.content
      })),
      { role: 'user', content: message }
    ]

    // Use Mistral (reliable, free) — fallback to FreeModel if key set
    const useMistral = !!process.env.MISTRAL_API_KEY
    const apiUrl = useMistral
      ? 'https://api.mistral.ai/v1/chat/completions'
      : 'https://api.freemodel.dev/v1/chat/completions'
    const model = useMistral ? 'mistral-small-latest' : 'claude-haiku-4-5-20251001'

    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_KEY}`
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages
        ],
        max_tokens: 500,
        temperature: 0.1,
        response_format: useMistral ? { type: 'json_object' } : undefined,
      })
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('AI API error:', err)
      return NextResponse.json({ error: 'AI service unavailable. Please try again.' }, { status: 503 })
    }

    const data = await res.json()
    const text = data.choices?.[0]?.message?.content?.trim() || '{}'

    // Strip markdown code blocks if present
    const cleaned = text.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim()

    try {
      const intent = JSON.parse(cleaned)
      return NextResponse.json({ intent })
    } catch {
      // If JSON parse fails, return as unknown
      return NextResponse.json({
        intent: {
          action: 'unknown',
          params: { message: text },
          confirmation: '',
          error: null
        }
      })
    }
  } catch (e: any) {
    console.error('Agent API error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

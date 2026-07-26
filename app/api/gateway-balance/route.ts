import { NextRequest, NextResponse } from 'next/server'
import { AppKit } from '@circle-fin/app-kit'

const kit = new AppKit()
const EVM_ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get('address')
  if (!address) {
    return NextResponse.json({ error: 'address required' }, { status: 400 })
  }
  if (!EVM_ADDRESS_RE.test(address)) {
    return NextResponse.json({ error: 'valid EVM address required' }, { status: 400 })
  }

  try {
    const result = await kit.unifiedBalance.getBalances({
      token: 'USDC',
      sources: { address: address as `0x${string}` },
      networkType: 'testnet',
      includePending: false,
    })
    return NextResponse.json(result)
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

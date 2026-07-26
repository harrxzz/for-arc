import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export function GET() {
  return NextResponse.json({
    ok: true,
    service: 'for-arc',
    network: 'arc-testnet',
    timestamp: new Date().toISOString(),
  })
}

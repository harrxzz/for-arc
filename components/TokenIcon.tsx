'use client'

import Image from 'next/image'

const TOKEN_ICONS: Record<string, string> = {
  USDC:  '/tokens/usdc.png',
  EURC:  '/tokens/eurc.png',
  USDT:  '/tokens/usdt.png',
  WUSDC: '/tokens/wusdc.svg',
}

interface TokenIconProps {
  symbol: string
  size?: number
  className?: string
}

export function TokenIcon({ symbol, size = 24, className = '' }: TokenIconProps) {
  const src = TOKEN_ICONS[symbol]

  if (src) {
    return (
      <Image
        src={src}
        alt={symbol}
        width={size}
        height={size}
        className={`rounded-full ${className}`}
      />
    )
  }

  // Fallback: colored circle with letter
  const colors: Record<string, string> = {
    default: '#6366f1',
  }
  const bg = colors[symbol] ?? colors.default

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="12" fill={bg} />
      <text
        x="12" y="16"
        textAnchor="middle"
        fontSize="10"
        fontWeight="bold"
        fill="white"
        fontFamily="system-ui"
      >
        {symbol[0]}
      </text>
    </svg>
  )
}

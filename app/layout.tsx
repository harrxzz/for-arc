import type { Metadata } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import './globals.css'
import { Web3Provider } from '@/components/Web3Provider'
import { ThemeProvider } from '@/components/ThemeProvider'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-display' })

export const metadata: Metadata = {
  title: 'For Arc — Swap, Bridge & Send USDC on Arc Network',
  description: 'The DeFi hub for Arc Network. Swap on XyloNet DEX, bridge USDC via Circle CCTP, send instant transfers, and manage unified balances — all with USDC as gas. No ETH needed.',
  keywords: ['Arc Network', 'Circle', 'USDC', 'DeFi', 'bridge', 'swap', 'CCTP', 'XyloNet', 'stablecoin', 'gas'],
  authors: [{ name: 'For Arc' }],
  openGraph: {
    title: 'For Arc — DeFi Hub for Arc Network',
    description: 'Swap, bridge, send, and unify USDC across chains. Powered by Circle — pay gas in USDC, no ETH needed.',
    url: 'https://for-arc.vercel.app',
    siteName: 'For Arc',
    type: 'website',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'For Arc — DeFi Hub for Arc Network' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'For Arc — DeFi Hub for Arc Network',
    description: 'Swap, bridge, send, and unify USDC across chains. Powered by Circle.',
    images: ['/og.png'],
  },
  metadataBase: new URL('https://for-arc.vercel.app'),
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${spaceGrotesk.variable}`}>
        <ThemeProvider>
          <Web3Provider>
            {children}
          </Web3Provider>
        </ThemeProvider>
      </body>
    </html>
  )
}

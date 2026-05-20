import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Web3Provider } from '@/components/Web3Provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'For Arc — Swap & Bridge USDC on Arc Network',
  description: 'The easiest way to swap and bridge USDC on Arc Network. Fast, cheap, and secure.',
  openGraph: {
    title: 'For Arc',
    description: 'Swap & Bridge USDC on Arc Network',
    url: 'https://forarc.vercel.app',
    siteName: 'For Arc',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Web3Provider>
          {children}
        </Web3Provider>
      </body>
    </html>
  )
}

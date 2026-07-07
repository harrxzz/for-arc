import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Web3Provider } from '@/components/Web3Provider'
import { ThemeProvider } from '@/components/ThemeProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'For Arc — Swap & Bridge USDC on Arc Network',
  description: 'The easiest way to swap and bridge USDC on Arc Network. Fast, cheap, and secure.',
  openGraph: {
    title: 'For Arc',
    description: 'Swap & Bridge USDC on Arc Network',
    url: 'https://for-arc.vercel.app',
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
        <ThemeProvider>
          <Web3Provider>
            {children}
          </Web3Provider>
        </ThemeProvider>
      </body>
    </html>
  )
}

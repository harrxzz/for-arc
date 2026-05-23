'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { ChevronDown } from 'lucide-react'
import { useTheme } from '@/components/ThemeProvider'

export function Header() {
  const pathname = usePathname()
  const { ready, authenticated, login, logout } = usePrivy()
  const { wallets } = useWallets()
  const { theme } = useTheme()

  const activeWallet = wallets?.[0]
  const address = activeWallet?.address
  const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : null

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/swap', label: 'Swap' },
    { href: '/bridge', label: 'Bridge' },
    { href: '/send', label: 'Send' },
    { href: '/unified-balance', label: 'Gateway' },
    { href: '/agent', label: 'Agent' },
  ]

  const isDark = theme === 'dark'

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-arc-light focus:text-white focus:rounded-lg focus:text-sm focus:font-medium"
      >
        Skip to main content
      </a>

      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className={`fixed top-0 left-0 right-0 z-50 border-b transition-colors ${
          isDark
            ? 'bg-[#000000]/80 border-white/6 backdrop-blur-2xl'
            : 'bg-white/80 border-slate-200/60 backdrop-blur-2xl'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0" aria-label="For Arc — home">
            <motion.div whileHover={{ scale: 1.05 }} transition={{ type: 'spring', stiffness: 400 }}>
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-arc-light to-arc-light flex items-center justify-center shadow-lg shadow-arc-light/25">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <path d="M2 14 C2 7 16 7 16 14" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                  <line x1="2" y1="14" x2="2" y2="17" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="16" y1="14" x2="16" y2="17" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="9" cy="7" r="1.5" fill="rgba(255,255,255,0.6)"/>
                </svg>
              </div>
            </motion.div>
            <span className={`font-bold text-base tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              For Arc
            </span>
          </Link>

          {/* Nav */}
          <nav aria-label="Main navigation" className="hidden sm:flex items-center gap-0.5">
            {navLinks.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={`relative px-3.5 py-2 rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-arc-light ${
                    isActive
                      ? isDark ? 'text-arc-light' : 'text-arc-light'
                      : isDark
                      ? 'text-slate-400 hover:text-white'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className={`absolute inset-0 rounded-xl -z-10 ${isDark ? 'bg-arc-light/12' : 'bg-white/5'}`}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  {link.label}
                </Link>
              )
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Arc badge */}
            <div
              aria-label="Connected to Arc Testnet"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full badge-live"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-arc-light animate-pulse" aria-hidden="true" />
              <span className="text-xs text-arc-light font-medium">Arc Testnet</span>
            </div>

            {/* Wallet */}
            {ready && (
              <>
                {authenticated && shortAddress ? (
                  <div className="flex items-center gap-1.5">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono border cursor-default ${
                        isDark
                          ? 'bg-arc-light/10 border-arc-light/20 text-arc-light'
                          : 'bg-white/5 border-arc-light text-arc-light'
                      }`}
                      aria-label={`Connected wallet: ${address}`}
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      {shortAddress}
                    </motion.div>
                    <motion.button
                      onClick={logout}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`px-2.5 py-1.5 text-xs rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-arc-light ${
                        isDark ? 'text-slate-500 hover:text-red-400 hover:bg-red-500/8' : 'text-slate-400 hover:text-red-500 hover:bg-red-50'
                      }`}
                    >
                      <ChevronDown size={13} />
                    </motion.button>
                  </div>
                ) : (
                  <motion.button
                    onClick={login}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-2 glass-btn-primary text-white text-sm font-semibold rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-arc-light focus-visible:ring-offset-2"
                  >
                    Connect
                  </motion.button>
                )}
              </>
            )}
          </div>
        </div>
      </motion.header>
    </>
  )
}

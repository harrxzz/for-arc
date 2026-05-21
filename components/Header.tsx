'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '@/components/ThemeProvider'

export function Header() {
  const pathname = usePathname()
  const { ready, authenticated, login, logout } = usePrivy()
  const { wallets } = useWallets()
  const { theme, toggleTheme } = useTheme()

  const activeWallet = wallets?.[0]
  const address = activeWallet?.address
  const shortAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : null

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/swap', label: 'Swap' },
    { href: '/bridge', label: 'Bridge' },
  ]

  const isDark = theme === 'dark'

  return (
    <>
      {/* Skip to main content — accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-blue-700 focus:text-white focus:rounded-lg focus:text-sm focus:font-medium"
      >
        Skip to main content
      </a>

      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b transition-colors ${
          isDark
            ? 'bg-[#0a0a0f]/80 border-white/10'
            : 'bg-white/80 border-blue-100'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group" aria-label="For Arc — home">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 400 }}
              className="flex items-center gap-2"
            >
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <rect width="32" height="32" rx="9" fill="url(#grad)"/>
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#3b82f6"/>
                    <stop offset="100%" stopColor="#1d4ed8"/>
                  </linearGradient>
                </defs>
                <path d="M6 23 C6 13 26 13 26 23" stroke="white" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
                <line x1="6" y1="23" x2="6" y2="27" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                <line x1="26" y1="23" x2="26" y2="27" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                <circle cx="16" cy="13" r="2" fill="rgba(255,255,255,0.5)"/>
              </svg>
              <span className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>For Arc</span>
            </motion.div>
          </Link>

          {/* Nav */}
          <nav aria-label="Main navigation" className="flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                    isActive
                      ? 'text-blue-500'
                      : isDark
                      ? 'text-slate-400 hover:text-white'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <motion.span
                    className="relative z-10"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {link.label}
                  </motion.span>
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className={`absolute inset-0 rounded-lg -z-10 ${isDark ? 'bg-white/10' : 'bg-blue-50'}`}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Arc badge */}
            <div
              aria-label="Connected to Arc Testnet"
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${
                isDark
                  ? 'bg-blue-500/10 border-blue-500/20'
                  : 'bg-blue-50 border-blue-200'
              }`}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" aria-hidden="true" />
              <span className="text-xs text-blue-500 font-medium">Arc Testnet</span>
            </div>

            {/* Theme toggle */}
            <motion.button
              onClick={toggleTheme}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                isDark
                  ? 'bg-white/10 hover:bg-white/20 text-yellow-400'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark
                ? <Sun size={16} aria-hidden="true" />
                : <Moon size={16} aria-hidden="true" />
              }
            </motion.button>

            {/* Wallet */}
            {ready && (
              <>
                {authenticated && shortAddress ? (
                  <div className="flex items-center gap-2">
                    <motion.div
                      className={`px-3 py-1.5 rounded-full text-xs font-mono border ${
                        isDark
                          ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                          : 'bg-blue-50 border-blue-200 text-blue-700'
                      }`}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      aria-label={`Connected wallet: ${address}`}
                    >
                      {shortAddress}
                    </motion.div>
                    <motion.button
                      onClick={logout}
                      className={`px-3 py-1.5 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded ${
                        isDark ? 'text-slate-400 hover:text-red-400' : 'text-slate-500 hover:text-red-500'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Disconnect
                    </motion.button>
                  </div>
                ) : (
                  <motion.button
                    onClick={login}
                    className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-sm font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Connect Wallet
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

'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { Sun, Moon, ChevronDown } from 'lucide-react'
import { useTheme } from '@/components/ThemeProvider'

export function Header() {
  const pathname = usePathname()
  const { ready, authenticated, login, logout } = usePrivy()
  const { wallets } = useWallets()
  const { theme, toggleTheme } = useTheme()

  const activeWallet = wallets?.[0]
  const address = activeWallet?.address
  const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : null

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/swap', label: 'Swap' },
    { href: '/bridge', label: 'Bridge' },
    { href: '/send', label: 'Send' },
    { href: '/unified-balance', label: 'Gateway' },
  ]

  const isDark = theme === 'dark'

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-indigo-600 focus:text-white focus:rounded-lg focus:text-sm focus:font-medium"
      >
        Skip to main content
      </a>

      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className={`fixed top-0 left-0 right-0 z-50 border-b transition-colors ${
          isDark
            ? 'bg-[#07071a]/80 border-white/6 backdrop-blur-2xl'
            : 'bg-white/80 border-slate-200/60 backdrop-blur-2xl'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0" aria-label="For Arc — home">
            <motion.div whileHover={{ scale: 1.05 }} transition={{ type: 'spring', stiffness: 400 }}>
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
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
                  className={`relative px-3.5 py-2 rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                    isActive
                      ? isDark ? 'text-indigo-300' : 'text-indigo-600'
                      : isDark
                      ? 'text-slate-400 hover:text-white'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className={`absolute inset-0 rounded-xl -z-10 ${isDark ? 'bg-indigo-500/12' : 'bg-indigo-50'}`}
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
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" aria-hidden="true" />
              <span className="text-xs text-indigo-300 font-medium">Arc Testnet</span>
            </div>

            {/* Theme toggle */}
            <motion.button
              onClick={toggleTheme}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                isDark
                  ? 'bg-white/6 hover:bg-white/12 text-yellow-400'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun size={15} aria-hidden="true" /> : <Moon size={15} aria-hidden="true" />}
            </motion.button>

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
                          ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300'
                          : 'bg-indigo-50 border-indigo-200 text-indigo-700'
                      }`}
                      aria-label={`Connected wallet: ${address}`}
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                      {shortAddress}
                    </motion.div>
                    <motion.button
                      onClick={logout}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`px-2.5 py-1.5 text-xs rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
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
                    className="px-4 py-2 glass-btn-primary text-white text-sm font-semibold rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
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

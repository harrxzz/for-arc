'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { usePrivy, useWallets } from '@privy-io/react-auth'

export function Header() {
  const pathname = usePathname()
  const { ready, authenticated, login, logout } = usePrivy()
  const { wallets } = useWallets()

  const activeWallet = wallets?.[0]
  const address = activeWallet?.address
  const shortAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : null

  const navLinks = [
    { href: '/', label: 'Swap' },
    { href: '/bridge', label: 'Bridge' },
  ]

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-blue-100"
    >
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 400 }}
            className="flex items-center gap-2"
          >
            {/* Arc shape logo */}
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Background — gradient rounded square */}
              <rect width="32" height="32" rx="9" fill="url(#grad)"/>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#3b82f6"/>
                  <stop offset="100%" stopColor="#1d4ed8"/>
                </linearGradient>
              </defs>
              {/* Bold arc — thick, centered, clear bridge shape */}
              <path
                d="M6 23 C6 13 26 13 26 23"
                stroke="white"
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
              />
              {/* Left pillar */}
              <line x1="6" y1="23" x2="6" y2="27" stroke="white" strokeWidth="3" strokeLinecap="round"/>
              {/* Right pillar */}
              <line x1="26" y1="23" x2="26" y2="27" stroke="white" strokeWidth="3" strokeLinecap="round"/>
              {/* Subtle glow dot at top of arc */}
              <circle cx="16" cy="13" r="2" fill="rgba(255,255,255,0.5)"/>
            </svg>
            <span className="font-bold text-slate-900 text-lg">For Arc</span>
          </motion.div>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link key={link.href} href={link.href}>
                <motion.div
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors relative ${
                    isActive
                      ? 'text-blue-700'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {link.label}
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute inset-0 bg-blue-50 rounded-lg -z-10"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </motion.div>
              </Link>
            )
          })}
        </nav>

        {/* Wallet button */}
        <div className="flex items-center gap-2">
          {/* Arc badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-xs text-blue-700 font-medium">Arc Testnet</span>
          </div>

          {ready && (
            <>
              {authenticated && shortAddress ? (
                <div className="flex items-center gap-2">
                  <motion.div
                    className="px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full text-xs font-mono text-blue-700"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    {shortAddress}
                  </motion.div>
                  <motion.button
                    onClick={logout}
                    className="px-3 py-1.5 text-xs text-slate-500 hover:text-red-500 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Disconnect
                  </motion.button>
                </div>
              ) : (
                <motion.button
                  onClick={login}
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-sm font-medium rounded-lg transition-colors"
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
  )
}

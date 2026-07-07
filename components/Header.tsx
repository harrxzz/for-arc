'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { ChevronDown, Menu, X } from 'lucide-react'
import { useTheme } from '@/components/ThemeProvider'

export function Header() {
  const pathname = usePathname()
  const { ready, authenticated, login, logout } = usePrivy()
  const { wallets } = useWallets()
  const { theme } = useTheme()

  const activeWallet = wallets?.[0]
  const address = activeWallet?.address
  const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : null

  const [mobileOpen, setMobileOpen] = useState(false)

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
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-arc-violet focus:text-white focus:rounded-lg focus:text-sm focus:font-medium"
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
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-arc-violet to-arc-violet/80 flex items-center justify-center shadow-lg shadow-arc-violet/25">
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

          {/* Desktop Nav */}
          <nav aria-label="Main navigation" className="hidden md:flex items-center gap-0.5">
            {navLinks.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={`relative px-3.5 py-2 rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-arc-violet ${
                    isActive
                      ? 'text-white'
                      : isDark
                      ? 'text-slate-400 hover:text-white'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute inset-0 rounded-xl -z-10 bg-arc-violet/15"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{link.label}</span>
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
              <div className="w-1.5 h-1.5 rounded-full bg-arc-violet animate-pulse" aria-hidden="true" />
              <span className="text-xs text-arc-violet font-medium">Arc Testnet</span>
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
                          ? 'bg-arc-violet/10 border-arc-violet/20 text-arc-violet'
                          : 'bg-white/5 border-arc-violet text-arc-violet'
                      }`}
                      aria-label={`Connected wallet: ${address}`}
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-arc-violet" />
                      {shortAddress}
                    </motion.div>
                    <motion.button
                      onClick={logout}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`px-2.5 py-1.5 text-xs rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-arc-violet ${
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
                    className="px-4 py-2 glass-btn-primary text-white text-sm font-semibold rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-arc-violet focus-visible:ring-offset-2"
                  >
                    Connect
                  </motion.button>
                )}
              </>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={`md:hidden p-2 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-arc-violet ${
                isDark ? 'text-white hover:bg-white/10' : 'text-slate-900 hover:bg-slate-100'
              }`}
              aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Nav Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />

            {/* Drawer */}
            <motion.nav
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={`fixed top-16 right-0 bottom-0 z-50 w-72 md:hidden ${
                isDark ? 'bg-[#0a0a0e] border-l border-white/10' : 'bg-white border-l border-slate-200'
              }`}
              aria-label="Mobile navigation"
            >
              <div className="p-4 pt-6 flex flex-col gap-1">
                {navLinks.map((link, i) => {
                  const isActive = pathname === link.href
                  return (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Link
                        href={link.href}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                          isActive
                            ? 'bg-arc-violet/12 text-white'
                            : isDark
                            ? 'text-slate-400 hover:text-white hover:bg-white/5'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                      >
                        {isActive && (
                          <div className="w-1.5 h-1.5 rounded-full bg-arc-violet flex-shrink-0" />
                        )}
                        <span className={!isActive ? 'ml-[10px]' : ''}>{link.label}</span>
                      </Link>
                    </motion.div>
                  )
                })}
              </div>

              {/* Mobile footer */}
              <div className={`absolute bottom-0 left-0 right-0 p-4 border-t ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                  <div className="w-2 h-2 rounded-full bg-arc-violet animate-pulse" />
                  <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Arc Testnet</span>
                </div>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

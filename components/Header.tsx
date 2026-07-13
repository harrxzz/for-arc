'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { ChevronDown, Menu, X } from 'lucide-react'

export function Header() {
  const pathname = usePathname()
  const { ready, authenticated, login, logout } = usePrivy()
  const { wallets } = useWallets()

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

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-indigo-500 focus:text-white focus:rounded-lg focus:text-sm focus:font-medium"
      >
        Skip to main content
      </a>

      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#09090b]/80 backdrop-blur-xl"
      >
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0" aria-label="For Arc — home">
            <motion.div whileHover={{ scale: 1.05 }} transition={{ type: 'spring', stiffness: 400 }}>
              <div className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <path d="M2 14 C2 7 16 7 16 14" stroke="#a5a8f0" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                  <line x1="2" y1="14" x2="2" y2="17" stroke="#a5a8f0" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="16" y1="14" x2="16" y2="17" stroke="#a5a8f0" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="9" cy="7" r="1.5" fill="rgba(165,168,240,0.6)"/>
                </svg>
              </div>
            </motion.div>
            <span className="font-display font-semibold text-base tracking-tight text-white" style={{ letterSpacing: '-0.02em' }}>
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
                  className={`relative px-3.5 py-2 rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                    isActive
                      ? 'text-white bg-white/5'
                      : 'text-white/50 hover:text-white'
                  }`}
                >
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
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/8"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 pulse-dot" aria-hidden="true" />
              <span className="text-xs text-white/60 font-medium">Arc Testnet</span>
            </div>

            {/* Wallet */}
            {ready && (
              <>
                {authenticated && shortAddress ? (
                  <div className="flex items-center gap-1.5">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono border bg-indigo-500/10 border-indigo-500/20 text-indigo-300"
                      aria-label={`Connected wallet: ${address}`}
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                      {shortAddress}
                    </motion.div>
                    <motion.button
                      onClick={logout}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-2.5 py-1.5 text-xs rounded-full text-white/40 hover:text-red-400 hover:bg-red-500/5 transition-colors"
                    >
                      <ChevronDown size={13} />
                    </motion.button>
                  </div>
                ) : (
                  <motion.button
                    onClick={login}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="nb-btn-primary px-5 py-2 text-sm font-medium"
                  >
                    Connect
                  </motion.button>
                )}
              </>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-full text-white hover:bg-white/5 transition-colors"
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
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />

            <motion.nav
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed top-16 right-0 bottom-0 z-50 w-72 md:hidden bg-[#09090b] border-l border-white/8"
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
                        className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
                          isActive
                            ? 'bg-white/5 text-white'
                            : 'text-white/50 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {isActive && <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0" />}
                        <span className={!isActive ? 'ml-[10px]' : ''}>{link.label}</span>
                      </Link>
                    </motion.div>
                  )
                })}
              </div>

              {/* Mobile footer */}
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/8">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5">
                  <div className="w-2 h-2 rounded-full bg-indigo-400 pulse-dot" />
                  <span className="text-xs text-white/50">Arc Testnet</span>
                </div>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

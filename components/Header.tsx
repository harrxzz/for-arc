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
  const [walletMenuOpen, setWalletMenuOpen] = useState(false)

  const handleLogout = () => {
    setWalletMenuOpen(false)
    logout()
  }

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
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-[color:var(--arc-community-blue)] focus:text-white focus:rounded-lg focus:text-sm focus:font-medium"
      >
        Skip to main content
      </a>

      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="fixed top-0 left-0 right-0 z-50 border-b border-white/8 bg-[rgba(30,29,41,0.78)] backdrop-blur-2xl shadow-[0_18px_70px_rgba(0,0,0,0.28)]"
      >
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0" aria-label="For Arc — home">
            <motion.div whileHover={{ scale: 1.05 }} transition={{ type: 'spring', stiffness: 400 }}>
              <div className="w-8 h-8 rounded-xl bg-[rgba(47,87,140,0.24)] border border-[rgba(47,87,140,0.42)] flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <path d="M2 14 C2 7 16 7 16 14" stroke="#cfd8e6" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                  <line x1="2" y1="14" x2="2" y2="17" stroke="#cfd8e6" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="16" y1="14" x2="16" y2="17" stroke="#cfd8e6" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="9" cy="7" r="1.5" fill="rgba(255,140,0,0.72)"/>
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
                  className={`relative px-3.5 py-2 rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--arc-community-orange)] ${
                    isActive
                      ? 'text-[var(--arc-community-paper)] bg-[rgba(47,87,140,0.34)] border border-[rgba(247,247,247,0.12)]'
                      : 'text-[rgba(247,247,247,0.56)] hover:text-[var(--arc-community-paper)]'
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
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[rgba(47,87,140,0.18)] border border-[rgba(247,247,247,0.12)]"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-[color:var(--arc-community-orange)] pulse-dot" aria-hidden="true" />
              <span className="text-xs text-[rgba(247,247,247,0.68)] font-medium">Arc Testnet</span>
            </div>

            {/* Wallet */}
            {ready && (
              <>
                {authenticated && shortAddress ? (
                  <div className="relative flex items-center gap-1.5">
                    <motion.button
                      type="button"
                      onClick={() => setWalletMenuOpen((open) => !open)}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className="group flex items-center gap-2 rounded-full border border-[rgba(47,87,140,0.42)] bg-[rgba(47,87,140,0.20)] px-3 py-1.5 text-xs font-mono text-[#dce5f2] transition-colors hover:border-[rgba(247,247,247,0.18)] hover:bg-[rgba(47,87,140,0.28)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--arc-community-orange)]"
                      aria-label={`Wallet menu for ${address}`}
                      aria-haspopup="menu"
                      aria-expanded={walletMenuOpen}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--arc-community-orange)]" aria-hidden="true" />
                      <span>{shortAddress}</span>
                      <ChevronDown
                        size={13}
                        className={`text-white/42 transition-transform ${walletMenuOpen ? 'rotate-180' : ''}`}
                        aria-hidden="true"
                      />
                    </motion.button>

                    <AnimatePresence>
                      {walletMenuOpen && (
                        <>
                          <button
                            type="button"
                            className="fixed inset-0 z-40 cursor-default bg-transparent"
                            aria-label="Close wallet menu"
                            onClick={() => setWalletMenuOpen(false)}
                          />
                          <motion.div
                            role="menu"
                            initial={{ opacity: 0, y: -6, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -6, scale: 0.98 }}
                            transition={{ duration: 0.16 }}
                            className="absolute right-0 top-[calc(100%+10px)] z-50 w-64 overflow-hidden rounded-2xl border border-white/10 bg-[rgba(18,24,38,0.96)] p-2 text-left shadow-[0_22px_70px_rgba(0,0,0,0.42)] backdrop-blur-2xl"
                          >
                            <div className="px-3 py-2">
                              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/38">Connected wallet</p>
                              <p className="mt-1 truncate font-mono text-xs text-white/82" title={address}>{address}</p>
                              <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-[rgba(247,247,247,0.10)] bg-white/[0.04] px-2 py-1 text-[11px] font-medium text-white/58">
                                <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--arc-community-orange)]" />
                                Arc Testnet
                              </div>
                            </div>
                            <div className="my-1 h-px bg-white/8" />
                            <button
                              type="button"
                              role="menuitem"
                              onClick={handleLogout}
                              className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-medium text-red-300 transition-colors hover:bg-red-500/10 hover:text-red-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/60"
                            >
                              <span>Disconnect wallet</span>
                              <span className="text-xs text-red-300/55">sign out</span>
                            </button>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
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
              className="fixed top-16 right-0 bottom-0 z-50 w-72 md:hidden bg-[color:var(--arc-community-ink)] border-l border-white/8"
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
                        {isActive && <div className="w-1.5 h-1.5 rounded-full bg-[color:var(--arc-community-orange)] flex-shrink-0" />}
                        <span className={!isActive ? 'ml-[10px]' : ''}>{link.label}</span>
                      </Link>
                    </motion.div>
                  )
                })}
              </div>

              {/* Mobile footer */}
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/8">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5">
                  <div className="w-2 h-2 rounded-full bg-[color:var(--arc-community-orange)] pulse-dot" />
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

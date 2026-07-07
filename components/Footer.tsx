'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useTheme } from '@/components/ThemeProvider'

export function Footer() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className={`relative z-10 border-t mt-20 transition-colors ${
        isDark
          ? 'bg-[#000000]/80 border-white/10 backdrop-blur-md'
          : 'bg-white/80 border-white/8 backdrop-blur-md'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="32" height="32" rx="9" fill="url(#grad2)"/>
              <defs>
                <linearGradient id="grad2" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#9F72FF"/>
                  <stop offset="100%" stopColor="#7C4DFF"/>
                </linearGradient>
              </defs>
              <path d="M6 23 C6 13 26 13 26 23" stroke="white" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
              <line x1="6" y1="23" x2="6" y2="27" stroke="white" strokeWidth="3" strokeLinecap="round"/>
              <line x1="26" y1="23" x2="26" y2="27" stroke="white" strokeWidth="3" strokeLinecap="round"/>
              <circle cx="16" cy="13" r="2" fill="rgba(255,255,255,0.5)"/>
            </svg>
            <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>For Arc</span>
            <span className={isDark ? 'text-white/20' : 'text-slate-300'}>·</span>
            <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Built on Arc Network</span>
          </div>

          <div className="flex items-center gap-6">
            {[
              { href: 'https://docs.arc.network', label: 'Docs' },
              { href: 'https://testnet.arcscan.app', label: 'Explorer' },
              { href: 'https://faucet.circle.com', label: 'Faucet' },
              { href: 'https://community.arc.network', label: 'Community' },
            ].map(link => (
              <Link
                key={link.label}
                href={link.href}
                target="_blank"
                className={`text-xs transition-colors ${
                  isDark
                    ? 'text-slate-500 hover:text-arc-violet'
                    : 'text-slate-400 hover:text-arc-violet'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className={`text-xs ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
            © 2026 For Arc. All rights reserved.
          </div>
        </div>
      </div>
    </motion.footer>
  )
}

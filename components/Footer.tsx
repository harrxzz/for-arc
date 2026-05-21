'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="relative z-10 border-t border-blue-100 bg-white/80 backdrop-blur-md mt-20"
    >
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="32" height="32" rx="9" fill="url(#grad2)"/>
              <defs>
                <linearGradient id="grad2" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#3b82f6"/>
                  <stop offset="100%" stopColor="#1d4ed8"/>
                </linearGradient>
              </defs>
              <path d="M6 23 C6 13 26 13 26 23" stroke="white" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
              <line x1="6" y1="23" x2="6" y2="27" stroke="white" strokeWidth="3" strokeLinecap="round"/>
              <line x1="26" y1="23" x2="26" y2="27" stroke="white" strokeWidth="3" strokeLinecap="round"/>
              <circle cx="16" cy="13" r="2" fill="rgba(255,255,255,0.5)"/>
            </svg>
            <span className="text-sm font-semibold text-slate-900">For Arc</span>
            <span className="text-slate-300">·</span>
            <span className="text-xs text-slate-400">Built on Arc Network</span>
          </div>

          <div className="flex items-center gap-6">
            <Link
              href="https://docs.arc.network"
              target="_blank"
              className="text-xs text-slate-400 hover:text-blue-700 transition-colors"
            >
              Docs
            </Link>
            <Link
              href="https://testnet.arcscan.app"
              target="_blank"
              className="text-xs text-slate-400 hover:text-blue-700 transition-colors"
            >
              Explorer
            </Link>
            <Link
              href="https://faucet.circle.com"
              target="_blank"
              className="text-xs text-slate-400 hover:text-blue-700 transition-colors"
            >
              Faucet
            </Link>
            <Link
              href="https://community.arc.network"
              target="_blank"
              className="text-xs text-slate-400 hover:text-blue-700 transition-colors"
            >
              Community
            </Link>
          </div>

          <div className="text-xs text-slate-400">
            © 2026 For Arc. All rights reserved.
          </div>
        </div>
      </div>
    </motion.footer>
  )
}

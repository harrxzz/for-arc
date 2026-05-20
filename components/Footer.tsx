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
            <div className="w-6 h-6 rounded-md bg-blue-700 flex items-center justify-center">
              <span className="text-white text-xs font-bold">A</span>
            </div>
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

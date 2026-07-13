'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="relative z-10 border-t border-white/5 mt-20 bg-[#09090b]"
    >
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 14 C2 7 16 7 16 14" stroke="#a5a8f0" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                <line x1="2" y1="14" x2="2" y2="17" stroke="#a5a8f0" strokeWidth="2" strokeLinecap="round"/>
                <line x1="16" y1="14" x2="16" y2="17" stroke="#a5a8f0" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="9" cy="7" r="1.5" fill="rgba(165,168,240,0.6)"/>
              </svg>
            </div>
            <span className="font-display text-sm font-semibold text-white" style={{ letterSpacing: '-0.02em' }}>For Arc</span>
            <span className="text-white/20">·</span>
            <span className="text-xs text-white/40">Built on Arc Network</span>
          </div>

          <div className="flex items-center gap-6">
            {[
              { href: 'https://docs.arc.network', label: 'Docs' },
              { href: 'https://testnet.arcscan.app', label: 'Explorer' },
              { href: 'https://faucet.circle.com', label: 'Faucet' },
              { href: 'https://community.arc.io/home/clubs/architects/overview', label: 'Architects' },
              { href: 'https://discord.gg/arcdao', label: 'Discord' },
            ].map(link => (
              <Link
                key={link.label}
                href={link.href}
                target="_blank"
                className="text-xs text-white/40 hover:text-indigo-400 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="text-xs text-white/30">
            © 2026 For Arc. All rights reserved.
          </div>
        </div>
      </div>
    </motion.footer>
  )
}

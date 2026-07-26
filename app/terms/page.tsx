import type { Metadata } from 'next'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Terms of Use — For Arc',
  description: 'Basic terms for using For Arc, a community-built Arc testnet app for swaps, bridging, sending, balances, and AI-assisted intents.',
  alternates: { canonical: '/terms' },
  openGraph: {
    title: 'Terms of Use — For Arc',
    description: 'Terms for the For Arc community app on Arc testnet.',
    url: '/terms',
  },
}

const sections = [
  {
    title: 'Testnet experience',
    body: 'For Arc is built for Arc testnet and community experimentation. Features may change as Arc, Circle Gateway, CCTP, and XyloNet infrastructure evolves.',
  },
  {
    title: 'Wallet safety',
    body: 'You are responsible for reviewing wallet prompts before signing. For Arc never needs your private key or seed phrase.',
  },
  {
    title: 'Third-party infrastructure',
    body: 'Swap, bridge, send, balance, explorer, authentication, and AI features may rely on external providers. Availability and results depend on those services.',
  },
  {
    title: 'No guarantees',
    body: 'The app is provided as-is for community use. Verify transaction details and network state before relying on any preview or generated intent.',
  },
]

export default function TermsPage() {
  return (
    <div className="min-h-screen relative grain-overlay bg-[color:var(--arc-community-ink)] text-white">
      <div className="fixed inset-0 nb-grid-bg pointer-events-none" aria-hidden="true" />
      <Header />
      <main id="main-content" className="relative z-10 pt-28 pb-16 px-4">
        <section className="max-w-3xl mx-auto">
          <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--arc-community-orange)] mb-4">For Arc legal</p>
          <h1 className="font-display text-4xl sm:text-6xl font-semibold tracking-[-0.04em] mb-5">Terms of Use</h1>
          <p className="text-white/50 leading-relaxed mb-10">
            Basic terms for using the For Arc community app. Last updated: July 2026.
          </p>
          <div className="space-y-4">
            {sections.map((section) => (
              <article key={section.title} className="nb-card rounded-2xl p-6">
                <h2 className="font-display text-xl font-semibold mb-2">{section.title}</h2>
                <p className="text-sm leading-relaxed text-white/55">{section.body}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

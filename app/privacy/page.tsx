import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

const sections = [
  {
    title: 'What we collect',
    body: 'For Arc may process wallet addresses, transaction metadata, and optional authentication details needed to connect wallets, show balances, and run Arc testnet flows.',
  },
  {
    title: 'How data is used',
    body: 'Data is used to provide the app experience: wallet connection, swap/bridge/send previews, unified balance checks, and AI intent parsing when you use the Agent feature.',
  },
  {
    title: 'Third-party services',
    body: 'The app can interact with Arc RPC, ArcScan, Circle infrastructure, Privy, wallet providers, and AI APIs. Those services may process requests under their own policies.',
  },
  {
    title: 'Contact',
    body: 'For Arc is a community-built testnet project. Do not submit secrets or private keys anywhere in the app.',
  },
]

export default function PrivacyPage() {
  return (
    <div className="min-h-screen relative grain-overlay bg-[color:var(--arc-community-ink)] text-white">
      <div className="fixed inset-0 nb-grid-bg pointer-events-none" aria-hidden="true" />
      <Header />
      <main id="main-content" className="relative z-10 pt-28 pb-16 px-4">
        <section className="max-w-3xl mx-auto">
          <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--arc-community-orange)] mb-4">For Arc legal</p>
          <h1 className="font-display text-4xl sm:text-6xl font-semibold tracking-[-0.04em] mb-5">Privacy Policy</h1>
          <p className="text-white/50 leading-relaxed mb-10">
            This policy explains the data surfaces involved when using For Arc. Last updated: July 2026.
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

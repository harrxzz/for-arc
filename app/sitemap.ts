import type { MetadataRoute } from 'next'

const BASE_URL = 'https://for-arc.vercel.app'

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()
  const routes = [
    { path: '', priority: 1.0 },
    { path: '/swap', priority: 0.9 },
    { path: '/bridge', priority: 0.9 },
    { path: '/send', priority: 0.8 },
    { path: '/unified-balance', priority: 0.8 },
    { path: '/agent', priority: 0.7 },
    { path: '/privacy', priority: 0.3 },
    { path: '/terms', priority: 0.3 },
  ]

  return routes.map(({ path, priority }) => ({
    url: `${BASE_URL}${path}`,
    lastModified,
    changeFrequency: 'weekly',
    priority,
  }))
}

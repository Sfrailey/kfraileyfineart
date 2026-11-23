import type { MetadataRoute } from 'next'

import { NAV_ITEMS } from '@/lib/site'
import { siteUrl } from '@/sanity/env'

export default function sitemap(): MetadataRoute.Sitemap {
  return NAV_ITEMS.map((item) => ({
    url: `${siteUrl}${item.href === '/' ? '' : item.href}`,
    changeFrequency: 'monthly',
    priority: item.href === '/' ? 1 : 0.8,
  }))
}

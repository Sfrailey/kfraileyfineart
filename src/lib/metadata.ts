import type { Metadata } from 'next'

import { imageUrl } from '@/sanity/image'
import { getSettings } from '@/sanity/loaders'
import type { ImageValue } from '@/sanity/types'

type SeoInput = {
  title?: string | null
  description?: string | null
  image?: ImageValue | null
} | null

/**
 * Page metadata: the page's own "Search & sharing" fields first, then the
 * page heading and fallback image, then the site-wide defaults.
 */
export async function pageMetadata({
  path,
  title,
  seo,
  fallbackImage,
}: {
  path: string
  title?: string | null
  seo?: SeoInput
  fallbackImage?: ImageValue | null
}): Promise<Metadata> {
  const settings = await getSettings()
  const description = seo?.description || settings?.seo?.description || undefined
  const ogImage =
    imageUrl(seo?.image, 1200, 630) ??
    imageUrl(fallbackImage, 1200, 630) ??
    imageUrl(settings?.seo?.image, 1200, 630)
  const pageTitle = seo?.title || title || undefined

  return {
    ...(pageTitle ? { title: pageTitle } : {}),
    description,
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      url: path,
      siteName: settings?.title || undefined,
      title: pageTitle || settings?.title || undefined,
      description,
      ...(ogImage ? { images: [{ url: ogImage, width: 1200, height: 630 }] } : {}),
    },
    twitter: { card: ogImage ? 'summary_large_image' : 'summary' },
  }
}

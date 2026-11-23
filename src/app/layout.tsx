import type { Metadata } from 'next'
import { Bitter, Raleway } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'

import { FALLBACK_SITE_NAME } from '@/lib/site'
import { siteUrl } from '@/sanity/env'
import { imageUrl } from '@/sanity/image'
import { getSettings } from '@/sanity/loaders'

import './globals.css'

// The previous site's typefaces, consolidated: Bitter for headings, Raleway for text.
const bitter = Bitter({ subsets: ['latin'], variable: '--font-bitter', display: 'swap' })
const raleway = Raleway({ subsets: ['latin'], variable: '--font-raleway', display: 'swap' })

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings()
  const name = settings?.title || FALLBACK_SITE_NAME
  const icon = imageUrl(settings?.icon, 64, 64, 'contain')
  const appleIcon = imageUrl(settings?.icon, 180, 180, 'contain')
  const ogImage = imageUrl(settings?.seo?.image, 1200, 630)

  return {
    metadataBase: new URL(siteUrl),
    title: { default: settings?.seo?.title || name, template: `%s | ${name}` },
    description: settings?.seo?.description || undefined,
    openGraph: {
      siteName: name,
      type: 'website',
      ...(ogImage ? { images: [{ url: ogImage, width: 1200, height: 630 }] } : {}),
    },
    ...(icon ? { icons: { icon, apple: appleIcon } } : {}),
  }
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${bitter.variable} ${raleway.variable}`}>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}

import type { NextConfig } from 'next'

/** Old WordPress page URLs → new clean URLs (308 permanent redirects). */
const WORDPRESS_REDIRECTS: Array<[string, string]> = [
  ['/home', '/'],
  ['/elementor-page-2022', '/portfolio'],
  ['/elementor-page-2075', '/plein-air'],
  ['/about-me', '/about'],
  ['/elementor-page-1907', '/contact'],
]

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    // Images are served by the Sanity image CDN through next-sanity's loader.
    remotePatterns: [{ protocol: 'https', hostname: 'cdn.sanity.io' }],
  },
  // WordPress URLs end in "/"; Next.js first removes the trailing slash (308),
  // then these rules send the visitor to the new page (308).
  async redirects() {
    return WORDPRESS_REDIRECTS.map(([source, destination]) => ({ source, destination, permanent: true }))
  },
}

export default nextConfig

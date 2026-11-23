/** Primary navigation. Paths are fixed; old WordPress URLs redirect here (next.config.ts). */
export const NAV_ITEMS = [
  { href: '/', label: 'Home' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/plein-air', label: 'Works in Plein Air' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
] as const

/** Used only if the site name has not been filled in Sanity. */
export const FALLBACK_SITE_NAME = 'Kristen Frailey Fine Art'

/** Fixed gallery documents in Sanity and the routes that display them. */
export const GALLERIES = [
  { id: 'gallery-portfolio', title: 'Portfolio', path: '/portfolio' },
  { id: 'gallery-plein-air', title: 'Works in Plein Air', path: '/plein-air' },
] as const

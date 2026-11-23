import type { SchemaTypeDefinition } from 'sanity'

import { artworkType } from './artwork'
import { galleryType } from './gallery'
import { aboutPageType, contactPageType, homePageType, siteSettingsType } from './pages'
import { seoType } from './seo'

export const schemaTypes: SchemaTypeDefinition[] = [
  siteSettingsType,
  homePageType,
  galleryType,
  aboutPageType,
  contactPageType,
  artworkType,
  seoType,
]

/** Documents that exist exactly once, with a fixed ID. */
export const SINGLETONS = [
  { id: 'siteSettings', type: 'siteSettings', title: 'Site settings' },
  { id: 'homePage', type: 'homePage', title: 'Home page' },
  { id: 'aboutPage', type: 'aboutPage', title: 'About page' },
  { id: 'contactPage', type: 'contactPage', title: 'Contact page' },
] as const

export const SINGLETON_TYPES = new Set<string>([...SINGLETONS.map((s) => s.type), 'gallery'])

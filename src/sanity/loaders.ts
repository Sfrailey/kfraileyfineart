import 'server-only'

import { sanityFetch } from './fetch'
import { hasAsset } from './image'
import { ABOUT_QUERY, CONTACT_QUERY, GALLERY_QUERY, HOME_QUERY, SETTINGS_QUERY } from './queries'
import type { Artwork, GalleryPage, HomePage } from './types'

/*
 * One loader per page. Tags list every document type the result depends on,
 * so publishing (for example) an artwork refreshes the galleries and home page
 * that reference it.
 */

/** Keeps only paintings that have an uploaded image (the query already filters; this narrows the type). */
function withImages<T extends { image: unknown }>(list: T[] | null | undefined): Artwork[] {
  return (list ?? []).filter((a): a is T & Artwork => hasAsset(a.image as Artwork['image'] | null))
}

export const getSettings = () => sanityFetch({ query: SETTINGS_QUERY, tags: ['siteSettings'] })

export async function getHomePage(): Promise<HomePage | null> {
  const home = await sanityFetch({ query: HOME_QUERY, tags: ['homePage', 'artwork'] })
  return home && { ...home, featuredArtworks: withImages(home.featuredArtworks) }
}

export async function getGallery(id: string): Promise<GalleryPage | null> {
  const gallery = await sanityFetch({ query: GALLERY_QUERY, params: { id }, tags: ['gallery', 'artwork'] })
  return gallery && { ...gallery, artworks: withImages(gallery.artworks) }
}

export const getAboutPage = () => sanityFetch({ query: ABOUT_QUERY, tags: ['aboutPage'] })

export const getContactPage = () => sanityFetch({ query: CONTACT_QUERY, tags: ['contactPage'] })

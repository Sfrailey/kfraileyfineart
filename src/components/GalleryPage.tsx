import type { Metadata } from 'next'

import { pageMetadata } from '@/lib/metadata'
import { getGallery } from '@/sanity/loaders'
import { GALLERIES } from '@/lib/site'

import { Gallery } from './Gallery'
import { PageHeading } from './PageHeading'

type GalleryDef = (typeof GALLERIES)[number]

export async function galleryMetadata(def: GalleryDef): Promise<Metadata> {
  const gallery = await getGallery(def.id)
  return pageMetadata({
    path: def.path,
    title: gallery?.title || def.title,
    seo: gallery?.seo,
    fallbackImage: gallery?.artworks?.[0]?.image,
  })
}

/** Shared page body for the Portfolio and Works in Plein Air galleries. */
export async function GalleryPage({ def }: { def: GalleryDef }) {
  const gallery = await getGallery(def.id)
  const artworks = gallery?.artworks ?? []

  return (
    <div className="container section">
      <PageHeading title={gallery?.title || def.title} intro={gallery?.intro} />
      {artworks.length > 0 ? (
        <Gallery artworks={artworks} priorityCount={3} />
      ) : (
        <p className="empty-state">New paintings will be added here soon.</p>
      )}
    </div>
  )
}

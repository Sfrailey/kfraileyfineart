import type { Artwork } from '@/sanity/types'

import styles from './ArtworkCaption.module.css'

export function artworkMeta(artwork: Pick<Artwork, 'dimensions' | 'medium'>) {
  return [artwork.dimensions, artwork.medium].filter(Boolean).join(' · ')
}

/** Title, dimensions · medium, and availability (only when stated). */
export function ArtworkCaption({
  artwork,
  id,
  size = 'sm',
}: {
  artwork: Artwork
  id?: string
  size?: 'sm' | 'lg'
}) {
  const meta = artworkMeta(artwork)
  return (
    <div id={id} className={styles.caption} data-size={size}>
      <p className={styles.title}>{artwork.title || 'Untitled'}</p>
      {meta ? <p className={styles.meta}>{meta}</p> : null}
      {artwork.availability === 'sold' ? (
        <p className={styles.status} data-status="sold">
          Sold
        </p>
      ) : artwork.availability === 'available' ? (
        <p className={styles.status} data-status="available">
          Available
        </p>
      ) : null}
    </div>
  )
}

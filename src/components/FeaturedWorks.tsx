'use client'

import { useCallback, useState, type CSSProperties } from 'react'

import { aspectRatio } from '@/sanity/image'
import type { Artwork } from '@/sanity/types'

import { ArtworkCaption } from './ArtworkCaption'
import styles from './FeaturedWorks.module.css'
import { Lightbox } from './Lightbox'
import { SanityImage } from './SanityImage'

const PER_ROW = 3

/**
 * Home-page "gallery wall". Paintings in a row share one height and their
 * widths follow their proportions, so the row fills the width exactly with
 * no empty cells, whatever mix of wide and tall canvases is featured.
 * A short last row is padded with invisible space so it isn't blown up.
 */
export function FeaturedWorks({ artworks }: { artworks: Artwork[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const close = useCallback(() => setOpenIndex(null), [])

  const items = artworks.map((artwork, index) => ({ artwork, index, ratio: aspectRatio(artwork.image) }))
  const rows: (typeof items)[] = []
  for (let i = 0; i < items.length; i += PER_ROW) rows.push(items.slice(i, i + PER_ROW))
  const averageRatio = items.reduce((sum, item) => sum + item.ratio, 0) / Math.max(items.length, 1)

  return (
    <>
      <div className={styles.wall}>
        {rows.map((row, r) => {
          const missing = rows.length > 1 ? PER_ROW - row.length : 0
          return (
            <ul key={r} className={styles.row}>
              {row.map(({ artwork, index, ratio }) => {
                const captionId = `featured-caption-${artwork._id}`
                return (
                  <li key={artwork._id} className={styles.item} style={{ '--ar': ratio } as CSSProperties}>
                    <figure className={styles.figure}>
                      <button
                        type="button"
                        className={styles.open}
                        onClick={() => setOpenIndex(index)}
                        aria-label={`View larger: ${artwork.title || 'Untitled'}`}
                        aria-describedby={captionId}
                      >
                        <SanityImage
                          image={artwork.image}
                          uncropped
                          fallbackAlt={artwork.title ? `${artwork.title}, painting by Kristen Frailey` : ''}
                          sizes="(max-width: 40em) 100vw, 50vw"
                          loading={r === 0 ? 'eager' : 'lazy'}
                          className={styles.image}
                        />
                      </button>
                      <figcaption>
                        <ArtworkCaption artwork={artwork} id={captionId} />
                      </figcaption>
                    </figure>
                  </li>
                )
              })}
              {missing > 0 ? (
                <li
                  aria-hidden="true"
                  className={styles.spacer}
                  style={{ '--ar': averageRatio * missing } as CSSProperties}
                />
              ) : null}
            </ul>
          )
        })}
      </div>
      <Lightbox artworks={artworks} index={openIndex} onIndexChange={setOpenIndex} onClose={close} />
    </>
  )
}

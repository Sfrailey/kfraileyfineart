'use client'

import { useCallback, useState, type CSSProperties } from 'react'

import { aspectRatio } from '@/sanity/image'
import type { Artwork } from '@/sanity/types'

import { ArtworkCaption } from './ArtworkCaption'
import styles from './Gallery.module.css'
import { Lightbox } from './Lightbox'
import { SanityImage } from './SanityImage'

/**
 * Gallery wall. Every painting is shown whole at its natural aspect ratio,
 * contained in an equal cell so rows stay balanced and captions align;
 * reading order is left-to-right. Selecting a painting opens the lightbox.
 */
export function Gallery({
  artworks,
  priorityCount = 0,
}: {
  artworks: Artwork[]
  /** Number of leading images to load eagerly (above the fold). */
  priorityCount?: number
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const close = useCallback(() => setOpenIndex(null), [])

  return (
    <>
      <ul className={styles.gallery}>
        {artworks.map((artwork, index) => {
          const ratio = aspectRatio(artwork.image)
          const captionId = `caption-${artwork._id}`
          return (
            <li key={artwork._id} style={{ '--ar': ratio } as CSSProperties}>
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
                    sizes="(max-width: 40em) 100vw, (max-width: 64em) 50vw, 400px"
                    loading={index < priorityCount ? 'eager' : 'lazy'}
                    preload={index < Math.min(priorityCount, 2)}
                    className={styles.image}
                    // Inline so next/image sizes the blur placeholder the same way as the painting.
                    style={{ objectFit: 'contain', objectPosition: 'center bottom' }}
                  />
                </button>
                <figcaption>
                  <ArtworkCaption artwork={artwork} id={captionId} />
                </figcaption>
              </figure>
            </li>
          )
        })}
      </ul>
      <Lightbox artworks={artworks} index={openIndex} onIndexChange={setOpenIndex} onClose={close} />
    </>
  )
}

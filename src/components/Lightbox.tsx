'use client'

import Link from 'next/link'
import { useEffect, useRef, type PointerEvent as ReactPointerEvent } from 'react'

import type { Artwork } from '@/sanity/types'

import { ArtworkCaption } from './ArtworkCaption'
import styles from './Lightbox.module.css'
import { SanityImage } from './SanityImage'

type Props = {
  artworks: Artwork[]
  index: number | null
  onIndexChange: (index: number) => void
  onClose: () => void
}

/**
 * Full-screen viewer built on the native <dialog> element, which provides a
 * modal focus scope, Escape to close, and focus return to the opening button.
 * Adds arrow-key and swipe navigation.
 */
export function Lightbox({ artworks, index, onIndexChange, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const swipeStart = useRef<{ x: number; y: number } | null>(null)
  const count = artworks.length
  const artwork = index === null ? null : artworks[index]

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (artwork && !dialog.open) dialog.showModal()
    if (!artwork && dialog.open) dialog.close()
  }, [artwork])

  const go = (delta: number) => {
    if (index === null || count < 2) return
    onIndexChange((index + delta + count) % count)
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      go(1)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      go(-1)
    }
  }

  const onPointerDown = (e: ReactPointerEvent) => {
    if (e.pointerType === 'mouse') return
    swipeStart.current = { x: e.clientX, y: e.clientY }
  }

  const onPointerUp = (e: ReactPointerEvent) => {
    const start = swipeStart.current
    swipeStart.current = null
    if (!start) return
    const dx = e.clientX - start.x
    const dy = e.clientY - start.y
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) go(dx < 0 ? 1 : -1)
  }

  const titleId = 'lightbox-title'

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby={artwork ? titleId : undefined}
      onClose={onClose}
      onKeyDown={onKeyDown}
      onClick={(e) => {
        // A click on the backdrop area (the dialog itself, not its content) closes it.
        if (e.target === e.currentTarget) onClose()
      }}
    >
      {artwork ? (
        <div className={styles.layout}>
          <div className={styles.toolbar}>
            <p className={styles.counter} aria-live="polite">
              {index! + 1} / {count}
            </p>
            {/* First focusable element, so it receives focus when the dialog opens. */}
            <button type="button" className={styles.iconButton} onClick={onClose} autoFocus>
              <span aria-hidden="true">×</span>
              <span className="visually-hidden">Close viewer</span>
            </button>
          </div>

          <div className={styles.stage} onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
            {count > 1 ? (
              <button type="button" className={`${styles.iconButton} ${styles.prev}`} onClick={() => go(-1)}>
                <span aria-hidden="true">‹</span>
                <span className="visually-hidden">Previous painting</span>
              </button>
            ) : null}
            <SanityImage
              key={artwork._id}
              image={artwork.image}
              uncropped
              fallbackAlt={artwork.title ? `${artwork.title}, painting by Kristen Frailey` : ''}
              sizes="100vw"
              loading="eager"
              className={styles.image}
              draggable={false}
            />
            {count > 1 ? (
              <button type="button" className={`${styles.iconButton} ${styles.next}`} onClick={() => go(1)}>
                <span aria-hidden="true">›</span>
                <span className="visually-hidden">Next painting</span>
              </button>
            ) : null}
          </div>

          <div className={styles.details}>
            <div id={titleId}>
              <ArtworkCaption artwork={artwork} size="lg" />
            </div>
            {artwork.description ? <p className={styles.description}>{artwork.description}</p> : null}
            {artwork.availability !== 'sold' && artwork.title ? (
              <Link
                href={`/contact?painting=${encodeURIComponent(artwork.title)}#inquiry`}
                className="text-link"
                onClick={onClose}
              >
                Inquire about this painting
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}
    </dialog>
  )
}

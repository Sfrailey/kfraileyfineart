import Link from 'next/link'

import { FALLBACK_SITE_NAME, NAV_ITEMS } from '@/lib/site'
import { aspectRatio, hasAsset } from '@/sanity/image'
import type { SiteSettings } from '@/sanity/types'

import { SanityImage } from './SanityImage'
import styles from './SiteHeader.module.css'
import { SiteNav } from './SiteNav'

export function SiteHeader({ settings }: { settings: SiteSettings | null }) {
  const name = settings?.title || FALLBACK_SITE_NAME
  const logo = settings?.logo

  return (
    <header className={styles.header}>
      <div className={`container-wide ${styles.inner}`}>
        <Link href="/" className={styles.brand} aria-label={`${name}, home`}>
          {hasAsset(logo) ? (
            <SanityImage
              image={logo}
              fallbackAlt={name}
              height={64}
              width={Math.round(64 * aspectRatio(logo))}
              sizes="200px"
              preload
              className={styles.logo}
            />
          ) : (
            <span className={styles.wordmark}>{name}</span>
          )}
        </Link>
        <SiteNav items={NAV_ITEMS} />
      </div>
    </header>
  )
}

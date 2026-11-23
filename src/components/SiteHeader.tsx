import Link from 'next/link'

import { FALLBACK_SITE_NAME, NAV_ITEMS } from '@/lib/site'
import { aspectRatio, hasAsset } from '@/sanity/image'
import type { SiteSettings } from '@/sanity/types'

import { SanityImage } from './SanityImage'
import styles from './SiteHeader.module.css'
import { SiteNav } from './SiteNav'
import { SocialIcon } from './SocialIcon'

export function SiteHeader({ settings }: { settings: SiteSettings | null }) {
  const name = settings?.title || FALLBACK_SITE_NAME
  const logo = settings?.logo
  const instagram = settings?.socialLinks?.find((l) => l.platform === 'Instagram' && l.url)

  return (
    <header className={styles.header}>
      <div className={`container-wide ${styles.inner}`}>
        <Link href="/" className={styles.brand} aria-label={`${name}, home`}>
          {hasAsset(logo) ? (
            <SanityImage
              image={logo}
              fallbackAlt={name}
              height={52}
              width={Math.round(52 * aspectRatio(logo))}
              sizes="160px"
              preload
              className={styles.logo}
            />
          ) : (
            <span className={styles.wordmark}>{name}</span>
          )}
        </Link>
        <div className={styles.end}>
          <SiteNav items={NAV_ITEMS} />
          {instagram ? (
            <a
              href={instagram.url!}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.social}
              aria-label="Instagram (opens in a new tab)"
            >
              <SocialIcon platform="Instagram" size={19} />
            </a>
          ) : null}
        </div>
      </div>
    </header>
  )
}

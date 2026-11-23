import { cacheLife } from 'next/cache'
import Link from 'next/link'

import { FALLBACK_SITE_NAME, NAV_ITEMS } from '@/lib/site'
import { aspectRatio, hasAsset } from '@/sanity/image'
import type { SiteSettings } from '@/sanity/types'

import { SanityImage } from './SanityImage'
import styles from './SiteFooter.module.css'
import { SocialIcon } from './SocialIcon'

/** Current year, cached so the footer stays prerenderable; refreshes daily. */
async function currentYear() {
  'use cache'
  cacheLife('days')
  return new Date().getFullYear()
}

export async function SiteFooter({ settings }: { settings: SiteSettings | null }) {
  const year = await currentYear()
  // Keep the copyright current without anyone editing it in Sanity each January.
  const footerText = settings?.footerText?.replace(/\b(?:19|20)\d{2}\b/, String(year))
  const name = settings?.title || FALLBACK_SITE_NAME
  const logo = settings?.logo
  const socialLinks = settings?.socialLinks?.filter((l) => l.url && l.platform) ?? []

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.grid}`}>
        <nav aria-label="Footer" className={styles.nav}>
          <ul>
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.brand}>
          {hasAsset(logo) ? (
            <SanityImage
              image={logo}
              fallbackAlt={name}
              height={96}
              width={Math.round(96 * aspectRatio(logo))}
              sizes="260px"
              className={styles.logo}
            />
          ) : (
            <p className={styles.wordmark}>{name}</p>
          )}
        </div>

        <div className={styles.meta}>
          {settings?.email ? (
            <a href={`mailto:${settings.email}`} className={styles.email}>
              {settings.email}
            </a>
          ) : null}
          {socialLinks.length > 0 ? (
            <ul className={styles.social}>
              {socialLinks.map((link) => (
                <li key={link._key}>
                  <a href={link.url!} target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                    <SocialIcon platform={link.platform!} />
                    <span>{link.platform}</span>
                    <span className="visually-hidden"> (opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
          {footerText ? <p className={styles.copyright}>{footerText}</p> : null}
        </div>
      </div>
    </footer>
  )
}

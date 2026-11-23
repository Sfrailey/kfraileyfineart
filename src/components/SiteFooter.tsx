import Link from 'next/link'

import { FALLBACK_SITE_NAME, NAV_ITEMS } from '@/lib/site'
import { aspectRatio, hasAsset } from '@/sanity/image'
import type { SiteSettings } from '@/sanity/types'

import { SanityImage } from './SanityImage'
import styles from './SiteFooter.module.css'

function SocialIcon({ platform }: { platform: string }) {
  if (platform === 'Instagram') {
    return (
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.9" fill="currentColor" stroke="none" />
      </svg>
    )
  }
  return null
}

export function SiteFooter({ settings }: { settings: SiteSettings | null }) {
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
          {settings?.footerText ? <p className={styles.copyright}>{settings.footerText}</p> : null}
        </div>
      </div>
    </footer>
  )
}

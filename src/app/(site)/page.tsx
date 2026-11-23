import type { Metadata } from 'next'
import Link from 'next/link'

import { Gallery } from '@/components/Gallery'
import { PageHeading } from '@/components/PageHeading'
import { SanityImage } from '@/components/SanityImage'
import { pageMetadata } from '@/lib/metadata'
import { hasAsset } from '@/sanity/image'
import { getHomePage } from '@/sanity/loaders'

import styles from './home.module.css'

export async function generateMetadata(): Promise<Metadata> {
  const home = await getHomePage()
  return pageMetadata({ path: '/', seo: home?.seo, fallbackImage: home?.heroImage })
}

export default async function HomePage() {
  const home = await getHomePage()
  const featured = home?.featuredArtworks ?? []
  const heroText = home?.heroText

  return (
    <>
      {hasAsset(home?.heroImage) ? (
        <section className={styles.hero} aria-label="Introduction">
          <SanityImage image={home.heroImage} fill sizes="100vw" preload className={styles.heroImage} />
          {heroText ? (
            <div className={`container-wide ${styles.heroTextWrap}`}>
              <h1 className={styles.heroText}>
                {(() => {
                  // "Art of Utah and the West by Kristen Frailey" → title + byline
                  const match = heroText.match(/^(.*\S)\s+(by\s+.+)$/i)
                  if (!match) return heroText
                  return (
                    <>
                      <span>{match[1]}</span>
                      <span className={styles.heroByline}>{match[2]}</span>
                    </>
                  )
                })()}
              </h1>
            </div>
          ) : null}
        </section>
      ) : heroText ? (
        <div className="container section">
          <PageHeading title={heroText} />
        </div>
      ) : null}

      {featured.length > 0 ? (
        <section className="section" aria-labelledby="featured-heading">
          <div className="container">
            <PageHeading as="h2" id="featured-heading" title={home?.featuredHeading || 'Featured Works'} />
            <Gallery artworks={featured} />
            <p className={styles.links}>
              <Link href="/portfolio" className="text-link">
                View the portfolio
              </Link>
              <Link href="/plein-air" className="text-link">
                Works in plein air
              </Link>
            </p>
          </div>
        </section>
      ) : null}
    </>
  )
}

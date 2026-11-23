import type { Metadata } from 'next'
import Link from 'next/link'

import { FeaturedWorks } from '@/components/FeaturedWorks'
import { PageHeading } from '@/components/PageHeading'
import { SanityImage } from '@/components/SanityImage'
import { pageMetadata } from '@/lib/metadata'
import { GALLERIES } from '@/lib/site'
import { hasAsset } from '@/sanity/image'
import { getGallery, getHomePage } from '@/sanity/loaders'

import styles from './home.module.css'

export async function generateMetadata(): Promise<Metadata> {
  const home = await getHomePage()
  return pageMetadata({ path: '/', seo: home?.seo, fallbackImage: home?.heroImage })
}

export default async function HomePage() {
  const [home, ...galleries] = await Promise.all([getHomePage(), ...GALLERIES.map((g) => getGallery(g.id))])
  const galleryCards = GALLERIES.map((def, i) => ({
    ...def,
    title: galleries[i]?.title || def.title,
    image: galleries[i]?.artworks?.[0]?.image ?? null,
  }))
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
        <section className={`section ${styles.featured}`} aria-labelledby="featured-heading">
          <div className="container">
            <PageHeading as="h2" id="featured-heading" title={home?.featuredHeading || 'Featured Works'} />
            <FeaturedWorks artworks={featured} />
          </div>
        </section>
      ) : null}

      <section className={`container ${styles.explore}`} aria-label="Galleries">
        <ul className={styles.cards}>
          {galleryCards.map((card) => (
            <li key={card.id}>
              <Link href={card.path} className={styles.card}>
                <span className={styles.cardMedia}>
                  {hasAsset(card.image) ? (
                    <SanityImage
                      image={card.image}
                      fallbackAlt=""
                      fill
                      sizes="(max-width: 40em) 100vw, 50vw"
                      className={styles.cardImage}
                    />
                  ) : null}
                </span>
                <span className={styles.cardTitle}>{card.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}

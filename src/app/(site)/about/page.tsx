import type { Metadata } from 'next'

import { PageHeading } from '@/components/PageHeading'
import { RichText } from '@/components/RichText'
import { SanityImage } from '@/components/SanityImage'
import { pageMetadata } from '@/lib/metadata'
import { hasAsset } from '@/sanity/image'
import { getAboutPage } from '@/sanity/loaders'
import type { ImageValue, RichText as RichTextValue } from '@/sanity/types'

import styles from './about.module.css'

export async function generateMetadata(): Promise<Metadata> {
  const about = await getAboutPage()
  return pageMetadata({
    path: '/about',
    title: about?.title || 'About',
    seo: about?.seo,
    fallbackImage: about?.statementImage,
  })
}

function AboutSection({
  id,
  heading,
  body,
  image,
  imageAlt,
  preload,
  children,
}: {
  id: string
  heading: string | null
  body: RichTextValue | null
  image: ImageValue | null
  imageAlt: string
  preload?: boolean
  children?: React.ReactNode
}) {
  if (!heading && !body?.length && !hasAsset(image) && !children) return null
  return (
    <section className={styles.section} aria-labelledby={heading ? id : undefined}>
      <div className={styles.media}>
        {hasAsset(image) ? (
          <SanityImage
            image={image}
            fallbackAlt={imageAlt}
            sizes="(max-width: 52em) 100vw, 40vw"
            preload={preload}
            className={styles.image}
          />
        ) : null}
      </div>
      <div className={styles.text}>
        {heading ? <h2 id={id}>{heading}</h2> : null}
        <RichText value={body} />
        {children}
      </div>
    </section>
  )
}

export default async function AboutPage() {
  const about = await getAboutPage()
  const recognition = about?.recognition?.filter(Boolean) ?? []

  return (
    <div className="container section">
      <PageHeading title={about?.title || 'About'} />
      {about ? (
        <div className={styles.sections}>
          <AboutSection
            id="statement"
            heading={about.statementHeading}
            body={about.statement}
            image={about.statementImage}
            imageAlt="Kristen Frailey"
            preload
          />
          <AboutSection
            id="bio"
            heading={about.bioHeading}
            body={about.bio}
            image={about.bioImage}
            imageAlt="Kristen Frailey"
          >
            {recognition.length > 0 ? (
              <div className={styles.recognition}>
                {about.recognitionHeading ? <h2 id="recognition">{about.recognitionHeading}</h2> : null}
                <ul aria-labelledby={about.recognitionHeading ? 'recognition' : undefined}>
                  {recognition.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </AboutSection>
        </div>
      ) : null}
    </div>
  )
}

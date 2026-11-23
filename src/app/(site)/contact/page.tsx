import type { Metadata } from 'next'
import { Suspense } from 'react'

import { PageHeading } from '@/components/PageHeading'
import { RichText } from '@/components/RichText'
import { SanityImage } from '@/components/SanityImage'
import { pageMetadata } from '@/lib/metadata'
import { hasAsset } from '@/sanity/image'
import { getContactPage } from '@/sanity/loaders'

import styles from './contact.module.css'
import { ContactForm, ContactFormWithParams } from './ContactForm'

export async function generateMetadata(): Promise<Metadata> {
  const contact = await getContactPage()
  return pageMetadata({
    path: '/contact',
    title: contact?.title || 'Contact',
    seo: contact?.seo,
    fallbackImage: contact?.image,
  })
}

export default async function ContactPage() {
  const contact = await getContactPage()
  const pricing = contact?.pricing?.filter((row) => row.size && row.price) ?? []
  const hasIntro = Boolean(contact?.intro?.length) || pricing.length > 0

  return (
    <div className="container section">
      <PageHeading title={contact?.title || 'Contact'} />

      {hasIntro || hasAsset(contact?.image) ? (
        <div className={styles.intro}>
          {hasAsset(contact?.image) ? (
            <div className={styles.introMedia}>
              <SanityImage image={contact.image} sizes="(max-width: 52em) 100vw, 40vw" preload className={styles.image} />
            </div>
          ) : null}
          <div className={styles.introText}>
            <RichText value={contact?.intro} />
            {pricing.length > 0 ? (
              <div className={styles.pricing}>
                {contact?.pricingHeading ? <h2 id="pricing">{contact.pricingHeading}</h2> : null}
                <dl aria-labelledby={contact?.pricingHeading ? 'pricing' : undefined}>
                  {pricing.map((row) => (
                    <div key={row._key} className={styles.priceRow}>
                      <dt>{row.size}</dt>
                      <dd>{row.price}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      <section id="inquiry" className={styles.formSection} aria-labelledby="inquiry-heading">
        <h2 id="inquiry-heading" className={contact?.formHeading ? undefined : 'visually-hidden'}>
          {contact?.formHeading || 'Send a message'}
        </h2>
        <Suspense fallback={<ContactForm painting={null} />}>
          <ContactFormWithParams />
        </Suspense>
      </section>

      {hasAsset(contact?.secondaryImage) ? (
        <div className={styles.secondary}>
          <SanityImage image={contact.secondaryImage} sizes="(max-width: 52em) 100vw, 720px" className={styles.image} />
        </div>
      ) : null}
    </div>
  )
}

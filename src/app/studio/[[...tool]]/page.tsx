/**
 * Embedded Sanity Studio at /studio. Sanity handles authentication: only
 * signed-in members of the Sanity project can view or edit content.
 */
import { NextStudio } from 'next-sanity/studio'

import { isSanityConfigured } from '@/sanity/env'

import config from '../../../../sanity.config'

export { metadata, viewport } from 'next-sanity/studio'

export default function StudioPage() {
  if (!isSanityConfigured) {
    return (
      <main style={{ fontFamily: 'system-ui, sans-serif', maxWidth: '36rem', margin: '4rem auto', padding: '0 1rem' }}>
        <h1>Sanity Studio is not configured</h1>
        <p>
          Set <code>NEXT_PUBLIC_SANITY_PROJECT_ID</code> and <code>NEXT_PUBLIC_SANITY_DATASET</code> (see README), then
          restart the site.
        </p>
      </main>
    )
  }
  return <NextStudio config={config} />
}

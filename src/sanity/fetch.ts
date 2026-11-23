import 'server-only'

import { cacheLife, cacheTag } from 'next/cache'
import type { QueryParams } from 'next-sanity'

import { client } from './client'
import { isSanityConfigured } from './env'

/**
 * Document types whose changes should refresh the public site. The Sanity
 * webhook sends the `_type` of the changed document, and
 * `/api/revalidate` calls `revalidateTag(_type)`.
 */
export const CONTENT_TAGS = [
  'siteSettings',
  'homePage',
  'gallery',
  'artwork',
  'aboutPage',
  'contactPage',
] as const

export type ContentTag = (typeof CONTENT_TAGS)[number]

/**
 * Cached Sanity read.
 *
 * Results are cached with `'use cache'` and tagged with every document type
 * the query depends on (pass them in `tags`). Freshness is on-demand: when
 * content is published, the webhook invalidates the matching tags. An hourly
 * time-based refresh (`cacheLife('hours')`) is a safety net if a webhook is
 * ever missed or not yet configured.
 *
 * Returns `null` only when Sanity is not configured, so a fresh checkout still
 * builds. Request failures are deliberately thrown, not cached: during a
 * background refresh Next.js keeps serving the last good page, and an empty
 * result is never stored for an hour.
 */
export async function sanityFetch<const Q extends keyof SanityQueries>({
  query,
  params = {},
  tags,
}: {
  query: Q
  params?: QueryParams
  tags: readonly ContentTag[]
}): Promise<SanityQueries[Q] | null> {
  'use cache'
  cacheLife('hours')
  cacheTag(...tags)

  if (!isSanityConfigured) return null

  // Result types come from Sanity TypeGen (src/sanity/sanity.types.ts).
  return client.fetch<SanityQueries[Q]>(query, params)
}

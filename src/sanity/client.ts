import 'server-only'

import { createClient } from 'next-sanity'

import { apiVersion, dataset, projectId } from './env'

/**
 * Optional override used only for local testing against a stand-in API.
 * Leave unset in every real environment.
 */
const apiHost = process.env.SANITY_API_HOST

/**
 * Read-only client for the public website.
 *
 * - `perspective: 'published'` guarantees drafts never reach public pages.
 * - `useCdn: false` because freshness is controlled by Next.js cache tags and a
 *   Sanity webhook (see `src/sanity/fetch.ts`). Reading from the live API
 *   ensures a webhook-triggered re-render sees the just-published content.
 * - No token: published content in a public dataset needs none, and no secret
 *   is ever bundled with this client.
 */
export const client = createClient({
  projectId: projectId || 'unconfigured',
  dataset,
  apiVersion,
  useCdn: false,
  perspective: 'published',
  stega: false,
  ...(apiHost ? { apiHost, useProjectHostname: false } : {}),
})

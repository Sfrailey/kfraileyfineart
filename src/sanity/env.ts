/**
 * Public Sanity configuration. These values are safe to expose to the browser
 * (the Studio needs them client-side). Secrets live in `src/sanity/client.ts`
 * and route handlers only.
 */
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? ''
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2026-11-01'

/** True when a Sanity project has been configured for this deployment. */
export const isSanityConfigured = /^[a-z0-9-]+$/.test(projectId)

/** Canonical public URL of the site, used for metadata and the sitemap. */
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '')

# Kristen Frailey Fine Art

Portfolio website for Kristen Frailey, rebuilt from WordPress with **Next.js 16 (App Router, TypeScript)** and **Sanity**. All page text and every image on the site is edited in Sanity Studio at `/studio`.

- `src/app/(site)` – public pages: `/`, `/portfolio`, `/plein-air`, `/about`, `/contact`
- `src/app/studio` – embedded Sanity Studio (sign-in required)
- `src/app/api/revalidate` – webhook that refreshes the site when content is published
- `src/sanity` – schemas, Studio structure, GROQ queries, generated types, cached fetch
- `src/components` – header, footer, gallery, lightbox, image component
- `scripts/` – WordPress → Sanity migration (`wordpress-content.json` is the reviewed content manifest)
- `docs/CLIENT_GUIDE.md` – instructions for Kristen
- `docs/MIGRATION_NOTES.md` – decisions and items to confirm from the migration

## Local development

Requires Node.js 22.18+ (developed on Node 24).

```bash
npm install
cp .env.example .env.local   # fill in at least the Sanity project ID
npm run dev                  # http://localhost:3000 and http://localhost:3000/studio
```

Without a Sanity project ID the site still builds and runs; pages render their empty states.

| Script | Purpose |
| --- | --- |
| `npm run dev` / `build` / `start` | Next.js |
| `npm run typecheck` | TypeScript |
| `npm run lint` | ESLint |
| `npm run check` | typecheck + lint + production build |
| `npm run typegen` | Regenerate `src/sanity/sanity.types.ts` after changing schemas or queries |
| `npm run migrate` | Import WordPress content into Sanity (see below) |

## Environment variables

See `.env.example`. Summary:

| Variable | Where | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET` | everywhere | Sanity project (public values) |
| `NEXT_PUBLIC_SITE_URL` | everywhere | Canonical URL, sitemap, social cards |
| `SANITY_REVALIDATE_SECRET` | host | Verifies the publish webhook |
| `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL` | host | Contact form delivery |
| `SANITY_API_WRITE_TOKEN` | your machine only | Migration script; never deploy it |

The public site uses no Sanity token: it reads only published content from the dataset.

## Sanity setup

1. Create a project at [sanity.io/manage](https://www.sanity.io/manage) (or `npx sanity@latest init` and choose "create new project"). Keep the `production` dataset **public** (the default), so the site can read published content without a token. Drafts are never public.
2. Put the project ID in `.env.local` and in your host's environment variables.
3. **CORS origins** (Manage → API → CORS origins): add `http://localhost:3000` and your production URL (e.g. `https://kfraileyfineart.com`), each with **Allow credentials** checked. The embedded Studio needs this.
4. **Members** (Manage → Members): invite Kristen with the *Editor* role (or *Administrator* if she should manage the project). Only project members can open `/studio`; Sanity handles sign-in.

### Content model

| Studio item | Document | Notes |
| --- | --- | --- |
| Home page | `homePage` (singleton) | Hero image (hotspot/crop), hero text, featured heading, **featured paintings** (references) |
| Galleries → Portfolio / Works in Plein Air | `gallery` (fixed IDs `gallery-portfolio`, `gallery-plein-air`) | Intro text and an ordered list of **painting references**; drag to reorder |
| About page | `aboutPage` | Two portraits, statement, bio, recognition list |
| Contact page | `contactPage` | Two images, intro, pricing rows, optional form heading |
| All artwork | `artwork` | Title, image (never cropped), dimensions, medium, availability (`unknown` / `available` / `sold`), optional description |
| Artwork not shown on the site | filtered list | Paintings not referenced by a gallery or the home page |
| Site settings | `siteSettings` | Site name, logo, browser-tab icon, public email, social links, footer text, default SEO |

Each painting is one record. Galleries and the home page *reference* it, so the same painting can appear in several places without duplicate records. The gallery's list order is the display order. Pages and galleries cannot be deleted or duplicated in the Studio.

## Caching and publishing (revalidation)

The site uses Next.js **Cache Components**. Every Sanity read (`src/sanity/fetch.ts`) runs inside `'use cache'`, is tagged with the document types it depends on (`cacheTag`), and is prerendered. Pages are served statically until content changes:

1. Kristen clicks **Publish** in the Studio.
2. A Sanity GROQ webhook POSTs `{ "_type": "<type>" }` to `/api/revalidate`.
3. The route verifies the webhook signature with `SANITY_REVALIDATE_SECRET` (401 if invalid) and calls `revalidateTag(_type, { expire: 0 })`.
4. The next visit to any page using that type re-fetches from Sanity. Publishing an `artwork` refreshes the galleries and home page too, because those queries are tagged `artwork` as well.

As a safety net, cached content also refreshes in the background hourly (`cacheLife('hours')`), so a missed webhook never leaves the site stale for long. Reads use `useCdn: false` and `perspective: 'published'`, so drafts never appear and a refresh always sees the just-published version.

**Create the webhook:** sanity.io/manage → your project → API → Webhooks → *Create webhook*:

| Setting | Value |
| --- | --- |
| URL | `https://kfraileyfineart.com/api/revalidate` |
| Dataset | `production` |
| Trigger on | Create, Update, Delete |
| Filter | `_type in ["siteSettings", "homePage", "gallery", "artwork", "aboutPage", "contactPage"]` |
| Projection | `{_type}` |
| HTTP method | POST |
| Drafts / versions | off (only published changes) |
| Secret | the same value as `SANITY_REVALIDATE_SECRET` |

Then publish any small change and check the webhook's *Attempts log* in Manage for a `200` response.

## Contact form

The form (`src/app/(site)/contact`) is a Server Action. It validates on the server, with matching checks in the browser, and sends the enquiry through the [Resend](https://resend.com) HTTP API (`src/lib/email.ts`; no SDK). Visitors see "Thank you, your message has been sent" **only** when Resend accepts the message. Missing configuration or a Resend error shows an error, and the visitor's text is kept. A hidden honeypot field blocks simple spam bots. The visitor's email is set as *Reply-To*.

Setup:
1. Create a Resend account and **verify the sending domain** (Domains → add `kfraileyfineart.com`, then add the DNS records it lists at the domain registrar).
2. Create an API key with sending access and set `RESEND_API_KEY`.
3. Set `CONTACT_TO_EMAIL` (Kristen's inbox) and `CONTACT_FROM_EMAIL` (an address on the verified domain).

Gallery lightboxes link to `/contact?painting=<title>` so enquiries name the painting.

## WordPress migration

`scripts/migrate-wordpress.mts` imports everything from the old site. Content is listed in `scripts/wordpress-content.json`: each painting's image file, title, dimensions, medium, sold status and gallery, copied from the caption WordPress showed **next to that image**.

```bash
npm run migrate -- --dry-run     # verify + download originals + write migration-output/dataset.ndjson; nothing sent to Sanity
npm run migrate                  # verify, upload images, create missing documents
npm run migrate -- --overwrite   # also replace existing documents with the WordPress version
```

- **Verification first:** the script re-reads the live WordPress pages and media library and aborts, writing nothing, if any image ↔ title pairing in the manifest doesn't match the caption beside that image.
- **Originals:** it downloads the full-resolution original behind each WordPress image (not the resized `-scaled`/`-768x…` copies), cached in `.migration-cache/`.
- **Safe to re-run:** documents have fixed IDs (`artwork-superior-glow`, `gallery-portfolio`, …) and Sanity de-duplicates identical image uploads. Without `--overwrite`, documents that already exist are left alone, so edits made in the Studio survive a re-run.
- Needs `NEXT_PUBLIC_SANITY_PROJECT_ID` and an Editor `SANITY_API_WRITE_TOKEN` in `.env.local`. Delete the token from Sanity once the migration is done.

Review `docs/MIGRATION_NOTES.md` for the items that need the artist's confirmation.

## Deployment (Vercel recommended)

1. Push the repository and import it in Vercel (framework: Next.js, default build settings).
2. Add the environment variables from the table above (not `SANITY_API_WRITE_TOKEN`).
3. Deploy, then add the production URL to Sanity CORS origins and create the webhook.
4. Point the domain's DNS at Vercel. Old WordPress page URLs (`/elementor-page-2022/`, `/about-me/`, …) permanently redirect (308) to the new pages (`next.config.ts`).

Other Node hosts work too (`npm run build && npm start`). On-demand revalidation relies on the Next.js cache, so with several server instances, configure a shared cache handler.

## Quality checks

`npm run check` runs the type check, ESLint and a production build. After editing schemas or queries, run `npm run typegen` so the generated types (and the typed `sanityFetch`) stay in sync.

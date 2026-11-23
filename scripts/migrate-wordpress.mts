/**
 * WordPress → Sanity content migration for Kristen Frailey Fine Art.
 *
 *   npm run migrate -- --dry-run     verify + build the dataset locally, write nothing to Sanity
 *   npm run migrate                  verify + upload images + create missing documents
 *   npm run migrate -- --overwrite   same, but replace existing documents with the WordPress version
 *
 * Content comes from scripts/wordpress-content.json (reviewable, one entry per
 * painting). Before writing anything the script re-checks every image ↔ title
 * pairing against the live WordPress site and aborts on any mismatch.
 *
 * Safe to re-run: documents use fixed IDs (e.g. "artwork-superior-glow"), and
 * Sanity de-duplicates identical image uploads by content hash. Without
 * --overwrite, documents that already exist are left untouched, so edits made
 * in the Studio are never clobbered.
 *
 * Environment (read from .env.local):
 *   NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET
 *   SANITY_API_WRITE_TOKEN   token with Editor permissions (not needed for --dry-run)
 */
import { createHash } from 'node:crypto'
import { existsSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { createClient } from '@sanity/client'

// ---------- Types ----------

type Availability = 'available' | 'sold' | 'unknown'

type ArtworkEntry = {
  id: string
  title: string
  dimensions: string
  medium: string
  availability: Availability
  source: string
  wpPage: string
  wpMediaId: number
  wpCaption: string
  captionSource?: 'media-library'
  note?: string
}

type Crop = { top: number; bottom: number; left: number; right: number }
type Hotspot = { x: number; y: number; width: number; height: number }
type ImageEntry = { source: string; alt: string; crop?: Crop; hotspot?: Hotspot }

type Manifest = {
  uploadsBase: string
  artworks: ArtworkEntry[]
  galleries: { id: string; title: string; artworks: string[] }[]
  images: Record<
    'logo' | 'icon' | 'hero' | 'statementPortrait' | 'bioPortrait' | 'contactImage' | 'contactSecondary' | 'shareImage',
    ImageEntry
  >
  siteSettings: { title: string; footerText: string; socialLinks: { platform: string; url: string }[]; seoDescription: string }
  homePage: { heroText: string; featuredHeading: string; featuredArtworks: string[] }
  aboutPage: {
    title: string
    statementHeading: string
    statement: string[]
    bioHeading: string
    bio: string[]
    recognitionHeading: string
    recognition: string[]
  }
  contactPage: { title: string; intro: string[]; pricingHeading: string; pricing: { size: string; price: string }[] }
}

type SanityDoc = { _id: string; _type: string; [key: string]: unknown }

// ---------- Setup ----------

const args = new Set(process.argv.slice(2))
const DRY_RUN = args.has('--dry-run')
const OVERWRITE = args.has('--overwrite')
const SKIP_VERIFY = args.has('--skip-verify')

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const cacheDir = path.join(root, '.migration-cache')
const outputDir = path.join(root, 'migration-output')
const WP_BASE = 'https://kfraileyfineart.com'
const USER_AGENT = 'kfrailey-site-migration/1.0'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? ''
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const token = process.env.SANITY_API_WRITE_TOKEN

const manifest = JSON.parse(await readFile(path.join(root, 'scripts', 'wordpress-content.json'), 'utf8')) as Manifest

function fail(message: string): never {
  console.error(`\n✖ ${message}`)
  process.exit(1)
}

if (!DRY_RUN) {
  if (!projectId) fail('NEXT_PUBLIC_SANITY_PROJECT_ID is not set (add it to .env.local).')
  if (!token) fail('SANITY_API_WRITE_TOKEN is not set. Create an Editor token in sanity.io/manage → API → Tokens.')
}

const client = DRY_RUN
  ? null
  : createClient({ projectId, dataset, token, apiVersion: '2026-11-01', useCdn: false })

// ---------- Helpers ----------

/** Decodes the HTML entities WordPress uses in captions. */
function decode(text: string): string {
  return text
    .replace(/&#(\d+);/g, (_, n: string) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n: string) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/[‎‏]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Comparable form of a title: lowercase letters and digits only. */
const normalize = (s: string) => decode(s).toLowerCase().replace(/[^a-z0-9]+/g, '')

/** WordPress file stem shared by an original and its resized copies. */
const stemOf = (source: string) => path.basename(source).replace(/\.(jpe?g|png)$/i, '')

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } })
  if (!res.ok) fail(`Request failed (${res.status}): ${url}`)
  return (await res.json()) as T
}

let keyCounter = 0
const key = (prefix: string) => `${prefix}${(keyCounter++).toString(36).padStart(4, '0')}`

function blocks(paragraphs: string[], prefix: string) {
  return paragraphs.map((text, i) => ({
    _type: 'block',
    _key: `${prefix}${i}`,
    style: 'normal',
    markDefs: [],
    children: [{ _type: 'span', _key: `${prefix}${i}s`, text, marks: [] }],
  }))
}

/** Width/height from a JPEG or PNG header (used for dry-run asset IDs only). */
function imageSize(buf: Buffer): { width: number; height: number; ext: string } {
  if (buf.readUInt32BE(0) === 0x89504e47) {
    return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20), ext: 'png' }
  }
  let offset = 2
  let orientation = 1
  let size: { width: number; height: number } | null = null
  while (offset < buf.length) {
    if (buf[offset] !== 0xff) break
    const marker = buf[offset + 1]
    const length = buf.readUInt16BE(offset + 2)
    if (marker === 0xe1 && buf.toString('ascii', offset + 4, offset + 8) === 'Exif') {
      orientation = exifOrientation(buf.subarray(offset + 10, offset + 2 + length)) ?? 1
    }
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
      size = { height: buf.readUInt16BE(offset + 5), width: buf.readUInt16BE(offset + 7) }
      break
    }
    offset += 2 + length
  }
  if (!size) fail('Could not read JPEG dimensions')
  // EXIF orientations 5–8 are rotated 90°: displayed width/height swap.
  return orientation >= 5 ? { width: size.height, height: size.width, ext: 'jpg' } : { ...size, ext: 'jpg' }
}

function exifOrientation(tiff: Buffer): number | null {
  const little = tiff.toString('ascii', 0, 2) === 'II'
  const u16 = (o: number) => (little ? tiff.readUInt16LE(o) : tiff.readUInt16BE(o))
  const u32 = (o: number) => (little ? tiff.readUInt32LE(o) : tiff.readUInt32BE(o))
  const ifd = u32(4)
  const entries = u16(ifd)
  for (let i = 0; i < entries; i++) {
    const entry = ifd + 2 + i * 12
    if (u16(entry) === 0x0112) return u16(entry + 8)
  }
  return null
}

// ---------- 1. Verify image ↔ title pairings against the live site ----------

type WpMedia = { id: number; source_url: string; caption: { rendered: string }; media_details?: { original_image?: string } }
type WpPage = { slug: string; content: { rendered: string } }

async function verify() {
  console.log('Verifying image ↔ caption pairings against kfraileyfineart.com …')
  const pages = new Map<string, string>()
  for (const slug of new Set(manifest.artworks.map((a) => a.wpPage))) {
    const [page] = await fetchJson<WpPage[]>(`${WP_BASE}/wp-json/wp/v2/pages?slug=${slug}&_fields=slug,content`)
    if (!page) fail(`WordPress page "${slug}" not found`)
    pages.set(slug, page.content.rendered)
  }

  const problems: string[] = []
  for (const art of manifest.artworks) {
    const media = await fetchJson<WpMedia>(`${WP_BASE}/wp-json/wp/v2/media/${art.wpMediaId}?_fields=id,source_url,caption,media_details`)
    const dir = path.posix.dirname(media.source_url.replace(`${WP_BASE}/wp-content/uploads/`, ''))
    const original = `${dir}/${media.media_details?.original_image ?? path.posix.basename(media.source_url)}`
    if (original !== art.source) problems.push(`${art.title}: media ${art.wpMediaId} original is ${original}, manifest says ${art.source}`)

    const html = pages.get(art.wpPage)!
    const figure = html.split('<figure').find((chunk) => chunk.includes(`/${stemOf(art.source)}-`) || chunk.includes(`/${stemOf(art.source)}.`))
    if (!figure) {
      problems.push(`${art.title}: image ${art.source} is not on page ${art.wpPage}`)
      continue
    }
    const pageCaption = figure.match(/<figcaption[^>]*>([\s\S]*?)<\/figcaption>/)?.[1]
    const caption = art.captionSource === 'media-library' ? media.caption.rendered : pageCaption
    if (!caption) {
      problems.push(`${art.title}: no caption found next to ${art.source}`)
    } else if (!normalize(caption).startsWith(normalize(art.title))) {
      problems.push(`${art.title}: caption beside the image reads "${decode(caption)}"`)
    }
  }

  if (problems.length) fail(`Pairing check failed. Nothing was written.\n  - ${problems.join('\n  - ')}`)
  console.log(`✓ ${manifest.artworks.length} artworks verified against their WordPress captions`)
}

// ---------- 2. Download originals and upload to Sanity ----------

const assetIds = new Map<string, string>()
const dryRunAssets: SanityDoc[] = []

async function download(source: string): Promise<Buffer> {
  const file = path.join(cacheDir, source.replace(/\//g, '__'))
  if (existsSync(file)) return readFile(file)
  const url = manifest.uploadsBase + source
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } })
  if (!res.ok) fail(`Download failed (${res.status}): ${url}`)
  const buf = Buffer.from(await res.arrayBuffer())
  await mkdir(cacheDir, { recursive: true })
  await writeFile(file, buf)
  return buf
}

async function assetFor(source: string): Promise<string> {
  const cached = assetIds.get(source)
  if (cached) return cached
  const buf = await download(source)
  let id: string
  if (client) {
    const asset = await client.assets.upload('image', buf, {
      filename: path.basename(source),
      source: { name: 'wordpress', id: source, url: manifest.uploadsBase + source },
    })
    id = asset._id
  } else {
    // Same ID scheme Sanity uses: image-<sha1>-<width>x<height>-<ext>
    const sha1 = createHash('sha1').update(buf).digest('hex')
    const { width, height, ext } = imageSize(buf)
    id = `image-${sha1}-${width}x${height}-${ext}`
    dryRunAssets.push({
      _id: id,
      _type: 'sanity.imageAsset',
      url: `https://cdn.sanity.io/images/${projectId || 'PROJECT_ID'}/${dataset}/${sha1}-${width}x${height}.${ext}`,
      originalFilename: path.basename(source),
      metadata: { _type: 'sanity.imageMetadata', dimensions: { width, height, aspectRatio: width / height } },
      source: { name: 'wordpress', id: source },
      localFile: path.join(cacheDir, source.replace(/\//g, '__')),
    })
  }
  assetIds.set(source, id)
  process.stdout.write('.')
  return id
}

async function image(entry: { source: string; alt?: string; crop?: Crop; hotspot?: Hotspot }) {
  const value: Record<string, unknown> = {
    _type: 'image',
    asset: { _type: 'reference', _ref: await assetFor(entry.source) },
  }
  if (entry.alt) value.alt = entry.alt
  if (entry.crop) {
    const { top, bottom, left, right } = entry.crop
    value.crop = { _type: 'sanity.imageCrop', top, bottom, left, right }
    value.hotspot = entry.hotspot
      ? { _type: 'sanity.imageHotspot', ...entry.hotspot }
      : {
          _type: 'sanity.imageHotspot',
          x: left + (1 - left - right) / 2,
          y: top + (1 - top - bottom) / 2,
          width: 1 - left - right,
          height: 1 - top - bottom,
        }
  } else if (entry.hotspot) {
    value.hotspot = { _type: 'sanity.imageHotspot', ...entry.hotspot }
  }
  return value
}

const ref = (artworkId: string) => ({ _type: 'reference', _ref: `artwork-${artworkId}`, _key: key('r') })

// ---------- 3. Build documents ----------

async function buildDocuments(): Promise<SanityDoc[]> {
  const docs: SanityDoc[] = []
  const known = new Set(manifest.artworks.map((a) => a.id))
  const check = (ids: string[], where: string) => {
    for (const id of ids) if (!known.has(id)) fail(`${where} references unknown artwork "${id}"`)
  }

  console.log('Uploading images (originals from WordPress)')
  for (const art of manifest.artworks) {
    docs.push({
      _id: `artwork-${art.id}`,
      _type: 'artwork',
      title: art.title,
      image: await image({ source: art.source }),
      dimensions: art.dimensions,
      medium: art.medium,
      availability: art.availability,
    })
  }

  for (const gallery of manifest.galleries) {
    check(gallery.artworks, gallery.id)
    docs.push({ _id: gallery.id, _type: 'gallery', title: gallery.title, artworks: gallery.artworks.map(ref) })
  }

  const img = manifest.images
  const s = manifest.siteSettings
  docs.push({
    _id: 'siteSettings',
    _type: 'siteSettings',
    title: s.title,
    logo: await image(img.logo),
    icon: await image(img.icon),
    footerText: s.footerText,
    socialLinks: s.socialLinks.map((l) => ({ _type: 'socialLink', _key: key('s'), ...l })),
    seo: { _type: 'seo', description: s.seoDescription, image: await image(img.shareImage) },
  })

  const h = manifest.homePage
  check(h.featuredArtworks, 'homePage')
  docs.push({
    _id: 'homePage',
    _type: 'homePage',
    heroImage: await image(img.hero),
    heroText: h.heroText,
    featuredHeading: h.featuredHeading,
    featuredArtworks: h.featuredArtworks.map(ref),
  })

  const a = manifest.aboutPage
  docs.push({
    _id: 'aboutPage',
    _type: 'aboutPage',
    title: a.title,
    statementImage: await image(img.statementPortrait),
    statementHeading: a.statementHeading,
    statement: blocks(a.statement, 'st'),
    bioImage: await image(img.bioPortrait),
    bioHeading: a.bioHeading,
    bio: blocks(a.bio, 'bio'),
    recognitionHeading: a.recognitionHeading,
    recognition: a.recognition,
  })

  const c = manifest.contactPage
  docs.push({
    _id: 'contactPage',
    _type: 'contactPage',
    title: c.title,
    image: await image(img.contactImage),
    intro: blocks(c.intro, 'in'),
    pricingHeading: c.pricingHeading,
    pricing: c.pricing.map((row) => ({ _type: 'priceRow', _key: key('p'), ...row })),
    secondaryImage: await image(img.contactSecondary),
  })

  process.stdout.write('\n')
  return docs
}

// ---------- Run ----------

if (!SKIP_VERIFY) await verify()
const docs = await buildDocuments()

if (DRY_RUN) {
  await mkdir(outputDir, { recursive: true })
  const ndjson = [...dryRunAssets, ...docs].map((d) => JSON.stringify(d)).join('\n') + '\n'
  await writeFile(path.join(outputDir, 'dataset.ndjson'), ndjson)
  console.log(`✓ Dry run: ${docs.length} documents and ${dryRunAssets.length} images prepared.`)
  console.log(`  Wrote ${path.relative(root, path.join(outputDir, 'dataset.ndjson'))}. Nothing was sent to Sanity.`)
} else {
  const tx = client!.transaction()
  for (const doc of docs) (OVERWRITE ? tx.createOrReplace(doc) : tx.createIfNotExists(doc))
  await tx.commit({ visibility: 'sync' })
  console.log(
    OVERWRITE
      ? `✓ ${docs.length} documents created or replaced; ${assetIds.size} images uploaded or reused.`
      : `✓ ${docs.length} documents in place (new ones created, existing ones left untouched); ${assetIds.size} images uploaded or reused.`,
  )
}

import { createImageUrlBuilder } from '@sanity/image-url'

import { dataset, projectId } from './env'
import type { ImageValue } from './types'

const builder = createImageUrlBuilder({ projectId: projectId || 'unconfigured', dataset })

/** True when an image field has an uploaded asset. */
export function hasAsset<T extends { asset?: { _id: string } | null } | null | undefined>(
  image: T,
): image is NonNullable<T> & { asset: { _id: string } } {
  return Boolean(image?.asset?._id)
}

/** Natural aspect ratio (width / height) of an image asset, honouring any crop. */
export function aspectRatio(image: ImageValue): number {
  const dims = image.asset?.metadata?.dimensions
  const ratio = dims?.aspectRatio ?? (dims?.width && dims?.height ? dims.width / dims.height : 1)
  const crop = image.crop
  if (!crop) return ratio
  const w = 1 - (crop.left ?? 0) - (crop.right ?? 0)
  const h = 1 - (crop.top ?? 0) - (crop.bottom ?? 0)
  return w > 0 && h > 0 ? (ratio * w) / h : ratio
}

/**
 * Absolute URL for metadata (Open Graph, icons). `cover` crops around the
 * hotspot; `contain` fits the whole (cropped) image inside, padding the rest.
 */
export function imageUrl(
  image: ImageValue | null | undefined,
  width: number,
  height?: number,
  mode: 'cover' | 'contain' = 'cover',
): string | undefined {
  if (!hasAsset(image)) return undefined
  let b = builder.image(image).width(width).quality(80)
  if (height) b = b.height(height).fit(mode === 'cover' ? 'crop' : 'fill')
  // Icons stay PNG so transparency survives; other images use the best format the browser accepts.
  b = mode === 'contain' ? b.format('png') : b.auto('format')
  return b.url()
}

import { Image, type ImageProps } from 'next-sanity/image'

import { hasAsset } from '@/sanity/image'
import type { ImageValue } from '@/sanity/types'

type Props = Omit<ImageProps, 'src' | 'alt'> & {
  image: ImageValue | null | undefined
  /** Used when the editor left the alt text empty. */
  fallbackAlt?: string
  /**
   * Artwork is always shown whole: the stored crop and hotspot are ignored so
   * the full composition is delivered.
   */
  uncropped?: boolean
}

/**
 * Renders a Sanity image through next/image with the Sanity CDN loader
 * (responsive srcset, AVIF/WebP). Renders nothing if no image is uploaded.
 */
export function SanityImage({ image, fallbackAlt = '', uncropped, ...props }: Props) {
  if (!hasAsset(image)) return null

  const src = uncropped ? { ...image, crop: null, hotspot: null } : image
  const lqip = image.asset.metadata?.lqip

  return (
    <Image
      src={src}
      alt={image.alt?.trim() || fallbackAlt}
      placeholder={lqip ? 'blur' : 'empty'}
      {...props}
    />
  )
}

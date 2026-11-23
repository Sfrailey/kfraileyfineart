import type {
  ABOUT_QUERY_RESULT,
  CONTACT_QUERY_RESULT,
  GALLERY_QUERY_RESULT,
  HOME_QUERY_RESULT,
  SETTINGS_QUERY_RESULT,
} from './sanity.types'

/** Convenience aliases over the TypeGen output (`npm run typegen`). */
export type SiteSettings = NonNullable<SETTINGS_QUERY_RESULT>
export type AboutPage = NonNullable<ABOUT_QUERY_RESULT>
export type ContactPage = NonNullable<CONTACT_QUERY_RESULT>

/** Any image projection returned by our queries. */
export type ImageValue = NonNullable<SiteSettings['logo']>

type RawArtwork = NonNullable<NonNullable<GALLERY_QUERY_RESULT>['artworks']>[number]

/** One painting with a guaranteed image, as used by galleries, the home page and the lightbox. */
export type Artwork = Omit<RawArtwork, 'image'> & {
  image: ImageValue & { asset: NonNullable<ImageValue['asset']> }
}

export type GalleryPage = Omit<NonNullable<GALLERY_QUERY_RESULT>, 'artworks'> & { artworks: Artwork[] }
export type HomePage = Omit<NonNullable<HOME_QUERY_RESULT>, 'featuredArtworks'> & { featuredArtworks: Artwork[] }

export type RichText = NonNullable<AboutPage['statement']>

export type Seo = SiteSettings['seo']

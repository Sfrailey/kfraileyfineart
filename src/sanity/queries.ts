import { defineQuery } from 'next-sanity'

/*
 * All queries run with the `published` perspective (see client.ts), so drafts
 * are never returned. Image projections include the asset URL and dimensions
 * so the site can preserve each painting's natural aspect ratio, plus the LQIP
 * for a blurred placeholder while loading.
 */

// Reusable projection fragments (plain strings so TypeGen can follow them).
const imageFields = /* groq */ `
  _type,
  alt,
  crop,
  hotspot,
  asset->{
    _id,
    url,
    metadata { lqip, dimensions { width, height, aspectRatio } }
  }
`

const artworkFields = /* groq */ `
  _id,
  title,
  dimensions,
  medium,
  availability,
  description,
  image { ${imageFields} }
`

const seoFields = /* groq */ `
  seo { title, description, image { ${imageFields} } }
`

export const SETTINGS_QUERY = defineQuery(`
  *[_type == "siteSettings" && _id == "siteSettings"][0]{
    title,
    email,
    footerText,
    logo { ${imageFields} },
    icon { ${imageFields} },
    socialLinks[]{ _key, platform, url },
    ${seoFields}
  }
`)

export const HOME_QUERY = defineQuery(`
  *[_type == "homePage" && _id == "homePage"][0]{
    heroImage { ${imageFields} },
    heroText,
    featuredHeading,
    "featuredArtworks": featuredArtworks[defined(@->image.asset)]->{ ${artworkFields} },
    ${seoFields}
  }
`)

export const GALLERY_QUERY = defineQuery(`
  *[_type == "gallery" && _id == $id][0]{
    title,
    intro,
    "artworks": artworks[defined(@->image.asset)]->{ ${artworkFields} },
    ${seoFields}
  }
`)

export const ABOUT_QUERY = defineQuery(`
  *[_type == "aboutPage" && _id == "aboutPage"][0]{
    title,
    statementHeading,
    statement,
    statementImage { ${imageFields} },
    bioHeading,
    bio,
    bioImage { ${imageFields} },
    recognitionHeading,
    recognition,
    ${seoFields}
  }
`)

export const CONTACT_QUERY = defineQuery(`
  *[_type == "contactPage" && _id == "contactPage"][0]{
    title,
    intro,
    image { ${imageFields} },
    pricingHeading,
    pricing[]{ _key, size, price },
    formHeading,
    secondaryImage { ${imageFields} },
    ${seoFields}
  }
`)

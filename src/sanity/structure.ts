import { ImageIcon } from '@sanity/icons/Image'
import { ImagesIcon } from '@sanity/icons/Images'
import { WarningOutlineIcon } from '@sanity/icons/WarningOutline'
import type { StructureResolver } from 'sanity/structure'

import { GALLERIES } from './schemaTypes/gallery'
import { SINGLETONS } from './schemaTypes'

/**
 * Studio sidebar, organised the way the website is: one entry per page,
 * the two galleries, then the painting records themselves.
 */
export const structure: StructureResolver = (S) => {
  const singleton = (id: string) => {
    const s = SINGLETONS.find((item) => item.id === id)!
    return S.listItem()
      .id(s.id)
      .title(s.title)
      .schemaType(s.type)
      .child(S.document().schemaType(s.type).documentId(s.id).title(s.title))
  }

  return S.list()
    .title('Website')
    .items([
      singleton('homePage'),
      S.listItem()
        .title('Galleries')
        .icon(ImagesIcon)
        .child(
          S.list()
            .title('Galleries')
            .items(
              GALLERIES.map((g) =>
                S.listItem()
                  .id(g.id)
                  .title(g.title)
                  .icon(ImagesIcon)
                  .child(S.document().schemaType('gallery').documentId(g.id).title(g.title)),
              ),
            ),
        ),
      singleton('aboutPage'),
      singleton('contactPage'),
      S.divider(),
      S.listItem()
        .title('All artwork')
        .icon(ImageIcon)
        .child(S.documentTypeList('artwork').title('All artwork')),
      S.listItem()
        .title('Artwork not shown on the site')
        .icon(WarningOutlineIcon)
        .child(
          S.documentList()
            .title('Not in any gallery or on the home page')
            .schemaType('artwork')
            .filter('_type == "artwork" && count(*[_type in ["gallery", "homePage"] && references(^._id)]) == 0'),
        ),
      S.divider(),
      singleton('siteSettings'),
    ])
}

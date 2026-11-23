import { ImagesIcon } from '@sanity/icons/Images'
import { defineArrayMember, defineField, defineType } from 'sanity'

import { seoField, seoGroup } from './fields'

export { GALLERIES } from '../../lib/site'

export const galleryType = defineType({
  name: 'gallery',
  title: 'Gallery',
  type: 'document',
  icon: ImagesIcon,
  groups: [{ name: 'content', title: 'Content', default: true }, seoGroup],
  fields: [
    defineField({
      name: 'title',
      title: 'Page heading',
      type: 'string',
      group: 'content',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'intro',
      title: 'Introduction',
      type: 'text',
      rows: 3,
      group: 'content',
      description: 'Optional short text shown under the heading.',
    }),
    defineField({
      name: 'artworks',
      title: 'Paintings in this gallery',
      type: 'array',
      group: 'content',
      description:
        'Drag paintings to change their order. Click "Add item" to add an existing painting. Removing a painting here only removes it from this gallery; it is not deleted.',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'artwork' }] })],
      validation: (rule) => rule.unique().error('This painting is already in the gallery.'),
    }),
    seoField,
  ],
  preview: {
    select: { title: 'title', media: 'artworks.0.image', count: 'artworks.length' },
    prepare: ({ title, media }) => ({ title, media, subtitle: 'Gallery page' }),
  },
})

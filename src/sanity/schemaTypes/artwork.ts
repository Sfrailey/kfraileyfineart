import { ImageIcon } from '@sanity/icons/Image'
import { defineField, defineType } from 'sanity'

import { altField } from './fields'

export const AVAILABILITY = [
  { title: 'Not stated (nothing shown on the site)', value: 'unknown' },
  { title: 'Available', value: 'available' },
  { title: 'Sold', value: 'sold' },
] as const

export const artworkType = defineType({
  name: 'artwork',
  title: 'Artwork',
  type: 'document',
  icon: ImageIcon,
  description:
    'One painting. To show it on the website, add it to a gallery (Portfolio or Works in Plein Air) or to the home page.',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      description:
        'Upload the highest-quality photo you have. The whole painting is always shown uncropped on the website.',
      // No hotspot/crop on purpose: galleries always show the full composition.
      fields: [
        {
          ...altField(false),
          description:
            'Describe what the painting shows, e.g. "Golden aspens below a purple mountain ridge". If left empty, the title is used.',
        },
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'dimensions',
      title: 'Dimensions',
      type: 'string',
      description: 'Width × height, e.g. "18 × 24 in". Leave empty if unknown.',
    }),
    defineField({
      name: 'medium',
      title: 'Medium',
      type: 'string',
      description: 'e.g. "Oil on canvas", "Oil on board", "Oil on linen". Leave empty if unknown.',
    }),
    defineField({
      name: 'availability',
      title: 'Availability',
      type: 'string',
      description: 'Choose "Sold" to show a Sold label. "Not stated" shows nothing.',
      options: { list: [...AVAILABILITY], layout: 'radio' },
      initialValue: 'unknown',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 4,
      description: 'Optional notes shown when a visitor opens the painting.',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      dimensions: 'dimensions',
      medium: 'medium',
      availability: 'availability',
      media: 'image',
    },
    prepare({ title, dimensions, medium, availability, media }) {
      const parts = [dimensions, medium, availability === 'sold' ? 'Sold' : availability === 'available' ? 'Available' : null]
      return {
        title: title || 'Untitled artwork',
        subtitle: parts.filter(Boolean).join(' · '),
        media,
      }
    },
  },
  orderings: [
    { title: 'Title A–Z', name: 'titleAsc', by: [{ field: 'title', direction: 'asc' }] },
    { title: 'Recently added', name: 'createdDesc', by: [{ field: '_createdAt', direction: 'desc' }] },
  ],
})

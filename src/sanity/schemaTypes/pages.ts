import { CogIcon } from '@sanity/icons/Cog'
import { EnvelopeIcon } from '@sanity/icons/Envelope'
import { HomeIcon } from '@sanity/icons/Home'
import { UserIcon } from '@sanity/icons/User'
import { defineArrayMember, defineField, defineType } from 'sanity'

import { layoutImageField, richTextField, seoField, seoGroup } from './fields'

const contentGroup = { name: 'content', title: 'Content', default: true }

export const siteSettingsType = defineType({
  name: 'siteSettings',
  title: 'Site settings',
  type: 'document',
  icon: CogIcon,
  groups: [contentGroup, seoGroup],
  fields: [
    defineField({
      name: 'title',
      title: 'Site name',
      type: 'string',
      group: 'content',
      description: 'Used in browser tabs and search results, e.g. "Kristen Frailey Fine Art".',
      validation: (rule) => rule.required(),
    }),
    layoutImageField({
      name: 'logo',
      title: 'Logo',
      group: 'content',
      description:
        'Shown in the header and footer. A transparent PNG or SVG works best. Use "Crop" to trim empty space around the logo.',
    }),
    defineField({
      name: 'icon',
      title: 'Browser tab icon',
      type: 'image',
      group: 'content',
      description:
        'The small square icon shown in browser tabs. Use "Crop" to select a square part of the logo (for example the KF mark).',
      options: { hotspot: true },
    }),
    defineField({
      name: 'email',
      title: 'Public email address',
      type: 'email',
      group: 'content',
      description: 'Optional. If filled in, it is shown in the footer. (Form messages are delivered to the address set up by your developer.)',
    }),
    defineField({
      name: 'socialLinks',
      title: 'Social media links',
      type: 'array',
      group: 'content',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'socialLink',
          fields: [
            defineField({
              name: 'platform',
              title: 'Platform',
              type: 'string',
              options: { list: ['Instagram', 'Facebook', 'YouTube', 'TikTok', 'Pinterest', 'Other'] },
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'url',
              title: 'Link',
              type: 'url',
              validation: (rule) => rule.required().uri({ scheme: ['https', 'http'] }),
            }),
          ],
          preview: { select: { title: 'platform', subtitle: 'url' } },
        }),
      ],
    }),
    defineField({
      name: 'footerText',
      title: 'Footer copyright text',
      type: 'string',
      group: 'content',
    }),
    defineField({
      name: 'seo',
      title: 'Default search & sharing',
      type: 'seo',
      group: 'seo',
      description: 'Used for any page that does not set its own.',
    }),
  ],
  preview: { prepare: () => ({ title: 'Site settings' }) },
})

export const homePageType = defineType({
  name: 'homePage',
  title: 'Home page',
  type: 'document',
  icon: HomeIcon,
  groups: [contentGroup, seoGroup],
  fields: [
    layoutImageField({
      name: 'heroImage',
      title: 'Large top image',
      group: 'content',
      required: true,
      description:
        'Shown full width at the top of the home page. Click the image, then "Edit" (crop icon) and drag the hotspot circle onto the part that must always stay visible.',
    }),
    defineField({
      name: 'heroText',
      title: 'Text on the top image',
      type: 'string',
      group: 'content',
    }),
    defineField({
      name: 'featuredHeading',
      title: 'Featured section heading',
      type: 'string',
      group: 'content',
    }),
    defineField({
      name: 'featuredArtworks',
      title: 'Featured paintings',
      type: 'array',
      group: 'content',
      description: 'Choose the paintings shown on the home page and drag to reorder. Three works best.',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'artwork' }] })],
      validation: (rule) => rule.unique().max(9),
    }),
    seoField,
  ],
  preview: { prepare: () => ({ title: 'Home page' }) },
})

export const aboutPageType = defineType({
  name: 'aboutPage',
  title: 'About page',
  type: 'document',
  icon: UserIcon,
  groups: [contentGroup, seoGroup],
  fields: [
    defineField({ name: 'title', title: 'Page title', type: 'string', group: 'content', validation: (r) => r.required() }),
    layoutImageField({ name: 'statementImage', title: 'Photo beside the art statement', group: 'content' }),
    defineField({ name: 'statementHeading', title: 'Art statement heading', type: 'string', group: 'content' }),
    richTextField({ name: 'statement', title: 'Art statement', group: 'content' }),
    layoutImageField({ name: 'bioImage', title: 'Photo beside the bio', group: 'content' }),
    defineField({ name: 'bioHeading', title: 'Bio heading', type: 'string', group: 'content' }),
    richTextField({ name: 'bio', title: 'Bio', group: 'content' }),
    defineField({
      name: 'recognitionHeading',
      title: 'Representation & recognition heading',
      type: 'string',
      group: 'content',
    }),
    defineField({
      name: 'recognition',
      title: 'Representation & recognition',
      type: 'array',
      group: 'content',
      description: 'One line per show, festival or gallery. Drag to reorder.',
      of: [defineArrayMember({ type: 'string' })],
    }),
    seoField,
  ],
  preview: { prepare: () => ({ title: 'About page' }) },
})

export const contactPageType = defineType({
  name: 'contactPage',
  title: 'Contact page',
  type: 'document',
  icon: EnvelopeIcon,
  groups: [contentGroup, seoGroup],
  fields: [
    defineField({ name: 'title', title: 'Page title', type: 'string', group: 'content', validation: (r) => r.required() }),
    layoutImageField({ name: 'image', title: 'Image beside the introduction', group: 'content' }),
    richTextField({ name: 'intro', title: 'Introduction', group: 'content' }),
    defineField({ name: 'pricingHeading', title: 'Pricing heading', type: 'string', group: 'content' }),
    defineField({
      name: 'pricing',
      title: 'Commission pricing',
      type: 'array',
      group: 'content',
      description: 'One row per canvas size. Drag to reorder. Remove all rows to hide the pricing list.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'priceRow',
          fields: [
            defineField({ name: 'size', title: 'Size', type: 'string', description: 'e.g. "8 × 10"', validation: (r) => r.required() }),
            defineField({ name: 'price', title: 'Price', type: 'string', description: 'e.g. "$400"', validation: (r) => r.required() }),
          ],
          preview: { select: { title: 'size', subtitle: 'price' } },
        }),
      ],
    }),
    defineField({ name: 'formHeading', title: 'Form heading', type: 'string', group: 'content' }),
    layoutImageField({ name: 'secondaryImage', title: 'Image below the form', group: 'content' }),
    seoField,
  ],
  preview: { prepare: () => ({ title: 'Contact page' }) },
})

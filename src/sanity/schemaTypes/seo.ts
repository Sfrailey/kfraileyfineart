import { defineField, defineType } from 'sanity'

export const seoType = defineType({
  name: 'seo',
  title: 'Search & sharing',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Page title in search results',
      type: 'string',
      description: 'Optional. Leave empty to use the page heading.',
      validation: (rule) => rule.max(70).warning('Search engines usually show about 60 characters.'),
    }),
    defineField({
      name: 'description',
      title: 'Short description',
      type: 'text',
      rows: 3,
      description: 'Shown under the title in search results and when the page is shared.',
      validation: (rule) => rule.max(180).warning('Keep this under about 160 characters.'),
    }),
    defineField({
      name: 'image',
      title: 'Sharing image',
      type: 'image',
      description: 'Shown when the page is shared on social media. A landscape image works best.',
      options: { hotspot: true },
    }),
  ],
})

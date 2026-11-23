import { defineArrayMember, defineField, type FieldDefinition } from 'sanity'

/** Alt-text sub-field shared by every image field. */
function altField(required: boolean) {
  return defineField({
    name: 'alt',
    title: 'Image description (alt text)',
    type: 'string',
    description:
      'A short description of the image for visitors using screen readers, e.g. "Painting of a snow-covered peak glowing orange at sunset".',
    validation: (rule) =>
      required
        ? rule.required().error('Please describe the image for visitors using screen readers.')
        : rule.warning(),
  })
}

/**
 * A layout image (hero, portraits, logo). Hotspot and crop are enabled so the
 * editor can choose what stays in view when the layout crops the image.
 */
export function layoutImageField(
  options: { name: string; title: string; description?: string; required?: boolean; group?: string },
): FieldDefinition {
  return defineField({
    name: options.name,
    title: options.title,
    type: 'image',
    group: options.group,
    description: options.description,
    options: { hotspot: true },
    fields: [altField(true)],
    validation: (rule) => (options.required ? rule.required() : rule),
  })
}

/** Simple rich text: paragraphs with bold, italic and links. */
export function richTextField(options: {
  name: string
  title: string
  description?: string
  group?: string
}): FieldDefinition {
  return defineField({
    name: options.name,
    title: options.title,
    description: options.description,
    group: options.group,
    type: 'array',
    of: [
      defineArrayMember({
        type: 'block',
        styles: [{ title: 'Paragraph', value: 'normal' }],
        lists: [],
        marks: {
          decorators: [
            { title: 'Bold', value: 'strong' },
            { title: 'Italic', value: 'em' },
          ],
          annotations: [
            defineArrayMember({
              name: 'link',
              title: 'Link',
              type: 'object',
              fields: [
                defineField({
                  name: 'href',
                  title: 'Web address',
                  type: 'url',
                  validation: (rule) =>
                    rule.required().uri({ scheme: ['http', 'https', 'mailto', 'tel'], allowRelative: true }),
                }),
              ],
            }),
          ],
        },
      }),
    ],
  })
}

/** Search & sharing settings for a page. */
export const seoField = defineField({
  name: 'seo',
  title: 'Search & sharing',
  type: 'seo',
  group: 'seo',
  options: { collapsible: true, collapsed: true },
})

export const seoGroup = { name: 'seo', title: 'Search & sharing' }

export { altField }

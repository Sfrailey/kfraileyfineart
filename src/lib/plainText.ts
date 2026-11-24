import type { RichText } from '@/sanity/types'

/** Flattens Portable Text into plain paragraphs (for excerpts). */
export function toParagraphs(value: RichText | null | undefined): string[] {
  return (value ?? [])
    .map((block) =>
      block._type === 'block' && Array.isArray(block.children)
        ? block.children.map((child) => ('text' in child ? (child.text ?? '') : '')).join('')
        : '',
    )
    .map((text) => text.trim())
    .filter(Boolean)
}

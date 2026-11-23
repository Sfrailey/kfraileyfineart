import { PortableText, type PortableTextComponents } from 'next-sanity'
import Link from 'next/link'

import type { RichText as RichTextValue } from '@/sanity/types'

const components: PortableTextComponents = {
  marks: {
    link: ({ children, value }) => {
      const href: string = value?.href ?? ''
      if (href.startsWith('/')) return <Link href={href}>{children}</Link>
      const external = /^https?:/.test(href)
      return (
        <a href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
          {children}
        </a>
      )
    },
  },
}

export function RichText({ value }: { value: RichTextValue | null | undefined }) {
  if (!value?.length) return null
  return <PortableText value={value} components={components} />
}

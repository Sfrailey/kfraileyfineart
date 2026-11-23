import type { Metadata } from 'next'
import Link from 'next/link'

import { PageHeading } from '@/components/PageHeading'
import { SiteShell } from '@/components/SiteShell'
import { NAV_ITEMS } from '@/lib/site'

export const metadata: Metadata = { title: 'Page not found', robots: { index: false } }

export default function NotFound() {
  return (
    <SiteShell>
      <div className="container section">
        <PageHeading title="Page not found" intro="Sorry, that page doesn't exist or has moved." />
        <ul className="not-found-links">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="text-link">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </SiteShell>
  )
}

import { getSettings } from '@/sanity/loaders'

import { SiteFooter } from './SiteFooter'
import { SiteHeader } from './SiteHeader'

/** Header, main landmark and footer shared by every public page. */
export async function SiteShell({ children }: { children: React.ReactNode }) {
  const settings = await getSettings()
  return (
    <div className="site">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <SiteHeader settings={settings} />
      <main id="main" tabIndex={-1}>
        {children}
      </main>
      <SiteFooter settings={settings} />
    </div>
  )
}

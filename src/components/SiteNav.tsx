'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useId, useRef, useState } from 'react'

import styles from './SiteNav.module.css'

type NavItem = { href: string; label: string }

function isCurrent(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`)
}

/**
 * Primary navigation. Inline links on wide screens; a disclosure menu
 * (button + panel) on small screens. Closes on navigation, Escape, or a click
 * outside, and returns focus to the toggle when closed with Escape.
 */
export function SiteNav({ items }: { items: readonly NavItem[] }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [lastPath, setLastPath] = useState(pathname)
  const panelId = useId()
  const toggleRef = useRef<HTMLButtonElement>(null)
  const navRef = useRef<HTMLElement>(null)

  // Close the menu after a navigation (adjusting state during render).
  if (pathname !== lastPath) {
    setLastPath(pathname)
    setOpen(false)
  }

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        toggleRef.current?.focus()
      }
    }
    const onPointer = (e: PointerEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointer)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointer)
    }
  }, [open])

  return (
    <nav ref={navRef} aria-label="Main" className={styles.nav}>
      <button
        ref={toggleRef}
        type="button"
        className={styles.toggle}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        <span className={styles.toggleIcon} aria-hidden="true" data-open={open} />
        <span>Menu</span>
      </button>
      <ul id={panelId} className={styles.list} data-open={open}>
        {items.map((item) => {
          const current = isCurrent(pathname, item.href)
          return (
            <li key={item.href}>
              <Link href={item.href} className={styles.link} aria-current={current ? 'page' : undefined}>
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

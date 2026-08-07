import { useState, useEffect, useRef } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { useT } from '../i18n/ui.js'

const links = [
  { to: '/', key: 'nav.home', end: true },
  { to: '/products', key: 'nav.products' },
  { to: '/contact', key: 'nav.contact' },
]

export default function Header() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const t = useT()
  const toggleRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Keyboard users can dismiss the open drawer with Escape, same as clicking
  // the backdrop; focus returns to the toggle button so tab order stays sane.
  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false)
        toggleRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      {open && (
        <div className="nav-backdrop" aria-hidden="true" onClick={() => setOpen(false)} />
      )}
      <header className={`site-header${scrolled ? ' is-scrolled' : ''}`}>
        <div className="container header-inner">
        <Link to="/" className="brand" onClick={() => setOpen(false)} aria-label={t('brand.homeAria')}>
          <img
            src="/assets/brand/logo-badge.png"
            alt="Armtrex Ltd"
            className="brand-logo"
            width="273"
            height="273"
          />
        </Link>

        <button
          ref={toggleRef}
          className="nav-toggle"
          aria-expanded={open}
          aria-controls="primary-nav"
          aria-label={t('nav.toggle')}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="nav-toggle-bar" />
          <span className="nav-toggle-bar" />
          <span className="nav-toggle-bar" />
        </button>

        <nav
          id="primary-nav"
          className={`primary-nav ${open ? 'is-open' : ''}`}
          aria-label={t('nav.primary')}
        >
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) => (isActive ? 'nav-link is-active' : 'nav-link')}
              onClick={() => setOpen(false)}
            >
              {t(l.key)}
            </NavLink>
          ))}
        </nav>
        </div>
      </header>
    </>
  )
}

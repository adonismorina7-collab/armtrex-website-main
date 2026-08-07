import { useEffect, useState } from 'react'
import { useT } from '../i18n/ui.js'

// Escape hatch for long scrolls (notably the Products page). Appears once the
// user has scrolled down; scrolls smoothly back to the top.
export default function BackToTop() {
  const [show, setShow] = useState(false)
  const t = useT()

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 700)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <button
      type="button"
      className={`back-to-top ${show ? 'is-visible' : ''}`}
      aria-label={t('backToTop')}
      aria-hidden={!show}
      tabIndex={show ? 0 : -1}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 19V5M6 11l6-6 6 6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}

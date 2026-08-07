import { useLayoutEffect } from 'react'

// Elements that fade/rise into view as they enter the viewport. Block-level
// chunks and cards — never the hero (it has its own motion).
const SELECTORS = [
  '.section-head',
  '.brief-body',
  '.brief-card',
  '.capability-card',
  '.capability-cta',
  '.compliance-body',
  '.address-card',
  '.cred-item',
  '.page-hero .container',
  '.product-card',
  '.product-family-head',
  '.product-detail',
  '.contact-block',
  '.contact-form-wrap',
].join(',')

// Re-runs on `key` change (e.g. route path) so newly-rendered pages reveal too.
export default function useScrollReveal(key) {
  useLayoutEffect(() => {
    if (typeof window === 'undefined') return undefined
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce || !('IntersectionObserver' in window)) return undefined

    const els = Array.from(document.querySelectorAll(SELECTORS))
    // Add the hiding class before paint to avoid any flash of un-animated content.
    els.forEach((el) => el.classList.add('reveal'))

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed')
            io.unobserve(entry.target)
          }
        })
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
    )
    els.forEach((el) => io.observe(el))

    return () => io.disconnect()
  }, [key])
}

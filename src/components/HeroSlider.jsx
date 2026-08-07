import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { heroTeasers } from '../data/products.js'
import { useCategories } from '../i18n/content.js'
import { useT } from '../i18n/ui.js'

const INTERVAL = 8000

export default function HeroSlider() {
  const t = useT()
  const categories = useCategories()
  const catName = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.id, c.name])),
    [categories],
  )
  // Hero teasers are the public, non-sensitive subset of product data
  // (name/image/category only) — see src/data/products.js for why the full
  // catalogue isn't imported here.
  const slides = heroTeasers

  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const count = slides.length
  const timer = useRef(null)

  // Only the first slide's image loads up front; the others load once they
  // become current (we also prefetch the next one) so the homepage's initial
  // payload is one image, not four.
  const [loaded, setLoaded] = useState(() => new Set([0]))
  useEffect(() => {
    if (count <= 1) return
    setLoaded((prev) => {
      const next = new Set(prev)
      next.add(index)
      next.add((index + 1) % count)
      return next
    })
  }, [index, count])

  const go = useCallback((next) => setIndex(() => (next + count) % count), [count])

  useEffect(() => {
    if (paused || count <= 1) return undefined
    timer.current = setInterval(() => setIndex((i) => (i + 1) % count), INTERVAL)
    return () => clearInterval(timer.current)
  }, [paused, count])

  if (count === 0) return null

  return (
    <section
      className="hero"
      aria-roledescription="carousel"
      aria-label={t('hero.region')}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="hero-stage">
        {slides.map((p, i) => (
          <div
            key={p.slug}
            className={`hero-slide ${i === index ? 'is-active' : ''}`}
            aria-hidden={i !== index}
          >
            <div className="hero-figure">
              {loaded.has(i) && (
                <img
                  src={p.image}
                  alt={p.name}
                  loading={i === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                />
              )}
            </div>
          </div>
        ))}
        <div className="hero-overlay" />
      </div>

      <div className="container hero-content">
        {/* Keyed by index so the copy re-mounts and replays its entrance on each slide */}
        <div className="hero-copy" key={index}>
          <p className="hero-eyebrow">{t('hero.featured')} · {catName[slides[index].category]}</p>
          <h1 className="hero-title">{slides[index].name}</h1>
          {slides[index].highlights?.length > 0 && (
            <dl className="hero-stats">
              {slides[index].highlights
                .filter((h) => h.value)
                .slice(0, 3)
                .map((h) => (
                  <div className="hero-stat" key={h.label}>
                    <dt>{h.label}</dt>
                    <dd>{h.value}</dd>
                  </div>
                ))}
            </dl>
          )}
        </div>
        <div className="hero-actions">
          <Link to="/products" className="btn btn-primary">
            {t('hero.viewProducts')}
          </Link>
          <Link to="/contact" className="btn btn-ghost">
            {t('hero.contactUs')}
          </Link>
        </div>
      </div>

      {count > 1 && (
        <div className="hero-progress" aria-hidden="true">
          <span
            key={index}
            className="hero-progress-bar"
            style={{
              animationDuration: `${INTERVAL}ms`,
              animationPlayState: paused ? 'paused' : 'running',
            }}
          />
        </div>
      )}

      {count > 1 && (
        <>
          <button
            className="hero-arrow hero-arrow-prev"
            onClick={() => go(index - 1)}
            aria-label={t('hero.prev')}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="10,3 5,8 10,13" />
            </svg>
          </button>
          <button
            className="hero-arrow hero-arrow-next"
            onClick={() => go(index + 1)}
            aria-label={t('hero.next')}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="6,3 11,8 6,13" />
            </svg>
          </button>
          <div className="hero-controls container" role="group" aria-label={t('hero.controls')}>
            <div className="hero-dots">
              {slides.map((p, i) => (
                <button
                  key={p.slug}
                  className={`hero-dot ${i === index ? 'is-active' : ''}`}
                  aria-label={`${t('hero.goToSlide')} ${i + 1}: ${p.name}`}
                  aria-current={i === index}
                  onClick={() => setIndex(i)}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </section>
  )
}

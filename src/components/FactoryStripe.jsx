import { useT } from '../i18n/ui.js'

// Thin band of small factory photos (page 1 of the source deck) — a quick
// visual proof of the manufacturing footprint without a full photo section.
const PHOTOS = [
  '/assets/factory/factory-1.webp', // aerial site view
  '/assets/factory/factory-2.webp',
  '/assets/factory/factory-3.webp',
  '/assets/factory/factory-4.webp',
  '/assets/factory/factory-5.webp',
  '/assets/factory/factory-6.webp',
]

export default function FactoryStripe() {
  const t = useT()
  return (
    <div className="factory-stripe" aria-label={t('factory.kicker')}>
      <div className="container">
        <ul className="factory-stripe-row">
          {PHOTOS.map((src) => (
            <li key={src} className="factory-stripe-item">
              <img src={src} alt="" loading="lazy" decoding="async" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

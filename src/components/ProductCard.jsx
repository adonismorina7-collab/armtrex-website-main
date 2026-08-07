import { Link } from 'react-router-dom'
import { useT } from '../i18n/ui.js'
import { useCategories } from '../i18n/content.js'
import { splitProductName } from '../utils/productName.js'

export default function ProductCard({ product }) {
  const t = useT()
  const categories = useCategories()
  const catName = Object.fromEntries(categories.map((c) => [c.id, c.name]))
  const { slug, name, subtitle, category, image, description, highlights } = product
  const split = splitProductName(name)
  const main = subtitle ? name : split.main
  const sub = subtitle ? subtitle : split.sub

  return (
    <Link
      to={`/products/${category}/${slug}`}
      className="product-card"
      aria-label={`${t('card.view')} ${name}`}
    >
      <div className={`product-media ${image ? '' : 'is-empty'}`}>
        {image ? (
          <img src={image} alt={name} loading="lazy" decoding="async" />
        ) : (
          <div className="product-media-fallback" aria-hidden="true">
            <span>{t('card.noImage')}</span>
          </div>
        )}
        <span className="product-cat">{catName[category]}</span>
      </div>

      <div className="product-body">
        <h3 className="product-name">
          {main}
          {sub && <span className="product-name-sub">{sub}</span>}
        </h3>

        {highlights?.length > 0 ? (
          <dl className="product-highlights-mini">
            {highlights.map((h) => (
              <div className="phi-row" key={h.label}>
                <dt>{h.label}</dt>
                <dd>{h.value}</dd>
              </div>
            ))}
          </dl>
        ) : description ? (
          <p className="product-desc">{description}</p>
        ) : (
          <p className="product-desc product-desc-missing">
            {t('card.noDesc')}
          </p>
        )}

        <span className="product-more" aria-hidden="true">
          {t('card.viewDetails')}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M5 12h14M13 6l6 6-6 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>
    </Link>
  )
}

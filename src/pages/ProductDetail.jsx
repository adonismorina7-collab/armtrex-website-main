import { useParams, Link, Navigate } from 'react-router-dom'
import { useProducts, useCategories } from '../i18n/content.js'
import { useT } from '../i18n/ui.js'
import { splitProductName } from '../utils/productName.js'

export default function ProductDetail() {
  const { catId, slug } = useParams()
  const products = useProducts()
  const categories = useCategories()
  const t = useT()

  const catName = Object.fromEntries(categories.map((c) => [c.id, c.name]))
  const product = products.find((p) => p.slug === slug)

  if (!product) {
    return <Navigate to="/products" replace />
  }

  const { name, subtitle, category, image, description, highlights, systems } = product
  // With a subtitle, the full name stays on line 1 and the subtitle is line 2;
  // otherwise a trailing "(...)" in the name becomes the second line.
  const split = splitProductName(name)
  const main = subtitle ? name : split.main
  const sub = subtitle ? subtitle : split.sub

  // Canonicalise: the category segment must match the product's own
  // category (e.g. an old or hand-edited /products/<wrong>/<slug> link).
  if (catId !== category) {
    return <Navigate to={`/products/${category}/${slug}`} replace />
  }

  return (
    <section className="section product-detail-section">
      <div className="container">
        <nav className="breadcrumb" aria-label={t('detail.breadcrumb')}>
          <Link to="/products">{t('nav.products')}</Link>
          <span aria-hidden="true" className="breadcrumb-sep">›</span>
          <Link to={`/products/${category}`}>{catName[category]}</Link>
          <span aria-hidden="true" className="breadcrumb-sep">›</span>
          <span aria-current="page">{split.sub ? `${split.main} — ${split.sub}` : split.main}</span>
        </nav>

        <article className="product-detail">
          <div className={`product-detail-media ${image ? '' : 'is-empty'}`}>
            {image ? (
              <img src={image} alt={name} decoding="async" />
            ) : (
              <div className="product-media-fallback" aria-hidden="true">
                <span>No product image available</span>
              </div>
            )}
          </div>

          <div className="product-detail-body">
            <span className="product-detail-cat">{catName[category]}</span>
            <h1 className="product-detail-name">
              {main}
              {sub && <span className="product-detail-name-sub">{sub}</span>}
            </h1>

            {highlights?.length > 0 && (
              <dl className="product-highlights">
                {highlights.map((h) => (
                  <div className="highlight" key={h.label}>
                    <dt>{h.label}</dt>
                    <dd>{h.value}</dd>
                  </div>
                ))}
              </dl>
            )}

            {description ? (
              <p className="product-detail-desc">{description}</p>
            ) : (
              <p className="product-detail-desc product-desc-missing">
                {t('detail.noDesc')}
              </p>
            )}

            {systems && (
              <p className="product-systems">
                <span className="product-systems-label">{t('detail.systems')}</span>
                {systems}
              </p>
            )}

            <div className="product-detail-actions">
              <Link to="/products" className="btn btn-ghost">
                {t('detail.back')}
              </Link>
              <Link to={`/contact?product=${slug}`} className="btn btn-primary">
                {t('detail.enquire')}
              </Link>
            </div>
          </div>
        </article>
      </div>
    </section>
  )
}

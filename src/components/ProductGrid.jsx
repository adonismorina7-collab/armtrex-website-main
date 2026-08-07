import { useMemo, useState, Fragment } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { useProducts, useCategories } from '../i18n/content.js'
import { useT } from '../i18n/ui.js'
import ProductCard from './ProductCard.jsx'
import { splitProductName } from '../utils/productName.js'

// Pull a highlight value by a fuzzy label match (Caliber / *velocity / *range).
const hv = (p, ...needles) => {
  const h = p.highlights?.find((x) => needles.some((n) => x.label.toLowerCase().includes(n)))
  return h?.value || '—'
}

export default function ProductGrid() {
  const products = useProducts()
  const categories = useCategories()
  const t = useT()
  const [view, setView] = useState('item') // 'item' (default) | 'table'

  // The active category lives in the URL so links are shareable:
  //   /products            → All Products
  //   /products/:catId     → a single category (e.g. /products/mortar)
  const { catId } = useParams()
  const known = categories.some((c) => c.id === catId)
  const active = catId && known ? catId : 'all'

  const filters = useMemo(
    () => [{ id: 'all', name: t('products.all') }, ...categories],
    [categories, t],
  )

  const visible = useMemo(
    () => (active === 'all' ? products : products.filter((p) => p.category === active)),
    [active, products],
  )

  const counts = useMemo(() => {
    const map = { all: products.length }
    for (const c of categories) {
      map[c.id] = products.filter((p) => p.category === c.id).length
    }
    return map
  }, [products, categories])

  // Per-category families (a single family when filtered), keeping a clean
  // heading hierarchy: h1 (page) → h2 (family) → h3 (product).
  const groups = useMemo(() => {
    const cats = active === 'all' ? categories : categories.filter((c) => c.id === active)
    return cats
      .map((c) => ({ cat: c, items: products.filter((p) => p.category === c.id) }))
      .filter((g) => g.items.length > 0)
  }, [active, products, categories])

  // An unrecognised :catId is either a legacy flat product link
  // (/products/<slug>) — redirect it to its new nested home — or junk,
  // in which case fall back to the full catalogue. This check runs after
  // all hooks above so hook order never varies between renders.
  if (catId && !known) {
    const legacy = products.find((p) => p.slug === catId)
    return (
      <Navigate
        to={legacy ? `/products/${legacy.category}/${legacy.slug}` : '/products'}
        replace
      />
    )
  }

  return (
    <div className="product-grid-wrap">
      <div className="product-filters" role="tablist" aria-label={t('products.filterAria')}>
        {filters.map((f) => (
          <Link
            key={f.id}
            to={f.id === 'all' ? '/products' : `/products/${f.id}`}
            role="tab"
            aria-selected={active === f.id}
            className={`filter-chip ${active === f.id ? 'is-active' : ''}`}
          >
            {f.name}
            <span className="filter-count">{counts[f.id]}</span>
          </Link>
        ))}
      </div>

      <div className="product-toolbar">
        <p className="product-count" aria-live="polite">
          {t('products.showing')} {visible.length}{' '}
          {visible.length === 1 ? t('products.product') : t('products.products')}
        </p>

        <div className="view-toggle" role="group" aria-label={t('view.label')}>
          <button
            type="button"
            className={`view-btn ${view === 'item' ? 'is-active' : ''}`}
            aria-pressed={view === 'item'}
            onClick={() => setView('item')}
          >
            <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <rect x="1" y="1" width="6" height="6" rx="1" />
              <rect x="9" y="1" width="6" height="6" rx="1" />
              <rect x="1" y="9" width="6" height="6" rx="1" />
              <rect x="9" y="9" width="6" height="6" rx="1" />
            </svg>
            {t('view.item')}
          </button>
          <button
            type="button"
            className={`view-btn ${view === 'table' ? 'is-active' : ''}`}
            aria-pressed={view === 'table'}
            onClick={() => setView('table')}
          >
            <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <rect x="1" y="2" width="14" height="2.4" rx="1" />
              <rect x="1" y="6.8" width="14" height="2.4" rx="1" />
              <rect x="1" y="11.6" width="14" height="2.4" rx="1" />
            </svg>
            {t('view.table')}
          </button>
        </div>
      </div>

      {view === 'item' ? (
        <div className="product-grid">
          {groups.map((g) => (
            <Fragment key={g.cat.id}>
              <div className="product-family-head">
                <h2 className="product-family-name">{g.cat.name}</h2>
                <span className="product-family-count">
                  {g.items.length} {g.items.length === 1 ? t('products.item') : t('products.items')}
                </span>
              </div>
              {g.items.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </Fragment>
          ))}
        </div>
      ) : (
        <div className="product-tables">
          {groups.map((g) => (
            <Fragment key={g.cat.id}>
              <div className="product-family-head">
                <h2 className="product-family-name">{g.cat.name}</h2>
                <span className="product-family-count">
                  {g.items.length} {g.items.length === 1 ? t('products.item') : t('products.items')}
                </span>
              </div>
              <div className="product-table-wrap">
                <table className="product-table">
                  <thead>
                    <tr>
                      <th scope="col">{t('table.product')}</th>
                      <th scope="col">{t('table.caliber')}</th>
                      <th scope="col">{t('table.velocity')}</th>
                      <th scope="col">{t('table.range')}</th>
                      <th scope="col">
                        <span className="sr-only">{t('table.view')}</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {g.items.map((p) => {
                      const { main, sub } = splitProductName(p.name)
                      const to = `/products/${p.category}/${p.slug}`
                      return (
                        <tr key={p.slug}>
                          <td className="pt-name">
                            <Link to={to}>
                              {main}
                              {sub && <span className="pt-sub"> — {sub}</span>}
                            </Link>
                          </td>
                          <td>{hv(p, 'caliber')}</td>
                          <td>{hv(p, 'velocity')}</td>
                          <td>{hv(p, 'range')}</td>
                          <td className="pt-action">
                            <Link to={to}>{t('table.view')} →</Link>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </Fragment>
          ))}
        </div>
      )}
    </div>
  )
}

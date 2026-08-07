import ProductGrid from '../components/ProductGrid.jsx'
import { useT } from '../i18n/ui.js'

export default function Products() {
  const t = useT()
  return (
    <>
      <section className="page-hero" aria-labelledby="products-heading">
        <div className="container">
          <span className="kicker">{t('products.kicker')}</span>
          <h1 id="products-heading">{t('products.heading')}</h1>
          <p className="page-lead">{t('products.lead')}</p>
        </div>
      </section>

      <section className="section products-section">
        <div className="container">
          <ProductGrid />
        </div>
      </section>
    </>
  )
}

import { Link } from 'react-router-dom'
import { useCatalog } from '../access/CatalogContext.jsx'
import { useT } from '../i18n/ui.js'

export default function ProductGate({ children }) {
  const { status } = useCatalog()
  const t = useT()

  if (status === 'granted') return children

  if (status === 'checking') {
    return (
      <section className="section gate-section" aria-live="polite">
        <div className="container gate-panel">
          <p>{t('gate.checking')}</p>
        </div>
      </section>
    )
  }

  return (
    <section className="section gate-section" aria-labelledby="gate-heading">
      <div className="container gate-panel">
        <span className="kicker">{t('gate.kicker')}</span>
        <h1 id="gate-heading">{t('gate.heading')}</h1>
        <p className="page-lead">{t('gate.lead')}</p>
        {status === 'error' && <p className="form-notice form-notice-error">{t('gate.error')}</p>}
        <div className="gate-actions">
          <Link to="/kyc" className="btn btn-primary">
            {t('gate.cta')}
          </Link>
          <Link to="/" className="btn btn-ghost">
            {t('gate.home')}
          </Link>
        </div>
      </div>
    </section>
  )
}

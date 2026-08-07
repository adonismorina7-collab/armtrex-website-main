import { Link } from 'react-router-dom'
import HeroSlider from '../components/HeroSlider.jsx'
import CompanyBrief from '../components/CompanyBrief.jsx'
import FactoryStripe from '../components/FactoryStripe.jsx'
import CredentialsBand from '../components/CredentialsBand.jsx'
import AddressSection from '../components/AddressSection.jsx'
import { useCompany } from '../i18n/content.js'
import { useT } from '../i18n/ui.js'

// Production photo per capability card, by order. ?v bust cached copies
// when the underlying photos are swapped.
const CAP_IMAGES = [
  '/assets/production/defence-manufacturing.webp?v=3', // Defence Manufacturing
  '/assets/production/charge-systems.webp?v=1', // Propellants & Charge Systems
  '/assets/production/industrial-capabilities.webp?v=1', // Industrial Capabilities
]

export default function Home() {
  const company = useCompany()
  const t = useT()

  return (
    <>
      <HeroSlider />
      <FactoryStripe />
      <CompanyBrief />

      <section className="section capabilities" aria-labelledby="cap-heading">
        <div className="container">
          <div className="section-head">
            <span className="kicker">{t('cap.kicker')}</span>
            <h2 id="cap-heading">{t('cap.heading')}</h2>
          </div>

          <div className="capability-grid">
            {company.coreActivities.map((group, i) => (
              <article key={group.title} className="capability-card">
                <div className={`capability-media ${CAP_IMAGES[i] ? '' : 'is-empty'}`}>
                  {CAP_IMAGES[i] && (
                    <img src={CAP_IMAGES[i]} alt="" loading="lazy" decoding="async" />
                  )}
                </div>
                <div className="capability-body">
                  <h3>{group.title}</h3>
                  <ul>
                    {group.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>

          <div className="capability-cta">
            <p>
              {t('cap.cta')}
            </p>
            <Link to="/products" className="btn btn-primary">
              {t('cap.viewAll')}
            </Link>
          </div>
        </div>
      </section>

      <section className="section compliance-strip" aria-labelledby="compliance-heading">
        <div className="container">
          <div className="section-head">
            <span className="kicker">{t('compliance.kicker')}</span>
            <h2 id="compliance-heading">{t('compliance.heading')}</h2>
          </div>
          <div className="compliance-body">
            {company.compliance.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
          {company.certifications?.length > 0 && (
            <p className="compliance-cert">
              <span className="compliance-cert-label">{t('cred.certification')}:</span>{' '}
              {company.certifications.join(' · ')}
            </p>
          )}
        </div>
      </section>

      <CredentialsBand />

      <AddressSection />
    </>
  )
}

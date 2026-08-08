import { useCompany } from '../i18n/content.js'
import { useT } from '../i18n/ui.js'

const BuildingIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="4" y="3" width="16" height="18" rx="1" stroke="currentColor" strokeWidth="1.7" />
    <path d="M8 7h2M14 7h2M8 11h2M14 11h2M8 15h2M14 15h2M10 21v-4h4v4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
  </svg>
)
const ContactIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.7" />
    <path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
  </svg>
)

export default function AddressSection() {
  const company = useCompany()
  const t = useT()
  const { headquarters } = company.addresses
  const { contact } = company

  return (
    <section className="section address-section" aria-labelledby="address-heading">
      <div className="container">
        <div className="section-head">
          <span className="kicker">{t('loc.kicker')}</span>
          <h2 id="address-heading">{t('loc.heading')}</h2>
        </div>

        <div className="address-grid">
          <article className="address-card">
            <div className="address-card-icon" aria-hidden="true">
              <BuildingIcon />
            </div>
            <span className="address-eyebrow">{headquarters.label}</span>
            <address>
              {headquarters.lines.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </address>
          </article>

          <article className="address-card address-contact">
            <div className="address-card-icon" aria-hidden="true">
              <ContactIcon />
            </div>
            <span className="address-eyebrow">{t('loc.directContact')}</span>
            <ul>
              <li>
                <span className="address-label">{t('loc.email')}</span>
                <a href={`mailto:${contact.email}`}>{contact.email}</a>
              </li>
              <li>
                <span className="address-label">{t('loc.website')}</span>
                <a
  href={`https://${contact.website}`}
  target="_blank"
  rel="noopener noreferrer"
>
  {contact.website}
</a>
              </li>
            </ul>
          </article>
        </div>
      </div>
    </section>
  )
}

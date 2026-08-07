import { useCompany } from '../i18n/content.js'

const ICONS = {
  certification: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8.5 12.5 7 21l5-2.5 5 2.5-1.5-8.5" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  ),
  regulatory: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3v18M7 7l-4 8a4 4 0 0 0 8 0L7 7ZM17 7l-4 8a4 4 0 0 0 8 0l-4-8ZM4 21h16M12 3l-5 2M12 3l5 2"
            stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  governance: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
}

export default function CredentialsBand() {
  const company = useCompany()
  const items = company.credentials || []
  if (!items.length) return null

  return (
    <section className="section credentials-band" aria-label="Certifications and regulatory credentials">
      <div className="container credentials-grid">
        {items.map((item) => (
          <article className="credential-card" key={item.label}>
            <div className="credential-icon" aria-hidden="true">
              {ICONS[item.kind] || ICONS.certification}
            </div>
            <span className="credential-label">{item.label}</span>
            <p className="credential-value">{item.value}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

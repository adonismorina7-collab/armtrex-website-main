import { useCompany } from '../i18n/content.js'
import { useT } from '../i18n/ui.js'

// Serial-plate credibility strip — surfaces the qualification signals a defence
// procurement officer scans for (registration, export status, certification)
// directly below the hero instead of burying them in the footer.
export default function CredibilityBar() {
  const company = useCompany()
  const t = useT()

  const items = [
    { label: t('cred.exportStatus'), value: t('cred.exportStatusValue') },
    { label: t('cred.certification'), value: company.certifications.join(' · ') },
  ]

  return (
    <div className="credibility-bar">
      <div className="container credibility-inner" aria-label={t('cred.aria')}>
        {items.map((item, i) => (
          <div className="cred-item" key={item.label}>
            <span className="cred-label">{item.label}</span>
            <span className="cred-value">{item.value}</span>
            {i < items.length - 1 && <span className="cred-sep" aria-hidden="true" />}
          </div>
        ))}
      </div>
    </div>
  )
}

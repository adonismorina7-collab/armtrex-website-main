import { useSearchParams } from 'react-router-dom'
import ContactForm from '../components/ContactForm.jsx'
import { useCompany, useProducts, useCategories } from '../i18n/content.js'
import { useT } from '../i18n/ui.js'

export default function Contact() {
  const company = useCompany()
  const products = useProducts()
  const categories = useCategories()
  const t = useT()

  const catName = Object.fromEntries(categories.map((c) => [c.id, c.name]))
  const { contact, addresses } = company

  const [searchParams] = useSearchParams()
  const enquiryProduct = products.find((p) => p.slug === searchParams.get('product'))

  const prefill = enquiryProduct
    ? {
        subject: `${t('prefill.subject')}: ${enquiryProduct.name}`,
        message: `${t('prefill.message')} ${enquiryProduct.name} (${catName[enquiryProduct.category]}).\n\n`,
      }
    : null

  return (
    <>
      <section className="page-hero contact-hero" aria-labelledby="contact-heading">
        <div className="container">
          <span className="kicker">{t('contact.kicker')}</span>
          <h1 id="contact-heading">{t('contact.heading')}</h1>
          <p className="page-lead">{t('contact.lead')}</p>
        </div>
      </section>

      <section className="section contact-section">
        <div className="container contact-layout">
          <div className="contact-details">
            <article className="contact-block">
              <h2>{addresses.headquarters.label}</h2>
              <address>
                {addresses.headquarters.lines.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </address>
            </article>

            <article className="contact-block">
              <h2>{t('contact.directLines')}</h2>
              <ul className="contact-list">
                <li>
                  <span className="contact-label">{t('loc.email')}</span>
                  <a href={`mailto:${contact.email}`}>{contact.email}</a>
                </li>
                <li>
                  <span className="contact-label">{t('loc.website')}</span>
                  <span>{contact.website}</span>
                </li>
              </ul>
            </article>

            <article className="contact-block contact-compliance-note">
              <div className="compliance-note-icon" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                  <path d="M12 8v5M12 16h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <h2>{t('contact.complianceLabel')}</h2>
                <p className="compliance-note-text">{t('contact.complianceNote')}</p>
              </div>
            </article>
          </div>

          <div className="contact-form-wrap">
            <h2>{t('contact.sendEnquiry')}</h2>
            {enquiryProduct && (
              <p className="enquiry-context">
                <span className="enquiry-context-label">{t('contact.regarding')}</span>
                <span className="enquiry-context-value">{enquiryProduct.name}</span>
              </p>
            )}
            <ContactForm key={enquiryProduct ? enquiryProduct.slug : 'general'} prefill={prefill} />
          </div>
        </div>
      </section>
    </>
  )
}

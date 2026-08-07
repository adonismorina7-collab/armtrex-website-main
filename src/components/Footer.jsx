import { Link } from 'react-router-dom'
import { useCompany } from '../i18n/content.js'
import { useT } from '../i18n/ui.js'

export default function Footer() {
  const company = useCompany()
  const t = useT()
  const year = new Date().getFullYear()

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-col footer-brand">
          <img
            src="/assets/brand/logo-badge.png"
            alt="Armtrex Ltd"
            className="footer-logo"
            width="273"
            height="273"
          />
          <p className="footer-legal">{company.legalName}</p>
          <p className="footer-reg">
            {t('footer.regNo')} {company.registrationNumber}
          </p>
          <a
            className="footer-website"
            href={`https://${company.contact.website}`}
            target="_blank"
            rel="noreferrer"
          >
            {company.contact.website}
          </a>
        </div>

        <nav className="footer-col footer-nav" aria-label={t('nav.footer')}>
          <h2>{t('footer.navigation')}</h2>
          <Link to="/">{t('nav.home')}</Link>
          <Link to="/products">{t('nav.products')}</Link>
          <Link to="/contact">{t('nav.contact')}</Link>
        </nav>
      </div>

      <div className="footer-bar">
        <div className="container">
          <p>© {year} {company.legalName}. {t('footer.rights')}</p>
        </div>
      </div>
    </footer>
  )
}

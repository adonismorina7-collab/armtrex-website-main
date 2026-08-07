import { useState } from 'react'
import { company } from '../data/company.js'
import { useT } from '../i18n/ui.js'

const EMPTY = { name: '', email: '', company: '', subject: '', message: '' }

// Where the form is delivered. The site POSTs to a same-origin endpoint that
// nginx reverse-proxies to a small mail relay on the server, which sends the
// enquiry through Proton SMTP to info@armtrex.co.uk. No third party sees the data.
const ENDPOINT = '/api/contact'

// Builds the mailto: fallback used only if the server is unreachable.
function buildMailto(t, values) {
  const subject = `${t('form.mailPrefix')} ${values.subject}`
  const body = [
    `${t('form.bodyName')}: ${values.name}`,
    `${t('form.bodyEmail')}: ${values.email}`,
    values.company.trim() && `${t('form.bodyCompany')}: ${values.company}`,
    '',
    values.message,
  ]
    .filter(Boolean)
    .join('\n')
  return `mailto:${company.contact.email}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`
}

export default function ContactForm({ prefill = null }) {
  const t = useT()
  const [values, setValues] = useState(() => ({ ...EMPTY, ...prefill }))
  const [status, setStatus] = useState('idle') // idle | error | sending | sent | failed
  const [errors, setErrors] = useState({})

  const update = (e) => {
    const { name, value } = e.target
    setValues((v) => ({ ...v, [name]: value }))
    setErrors((er) => ({ ...er, [name]: false }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (status === 'sending') return

    const required = ['name', 'email', 'subject', 'message']
    const missing = {}
    required.forEach((k) => {
      if (!values[k].trim()) missing[k] = true
    })
    if (Object.keys(missing).length) {
      setErrors(missing)
      setStatus('error')
      requestAnimationFrame(() => {
        document
          .querySelector('.form-notice')
          ?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      })
      return
    }

    setErrors({})
    setStatus('sending')
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          company: values.company,
          subject: values.subject,
          message: values.message,
          _gotcha: values._gotcha || '',
        }),
      })
      if (!res.ok) throw new Error('send failed')
      setValues({ ...EMPTY })
      setStatus('sent')
    } catch {
      // Server unreachable — fall back to the visitor's mail client so the
      // enquiry is never simply lost.
      setStatus('failed')
    }
    requestAnimationFrame(() => {
      document
        .querySelector('.form-notice')
        ?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    })
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit} noValidate>
      {/* Error notice at top so the user sees it immediately without scrolling past the submit button */}
      {status === 'error' && (
        <div className="form-notice form-notice-error" role="alert">
          {t('form.error')}
        </div>
      )}

      <div className="form-row">
        <div className={`field ${errors.name ? 'has-error' : ''}`}>
          <label htmlFor="cf-name">{t('form.name')} <span aria-hidden="true">*</span></label>
          <input
            id="cf-name"
            name="name"
            type="text"
            required
            autoComplete="name"
            maxLength={200}
            value={values.name}
            onChange={update}
            aria-required="true"
            aria-invalid={errors.name ? 'true' : 'false'}
            aria-describedby={errors.name ? 'cf-name-err' : undefined}
          />
          {errors.name && (
            <p id="cf-name-err" className="field-error">{t('form.fieldRequired')}</p>
          )}
        </div>
        <div className={`field ${errors.email ? 'has-error' : ''}`}>
          <label htmlFor="cf-email">{t('form.email')} <span aria-hidden="true">*</span></label>
          <input
            id="cf-email"
            name="email"
            type="email"
            inputMode="email"
            required
            autoComplete="email"
            maxLength={200}
            value={values.email}
            onChange={update}
            aria-required="true"
            aria-invalid={errors.email ? 'true' : 'false'}
            aria-describedby={errors.email ? 'cf-email-err' : undefined}
          />
          {errors.email && (
            <p id="cf-email-err" className="field-error">{t('form.fieldRequired')}</p>
          )}
        </div>
      </div>

      <div className="field">
        <label htmlFor="cf-company">{t('form.company')}</label>
        <input
          id="cf-company"
          name="company"
          type="text"
          autoComplete="organization"
          maxLength={200}
          value={values.company}
          onChange={update}
        />
      </div>

      <div className={`field ${errors.subject ? 'has-error' : ''}`}>
        <label htmlFor="cf-subject">{t('form.subject')} <span aria-hidden="true">*</span></label>
        <input
          id="cf-subject"
          name="subject"
          type="text"
          required
          maxLength={300}
          value={values.subject}
          onChange={update}
          aria-required="true"
          aria-invalid={errors.subject ? 'true' : 'false'}
          aria-describedby={errors.subject ? 'cf-subject-err' : undefined}
        />
        {errors.subject && (
          <p id="cf-subject-err" className="field-error">{t('form.fieldRequired')}</p>
        )}
      </div>

      <div className={`field ${errors.message ? 'has-error' : ''}`}>
        <label htmlFor="cf-message">{t('form.message')} <span aria-hidden="true">*</span></label>
        <textarea
          id="cf-message"
          name="message"
          rows="6"
          required
          maxLength={5000}
          value={values.message}
          onChange={update}
          aria-required="true"
          aria-invalid={errors.message ? 'true' : 'false'}
          aria-describedby={errors.message ? 'cf-message-err' : undefined}
        />
        {errors.message && (
          <p id="cf-message-err" className="field-error">{t('form.fieldRequired')}</p>
        )}
      </div>

      {/* Honeypot — hidden from people, tempting to bots. Submissions with it
          filled are silently dropped server-side. */}
      <div className="hp-field" aria-hidden="true">
        <label htmlFor="cf-website">Website</label>
        <input
          id="cf-website"
          name="_gotcha"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={values._gotcha || ''}
          onChange={update}
        />
      </div>

      {status === 'sent' && (
        <div className="form-notice" role="status">
          {t('form.sentThanks')}
        </div>
      )}

      {status === 'failed' && (
        <div className="form-notice form-notice-error" role="alert">
          {t('form.failed')}{' '}
          <a href={buildMailto(t, values)}>{company.contact.email}</a>.
        </div>
      )}

      <button type="submit" className="btn btn-primary" disabled={status === 'sending'}>
        {status === 'sending' ? t('form.sending') : t('form.send')}
      </button>
    </form>
  )
}

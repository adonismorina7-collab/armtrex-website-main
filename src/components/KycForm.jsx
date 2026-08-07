import { useState } from 'react'
import { company } from '../data/company.js'

const ENDPOINT = '/api/kyc'

const EMPTY = {
  fullLegalName: '',
  previousNames: '',
  dob: '',
  citizenships: '',
  passportNumber: '',
  passportCountry: '',
  passportIssue: '',
  passportExpiry: '',
  employerName: '',
  employerId: '',
  employerAddress: '',
  employerWebsite: '',
  officialContact: '',
  title: '',
  tenure: '',
  militaryRank: '',
  clearanceLevel: '',
  govServiceHistory: '',
  govAffiliation: '',
  endUserStatus: 'end-user',
  declaration: false,
  _gotcha: '',
}

const REQUIRED = [
  'fullLegalName',
  'dob',
  'citizenships',
  'passportNumber',
  'passportCountry',
  'employerName',
  'title',
]

export default function KycForm() {
  const [values, setValues] = useState(EMPTY)
  const [passportFile, setPassportFile] = useState(null)
  const [brokerFile, setBrokerFile] = useState(null)
  const [status, setStatus] = useState('idle') // idle | error | sending | sent | failed
  const [errors, setErrors] = useState({})

  const update = (e) => {
    const { name, value, type, checked } = e.target
    setValues((v) => ({ ...v, [name]: type === 'checkbox' ? checked : value }))
    setErrors((er) => ({ ...er, [name]: false }))
  }

  const scrollToNotice = () => {
    requestAnimationFrame(() => {
      document.querySelector('.form-notice')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (status === 'sending') return

    const missing = {}
    REQUIRED.forEach((k) => {
      if (!values[k].trim()) missing[k] = true
    })
    if (!passportFile) missing.passportFile = true
    if (values.endUserStatus === 'broker' && !brokerFile) missing.brokerFile = true
    if (!values.declaration) missing.declaration = true

    if (Object.keys(missing).length) {
      setErrors(missing)
      setStatus('error')
      scrollToNotice()
      return
    }

    setErrors({})
    setStatus('sending')
    try {
      const fd = new FormData()
      Object.entries(values).forEach(([k, v]) => fd.append(k, typeof v === 'boolean' ? String(v) : v))
      fd.append('passportCopy', passportFile)
      if (brokerFile) fd.append('brokerLicense', brokerFile)

      const res = await fetch(ENDPOINT, { method: 'POST', body: fd })
      if (!res.ok) throw new Error('send failed')
      setValues(EMPTY)
      setPassportFile(null)
      setBrokerFile(null)
      setStatus('sent')
    } catch {
      setStatus('failed')
    }
    scrollToNotice()
  }

  return (
    <form className="contact-form kyc-form" onSubmit={handleSubmit} noValidate encType="multipart/form-data">
      {status === 'error' && (
        <div className="form-notice form-notice-error" role="alert">
          Please complete all required fields, attach a copy of your passport, and accept the declaration below.
        </div>
      )}

      <div className="kyc-mandatory-note">
        <strong>Mandatory attachment:</strong> a legible copy of your passport bio-data page must be
        attached. Requests without it will not be processed.
      </div>

      <h3 className="kyc-section-heading">Identity</h3>
      <div className="form-row">
        <div className={`field ${errors.fullLegalName ? 'has-error' : ''}`}>
          <label htmlFor="k-name">Full Legal Name <span aria-hidden="true">*</span></label>
          <input id="k-name" name="fullLegalName" type="text" maxLength={200} required value={values.fullLegalName} onChange={update} aria-required="true" />
        </div>
        <div className="field">
          <label htmlFor="k-prev-name">Previous Name(s), if any</label>
          <input id="k-prev-name" name="previousNames" type="text" maxLength={200} value={values.previousNames} onChange={update} />
        </div>
      </div>

      <div className="form-row">
        <div className={`field ${errors.dob ? 'has-error' : ''}`}>
          <label htmlFor="k-dob">Date of Birth <span aria-hidden="true">*</span></label>
          <input id="k-dob" name="dob" type="date" required value={values.dob} onChange={update} aria-required="true" />
        </div>
        <div className={`field ${errors.citizenships ? 'has-error' : ''}`}>
          <label htmlFor="k-citizenship">Citizenship(s) <span aria-hidden="true">*</span></label>
          <input id="k-citizenship" name="citizenships" type="text" maxLength={200} required value={values.citizenships} onChange={update} aria-required="true" placeholder="List each nationality if dual/multiple" />
        </div>
      </div>

      <div className="form-row">
        <div className={`field ${errors.passportNumber ? 'has-error' : ''}`}>
          <label htmlFor="k-passport-no">Passport Number <span aria-hidden="true">*</span></label>
          <input id="k-passport-no" name="passportNumber" type="text" maxLength={50} required value={values.passportNumber} onChange={update} aria-required="true" />
        </div>
        <div className={`field ${errors.passportCountry ? 'has-error' : ''}`}>
          <label htmlFor="k-passport-country">Passport Issuing Country <span aria-hidden="true">*</span></label>
          <input id="k-passport-country" name="passportCountry" type="text" maxLength={100} required value={values.passportCountry} onChange={update} aria-required="true" />
        </div>
      </div>

      <div className="form-row">
        <div className="field">
          <label htmlFor="k-passport-issue">Passport Date of Issue</label>
          <input id="k-passport-issue" name="passportIssue" type="date" value={values.passportIssue} onChange={update} />
        </div>
        <div className="field">
          <label htmlFor="k-passport-expiry">Passport Date of Expiry</label>
          <input id="k-passport-expiry" name="passportExpiry" type="date" value={values.passportExpiry} onChange={update} />
        </div>
      </div>

      <div className={`field ${errors.passportFile ? 'has-error' : ''}`}>
        <label htmlFor="k-passport-file">Passport Copy (bio-data page) <span aria-hidden="true">*</span></label>
        <input
          id="k-passport-file"
          name="passportCopy"
          type="file"
          accept="application/pdf,image/*"
          required
          onChange={(e) => {
            setPassportFile(e.target.files?.[0] || null)
            setErrors((er) => ({ ...er, passportFile: false }))
          }}
          aria-required="true"
        />
      </div>

      <h3 className="kyc-section-heading">Employer / Organization</h3>
      <div className={`field ${errors.employerName ? 'has-error' : ''}`}>
        <label htmlFor="k-employer">Employer Name <span aria-hidden="true">*</span></label>
        <input id="k-employer" name="employerName" type="text" maxLength={200} required value={values.employerName} onChange={update} aria-required="true" />
      </div>
      <div className="form-row">
        <div className="field">
          <label htmlFor="k-employer-id">Employer Identification Code</label>
          <input id="k-employer-id" name="employerId" type="text" maxLength={100} value={values.employerId} onChange={update} />
        </div>
        <div className="field">
          <label htmlFor="k-employer-website">Employer Website</label>
          <input id="k-employer-website" name="employerWebsite" type="text" maxLength={200} value={values.employerWebsite} onChange={update} />
        </div>
      </div>
      <div className="field">
        <label htmlFor="k-employer-address">Employer Address</label>
        <input id="k-employer-address" name="employerAddress" type="text" maxLength={300} value={values.employerAddress} onChange={update} />
      </div>
      <div className="field">
        <label htmlFor="k-official-contact">Official Contact (Name / Email / Phone)</label>
        <input id="k-official-contact" name="officialContact" type="text" maxLength={300} value={values.officialContact} onChange={update} />
      </div>

      <h3 className="kyc-section-heading">Role, Rank &amp; Clearance</h3>
      <div className="form-row">
        <div className={`field ${errors.title ? 'has-error' : ''}`}>
          <label htmlFor="k-title">Title <span aria-hidden="true">*</span></label>
          <input id="k-title" name="title" type="text" maxLength={150} required value={values.title} onChange={update} aria-required="true" />
        </div>
        <div className="field">
          <label htmlFor="k-tenure">Tenure (Years in Role)</label>
          <input id="k-tenure" name="tenure" type="text" maxLength={50} value={values.tenure} onChange={update} />
        </div>
      </div>
      <div className="form-row">
        <div className="field">
          <label htmlFor="k-rank">Military Rank, if applicable</label>
          <input id="k-rank" name="militaryRank" type="text" maxLength={100} value={values.militaryRank} onChange={update} />
        </div>
        <div className="field">
          <label htmlFor="k-clearance">Security Clearance Level, if applicable</label>
          <input id="k-clearance" name="clearanceLevel" type="text" maxLength={100} value={values.clearanceLevel} onChange={update} />
        </div>
      </div>

      <h3 className="kyc-section-heading">Government Affiliation</h3>
      <div className="field">
        <label htmlFor="k-gov-history">Government Service History</label>
        <textarea id="k-gov-history" name="govServiceHistory" rows="3" maxLength={2000} value={values.govServiceHistory} onChange={update} />
      </div>
      <div className="field">
        <label htmlFor="k-gov-current">Current Government Affiliation</label>
        <input id="k-gov-current" name="govAffiliation" type="text" maxLength={200} value={values.govAffiliation} onChange={update} />
      </div>

      <h3 className="kyc-section-heading">End-User Status</h3>
      <div className="field">
        <label htmlFor="k-end-user">End-User Status</label>
        <select id="k-end-user" name="endUserStatus" value={values.endUserStatus} onChange={update}>
          <option value="end-user">End User</option>
          <option value="broker">Broker</option>
          <option value="other">Other</option>
        </select>
      </div>
      {values.endUserStatus === 'broker' && (
        <div className={`field ${errors.brokerFile ? 'has-error' : ''}`}>
          <label htmlFor="k-broker-file">Broker License Copy <span aria-hidden="true">*</span></label>
          <input
            id="k-broker-file"
            name="brokerLicense"
            type="file"
            accept="application/pdf,image/*"
            onChange={(e) => {
              setBrokerFile(e.target.files?.[0] || null)
              setErrors((er) => ({ ...er, brokerFile: false }))
            }}
            aria-required="true"
          />
        </div>
      )}

      <div className={`field kyc-declaration ${errors.declaration ? 'has-error' : ''}`}>
        <label htmlFor="k-declaration" className="kyc-declaration-label">
          <input
            id="k-declaration"
            name="declaration"
            type="checkbox"
            checked={values.declaration}
            onChange={update}
            aria-required="true"
          />
          <span>
            I understand that no commercial, technical, or contractual negotiation will take place, and no
            controlled product information will be disclosed, prior to completion and clearance of
            Know-Your-Customer (KYC), security, and end-use capacity screening. I confirm the information
            provided above is true, complete, and accurate to the best of my knowledge.
          </span>
        </label>
      </div>

      {/* Honeypot */}
      <div className="hp-field" aria-hidden="true">
        <label htmlFor="k-website">Website</label>
        <input id="k-website" name="_gotcha" type="text" tabIndex={-1} autoComplete="off" value={values._gotcha} onChange={update} />
      </div>

      {status === 'sent' && (
        <div className="form-notice" role="status">
          Your request has been submitted for review. Our security team will follow up by email — if
          cleared, you&rsquo;ll receive a private access link valid for 14 days.
        </div>
      )}
      {status === 'failed' && (
        <div className="form-notice form-notice-error" role="alert">
          The request couldn&rsquo;t be sent automatically. Please email the details above directly to{' '}
          <a href={`mailto:${company.contact.kycEmail}`}>{company.contact.kycEmail}</a>.
        </div>
      )}

      <button type="submit" className="btn btn-primary" disabled={status === 'sending'}>
        {status === 'sending' ? 'Submitting…' : 'Submit Request'}
      </button>
    </form>
  )
}

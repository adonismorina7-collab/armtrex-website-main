import KycForm from '../components/KycForm.jsx'

export default function Kyc() {
  return (
    <>
      <section className="page-hero" aria-labelledby="kyc-heading">
        <div className="container">
          <span className="kicker">Restricted Access</span>
          <h1 id="kyc-heading">Request Product Catalogue Access</h1>
          <p className="page-lead">
            Armtrex product specifications are supplied only to governmental and authorized
            defence-sector buyers. Complete the form below to request access — our security team
            reviews every submission before any product information is disclosed.
          </p>
        </div>
      </section>

      <section className="section contact-section">
        <div className="container contact-layout contact-layout-single">
          <div className="contact-form-wrap">
            <h2>Buyer / Attendee KYC Form</h2>
            <KycForm />
          </div>
        </div>
      </section>
    </>
  )
}

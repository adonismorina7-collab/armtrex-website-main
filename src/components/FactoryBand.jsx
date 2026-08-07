import { useT } from '../i18n/ui.js'

const IMG = '/assets/production/'
// Bump when the production photos are replaced, to bust any cached copies.
const V = '?v=2'

// The signature production-line shot leads as a large feature tile; the rest
// fill an editorial montage around it. Alt text stays descriptive (English).
const SHOTS = [
  {
    file: 'production-line',
    label: 'factory.line',
    alt: 'Rows of finished 155 mm artillery projectiles on a factory production line',
    w: 913,
    h: 367,
  },
  {
    file: 'machining',
    label: 'factory.machining',
    alt: 'Artillery shell body being precision-machined on a CNC lathe',
    w: 602,
    h: 367,
  },
  {
    file: 'marking',
    label: 'factory.marking',
    alt: 'Lot markings being stencilled onto a painted artillery projectile',
    w: 785,
    h: 278,
  },
  {
    file: 'charge-components',
    label: 'factory.charge',
    alt: 'Modular propellant charge components and propellant grains',
    w: 729,
    h: 278,
  },
  {
    file: 'inspection',
    label: 'factory.inspection',
    alt: 'Energetic-material melt furnace on the production floor',
    w: 719,
    h: 344,
  },
  {
    file: 'logistics',
    label: 'factory.logistics',
    alt: 'Palletised ammunition crates in an export warehouse',
    w: 796,
    h: 344,
  },
]

export default function FactoryBand() {
  const t = useT()
  return (
    <section className="section factory-band" aria-labelledby="factory-heading">
      <div className="container">
        <div className="section-head">
          <span className="kicker">{t('factory.kicker')}</span>
          <h2 id="factory-heading">{t('factory.heading')}</h2>
          <p className="page-lead">{t('factory.lead')}</p>
        </div>

        <div className="factory-grid">
          {SHOTS.map((s) => (
            <figure className={`factory-tile tile-${s.file}`} key={s.file}>
              <img
                src={IMG + s.file + '.webp' + V}
                alt={s.alt}
                width={s.w}
                height={s.h}
                loading="lazy"
                decoding="async"
              />
              <figcaption>{t(s.label)}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}

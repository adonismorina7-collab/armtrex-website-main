// PUBLIC / pre-KYC data only. This file ships in the client JS bundle and is
// therefore readable by anyone who loads the site — no gate can hide it.
//
// The full catalogue (descriptions, calibers, velocities, ranges, specs,
// compatible systems) lives server-side only, in worker/data/products.js,
// and is served exclusively via the authenticated /api/products endpoint
// after a valid, time-limited KYC access link has been verified. Do NOT
// move sensitive fields back into this file.
//
// What's here is deliberately limited to what's already public-facing
// marketing material: category names, and the four homepage hero images
// with just a name/image/category (no highlights, no specs).

export const categories = [
  { id: 'artillery', name: 'Artillery Ammunition' },
  { id: 'mortar', name: 'Mortar Ammunition' },
  { id: 'rockets', name: 'Unguided Rockets' },
  { id: 'charges', name: 'Propellant Charges' },
]

const IMG = '/assets/products/'

// Teaser-only entries for the homepage hero slider — name/image/category,
// nothing technical. Kept in sync by hand with worker/data/products.js.
export const heroTeasers = [
  {
    slug: '155mm-he-erfb-bb',
    name: '155mm HE ERFB-BB Round',
    subtitle: null,
    category: 'artillery',
    image: IMG + '155mm-he-erfb-bb.webp?v=2',
  },
  {
    slug: '155mm-m107-he-frag',
    name: '155mm M107 HE-FRAG Round',
    subtitle: null,
    category: 'artillery',
    image: IMG + '155mm-m107-he-frag.webp?v=2',
  },
  {
    slug: '120mm-he-tb',
    name: '120mm HE TB Mortar Round',
    subtitle: null,
    category: 'mortar',
    image: IMG + '120mm-he-tb.webp?v=2',
  },
  {
    slug: '122mm-m21of-40',
    name: '122 mm M-21OF-40 Rocket',
    subtitle: null,
    category: 'rockets',
    image: IMG + '122mm-m21of-40.webp?v=2',
  },
]

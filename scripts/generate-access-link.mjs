#!/usr/bin/env node
/**
 * Generates a signed, time-limited access link to send to a KYC-cleared
 * buyer/attendee. Run after reviewing their submitted KYC email.
 *
 * Usage:
 *   ACCESS_TOKEN_SECRET=<same secret as `wrangler secret put ACCESS_TOKEN_SECRET`> \
 *     node scripts/generate-access-link.mjs [days] [siteUrl]
 *
 * Examples:
 *   node scripts/generate-access-link.mjs                # 14 days, armtrex.co.uk
 *   node scripts/generate-access-link.mjs 7               # 7 days
 *   node scripts/generate-access-link.mjs 14 https://armtrex-website.example.workers.dev
 *
 * The token is a stateless, signed credential (no database) — anyone who
 * has it can view the catalogue until it expires. Treat it like a
 * temporary password: send it directly to the cleared individual, not to a
 * mailing list, and don't post it anywhere public. If a link leaks, rotate
 * ACCESS_TOKEN_SECRET to invalidate every outstanding link at once.
 */
import crypto from 'node:crypto'

const secret = process.env.ACCESS_TOKEN_SECRET
if (!secret) {
  console.error('Error: set ACCESS_TOKEN_SECRET in the environment (must match `wrangler secret put ACCESS_TOKEN_SECRET`).')
  process.exit(1)
}

const days = Number(process.argv[2] || 14)
const siteUrl = (process.argv[3] || 'https://armtrex.co.uk').replace(/\/$/, '')

const exp = Date.now() + days * 24 * 60 * 60 * 1000
const payloadB64 = Buffer.from(JSON.stringify({ exp })).toString('base64url')
const sig = crypto.createHmac('sha256', secret).update(payloadB64).digest('base64url')
const token = `${payloadB64}.${sig}`

const link = `${siteUrl}/products?access=${token}`

console.log('')
console.log('Access link (send this to the cleared buyer/attendee):')
console.log(link)
console.log('')
console.log(`Expires: ${new Date(exp).toISOString()} (${days} day${days === 1 ? '' : 's'} from now)`)
console.log('')

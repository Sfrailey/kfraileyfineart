import 'server-only'

import type { ContactValues } from './contact'

export type SendResult = { ok: true } | { ok: false; reason: 'not-configured' | 'rejected' | 'network' }

/**
 * Delivers an enquiry through Resend's HTTP API (https://resend.com/docs/api-reference/emails/send-email).
 * Required environment variables (server-only):
 *   RESEND_API_KEY      API key with "sending access"
 *   CONTACT_TO_EMAIL    where enquiries are delivered (the artist's inbox)
 *   CONTACT_FROM_EMAIL  a sender on a domain verified in Resend, e.g. "Website <website@kfraileyfineart.com>"
 *
 * Returns ok only when Resend accepted the message.
 */
export async function sendContactEmail(values: ContactValues): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY
  const to = process.env.CONTACT_TO_EMAIL
  const from = process.env.CONTACT_FROM_EMAIL
  if (!apiKey || !to || !from) {
    console.error('[contact] Email is not configured: set RESEND_API_KEY, CONTACT_TO_EMAIL and CONTACT_FROM_EMAIL.')
    return { ok: false, reason: 'not-configured' }
  }

  const subject = values.painting
    ? `Website inquiry about "${values.painting}" from ${values.name}`
    : `Website inquiry from ${values.name}`

  const text = [
    `Name: ${values.name}`,
    `Email: ${values.email}`,
    values.painting ? `Painting: ${values.painting}` : null,
    '',
    'Timeline:',
    values.timeline,
    '',
    'Questions / comments:',
    values.message || '(none)',
  ]
    .filter((line) => line !== null)
    .join('\n')

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to: to.split(',').map((address) => address.trim()),
        reply_to: values.email,
        subject: subject.replace(/[\r\n]+/g, ' '),
        text,
      }),
      signal: AbortSignal.timeout(10_000),
    })
    if (!response.ok) {
      console.error('[contact] Resend rejected the message', response.status, await response.text())
      return { ok: false, reason: 'rejected' }
    }
    return { ok: true }
  } catch (error) {
    console.error('[contact] Could not reach Resend', error)
    return { ok: false, reason: 'network' }
  }
}

import { revalidateTag } from 'next/cache'
import { type NextRequest, NextResponse } from 'next/server'
import { parseBody } from 'next-sanity/webhook'

import { CONTENT_TAGS, type ContentTag } from '@/sanity/fetch'

type WebhookPayload = { _type?: string }

/**
 * Sanity GROQ webhook target. Configure in sanity.io/manage → API → Webhooks
 * (see README): POST, projection `{_type}`, secret = SANITY_REVALIDATE_SECRET.
 *
 * The signature is verified before anything is revalidated. Each published
 * change expires the cache tag for its document type; the next visit to any
 * page using that content fetches it fresh.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET
  if (!secret) {
    return NextResponse.json({ message: 'SANITY_REVALIDATE_SECRET is not set' }, { status: 500 })
  }

  try {
    // `true` waits briefly so the Sanity API has the published change before we refresh.
    const { isValidSignature, body } = await parseBody<WebhookPayload>(req, secret, true)

    if (!isValidSignature) {
      return NextResponse.json({ message: 'Invalid signature' }, { status: 401 })
    }
    const type = body?._type
    if (!type) {
      return NextResponse.json({ message: 'Missing _type' }, { status: 400 })
    }
    if (!(CONTENT_TAGS as readonly string[]).includes(type)) {
      return NextResponse.json({ revalidated: false, message: `Ignored type "${type}"` })
    }

    // `expire: 0`: the next visitor gets fresh content immediately rather than
    // one more stale view, so the artist sees her change on the first reload.
    revalidateTag(type as ContentTag, { expire: 0 })
    return NextResponse.json({ revalidated: true, tag: type })
  } catch (error) {
    console.error('[revalidate] failed', error)
    return NextResponse.json({ message: 'Error revalidating' }, { status: 500 })
  }
}

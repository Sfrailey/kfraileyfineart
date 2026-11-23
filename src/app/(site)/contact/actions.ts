'use server'

import { readContactValues, validateContact, type ContactFormState } from '@/lib/contact'
import { sendContactEmail } from '@/lib/email'

const FAILURE_MESSAGE =
  'Sorry, your message could not be sent right now. Please try again in a few minutes.'

export async function sendInquiry(_prev: ContactFormState, formData: FormData): Promise<ContactFormState> {
  const values = readContactValues(formData)

  // Honeypot: real visitors never see or fill this field.
  const trap = formData.get('website')
  if (typeof trap === 'string' && trap.length > 0) {
    return { status: 'error', message: FAILURE_MESSAGE, fieldErrors: {}, values }
  }

  const fieldErrors = validateContact(values)
  if (Object.keys(fieldErrors).length > 0) {
    return { status: 'error', message: 'Please check the highlighted fields.', fieldErrors, values }
  }

  const result = await sendContactEmail(values)
  if (!result.ok) {
    return { status: 'error', message: FAILURE_MESSAGE, fieldErrors: {}, values }
  }
  return { status: 'success' }
}

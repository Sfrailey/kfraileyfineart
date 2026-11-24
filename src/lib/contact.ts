/**
 * Contact form fields. The visitor picks one of two form types:
 * - "inquiry": a question about an existing painting (optional painting name)
 *   with a required message;
 * - "commission": a request for a new piece, with a required timeline and
 *   optional comments.
 */
export const CONTACT_FIELDS = ['type', 'name', 'email', 'painting', 'timeline', 'message'] as const
export type ContactField = (typeof CONTACT_FIELDS)[number]
export type ContactValues = Record<ContactField, string>
export type FieldErrors = Partial<Record<ContactField, string>>

export const INQUIRY_TYPES = ['inquiry', 'commission'] as const
export type InquiryType = (typeof INQUIRY_TYPES)[number]

export type ContactFormState =
  | { status: 'idle' }
  | { status: 'success' }
  | { status: 'error'; message: string; fieldErrors: FieldErrors; values: ContactValues }

const LIMITS: Record<ContactField, number> = {
  type: 20,
  name: 120,
  email: 200,
  painting: 150,
  timeline: 2000,
  message: 5000,
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function toInquiryType(value: string | null | undefined): InquiryType | null {
  return INQUIRY_TYPES.find((t) => t === value) ?? null
}

export function readContactValues(formData: FormData): ContactValues {
  const get = (key: ContactField) => {
    const value = formData.get(key)
    return typeof value === 'string' ? value.trim() : ''
  }
  const values = Object.fromEntries(CONTACT_FIELDS.map((key) => [key, get(key)])) as ContactValues
  values.type = toInquiryType(values.type) ?? 'commission'
  // Drop fields that don't belong to the chosen form type.
  if (values.type === 'inquiry') values.timeline = ''
  else values.painting = ''
  return values
}

/** Shared by the browser (instant feedback) and the server (authoritative). */
export function validateContact(values: ContactValues): FieldErrors {
  const errors: FieldErrors = {}
  if (!values.name) errors.name = 'Please enter your name.'
  if (!values.email) errors.email = 'Please enter your email address.'
  else if (!EMAIL_PATTERN.test(values.email)) errors.email = 'Please enter a valid email address, like name@example.com.'
  if (values.type === 'inquiry') {
    if (!values.message) errors.message = 'Please tell me what you would like to know.'
  } else if (!values.timeline) {
    errors.timeline = 'Please tell me about your timeline.'
  }

  for (const field of CONTACT_FIELDS) {
    if (!errors[field] && values[field].length > LIMITS[field]) {
      errors[field] = `Please shorten this to ${LIMITS[field]} characters or fewer.`
    }
  }
  return errors
}

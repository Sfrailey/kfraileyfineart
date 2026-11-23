/** Contact form fields, matching the previous WordPress form plus an optional painting reference. */
export const CONTACT_FIELDS = ['name', 'email', 'timeline', 'message', 'painting'] as const
export type ContactField = (typeof CONTACT_FIELDS)[number]
export type ContactValues = Record<ContactField, string>
export type FieldErrors = Partial<Record<ContactField, string>>

export type ContactFormState =
  | { status: 'idle' }
  | { status: 'success' }
  | { status: 'error'; message: string; fieldErrors: FieldErrors; values: ContactValues }

const LIMITS: Record<ContactField, number> = {
  name: 120,
  email: 200,
  timeline: 2000,
  message: 5000,
  painting: 150,
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function readContactValues(formData: FormData): ContactValues {
  const get = (key: ContactField) => {
    const value = formData.get(key)
    return typeof value === 'string' ? value.trim() : ''
  }
  return {
    name: get('name'),
    email: get('email'),
    timeline: get('timeline'),
    message: get('message'),
    painting: get('painting'),
  }
}

/** Shared by the browser (instant feedback) and the server (authoritative). */
export function validateContact(values: ContactValues): FieldErrors {
  const errors: FieldErrors = {}
  if (!values.name) errors.name = 'Please enter your name.'
  if (!values.email) errors.email = 'Please enter your email address.'
  else if (!EMAIL_PATTERN.test(values.email)) errors.email = 'Please enter a valid email address, like name@example.com.'
  if (!values.timeline) errors.timeline = 'Please tell me about your timeline.'

  for (const field of CONTACT_FIELDS) {
    if (!errors[field] && values[field].length > LIMITS[field]) {
      errors[field] = `Please shorten this to ${LIMITS[field]} characters or fewer.`
    }
  }
  return errors
}

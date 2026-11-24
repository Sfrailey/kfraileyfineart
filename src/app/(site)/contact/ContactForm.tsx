'use client'

import { useSearchParams } from 'next/navigation'
import { useActionState, useEffect, useRef, useState, type FormEvent } from 'react'

import {
  readContactValues,
  toInquiryType,
  validateContact,
  type ContactField,
  type ContactFormState,
  type FieldErrors,
  type InquiryType,
} from '@/lib/contact'

import { sendInquiry } from './actions'
import styles from './contact.module.css'

const initialState: ContactFormState = { status: 'idle' }

const TYPE_OPTIONS: { value: InquiryType; label: string; hint: string }[] = [
  { value: 'inquiry', label: 'Inquiry', hint: 'Ask about an existing painting' },
  { value: 'commission', label: 'Commission', hint: 'Request a new piece' },
]

/**
 * Reads ?painting= (from "Inquire about this painting" in the gallery lightbox)
 * and ?type=inquiry|commission to preselect the form.
 */
export function ContactFormWithParams() {
  const params = useSearchParams()
  const painting = params.get('painting')?.slice(0, 150) ?? null
  return <ContactForm painting={painting} type={toInquiryType(params.get('type'))} />
}

/**
 * Enquiry form. Works without JavaScript (server action); with JavaScript it
 * validates before sending and moves focus to the result. A success message is
 * shown only after the server confirms the email was accepted.
 */
export function ContactForm({ painting, type = null }: { painting: string | null; type?: InquiryType | null }) {
  const [state, formAction, pending] = useActionState(sendInquiry, initialState)
  const [clientErrors, setClientErrors] = useState<FieldErrors>({})
  const [lastState, setLastState] = useState(state)
  const [mode, setMode] = useState<InquiryType>(type ?? (painting ? 'inquiry' : 'commission'))
  const formRef = useRef<HTMLFormElement>(null)
  const statusRef = useRef<HTMLDivElement>(null)

  const values = state.status === 'error' ? state.values : null

  // Server feedback replaces any earlier client-side errors and restores the chosen type.
  if (state !== lastState) {
    setLastState(state)
    setClientErrors({})
    const returned = toInquiryType(values?.type)
    if (returned) setMode(returned)
  }

  const errors: FieldErrors = { ...(state.status === 'error' ? state.fieldErrors : {}), ...clientErrors }
  const paintingValue = values?.painting || painting || ''

  useEffect(() => {
    if (state.status === 'success') statusRef.current?.focus()
    if (state.status === 'error') focusFirstInvalid(formRef.current, state.fieldErrors, statusRef.current)
  }, [state])

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    const found = validateContact(readContactValues(new FormData(event.currentTarget)))
    if (Object.keys(found).length > 0) {
      event.preventDefault()
      setClientErrors(found)
      focusFirstInvalid(event.currentTarget, found, null)
    }
  }

  function changeMode(next: InquiryType) {
    setMode(next)
    setClientErrors({})
  }

  const fieldProps = (name: ContactField) => ({
    id: `contact-${name}`,
    name,
    'aria-invalid': errors[name] ? true : undefined,
    'aria-describedby': errors[name] ? `contact-${name}-error` : undefined,
  })

  const fieldError = (name: ContactField) =>
    errors[name] ? (
      <p id={`contact-${name}-error`} className={styles.fieldError}>
        {errors[name]}
      </p>
    ) : null

  return (
    <>
      <div ref={statusRef} tabIndex={-1} className={styles.statusRegion}>
        {state.status === 'success' ? (
          <div role="status" className={styles.success}>
            <p>
              <strong>Thank you, your message has been sent.</strong>
            </p>
          </div>
        ) : state.status === 'error' ? (
          <div role="alert" className={styles.error}>
            <p>{state.message}</p>
          </div>
        ) : null}
      </div>

      <form ref={formRef} action={formAction} onSubmit={onSubmit} noValidate className={styles.form}>
        <fieldset className={styles.typeSwitch}>
          <legend className="visually-hidden">What would you like to do?</legend>
          {TYPE_OPTIONS.map((option) => (
            <label key={option.value} className={styles.typeOption}>
              <input
                type="radio"
                name="type"
                value={option.value}
                checked={mode === option.value}
                onChange={() => changeMode(option.value)}
              />
              <span className={styles.typeLabel}>{option.label}</span>
              <span className={styles.typeHint}>{option.hint}</span>
            </label>
          ))}
        </fieldset>

        <div className={styles.row}>
          <div className={styles.field}>
            <label htmlFor="contact-name">
              Name <span aria-hidden="true">*</span>
            </label>
            <input {...fieldProps('name')} type="text" autoComplete="name" required defaultValue={values?.name} />
            {fieldError('name')}
          </div>
          <div className={styles.field}>
            <label htmlFor="contact-email">
              Email <span aria-hidden="true">*</span>
            </label>
            <input {...fieldProps('email')} type="email" autoComplete="email" required defaultValue={values?.email} />
            {fieldError('email')}
          </div>
        </div>

        {mode === 'inquiry' ? (
          <>
            <div className={styles.field}>
              <label htmlFor="contact-painting">Which painting?</label>
              <input
                {...fieldProps('painting')}
                type="text"
                placeholder="The painting's title, if you're asking about a specific piece"
                defaultValue={paintingValue}
              />
              {fieldError('painting')}
            </div>

            <div className={styles.field}>
              <label htmlFor="contact-message">
                Message <span aria-hidden="true">*</span>
              </label>
              <textarea
                {...fieldProps('message')}
                rows={6}
                required
                placeholder="What would you like to know? Price, framing, shipping, or seeing it in person?"
                defaultValue={values?.message}
              />
              {fieldError('message')}
            </div>
          </>
        ) : (
          <>
            <div className={styles.field}>
              <label htmlFor="contact-timeline">
                Timeline <span aria-hidden="true">*</span>
              </label>
              <textarea
                {...fieldProps('timeline')}
                rows={4}
                required
                placeholder="What's your timeline? When do you need the painting completed? Or is the timeline flexible?"
                defaultValue={values?.timeline}
              />
              {fieldError('timeline')}
            </div>

            <div className={styles.field}>
              <label htmlFor="contact-message">Any questions/comments</label>
              <textarea
                {...fieldProps('message')}
                rows={5}
                placeholder="What size and subject are you imagining? Any other questions for me?"
                defaultValue={values?.message}
              />
              {fieldError('message')}
            </div>
          </>
        )}

        {/* Honeypot for spam bots; hidden from people and assistive technology. */}
        <div className={styles.trap} aria-hidden="true">
          <label htmlFor="contact-website">Leave this field empty</label>
          <input id="contact-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
        </div>

        <p className={styles.required}>* Required</p>

        <button type="submit" className="button" disabled={pending}>
          {pending ? 'Sending…' : mode === 'commission' ? 'Send commission request' : 'Send inquiry'}
        </button>
      </form>
    </>
  )
}

function focusFirstInvalid(form: HTMLFormElement | null, errors: FieldErrors, fallback: HTMLElement | null) {
  const first = Object.keys(errors)[0]
  const el = first ? form?.querySelector<HTMLElement>(`[name="${first}"]`) : null
  ;(el ?? fallback)?.focus()
}

import { useState } from 'react'
import { Link } from 'react-router-dom'
import AuthLayout from '../../layouts/AuthLayout'
import { isValidEmail } from '../../utils'

const PANEL = {
  headline: 'Reset your<br /><em>password.</em>',
  sub: 'Enter the email address you registered with and we\'ll send you instructions to reset your password.',
  features: [
    'Secure reset link sent to your inbox',
    'Link expires after 30 minutes',
    'No account? Create one for free',
  ],
}

export default function ForgotPassword() {
  const [email, setEmail]       = useState('')
  const [error, setError]       = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading]   = useState(false)

  const validate = () => {
    if (!email.trim())          { setError('Email is required'); return false }
    if (!isValidEmail(email))   { setError('Enter a valid email address'); return false }
    return true
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    if (!validate()) return
    setLoading(true)
    // Simulate API delay — actual email integration TBD
    await new Promise(r => setTimeout(r, 900))
    setLoading(false)
    setSubmitted(true)
  }

  return (
    <AuthLayout {...PANEL}>
      {submitted ? (
        <>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem',
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <h2 className="auth-form-heading">Check your inbox</h2>
            <p className="auth-form-hint">
              If <strong style={{ color: 'var(--text-1)' }}>{email}</strong> is registered, you'll receive reset instructions shortly.
            </p>
          </div>

          <div className="success-msg">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" style={{ flexShrink: 0 }}>
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" clipRule="evenodd"/>
            </svg>
            Reset email sent. Check your spam folder if it doesn't arrive within a few minutes.
          </div>

          <p className="auth-switch" style={{ marginTop: '1.5rem' }}>
            <Link to="/login">← Back to sign in</Link>
          </p>
        </>
      ) : (
        <>
          <h2 className="auth-form-heading">Forgot password?</h2>
          <p className="auth-form-hint">We'll send you a reset link</p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="field">
              <label className="field-label" htmlFor="email">Email address</label>
              <input
                className={`field-input${error ? ' has-error' : ''}`}
                id="email" type="email" placeholder="you@example.com"
                value={email}
                onChange={e => { setEmail(e.target.value); setError('') }}
                autoComplete="email" autoFocus
              />
              {error && <p className="field-error" role="alert">{error}</p>}
            </div>

            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading
                ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Sending…</>
                : 'Send reset link →'}
            </button>
          </form>

          <p className="auth-switch" style={{ marginTop: '1.5rem' }}>
            <Link to="/login">← Back to sign in</Link>
          </p>
        </>
      )}
    </AuthLayout>
  )
}

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../../layouts/AuthLayout'
import { useAuth } from '../../context/AuthContext'
import { authRegister } from '../../api'
import { isValidEmail, passwordStrength } from '../../utils'

const PANEL = {
  headline: 'Build your dev<br /><em>identity.</em>',
  sub: 'Create your ConnectDev profile and join a network built specifically for software developers.',
  features: [
    'Free forever for individual developers',
    'Showcase real projects and open-source work',
    'Get discovered by devs and teams worldwide',
    'No spam — your data, your rules',
  ],
}

const EyeIcon = ({ open }) => open
  ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
  : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.956 9.956 0 012.223-3.592M6.228 6.228A9.956 9.956 0 0112 5c4.477 0 8.268 2.943 9.542 7a9.956 9.956 0 01-4.423 5.344M6.228 6.228L3 3m3.228 3.228l3.65 3.65M17.772 17.772l3.228 3.228m-3.228-3.228l-3.65-3.65"/></svg>

export default function Register() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [form, setForm]       = useState({ name: '', email: '', password: '', confirm: '' })
  const [errors, setErrors]   = useState({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPwd, setShowPwd] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const set = (field) => (e) => {
    setForm(p => ({ ...p, [field]: e.target.value }))
    if (errors[field]) setErrors(p => ({ ...p, [field]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim())              e.name     = 'Full name is required'
    else if (form.name.trim().length < 2) e.name   = 'Name must be at least 2 characters'
    if (!form.email.trim())             e.email    = 'Email is required'
    else if (!isValidEmail(form.email)) e.email    = 'Enter a valid email address'
    if (!form.password)                 e.password = 'Password is required'
    else if (form.password.length < 6)  e.password = 'Password must be at least 6 characters'
    if (!form.confirm)                  e.confirm  = 'Please confirm your password'
    else if (form.confirm !== form.password) e.confirm = 'Passwords do not match'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    setApiError('')
    if (!validate()) return
    setLoading(true)
    try {
      const { data } = await authRegister({ name: form.name.trim(), email: form.email, password: form.password })
      login(data.token, data.user)
      navigate('/dashboard')
    } catch (err) {
      const msg = err?.response?.data?.message
        || (typeof err?.response?.data === 'string' ? err.response.data : null)
        || 'Registration failed. Please try again.'
      setApiError(msg)
    } finally {
      setLoading(false)
    }
  }

  const strength = passwordStrength(form.password)

  return (
    <AuthLayout {...PANEL}>
      <h2 className="auth-form-heading">Create account</h2>
      <p className="auth-form-hint">Join ConnectDev — it's free</p>

      {apiError && (
        <div className="error-msg" role="alert">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" style={{ flexShrink: 0 }}>
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM9 9a1 1 0 012 0v4a1 1 0 01-2 0V9zm1-3a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd"/>
          </svg>
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label className="field-label" htmlFor="name">Full name</label>
          <input
            className={`field-input${errors.name ? ' has-error' : ''}`}
            id="name" type="text" placeholder="Jane Smith"
            value={form.name} onChange={set('name')}
            autoComplete="name" autoFocus
          />
          {errors.name && <p className="field-error" role="alert">{errors.name}</p>}
        </div>

        <div className="field">
          <label className="field-label" htmlFor="email">Email address</label>
          <input
            className={`field-input${errors.email ? ' has-error' : ''}`}
            id="email" type="email" placeholder="you@example.com"
            value={form.email} onChange={set('email')}
            autoComplete="email"
          />
          {errors.email && <p className="field-error" role="alert">{errors.email}</p>}
        </div>

        <div className="field">
          <label className="field-label" htmlFor="password">Password</label>
          <div className="field-pwd-wrap">
            <input
              className={`field-input${errors.password ? ' has-error' : ''}`}
              id="password" type={showPwd ? 'text' : 'password'}
              placeholder="Min. 6 characters"
              value={form.password} onChange={set('password')}
              autoComplete="new-password"
            />
            <button type="button" className="pwd-toggle" onClick={() => setShowPwd(v => !v)}
              aria-label={showPwd ? 'Hide password' : 'Show password'}>
              <EyeIcon open={showPwd} />
            </button>
          </div>
          {errors.password && <p className="field-error" role="alert">{errors.password}</p>}
          {!errors.password && strength && (
            <p className="pwd-strength" style={{ color: strength.color }}>{strength.label}</p>
          )}
        </div>

        <div className="field">
          <label className="field-label" htmlFor="confirm">Confirm password</label>
          <div className="field-pwd-wrap">
            <input
              className={`field-input${errors.confirm ? ' has-error' : ''}`}
              id="confirm" type={showConfirm ? 'text' : 'password'}
              placeholder="Repeat your password"
              value={form.confirm} onChange={set('confirm')}
              autoComplete="new-password"
            />
            <button type="button" className="pwd-toggle" onClick={() => setShowConfirm(v => !v)}
              aria-label={showConfirm ? 'Hide password' : 'Show password'}>
              <EyeIcon open={showConfirm} />
            </button>
          </div>
          {errors.confirm && <p className="field-error" role="alert">{errors.confirm}</p>}
        </div>

        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Creating account…</> : 'Create account →'}
        </button>
      </form>

      <div className="divider">or</div>

      <p className="auth-switch">
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </AuthLayout>
  )
}

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../../layouts/AuthLayout'
import { useAuth } from '../../context/AuthContext'
import { authLogin } from '../../api'
import { isValidEmail } from '../../utils'

const PANEL = {
  headline: 'Where developers<br /><em>build careers.</em>',
  sub: 'ConnectDev is the professional network built for engineers. Showcase your stack, share your work, and connect with teams that match your skills.',
  features: [
    'Developer-first profiles with tech stack showcase',
    'Post projects and open-source contributions',
    'Connect with engineers who share your stack',
    'Open to opportunities — always on your terms',
  ],
}

const EyeIcon = ({ open }) => open
  ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
  : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.956 9.956 0 012.223-3.592M6.228 6.228A9.956 9.956 0 0112 5c4.477 0 8.268 2.943 9.542 7a9.956 9.956 0 01-4.423 5.344M6.228 6.228L3 3m3.228 3.228l3.65 3.65M17.772 17.772l3.228 3.228m-3.228-3.228l-3.65-3.65"/></svg>

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [form, setForm]       = useState({ email: '', password: '' })
  const [errors, setErrors]   = useState({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPwd, setShowPwd] = useState(false)

  const set = (field) => (e) => {
    setForm(p => ({ ...p, [field]: e.target.value }))
    if (errors[field]) setErrors(p => ({ ...p, [field]: '' }))
    setApiError('')
  }

  const validate = () => {
    const e = {}
    if (!form.email.trim())            e.email    = 'Email is required'
    else if (!isValidEmail(form.email)) e.email   = 'Enter a valid email address'
    if (!form.password)                e.password = 'Password is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const { data } = await authLogin(form)
      login(data.token, data.user)
      navigate('/dashboard')
    } catch (err) {
      setApiError(err.response?.data?.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout {...PANEL}>
      <h2 className="auth-form-heading">Welcome back</h2>
      <p className="auth-form-hint">Sign in to your ConnectDev account</p>

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
          <label className="field-label" htmlFor="email">Email address</label>
          <input
            className={`field-input${errors.email ? ' has-error' : ''}`}
            id="email" type="email" placeholder="you@example.com"
            value={form.email} onChange={set('email')}
            autoComplete="email" autoFocus
            aria-describedby={errors.email ? 'email-err' : undefined}
          />
          {errors.email && <p className="field-error" id="email-err" role="alert">{errors.email}</p>}
        </div>

        <div className="field">
          <label className="field-label" htmlFor="password">
            Password
            <Link to="/forgot-password" style={{ marginLeft: 'auto', float: 'right', textTransform: 'none', letterSpacing: 0, fontSize: '0.78rem', fontWeight: 400 }}>
              Forgot password?
            </Link>
          </label>
          <div className="field-pwd-wrap">
            <input
              className={`field-input${errors.password ? ' has-error' : ''}`}
              id="password" type={showPwd ? 'text' : 'password'}
              placeholder="••••••••" value={form.password}
              onChange={set('password')} autoComplete="current-password"
              aria-describedby={errors.password ? 'pwd-err' : undefined}
            />
            <button type="button" className="pwd-toggle" onClick={() => setShowPwd(v => !v)}
              aria-label={showPwd ? 'Hide password' : 'Show password'}>
              <EyeIcon open={showPwd} />
            </button>
          </div>
          {errors.password && <p className="field-error" id="pwd-err" role="alert">{errors.password}</p>}
        </div>

        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Signing in…</> : 'Sign in →'}
        </button>
      </form>

      <div className="divider">or</div>

      <p className="auth-switch">
        Don't have an account? <Link to="/register">Create one free</Link>
      </p>
    </AuthLayout>
  )
}

// pages/auth/Login.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../../layouts/AuthLayout'
import { useAuth } from '../../context/AuthContext'
import { login as loginApi } from '../../api'

const PANEL = {
  headline: 'Where developers<br /><em>build careers.</em>',
  sub: 'ConnectDev is the professional network built for engineers. Showcase your stack, share your work, and connect with teams that match your skills.',
  features: [
    'Developer-first profiles with tech stack showcase',
    'Post projects and open source contributions',
    'Connect with engineers who share your stack',
    'Open to opportunities — always on your terms',
  ],
}

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm]     = useState({ email: '', password: '' })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const set = (field) => (e) => {
    setForm(p => ({ ...p, [field]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) return setError('Please fill in all fields.')
    setLoading(true)
    try {
      const { data } = await loginApi(form)
      login(data.token, data.user)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout {...PANEL}>
      <h2 className="auth-form-heading">Welcome back</h2>
      <p className="auth-form-hint">Sign in to your ConnectDev account</p>

      {error && <div className="error-msg">{error}</div>}

      <form onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label className="field-label" htmlFor="email">Email</label>
          <input className="field-input" id="email" type="email"
            placeholder="you@example.com" value={form.email}
            onChange={set('email')} autoComplete="email" autoFocus />
        </div>

        <div className="field">
          <label className="field-label" htmlFor="password">Password</label>
          <input className="field-input" id="password" type="password"
            placeholder="••••••••" value={form.password}
            onChange={set('password')} autoComplete="current-password" />
        </div>

        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in →'}
        </button>
      </form>

      <div className="divider">or</div>

      <p className="auth-switch">
        Don't have an account? <Link to="/register">Create one free</Link>
      </p>
    </AuthLayout>
  )
}
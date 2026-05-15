// pages/auth/Register.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../../layouts/AuthLayout'
import { useAuth } from '../../context/AuthContext'
import { register as registerApi } from '../../api'

const PANEL = {
  headline: 'Build your dev<br /><em>identity.</em>',
  sub: 'Create your ConnectDev profile and join a network built specifically for software developers. Show what you build, not just where you worked.',
  features: [
    'Free forever for individual developers',
    'Showcase real projects and open source work',
    'Get discovered by devs and teams worldwide',
    'No spam, no recruiters unless you opt in',
  ],
}

export default function Register() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm]       = useState({ name: '', email: '', password: '', confirm: '' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const set = (field) => (e) => {
    setForm(p => ({ ...p, [field]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const { name, email, password, confirm } = form
    if (!name || !email || !password || !confirm) return setError('Please fill in all fields.')
    if (password.length < 6)    return setError('Password must be at least 6 characters.')
    if (password !== confirm)   return setError('Passwords do not match.')
    setLoading(true)
    try {
      const { data } = await registerApi({ name, email, password })
      login(data.token, data.user)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout {...PANEL}>
      <h2 className="auth-form-heading">Create account</h2>
      <p className="auth-form-hint">Join ConnectDev — it's free</p>

      {error && <div className="error-msg">{error}</div>}

      <form onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label className="field-label" htmlFor="name">Full name</label>
          <input className="field-input" id="name" type="text"
            placeholder="Jane Smith" value={form.name}
            onChange={set('name')} autoComplete="name" autoFocus />
        </div>

        <div className="field">
          <label className="field-label" htmlFor="email">Email</label>
          <input className="field-input" id="email" type="email"
            placeholder="you@example.com" value={form.email}
            onChange={set('email')} autoComplete="email" />
        </div>

        <div className="field">
          <label className="field-label" htmlFor="password">Password</label>
          <input className="field-input" id="password" type="password"
            placeholder="Min. 6 characters" value={form.password}
            onChange={set('password')} autoComplete="new-password" />
        </div>

        <div className="field">
          <label className="field-label" htmlFor="confirm">Confirm password</label>
          <input className="field-input" id="confirm" type="password"
            placeholder="Repeat your password" value={form.confirm}
            onChange={set('confirm')} autoComplete="new-password" />
        </div>

        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? 'Creating account…' : 'Create account →'}
        </button>
      </form>

      <div className="divider">or</div>

      <p className="auth-switch">
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </AuthLayout>
  )
}
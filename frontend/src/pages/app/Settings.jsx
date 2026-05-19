import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import AppLayout from '../../layouts/AppLayout'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../components/Toast'
import { profileUpdate, profileAvatar, profileUploadAvatar, profileAddSkill, profileRemoveSkill, authChangePassword } from '../../api'
import { isValidEmail } from '../../utils'

const I = ({ d, size = 15 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}
    strokeLinecap="round" strokeLinejoin="round" style={{ width: size, height: size }}>
    <path d={d} />
  </svg>
)
const icons = {
  user:    'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z',
  key:     'M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4',
  image:   'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M14 8h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
  logout:  'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1',
  alert:   'M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z',
}

const EyeIcon = ({ open }) => open
  ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
  : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.956 9.956 0 012.223-3.592M6.228 6.228A9.956 9.956 0 0112 5c4.477 0 8.268 2.943 9.542 7a9.956 9.956 0 01-4.423 5.344M6.228 6.228L3 3m3.228 3.228l3.65 3.65M17.772 17.772l3.228 3.228m-3.228-3.228l-3.65-3.65"/></svg>

const navItems = [
  { id: 'profile',  label: 'Profile',         icon: 'user'  },
  { id: 'avatar',   label: 'Profile picture',  icon: 'image' },
  { id: 'security', label: 'Password',         icon: 'key'   },
  { id: 'account',  label: 'Account',          icon: 'alert' },
]

// ── Profile Section ────────────────────────────────────────────
function ProfileSection({ user, updateUser }) {
  const toast = useToast()
  const [form, setForm]     = useState({
    name: user?.name || '', headline: user?.headline || '',
    bio: user?.bio || '', location: user?.location || '', website: user?.website || '',
  })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [skillInput, setSkillInput] = useState('')
  const [skills, setSkills] = useState(user?.skills || [])

  const set = (f) => (e) => {
    setForm(p => ({ ...p, [f]: e.target.value }))
    if (errors[f]) setErrors(p => ({ ...p, [f]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim())          e.name  = 'Name is required'
    if (form.name.trim().length < 2) e.name = 'Name must be at least 2 characters'
    if (form.website && !/^https?:\/\/.+/.test(form.website)) e.website = 'Enter a valid URL (must start with http:// or https://)'
    setErrors(e)
    return !Object.keys(e).length
  }

  const save = async (ev) => {
    ev.preventDefault()
    if (!validate()) return
    setSaving(true)
    try {
      const { data } = await profileUpdate(form)
      updateUser(data.user)
      toast('Profile updated!', 'success')
    } catch {
      toast('Failed to save profile', 'error')
    } finally {
      setSaving(false)
    }
  }

  const addSkill = async () => {
    const s = skillInput.trim()
    if (!s) return
    try {
      const { data } = await profileAddSkill({ skill: s })
      setSkills(data.skills)
      updateUser({ skills: data.skills })
      setSkillInput('')
    } catch (err) {
      toast(err.response?.data?.message || 'Could not add skill', 'error')
    }
  }

  const removeSkill = async (s) => {
    try {
      const { data } = await profileRemoveSkill(s)
      setSkills(data.skills)
      updateUser({ skills: data.skills })
    } catch {
      toast('Could not remove skill', 'error')
    }
  }

  return (
    <div className="section-card settings-form">
      <div className="section-header">
        <span className="section-title">Profile information</span>
      </div>
      <form onSubmit={save}>
        <div className="field-row">
          <div className="field">
            <label className="field-label">Full name</label>
            <input className={`field-input${errors.name ? ' has-error' : ''}`} value={form.name} onChange={set('name')} />
            {errors.name && <p className="field-error" role="alert">{errors.name}</p>}
          </div>
          <div className="field">
            <label className="field-label">Headline</label>
            <input className="field-input" placeholder="e.g. Senior React Developer" value={form.headline} onChange={set('headline')} />
          </div>
          <div className="field">
            <label className="field-label">Location</label>
            <input className="field-input" placeholder="City, Country" value={form.location} onChange={set('location')} />
          </div>
          <div className="field">
            <label className="field-label">Website</label>
            <input className={`field-input${errors.website ? ' has-error' : ''}`} placeholder="https://yoursite.com" type="url" value={form.website} onChange={set('website')} />
            {errors.website && <p className="field-error" role="alert">{errors.website}</p>}
          </div>
        </div>
        <div className="field">
          <label className="field-label">Bio</label>
          <textarea className="field-input" rows={3} placeholder="Tell the world about yourself…" value={form.bio} onChange={set('bio')} style={{ resize: 'vertical' }} />
        </div>
        <button type="submit" className="btn btn-primary btn-sm" style={{ width: 'auto' }} disabled={saving}>
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </form>

      <div style={{ borderTop: '1px solid var(--border)', marginTop: '1.5rem', paddingTop: '1.5rem' }}>
        <div className="section-header" style={{ marginBottom: '0.875rem' }}>
          <span className="section-title" style={{ fontSize: '0.9rem' }}>Skills</span>
        </div>
        <div className="skills-wrap">
          {skills.map(s => (
            <span key={s} className="skill-chip">
              {s}
              <button className="skill-chip-remove" onClick={() => removeSkill(s)}>×</button>
            </span>
          ))}
          {skills.length === 0 && <p style={{ fontSize: '0.82rem', color: 'var(--text-3)' }}>No skills added yet.</p>}
        </div>
        <div className="skill-add-row">
          <input
            className="field-input"
            placeholder="Add a skill (press Enter)"
            value={skillInput}
            onChange={e => setSkillInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
            style={{ fontSize: '0.85rem', padding: '0.5rem 0.75rem' }}
          />
          <button className="btn btn-ghost btn-sm" onClick={addSkill} disabled={!skillInput.trim()}>+ Add</button>
        </div>
      </div>
    </div>
  )
}

// ── Avatar Section ─────────────────────────────────────────────
function AvatarSection({ user, updateUser }) {
  const toast      = useToast()
  const fileRef    = useRef(null)
  const [tab, setTab]       = useState('upload')   // 'upload' | 'url'
  const [preview, setPreview] = useState(user?.avatar_url || '')
  const [file, setFile]       = useState(null)
  const [url, setUrl]         = useState('')
  const [drag, setDrag]       = useState(false)
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState('')

  const initials = user?.name?.[0]?.toUpperCase() || '?'

  const applyFile = (f) => {
    if (!f) return
    if (!f.type.startsWith('image/')) { setError('Please select an image file'); return }
    if (f.size > 5 * 1024 * 1024)    { setError('Image must be under 5 MB'); return }
    setError('')
    setFile(f)
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target.result)
    reader.readAsDataURL(f)
  }

  const onFileChange = (e) => applyFile(e.target.files?.[0])

  const onDrop = (e) => {
    e.preventDefault(); setDrag(false)
    applyFile(e.dataTransfer.files?.[0])
  }

  const save = async (ev) => {
    ev.preventDefault()
    setError('')
    setSaving(true)
    try {
      if (tab === 'upload') {
        if (!file) { setError('Please select an image first'); setSaving(false); return }
        const form = new FormData()
        form.append('avatar', file)
        const { data } = await profileUploadAvatar(form)
        updateUser({ avatar_url: data.user.avatar_url })
        setPreview(data.user.avatar_url)
        setFile(null)
      } else {
        if (!url.trim()) { setError('Please enter an image URL'); setSaving(false); return }
        if (!/^https?:\/\/.+/.test(url)) { setError('URL must start with http:// or https://'); setSaving(false); return }
        const { data } = await profileAvatar({ avatar_url: url.trim() })
        updateUser({ avatar_url: data.user.avatar_url })
        setPreview(url.trim())
      }
      toast('Profile picture updated!', 'success')
    } catch {
      toast('Failed to update picture', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="section-card">
      <div className="section-header">
        <span className="section-title">Profile picture</span>
      </div>

      {/* Avatar preview with click-to-upload */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.75rem' }}>
        <div
          style={{ position: 'relative', cursor: 'pointer', flexShrink: 0 }}
          onClick={() => tab === 'upload' && fileRef.current?.click()}
          title={tab === 'upload' ? 'Click to choose a photo' : undefined}
        >
          <div className="avatar avatar-xl" style={{ width: 80, height: 80, fontSize: 28 }}>
            {preview
              ? <img src={preview} alt="Avatar" onError={() => setPreview('')} />
              : initials}
          </div>
          {tab === 'upload' && (
            <div style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', opacity: 0, transition: 'opacity 0.15s',
            }}
              className="avatar-upload-overlay"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: 22, height: 22 }}>
                <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
            </div>
          )}
        </div>
        <div>
          <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-1)', marginBottom: '0.2rem' }}>
            {file ? file.name : 'Profile photo'}
          </p>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>
            {tab === 'upload' ? 'JPEG, PNG, GIF or WebP · max 5 MB' : 'Enter a direct link to your photo'}
          </p>
        </div>
      </div>

      {/* Tab switcher */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border)', marginBottom: '1.25rem' }}>
        {[['upload', 'Upload from device'], ['url', 'Use image URL']].map(([id, label]) => (
          <button key={id} type="button"
            onClick={() => { setTab(id); setError('') }}
            style={{
              padding: '0.5rem 1rem', fontSize: '0.82rem', fontWeight: 500,
              background: 'none', border: 'none', cursor: 'pointer',
              borderBottom: `2px solid ${tab === id ? 'var(--brand)' : 'transparent'}`,
              color: tab === id ? 'var(--brand)' : 'var(--text-2)',
              marginBottom: '-1px', transition: 'color 0.15s',
              fontFamily: 'DM Sans, sans-serif',
            }}
          >{label}</button>
        ))}
      </div>

      <form onSubmit={save}>
        {tab === 'upload' ? (
          <>
            {/* Hidden file input */}
            <input
              ref={fileRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp"
              style={{ display: 'none' }} onChange={onFileChange}
            />
            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
              onDragLeave={() => setDrag(false)}
              onDrop={onDrop}
              onClick={() => fileRef.current?.click()}
              style={{
                border: `2px dashed ${drag ? 'var(--brand)' : 'var(--border)'}`,
                borderRadius: 'var(--r-lg)',
                padding: '2rem 1rem',
                textAlign: 'center',
                cursor: 'pointer',
                background: drag ? 'var(--brand-glow)' : 'var(--bg-input)',
                transition: 'border-color 0.15s, background 0.15s',
                marginBottom: '1rem',
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"
                style={{ width: 32, height: 32, color: 'var(--text-3)', marginBottom: '0.75rem' }}>
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
              </svg>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-2)', marginBottom: '0.25rem' }}>
                {file ? `Selected: ${file.name}` : 'Drag & drop an image here'}
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>
                or <span style={{ color: 'var(--brand)', fontWeight: 500 }}>click to browse</span>
              </p>
            </div>
          </>
        ) : (
          <div className="field">
            <label className="field-label">Image URL</label>
            <input
              className={`field-input${error ? ' has-error' : ''}`}
              type="url" placeholder="https://example.com/photo.jpg"
              value={url}
              onChange={e => { setUrl(e.target.value); setPreview(e.target.value); setError('') }}
            />
          </div>
        )}

        {error && <p className="field-error" role="alert" style={{ marginBottom: '0.75rem' }}>{error}</p>}

        <button type="submit" className="btn btn-primary btn-sm" style={{ width: 'auto' }} disabled={saving}>
          {saving ? 'Saving…' : 'Save photo'}
        </button>
      </form>
    </div>
  )
}

// ── Security Section ───────────────────────────────────────────
function SecuritySection() {
  const toast = useToast()
  const [form, setForm]     = useState({ current: '', newPwd: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [show, setShow]     = useState({ current: false, newPwd: false, confirm: false })

  const toggleShow = (f) => setShow(p => ({ ...p, [f]: !p[f] }))
  const set = (f) => (e) => {
    setForm(p => ({ ...p, [f]: e.target.value }))
    if (errors[f]) setErrors(p => ({ ...p, [f]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.current)                  e.current = 'Current password is required'
    if (!form.newPwd)                   e.newPwd  = 'New password is required'
    else if (form.newPwd.length < 6)    e.newPwd  = 'New password must be at least 6 characters'
    if (!form.confirm)                  e.confirm = 'Please confirm your new password'
    else if (form.confirm !== form.newPwd) e.confirm = 'Passwords do not match'
    setErrors(e)
    return !Object.keys(e).length
  }

  const save = async (ev) => {
    ev.preventDefault()
    if (!validate()) return
    setSaving(true)
    try {
      await authChangePassword({ current_password: form.current, new_password: form.newPwd })
      setForm({ current: '', newPwd: '', confirm: '' })
      toast('Password changed successfully!', 'success')
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to change password'
      if (msg.toLowerCase().includes('current') || msg.toLowerCase().includes('incorrect')) {
        setErrors({ current: 'Incorrect current password' })
      } else {
        toast(msg, 'error')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="section-card">
      <div className="section-header">
        <span className="section-title">Change password</span>
      </div>
      <form onSubmit={save} style={{ maxWidth: 420 }}>
        <div className="field">
          <label className="field-label">Current password</label>
          <div className="field-pwd-wrap">
            <input className={`field-input${errors.current ? ' has-error' : ''}`}
              type={show.current ? 'text' : 'password'} placeholder="••••••••"
              value={form.current} onChange={set('current')} autoComplete="current-password" />
            <button type="button" className="pwd-toggle" onClick={() => toggleShow('current')}>
              <EyeIcon open={show.current} />
            </button>
          </div>
          {errors.current && <p className="field-error" role="alert">{errors.current}</p>}
        </div>
        <div className="field">
          <label className="field-label">New password</label>
          <div className="field-pwd-wrap">
            <input className={`field-input${errors.newPwd ? ' has-error' : ''}`}
              type={show.newPwd ? 'text' : 'password'} placeholder="Min. 6 characters"
              value={form.newPwd} onChange={set('newPwd')} autoComplete="new-password" />
            <button type="button" className="pwd-toggle" onClick={() => toggleShow('newPwd')}>
              <EyeIcon open={show.newPwd} />
            </button>
          </div>
          {errors.newPwd && <p className="field-error" role="alert">{errors.newPwd}</p>}
        </div>
        <div className="field">
          <label className="field-label">Confirm new password</label>
          <div className="field-pwd-wrap">
            <input className={`field-input${errors.confirm ? ' has-error' : ''}`}
              type={show.confirm ? 'text' : 'password'} placeholder="Repeat new password"
              value={form.confirm} onChange={set('confirm')} autoComplete="new-password" />
            <button type="button" className="pwd-toggle" onClick={() => toggleShow('confirm')}>
              <EyeIcon open={show.confirm} />
            </button>
          </div>
          {errors.confirm && <p className="field-error" role="alert">{errors.confirm}</p>}
        </div>
        <button type="submit" className="btn btn-primary btn-sm" style={{ width: 'auto' }} disabled={saving}>
          {saving ? 'Updating…' : 'Update password'}
        </button>
      </form>
    </div>
  )
}

// ── Account Section ────────────────────────────────────────────
function AccountSection() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="section-card">
      <div className="section-header">
        <span className="section-title">Account</span>
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-2)', marginBottom: '0.25rem' }}>Signed in as</p>
        <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-1)' }}>{user?.email}</p>
      </div>
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
          <I d={icons.logout} size={14} /> Sign out
        </button>
      </div>
      <div className="danger-zone">
        <h3><I d={icons.alert} size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> Danger zone</h3>
        <p>Once you delete your account, all your data will be permanently removed. This action cannot be undone.</p>
        <button className="btn btn-danger btn-sm" onClick={() => alert('Account deletion is not available in this version.')}>
          Delete account
        </button>
      </div>
    </div>
  )
}

// ── Settings Page ──────────────────────────────────────────────
export default function Settings() {
  const { user, updateUser } = useAuth()
  const [section, setSection] = useState('profile')

  return (
    <AppLayout title="Settings">
      <div className="page-header">
        <h1>Settings</h1>
        <p>Manage your account and preferences.</p>
      </div>

      <div className="settings-layout">
        <div className="settings-sidebar">
          {navItems.map(n => (
            <button key={n.id}
              className={`settings-nav-item${section === n.id ? ' active' : ''}`}
              onClick={() => setSection(n.id)}>
              <I d={icons[n.icon]} />
              {n.label}
            </button>
          ))}
        </div>

        <div>
          {section === 'profile'  && <ProfileSection  user={user} updateUser={updateUser} />}
          {section === 'avatar'   && <AvatarSection   user={user} updateUser={updateUser} />}
          {section === 'security' && <SecuritySection />}
          {section === 'account'  && <AccountSection  />}
        </div>
      </div>
    </AppLayout>
  )
}

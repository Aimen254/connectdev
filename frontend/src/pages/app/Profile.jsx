import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import AppLayout from '../../layouts/AppLayout'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../components/Toast'
import { profileGet, profileUpdate, profileAvatar, profileAddSkill, profileRemoveSkill, feedGetUserPosts, netSendRequest, netAcceptRequest, netRejectRequest, netRemove, netCancel } from '../../api'
import { initials, timeAgo } from '../../utils'

const I = ({ d, size = 15 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}
    strokeLinecap="round" strokeLinejoin="round" style={{ width: size, height: size }}>
    <path d={d} />
  </svg>
)
const icons = {
  map:     'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z',
  link:    'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101M10.172 13.828a4 4 0 015.656 0l4 4a4 4 0 01-5.656 5.656l-1.1-1.1',
  edit:    'M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z',
  plus:    'M12 5v14M5 12h14',
  check:   'M5 13l4 4L19 7',
  x:       'M6 18L18 6M6 6l12 12',
  heart:   'M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z',
  comment: 'M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z',
}

export default function Profile() {
  const { id } = useParams()
  const { user: me, updateUser } = useAuth()
  const toast    = useToast()
  const navigate = useNavigate()

  const userId  = id ? parseInt(id, 10) : me?.id
  const isOwn   = !id || parseInt(id, 10) === me?.id

  const [profile,  setProfile]  = useState(null)
  const [posts,    setPosts]    = useState([])
  const [loading,  setLoading]  = useState(true)
  const [editing,  setEditing]  = useState(false)
  const [saving,   setSaving]   = useState(false)
  const [editForm, setEditForm] = useState({})
  const [skillInput, setSkillInput] = useState('')
  const [addingSkill, setAddingSkill] = useState(false)

  useEffect(() => {
    if (!userId) return
    setLoading(true)
    Promise.all([
      profileGet(userId),
      feedGetUserPosts(userId, { limit: 5 }),
    ])
      .then(([profileRes, postsRes]) => {
        setProfile(profileRes.data)
        setPosts(postsRes.data.posts)
        if (isOwn) setEditForm({
          name: profileRes.data.name || '',
          headline: profileRes.data.headline || '',
          bio: profileRes.data.bio || '',
          location: profileRes.data.location || '',
          website: profileRes.data.website || '',
        })
      })
      .catch(() => toast('Failed to load profile', 'error'))
      .finally(() => setLoading(false))
  }, [userId])

  const saveProfile = async (e) => {
    e.preventDefault()
    if (!editForm.name?.trim()) return toast('Name is required', 'error')
    setSaving(true)
    try {
      const { data } = await profileUpdate(editForm)
      setProfile(p => ({ ...p, ...data.user }))
      updateUser(data.user)
      setEditing(false)
      toast('Profile updated!', 'success')
    } catch {
      toast('Failed to update profile', 'error')
    } finally {
      setSaving(false)
    }
  }

  const addSkill = async () => {
    const skill = skillInput.trim()
    if (!skill) return
    setAddingSkill(true)
    try {
      const { data } = await profileAddSkill({ skill })
      setProfile(p => ({ ...p, skills: data.skills }))
      setSkillInput('')
    } catch {
      toast('Could not add skill', 'error')
    } finally {
      setAddingSkill(false)
    }
  }

  const removeSkill = async (s) => {
    try {
      const { data } = await profileRemoveSkill(s)
      setProfile(p => ({ ...p, skills: data.skills }))
    } catch {
      toast('Could not remove skill', 'error')
    }
  }

  // Connection actions (for other users)
  const connect = async () => {
    try {
      await netSendRequest(userId)
      setProfile(p => ({ ...p, connection_status: 'pending', connection_initiated_by_me: true }))
      toast('Connection request sent!', 'success')
    } catch (err) {
      toast(err.response?.data?.message || 'Could not send request', 'error')
    }
  }
  const cancelConn = async () => {
    if (!window.confirm('Cancel this connection request?')) return
    try {
      await netCancel(userId)
      setProfile(p => ({ ...p, connection_status: null }))
      toast('Request cancelled', 'info')
    } catch {
      toast('Could not cancel request', 'error')
    }
  }
  const removeConn = async () => {
    if (!window.confirm('Remove this connection?')) return
    try {
      await netRemove(userId)
      setProfile(p => ({ ...p, connection_status: null }))
      toast('Connection removed', 'info')
    } catch {
      toast('Could not remove connection', 'error')
    }
  }
  const acceptConn = async () => {
    try {
      const connId = profile.connection_id
      await netAcceptRequest(connId)
      setProfile(p => ({ ...p, connection_status: 'accepted' }))
      toast('Connected!', 'success')
    } catch {
      toast('Could not accept', 'error')
    }
  }

  if (loading) return (
    <AppLayout title="Profile">
      <div className="profile-hero">
        <div className="profile-hero-cover" />
        <div className="profile-hero-body">
          <div className="profile-avatar-wrap">
            <div className="skeleton skeleton-circle" style={{ width: 80, height: 80, border: '3px solid var(--bg-card)' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 300 }}>
            <div className="skeleton" style={{ height: 22, width: '50%' }} />
            <div className="skeleton" style={{ height: 14, width: '70%' }} />
            <div className="skeleton" style={{ height: 12, width: '40%' }} />
          </div>
        </div>
      </div>
    </AppLayout>
  )

  if (!profile) return (
    <AppLayout title="Profile">
      <div className="card"><div className="empty-state"><div className="empty-icon">🔍</div><h3>User not found</h3></div></div>
    </AppLayout>
  )

  const ini = initials(profile.name)

  return (
    <AppLayout title={isOwn ? 'My Profile' : profile.name}>

      {/* ── Hero ── */}
      <div className="profile-hero">
        <div className="profile-hero-cover" />
        <div className="profile-hero-body">
          <div className="profile-avatar-wrap">
            <div className="profile-avatar-ring">
              <div className="avatar avatar-xl">
                {profile.avatar_url
                  ? <img src={profile.avatar_url} alt={profile.name} />
                  : ini}
              </div>
            </div>
            {isOwn && !editing && (
              <button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}>
                <I d={icons.edit} size={13} /> Edit profile
              </button>
            )}
            {!isOwn && (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {!profile.connection_status && (
                  <button className="btn btn-primary btn-sm" style={{ width: 'auto' }} onClick={connect}>+ Connect</button>
                )}
                {profile.connection_status === 'pending' && profile.connection_initiated_by_me && (
                  <button className="btn btn-ghost btn-sm" onClick={cancelConn}>Request sent · Cancel</button>
                )}
                {profile.connection_status === 'pending' && !profile.connection_initiated_by_me && (
                  <button className="btn btn-primary btn-sm" style={{ width: 'auto' }} onClick={acceptConn}>Accept request</button>
                )}
                {profile.connection_status === 'accepted' && (
                  <button className="btn btn-ghost btn-sm" onClick={removeConn}>Connected · Remove</button>
                )}
              </div>
            )}
          </div>

          {editing ? (
            <form onSubmit={saveProfile} className="settings-form">
              <div className="profile-edit-grid">
                <div className="field">
                  <label className="field-label">Full name</label>
                  <input className="field-input" value={editForm.name}
                    onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div className="field">
                  <label className="field-label">Headline</label>
                  <input className="field-input" placeholder="e.g. Senior React Developer"
                    value={editForm.headline}
                    onChange={e => setEditForm(p => ({ ...p, headline: e.target.value }))} />
                </div>
                <div className="field">
                  <label className="field-label">Location</label>
                  <input className="field-input" placeholder="City, Country"
                    value={editForm.location}
                    onChange={e => setEditForm(p => ({ ...p, location: e.target.value }))} />
                </div>
                <div className="field">
                  <label className="field-label">Website</label>
                  <input className="field-input" placeholder="https://yoursite.com" type="url"
                    value={editForm.website}
                    onChange={e => setEditForm(p => ({ ...p, website: e.target.value }))} />
                </div>
              </div>
              <div className="field" style={{ marginTop: 0 }}>
                <label className="field-label">Bio</label>
                <textarea className="field-input" rows={3} placeholder="Tell others about yourself…"
                  value={editForm.bio}
                  onChange={e => setEditForm(p => ({ ...p, bio: e.target.value }))}
                  style={{ resize: 'vertical' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="submit" className="btn btn-primary btn-sm" style={{ width: 'auto' }} disabled={saving}>
                  {saving ? 'Saving…' : 'Save changes'}
                </button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>Cancel</button>
              </div>
            </form>
          ) : (
            <>
              <h1 className="profile-hero-name">{profile.name}</h1>
              {profile.headline && <p className="profile-hero-headline">{profile.headline}</p>}
              <div className="profile-hero-row">
                {profile.location && <span><I d={icons.map} size={13} />{profile.location}</span>}
                {profile.website  && <a href={profile.website} target="_blank" rel="noreferrer"><I d={icons.link} size={13} />{profile.website.replace(/^https?:\/\//, '')}</a>}
              </div>
              {profile.bio && <p className="profile-bio">{profile.bio}</p>}
              <div className="profile-stats">
                <div>
                  <div className="profile-stat-val">{profile.connection_count ?? 0}</div>
                  <div className="profile-stat-label">Connections</div>
                </div>
                <div>
                  <div className="profile-stat-val">{profile.post_count ?? 0}</div>
                  <div className="profile-stat-label">Posts</div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Skills ── */}
      <div className="section-card">
        <div className="section-header">
          <span className="section-title">Skills</span>
        </div>
        <div className="skills-wrap">
          {(profile.skills || []).length === 0 && !isOwn && (
            <p style={{ fontSize: '0.875rem', color: 'var(--text-3)' }}>No skills listed yet.</p>
          )}
          {(profile.skills || []).map(s => (
            <span key={s} className="skill-chip">
              {s}
              {isOwn && (
                <button className="skill-chip-remove" onClick={() => removeSkill(s)} title={`Remove ${s}`}>×</button>
              )}
            </span>
          ))}
        </div>
        {isOwn && (
          <div className="skill-add-row">
            <input
              className="field-input"
              placeholder="Add a skill (e.g. React, Go, Rust…)"
              value={skillInput}
              onChange={e => setSkillInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              style={{ fontSize: '0.85rem', padding: '0.5rem 0.75rem' }}
            />
            <button
              className="btn btn-ghost btn-sm"
              onClick={addSkill}
              disabled={!skillInput.trim() || addingSkill}
            >
              {addingSkill ? '…' : '+ Add'}
            </button>
          </div>
        )}
      </div>

      {/* ── Posts ── */}
      <div className="section-card">
        <div className="section-header">
          <span className="section-title">Posts</span>
          {posts.length > 0 && (
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/feed')}>
              View all
            </button>
          )}
        </div>
        {posts.length === 0 ? (
          <div className="empty-state" style={{ padding: '2rem' }}>
            <div className="empty-icon">📝</div>
            <h3>No posts yet</h3>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {posts.map(p => (
              <div key={p.id} style={{
                background: 'var(--bg-surface)', border: '1px solid var(--border)',
                borderRadius: 'var(--r-md)', padding: '0.875rem',
              }}>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-1)', whiteSpace: 'pre-wrap', marginBottom: '0.5rem', lineHeight: 1.6 }}>
                  {p.content}
                </p>
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-3)', alignItems: 'center' }}>
                  <span>{timeAgo(p.created_at)}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <I d={icons.heart} size={12} />{p.like_count ?? 0}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <I d={icons.comment} size={12} />{p.comment_count ?? 0}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </AppLayout>
  )
}

// pages/app/Profile.jsx
import AppLayout from '../../layouts/AppLayout'
import { useAuth } from '../../context/AuthContext'

export default function Profile() {
  const { user } = useAuth()
  const initials = (user?.name || '').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <AppLayout title="My Profile">
      <div className="page-header">
        <h1>My Profile</h1>
        <p>This is how other developers see you.</p>
      </div>

      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1rem' }}>
        <div className="avatar avatar-lg">{initials}</div>
        <div>
          <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1.1rem' }}>
            {user?.name || 'Your Name'}
          </p>
          <p style={{ color: 'var(--text-2)', fontSize: '0.875rem' }}>{user?.email}</p>
          <p style={{ color: 'var(--text-3)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
            Headline · Location · Website — coming in Phase 2
          </p>
        </div>
      </div>

      <div className="card" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-3)' }}>
        <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✏️</p>
        <p>Full profile editing coming in Phase 2</p>
      </div>
    </AppLayout>
  )
}
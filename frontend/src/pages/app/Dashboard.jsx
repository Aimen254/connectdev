import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AppLayout from '../../layouts/AppLayout'
import { useAuth } from '../../context/AuthContext'
import { profileGet, netGetRequests } from '../../api'

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const firstName = user?.name?.split(' ')[0] || 'Developer'

  const [stats, setStats]   = useState({ connections: 0, posts: 0, requests: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) return
    Promise.all([
      profileGet(user.id),
      netGetRequests(),
    ])
      .then(([profileRes, reqRes]) => {
        setStats({
          connections: profileRes.data.connection_count ?? 0,
          posts:       profileRes.data.post_count       ?? 0,
          requests:    reqRes.data.requests.length       ?? 0,
        })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user?.id])

  const statItems = [
    { label: 'Connections',      value: stats.connections, sub: 'Accepted',        action: () => navigate('/network') },
    { label: 'Posts',            value: stats.posts,       sub: 'Published',       action: () => navigate('/feed')    },
    { label: 'Pending requests', value: stats.requests,    sub: 'Awaiting you',    action: () => navigate('/network') },
  ]

  const features = [
    { icon: '📝', text: 'Create and share posts to your feed',        done: true  },
    { icon: '🤝', text: 'Send and accept connection requests',        done: true  },
    { icon: '👤', text: 'Edit your profile — headline, bio, skills',  done: true  },
    { icon: '🔍', text: 'Search developers by name, skill, location', done: true  },
    { icon: '🔔', text: 'Real-time notifications',                    done: true  },
  ]

  return (
    <AppLayout title="Dashboard">
      <div className="welcome-banner">
        <h2>Hey, {firstName} 👋</h2>
        <p>Welcome to ConnectDev — your developer professional network. Here's your overview.</p>
      </div>

      <div className="stats-row">
        {statItems.map((s, i) => (
          <div key={i} className="stat-card" style={{ cursor: 'pointer' }} onClick={s.action}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">
              {loading
                ? <span className="skeleton" style={{ display: 'block', height: 28, width: 48, borderRadius: 6 }} />
                : s.value}
            </div>
            <div className="stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <p style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-3)', marginBottom: '1rem', fontWeight: 600 }}>
          Platform features
        </p>
        {features.map((f, i) => (
          <div key={i} className="roadmap-item">
            <span className="roadmap-icon">{f.icon}</span>
            <span>{f.text}</span>
            <span className={`phase-badge${f.done ? ' phase-done' : ''}`}>{f.done ? '✓ Live' : 'Coming soon'}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
        <div className="card" style={{ cursor: 'pointer' }} onClick={() => navigate('/feed')}>
          <p style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-3)', marginBottom: '0.5rem', fontWeight: 600 }}>Quick action</p>
          <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, marginBottom: '0.35rem' }}>Share a post →</p>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-3)' }}>Share what you're building with your network</p>
        </div>
        <div className="card" style={{ cursor: 'pointer' }} onClick={() => navigate('/network')}>
          <p style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-3)', marginBottom: '0.5rem', fontWeight: 600 }}>Quick action</p>
          <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, marginBottom: '0.35rem' }}>Grow your network →</p>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-3)' }}>Connect with developers who share your stack</p>
        </div>
      </div>
    </AppLayout>
  )
}

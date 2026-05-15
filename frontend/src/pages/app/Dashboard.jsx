// pages/app/Dashboard.jsx
import AppLayout from '../../layouts/AppLayout'
import { useAuth } from '../../context/AuthContext'

export default function Dashboard() {
  const { user } = useAuth()
  const firstName = user?.name?.split(' ')[0] || 'Developer'

  return (
    <AppLayout title="Dashboard">

      {/* Welcome banner */}
      <div className="welcome-banner">
        <h2>Hey, {firstName} 👋</h2>
        <p>Your ConnectDev account is ready. Let's build your profile next.</p>
      </div>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-label">Profile views</div>
          <div className="stat-value">0</div>
          <div className="stat-sub">Last 7 days</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Connections</div>
          <div className="stat-value">0</div>
          <div className="stat-sub">Accepted</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Posts</div>
          <div className="stat-value">0</div>
          <div className="stat-sub">Published</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pending requests</div>
          <div className="stat-value">3</div>
          <div className="stat-sub">Awaiting you</div>
        </div>
      </div>

      {/* Roadmap */}
      <div className="card">
        <p style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-3)', marginBottom: '1rem', fontWeight: 600 }}>
          Coming next
        </p>

        <div className="roadmap-item">
          <span className="roadmap-icon">👤</span>
          <span>Edit your profile — headline, bio, skills, location</span>
          <span className="phase-badge">Phase 2</span>
        </div>
        <div className="roadmap-item">
          <span className="roadmap-icon">📝</span>
          <span>Create and share posts to your feed</span>
          <span className="phase-badge">Phase 3</span>
        </div>
        <div className="roadmap-item">
          <span className="roadmap-icon">🤝</span>
          <span>Send and accept connection requests</span>
          <span className="phase-badge">Phase 4</span>
        </div>
        <div className="roadmap-item">
          <span className="roadmap-icon">🔍</span>
          <span>Search developers by skill or location</span>
          <span className="phase-badge">Phase 5</span>
        </div>
      </div>

    </AppLayout>
  )
}
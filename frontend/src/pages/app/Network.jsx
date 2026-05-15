// pages/app/Network.jsx
import AppLayout from '../../layouts/AppLayout'

export default function Network() {
  return (
    <AppLayout title="Network">
      <div className="page-header">
        <h1>Network</h1>
        <p>Manage your connections and pending requests.</p>
      </div>
      <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-3)' }}>
        <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🤝</p>
        <p>Connections coming in Phase 4</p>
      </div>
    </AppLayout>
  )
}
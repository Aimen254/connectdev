// pages/app/Settings.jsx
import AppLayout from '../../layouts/AppLayout'

export default function Settings() {
  return (
    <AppLayout title="Settings">
      <div className="page-header">
        <h1>Settings</h1>
        <p>Manage your account preferences.</p>
      </div>
      <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-3)' }}>
        <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚙️</p>
        <p>Settings coming in Phase 5</p>
      </div>
    </AppLayout>
  )
}
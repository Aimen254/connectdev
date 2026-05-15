// pages/app/Feed.jsx
import AppLayout from '../../layouts/AppLayout'

export default function Feed() {
  return (
    <AppLayout title="Feed">
      <div className="page-header">
        <h1>Feed</h1>
        <p>Posts from your network will appear here.</p>
      </div>
      <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-3)' }}>
        <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📝</p>
        <p>Feed coming in Phase 3</p>
      </div>
    </AppLayout>
  )
}
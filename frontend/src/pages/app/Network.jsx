import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AppLayout from '../../layouts/AppLayout'
import { useToast } from '../../components/Toast'
import { netGetSuggestions, netGetConnections, netGetRequests, netGetSent, netSendRequest, netAcceptRequest, netRejectRequest, netRemove, netCancel } from '../../api'
import { initials, timeAgo } from '../../utils'

function Avatar({ src, name, size = 'md' }) {
  return (
    <div className={`avatar avatar-${size}`}>
      {src ? <img src={src} alt={name} /> : initials(name)}
    </div>
  )
}

// ── Suggestions Tab ────────────────────────────────────────────
function SuggestionsTab() {
  const [people, setPeople]   = useState([])
  const [loading, setLoading] = useState(true)
  const [sent, setSent]       = useState(new Set())
  const toast  = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    netGetSuggestions({ limit: 24 })
      .then(({ data }) => setPeople(data.suggestions))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const connect = async (id) => {
    try {
      await netSendRequest(id)
      setSent(s => new Set([...s, id]))
      toast('Connection request sent!', 'success')
    } catch (err) {
      toast(err.response?.data?.message || 'Could not send request', 'error')
    }
  }

  if (loading) return (
    <div className="person-grid">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="person-card">
          <div className="skeleton skeleton-circle" style={{ width: 56, height: 56 }} />
          <div className="skeleton" style={{ height: 12, width: '60%' }} />
          <div className="skeleton" style={{ height: 10, width: '80%' }} />
          <div className="skeleton" style={{ height: 32, width: '100%', borderRadius: 8 }} />
        </div>
      ))}
    </div>
  )

  if (people.length === 0) return (
    <div className="card">
      <div className="empty-state">
        <div className="empty-icon">👥</div>
        <h3>No suggestions right now</h3>
        <p>As you connect with more developers, we'll surface people you may know.</p>
      </div>
    </div>
  )

  return (
    <div className="person-grid">
      {people.map(p => {
        const isSent = sent.has(p.id) || p.connection_status === 'pending'
        const isConnected = p.connection_status === 'accepted'
        return (
          <div key={p.id} className="person-card">
            <Avatar src={p.avatar_url} name={p.name} size="lg" />
            <div>
              <div className="person-card-name"
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/profile/${p.id}`)}>
                {p.name}
              </div>
              <div className="person-card-headline">{p.headline || 'Developer'}</div>
              {p.location && <div className="person-card-location">{p.location}</div>}
              {p.mutual_count > 0 && (
                <div className="person-card-mutual">{p.mutual_count} mutual {p.mutual_count === 1 ? 'connection' : 'connections'}</div>
              )}
            </div>
            <div className="person-card-actions">
              {isConnected ? (
                <button className="person-card-btn connected" disabled>Connected ✓</button>
              ) : isSent ? (
                <button className="person-card-btn pending" disabled>Request sent</button>
              ) : (
                <button className="person-card-btn" onClick={() => connect(p.id)}>+ Connect</button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Connections Tab ────────────────────────────────────────────
function ConnectionsTab() {
  const [list, setList]       = useState([])
  const [loading, setLoading] = useState(true)
  const toast    = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    netGetConnections({ limit: 50 })
      .then(({ data }) => setList(data.connections))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const remove = async (otherId) => {
    if (!window.confirm('Remove this connection?')) return
    try {
      await netRemove(otherId)
      setList(p => p.filter(c => c.id !== otherId))
      toast('Connection removed', 'info')
    } catch {
      toast('Could not remove connection', 'error')
    }
  }

  if (loading) return (
    <div className="connection-list">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="connection-item">
          <div className="skeleton skeleton-circle" style={{ width: 40, height: 40 }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div className="skeleton" style={{ height: 12, width: '30%' }} />
            <div className="skeleton" style={{ height: 10, width: '50%' }} />
          </div>
        </div>
      ))}
    </div>
  )

  if (list.length === 0) return (
    <div className="card">
      <div className="empty-state">
        <div className="empty-icon">🤝</div>
        <h3>No connections yet</h3>
        <p>Visit the Suggestions tab to find developers you may know.</p>
      </div>
    </div>
  )

  return (
    <div className="connection-list">
      {list.map(c => (
        <div key={c.connection_id} className="connection-item">
          <Avatar src={c.avatar_url} name={c.name} size="md" />
          <div className="connection-info">
            <div className="connection-name" onClick={() => navigate(`/profile/${c.id}`)}>{c.name}</div>
            <div className="connection-meta">
              {c.headline || 'Developer'}{c.location ? ` · ${c.location}` : ''}
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => remove(c.id)}>Remove</button>
        </div>
      ))}
    </div>
  )
}

// ── Requests Tab ───────────────────────────────────────────────
function RequestsTab({ onCountChange }) {
  const [requests, setRequests] = useState([])
  const [loading, setLoading]   = useState(true)
  const toast = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    netGetRequests()
      .then(({ data }) => { setRequests(data.requests); onCountChange(data.requests.length) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const accept = async (connId) => {
    try {
      await netAcceptRequest(connId)
      setRequests(p => p.filter(r => r.connection_id !== connId))
      toast('Connection accepted!', 'success')
    } catch {
      toast('Could not accept request', 'error')
    }
  }

  const reject = async (connId) => {
    try {
      await netRejectRequest(connId)
      setRequests(p => p.filter(r => r.connection_id !== connId))
      toast('Request declined', 'info')
    } catch {
      toast('Could not decline request', 'error')
    }
  }

  if (loading) return (
    <div className="request-list">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="request-card">
          <div className="skeleton skeleton-circle" style={{ width: 40, height: 40 }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div className="skeleton" style={{ height: 12, width: '30%' }} />
            <div className="skeleton" style={{ height: 10, width: '50%' }} />
          </div>
        </div>
      ))}
    </div>
  )

  if (requests.length === 0) return (
    <div className="card">
      <div className="empty-state">
        <div className="empty-icon">📬</div>
        <h3>No pending requests</h3>
        <p>When other developers want to connect with you, their requests will appear here.</p>
      </div>
    </div>
  )

  return (
    <div className="request-list">
      {requests.map(r => (
        <div key={r.connection_id} className="request-card">
          <Avatar src={r.avatar_url} name={r.name} size="md" />
          <div className="request-info">
            <div className="request-name"
              style={{ cursor: 'pointer' }}
              onClick={() => navigate(`/profile/${r.id}`)}>
              {r.name}
            </div>
            <div className="request-meta">{r.headline || 'Developer'}{r.location ? ` · ${r.location}` : ''}</div>
            <div className="request-time">{timeAgo(r.created_at)}</div>
          </div>
          <div className="request-actions">
            <button className="btn-accept" onClick={() => accept(r.connection_id)}>Accept</button>
            <button className="btn-reject" onClick={() => reject(r.connection_id)}>Decline</button>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Sent Tab ───────────────────────────────────────────────────
function SentTab() {
  const [sent, setSent]       = useState([])
  const [loading, setLoading] = useState(true)
  const toast = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    netGetSent()
      .then(({ data }) => setSent(data.sent))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const cancel = async (receiverId) => {
    try {
      await netCancel(receiverId)
      setSent(p => p.filter(s => s.id !== receiverId))
      toast('Request cancelled', 'info')
    } catch {
      toast('Could not cancel request', 'error')
    }
  }

  if (loading) return (
    <div className="request-list">
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="request-card">
          <div className="skeleton skeleton-circle" style={{ width: 40, height: 40 }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div className="skeleton" style={{ height: 12, width: '30%' }} />
            <div className="skeleton" style={{ height: 10, width: '50%' }} />
          </div>
        </div>
      ))}
    </div>
  )

  if (sent.length === 0) return (
    <div className="card">
      <div className="empty-state">
        <div className="empty-icon">✉️</div>
        <h3>No sent requests</h3>
        <p>Requests you've sent that are still pending will appear here.</p>
      </div>
    </div>
  )

  return (
    <div className="request-list">
      {sent.map(s => (
        <div key={s.connection_id} className="request-card">
          <Avatar src={s.avatar_url} name={s.name} size="md" />
          <div className="request-info">
            <div className="request-name"
              style={{ cursor: 'pointer' }}
              onClick={() => navigate(`/profile/${s.id}`)}>
              {s.name}
            </div>
            <div className="request-meta">{s.headline || 'Developer'}</div>
            <div className="request-time">Sent {timeAgo(s.created_at)}</div>
          </div>
          <div className="request-actions">
            <button className="btn-reject" onClick={() => cancel(s.id)}>Cancel</button>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Network Page ───────────────────────────────────────────────
export default function Network() {
  const [tab, setTab]               = useState('suggestions')
  const [requestCount, setRequestCount] = useState(0)

  const tabs = [
    { id: 'suggestions', label: 'Suggestions' },
    { id: 'connections', label: 'Connections' },
    { id: 'requests',    label: 'Requests', count: requestCount },
    { id: 'sent',        label: 'Sent' },
  ]

  return (
    <AppLayout title="Network">
      <div className="page-header">
        <h1>Network</h1>
        <p>Build your developer community.</p>
      </div>

      <div className="tabs">
        {tabs.map(t => (
          <button key={t.id}
            className={`tab-btn${tab === t.id ? ' active' : ''}`}
            onClick={() => setTab(t.id)}>
            {t.label}
            {t.count > 0 && <span className="tab-count">{t.count}</span>}
          </button>
        ))}
      </div>

      {tab === 'suggestions' && <SuggestionsTab />}
      {tab === 'connections' && <ConnectionsTab />}
      {tab === 'requests'    && <RequestsTab onCountChange={setRequestCount} />}
      {tab === 'sent'        && <SentTab />}
    </AppLayout>
  )
}

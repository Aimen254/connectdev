import { useState, useEffect, useRef, useCallback } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { notifGet, notifUnread, notifMarkAllRead, searchAll } from '../api'
import { timeAgo, initials } from '../utils'

const I = ({ d, ...p }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...p}>
    <path strokeLinecap="round" strokeLinejoin="round" d={d} />
  </svg>
)
const icons = {
  home:     'M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5zM9 21V12h6v9',
  feed:     'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v10a2 2 0 01-2 2zM7 8h5M7 12h8M7 16h5',
  users:    'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75',
  user:     'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z',
  settings: 'M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z',
  bell:     'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
  search:   'M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z',
  logout:   'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1',
  check:    'M5 13l4 4L19 7',
}

const navLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: 'home'  },
  { to: '/feed',      label: 'Feed',      icon: 'feed'  },
  { to: '/network',   label: 'Network',   icon: 'users' },
  { to: '/profile',   label: 'My Profile',icon: 'user'  },
]

function Avatar({ user, size = 'md' }) {
  const ini = initials(user?.name)
  return (
    <div className={`avatar avatar-${size}`}>
      {user?.avatar_url ? <img src={user.avatar_url} alt={user.name} /> : ini}
    </div>
  )
}

const SunIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
)
const MoonIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
  </svg>
)

export default function AppLayout({ children, title = '' }) {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  // ── Notifications ──────────────────────────────────
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifOpen, setNotifOpen]     = useState(false)
  const [notifs, setNotifs]           = useState([])
  const notifRef = useRef(null)

  useEffect(() => {
    notifUnread().then(({ data }) => setUnreadCount(data.unread_count)).catch(() => {})
    const interval = setInterval(() => {
      notifUnread().then(({ data }) => setUnreadCount(data.unread_count)).catch(() => {})
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  const openNotifs = async () => {
    if (!notifOpen) {
      try {
        const { data } = await notifGet({ limit: 10 })
        setNotifs(data.notifications)
      } catch {}
    }
    setNotifOpen(v => !v)
  }

  const markAllRead = async () => {
    try {
      await notifMarkAllRead()
      setUnreadCount(0)
      setNotifs(p => p.map(n => ({ ...n, is_read: true })))
    } catch {}
  }

  // close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // ── Search ─────────────────────────────────────────
  const [searchQ, setSearchQ]   = useState('')
  const [searchRes, setSearchRes] = useState(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const searchRef = useRef(null)
  const searchTimer = useRef(null)

  const handleSearch = useCallback((val) => {
    setSearchQ(val)
    clearTimeout(searchTimer.current)
    if (!val.trim()) { setSearchRes(null); setSearchOpen(false); return }
    searchTimer.current = setTimeout(async () => {
      try {
        const { data } = await searchAll(val.trim())
        setSearchRes(data)
        setSearchOpen(true)
      } catch {}
    }, 350)
  }, [])

  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = () => { logout(); navigate('/login') }

  const notifLabel = (n) => {
    if (n.type === 'connection_request') return <p><strong>{n.actor_name}</strong> sent you a connection request</p>
    if (n.type === 'connection_accepted') return <p><strong>{n.actor_name}</strong> accepted your connection request</p>
    if (n.type === 'post_like') return <p><strong>{n.actor_name}</strong> liked your post</p>
    if (n.type === 'post_comment') return <p><strong>{n.actor_name}</strong> commented on your post</p>
    return <p>{n.type}</p>
  }

  return (
    <div className="app-layout">
      {/* ══ SIDEBAR ══════════════════════════════════════ */}
      <aside className="sidebar">
        <NavLink to="/dashboard" className="sidebar-logo">
          <div className="logo-mark">
            <svg viewBox="0 0 32 32" fill="none">
              <path d="M9 11.5 L14.5 17 L9 22.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M23 11.5 L17.5 17 L23 22.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="logo-text">ConnectDev</span>
        </NavLink>

        <nav className="sidebar-nav">
          <span className="nav-section-label">Menu</span>
          {navLinks.map(({ to, label, icon }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
              <I d={icons[icon]} />
              {label}
              {to === '/network' && unreadCount > 0 && (
                <span className="nav-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
              )}
            </NavLink>
          ))}

          <span className="nav-section-label" style={{ marginTop: '1rem' }}>Account</span>
          <NavLink to="/settings"
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            <I d={icons.settings} />
            Settings
          </NavLink>
          <button className="nav-item" onClick={handleLogout}>
            <I d={icons.logout} />
            Sign out
          </button>
        </nav>

        <div className="sidebar-footer">
          <NavLink to="/profile" className="sidebar-user" style={{ textDecoration: 'none' }}>
            <Avatar user={user} size="sm" />
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.name || 'Developer'}</div>
              <div className="sidebar-user-role">{user?.headline || 'ConnectDev'}</div>
            </div>
          </NavLink>
        </div>
      </aside>

      {/* ══ TOPBAR ════════════════════════════════════════ */}
      <header className="topbar">
        <div className="topbar-left">
          <span className="topbar-page-title">{title}</span>
        </div>

        <div className="topbar-right">
          {/* Search */}
          <div className="topbar-search-wrap" ref={searchRef}>
            <div className="search-box">
              <I d={icons.search} style={{ width: 14, height: 14 }} />
              <input
                placeholder="Search developers…"
                value={searchQ}
                onChange={e => handleSearch(e.target.value)}
                onFocus={() => searchRes && setSearchOpen(true)}
              />
            </div>
            {searchOpen && searchRes && (
              <div className="search-dropdown">
                {searchRes.users?.length > 0 && (
                  <>
                    <div className="search-section-label">People</div>
                    {searchRes.users.map(u => (
                      <div key={u.id} className="search-result-item"
                        onClick={() => { navigate(`/profile/${u.id}`); setSearchOpen(false); setSearchQ('') }}>
                        <div className="avatar avatar-sm">
                          {u.avatar_url ? <img src={u.avatar_url} alt={u.name} /> : initials(u.name)}
                        </div>
                        <div>
                          <div className="search-result-name">{u.name}</div>
                          <div className="search-result-sub">{u.headline || u.location || 'Developer'}</div>
                        </div>
                      </div>
                    ))}
                  </>
                )}
                {searchRes.posts?.length > 0 && (
                  <>
                    <div className="search-section-label">Posts</div>
                    {searchRes.posts.map(p => (
                      <div key={p.id} className="search-result-item"
                        onClick={() => { navigate('/feed'); setSearchOpen(false); setSearchQ('') }}>
                        <div>
                          <div className="search-result-name" style={{ fontSize: '0.8rem' }}>
                            {p.content.slice(0, 60)}{p.content.length > 60 ? '…' : ''}
                          </div>
                          <div className="search-result-sub">{p.author_name}</div>
                        </div>
                      </div>
                    ))}
                  </>
                )}
                {!searchRes.users?.length && !searchRes.posts?.length && (
                  <div className="search-empty">No results for "{searchQ}"</div>
                )}
              </div>
            )}
          </div>

          {/* Theme toggle */}
          <button
            className="topbar-icon-btn"
            onClick={toggleTheme}
            title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            {theme === 'light' ? <MoonIcon /> : <SunIcon />}
          </button>

          {/* Notifications */}
          <div className="notif-wrap" ref={notifRef}>
            <button className="topbar-icon-btn" onClick={openNotifs} title="Notifications">
              <I d={icons.bell} style={{ width: 16, height: 16 }} />
              {unreadCount > 0 && (
                <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
              )}
            </button>

            {notifOpen && (
              <div className="notif-panel">
                <div className="notif-panel-header">
                  <span className="notif-panel-title">Notifications</span>
                  {unreadCount > 0 && (
                    <button
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', color: 'var(--brand)' }}
                      onClick={markAllRead}
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                {notifs.length === 0 ? (
                  <div className="notif-empty">No notifications yet</div>
                ) : (
                  notifs.map(n => (
                    <div key={n.id} className={`notif-item${n.is_read ? '' : ' unread'}`}>
                      {!n.is_read ? <div className="notif-dot" /> : <div className="notif-dot-empty" />}
                      <div>
                        <div className="notif-text">{notifLabel(n)}</div>
                        <div className="notif-time">{timeAgo(n.created_at)}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Avatar */}
          <NavLink to="/profile" style={{ textDecoration: 'none' }}>
            <Avatar user={user} size="md" />
          </NavLink>
        </div>
      </header>

      {/* ══ MAIN ═══════════════════════════════════════════ */}
      <main className="app-main">
        <div className="page-content">{children}</div>
      </main>
    </div>
  )
}

// layouts/AppLayout.jsx
// Sidebar + Topbar shell used by every inner/protected page.
// Usage: wrap page content with <AppLayout title="Dashboard">...</AppLayout>

import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// ── Icons (inline SVG, no dep needed) ──────────────────
const Icon = ({ d, ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d={d} />
  </svg>
)

const icons = {
  home:    'M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z M9 21V12h6v9',
  user:    'M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-5.33 0-8 2.67-8 4v1h16v-1c0-1.33-2.67-4-8-4z',
  users:   'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75',
  feed:    'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v10a2 2 0 01-2 2zM7 8h5M7 12h8M7 16h5',
  bell:    'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
  search:  'M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z',
  logout:  'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1',
  settings:'M12 15a3 3 0 100-6 3 3 0 000 6zm0 0v0M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z',
}

const navLinks = [
  { to: '/dashboard',   label: 'Dashboard',   icon: 'home'  },
  { to: '/feed',        label: 'Feed',         icon: 'feed'  },
  { to: '/network',     label: 'Network',      icon: 'users', badge: '3' },
  { to: '/profile',     label: 'My Profile',   icon: 'user'  },
]

const secondaryLinks = [
  { to: '/settings', label: 'Settings', icon: 'settings' },
]

// ── Helpers ──────────────────────────────────────────
function initials(name = '') {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'CD'
}

// ── Component ────────────────────────────────────────
export default function AppLayout({ children, title = '' }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="app-layout">

      {/* ══ SIDEBAR ══════════════════════════════════ */}
      <aside className="sidebar">
        {/* Logo */}
        <NavLink to="/dashboard" className="sidebar-logo">
          <div className="logo-mark">CD</div>
          <span className="logo-text">ConnectDev</span>
        </NavLink>

        {/* Primary nav */}
        <nav className="sidebar-nav">
          <span className="nav-section-label">Menu</span>

          {navLinks.map(({ to, label, icon, badge }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <Icon d={icons[icon]} />
              {label}
              {badge && <span className="nav-badge">{badge}</span>}
            </NavLink>
          ))}

          <span className="nav-section-label" style={{ marginTop: '1rem' }}>Account</span>

          {secondaryLinks.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <Icon d={icons[icon]} />
              {label}
            </NavLink>
          ))}

          <button className="nav-item" onClick={handleLogout} style={{ marginTop: 'auto' }}>
            <Icon d={icons.logout} />
            Sign out
          </button>
        </nav>

        {/* User footer */}
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="avatar avatar-sm">{initials(user?.name)}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.name || 'Developer'}</div>
              <div className="sidebar-user-role">Free plan</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ══ TOPBAR ═══════════════════════════════════ */}
      <header className="topbar">
        <div className="topbar-left">
          <span className="topbar-page-title">{title}</span>
        </div>

        <div className="topbar-right">
          {/* Search */}
          <div className="search-box">
            <Icon d={icons.search} style={{ width: 14, height: 14 }} />
            <input placeholder="Search developers…" />
          </div>

          {/* Notifications */}
          <button className="topbar-icon-btn" title="Notifications">
            <Icon d={icons.bell} style={{ width: 16, height: 16 }} />
          </button>

          {/* Avatar */}
          <div className="avatar avatar-md">{initials(user?.name)}</div>
        </div>
      </header>

      {/* ══ MAIN ═════════════════════════════════════ */}
      <main className="app-main">
        <div className="page-content">
          {children}
        </div>
      </main>

    </div>
  )
}
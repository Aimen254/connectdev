import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'

const SunIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
    <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
)
const MoonIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
  </svg>
)

const FEATURES = [
  {
    icon: '👤',
    title: 'Developer Identity',
    desc: 'Build a rich profile that goes beyond a résumé — showcase your stack, open-source contributions, and the projects you are proud of.',
  },
  {
    icon: '📰',
    title: 'Code-First Feed',
    desc: 'Share snippets, write-ups, and project updates with a community that understands the difference between a bug and a feature.',
  },
  {
    icon: '🤝',
    title: 'Meaningful Network',
    desc: 'Connect with engineers, designers, and founders who build real things — no noise, no recruiters unless you want them.',
  },
  {
    icon: '🔍',
    title: 'Discover Talent',
    desc: 'Search by skills, stack, and location to find collaborators for your next side project or your next hire.',
  },
  {
    icon: '🏷️',
    title: 'Skills & Stack',
    desc: 'Tag the languages and frameworks you actually use. Your profile becomes a searchable, living record of your expertise.',
  },
  {
    icon: '🔒',
    title: 'Privacy First',
    desc: 'You own your data. No dark patterns, no algorithmic pressure — just a clean space to build in public or in private.',
  },
]

const STEPS = [
  {
    n: '1',
    title: 'Create your profile',
    desc: 'Sign up in seconds and build a developer profile that reflects who you really are — your tech, your work, your story.',
  },
  {
    n: '2',
    title: 'Share your work',
    desc: 'Post updates, share code, and write about what you are building. Your feed is yours — technical, personal, or both.',
  },
  {
    n: '3',
    title: 'Build your network',
    desc: 'Connect with developers around the world. Send requests, accept collaborators, and grow your professional circle organically.',
  },
]

const STATS = [
  { val: '100%', label: 'Free for individuals' },
  { val: '6',    label: 'Core platform features' },
  { val: '0',    label: 'Ads or spam' },
]

export default function About() {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="about-page">
      {/* ── Navbar ── */}
      <nav className="about-nav">
        <Link to="/" className="about-nav-logo">
          <div className="logo-mark" style={{ width: 32, height: 32, borderRadius: 8 }}>
            <svg viewBox="0 0 32 32" fill="none" style={{ width: 20, height: 20 }}>
              <path d="M9 11.5 L14.5 17 L9 22.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M23 11.5 L17.5 17 L23 22.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="logo-text">ConnectDev</span>
        </Link>

        <div className="about-nav-links">
          <Link to="/about" className="about-nav-link active">About</Link>
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            style={{ marginRight: '0.25rem' }}
          >
            {theme === 'light' ? <MoonIcon /> : <SunIcon />}
          </button>
          <Link to="/login" className="about-nav-link">Sign in</Link>
          <Link to="/register" className="about-nav-cta">Get started</Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="about-hero">
        <div className="about-hero-badge">
          <svg viewBox="0 0 16 16" fill="currentColor" style={{ width: 10, height: 10 }}>
            <circle cx="8" cy="8" r="8"/>
          </svg>
          Built for software developers
        </div>

        <h1>
          The professional<br />
          network for <em>builders.</em>
        </h1>

        <p>
          ConnectDev is the developer-first professional network — a place to show your real work,
          connect with engineers who get it, and grow your career without the noise.
        </p>

        <div className="about-hero-actions">
          <Link to="/register" className="about-btn-primary">
            Create free account →
          </Link>
          <Link to="/login" className="about-btn-secondary">
            Sign in
          </Link>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="about-section" style={{ paddingTop: '2rem' }}>
        <p className="about-section-label">Platform</p>
        <h2 className="about-section-title">Everything a developer needs</h2>
        <p className="about-section-sub">
          We built the tools that matter — no filler, no enterprise bloat. Just a clean,
          fast platform that respects your time.
        </p>

        <div className="features-grid">
          {FEATURES.map((f) => (
            <div key={f.title} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="about-section" style={{ paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
        <p className="about-section-label">Getting started</p>
        <h2 className="about-section-title">Up and running in minutes</h2>
        <p className="about-section-sub">
          No onboarding surveys, no gatekeeping. Create an account, build your profile,
          and start connecting.
        </p>

        <div className="steps-grid">
          {STEPS.map((s) => (
            <div key={s.n} className="step-item">
              <div className="step-num">{s.n}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="about-section" style={{ paddingTop: '2rem', paddingBottom: '2rem', borderTop: '1px solid var(--border)' }}>
        <div className="about-stats">
          {STATS.map((s) => (
            <div key={s.label}>
              <div className="about-stat-val">{s.val}</div>
              <div className="about-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA band ── */}
      <div className="about-cta-band">
        <h2>Ready to build your developer identity?</h2>
        <p>Join ConnectDev — free forever for individual developers.</p>
        <Link to="/register" className="about-cta-white">
          Create your profile →
        </Link>
      </div>

      {/* ── Footer ── */}
      <footer className="about-footer">
        <span>© 2025 ConnectDev · Built for developers.</span>
        <div className="about-footer-links">
          <Link to="/about">About</Link>
          <Link to="/register">Sign up</Link>
          <Link to="/login">Sign in</Link>
        </div>
      </footer>
    </div>
  )
}

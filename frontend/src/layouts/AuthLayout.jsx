import { useTheme } from '../context/ThemeContext'

const LogoMark = () => (
  <div className="logo-mark">
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 11.5 L14.5 17 L9 22.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M23 11.5 L17.5 17 L23 22.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  </div>
)

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

export default function AuthLayout({ children, headline, sub, features = [] }) {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="auth-layout">
      <aside className="auth-panel">
        <div className="auth-panel-glow"  aria-hidden />
        <div className="auth-panel-grid"  aria-hidden />

        <div className="auth-panel-logo">
          <LogoMark />
          <span className="logo-text">ConnectDev</span>
        </div>

        <div className="auth-panel-body">
          <h1 className="auth-panel-headline" dangerouslySetInnerHTML={{ __html: headline }} />
          {sub && <p className="auth-panel-sub">{sub}</p>}
          {features.length > 0 && (
            <ul className="auth-features">
              {features.map((f, i) => (
                <li key={i}><span className="feature-pip" />{f}</li>
              ))}
            </ul>
          )}
        </div>

        <p className="auth-panel-footer">© 2025 ConnectDev · Built for developers.</p>
      </aside>

      <div className="auth-form-area">
        <div className="auth-form-area-top">
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            {theme === 'light' ? <MoonIcon /> : <SunIcon />}
          </button>
        </div>
        <div className="auth-form-wrap">{children}</div>
      </div>
    </div>
  )
}

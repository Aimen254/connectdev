const LogoMark = () => (
  <div className="logo-mark">
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 11.5 L14.5 17 L9 22.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M23 11.5 L17.5 17 L23 22.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  </div>
)

export default function AuthLayout({ children, headline, sub, features = [] }) {
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
        <div className="auth-form-wrap">{children}</div>
      </div>
    </div>
  )
}

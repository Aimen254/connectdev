// layouts/AuthLayout.jsx
// Reusable split-screen layout for all auth pages (Login, Register, ForgotPassword, etc.)
// Left panel = branding  |  Right panel = {children}

export default function AuthLayout({ children, headline, sub, features = [] }) {
  return (
    <div className="auth-layout">

      {/* ── Left branding panel ── */}
      <aside className="auth-panel">
        <div className="auth-panel-glow" aria-hidden />
        <div className="auth-panel-grid"  aria-hidden />

        {/* Logo */}
        <div className="auth-panel-logo">
          <div className="logo-mark">CD</div>
          <span className="logo-text">ConnectDev</span>
        </div>

        {/* Headline + features */}
        <div className="auth-panel-body">
          <h1 className="auth-panel-headline"
            dangerouslySetInnerHTML={{ __html: headline }}
          />
          {sub && <p className="auth-panel-sub">{sub}</p>}
          {features.length > 0 && (
            <ul className="auth-features">
              {features.map((f, i) => (
                <li key={i}>
                  <span className="feature-pip" />
                  {f}
                </li>
              ))}
            </ul>
          )}
        </div>

        <p className="auth-panel-footer">© 2025 ConnectDev. Built for developers.</p>
      </aside>

      {/* ── Right form area ── */}
      <div className="auth-form-area">
        <div className="auth-form-wrap">
          {children}
        </div>
      </div>

    </div>
  )
}
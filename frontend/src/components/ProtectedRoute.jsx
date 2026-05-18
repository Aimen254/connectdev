import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { token, loading } = useAuth()

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)', gap: '1rem',
      }}>
        <div style={{
          width: 36, height: 36, background: 'var(--brand)', borderRadius: 9,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg viewBox="0 0 32 32" style={{ width: 22, height: 22 }}>
            <path d="M9 11.5 L14.5 17 L9 22.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            <path d="M23 11.5 L17.5 17 L23 22.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
        </div>
        <div className="spinner" />
      </div>
    )
  }

  return token ? children : <Navigate to="/login" replace />
}

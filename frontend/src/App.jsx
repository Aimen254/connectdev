import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './components/Toast'
import ProtectedRoute from './components/ProtectedRoute'

import Login          from './pages/auth/Login'
import Register       from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'

import Dashboard from './pages/app/Dashboard'
import Feed      from './pages/app/Feed'
import Network   from './pages/app/Network'
import Profile   from './pages/app/Profile'
import Settings  from './pages/app/Settings'

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login"           element={<Login />} />
            <Route path="/register"        element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            <Route path="/dashboard"   element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/feed"        element={<ProtectedRoute><Feed /></ProtectedRoute>} />
            <Route path="/network"     element={<ProtectedRoute><Network /></ProtectedRoute>} />
            <Route path="/profile"     element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/profile/:id" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/settings"    element={<ProtectedRoute><Settings /></ProtectedRoute>} />

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  )
}

import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'

// Spinner loading sederhana
function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="spinner" />
      <p>Memuat sesi...</p>
    </div>
  )
}

// Hanya tampilkan route private jika sudah login
function PrivateRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) return <LoadingScreen />

  // Belum login → ke halaman login
  if (!user) return <Navigate to="/login" replace />

  return children
}

// Hanya tampilkan route publik jika belum login
function PublicRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) return <LoadingScreen />

  // Sudah login → langsung ke dashboard
  if (user) return <Navigate to="/dashboard" replace />

  return children
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Root redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Halaman login / register */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />

        {/* Dashboard (terproteksi) */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}

export default App

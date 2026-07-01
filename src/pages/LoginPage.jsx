import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function LoginPage() {
  const { login, signUp } = useAuth()
  const navigate = useNavigate()

  const [isRegistering, setIsRegistering] = useState(false)
  const [formData, setFormData] = useState({ email: '', password: '', fullName: '' })
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState(null)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    setMessage(null)

    try {
      if (isRegistering) {
        // ── REGISTRASI ──
        const { error, needsConfirmation } = await signUp(
          formData.email,
          formData.password,
          formData.fullName
        )
        if (error) throw error

        if (needsConfirmation) {
          // Supabase mengharuskan konfirmasi email
          setMessage(
            '📧 Cek email Anda! Kami sudah mengirim link konfirmasi. Klik link tersebut lalu kembali untuk login.'
          )
        } else {
          // Konfirmasi email dinonaktifkan, langsung login
          navigate('/dashboard', { replace: true })
        }
      } else {
        // ── LOGIN ──
        const { data, error } = await login(formData.email, formData.password)
        if (error) throw error

        // Navigasi langsung ke dashboard setelah login berhasil
        navigate('/dashboard', { replace: true })
      }
    } catch (err) {
      // Terjemahkan pesan error Supabase ke Bahasa Indonesia
      const msg = translateError(err.message)
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const switchMode = () => {
    setIsRegistering(!isRegistering)
    setError(null)
    setMessage(null)
    setFormData({ email: '', password: '', fullName: '' })
  }

  return (
    <div className="auth-page">
      {/* Panel kiri - branding */}
      <div className="auth-left">
        <div className="auth-left-brand">
          <span className="logo-icon">💰</span>
          <span>PersonalBudgeting</span>
        </div>
        <div className="auth-left-quote">
          Kendalikan keuangan Anda.<br />
          <strong>Catat, analisa, dan rencanakan</strong> masa depan finansial yang lebih baik.
        </div>
        <div className="auth-left-footer">
          © {new Date().getFullYear()} PersonalBudgeting SaaS
        </div>
      </div>

      {/* Panel kanan - form */}
      <div className="auth-right">
        <div className="auth-card animate-in">
          <div className="auth-logo">
            <span className="logo-icon">💰</span>
            <h1>{isRegistering ? 'Buat Akun Baru' : 'Selamat Datang'}</h1>
            <p>
              {isRegistering
                ? 'Isi data di bawah untuk mulai menggunakan aplikasi'
                : 'Masukkan email dan kata sandi Anda'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {isRegistering && (
              <div className="form-group">
                <label htmlFor="fullName">Nama Lengkap</label>
                <input
                  id="fullName"
                  type="text"
                  name="fullName"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  autoComplete="name"
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="nama@email.com"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Kata Sandi</label>
              <input
                id="password"
                type="password"
                name="password"
                placeholder="Minimal 6 karakter"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                autoComplete={isRegistering ? 'new-password' : 'current-password'}
              />
            </div>

            {error && (
              <div className="alert alert-error" role="alert">
                {error}
              </div>
            )}
            {message && (
              <div className="alert alert-success" role="status">
                {message}
              </div>
            )}

            <button
              id="btn-submit-auth"
              type="submit"
              className="btn btn-primary btn-full"
              disabled={submitting}
              style={{ marginTop: '0.25rem' }}
            >
              {submitting
                ? 'Memproses...'
                : isRegistering
                  ? 'Buat Akun'
                  : 'Masuk'}
            </button>
          </form>

          <div className="auth-switch">
            {isRegistering ? 'Sudah punya akun?' : 'Belum punya akun?'}
            <button
              id="btn-switch-auth"
              type="button"
              className="btn-link"
              onClick={switchMode}
              style={{ marginLeft: '0.375rem' }}
            >
              {isRegistering ? 'Masuk di sini' : 'Daftar gratis'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Terjemahan pesan error Supabase → Bahasa Indonesia
function translateError(msg) {
  if (!msg) return 'Terjadi kesalahan, coba lagi.'
  const m = msg.toLowerCase()
  if (m.includes('invalid login credentials') || m.includes('invalid credentials'))
    return 'Email atau kata sandi salah. Silakan coba lagi.'
  if (m.includes('email not confirmed'))
    return '📧 Email belum dikonfirmasi. Cek kotak masuk email Anda dan klik link konfirmasi terlebih dahulu.'
  if (m.includes('user already registered') || m.includes('already registered'))
    return 'Email ini sudah terdaftar. Silakan login.'
  if (m.includes('password should be at least'))
    return 'Kata sandi minimal 6 karakter.'
  if (m.includes('rate limit'))
    return 'Terlalu banyak percobaan. Tunggu beberapa menit lalu coba lagi.'
  if (m.includes('network') || m.includes('fetch'))
    return 'Koneksi bermasalah. Periksa internet Anda dan coba lagi.'
  return msg
}

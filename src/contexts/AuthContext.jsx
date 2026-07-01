import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext({
  session: null,
  user: null,
  profile: null,
  loading: true,
  signUp: async () => {},
  login: async () => {},
  signOut: async () => {},
})

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  // loading hanya dikelola oleh onAuthStateChange, bukan oleh fungsi login/signUp
  const [loading, setLoading] = useState(true)
  const initialized = useRef(false)

  // Mengambil profile data untuk tenant saat ini
  // Tidak melempar error agar tidak memblokir proses auth
  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        // PGRST116 = row not found, normal sebelum trigger berjalan
        if (error.code !== 'PGRST116') {
          console.warn('Gagal mengambil profil:', error.message)
        }
        setProfile(null)
      } else {
        setProfile(data)
      }
    } catch (err) {
      console.warn('fetchProfile error:', err)
      setProfile(null)
    }
  }

  useEffect(() => {
    // onAuthStateChange adalah sumber kebenaran tunggal untuk status autentikasi.
    // Listener ini SELALU dipanggil dengan event INITIAL_SESSION saat pertama kali mount,
    // sehingga kita tidak perlu memanggil getSession() secara terpisah.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log(`[Auth] Event: ${event}`)

        setSession(newSession)
        const currentUser = newSession?.user ?? null
        setUser(currentUser)

        if (currentUser) {
          // fetchProfile berjalan di background; tidak memblokir loading
          fetchProfile(currentUser.id)
        } else {
          setProfile(null)
        }

        // Loading selesai setelah event pertama (INITIAL_SESSION atau SIGNED_IN)
        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // ── Registrasi ──
  // Tidak mengubah loading di sini; biarkan onAuthStateChange yang menangani.
  const signUp = async (email, password, fullName) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      })
      if (error) throw error

      // identityData kosong = email sudah dipakai tapi belum dikonfirmasi
      const needsConfirmation =
        data?.user && !data?.session

      return { data, error: null, needsConfirmation }
    } catch (error) {
      console.error('signUp error:', error.message)
      return { data: null, error, needsConfirmation: false }
    }
  }

  // ── Login ──
  const login = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      // onAuthStateChange akan otomatis menangani update state & navigasi
      return { data, error: null }
    } catch (error) {
      console.error('login error:', error.message)
      return { data: null, error }
    }
  }

  // ── Logout ──
  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      // onAuthStateChange akan menangani reset state
    } catch (error) {
      console.error('signOut error:', error.message)
    }
  }

  const value = {
    session,
    user,
    profile,
    loading,
    signUp,
    login,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)

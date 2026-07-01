import React from 'react'
import { useAuth } from '../../contexts/AuthContext'

export const Navbar = () => {
  const { user, profile, signOut } = useAuth()

  return (
    <nav className="navbar" style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem 0',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
    }}>
      <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ fontSize: '1.5rem' }}>💰</span>
        <span style={{ fontWeight: '700', fontSize: '1.2rem' }}>PersonalBudgeting</span>
      </div>
      <div className="user-menu" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {user ? (
          <>
            <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>
              Halo, {profile?.full_name || user.email}
            </span>
            <button 
              onClick={signOut}
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                color: '#ef4444',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: '600',
                transition: 'all 0.2s'
              }}
            >
              Keluar
            </button>
          </>
        ) : (
          <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)' }}>Belum Masuk</span>
        )}
      </div>
    </nav>
  )
}

export default Navbar

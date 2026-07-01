import React from 'react'

export const Button = ({ children, onClick, type = 'button', variant = 'primary', disabled = false }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant}`}
      style={{
        padding: '0.6rem 1.2rem',
        borderRadius: '8px',
        border: 'none',
        fontWeight: '600',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        transition: 'all 0.2s ease',
        background: variant === 'primary' ? 'linear-gradient(135deg, #6366f1, #a855f7)' : 'rgba(255, 255, 255, 0.05)',
        color: '#ffffff',
        boxShadow: variant === 'primary' ? '0 4px 12px rgba(99, 102, 241, 0.3)' : 'none',
      }}
    >
      {children}
    </button>
  )
}
export default Button

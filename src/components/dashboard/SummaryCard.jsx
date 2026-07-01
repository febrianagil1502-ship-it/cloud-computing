import React from 'react'

export const SummaryCard = ({ title, value, type = 'neutral', icon }) => {
  const getColor = () => {
    switch (type) {
      case 'income':
        return '#10b981' // emerald
      case 'expense':
        return '#ef4444' // rose
      default:
        return '#6366f1' // indigo
    }
  }

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.02)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: '16px',
      padding: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.3s ease'
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        height: '4px',
        width: '100%',
        backgroundColor: getColor()
      }} />
      <span style={{ fontSize: '0.875rem', color: '#9ca3af', fontWeight: '500' }}>{title}</span>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '1.75rem', fontWeight: '700', color: '#ffffff' }}>{value}</span>
        {icon && <span style={{ fontSize: '1.5rem' }}>{icon}</span>}
      </div>
    </div>
  )
}

export default SummaryCard

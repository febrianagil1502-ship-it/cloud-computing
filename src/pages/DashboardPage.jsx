import React, { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { categoryService } from '../services/categoryService'
import { transactionService } from '../services/transactionService'
import { formatRupiah } from '../utils/formatters'

function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function DashboardPage() {
  const { user, profile, isGuest, signOut, upgradeGuest } = useAuth()
  const [categories, setCategories] = useState([])
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // State untuk form upgrade guest
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [upgradeData, setUpgradeData] = useState({ email: '', password: '', fullName: '' })
  const [upgrading, setUpgrading] = useState(false)
  const [upgradeError, setUpgradeError] = useState(null)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [cats, txns] = await Promise.all([
        categoryService.getAll(),
        transactionService.getAll(),
      ])
      setCategories(cats || [])
      setTransactions(txns || [])
    } catch (err) {
      setError('Gagal memuat data: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const balance = totalIncome - totalExpense

  const displayName = profile?.full_name || user?.email || (isGuest ? 'Guest User' : 'Pengguna')

  const handleUpgrade = async (e) => {
    e.preventDefault()
    setUpgrading(true)
    setUpgradeError(null)
    const { error } = await upgradeGuest(upgradeData.email, upgradeData.password, upgradeData.fullName)
    if (error) {
      setUpgradeError('Gagal menyimpan: ' + error.message)
    } else {
      setShowUpgradeModal(false)
      alert('Berhasil! Akun Anda kini permanen. Data simulasi Anda telah tersimpan.')
      window.location.reload()
    }
    setUpgrading(false)
  }

  return (
    <div className="dashboard-page">
      {/* ── Navbar ── */}
      <header className="dashboard-header">
        <div className="dashboard-header-left">
          <span className="logo-icon">💰</span>
          <h1>PersonalBudgeting</h1>
        </div>
        <div className="dashboard-header-right">
          <div className="user-badge">
            <div className="user-avatar">{getInitials(displayName)}</div>
            <span>{profile?.full_name || user?.email}</span>
          </div>
          <button id="btn-logout" className="btn btn-outline btn-sm" onClick={signOut}>
            Keluar
          </button>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="dashboard-main animate-in">
        <p className="page-title">Dashboard</p>
        <p className="page-subtitle">
          Halo, {profile?.full_name || (isGuest ? 'Tamu' : 'Pengguna')} 👋 — Ini ringkasan keuangan Anda.
        </p>

        {isGuest && (
          <div className="alert alert-warn" style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>
              <strong>Mode Tamu Aktif:</strong> Anda sedang dalam simulasi. Data Anda akan hilang jika Anda keluar (logout).
            </span>
            <button 
              className="btn btn-primary btn-sm" 
              onClick={() => setShowUpgradeModal(true)}
              style={{ whiteSpace: 'nowrap', marginLeft: '1rem' }}
            >
              Simpan Akun Saya
            </button>
          </div>
        )}

        {error && <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>{error}</div>}

        {/* Summary Cards */}
        <div className="summary-grid">
          <div className="summary-card">
            <div className="summary-card-header">
              <span className="summary-label">Pemasukan</span>
              <div className="summary-icon-wrap green">📈</div>
            </div>
            <div className="summary-value">{formatRupiah(totalIncome)}</div>
            <div className="summary-meta">{transactions.filter(t => t.type === 'income').length} transaksi</div>
          </div>

          <div className="summary-card">
            <div className="summary-card-header">
              <span className="summary-label">Pengeluaran</span>
              <div className="summary-icon-wrap red">📉</div>
            </div>
            <div className="summary-value">{formatRupiah(totalExpense)}</div>
            <div className="summary-meta">{transactions.filter(t => t.type === 'expense').length} transaksi</div>
          </div>

          <div className="summary-card">
            <div className="summary-card-header">
              <span className="summary-label">Saldo Bersih</span>
              <div className="summary-icon-wrap blue">💳</div>
            </div>
            <div className={`summary-value ${balance >= 0 ? 'positive' : 'negative'}`}>
              {formatRupiah(balance)}
            </div>
            <div className="summary-meta">{balance >= 0 ? 'Surplus' : 'Defisit'}</div>
          </div>
        </div>

        {/* Grid: Kategori & Transaksi */}
        <div className="dashboard-grid">
          {/* Kategori */}
          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <h2>Kategori Anggaran</h2>
              <span className="badge badge-gray">{categories.length} kategori</span>
            </div>
            <div className="dashboard-card-body">
              {loading ? (
                <p className="loading-text">Memuat data...</p>
              ) : categories.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">📂</div>
                  <p>Belum ada kategori anggaran.</p>
                </div>
              ) : (
                <ul className="category-list">
                  {categories.map((cat) => {
                    const spent = transactions
                      .filter((t) => t.category_id === cat.id && t.type === 'expense')
                      .reduce((sum, t) => sum + Number(t.amount), 0)
                    const pct = cat.budget_limit > 0 ? Math.min((spent / cat.budget_limit) * 100, 100) : 0
                    const barClass = pct >= 100 ? 'danger' : pct >= 80 ? 'warn' : ''

                    return (
                      <li key={cat.id} className="category-item">
                        <div
                          className="category-dot"
                          style={{ background: cat.color || '#9ca3af' }}
                        />
                        <div className="category-info">
                          <div className="category-name">
                            {cat.icon} {cat.name}
                          </div>
                          <div className="category-limit">
                            {formatRupiah(spent)} / {formatRupiah(cat.budget_limit)} limit
                          </div>
                          {cat.budget_limit > 0 && (
                            <div className="budget-bar">
                              <div
                                className={`budget-bar-fill ${barClass}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          )}
                        </div>
                        <span className="badge badge-gray" style={{ flexShrink: 0 }}>
                          {Math.round(pct)}%
                        </span>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </div>

          {/* Transaksi Terakhir */}
          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <h2>Transaksi Terakhir</h2>
              <span className="badge badge-gray">{transactions.length} total</span>
            </div>
            <div className="dashboard-card-body">
              {loading ? (
                <p className="loading-text">Memuat data...</p>
              ) : transactions.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">🧾</div>
                  <p>Belum ada transaksi tercatat.</p>
                </div>
              ) : (
                <ul className="transaction-list">
                  {transactions.slice(0, 10).map((txn) => (
                    <li key={txn.id} className="transaction-item">
                      <div className="txn-left">
                        <div className={`txn-icon ${txn.type}`}>
                          {txn.type === 'income' ? '↑' : '↓'}
                        </div>
                        <div className="txn-info">
                          <div className="txn-desc">
                            {txn.description || 'Tanpa deskripsi'}
                          </div>
                          <div className="txn-cat">
                            {txn.category?.name || 'Tanpa kategori'}
                          </div>
                        </div>
                      </div>
                      <div className="txn-right">
                        <div className={`txn-amount ${txn.type}`}>
                          {txn.type === 'income' ? '+' : '-'}{formatRupiah(txn.amount)}
                        </div>
                        <div className="txn-date">{formatDate(txn.transaction_date)}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Modal Upgrade Guest */}
      {showUpgradeModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h2>Simpan Data Anda</h2>
            <p style={{ marginBottom: '1rem', color: 'var(--gray-600)', fontSize: '0.9rem' }}>
              Daftarkan email dan kata sandi Anda agar data simulasi ini tidak hilang dan dapat diakses kembali nanti.
            </p>
            <form onSubmit={handleUpgrade}>
              <div className="form-group">
                <label>Nama Lengkap</label>
                <input 
                  type="text" 
                  required 
                  value={upgradeData.fullName}
                  onChange={(e) => setUpgradeData({...upgradeData, fullName: e.target.value})}
                  placeholder="John Doe"
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input 
                  type="email" 
                  required 
                  value={upgradeData.email}
                  onChange={(e) => setUpgradeData({...upgradeData, email: e.target.value})}
                  placeholder="nama@email.com"
                />
              </div>
              <div className="form-group">
                <label>Kata Sandi</label>
                <input 
                  type="password" 
                  required 
                  minLength={6}
                  value={upgradeData.password}
                  onChange={(e) => setUpgradeData({...upgradeData, password: e.target.value})}
                  placeholder="Minimal 6 karakter"
                />
              </div>
              
              {upgradeError && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{upgradeError}</div>}
              
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowUpgradeModal(false)} disabled={upgrading}>Batal</button>
                <button type="submit" className="btn btn-primary" disabled={upgrading}>
                  {upgrading ? 'Menyimpan...' : 'Simpan Permanen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

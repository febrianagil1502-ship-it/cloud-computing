/**
 * Memformat angka menjadi format mata uang Rupiah (IDR).
 * @param {number} amount - Jumlah uang
 * @returns {string} - Hasil format Rp. XX.XXX
 */
export const formatRupiah = (amount) => {
  if (amount === undefined || amount === null) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Memformat persentase.
 * @param {number} value - Nilai desimal (contoh: 0.5)
 * @returns {string} - Hasil format (contoh: 50%)
 */
export const formatPercentage = (value) => {
  return `${Math.round(value * 100)}%`
}

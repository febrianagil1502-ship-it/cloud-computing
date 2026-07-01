/**
 * Memformat tanggal UTC/ISO string menjadi format lokal Indonesia.
 * @param {string|Date} dateVal - Nilai tanggal
 * @returns {string} - Tanggal terformat (contoh: 15 Juni 2026)
 */
export const formatDateIndo = (dateVal) => {
  if (!dateVal) return ''
  const date = new Date(dateVal)
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
  }).format(date)
}

/**
 * Mendapatkan representasi YYYY-MM-DD lokal untuk input tipe date HTML.
 * @param {Date} [date] - Objek tanggal
 * @returns {string} - Tanggal terformat YYYY-MM-DD
 */
export const toHtmlDateString = (date = new Date()) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

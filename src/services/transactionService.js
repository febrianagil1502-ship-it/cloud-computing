import { supabase } from '../lib/supabaseClient'

export const transactionService = {
  // Ambil semua transaksi milik tenant saat ini
  getAll: async () => {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        category:categories (
          id,
          name,
          budget_limit
        )
      `)
      .order('transaction_date', { ascending: false })
    if (error) throw error
    return data
  },

  // Buat transaksi baru
  create: async (transactionData) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Pengguna tidak terautentikasi')

    const payload = {
      ...transactionData,
      tenant_id: user.id // Menjamin isolasi data tenant sebelum masuk ke database
    }

    const { data, error } = await supabase
      .from('transactions')
      .insert([payload])
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Perbarui transaksi
  update: async (id, transactionData) => {
    const { data, error } = await supabase
      .from('transactions')
      .update(transactionData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Hapus transaksi
  delete: async (id) => {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  }
}

export default transactionService

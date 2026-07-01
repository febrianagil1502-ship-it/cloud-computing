import { supabase } from '../lib/supabaseClient'

export const categoryService = {
  // Ambil semua kategori untuk tenant saat ini (otomatis difilter oleh RLS)
  getAll: async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true })
    if (error) throw error
    return data
  },

  // Buat kategori baru untuk tenant saat ini
  create: async (categoryData) => {
    // Mendapatkan user saat ini untuk menyisipkan tenant_id
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Pengguna tidak terautentikasi')

    const payload = {
      ...categoryData,
      tenant_id: user.id // Disisipkan secara otomatis demi isolasi tenant
    }

    const { data, error } = await supabase
      .from('categories')
      .insert([payload])
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Perbarui kategori (termasuk limit anggaran)
  update: async (id, categoryData) => {
    const { data, error } = await supabase
      .from('categories')
      .update(categoryData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Hapus kategori
  delete: async (id) => {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  }
}

export default categoryService

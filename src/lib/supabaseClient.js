import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validasi variabel lingkungan untuk memberikan feedback visual daripada crash langsung
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'PERINGATAN: Variabel lingkungan Supabase (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY) belum dikonfigurasi di file .env.local'
  )
}

// Inisialisasi Supabase Client dengan fallback nilai dummy untuk menghindari crash startup
export const supabase = createClient(
  supabaseUrl || 'https://placeholder-project.supabase.co',
  supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRyZXVkdXVramF1c2ppY3F6ZWNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0NDgxMDQsImV4cCI6MjA5NjAyNDEwNH0.oB7Lm4qS0M4sjPOv51HudiM8w_-T9HAWK8t9Wv5tpyk'
)

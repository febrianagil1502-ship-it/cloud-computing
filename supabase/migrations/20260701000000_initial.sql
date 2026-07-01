-- =============================================================================
-- MIGRASI AWAL: Personal Budgeting Multi-Tenant SaaS
-- Dibuat: 2026-07-01
-- Deskripsi: Membuat tabel dasar dengan Row Level Security (RLS)
--            untuk isolasi data antar tenant (user).
-- =============================================================================

-- ============================================================
-- 1. TABEL PROFILES
--    Menyimpan data tambahan pengguna (tenant) setelah registrasi.
--    Setiap baris di-link ke auth.users via id.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Aktifkan RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Kebijakan: Setiap user hanya bisa melihat dan mengedit profil miliknya sendiri
CREATE POLICY "Tenant dapat melihat profil sendiri"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Tenant dapat memperbarui profil sendiri"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- ============================================================
-- 2. TRIGGER: Otomatis buat profile saat user baru registrasi
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 3. TABEL CATEGORIES
--    Kategori anggaran milik setiap tenant.
--    Kolom tenant_id = auth.uid() dari user yang membuat.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.categories (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  color         TEXT DEFAULT '#6366F1',
  icon          TEXT DEFAULT '📁',
  budget_limit  NUMERIC(15, 2) DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(tenant_id, name)
);

-- Aktifkan RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Kebijakan RLS untuk categories
CREATE POLICY "Tenant hanya bisa melihat kategori miliknya"
  ON public.categories FOR SELECT
  USING (auth.uid() = tenant_id);

CREATE POLICY "Tenant hanya bisa membuat kategori miliknya"
  ON public.categories FOR INSERT
  WITH CHECK (auth.uid() = tenant_id);

CREATE POLICY "Tenant hanya bisa mengubah kategori miliknya"
  ON public.categories FOR UPDATE
  USING (auth.uid() = tenant_id);

CREATE POLICY "Tenant hanya bisa menghapus kategori miliknya"
  ON public.categories FOR DELETE
  USING (auth.uid() = tenant_id);

-- ============================================================
-- 4. TABEL TRANSACTIONS
--    Catatan transaksi keuangan milik setiap tenant.
-- ============================================================
CREATE TYPE public.transaction_type AS ENUM ('income', 'expense');

CREATE TABLE IF NOT EXISTS public.transactions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id       UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  type              public.transaction_type NOT NULL,
  amount            NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
  description       TEXT,
  transaction_date  DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Aktifkan RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Kebijakan RLS untuk transactions
CREATE POLICY "Tenant hanya bisa melihat transaksi miliknya"
  ON public.transactions FOR SELECT
  USING (auth.uid() = tenant_id);

CREATE POLICY "Tenant hanya bisa membuat transaksi miliknya"
  ON public.transactions FOR INSERT
  WITH CHECK (auth.uid() = tenant_id);

CREATE POLICY "Tenant hanya bisa mengubah transaksi miliknya"
  ON public.transactions FOR UPDATE
  USING (auth.uid() = tenant_id);

CREATE POLICY "Tenant hanya bisa menghapus transaksi miliknya"
  ON public.transactions FOR DELETE
  USING (auth.uid() = tenant_id);

-- ============================================================
-- 5. FUNGSI PEMBARUAN OTOMATIS updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- 6. INDEKS PERFORMA
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_categories_tenant_id ON public.categories(tenant_id);
CREATE INDEX IF NOT EXISTS idx_transactions_tenant_id ON public.transactions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON public.transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(transaction_date DESC);

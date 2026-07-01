import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

console.log('\x1b[35m%s\x1b[0m', '=== Personal Budgeting SaaS Project Setup ===\n')

// 1. Definisikan folder yang harus dibuat
const directories = [
  'src/assets',
  'src/components/common',
  'src/components/layout',
  'src/components/dashboard',
  'src/contexts',
  'src/hooks',
  'src/lib',
  'src/pages',
  'src/services',
  'src/utils',
]

console.log('Menyiapkan struktur folder...');
directories.forEach((dir) => {
  const fullPath = path.join(__dirname, dir)
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true })
    console.log(`  [Dibuat] ${dir}`)
  } else {
    console.log(`  [Ada] ${dir}`)
  }
})

// 2. Periksa apakah package.json ada
const packageJsonPath = path.join(__dirname, 'package.json')
if (!fs.existsSync(packageJsonPath)) {
  console.error('\x1b[31m%s\x1b[0m', '\nError: package.json tidak ditemukan! Jalankan skrip ini dari direktori root proyek.')
  process.exit(1)
}

// 3. Jalankan npm install
console.log('\nMemasang dependensi proyek (npm install)...')
try {
  execSync('npm install', { stdio: 'inherit' })
  console.log('\x1b[32m%s\x1b[0m', '\n✓ Pemasangan dependensi berhasil!')
} catch (error) {
  console.error('\x1b[31m%s\x1b[0m', '\nGagal menjalankan npm install. Silakan jalankan secara manual.')
}

// 4. Salin .env.example ke .env.local jika belum ada
const envLocalPath = path.join(__dirname, '.env.local')
const envExamplePath = path.join(__dirname, '.env.example')
if (!fs.existsSync(envLocalPath) && fs.existsSync(envExamplePath)) {
  fs.copyFileSync(envExamplePath, envLocalPath)
  console.log('  [Dibuat] .env.local disalin dari .env.example')
}

console.log('\x1b[36m%s\x1b[0m', '\n=== Setup Selesai! ===')
console.log('Untuk memulai server pengembangan lokal, jalankan:')
console.log('\x1b[33m%s\x1b[0m', '  npm run dev')

/* =========================================================
   GADGET GANTENG — SUPABASE INIT (KHUSUS FOTO PRODUK)
   =========================================================
   File ini HANYA dipakai untuk upload/hapus foto produk lewat
   Supabase Storage. Data produk, login admin, dsb TETAP di
   Firebase seperti sebelumnya — tidak ada yang diubah di sana.

   CARA SETUP (sekali saja):
   1. Buat project baru di https://supabase.com (gratis).
   2. Buka Project Settings > API, salin:
        - "Project URL"        -> SUPABASE_URL di bawah
        - "anon public" key    -> SUPABASE_ANON_KEY di bawah
   3. Buka menu Storage di dashboard Supabase, klik "New bucket":
        - Nama bucket : product-images
        - Public bucket : AKTIFKAN (supaya foto bisa tampil ke
          semua pengunjung situs tanpa perlu login)
   4. Buka SQL Editor di Supabase, jalankan isi file
      supabase-storage-policy.sql yang saya sertakan, supaya
      bucket ini boleh diisi/dihapus dari Admin Panel.
   5. Isi SUPABASE_URL & SUPABASE_ANON_KEY di bawah ini, lalu
      upload ulang file ini ke server/hosting kamu.

   CATATAN KEAMANAN:
   "anon key" Supabase memang didesain untuk dipakai di browser
   (bukan rahasia), tapi karena Admin Panel di situs ini login-
   nya lewat Firebase (bukan Supabase), Supabase TIDAK BISA tahu
   siapa yang sedang login di sisi Firebase. Artinya siapa pun
   yang menemukan anon key ini (mudah ditemukan lewat "View
   Source") secara teknis bisa upload file ke bucket ini juga,
   walau mereka tidak bisa mengubah data produk di Firestore.
   Untuk situs skala kecil ini risikonya rendah, tapi kalau suatu
   saat mau ditutup total, solusinya perlu proses login yang sama
   antara Firebase & Supabase (via Edge Function) — tanya saya
   kalau sudah siap ke tahap itu.
========================================================= */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://mgbyvjmypkngzoqymrxs.supabase.co"; // <-- ganti
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1nYnl2am15cGtuZ3pvcXltcnhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwMDY3ODgsImV4cCI6MjA5ODU4Mjc4OH0.RgRf5zSP1jMEW_WzWVm3zQH8GvW5ZeB_5SKSr4SrMO0"; // <-- ganti

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
export const PRODUCT_IMAGE_BUCKET = "product-images";

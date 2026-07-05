-- =========================================================
-- GADGET GANTENG — SUPABASE STORAGE POLICY (product-images)
-- =========================================================
-- Jalankan di Supabase Dashboard > SQL Editor, sekali saja,
-- SETELAH bucket "product-images" dibuat (public bucket).
--
-- Efeknya:
-- - Siapa saja boleh BACA (lihat) foto -> supaya foto tampil
--   di katalog untuk semua pengunjung.
-- - Siapa saja boleh UPLOAD/GANTI/HAPUS foto di bucket ini
--   lewat anon key (lihat catatan keamanan di supabase-init.js).
--   Ini cukup untuk kebutuhan Admin Panel saat ini karena
--   tombol upload cuma muncul buat admin yang sudah login di
--   sisi Firebase.
-- =========================================================

create policy "Public read product images"
on storage.objects for select
using ( bucket_id = 'product-images' );

create policy "Anyone can upload product images"
on storage.objects for insert
with check ( bucket_id = 'product-images' );

create policy "Anyone can update product images"
on storage.objects for update
using ( bucket_id = 'product-images' );

create policy "Anyone can delete product images"
on storage.objects for delete
using ( bucket_id = 'product-images' );

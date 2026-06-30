/* =========================================================
   GADGET GANTENG — DATA PRODUK DEFAULT (CADANGAN)
   =========================================================
   PENTING: sejak situs disambungkan ke Firebase, data produk
   yang TAMPIL DI KATALOG sekarang datang dari Firestore
   (dikelola lewat Admin Panel), bukan dari file ini lagi.

   File ini sekarang cuma dipakai sebagai:
   1. Tampilan sementara saat Firestore masih loading / offline
   2. Sumber "Import Data Awal" sekali klik di Admin Panel,
      supaya kamu tidak perlu input ulang 34 produk dari nol

   Edit array ini TIDAK akan mengubah katalog yang sudah live
   di Firestore. Untuk ubah harga/stok produk yang sudah ada,
   gunakan Admin Panel (klik footer 5x).

   Struktur setiap produk:
   {
     id       : nomor unik
     name     : nama produk
     status   : "New" atau "Second"
     storage  : "64GB" | "128GB" | "256GB" | "512GB" | "1TB"
     jenis    : "Inter" | "Bea Cukai" | "iBox"
     price    : harga dalam Rupiah (angka, tanpa titik)
   }
========================================================= */

const DEFAULT_PRODUCTS = [
  { id: 1,  name: "iPhone X",            status: "Second", storage: "64GB",  jenis: "Inter",     price: 1799000 },
  { id: 2,  name: "iPhone XR",           status: "Second", storage: "128GB", jenis: "Inter",     price: 2199000 },
  { id: 3,  name: "iPhone XS",           status: "Second", storage: "64GB",  jenis: "Inter",     price: 2099000 },
  { id: 4,  name: "iPhone XS Max",       status: "Second", storage: "256GB", jenis: "Inter",     price: 2799000 },

  { id: 5,  name: "iPhone 11",           status: "Second", storage: "128GB", jenis: "Inter",     price: 3299000 },
  { id: 6,  name: "iPhone 11 Pro",       status: "Second", storage: "256GB", jenis: "Inter",     price: 3999000 },
  { id: 7,  name: "iPhone 11 Pro Max",   status: "Second", storage: "256GB", jenis: "Bea Cukai", price: 4599000 },

  { id: 8,  name: "iPhone 12",           status: "Second", storage: "128GB", jenis: "Inter",     price: 4299000 },
  { id: 9,  name: "iPhone 12 Mini",      status: "Second", storage: "128GB", jenis: "Inter",     price: 3899000 },
  { id: 10, name: "iPhone 12 Pro",       status: "Second", storage: "256GB", jenis: "Bea Cukai", price: 5299000 },
  { id: 11, name: "iPhone 12 Pro Max",   status: "Second", storage: "256GB", jenis: "iBox",      price: 5999000 },

  { id: 12, name: "iPhone 13",           status: "Second", storage: "128GB", jenis: "Inter",     price: 5499000 },
  { id: 13, name: "iPhone 13 Mini",      status: "Second", storage: "128GB", jenis: "Inter",     price: 4999000 },
  { id: 14, name: "iPhone 13 Pro",       status: "Second", storage: "256GB", jenis: "Bea Cukai", price: 7299000 },
  { id: 15, name: "iPhone 13 Pro Max",   status: "Second", storage: "256GB", jenis: "iBox",      price: 9499000 },

  { id: 16, name: "iPhone 14",           status: "Second", storage: "128GB", jenis: "Inter",     price: 7499000 },
  { id: 17, name: "iPhone 14 Plus",      status: "Second", storage: "256GB", jenis: "Bea Cukai", price: 8799000 },
  { id: 18, name: "iPhone 14 Pro",       status: "Second", storage: "256GB", jenis: "iBox",      price: 10999000 },
  { id: 19, name: "iPhone 14 Pro Max",   status: "New",    storage: "256GB", jenis: "iBox",      price: 14499000 },

  { id: 20, name: "iPhone 15",           status: "New",    storage: "128GB", jenis: "Inter",     price: 9999000 },
  { id: 21, name: "iPhone 15 Plus",      status: "New",    storage: "256GB", jenis: "Bea Cukai", price: 11999000 },
  { id: 22, name: "iPhone 15 Pro",       status: "New",    storage: "256GB", jenis: "iBox",      price: 16499000 },
  { id: 23, name: "iPhone 15 Pro Max",   status: "New",    storage: "512GB", jenis: "iBox",      price: 19999000 },

  { id: 24, name: "iPhone 16",           status: "New",    storage: "128GB", jenis: "Inter",     price: 12999000 },
  { id: 25, name: "iPhone 16 Plus",      status: "New",    storage: "256GB", jenis: "Bea Cukai", price: 14999000 },
  { id: 26, name: "iPhone 16 Pro",       status: "New",    storage: "256GB", jenis: "iBox",      price: 18999000 },
  { id: 27, name: "iPhone 16 Pro Max",   status: "New",    storage: "512GB", jenis: "iBox",      price: 22999000 },
  { id: 28, name: "iPhone 16 Pro Max",   status: "New",    storage: "1TB",   jenis: "iBox",      price: 26999000 },

  { id: 29, name: "iPhone 17",           status: "New",    storage: "128GB", jenis: "Inter",     price: 15999000 },
  { id: 30, name: "iPhone 17",           status: "New",    storage: "256GB", jenis: "Bea Cukai", price: 17499000 },
  { id: 31, name: "iPhone Air",          status: "New",    storage: "256GB", jenis: "iBox",      price: 19499000 },
  { id: 32, name: "iPhone 17 Pro",       status: "New",    storage: "256GB", jenis: "iBox",      price: 21999000 },
  { id: 33, name: "iPhone 17 Pro Max",   status: "New",    storage: "512GB", jenis: "iBox",      price: 26999000 },
  { id: 34, name: "iPhone 17 Pro Max",   status: "New",    storage: "1TB",   jenis: "iBox",      price: 29999000 },
];

// Dipakai sebagai fallback awal (script.js) & sumber import (admin.js)
window.DEFAULT_PRODUCTS = DEFAULT_PRODUCTS;

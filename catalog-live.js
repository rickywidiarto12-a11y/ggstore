/* =========================================================
   GADGET GANTENG — KATALOG LIVE (FIRESTORE)
   =========================================================
   Jalan untuk SEMUA pengunjung (bukan cuma admin). Dengarkan
   koleksi "products" di Firestore secara real-time lalu kirim
   ke script.js lewat window.GG_setProducts(). Satu dokumen
   Firestore = satu card produk; pilihan jenis/storage di
   dalam card ditangani oleh script.js (buildCard).

   Kalau Firestore gagal/lambat, katalog tetap tampil pakai
   data cadangan dari products.js (sudah dirender duluan oleh
   script.js saat halaman load).
========================================================= */
import { db } from "./firebase-init.js";
import {
  collection,
  onSnapshot,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

try {
  const q = query(collection(db, "products"), orderBy("name"));
  onSnapshot(
    q,
    (snapshot) => {
      const list = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
      // Kalau Firestore kosong (belum pernah diisi/diimport), biarkan
      // katalog tetap pakai data cadangan products.js, jangan dikosongkan.
      if (list.length > 0 && typeof window.GG_setProducts === "function") {
        window.GG_setProducts(list);
      } else if (list.length === 0) {
        console.warn("[GG] Koleksi 'products' di Firestore masih kosong. Katalog memakai data cadangan products.js. Buka Admin Panel > Import Data Awal untuk mengisi Firestore.");
      }
    },
    (err) => {
      console.error("[GG] Gagal memuat katalog dari Firestore, memakai data cadangan:", err);
    }
  );
} catch (err) {
  console.error("[GG] Firestore tidak tersedia, memakai data cadangan:", err);
}

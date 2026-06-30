/* =========================================================
   GADGET GANTENG — KATALOG LIVE (FIRESTORE)
   =========================================================
   Jalan untuk SEMUA pengunjung (bukan cuma admin). Dengarkan
   koleksi "products" di Firestore secara real-time, ratakan
   struktur varian jadi daftar kartu, lalu kirim ke script.js
   lewat window.GG_setProducts(). Kalau Firestore gagal/lambat,
   katalog tetap tampil pakai data cadangan dari products.js
   (sudah dirender duluan oleh script.js).
========================================================= */
import { db } from "./firebase-init.js";
import {
  collection,
  onSnapshot,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

function flattenProduct(docSnap) {
  const p = docSnap.data();
  const baseName = p.name + (p.color ? " " + p.color : "");
  return (p.variants || []).map((v, i) => ({
    id: docSnap.id + "-" + i,
    name: baseName,
    status: v.status,
    storage: v.storage,
    jenis: v.jenis,
    price: v.price
  }));
}

try {
  const q = query(collection(db, "products"), orderBy("name"));
  onSnapshot(
    q,
    (snapshot) => {
      const flat = [];
      snapshot.forEach((docSnap) => {
        flat.push(...flattenProduct(docSnap));
      });
      // Kalau Firestore kosong (belum pernah diisi/diimport), biarkan
      // katalog tetap pakai data cadangan products.js, jangan dikosongkan.
      if (flat.length > 0 && typeof window.GG_setProducts === "function") {
        window.GG_setProducts(flat);
      } else if (flat.length === 0) {
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

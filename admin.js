/* =========================================================
   GADGET GANTENG — ADMIN PANEL (FIREBASE)
   =========================================================
   Trigger: klik teks copyright di footer 5x, atau buka URL
   dengan akhiran #admin.

   Login pakai SATU kotak password (UX sama seperti sebelumnya),
   tapi di belakang layar diverifikasi lewat Firebase Authentication
   (Email/Password) memakai akun tetap ADMIN_EMAIL di bawah ini.
   Ini supaya Firestore Security Rules bisa membatasi siapa yang
   boleh menulis data — password polos di JS bisa dibaca siapa saja
   lewat "View Source", jadi tidak aman dipakai sendirian.

   WAJIB: buat 1 user di Firebase Console > Authentication > Users
   dengan email persis ADMIN_EMAIL di bawah, dan password sesuai
   keinginanmu. Password itulah yang diketik di kotak login situs.
========================================================= */
import { db, auth } from "./firebase-init.js";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  setDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import { supabase, PRODUCT_IMAGE_BUCKET } from "./supabase-init.js";

const ADMIN_EMAIL = "admin@gadgetganteng.id"; // <-- harus sama persis dengan user di Firebase Auth

const JENIS_LABEL = {
  Inter: "Limited Provider",
  "Bea Cukai": "Resmi Terdaftar",
  iBox: "iBox"
};

let products = [];        // cache lokal dari Firestore (real-time)
let editingProductId = null;
let unsubscribeProducts = null;

document.addEventListener("DOMContentLoaded", init);

function init() {
  // ===== DOM =====
  const loginOverlay = document.getElementById("adminLoginOverlay");
  const panelOverlay = document.getElementById("adminPanel");
  const formOverlay = document.getElementById("adminFormOverlay");
  const loginBtn = document.getElementById("adminLoginBtn");
  const loginCancel = document.getElementById("adminLoginCancel");
  const logoutBtn = document.getElementById("adminLogoutBtn");
  const passInput = document.getElementById("adminPasswordInput");
  const loginError = document.getElementById("adminLoginError");
  const togglePass = document.getElementById("adminTogglePass");
  const addProductBtn = document.getElementById("adminAddProductBtn");
  const importBtn = document.getElementById("adminImportBtn");
  const formClose = document.getElementById("adminFormClose");
  const formCancel = document.getElementById("adminFormCancel");
  const formSave = document.getElementById("adminFormSave");
  const addVariantBtn = document.getElementById("addVariantBtn");
  const productList = document.getElementById("adminProductList");
  const toast = document.getElementById("adminToast");
  const loginSpinner = document.getElementById("adminLoginSpinner");
  const imageInput = document.getElementById("fImageInput");
  const imagePreviewImg = document.getElementById("adminImagePreviewImg");
  const imagePreviewEmpty = document.getElementById("adminImagePreviewEmpty");
  const imageRemoveBtn = document.getElementById("adminImageRemoveBtn");
  const imageStatus = document.getElementById("adminImageStatus");

  // Foto yang sedang aktif di form (URL final di Supabase Storage).
  // null = tidak ada foto. Diisi lewat uploadProductImage() atau saat
  // membuka form edit produk yang sudah punya imageUrl.
  let currentImageUrl = null;

  // ===== HELPERS =====
  function fmtPrice(n) {
    return "Rp " + Number(n || 0).toLocaleString("id-ID");
  }
  function slugify(name) {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
  function showToast(msg, type = "success") {
    toast.textContent = msg;
    toast.className = "admin-toast show " + type;
    clearTimeout(toast._t);
    toast._t = setTimeout(() => (toast.className = "admin-toast"), 3000);
  }

  // ===== FOTO PRODUK (Supabase Storage) =====
  function setImagePreview(url) {
    currentImageUrl = url || null;
    if (currentImageUrl) {
      imagePreviewImg.src = currentImageUrl;
      imagePreviewImg.style.display = "block";
      imagePreviewEmpty.style.display = "none";
      imageRemoveBtn.style.display = "inline-flex";
    } else {
      imagePreviewImg.src = "";
      imagePreviewImg.style.display = "none";
      imagePreviewEmpty.style.display = "block";
      imageRemoveBtn.style.display = "none";
    }
  }

  async function uploadProductImage(file) {
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    imageStatus.textContent = "Mengunggah foto...";
    imageInput.disabled = true;
    try {
      const { error: uploadError } = await supabase.storage
        .from(PRODUCT_IMAGE_BUCKET)
        .upload(path, file, { cacheControl: "3600", upsert: false });
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from(PRODUCT_IMAGE_BUCKET).getPublicUrl(path);
      setImagePreview(data.publicUrl);
      imageStatus.textContent = "✅ Foto berhasil diunggah";
      setTimeout(() => (imageStatus.textContent = ""), 2500);
    } catch (err) {
      console.error(err);
      imageStatus.textContent = "";
      showToast("⚠️ Gagal unggah foto: " + err.message, "error");
    } finally {
      imageInput.disabled = false;
      imageInput.value = "";
    }
  }

  // ===== PANELS =====
  function openLoginPanel() {
    passInput.value = "";
    loginError.textContent = "";
    loginOverlay.classList.add("show");
    document.body.style.overflow = "hidden";
    setTimeout(() => passInput.focus(), 400);
  }
  function closeLoginPanel() {
    loginOverlay.classList.remove("show");
    document.body.style.overflow = "";
  }

  function openAdminPanel() {
    panelOverlay.classList.add("show");
    document.body.style.overflow = "hidden";
    renderProductList();
    renderStats();
  }
  function closeAdminPanel() {
    panelOverlay.classList.remove("show");
    document.body.style.overflow = "";
  }

  function openForm(productId = null) {
    editingProductId = productId;
    document.getElementById("adminFormTitle").textContent = productId
      ? "Edit Produk"
      : "Tambah Produk Baru";
    document.getElementById("variantsList").innerHTML = "";

    if (productId) {
      const p = products.find((x) => x.id === productId);
      if (p) {
        document.getElementById("fName").value = p.name;
        document.getElementById("fColor").value = p.color || "";
        document.getElementById("fNote").value = p.note || "";
        setImagePreview(p.imageUrl || null);
        (p.variants || []).forEach((v) =>
          addVariantRow(v.status, v.jenis, v.storage, v.price)
        );
      }
    } else {
      document.getElementById("fName").value = "";
      document.getElementById("fColor").value = "";
      document.getElementById("fNote").value = "";
      setImagePreview(null);
      addVariantRow("New", "Inter", "128GB", "");
    }
    formOverlay.classList.add("show");
  }
  function closeForm() {
    formOverlay.classList.remove("show");
    editingProductId = null;
    setImagePreview(null);
  }

  function addVariantRow(status = "New", jenis = "Inter", storage = "128GB", price = "") {
    const row = document.createElement("div");
    row.className = "admin-variant-row";
    const storages = ["64GB", "128GB", "256GB", "512GB", "1TB"];
    row.innerHTML = `
      <select class="v-status">
        <option value="New" ${status === "New" ? "selected" : ""}>New</option>
        <option value="Second" ${status === "Second" ? "selected" : ""}>Second</option>
      </select>
      <select class="v-jenis">
        <option value="Inter" ${jenis === "Inter" ? "selected" : ""}>Limited Provider</option>
        <option value="Bea Cukai" ${jenis === "Bea Cukai" ? "selected" : ""}>Resmi Terdaftar</option>
        <option value="iBox" ${jenis === "iBox" ? "selected" : ""}>iBox</option>
      </select>
      <select class="v-storage">
        ${storages.map((s) => `<option value="${s}" ${s === storage ? "selected" : ""}>${s}</option>`).join("")}
      </select>
      <input type="number" class="v-price" placeholder="Harga, contoh: 7000000" value="${price}" min="0">
      <button type="button" class="admin-variant-remove" title="Hapus">&times;</button>
    `;
    row.querySelector(".admin-variant-remove").addEventListener("click", () => row.remove());
    document.getElementById("variantsList").appendChild(row);
  }

  // ===== RENDER =====
  function renderProductList() {
    productList.innerHTML = "";
    if (!products.length) {
      productList.innerHTML =
        '<p style="color:#555;text-align:center;padding:30px;">Belum ada produk. Klik "Tambah Produk" atau "Import Data Awal".</p>';
      return;
    }
    products.forEach((p) => {
      const el = document.createElement("div");
      el.className = "admin-product-item";
      const variantRows = (p.variants || [])
        .map(
          (v) => `
        <tr>
          <td><span class="${v.status === "New" ? "vt-status-new" : "vt-status-second"}">${v.status}</span></td>
          <td><span class="vt-jenis">${JENIS_LABEL[v.jenis] || v.jenis}</span></td>
          <td><span class="vt-storage">${v.storage}</span></td>
          <td><span class="vt-price">${fmtPrice(v.price)}</span></td>
        </tr>`
        )
        .join("");

      el.innerHTML = `
        <div class="admin-product-item__info">
          <div class="admin-product-item__name">
            ${p.imageUrl ? `<img src="${p.imageUrl}" alt="" class="admin-product-item__thumb">` : ""}
            ${p.name}${p.color ? ' <span style="color:#555;font-size:0.8rem;font-weight:500;text-transform:none;">· ' + p.color + "</span>" : ""}
          </div>
          ${p.note ? `<div class="admin-product-item__meta"><span class="admin-meta-pill admin-meta-pill--note">${p.note}</span></div>` : ""}
          <table class="admin-variant-table">
            <thead><tr><th>Status</th><th>Jenis</th><th>Storage</th><th>Harga</th></tr></thead>
            <tbody>${variantRows}</tbody>
          </table>
        </div>
        <div class="admin-product-item__actions">
          <button class="admin-btn admin-btn--edit btn-edit" data-id="${p.id}">Edit</button>
          <button class="admin-btn admin-btn--danger btn-delete" data-id="${p.id}">Hapus</button>
        </div>
      `;
      productList.appendChild(el);
    });

    productList.querySelectorAll(".btn-edit").forEach((btn) =>
      btn.addEventListener("click", () => openForm(btn.dataset.id))
    );
    productList.querySelectorAll(".btn-delete").forEach((btn) =>
      btn.addEventListener("click", async () => {
        const p = products.find((x) => x.id === btn.dataset.id);
        if (p && confirm(`Hapus "${p.name}"? Tindakan ini langsung tersimpan.`)) {
          try {
            await deleteDoc(doc(db, "products", p.id));
            showToast("🗑️ Produk dihapus");
          } catch (err) {
            console.error(err);
            showToast("⚠️ Gagal hapus: " + err.message, "error");
          }
        }
      })
    );
  }

  function renderStats() {
    const statsEl = document.getElementById("adminStats");
    const allVariants = products.flatMap((p) => p.variants || []);
    const newCount = allVariants.filter((v) => v.status === "New").length;
    const secondCount = allVariants.filter((v) => v.status === "Second").length;
    statsEl.innerHTML = `
      <div class="admin-stat"><span class="admin-stat-num">${products.length}</span><span class="admin-stat-lbl">Seri</span></div>
      <div class="admin-stat"><span class="admin-stat-num">${allVariants.length}</span><span class="admin-stat-lbl">Total Varian</span></div>
      <div class="admin-stat"><span class="admin-stat-num">${newCount}</span><span class="admin-stat-lbl">Varian New</span></div>
      <div class="admin-stat"><span class="admin-stat-num">${secondCount}</span><span class="admin-stat-lbl">Varian Second</span></div>
    `;
  }

  // ===== SAVE FORM (Firestore) =====
  async function saveForm() {
    const name = document.getElementById("fName").value.trim();
    if (!name) {
      showToast("⚠️ Nama produk wajib diisi!", "error");
      return;
    }
    const color = document.getElementById("fColor").value.trim();
    const note = document.getElementById("fNote").value.trim();

    const rows = document.querySelectorAll("#variantsList .admin-variant-row");
    const variants = [];
    let ok = true;
    rows.forEach((row) => {
      const status = row.querySelector(".v-status").value;
      const jenis = row.querySelector(".v-jenis").value;
      const storage = row.querySelector(".v-storage").value;
      const price = parseInt(row.querySelector(".v-price").value, 10);
      if (!price || price <= 0) {
        ok = false;
        return;
      }
      variants.push({ status, jenis, storage, price });
    });

    if (!variants.length) {
      showToast("⚠️ Tambahkan minimal 1 varian!", "error");
      return;
    }
    if (!ok) {
      showToast("⚠️ Isi harga untuk semua varian!", "error");
      return;
    }

    const imageUrl = currentImageUrl || null;

    formSave.disabled = true;
    try {
      if (editingProductId) {
        await updateDoc(doc(db, "products", editingProductId), {
          name, color, note, variants, imageUrl, updatedAt: serverTimestamp()
        });
        showToast("✅ Produk berhasil diupdate!");
      } else {
        await addDoc(collection(db, "products"), {
          name, color, note, variants, imageUrl, createdAt: serverTimestamp(), updatedAt: serverTimestamp()
        });
        showToast("✅ Produk berhasil ditambah!");
      }
      closeForm();
    } catch (err) {
      console.error(err);
      showToast("⚠️ Gagal simpan: " + err.message, "error");
    } finally {
      formSave.disabled = false;
    }
  }

  // ===== IMPORT DATA AWAL (dari products.js, sekali jalan) =====
  async function importDefaults() {
    const flat = window.DEFAULT_PRODUCTS || [];
    if (!flat.length) {
      showToast("⚠️ Tidak ada data cadangan untuk diimport.", "error");
      return;
    }
    if (!confirm(`Import ${flat.length} entri produk default ke Firestore? Produk dengan nama yang sama akan ditimpa varian-nya.`)) return;

    const grouped = new Map();
    flat.forEach((p) => {
      const key = p.name;
      if (!grouped.has(key)) grouped.set(key, { name: p.name, color: "", note: "", variants: [] });
      grouped.get(key).variants.push({ status: p.status, jenis: p.jenis, storage: p.storage, price: p.price });
    });

    importBtn.disabled = true;
    try {
      let count = 0;
      for (const product of grouped.values()) {
        const id = slugify(product.name);
        await setDoc(doc(db, "products", id), {
          ...product,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        count++;
      }
      showToast(`✅ ${count} produk berhasil diimport!`);
    } catch (err) {
      console.error(err);
      showToast("⚠️ Gagal import: " + err.message, "error");
    } finally {
      importBtn.disabled = false;
    }
  }

  // ===== FIRESTORE: dengarkan perubahan produk real-time (untuk admin panel) =====
  function startListening() {
    if (unsubscribeProducts) return;
    const q = query(collection(db, "products"), orderBy("name"));
    unsubscribeProducts = onSnapshot(
      q,
      (snapshot) => {
        products = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        if (panelOverlay.classList.contains("show")) {
          renderProductList();
          renderStats();
        }
      },
      (err) => {
        console.error(err);
        showToast("⚠️ Gagal sinkron Firestore: " + err.message, "error");
      }
    );
  }

  // ===== LOGIN (Firebase Auth) =====
  async function tryLogin() {
    const pass = passInput.value;
    if (!pass) {
      loginError.textContent = "Password wajib diisi.";
      return;
    }
    loginError.textContent = "";
    loginSpinner.style.display = "inline-block";
    loginBtn.disabled = true;
    try {
      await signInWithEmailAndPassword(auth, ADMIN_EMAIL, pass);
      closeLoginPanel();
      setTimeout(openAdminPanel, 250);
    } catch (err) {
      console.error(err);
      loginError.textContent = "Password salah atau akun admin belum dibuat di Firebase.";
      passInput.value = "";
      passInput.focus();
    } finally {
      loginSpinner.style.display = "none";
      loginBtn.disabled = false;
    }
  }

  // ===== TRIGGER BUTTON =====
  const triggerBtn = document.createElement("button");
  triggerBtn.className = "admin-trigger-btn";
  triggerBtn.title = "Admin Panel";
  triggerBtn.setAttribute("aria-label", "Admin Panel");
  triggerBtn.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`;
  triggerBtn.style.display = "none";
  document.body.appendChild(triggerBtn);
  triggerBtn.addEventListener("click", () => {
    auth.currentUser ? openAdminPanel() : openLoginPanel();
  });

  // Footer 5x click
  const footerBottom = document.querySelector(".footer__bottom");
  if (footerBottom) {
    let cc = 0, ct;
    footerBottom.addEventListener("click", () => {
      cc++;
      clearTimeout(ct);
      ct = setTimeout(() => (cc = 0), 700);
      if (cc >= 5) {
        cc = 0;
        auth.currentUser ? openAdminPanel() : openLoginPanel();
      }
    });
  }

  // Hash trigger (#admin)
  function checkHash() {
    if (window.location.hash === "#admin") {
      window.history.replaceState(null, "", window.location.pathname);
      auth.currentUser ? openAdminPanel() : openLoginPanel();
    }
  }
  window.addEventListener("hashchange", checkHash);
  checkHash();

  // ===== AUTH STATE =====
  onAuthStateChanged(auth, (user) => {
    if (user && user.email === ADMIN_EMAIL) {
      triggerBtn.style.display = "flex";
      startListening();
    } else {
      triggerBtn.style.display = "none";
      if (unsubscribeProducts) {
        unsubscribeProducts();
        unsubscribeProducts = null;
      }
    }
  });

  // ===== EVENTS =====
  loginBtn.addEventListener("click", tryLogin);
  loginCancel.addEventListener("click", closeLoginPanel);
  passInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") tryLogin();
  });
  togglePass.addEventListener("click", function () {
    const isText = passInput.type === "text";
    passInput.type = isText ? "password" : "text";
  });
  loginOverlay.addEventListener("click", (e) => {
    if (e.target === loginOverlay) closeLoginPanel();
  });
  logoutBtn.addEventListener("click", async () => {
    if (confirm("Yakin mau keluar?")) {
      await signOut(auth);
      closeAdminPanel();
      showToast("👋 Berhasil keluar");
    }
  });
  imageInput.addEventListener("change", (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) uploadProductImage(file);
  });
  imageRemoveBtn.addEventListener("click", () => setImagePreview(null));
  addProductBtn.addEventListener("click", () => openForm(null));
  importBtn.addEventListener("click", importDefaults);
  formClose.addEventListener("click", closeForm);
  formCancel.addEventListener("click", closeForm);
  formSave.addEventListener("click", saveForm);
  addVariantBtn.addEventListener("click", () => addVariantRow());
  formOverlay.addEventListener("click", (e) => {
    if (e.target === formOverlay) closeForm();
  });

  console.log("%c🛡️ Gadget Ganteng Admin v3 (Firebase)", "color:#FFD400;font-size:14px;font-weight:bold;");
  console.log("%cBuka: #admin | Footer: klik 5x", "color:#888;font-size:11px;");
}

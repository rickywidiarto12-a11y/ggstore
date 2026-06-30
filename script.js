/* =========================================================
   GADGET GANTENG — SCRIPT
   Tidak ada dependency luar, vanilla JS murni.
========================================================= */
(function () {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const WA_NUMBER = "6285800302777";

  function waLink(message) {
    return "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(message);
  }

  function formatRupiah(value) {
    return "Rp " + Number(value).toLocaleString("id-ID");
  }

  /* ---------------- LOADING SCREEN ---------------- */
  const loadingScreen = document.getElementById("loading-screen");
  document.body.classList.add("is-locked");

  function hideLoadingScreen() {
    if (!loadingScreen) return;
    loadingScreen.classList.add("is-hidden");
    document.body.classList.remove("is-locked");
    setTimeout(() => loadingScreen.remove(), 700);
  }

  const minLoadTime = new Promise((resolve) => setTimeout(resolve, 1200));
  const windowLoaded = new Promise((resolve) => {
    if (document.readyState === "complete") resolve();
    else window.addEventListener("load", resolve, { once: true });
  });
  Promise.all([minLoadTime, windowLoaded]).then(hideLoadingScreen);
  // Safety net in case something blocks load
  setTimeout(hideLoadingScreen, 4000);

  /* ---------------- NAVBAR ---------------- */
  const navbar = document.getElementById("navbar");
  const navMenu = document.getElementById("navMenu");
  const burgerBtn = document.getElementById("burgerBtn");

  function onScrollNavbar() {
    if (window.scrollY > 24) navbar.classList.add("is-scrolled");
    else navbar.classList.remove("is-scrolled");
  }
  document.addEventListener("scroll", onScrollNavbar, { passive: true });
  onScrollNavbar();

  burgerBtn.addEventListener("click", () => {
    const isOpen = navMenu.classList.toggle("is-open");
    burgerBtn.classList.toggle("is-open", isOpen);
    burgerBtn.setAttribute("aria-expanded", String(isOpen));
  });

  navMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navMenu.classList.remove("is-open");
      burgerBtn.classList.remove("is-open");
      burgerBtn.setAttribute("aria-expanded", "false");
    });
  });

  /* ---------------- SCROLL REVEAL ---------------- */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !prefersReducedMotion) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => revealObserver.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------------- COUNTER ANIMATION ---------------- */
  const counters = document.querySelectorAll(".counter");
  function animateCounter(el) {
    const target = parseFloat(el.dataset.target);
    const decimals = parseInt(el.dataset.decimal || "0", 10);
    const suffix = el.dataset.suffix || "";
    const duration = 1600;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = target * eased;
      el.textContent = value.toFixed(decimals) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = target.toFixed(decimals) + suffix;
    }
    if (prefersReducedMotion) el.textContent = target.toFixed(decimals) + suffix;
    else requestAnimationFrame(tick);
  }

  if ("IntersectionObserver" in window) {
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach((el) => counterObserver.observe(el));
  } else {
    counters.forEach(animateCounter);
  }

  /* ---------------- LIGHT PARALLAX (HERO) ---------------- */
  const parallaxRings = document.getElementById("parallaxRings");
  const parallaxLines = document.getElementById("parallaxLines");
  const heroSection = document.querySelector(".hero");

  if (!prefersReducedMotion && heroSection) {
    let ticking = false;
    function onScrollParallax() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const rect = heroSection.getBoundingClientRect();
        if (rect.bottom > 0) {
          const offset = Math.max(0, -rect.top);
          parallaxRings.style.transform = `translateY(${offset * 0.18}px)`;
          parallaxLines.style.transform = `translateY(${offset * 0.08}px)`;
        }
        ticking = false;
      });
    }
    document.addEventListener("scroll", onScrollParallax, { passive: true });
  }

  /* ---------------- FAQ ACCORDION ---------------- */
  const faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach((item) => {
    const question = item.querySelector(".faq-item__q");
    const answer = item.querySelector(".faq-item__a");
    question.addEventListener("click", () => {
      const isOpen = item.classList.contains("is-open");

      faqItems.forEach((other) => {
        other.classList.remove("is-open");
        other.querySelector(".faq-item__q").setAttribute("aria-expanded", "false");
        other.querySelector(".faq-item__a").style.maxHeight = null;
      });

      if (!isOpen) {
        item.classList.add("is-open");
        question.setAttribute("aria-expanded", "true");
        answer.style.maxHeight = answer.scrollHeight + "px";
      }
    });
  });

  /* ---------------- BACK TO TOP ---------------- */
  const backToTop = document.getElementById("backToTop");
  document.addEventListener(
    "scroll",
    () => {
      backToTop.classList.toggle("is-visible", window.scrollY > 500);
    },
    { passive: true }
  );
  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
  });

  /* ---------------- FOOTER YEAR ---------------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------- CATALOG: RENDER, FILTER, SEARCH ---------------- */
  const catalogGrid = document.getElementById("catalogGrid");
  const catalogCount = document.getElementById("catalogCount");
  const catalogEmpty = document.getElementById("catalogEmpty");
  const searchInput = document.getElementById("searchInput");
  const filterGroups = document.querySelectorAll(".filter-pills");

  // PRODUCTS dimulai dari data cadangan (products.js) supaya katalog tidak
  // kosong saat Firestore masih loading. Begitu data live dari Firestore
  // datang, catalog-live.js akan memanggil window.GG_setProducts(list)
  // untuk menimpa data ini lalu render ulang.
  let PRODUCTS = (window.DEFAULT_PRODUCTS || []).slice();

  const activeFilters = { status: "all", storage: "all", jenis: "all", search: "" };

  function jenisBadgeClass(jenis) {
    if (jenis === "Inter") return "badge--jenis-inter";
    if (jenis === "Bea Cukai") return "badge--jenis-beacukai";
    return "badge--jenis-ibox";
  }

  function jenisLabel(jenis) {
    if (jenis === "Inter") return "Limited Provider";
    if (jenis === "Bea Cukai") return "Resmi Terdaftar";
    return jenis;
  }

  function statusBadgeClass(status) {
    return status === "New" ? "badge--status-new" : "badge--status-second";
  }

  function buildCard(product) {
    const message =
      "Halo Gadget Ganteng, saya tertarik dengan " +
      product.name +
      " " +
      product.storage +
      " (" +
      product.status +
      ", " +
      jenisLabel(product.jenis) +
      ") seharga " +
      formatRupiah(product.price) +
      ". Apakah masih tersedia?";

    const card = document.createElement("article");
    card.className = "product-card reveal is-visible";
    card.innerHTML = `
      <div class="product-card__badges">
        <span class="badge ${statusBadgeClass(product.status)}">${product.status}</span>
        <span class="badge ${jenisBadgeClass(product.jenis)}">${jenisLabel(product.jenis)}</span>
      </div>
      <h3 class="product-card__name">${product.name}</h3>
      <div class="product-card__specs">
        <span class="spec">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="7" y="2" width="10" height="20" rx="2"/><line x1="11" y1="18" x2="13" y2="18"/></svg>
          ${product.storage}
        </span>
      </div>
      <div class="product-card__price">${formatRupiah(product.price)}</div>
      <a class="btn btn--primary btn--block" href="${waLink(message)}" target="_blank" rel="noopener">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-.9-.4-1.9-1-2.7-1.9-.7-.7-1.2-1.5-1.5-2.1-.1-.2 0-.4.1-.5.2-.2.4-.5.6-.7.2-.2.2-.4.1-.6-.1-.2-.6-1.5-.8-2-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.3.3-1 1-.9 2.4.1 1.4 1 2.8 1.1 3 .1.2 1.6 2.6 4 3.6 2.3 1 2.3.7 2.7.6.4 0 1.3-.5 1.5-1 .2-.5.2-.9.1-1-.1-.1-.2-.2-.4-.2zM12 2C6.5 2 2 6.5 2 12c0 1.9.5 3.7 1.5 5.2L2 22l4.9-1.5C8.4 21.5 10.1 22 12 22c5.5 0 10-4.5 10-10S17.5 2 12 2zm0 18.2c-1.7 0-3.3-.5-4.7-1.3l-.3-.2-3.1.9.9-3-.2-.3C3.7 14.8 3.2 13.4 3.2 12c0-4.8 3.9-8.7 8.7-8.7 4.8 0 8.7 3.9 8.7 8.7 0 4.8-3.9 8.7-8.6 8.7z"/></svg>
        Chat WhatsApp
      </a>
    `;
    return card;
  }

  function renderCatalog() {
    const term = activeFilters.search.trim().toLowerCase();

    const filtered = PRODUCTS.filter((product) => {
      const matchStatus = activeFilters.status === "all" || product.status === activeFilters.status;
      const matchStorage = activeFilters.storage === "all" || product.storage === activeFilters.storage;
      const matchJenis = activeFilters.jenis === "all" || product.jenis === activeFilters.jenis;
      const matchSearch = !term || product.name.toLowerCase().includes(term);
      return matchStatus && matchStorage && matchJenis && matchSearch;
    });

    catalogGrid.innerHTML = "";
    filtered.forEach((product) => catalogGrid.appendChild(buildCard(product)));

    catalogCount.textContent = `Menampilkan ${filtered.length} dari ${PRODUCTS.length} produk`;
    catalogEmpty.classList.toggle("hidden", filtered.length !== 0);
    catalogGrid.classList.toggle("hidden", filtered.length === 0);
  }

  filterGroups.forEach((group) => {
    const groupName = group.dataset.group;
    group.querySelectorAll(".filter-pill").forEach((pill) => {
      pill.addEventListener("click", () => {
        group.querySelectorAll(".filter-pill").forEach((p) => p.classList.remove("is-active"));
        pill.classList.add("is-active");
        activeFilters[groupName] = pill.dataset.value;
        renderCatalog();
      });
    });
  });

  let searchTimeout;
  searchInput.addEventListener("input", (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      activeFilters.search = e.target.value;
      renderCatalog();
    }, 150);
  });

  renderCatalog();

  // ===== EXPOSE: jembatan ke catalog-live.js (Firestore) =====
  window.GG_renderCatalog = renderCatalog;
  window.GG_setProducts = function (list) {
    PRODUCTS = Array.isArray(list) ? list : [];
    renderCatalog();
  };
})();

/* =========================================================
   GADGET GANTENG — SCRIPT
   Tidak ada dependency luar, vanilla JS murni.
========================================================= */
(function () {
  "use strict";

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const WA_NUMBER = "6285800302777";

  function waLink(message) {
    return (
      "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(message)
    );
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
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
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
    if (prefersReducedMotion)
      el.textContent = target.toFixed(decimals) + suffix;
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
      { threshold: 0.5 },
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
        other
          .querySelector(".faq-item__q")
          .setAttribute("aria-expanded", "false");
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
    { passive: true },
  );
  backToTop.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  });

  /* ---------------- FOOTER YEAR ---------------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ================================================================
     CATALOG: GROUP BY SERIES — INTERACTIVE STORAGE & JENIS SELECTOR
  ================================================================ */
  const catalogGrid = document.getElementById("catalogGrid");
  const catalogCount = document.getElementById("catalogCount");
  const catalogEmpty = document.getElementById("catalogEmpty");
  const searchInput = document.getElementById("searchInput");
  const filterGroups = document.querySelectorAll(".filter-pills");

  // Label mapping
  function jenisLabel(jenis) {
    if (jenis === "Inter") return "Limited Provider";
    if (jenis === "Bea Cukai") return "Resmi Terdaftar";
    return jenis; // iBox
  }
  function jenisKey(jenis) {
    // normalize for filter matching
    return jenis;
  }

  // Build a key for grouping: same name = same series
  function seriesKey(product) {
    return product.name;
  }

  // Group PRODUCTS by series name
  function groupProducts(list) {
    const map = new Map();
    list.forEach((p) => {
      const key = seriesKey(p);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(p);
    });
    return map;
  }

  /* ---- Build a grouped card for one series ---- */
  function buildGroupCard(seriesName, variants) {
    // Collect unique storages & jenis options available in this series
    const storages = [...new Set(variants.map((v) => v.storage))];
    const jenisOptions = [...new Set(variants.map((v) => v.jenis))];

    // Default selection: first available
    let selectedStorage = storages[0];
    let selectedJenis = jenisOptions[0];

    // Storage order
    const storageOrder = ["64GB", "128GB", "256GB", "512GB", "1TB"];
    storages.sort((a, b) => storageOrder.indexOf(a) - storageOrder.indexOf(b));

    // Jenis order
    const jenisOrder = ["Inter", "Bea Cukai", "iBox"];
    jenisOptions.sort((a, b) => jenisOrder.indexOf(a) - jenisOrder.indexOf(b));

    // Helper: find variant matching current selection, with closest-match fallback
    // Priority: exact match > same jenis (closest storage) > same storage (any jenis) > any variant in series
    function findVariant() {
      // 1) Exact match
      const exact = variants.find(
        (v) => v.storage === selectedStorage && v.jenis === selectedJenis,
      );
      if (exact) return { variant: exact, isExact: true };

      // 2) Same jenis, closest storage
      const sameJenis = variants.filter((v) => v.jenis === selectedJenis);
      if (sameJenis.length) {
        const targetIdx = storageOrder.indexOf(selectedStorage);
        sameJenis.sort(
          (a, b) =>
            Math.abs(storageOrder.indexOf(a.storage) - targetIdx) -
            Math.abs(storageOrder.indexOf(b.storage) - targetIdx),
        );
        return { variant: sameJenis[0], isExact: false };
      }

      // 3) Same storage, any jenis (prefer jenis order)
      const sameStorage = variants.filter((v) => v.storage === selectedStorage);
      if (sameStorage.length) {
        sameStorage.sort(
          (a, b) => jenisOrder.indexOf(a.jenis) - jenisOrder.indexOf(b.jenis),
        );
        return { variant: sameStorage[0], isExact: false };
      }

      // 4) Fallback: any variant in this series
      return variants.length ? { variant: variants[0], isExact: false } : null;
    }

    // Build jenis badge CSS class
    function jenisBadgeClass(jenis) {
      if (jenis === "Inter") return "badge--jenis-inter";
      if (jenis === "Bea Cukai") return "badge--jenis-beacukai";
      return "badge--jenis-ibox";
    }

    // Build status badge class
    function statusBadgeClass(status) {
      return status === "New" ? "badge--status-new" : "badge--status-second";
    }

    // Get statuses available in this series
    const statuses = [...new Set(variants.map((v) => v.status))];
    const hasNew = statuses.includes("New");
    const hasSecond = statuses.includes("Second");

    /* ---- DOM ---- */
    const card = document.createElement("article");
    card.className = "product-card reveal is-visible";

    function render() {
      const result = findVariant();
      const variant = result ? result.variant : null;
      const isExact = result ? result.isExact : false;
      const price = variant ? variant.price : null;
      const status = variant ? variant.status : hasNew ? "New" : "Second";

      // Build WA message
      const message = variant
        ? `Halo Gadget Ganteng, saya tertarik dengan ${seriesName} ${selectedStorage} (${status}, ${jenisLabel(selectedJenis)}) seharga ${formatRupiah(price)}${!isExact ? " (estimasi)" : ""}. Apakah masih tersedia?`
        : `Halo Gadget Ganteng, saya tertarik dengan ${seriesName}. Apakah masih tersedia?`;

      card.innerHTML = `
        <div class="product-card__badges">
          <span class="badge ${statusBadgeClass(status)}">${status}</span>
        </div>
        <h3 class="product-card__name">${seriesName}</h3>

        <div class="card-selector-label">Jenis</div>
        <div class="card-selector card-selector--jenis">
          ${jenisOptions
            .map(
              (j) => `
            <button
              class="card-sel-btn ${j === selectedJenis ? "is-active" : ""} ${jenisBadgeClass(j)}"
              data-jenis="${j}"
              title="${jenisLabel(j)}"
            >${jenisLabel(j)}</button>
          `,
            )
            .join("")}
        </div>

        <div class="card-selector-label">Storage</div>
        <div class="card-selector card-selector--storage">
          ${storages
            .map((s) => {
              return `<button
              class="card-sel-btn card-sel-btn--storage ${s === selectedStorage ? "is-active" : ""}"
              data-storage="${s}"
            >${s}</button>`;
            })
            .join("")}
        </div>

        <div class="product-card__price ${!variant ? "price--unavail" : ""}">
          ${
            variant
              ? formatRupiah(price) +
                (!isExact
                  ? '<span style="display:block;font-size:0.62rem;font-weight:600;color:#888;text-transform:uppercase;letter-spacing:0.04em;margin-top:2px;">Estimasi harga</span>'
                  : "")
              : '<span style="font-size:0.85rem;color:#666">Tidak tersedia</span>'
          }
        </div>

        <a class="btn btn--primary btn--block ${!variant ? "btn--disabled" : ""}"
           href="${variant ? waLink(message) : "#"}"
           ${!variant ? 'aria-disabled="true" tabindex="-1"' : 'target="_blank" rel="noopener"'}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-.9-.4-1.9-1-2.7-1.9-.7-.7-1.2-1.5-1.5-2.1-.1-.2 0-.4.1-.5.2-.2.4-.5.6-.7.2-.2.2-.4.1-.6-.1-.2-.6-1.5-.8-2-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.3.3-1 1-.9 2.4.1 1.4 1 2.8 1.1 3 .1.2 1.6 2.6 4 3.6 2.3 1 2.3.7 2.7.6.4 0 1.3-.5 1.5-1 .2-.5.2-.9.1-1-.1-.1-.2-.2-.4-.2zM12 2C6.5 2 2 6.5 2 12c0 1.9.5 3.7 1.5 5.2L2 22l4.9-1.5C8.4 21.5 10.1 22 12 22c5.5 0 10-4.5 10-10S17.5 2 12 2zm0 18.2c-1.7 0-3.3-.5-4.7-1.3l-.3-.2-3.1.9.9-3-.2-.3C3.7 14.8 3.2 13.4 3.2 12c0-4.8 3.9-8.7 8.7-8.7 4.8 0 8.7 3.9 8.7 8.7 0 4.8-3.9 8.7-8.6 8.7z"/></svg>
          Chat WhatsApp
        </a>
      `;

      // Bind selector events
      card.querySelectorAll("[data-jenis]").forEach((btn) => {
        btn.addEventListener("click", () => {
          selectedJenis = btn.dataset.jenis;
          render();
        });
      });

      card.querySelectorAll("[data-storage]").forEach((btn) => {
        btn.addEventListener("click", () => {
          selectedStorage = btn.dataset.storage;
          render();
        });
      });
    }

    render();
    return card;
  }

  /* ---- Active filters ---- */
  const activeFilters = {
    status: "all",
    storage: "all",
    jenis: "all",
    search: "",
  };

  /* ---- Main render function ---- */
  function renderCatalog() {
    const term = activeFilters.search.trim().toLowerCase();

    // Filter individual products first
    const filtered = PRODUCTS.filter((product) => {
      const matchStatus =
        activeFilters.status === "all" ||
        product.status === activeFilters.status;
      const matchStorage =
        activeFilters.storage === "all" ||
        product.storage === activeFilters.storage;
      const matchJenis =
        activeFilters.jenis === "all" || product.jenis === activeFilters.jenis;
      const matchSearch = !term || product.name.toLowerCase().includes(term);
      return matchStatus && matchStorage && matchJenis && matchSearch;
    });

    // Group by series
    const grouped = groupProducts(filtered);

    catalogGrid.innerHTML = "";
    grouped.forEach((variants, seriesName) => {
      catalogGrid.appendChild(buildGroupCard(seriesName, variants));
    });

    catalogCount.textContent = `Menampilkan ${grouped.size} seri dari ${groupProducts(PRODUCTS).size} seri`;
    catalogEmpty.classList.toggle("hidden", grouped.size !== 0);
    catalogGrid.classList.toggle("hidden", grouped.size === 0);
  }

  filterGroups.forEach((group) => {
    const groupName = group.dataset.group;
    group.querySelectorAll(".filter-pill").forEach((pill) => {
      pill.addEventListener("click", () => {
        group
          .querySelectorAll(".filter-pill")
          .forEach((p) => p.classList.remove("is-active"));
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
})();

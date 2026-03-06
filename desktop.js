/* ═══════════════════════════════════════════════════════════════
   DESKTOP OS — Interactive behaviors
   Only runs on screens ≥ 960px
   ═══════════════════════════════════════════════════════════════ */

(function initDesktopOS() {
  // Only activate on desktop-sized screens
  if (window.innerWidth < 960) return;

  // ─── LIVE CLOCK in menu bar ───
  const clockEl = document.getElementById("os-clock");
  if (clockEl) {
    function updateClock() {
      const now = new Date();
      const h = now.getHours();
      const m = String(now.getMinutes()).padStart(2, "0");
      const ampm = h >= 12 ? "PM" : "AM";
      const h12 = h % 12 || 12;
      clockEl.textContent = `${h12}:${m} ${ampm}`;
    }
    updateClock();
    setInterval(updateClock, 30000); // update every 30s
  }

  // ─── TRAFFIC LIGHT — close button easter egg ───
  const closeBtn = document.querySelector(".os-tl--close");
  const osWindow = document.querySelector(".os-window");
  if (closeBtn && osWindow) {
    closeBtn.addEventListener("click", () => {
      osWindow.style.transition =
        "transform 0.4s ease-in, opacity 0.4s ease-in";
      osWindow.style.transform = "scale(0.01)";
      osWindow.style.opacity = "0";
      setTimeout(() => {
        osWindow.style.transition =
          "transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease-out";
        osWindow.style.transform = "";
        osWindow.style.opacity = "";
      }, 1200);
    });
  }

  // ─── MINIMIZE button — bounce to dock ───
  const minBtn = document.querySelector(".os-tl--min");
  if (minBtn && osWindow) {
    minBtn.addEventListener("click", () => {
      osWindow.style.transition =
        "transform 0.35s ease-in, opacity 0.35s ease-in";
      osWindow.style.transform = "translateY(100vh) scale(0.15)";
      osWindow.style.opacity = "0";
      setTimeout(() => {
        osWindow.style.transition =
          "transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease-out";
        osWindow.style.transform = "";
        osWindow.style.opacity = "";
      }, 900);
    });
  }

  // ─── DESKTOP ICONS — smooth scroll to section ───
  document.querySelectorAll(".os-icon[data-section]").forEach((icon) => {
    icon.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = icon.getAttribute("data-section");
      const target = document.getElementById(targetId);
      const content = document.querySelector(".os-content");
      if (target && content) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  // ─── DOCK ITEMS — scroll to section ───
  document.querySelectorAll(".os-dock-item[data-section]").forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = item.getAttribute("data-section");
      const target = document.getElementById(targetId);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  // ─── ACTIVE TAB tracking based on scroll position ───
  const tabs = document.querySelectorAll(".os-tab[data-section]");
  if (tabs.length) {
    const sectionIds = Array.from(tabs).map((t) =>
      t.getAttribute("data-section"),
    );
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            tabs.forEach((t) => t.classList.remove("active"));
            const match = Array.from(tabs).find(
              (t) => t.getAttribute("data-section") === entry.target.id,
            );
            if (match) match.classList.add("active");
          }
        });
      },
      { threshold: 0.3 },
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
  }
})();

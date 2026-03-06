/* ────────────────────────────────────────────────────
   main.js — Portfolio interactivity
   ──────────────────────────────────────────────────── */

// ─── REVEAL ON SCROLL via IntersectionObserver ───
const revealEls = document.querySelectorAll(
  ".timeline-item, .skill-category, .edu-card",
);

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const allEls = Array.from(revealEls);
          const idx = allEls.indexOf(entry.target);
          setTimeout(
            () => {
              entry.target.classList.add("visible");
            },
            (idx % 8) * 80,
          );
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: "0px 0px -40px 0px" },
  );

  revealEls.forEach((el) => revealObserver.observe(el));
} else {
  // Fallback: make everything visible immediately
  revealEls.forEach((el) => el.classList.add("visible"));
}

// ─── NAV: scroll-aware + active link highlighting ───
const navbar = document.getElementById("navbar");
const navLinks = document.querySelectorAll(".nav-links a");
const sections = document.querySelectorAll("section[id]");

function onScroll() {
  // sticky shadow
  navbar.classList.toggle("scrolled", window.scrollY > 20);

  // hide scroll hint
  const hint = document.getElementById("scroll-hint");
  if (hint) hint.style.opacity = window.scrollY > 80 ? "0" : "1";

  // active nav link
  let current = "";
  sections.forEach((sec) => {
    const top = sec.offsetTop - 120;
    if (window.scrollY >= top) current = sec.id;
  });
  navLinks.forEach((a) => {
    const href = a.getAttribute("href").replace("#", "");
    a.classList.toggle("active", href === current);
  });
}

window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

// ─── MOBILE MENU ───
const hamburger = document.getElementById("hamburger");
let mobileMenu = null;

function createMobileMenu() {
  mobileMenu = document.createElement("div");
  mobileMenu.className = "mobile-menu";
  mobileMenu.id = "mobile-menu";

  const links = [
    { href: "#about", label: "About" },
    { href: "#experience", label: "Experience" },
    { href: "#skills", label: "Skills" },
    { href: "#education", label: "Education" },
    { href: "#contact", label: "Contact" },
  ];

  links.forEach(({ href, label }) => {
    const a = document.createElement("a");
    a.href = href;
    a.textContent = label;
    a.addEventListener("click", closeMobileMenu);
    mobileMenu.appendChild(a);
  });

  const btn = document.createElement("a");
  btn.href = "resume.pdf";
  btn.download = true;
  btn.className = "btn-resume";
  btn.textContent = "Download CV";
  mobileMenu.appendChild(btn);

  document.body.appendChild(mobileMenu);
}

function openMobileMenu() {
  if (!mobileMenu) createMobileMenu();
  mobileMenu.classList.add("open");
  document.body.style.overflow = "hidden";
  // animate hamburger to X
  const spans = hamburger.querySelectorAll("span");
  spans[0].style.transform = "translateY(7px) rotate(45deg)";
  spans[1].style.opacity = "0";
  spans[2].style.transform = "translateY(-7px) rotate(-45deg)";
}

function closeMobileMenu() {
  if (!mobileMenu) return;
  mobileMenu.classList.remove("open");
  document.body.style.overflow = "";
  const spans = hamburger.querySelectorAll("span");
  spans[0].style.transform = "";
  spans[1].style.opacity = "";
  spans[2].style.transform = "";
}

hamburger.addEventListener("click", () => {
  if (mobileMenu && mobileMenu.classList.contains("open")) {
    closeMobileMenu();
  } else {
    openMobileMenu();
  }
});

// ─── 3D TILT on About Card ───
const aboutCard = document.getElementById("about-card");
if (aboutCard) {
  aboutCard.addEventListener("mousemove", (e) => {
    const rect = aboutCard.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -20;
    aboutCard.style.transform = `rotateY(${x}deg) rotateX(${y}deg) scale(1.02)`;
  });
  aboutCard.addEventListener("mouseleave", () => {
    aboutCard.style.transform = "";
  });
}

// ─── SMOOTH SCROLL for all internal links ───
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (e) => {
    const target = document.querySelector(anchor.getAttribute("href"));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});

// ─── STAT NUMBER COUNTER ANIMATION ───
function animateCounters() {
  const stats = document.querySelectorAll(".stat-num");
  const targets = ["9+", "50%", "70%", "5×"];
  const nums = [9, 50, 70, 5];
  const suffixes = ["+", "%", "%", "×"];

  stats.forEach((el, i) => {
    let start = 0;
    const end = nums[i];
    const suffix = suffixes[i];
    const duration = 1200;
    const step = Math.max(20, Math.round(duration / end));

    const timer = setInterval(() => {
      start++;
      el.textContent = start + suffix;
      if (start >= end) {
        clearInterval(timer);
        el.textContent = targets[i];
      }
    }, step);
  });
}

// Run counter when hero is visible (once)
const heroSection = document.getElementById("hero");
let counterDone = false;
if (heroSection && "IntersectionObserver" in window) {
  const heroObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !counterDone) {
          counterDone = true;
          setTimeout(animateCounters, 600);
          heroObserver.unobserve(heroSection);
        }
      });
    },
    { threshold: 0.3 },
  );
  heroObserver.observe(heroSection);
} else {
  setTimeout(animateCounters, 800);
}

// ─── CURSOR GLOW (subtle) ───
const glow = document.createElement("div");
glow.style.cssText = `
  position: fixed;
  width: 400px; height: 400px;
  border-radius: 50%;
  pointer-events: none;
  z-index: 0;
  background: radial-gradient(circle, rgba(99,179,237,0.04) 0%, transparent 70%);
  transform: translate(-50%, -50%);
  left: -999px; top: -999px;
  will-change: left, top;
`;
document.body.appendChild(glow);

let glowRaf;
document.addEventListener("mousemove", (e) => {
  cancelAnimationFrame(glowRaf);
  glowRaf = requestAnimationFrame(() => {
    glow.style.left = e.clientX + "px";
    glow.style.top = e.clientY + "px";
  });
});

// ─── KEYBOARD ACCESSIBILITY: close mobile menu on Escape ───
document.addEventListener("keydown", (e) => {
  if (
    e.key === "Escape" &&
    mobileMenu &&
    mobileMenu.classList.contains("open")
  ) {
    closeMobileMenu();
  }
});

console.log(
  "%c\uD83D\uDC4B Hey there! Palash built this portfolio.",
  "color: #63b3ed; font-size: 14px; font-weight: bold;",
);
console.log(
  "%cTake a look at the source \u2014 clean code matters :)",
  "color: #9f7aea; font-size: 12px;",
);

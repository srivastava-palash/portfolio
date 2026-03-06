/* ────────────────────────────────────────────────────
   main.js — Portfolio interactivity
   ──────────────────────────────────────────────────── */

// ─── REVEAL ON SCROLL via IntersectionObserver ───
const revealEls = document.querySelectorAll(
  ".timeline-item, .skill-category, .edu-card, .reveal-el",
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

// ─── TERMINAL ANIMATION ───
(function initTerminal() {
  const body = document.getElementById("tw-body");
  if (!body) return;

  let minor = 1;
  let patch = 0;

  const LINES = () => {
    patch = (patch + 1) % 10;
    const ver = `v2.${minor}.${patch}`;
    return [
      { cls: "tw-cmd", text: `$ git push origin main` },
      { cls: "tw-info", text: `  ↑ triggering GitHub Actions...`, delay: 700 },
      {
        cls: "tw-dim",
        text: `  ─────────────────────────────────`,
        delay: 400,
      },
      {
        cls: "tw-info",
        text: `  ❯ lint            `,
        delay: 600,
        suffix: { cls: "tw-ok", text: "✓  1.2s" },
      },
      {
        cls: "tw-info",
        text: `  ❯ unit-tests      `,
        delay: 900,
        suffix: { cls: "tw-ok", text: "✓ 44s" },
      },
      {
        cls: "tw-info",
        text: `  ❯ docker build    `,
        delay: 1100,
        suffix: { cls: "tw-ok", text: "✓ 58s" },
      },
      {
        cls: "tw-info",
        text: `  ❯ push ecr        `,
        delay: 700,
        suffix: { cls: "tw-ok", text: "✓ 19s" },
      },
      {
        cls: "tw-info",
        text: `  ❯ k8s rollout     `,
        delay: 1200,
        suffix: { cls: "tw-ok", text: "✓ 32s" },
      },
      {
        cls: "tw-dim",
        text: `  ─────────────────────────────────`,
        delay: 300,
      },
      { cls: "tw-live", text: `  🚀 ${ver} → prod   0s downtime`, delay: 600 },
      { cls: "tw-ok", text: `  ✓ all pods healthy`, delay: 400 },
    ];
  };

  function addLine(cls, text) {
    const span = document.createElement("span");
    span.className = `tw-line ${cls}`;
    span.textContent = text;
    body.appendChild(span);
    body.scrollTop = body.scrollHeight;
    return span;
  }

  function runSequence() {
    body.innerHTML = "";
    const lines = LINES();
    let accDelay = 500;

    lines.forEach((line, i) => {
      const d = i === 0 ? 0 : line.delay || 500;
      accDelay += d;

      setTimeout(() => {
        if (line.suffix) {
          // add text part, then suffix after a brief "thinking" pause
          const span = addLine(line.cls, line.text + "...");
          setTimeout(() => {
            const suf = document.createElement("span");
            suf.className = `tw-line ${line.suffix.cls}`;
            suf.textContent = line.suffix.text;
            span.textContent = line.text;
            span.appendChild(suf);
          }, 800);
        } else {
          addLine(line.cls, line.text);
        }

        // add blinking cursor on last line
        if (i === lines.length - 1) {
          setTimeout(() => {
            const cur = document.createElement("span");
            cur.className = "tw-cursor";
            body.appendChild(cur);
            // trigger k8s pod spawn
            const newPod = document.getElementById("k8s-new-pod");
            if (newPod) {
              newPod.style.animation = "none";
              newPod.offsetHeight; // reflow
              newPod.style.animation = "";
            }
            // loop
            setTimeout(runSequence, 6000);
          }, 400);
        }
      }, accDelay);
    });
  }

  // Start after a short delay so page loads first
  setTimeout(runSequence, 1200);
})();

// ══════════════════════════════════════════════════════════════
//  UNIFIED MOUSE SYSTEM  — single rAF loop, GPU-only transforms
// ══════════════════════════════════════════════════════════════
(function initMouseSystem() {
  /* ── Shared raw mouse position (updated on every mousemove) ── */
  let RX = -400,
    RY = -400; // raw/target
  let needsFrame = false;

  /* ── Cursor ── */
  const ring = document.getElementById("custom-cursor");
  const dot = document.getElementById("custom-cursor-dot");
  let CX = -400,
    CY = -400; // lerped cursor ring position

  /* ── Spotlight ── */
  const spotlight = document.getElementById("mouse-spotlight");
  let SX = window.innerWidth / 2,
    SY = window.innerHeight / 2; // lerped spotlight

  /* ── Card tilt state ── */
  // Only tilt project/experience/about cards — NOT skill-category (too many)
  const TILT_SELECTORS =
    ".project-card, .timeline-card, .edu-card, .about-card";
  const MAX_TILT = 8; // degrees
  let hoveredCard = null; // currently hovered card element
  let cardRect = null; // cached getBoundingClientRect for hovered card
  let TILTX = 0,
    TILTY = 0; // lerped tilt values

  // Contact section — never tilt anything inside it (form must stay still)
  const contactSection = document.getElementById("contact");

  // Inject sheen divs and tilt-card class into all tiltable cards
  document.querySelectorAll(TILT_SELECTORS).forEach((card) => {
    // Skip if card is inside the contact section
    if (contactSection && contactSection.contains(card)) return;

    card.classList.add("tilt-card");
    if (getComputedStyle(card).position === "static") {
      card.style.position = "relative";
    }
    const sheen = document.createElement("div");
    sheen.className = "tilt-sheen";
    card.appendChild(sheen);
    // Give parent perspective so 3D works — but never set it on section/body
    const p = card.parentElement;
    const pTag = p.tagName.toLowerCase();
    if (
      !p.style.perspective &&
      pTag !== "section" &&
      pTag !== "body" &&
      pTag !== "main"
    ) {
      p.style.perspective = "900px";
    }

    card.addEventListener("mouseenter", () => {
      hoveredCard = card;
      cardRect = card.getBoundingClientRect(); // cache on enter
    });
    card.addEventListener("mouseleave", () => {
      hoveredCard = null;
      // Spring back via CSS transition
      card.style.setProperty("--rx", "0deg");
      card.style.setProperty("--ry", "0deg");
      card.style.transform = "rotateX(0deg) rotateY(0deg)";
      TILTX = 0;
      TILTY = 0;
    });
    // Refresh cached rect if card is scrolled
    card.addEventListener(
      "mouseenter",
      () => {
        cardRect = card.getBoundingClientRect();
      },
      { passive: true },
    );
  });

  /* ── Single mousemove handler ── */
  document.addEventListener(
    "mousemove",
    (e) => {
      RX = e.clientX;
      RY = e.clientY;
      if (spotlight) spotlight.classList.add("active");
      // Refresh hovered card rect (cheap — no layout triggers here)
      if (hoveredCard) cardRect = hoveredCard.getBoundingClientRect();
      if (!needsFrame) {
        needsFrame = true;
        requestAnimationFrame(frame);
      }
    },
    { passive: true },
  );

  /* ── Click feedback on cursor ring ── */
  if (ring) {
    document.addEventListener("mousedown", () =>
      ring.classList.add("cursor-click"),
    );
    document.addEventListener("mouseup", () =>
      ring.classList.remove("cursor-click"),
    );
    document.addEventListener("mouseover", (e) => {
      const t = e.target;
      if (t && t.closest) {
        const hover = t.closest(
          "a, button, .project-card, .timeline-card, .about-card, .social-link, .b-key1, .b-key2, .b-esc",
        );
        ring.classList.toggle("cursor-hover", !!hover);
      }
    });
  }

  /* ── THE ONE rAF LOOP ── */
  const LERP_CURSOR = 0.18; // cursor ring lag (fast)
  const LERP_SPOTLIGHT = 0.08; // spotlight lag  (slow/dreamy)
  const LERP_TILT = 0.15; // card tilt lag  (snappy)

  function frame() {
    needsFrame = false;

    let dirty = false;

    // ── 1. Cursor ring (GPU transform, no layout) ───────────────
    if (ring && dot) {
      // Dot snaps instantly (visually anchored to real cursor)
      dot.style.transform = `translate3d(${RX}px, ${RY}px, 0) translate(-50%, -50%)`;

      // Ring lerps
      const dCX = RX - CX,
        dCY = RY - CY;
      if (Math.abs(dCX) > 0.3 || Math.abs(dCY) > 0.3) {
        CX += dCX * LERP_CURSOR;
        CY += dCY * LERP_CURSOR;
        ring.style.transform = `translate3d(${CX}px, ${CY}px, 0) translate(-50%, -50%)`;
        dirty = true;
      }
    }

    // ── 2. Spotlight (CSS custom props on fixed element) ─────────
    if (spotlight) {
      const dSX = RX - SX,
        dSY = RY - SY;
      if (Math.abs(dSX) > 0.5 || Math.abs(dSY) > 0.5) {
        SX += dSX * LERP_SPOTLIGHT;
        SY += dSY * LERP_SPOTLIGHT;
        spotlight.style.setProperty("--mx", SX.toFixed(0) + "px");
        spotlight.style.setProperty("--my", SY.toFixed(0) + "px");
        dirty = true;
      }
    }

    // ── 3. Card tilt (CSS transform, GPU-composited) ─────────────
    if (hoveredCard && cardRect) {
      const relX = Math.max(
        0,
        Math.min(1, (RX - cardRect.left) / cardRect.width),
      );
      const relY = Math.max(
        0,
        Math.min(1, (RY - cardRect.top) / cardRect.height),
      );

      const targetTX = -(relY - 0.5) * 2 * MAX_TILT;
      const targetTY = (relX - 0.5) * 2 * MAX_TILT;

      const dTX = targetTX - TILTX,
        dTY = targetTY - TILTY;
      if (Math.abs(dTX) > 0.02 || Math.abs(dTY) > 0.02) {
        TILTX += dTX * LERP_TILT;
        TILTY += dTY * LERP_TILT;
        hoveredCard.style.transform = `rotateX(${TILTX.toFixed(2)}deg) rotateY(${TILTY.toFixed(2)}deg)`;

        // Sheen position (just CSS custom props, zero cost)
        const sheen = hoveredCard.querySelector(".tilt-sheen");
        if (sheen) {
          sheen.style.setProperty("--cx", (relX * 100).toFixed(0) + "%");
          sheen.style.setProperty("--cy", (relY * 100).toFixed(0) + "%");
        }
        dirty = true;
      }
    } else if (TILTX !== 0 || TILTY !== 0) {
      // Spring back to flat
      TILTX *= 0.75;
      TILTY *= 0.75;
      if (Math.abs(TILTX) < 0.05 && Math.abs(TILTY) < 0.05) {
        TILTX = 0;
        TILTY = 0;
      } else {
        dirty = true;
      }
    }

    if (dirty) {
      needsFrame = true;
      requestAnimationFrame(frame);
    }
  }
})();

// ─── HERO TYPEWRITER ───
(function initTypewriter() {
  const el = document.getElementById("hero-role-text");
  if (!el) return;

  // Insert blinking caret right after the span
  const caret = document.createElement("span");
  caret.className = "typewriter-caret";
  el.parentNode.insertBefore(caret, el.nextSibling);

  const ROLES = [
    "Srivastava",
    "Platform Engineer",
    "DevOps Manager",
    "Site Reliability",
  ];
  let roleIdx = 0;
  let charIdx = 0;
  let deleting = false;
  let paused = false;

  function tick() {
    const target = ROLES[roleIdx];
    if (paused) {
      paused = false;
      setTimeout(tick, deleting ? 80 : 1800);
      return;
    }
    if (!deleting) {
      charIdx++;
      el.textContent = target.slice(0, charIdx);
      if (charIdx === target.length) {
        paused = true;
        deleting = true;
      }
    } else {
      charIdx--;
      el.textContent = target.slice(0, charIdx);
      if (charIdx === 0) {
        deleting = false;
        roleIdx = (roleIdx + 1) % ROLES.length;
        paused = true;
      }
    }
    setTimeout(tick, deleting ? 42 : 88);
  }
  // Start after hero animation settles
  setTimeout(tick, 2200);
})();

// ─── CONTACT FORM (Web3Forms) ───
(function initContactForm() {
  const form = document.getElementById("contact-form");
  const btn = document.getElementById("cf-submit-btn");
  const success = document.getElementById("cf-success");
  const error = document.getElementById("cf-error");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Basic client-side validation
    const name = form.querySelector("#cf-name").value.trim();
    const email = form.querySelector("#cf-email").value.trim();
    const message = form.querySelector("#cf-message").value.trim();
    if (!name || !email || !message) return;

    // Show loading state
    btn.classList.add("loading");
    btn.disabled = true;
    success.style.display = "none";
    error.style.display = "none";

    try {
      const data = new FormData(form);
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: data,
      });
      const json = await res.json();

      if (json.success) {
        success.style.display = "flex";
        form.reset();
      } else {
        error.style.display = "flex";
      }
    } catch (_) {
      error.style.display = "flex";
    } finally {
      btn.classList.remove("loading");
      btn.disabled = false;
    }
  });
})();

console.log(
  "%c\uD83D\uDC4B Hey there! Palash built this portfolio.",
  "color: #63b3ed; font-size: 14px; font-weight: bold;",
);
console.log(
  "%cTake a look at the source \u2014 clean code matters :)",
  "color: #9f7aea; font-size: 12px;",
);

// ─── LIVE SLO UPTIME CALCULATOR ───
(function calcUptime() {
  const el = document.getElementById("uptime-val");
  if (!el) return;
  // Calculate what 99.98% uptime looks like as hours:minutes:seconds of downtime this year
  const now = new Date();
  const yearStart = new Date(now.getFullYear(), 0, 1);
  const elapsed = (now - yearStart) / 1000; // seconds elapsed this year
  const downtimeSec = elapsed * (1 - 0.9998);
  const uptimeSec = elapsed - downtimeSec;
  const days = Math.floor(uptimeSec / 86400);
  const hours = Math.floor((uptimeSec % 86400) / 3600);
  el.textContent = `${days}d ${hours}h (99.98% SLO)`;
})();

// ─── NAV: add Projects link ───
// (projects section exists, make sure 'Projects' appears in nav if nav links exist)

// ══════════════════════════════════════════════════════════════
//  MOUSE SPOTLIGHT  — Antigravity.google style
// ══════════════════════════════════════════════════════════════
(function initSpotlight() {
  const spotlight = document.getElementById("mouse-spotlight");
  if (!spotlight) return;

  let tx = window.innerWidth / 2;
  let ty = window.innerHeight / 2;
  let cx = tx,
    cy = ty;
  let rafId;

  // Activate once the user moves the mouse
  document.addEventListener(
    "mousemove",
    (e) => {
      tx = e.clientX;
      ty = e.clientY;
      spotlight.classList.add("active");
      if (!rafId) rafId = requestAnimationFrame(animate);
    },
    { passive: true },
  );

  // Smooth lerp so the glow has a subtle lag — feels weightier
  function animate() {
    cx += (tx - cx) * 0.1;
    cy += (ty - cy) * 0.1;

    // Use CSS custom properties — no repainting the full element, just re-evaluating gradient
    spotlight.style.setProperty("--mx", cx.toFixed(1) + "px");
    spotlight.style.setProperty("--my", cy.toFixed(1) + "px");

    const dist = Math.hypot(tx - cx, ty - cy);
    rafId = dist > 0.3 ? requestAnimationFrame(animate) : null;
  }
})();

// ══════════════════════════════════════════════════════════════
//  3D CARD TILT + SPECULAR SHEEN
// ══════════════════════════════════════════════════════════════
(function initCardTilt() {
  // Which cards get the tilt treatment
  const CARD_SELECTORS =
    ".project-card, .timeline-card, .skill-category, .edu-card, .about-card";
  const MAX_TILT = 10; // degrees
  const PERSPECTIVE = 800; // px

  // Inject tilt-card class + sheen div into all matching cards
  document.querySelectorAll(CARD_SELECTORS).forEach((card) => {
    card.classList.add("tilt-card");
    // Ensure position:relative for sheen overlay
    if (getComputedStyle(card).position === "static") {
      card.style.position = "relative";
    }
    const sheen = document.createElement("div");
    sheen.className = "tilt-sheen";
    card.appendChild(sheen);

    // Wrap in perspective container if not already
    const parent = card.parentElement;
    if (!parent.style.perspective) {
      parent.style.perspective = PERSPECTIVE + "px";
    }

    let animFrame;
    let targetRx = 0,
      targetRy = 0;
    let currentRx = 0,
      currentRy = 0;
    let targetCx = 50,
      targetCy = 50;

    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const relX = (e.clientX - rect.left) / rect.width; // 0..1
      const relY = (e.clientY - rect.top) / rect.height; // 0..1

      targetRy = (relX - 0.5) * 2 * MAX_TILT; // left/right tilt
      targetRx = -(relY - 0.5) * 2 * MAX_TILT; // up/down tilt
      targetCx = (relX * 100).toFixed(1);
      targetCy = (relY * 100).toFixed(1);

      // Update sheen position immediately (fast)
      sheen.style.setProperty("--cx", targetCx + "%");
      sheen.style.setProperty("--cy", targetCy + "%");

      if (!animFrame) animFrame = requestAnimationFrame(lerpTilt);
    });

    card.addEventListener("mouseleave", () => {
      targetRx = 0;
      targetRy = 0;
      if (!animFrame) animFrame = requestAnimationFrame(lerpTilt);
    });

    function lerpTilt() {
      currentRx += (targetRx - currentRx) * 0.18;
      currentRy += (targetRy - currentRy) * 0.18;

      card.style.transform = `rotateX(${currentRx.toFixed(2)}deg) rotateY(${currentRy.toFixed(2)}deg)`;

      const distR =
        Math.abs(targetRx - currentRx) + Math.abs(targetRy - currentRy);
      animFrame = distR > 0.05 ? requestAnimationFrame(lerpTilt) : null;
      if (!animFrame) card.style.transform = "rotateX(0deg) rotateY(0deg)";
    }
  });
})();

console.log(
  "%c\uD83D\uDC4B Hey there! Palash built this portfolio.",
  "color: #63b3ed; font-size: 14px; font-weight: bold;",
);
console.log(
  "%cTake a look at the source \u2014 clean code matters :)",
  "color: #9f7aea; font-size: 12px;",
);

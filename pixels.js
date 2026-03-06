/* ═══════════════════════════════════════════════════════════════
   PIXEL ART — Interactive Elements
   ═══════════════════════════════════════════════════════════════ */

// ─── PIXEL BUDDY (corner mascot) ───
(function initPixelBuddy() {
  const wrap = document.getElementById("px-buddy");
  if (!wrap) return;

  const speech = wrap.querySelector(".px-buddy-speech");
  if (!speech) return;

  const TIPS = [
    "$ kubectl get pods ✓",
    "Ship it! 🚀",
    "All pods healthy ✅",
    "99.98% uptime 📈",
    "git push origin main",
    "Deploying to prod...",
    "Zero downtime 🎯",
    "Infrastructure as Code",
    "docker build -t app .",
    "terraform apply ✓",
    "Pipeline passed! 🟢",
    "SLO budget: 99.9%",
  ];

  let tipIdx = 0;

  // Rotate messages on click
  wrap.addEventListener("click", () => {
    tipIdx = (tipIdx + 1) % TIPS.length;
    speech.textContent = TIPS[tipIdx];
    // Quick bounce animation
    wrap.style.transform = "scale(1.3)";
    setTimeout(() => {
      wrap.style.transform = "";
    }, 200);
  });

  // Slowly rotate message every 8 seconds when idle
  setInterval(() => {
    tipIdx = (tipIdx + 1) % TIPS.length;
    speech.textContent = TIPS[tipIdx];
  }, 8000);
})();

// ─── SERVER ROOM SCENE (build LEDs and packets dynamically) ───
(function initServerRoom() {
  const scene = document.getElementById("px-server-room");
  if (!scene) return;

  // Create 4 mini rack units
  const racks = [
    { left: "8%", top: "10px", width: "80px" },
    { left: "28%", top: "18px", width: "100px" },
    { left: "55%", top: "8px", width: "90px" },
    { left: "78%", top: "22px", width: "70px" },
  ];

  racks.forEach((r, i) => {
    const rack = document.createElement("div");
    rack.className = "px-rack";
    rack.style.cssText = `left:${r.left}; top:${r.top}; width:${r.width};`;
    scene.appendChild(rack);

    // Add 2-3 LEDs per rack
    const colors = ["green", "amber", "blue", "red"];
    const ledCount = 2 + (i % 2);
    for (let j = 0; j < ledCount; j++) {
      const led = document.createElement("div");
      led.className = `px-led px-led--${colors[(i + j) % colors.length]}`;
      const rackLeft = parseInt(r.left);
      const rackW = parseInt(r.width);
      led.style.cssText = `left:calc(${r.left} + ${10 + j * 18}px); top:${parseInt(r.top) + 5}px;`;
      led.style.animationDelay = `${-(i * 0.5 + j * 0.3)}s`;
      scene.appendChild(led);
    }
  });

  // Create 3 data packets
  for (let i = 0; i < 3; i++) {
    const pkt = document.createElement("div");
    pkt.className = "px-packet";
    pkt.style.top = `${20 + i * 20}px`;
    pkt.style.animationDelay = `${-i * 1.3}s`;
    pkt.style.animationDuration = `${3.5 + i * 0.8}s`;
    scene.appendChild(pkt);
  }
})();

// ─── PIXEL BUDDY — React to scroll position ───
(function buddyScrollReact() {
  const buddy = document.getElementById("px-buddy");
  if (!buddy) return;

  const speech = buddy.querySelector(".px-buddy-speech");
  if (!speech) return;

  const sections = [
    { id: "hero", msg: "Welcome! 👋" },
    { id: "about", msg: "About me ↗" },
    { id: "projects", msg: "Cool stuff! 🛠️" },
    { id: "experience", msg: "Battle-tested 💪" },
    { id: "skills", msg: "Full stack infra 🧰" },
    { id: "education", msg: "Always learning 📚" },
    { id: "contact", msg: "Say hello! ✉️" },
  ];

  let currentSection = "";
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.target.id !== currentSection) {
          currentSection = entry.target.id;
          const match = sections.find((s) => s.id === currentSection);
          if (match) speech.textContent = match.msg;
        }
      });
    },
    { threshold: 0.3 },
  );

  sections.forEach((s) => {
    const el = document.getElementById(s.id);
    if (el) observer.observe(el);
  });
})();

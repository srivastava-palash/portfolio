/* Portfolio interactions. The system sketch and terminal are local simulations. */
(() => {
  "use strict";
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  // Navigation and reading position use the page's actual scroll container.
  const menuButton = $("#hamburger");
  const navigation = $("#site-navigation");
  function closeMenu() {
    navigation.classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");
  }
  menuButton.addEventListener("click", () => {
    const open = menuButton.getAttribute("aria-expanded") !== "true";
    menuButton.setAttribute("aria-expanded", String(open));
    navigation.classList.toggle("open", open);
  });
  navigation.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeMenu();
  });
  document.addEventListener("click", (event) => {
    if (!event.target.closest("#navbar")) closeMenu();
  });
  window.matchMedia("(min-width: 701px)").addEventListener("change", closeMenu);
  const sections = $$("main section[id]");
  let scrollPending = false;
  function updateScroll() {
    scrollPending = false;
    const offset = $("#navbar").getBoundingClientRect().height + 50;
    let current = "hero";
    sections.forEach((section) => {
      if (section.getBoundingClientRect().top <= offset) current = section.id;
    });
    $$("#site-navigation a").forEach((link) => {
      const active = link.hash === "#" + current;
      link.classList.toggle("active", active);
      if (active) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
    const height = document.documentElement.scrollHeight - window.innerHeight;
    $("#reading-progress").style.width =
      (height > 0
        ? Math.min(100, Math.max(0, (window.scrollY / height) * 100))
        : 0) + "%";
  }
  function scheduleScrollUpdate() {
    if (!scrollPending) {
      scrollPending = true;
      requestAnimationFrame(updateScroll);
    }
  }
  window.addEventListener("scroll", scheduleScrollUpdate, { passive: true });
  window.addEventListener("resize", scheduleScrollUpdate);
  window.addEventListener("load", updateScroll);
  updateScroll();
  $("#copyright-year").textContent = new Date().getFullYear();
  const newYorkTime = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  function updateClock() {
    $("#local-clock").textContent = newYorkTime.format(new Date()) + " ET";
  }
  updateClock();
  setInterval(updateClock, 60000);

  // An explorable architecture sketch, with semantic, keyboard-operable tabs.
  const systemInfo = {
    delivery: {
      index: "01 / DELIVERY",
      title: "A clear path from commit to release.",
      copy: "Automated checks, reproducible builds, and preview environments. Confidence at every handoff.",
      link: "#proj-cicd",
      label: "Read the delivery engineering case study",
    },
    runtime: {
      index: "02 / RUNTIME",
      title: "A foundation with room to grow.",
      copy: "Declarative infrastructure and container orchestration. Build for the workload you have, and the one that comes next.",
      link: "#proj-cloud",
      label: "Read the cloud architecture case study",
    },
    signals: {
      index: "03 / SIGNALS",
      title: "Make the system understandable.",
      copy: "Metrics, dashboards, and actionable alerts. Connect the signals to the decisions that keep systems reliable.",
      link: "#proj-signals",
      label: "Read the observability case study",
    },
  };
  const systemTabs = $$("[data-system]");
  function selectSystem(key, moveFocus = false) {
    const info = systemInfo[key];
    if (!info) return;
    systemTabs.forEach((tab) => {
      const active = tab.dataset.system === key;
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
      if (active && moveFocus) tab.focus();
    });
    $$("[data-node]").forEach((node) => {
      const selected = node.dataset.node === key;
      node.classList.toggle("selected", selected);
      node.setAttribute("aria-pressed", String(selected));
    });
    $("#inspector-index").textContent = info.index;
    $("#inspector-title").textContent = info.title;
    $("#inspector-copy").textContent = info.copy;
    $("#inspector-link").href = info.link;
    $("#inspector-link").setAttribute("aria-label", info.label);
    $("#system-inspector").setAttribute("aria-labelledby", "tab-" + key);
  }
  systemTabs.forEach((tab, index) => {
    tab.addEventListener("click", () => selectSystem(tab.dataset.system));
    tab.addEventListener("keydown", (event) => {
      let next;
      if (event.key === "ArrowRight") next = (index + 1) % systemTabs.length;
      if (event.key === "ArrowLeft")
        next = (index - 1 + systemTabs.length) % systemTabs.length;
      if (event.key === "Home") next = 0;
      if (event.key === "End") next = systemTabs.length - 1;
      if (next !== undefined) {
        event.preventDefault();
        selectSystem(systemTabs[next].dataset.system, true);
      }
    });
  });
  $$("[data-node]").forEach((node) =>
    node.addEventListener("click", () => selectSystem(node.dataset.node))
  );
  selectSystem("delivery");
  let demoTimer;
  let demoRunning = false;
  const releaseStages = [
    ["delivery", "01 / CHECKS PASSED"],
    ["delivery", "02 / CONTAINER BUILT"],
    ["runtime", "03 / RELEASE PROMOTED"],
    ["runtime", "04 / WORKLOAD ROLLED OUT"],
    ["signals", "05 / HEALTH CHECKS PASSED"],
  ];
  $("#run-demo").addEventListener("click", () => {
    if (demoRunning) return;
    demoRunning = true;
    $("#run-demo").disabled = true;
    $("#system-panel").classList.add("demo-running");
    let step = 0;
    function next() {
      if (step === releaseStages.length) {
        $("#demo-status").textContent = "DEMO COMPLETE / SIMULATED RELEASE";
        $("#run-demo").disabled = false;
        $("#system-panel").classList.remove("demo-running");
        demoRunning = false;
        return;
      }
      const [key, text] = releaseStages[step++];
      selectSystem(key);
      $("#demo-status").textContent = text;
      demoTimer = setTimeout(next, reducedMotion.matches ? 300 : 850);
    }
    next();
  });
  window.addEventListener("pagehide", () => {
    clearTimeout(demoTimer);
    demoRunning = false;
    $("#run-demo").disabled = false;
    $("#system-panel").classList.remove("demo-running");
  });

  // Quick navigation, including terminal access, without a mouse.
  const commandDialog = $("#command-dialog");
  const commandSearch = $("#command-search");
  const actions = [
    { label: "Selected work", hint: "CASE STUDIES", href: "#projects" },
    { label: "About Palash", hint: "THE ENGINEER", href: "#about" },
    { label: "Experience", hint: "CAREER", href: "#experience" },
    { label: "Technology toolkit", hint: "SKILLS", href: "#skills" },
    {
      label: "Education & credentials",
      hint: "FOUNDATIONS",
      href: "#education",
    },
    { label: "Get in touch", hint: "CONTACT", href: "#contact" },
    {
      label: "Download résumé",
      hint: "PDF",
      href: "resume.pdf",
      download: true,
    },
    { label: "Open portfolio terminal", hint: "INTERACTIVE", terminal: true },
    { label: "Back to the top", hint: "HOME", href: "#hero" },
  ];
  function renderCommands() {
    const query = commandSearch.value.trim().toLowerCase();
    const results = actions.filter((action) =>
      (action.label + " " + action.hint).toLowerCase().includes(query)
    );
    const container = $("#command-results");
    container.replaceChildren();
    if (!results.length) {
      const empty = document.createElement("p");
      empty.className = "command-empty";
      empty.textContent =
        "No matching actions. Try “work”, “contact”, or “terminal”.";
      container.appendChild(empty);
    }
    results.forEach((action) => {
      const button = document.createElement("button");
      button.className = "command-result";
      const label = document.createElement("span");
      label.textContent = action.label;
      const hint = document.createElement("small");
      hint.textContent = action.hint;
      button.append(label, hint);
      button.addEventListener("click", () => {
        commandDialog.close();
        if (action.terminal) openTerminal();
        else if (action.download) {
          const link = document.createElement("a");
          link.href = action.href;
          link.download = "";
          link.click();
        } else {
          const target = $(action.href);
          target.scrollIntoView({
            behavior: reducedMotion.matches ? "instant" : "smooth",
            block: "start",
          });
          history.replaceState(null, "", action.href);
          target.setAttribute("tabindex", "-1");
          target.focus({ preventScroll: true });
        }
      });
      container.appendChild(button);
    });
  }
  function openCommands() {
    closeMenu();
    commandSearch.value = "";
    renderCommands();
    commandDialog.showModal();
    commandSearch.focus();
  }
  $("#command-trigger").addEventListener("click", openCommands);
  $("#command-close").addEventListener("click", () => commandDialog.close());
  commandDialog.addEventListener("click", (event) => {
    if (event.target !== commandDialog) return;
    const bounds = commandDialog.getBoundingClientRect();
    if (
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom
    )
      commandDialog.close();
  });
  commandSearch.addEventListener("input", renderCommands);
  commandDialog.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      commandDialog.close();
      return;
    }
    const buttons = $$(".command-result");
    const index = buttons.indexOf(document.activeElement);
    if (event.key === "ArrowDown" && buttons.length) {
      event.preventDefault();
      buttons[(index + 1) % buttons.length].focus();
    } else if (event.key === "ArrowUp" && buttons.length) {
      event.preventDefault();
      buttons[(index - 1 + buttons.length) % buttons.length].focus();
    } else if (event.key === "Enter" && event.target === commandSearch) {
      event.preventDefault();
      buttons[0]?.click();
    }
  });

  // Trap focus inside the optional terminal and restore it on close.
  const terminal = $("#devops-terminal");
  let terminalOpener;
  function terminalIsOpen() {
    return (
      !terminal.classList.contains("hidden") &&
      !terminal.classList.contains("dt-exit")
    );
  }
  function openTerminal() {
    closeMenu();
    terminalOpener = document.activeElement;
    DevopsTerminal.open();
    $("#dt-input").focus();
  }
  $$("[data-terminal]").forEach((button) =>
    button.addEventListener("click", openTerminal)
  );
  new MutationObserver(() => {
    const open = terminalIsOpen();
    $$("[data-page]").forEach((part) => {
      part.inert = open;
    });
    if (!open && terminal.contains(document.activeElement))
      terminalOpener?.focus();
  }).observe(terminal, { attributes: true, attributeFilter: ["class"] });
  document.addEventListener("keydown", (event) => {
    if (
      (event.metaKey || event.ctrlKey) &&
      event.key.toLowerCase() === "k" &&
      !terminalIsOpen()
    ) {
      event.preventDefault();
      if (commandDialog.open) commandDialog.close();
      else openCommands();
    }
    if (event.key === "Escape") {
      if (terminalIsOpen()) $("#dt-exit").click();
      else if (menuButton.getAttribute("aria-expanded") === "true") {
        closeMenu();
        menuButton.focus();
      }
    }
    if (event.key === "Tab" && terminalIsOpen() && !event.defaultPrevented) {
      const focusable = [$("#dt-exit"), $("#dt-input")].filter(
        (element) => !element.disabled
      );
      const first = focusable[0],
        last = focusable[focusable.length - 1];
      if (
        event.shiftKey &&
        (document.activeElement === first ||
          !terminal.contains(document.activeElement))
      ) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        (document.activeElement === last ||
          !terminal.contains(document.activeElement))
      ) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  // Form submissions only happen when a visitor explicitly submits valid data.
  const form = $("#contact-form");
  const submit = $("#cf-submit-btn");
  const success = $("#cf-success");
  const error = $("#cf-error");
  $$("#contact-form input:not([type=hidden]), #contact-form textarea").forEach(
    (input) => {
      input.addEventListener("input", () => input.setCustomValidity(""));
    }
  );
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (submit.disabled) return;
    success.style.display = error.style.display = "none";
    [$("#cf-name"), $("#cf-message")].forEach((input) => {
      input.setCustomValidity(
        input.value.trim() ? "" : "Please fill out this field."
      );
    });
    if (!form.reportValidity()) return;
    submit.disabled = true;
    submit.classList.add("loading");
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
        signal: controller.signal,
      });
      const result = await response.json();
      if (response.ok && result.success === true) {
        success.style.display = "flex";
        form.reset();
      } else error.style.display = "flex";
    } catch (_) {
      error.style.display = "flex";
    } finally {
      clearTimeout(timeout);
      submit.disabled = false;
      submit.classList.remove("loading");
    }
  });
  let copyTimer;
  $("#copy-email").addEventListener("click", async () => {
    const button = $("#copy-email");
    try {
      await navigator.clipboard.writeText("srivastavapalash0@gmail.com");
      button.textContent = "Copied ✓";
      $("#copy-status").textContent = "Email address copied to clipboard.";
    } catch (_) {
      button.textContent = "Use the email link above ↗";
      $("#copy-status").textContent =
        "Clipboard unavailable. Use the email link above to contact Palash.";
    }
    clearTimeout(copyTimer);
    copyTimer = setTimeout(() => {
      button.textContent = "Copy email ⧉";
    }, 3000);
  });
})();

/* ══════════════════════════════════════════════════════════════
   boot.js  —  Interactive portfolio boot experience
   Palash Srivastava :: Platform Engineer
   ══════════════════════════════════════════════════════════════ */

/* ─────────────────────────────────────────
   1.  BOOT SCREEN MANAGER
───────────────────────────────────────── */
const BootManager = (() => {
  const ASCII = [
    " ██████╗ ███████╗",
    " ██╔══██╗██╔════╝",
    " ██████╔╝███████╗",
    " ██╔═══╝ ╚════██║",
    " ██║     ███████║",
    " ╚═╝     ╚══════╝",
  ];

  const BOOT_LINES = [
    { cls: "b-dim", text: "[ OK ] Initializing portfolio kernel...", d: 0 },
    { cls: "b-dim", text: "[ OK ] Loading experience.json          ", d: 180 },
    { cls: "b-dim", text: "[ OK ] Loading skills.yaml              ", d: 150 },
    { cls: "b-dim", text: "[ OK ] Loading contact.env              ", d: 130 },
    { cls: "b-dim", text: "[ OK ] Starting observability stack...  ", d: 200 },
    { cls: "b-ok", text: "✓  All systems nominal. 0 errors.", d: 280 },
    { cls: "b-blank", text: "", d: 200 },
    { cls: "b-bright", text: "SELECT EXPERIENCE MODE", d: 150 },
    {
      cls: "b-dim",
      text: "─────────────────────────────────────────────────────",
      d: 80,
    },
    {
      cls: "b-key1",
      text: "  [1]  DEVOPS MODE   ── Navigate via interactive terminal",
      d: 120,
    },
    {
      cls: "b-key2",
      text: "  [2]  GUI MODE      ── Standard portfolio (scroll)",
      d: 100,
    },
    {
      cls: "b-esc",
      text: "  [ESC] SKIP         ── Jump straight to portfolio",
      d: 100,
    },
    {
      cls: "b-dim",
      text: "─────────────────────────────────────────────────────",
      d: 80,
    },
    { cls: "b-blank", text: "", d: 80 },
  ];

  let overlay, output;
  let ready = false;

  function el(id) {
    return document.getElementById(id);
  }

  function addLine(cls, text) {
    const s = document.createElement("span");
    s.className = `boot-line ${cls}`;
    s.textContent = text;
    output.appendChild(s);
    output.scrollTop = output.scrollHeight;
    return s;
  }

  function selectMode(mode) {
    if (!overlay) return;
    overlay.classList.add("boot-exit");
    setTimeout(() => {
      overlay.remove();
      if (mode === "devops") {
        DevopsTerminal.open();
      }
    }, 380);
  }

  function run() {
    overlay = el("boot-overlay");
    output = el("boot-output");
    if (!overlay) return;

    // ASCII art (fast stagger)
    ASCII.forEach((line, i) => {
      setTimeout(() => {
        const s = document.createElement("span");
        s.className = "boot-line b-ascii";
        s.textContent = line;
        output.appendChild(s);
      }, i * 40);
    });

    // Subtitle right after ASCII
    setTimeout(
      () => {
        addLine(
          "b-subtitle",
          " PALASH SRIVASTAVA  ::  PLATFORM ENGINEER  ::  v2.4.1",
        );
        addLine("b-blank", "");
      },
      ASCII.length * 40 + 60,
    );

    // Boot sequence
    let acc = ASCII.length * 40 + 200;
    BOOT_LINES.forEach(({ cls, text, d }) => {
      acc += d;
      setTimeout(() => {
        addLine(cls, text);
        // After last meaningful line, show prompt + make clickable
        if (cls === "b-blank" && text === "" && acc > 2000) {
          ready = true;
          el("boot-prompt-row").style.display = "flex";
          // Make option lines interactive
          output.querySelectorAll(".b-key1").forEach((n) => {
            n.style.cursor = "pointer";
            n.addEventListener("click", () => selectMode("devops"));
          });
          output.querySelectorAll(".b-key2").forEach((n) => {
            n.style.cursor = "pointer";
            n.addEventListener("click", () => selectMode("gui"));
          });
          output.querySelectorAll(".b-esc").forEach((n) => {
            n.style.cursor = "pointer";
            n.addEventListener("click", () => selectMode("skip"));
          });
        }
      }, acc);
    });

    // Keyboard
    document.addEventListener("keydown", function handler(e) {
      if (!overlay?.isConnected) {
        document.removeEventListener("keydown", handler);
        return;
      }
      if (e.key === "1") {
        document.removeEventListener("keydown", handler);
        selectMode("devops");
      }
      if (e.key === "2" || e.key === "Enter") {
        document.removeEventListener("keydown", handler);
        selectMode("gui");
      }
      if (e.key === "Escape" || e.key.toLowerCase() === "s") {
        document.removeEventListener("keydown", handler);
        selectMode("skip");
      }
    });

    el("skip-btn")?.addEventListener("click", () => selectMode("skip"));
  }

  return { run };
})();

/* ─────────────────────────────────────────
   2.  DEVOPS TERMINAL
───────────────────────────────────────── */
const DevopsTerminal = (() => {
  const PROMPT_STR = "palash@portfolio:~$ ";

  /* ── File system content ── */
  const FILES = {
    "about.md": `# Palash Srivastava — Platform Engineer

I'm a hands-on reliability and platform leader with 9+ years building
and operating scalable, production-grade infrastructure.

CURRENT   : Head of Platform @ Constrafor, New York
FOCUS     : Cloud architecture, CI/CD, SOC 2, developer experience
LOOKING   : Senior Platform / DevOps / SRE Leadership roles

I thrive at the intersection of infrastructure, automation, and developer
productivity. From re-architecting cloud systems to leading SOC 2 readiness,
I turn complex operational challenges into elegant, scalable solutions.`,

    "skills.yaml": `cloud:
  - AWS
  - GCP
  - Kubernetes (GKE, EKS)
  - Docker / Docker Swarm
  - Terraform
  - Cloud Migrations

devops:
  - CI/CD (GitHub Actions, Jenkins)
  - Spinnaker
  - OpenSearch

observability:
  - Datadog
  - Prometheus + Grafana
  - ELK Stack
  - SLOs / SLAs / Error Budgets

security:
  - SOC 2 Type II
  - IAM / RBAC
  - Network Security
  - Cost Optimization

leadership:
  - Team Building & Mentorship
  - OKR Planning
  - Hiring
  - Cross-Team Collaboration`,

    "contact.env": `EMAIL="srivastavapalash0@gmail.com"
PHONE="+1 (571) 236-0145"
LINKEDIN="linkedin.com/in/srivastavapalash"
GITHUB="github.com/srivastava-palash"
LOCATION="New York, USA"
OPEN_TO_OPPORTUNITIES=true
PREFERRED_ROLES="Head of Platform, DevOps Manager, SRE Lead"`,

    "experience.log": `[2024-06 → present] Constrafor :: Head of Platform / DevOps Manager
  > SOC 2 Type II — security hardening, policies, remediation
  > AWS spend reduced 50% through architectural optimization
  > Backend re-architected for 5× traffic capacity
  > GitLab → GitHub migration: 70% faster deployments
  > Ephemeral PR-based review environments introduced
  > Cru AI agent infra & deployment orchestration

[2023-11 → 2024-05] CertiK :: Sr. Platform Engineer
  > AWS service review: 15% cost savings identified & implemented
  > IAM hardening, vulnerability remediation
  > Vendor contract negotiations

[2022-01 → 2023-11] TS Imagine :: Cloud DevOps / SWE
  > GCP migration POC: 20% efficiency ↑, 30% cost ↓
  > Jenkins end-to-end CI/CD pipelines
  > Docker Swarm → GKE migration
  > Prometheus + Grafana observability stack built from scratch

[2019-09 → 2021-12] TS Imagine :: Site Reliability Engineer
  > Production redesign for site-awareness: 70% faster failover
  > Proactive monitoring & alerting system (Python)
  > Docker Swarm across dev/UAT/prod

[2017-04 → 2019-09] FIS :: Derivatives Analyst → Programmer Analyst
  > L2/L3 trading system support, ITRS Geneos alerting
  > Oracle PL/SQL data models & ACBS suite development`,
  };

  /* ── Command definitions ── */
  function makeCommands(addLine, printLines, dtBody, dtInput) {
    function deploy() {
      dtInput.disabled = true;
      const steps = [
        { cls: "dt-cmd", text: "$ deploy --env prod --tag latest", d: 0 },
        {
          cls: "dt-dim",
          text: "  Connecting to GitHub Actions runner...",
          d: 500,
        },
        {
          cls: "dt-dim",
          text: "  ─────────────────────────────────────",
          d: 300,
        },
        {
          cls: "dt-info",
          text: "  ❯ lint                   running...",
          d: 600,
        },
        { cls: "dt-ok", text: "  ✓ lint          passed    1.2s", d: 900 },
        {
          cls: "dt-info",
          text: "  ❯ unit-tests              running...",
          d: 500,
        },
        { cls: "dt-ok", text: "  ✓ unit-tests    487/487   44s", d: 1300 },
        {
          cls: "dt-info",
          text: "  ❯ docker build            running...",
          d: 700,
        },
        { cls: "dt-ok", text: "  ✓ docker build  done      58s", d: 1500 },
        {
          cls: "dt-info",
          text: "  ❯ push → ECR              running...",
          d: 600,
        },
        { cls: "dt-ok", text: "  ✓ pushed                  19s", d: 1000 },
        {
          cls: "dt-info",
          text: "  ❯ kubectl rollout         running...",
          d: 800,
        },
        { cls: "dt-ok", text: "  ✓ rollout complete        32s", d: 1800 },
        {
          cls: "dt-dim",
          text: "  ─────────────────────────────────────",
          d: 300,
        },
        {
          cls: "dt-live",
          text: "  🚀  v2.4.1 → prod  |  0s downtime  |  SLO: 99.98%",
          d: 600,
        },
        { cls: "dt-ok", text: "  ✓  all 6 pods healthy", d: 400 },
        { cls: "dt-blank", text: "", d: 300 },
      ];
      let acc = 0;
      steps.forEach(({ cls, text, d }) => {
        acc += d;
        setTimeout(() => {
          addLine(cls, text);
          dtBody.scrollTop = dtBody.scrollHeight;
        }, acc);
      });
      setTimeout(() => {
        dtInput.disabled = false;
        dtInput.focus();
      }, acc + 300);
    }

    return {
      help: () =>
        printLines([
          { cls: "dt-bright", text: "PALASH@PORTFOLIO — AVAILABLE COMMANDS" },
          {
            cls: "dt-dim",
            text: "─────────────────────────────────────────────────────────────",
          },
          { cls: "dt-ok", text: "  ls                     List files" },
          {
            cls: "dt-ok",
            text: "  cat <file>             Print file (try: cat experience.log)",
          },
          { cls: "dt-ok", text: "  whoami                 About Palash" },
          { cls: "dt-ok", text: "  pwd / env / uptime     System info" },
          { cls: "dt-dim", text: "" },
          { cls: "dt-key", text: "  ── Infrastructure ──" },
          {
            cls: "dt-ok",
            text: "  kubectl get pods        K8s cluster status",
          },
          { cls: "dt-ok", text: "  kubectl get nodes       Node info" },
          {
            cls: "dt-ok",
            text: "  docker ps               Running containers",
          },
          { cls: "dt-ok", text: "  terraform plan          Show infra plan" },
          {
            cls: "dt-ok",
            text: "  terraform apply         Apply infra changes",
          },
          { cls: "dt-ok", text: "  ps aux                  Running processes" },
          { cls: "dt-dim", text: "" },
          { cls: "dt-key", text: "  ── Workflows ──" },
          {
            cls: "dt-ok",
            text: "  deploy prod             Full CI/CD pipeline \uD83D\uDE80",
          },
          {
            cls: "dt-ok",
            text: "  incident                Simulate an incident",
          },
          {
            cls: "dt-ok",
            text: "  pager                   On-call alert simulation",
          },
          { cls: "dt-ok", text: "  git log                 Career git log" },
          { cls: "dt-ok", text: "  ssh contact             Contact info" },
          { cls: "dt-dim", text: "" },
          { cls: "dt-key", text: "  ── Fun ──" },
          {
            cls: "dt-ok",
            text: "  top                     Skill utilization stats",
          },
          {
            cls: "dt-ok",
            text: "  neofetch                System/profile info",
          },
          { cls: "dt-ok", text: "  history                 Command history" },
          { cls: "dt-ok", text: "  ping google.com         Network (fun)" },
          { cls: "dt-ok", text: "  curl ifconfig.me        IP lookup" },
          { cls: "dt-dim", text: "" },
          {
            cls: "dt-ok",
            text: "  clear / exit            Clear or return to GUI",
          },
          {
            cls: "dt-dim",
            text: "─────────────────────────────────────────────────────────────",
          },
          { cls: "dt-blank", text: "" },
        ]),

      ls: () =>
        printLines([
          {
            cls: "dt-file",
            text: "about.md       skills.yaml    experience.log    contact.env",
          },
          { cls: "dt-dir", text: "projects/      certs/" },
          { cls: "dt-blank", text: "" },
        ]),

      pwd: () =>
        printLines([
          { cls: "dt-info", text: "/home/palash/portfolio" },
          { cls: "dt-blank", text: "" },
        ]),

      whoami: () =>
        printLines([
          { cls: "dt-bright", text: "  palash" },
          {
            cls: "dt-info",
            text: "  uid=2024(palash) gid=platform groups=devops,sre,cloud,security",
          },
          { cls: "dt-info", text: "  role=Head of Platform @ Constrafor" },
          { cls: "dt-info", text: "  location=New York, USA" },
          { cls: "dt-ok", text: "  status=open_to_opportunities=true" },
          { cls: "dt-blank", text: "" },
        ]),

      uptime: () =>
        printLines([
          {
            cls: "dt-info",
            text: "  09:00  up 9 years 2 months,  6 employers,  load avg: 0.00 downtime",
          },
          { cls: "dt-blank", text: "" },
        ]),

      env: () =>
        printLines([
          { cls: "dt-env", text: 'ROLE="Head of Platform"' },
          { cls: "dt-env", text: 'CLOUD="AWS,GCP"' },
          { cls: "dt-env", text: 'ORCHESTRATION="Kubernetes"' },
          { cls: "dt-env", text: 'CI_CD="GitHub Actions,Jenkins,Spinnaker"' },
          {
            cls: "dt-env",
            text: 'OBSERVABILITY="Datadog,Prometheus,Grafana,ELK"',
          },
          { cls: "dt-env", text: 'COMPLIANCE="SOC2_TYPE_II=achieved"' },
          { cls: "dt-env", text: 'AWS_COST_REDUCTION="50%"' },
          { cls: "dt-env", text: 'DEPLOY_SPEEDUP="70%"' },
          { cls: "dt-env", text: 'TRAFFIC_SCALE="5x"' },
          { cls: "dt-env", text: 'OPEN_TO_WORK="true"' },
          { cls: "dt-blank", text: "" },
        ]),

      top: () =>
        printLines([
          { cls: "dt-bright", text: "  palash@platform — skill utilization" },
          { cls: "dt-dim", text: "  ────────────────────────────────────────" },
          { cls: "dt-ok", text: "  AWS / Cloud     ████████████████░░  90%" },
          { cls: "dt-ok", text: "  Kubernetes      ██████████████░░░░  82%" },
          { cls: "dt-ok", text: "  CI/CD           ███████████████░░░  86%" },
          { cls: "dt-info", text: "  Terraform       ████████████░░░░░░  72%" },
          { cls: "dt-ok", text: "  Observability   █████████████░░░░░  78%" },
          { cls: "dt-info", text: "  Security/SOC2   ████████████░░░░░░  70%" },
          { cls: "dt-info", text: "  Leadership      █████████████░░░░░  78%" },
          { cls: "dt-info", text: "  Python          ███████████░░░░░░░  65%" },
          { cls: "dt-dim", text: "  ────────────────────────────────────────" },
          {
            cls: "dt-ok",
            text: "  uptime: 9y 2m | incidents resolved: many | downtime caused: 0s",
          },
          { cls: "dt-blank", text: "" },
        ]),

      "ssh contact": () =>
        printLines([
          {
            cls: "dt-dim",
            text: "  Establishing connection to palash@contact...",
          },
          { cls: "dt-ok", text: "  ✓ Connected — RSA 4096-bit" },
          { cls: "dt-blank", text: "" },
          {
            cls: "dt-bright",
            text: "  ┌─────────────────────────────────────────┐",
          },
          {
            cls: "dt-bright",
            text: "  │  EMAIL     srivastavapalash0@gmail.com  │",
          },
          {
            cls: "dt-bright",
            text: "  │  PHONE     +1 (571) 236-0145            │",
          },
          {
            cls: "dt-bright",
            text: "  │  LINKEDIN  srivastavapalash             │",
          },
          {
            cls: "dt-bright",
            text: "  │  GITHUB    srivastava-palash            │",
          },
          {
            cls: "dt-bright",
            text: "  │  CITY      New York, USA                │",
          },
          {
            cls: "dt-live",
            text: "  │  STATUS    open to opportunities ✓      │",
          },
          {
            cls: "dt-bright",
            text: "  └─────────────────────────────────────────┘",
          },
          { cls: "dt-blank", text: "" },
        ]),

      "kubectl get pods": () =>
        printLines([
          {
            cls: "dt-bright",
            text: "  NAME                       READY   STATUS      RESTARTS   AGE",
          },
          {
            cls: "dt-dim",
            text: "  ──────────────────────────────────────────────────────────────",
          },
          {
            cls: "dt-ok",
            text: "  api-7d4f9b-xk2pq           1/1     Running     0          9y",
          },
          {
            cls: "dt-ok",
            text: "  api-8c2a1e-mn4rs            1/1     Running     0          9y",
          },
          {
            cls: "dt-ok",
            text: "  api-1e9b3f-pq8vw            1/1     Running     0          9y",
          },
          {
            cls: "dt-ok",
            text: "  worker-3f1c-jk7yt           1/1     Running     0          7y",
          },
          {
            cls: "dt-ok",
            text: "  worker-9d4e-bx3mz           1/1     Running     0          7y",
          },
          {
            cls: "dt-info",
            text: "  sre-mode-x92k-zap           1/1     Running     0          5y",
          },
          {
            cls: "dt-ok",
            text: "  certik-audit-f47b            0/1     Completed   0          2y",
          },
          { cls: "dt-blank", text: "" },
          {
            cls: "dt-ok",
            text: "  6/6 pods healthy  |  namespace: palash-prod",
          },
          { cls: "dt-blank", text: "" },
        ]),

      "kubectl get nodes": () =>
        printLines([
          {
            cls: "dt-bright",
            text: "  NAME            STATUS   ROLES           AGE   VERSION   OS",
          },
          {
            cls: "dt-dim",
            text: "  ─────────────────────────────────────────────────────────────",
          },
          {
            cls: "dt-ok",
            text: "  aws-master-1    Ready    control-plane   9y    v1.29.0   linux",
          },
          {
            cls: "dt-ok",
            text: "  gcp-worker-1    Ready    worker          7y    v1.29.0   linux",
          },
          {
            cls: "dt-ok",
            text: "  gcp-worker-2    Ready    worker          7y    v1.29.0   linux",
          },
          {
            cls: "dt-info",
            text: "  fis-node-1      Ready    legacy          9y    v1.12.0   linux",
          },
          { cls: "dt-blank", text: "" },
        ]),

      "docker ps": () =>
        printLines([
          {
            cls: "dt-bright",
            text: "  CONTAINER ID   IMAGE                        STATUS          PORTS",
          },
          {
            cls: "dt-dim",
            text: "  ────────────────────────────────────────────────────────────────────",
          },
          {
            cls: "dt-ok",
            text: "  a7f3c2e8b1d9   constrafor/api:v2.4.1        Up 31 days       8080/tcp",
          },
          {
            cls: "dt-ok",
            text: "  b4e9d1f7c3a2   constrafor/worker:v2.4.1     Up 31 days       -",
          },
          {
            cls: "dt-info",
            text: "  9c2a8e3f1b7d   prom/prometheus:latest       Up 9 years       9090/tcp",
          },
          {
            cls: "dt-info",
            text: "  d6b5f4e2a8c1   grafana/grafana:latest       Up 9 years       3000/tcp",
          },
          {
            cls: "dt-info",
            text: "  3f7a9c4e2b8d   datadog/agent:7              Up 9 years       -",
          },
          { cls: "dt-blank", text: "" },
        ]),

      "git log": () =>
        printLines([
          {
            cls: "dt-bright",
            text: "  commit a3f9c1e4 (HEAD -> main, origin/main)",
          },
          {
            cls: "dt-info",
            text: "  Author: Palash Srivastava <srivastavapalash0@gmail.com>",
          },
          { cls: "dt-info", text: "  Date:   Jun 2024 — present" },
          {
            cls: "dt-ok",
            text: "    feat: head-of-platform @constrafor — SOC2, 50% cost ↓, 5× scale",
          },
          { cls: "dt-blank", text: "" },
          { cls: "dt-bright", text: "  commit b2e8d4f3" },
          { cls: "dt-info", text: "  Date:   Nov 2023 — May 2024" },
          {
            cls: "dt-ok",
            text: "    feat: sr-platform-engineer @certik — 15% AWS cost ↓, security",
          },
          { cls: "dt-blank", text: "" },
          { cls: "dt-bright", text: "  commit c1d7a3e2" },
          { cls: "dt-info", text: "  Date:   Jan 2022 — Nov 2023" },
          {
            cls: "dt-ok",
            text: "    feat: cloud-devops @ts-imagine — GCP, GKE, Jenkins pipelines",
          },
          { cls: "dt-blank", text: "" },
          { cls: "dt-bright", text: "  commit d0c6b2d1" },
          { cls: "dt-info", text: "  Date:   Sep 2019 — Dec 2021" },
          {
            cls: "dt-ok",
            text: "    feat: sre @ts-imagine — 70% faster failover, Docker Swarm",
          },
          { cls: "dt-blank", text: "" },
          { cls: "dt-bright", text: "  commit e9b5a1c0" },
          { cls: "dt-info", text: "  Date:   Apr 2017 — Sep 2019" },
          {
            cls: "dt-ok",
            text: "    feat: derivatives-analyst @fis — L2/L3, ITRS Geneos, PL/SQL",
          },
          { cls: "dt-blank", text: "" },
        ]),

      neofetch: () =>
        printLines([
          { cls: "dt-bright", text: "         .-.      palash@portfolio" },
          { cls: "dt-bright", text: "        (o_o)     -----------------" },
          {
            cls: "dt-info",
            text: "        (   )     OS: Platform Engineering v9.2",
          },
          { cls: "dt-info", text: "       / \\|/ \\    Host: New York, USA" },
          {
            cls: "dt-info",
            text: "              .   Shell: bash (Head of Platform)",
          },
          { cls: "dt-ok", text: "  Cloud:      AWS, GCP, Kubernetes" },
          { cls: "dt-ok", text: "  Infra:      Terraform, Docker, Helm" },
          { cls: "dt-ok", text: "  Observ:     Datadog, Prometheus, Grafana" },
          {
            cls: "dt-ok",
            text: "  CI/CD:      GitHub Actions, Jenkins, Spinnaker",
          },
          { cls: "dt-ok", text: "  Security:   SOC 2 Type II, IAM, RBAC" },
          {
            cls: "dt-dim",
            text: "  Uptime:     9y 2m  |  Incidents caused: 0",
          },
          { cls: "dt-live", text: "  Status:     open_to_opportunities=true" },
          { cls: "dt-blank", text: "" },
          {
            cls: "dt-ok",
            text: "  \u25a0\u25a0\u25a0 \u25a0\u25a0\u25a0 \u25a0\u25a0\u25a0 \u25a0\u25a0\u25a0 \u25a0\u25a0\u25a0 \u25a0\u25a0\u25a0 \u25a0\u25a0\u25a0 \u25a0\u25a0\u25a0",
          },
          { cls: "dt-blank", text: "" },
        ]),

      "terraform plan": () =>
        printLines([
          { cls: "dt-dim", text: "  Initializing the backend..." },
          {
            cls: "dt-ok",
            text: "  \u2713 Successfully configured the backend 'S3'",
          },
          { cls: "dt-dim", text: "  Refreshing state... done." },
          { cls: "dt-blank", text: "" },
          {
            cls: "dt-bright",
            text: "  Terraform will perform the following actions:",
          },
          { cls: "dt-blank", text: "" },
          {
            cls: "dt-ok",
            text: "  # aws_eks_node_group.platform will be updated",
          },
          {
            cls: "dt-info",
            text: '  ~ resource "aws_eks_node_group" "platform" {',
          },
          { cls: "dt-info", text: "      ~ desired_size = 3 -> 6" },
          { cls: "dt-info", text: "      ~ max_size     = 5 -> 10" },
          { cls: "dt-info", text: "    }" },
          { cls: "dt-blank", text: "" },
          {
            cls: "dt-ok",
            text: "  # aws_cloudwatch_metric_alarm.slo will be created",
          },
          {
            cls: "dt-info",
            text: '  + resource "aws_cloudwatch_metric_alarm" "slo" {',
          },
          {
            cls: "dt-info",
            text: '      + alarm_name    = "palash-slo-99.98"',
          },
          { cls: "dt-info", text: '      + threshold     = "0.02"' },
          { cls: "dt-info", text: "    }" },
          { cls: "dt-blank", text: "" },
          {
            cls: "dt-live",
            text: "  Plan: 1 to add, 1 to change, 0 to destroy.",
          },
          {
            cls: "dt-dim",
            text: "  Run 'terraform apply' to apply these changes.",
          },
          { cls: "dt-blank", text: "" },
        ]),

      "terraform apply": () =>
        printLines([
          { cls: "dt-info", text: "  Acquiring state lock... done." },
          {
            cls: "dt-ok",
            text: "  aws_cloudwatch_metric_alarm.slo: Creating...",
          },
          {
            cls: "dt-ok",
            text: "  aws_cloudwatch_metric_alarm.slo: Creation complete after 3s",
          },
          { cls: "dt-ok", text: "  aws_eks_node_group.platform: Modifying..." },
          {
            cls: "dt-ok",
            text: "  aws_eks_node_group.platform: Modifications complete after 87s",
          },
          { cls: "dt-blank", text: "" },
          {
            cls: "dt-live",
            text: "  Apply complete! Resources: 1 added, 1 changed, 0 destroyed.",
          },
          { cls: "dt-blank", text: "" },
        ]),

      incident: () =>
        printLines([
          {
            cls: "dt-err",
            text: "  \ud83d\udea8  INCIDENT ALERT  \ud83d\udea8",
          },
          { cls: "dt-dim", text: "  ─────────────────────────────────────" },
          { cls: "dt-err", text: "  SEV-2 | api-7d4f9b: elevated 5xx rate" },
          { cls: "dt-dim", text: "  Triggered: 2m ago  |  Responder: palash" },
          { cls: "dt-blank", text: "" },
          { cls: "dt-info", text: "  > Checking pod logs..." },
          {
            cls: "dt-ok",
            text: "  > Root cause: bad deploy (v2.3.9) — throttling DB",
          },
          { cls: "dt-info", text: "  > Rolling back to v2.3.8..." },
          {
            cls: "dt-ok",
            text: "  > Rollback complete  |  5xx rate: 0.00%  |  MTTR: 4m12s",
          },
          { cls: "dt-blank", text: "" },
          {
            cls: "dt-live",
            text: "  Incident RESOLVED. SLO impact: 0.001% budget burn.",
          },
          { cls: "dt-blank", text: "" },
        ]),

      pager: () =>
        printLines([
          { cls: "dt-err", text: "  \ud83d\udcdf  PAGER ALERT at 3:47 AM" },
          {
            cls: "dt-err",
            text: "  High CPU on prod-worker-3  |  threshold: 90%  |  actual: 97%",
          },
          { cls: "dt-dim", text: "  ... responding ..." },
          { cls: "dt-ok", text: "  > Scaled worker pool from 3 to 5 nodes" },
          { cls: "dt-ok", text: "  > CPU normalized in 2m 33s" },
          {
            cls: "dt-dim",
            text: "  > Back to sleep. SLO maintained. \ud83e\uddd0",
          },
          { cls: "dt-blank", text: "" },
        ]),

      history: () => {
        const hist = cmdHistory.length
          ? cmdHistory.slice().reverse()
          : ["(no commands yet)"];
        printLines(
          hist.map((h, i) => ({
            cls: "dt-dim",
            text: `  ${String(i + 1).padStart(4, " ")}  ${h}`,
          })),
        );
        printLines([{ cls: "dt-blank", text: "" }]);
      },

      "ps aux": () =>
        printLines([
          { cls: "dt-bright", text: "  USER       PID %CPU %MEM COMMAND" },
          {
            cls: "dt-ok",
            text: "  palash       1  0.0  0.1 platform-engineer",
          },
          { cls: "dt-ok", text: "  palash      42  9.2  2.4 terraform-plan" },
          { cls: "dt-info", text: "  palash     187  0.0  0.0 datadog-agent" },
          { cls: "dt-info", text: "  palash     291  0.0  0.0 kubectl-watch" },
          {
            cls: "dt-dim",
            text: "  palash     999  0.0  0.0 sleep (nights + weekends)",
          },
          { cls: "dt-blank", text: "" },
        ]),

      "curl ifconfig.me": () =>
        printLines([
          { cls: "dt-info", text: "  104.21.47.x  (New York, USA)" },
          { cls: "dt-blank", text: "" },
        ]),

      "deploy prod": deploy,
      deploy: deploy,
      "./deploy.sh": deploy,
      "make deploy": deploy,
    };
  }

  /* ── Terminal state ── */
  let dtBody, dtInput;
  let cmdHistory = [];
  let historyIdx = -1;
  let CMDS_CACHE = null; // lazily built once after terminal opens
  function getCMDS() {
    if (!CMDS_CACHE)
      CMDS_CACHE = makeCommands(addLine, printLines, dtBody, dtInput);
    return CMDS_CACHE;
  }

  function addLine(cls, text) {
    const d = document.createElement("span");
    d.className = `dt-line ${cls}`;
    d.textContent = text;
    dtBody.appendChild(d);
    dtBody.scrollTop = dtBody.scrollHeight;
    return d;
  }

  function printLines(lines) {
    lines.forEach((l, i) => {
      setTimeout(() => {
        addLine(l.cls, l.text);
        dtBody.scrollTop = dtBody.scrollHeight;
      }, i * 22);
    });
  }

  function printFile(key) {
    const FDATA = {
      "about.md": {
        lines: () =>
          FILES["about.md"].split("\n").map((l) => ({
            cls: l.startsWith("#")
              ? "dt-bright"
              : l.match(/^[A-Z]+\s*:/)
                ? "dt-key"
                : l.trim() === ""
                  ? "dt-blank"
                  : "dt-info",
            text: l,
          })),
      },
      "skills.yaml": {
        lines: () =>
          FILES["skills.yaml"].split("\n").map((l) => ({
            cls: /^\w.*:$/.test(l.trim())
              ? "dt-key"
              : l.startsWith("  -")
                ? "dt-info"
                : l.trim() === ""
                  ? "dt-blank"
                  : "dt-dim",
            text: l,
          })),
      },
      "contact.env": {
        lines: () =>
          FILES["contact.env"].split("\n").map((l) => ({
            cls: l.includes("=") ? "dt-env" : "dt-dim",
            text: l,
          })),
      },
      "experience.log": {
        lines: () =>
          FILES["experience.log"].split("\n").map((l) => ({
            cls: l.startsWith("[")
              ? "dt-ok"
              : l.startsWith("  >")
                ? "dt-info"
                : l.trim() === ""
                  ? "dt-blank"
                  : "dt-dim",
            text: l,
          })),
      },
    };
    if (FDATA[key]) {
      printLines(FDATA[key].lines());
      printLines([{ cls: "dt-blank", text: "" }]);
    } else {
      addLine("dt-err", `  cat: ${key}: No such file or directory`);
      addLine("dt-dim", "  Try: ls");
    }
  }

  function handle(raw) {
    const cmd = raw.trim();
    if (!cmd) return;
    cmdHistory.unshift(cmd);
    historyIdx = -1;

    const lc = cmd.toLowerCase();

    // Echo
    addLine("dt-cmd", PROMPT_STR + cmd);

    if (lc === "clear" || lc === "cls") {
      dtBody.innerHTML = "";
      return;
    }

    if (lc === "exit" || lc === "quit" || lc === "gui" || lc === "open gui") {
      addLine("dt-dim", "  Unloading terminal mode...");
      setTimeout(() => {
        const dt = document.getElementById("devops-terminal");
        dt.classList.add("dt-exit");
        document.body.style.overflow = "";
        setTimeout(() => dt.classList.add("hidden"), 400);
      }, 500);
      return;
    }

    // cat <file>
    const catM = lc.match(/^cat\s+(.+)$/);
    if (catM) {
      printFile(catM[1].replace(/^\.\//, ""));
      return;
    }

    // kubectl
    const kubM = lc.match(/^kubectl\s+(.+)$/);
    if (kubM) {
      const sub = "kubectl " + kubM[1];
      const CMDS = getCMDS();
      if (CMDS[sub]) {
        CMDS[sub]();
        return;
      }
      addLine("dt-err", `  error: unknown kubectl command: ${kubM[1]}`);
      return;
    }

    // terraform subcommands
    const tfM = lc.match(/^terraform\s+(.+)$/);
    if (tfM) {
      const sub = "terraform " + tfM[1];
      const CMDS = getCMDS();
      if (CMDS[sub]) {
        CMDS[sub]();
        return;
      }
      addLine(
        "dt-err",
        `  Error: No subcommand found for 'terraform ${tfM[1]}'`,
      );
      addLine("dt-dim", "  Try: terraform plan  |  terraform apply");
      addLine("dt-blank", "");
      return;
    }

    // deploy
    if (
      lc === "deploy prod" ||
      lc === "deploy" ||
      lc === "./deploy.sh" ||
      lc === "make deploy"
    ) {
      const CMDS = getCMDS();
      CMDS["deploy prod"]();
      return;
    }

    // Standard commands
    const CMDS = getCMDS();
    if (CMDS[lc]) {
      CMDS[lc]();
      return;
    }

    // Easter eggs
    if (lc === "sudo rm -rf /" || lc === "rm -rf /") {
      addLine("dt-err", "  Permission denied. (Nice try 😏)");
      addLine("dt-blank", "");
      return;
    }
    if (lc === "vim" || lc === "vi") {
      addLine(
        "dt-ok",
        "  Opening vim... just kidding. Type 'exit' and I'll spare you.",
      );
      addLine("dt-blank", "");
      return;
    }
    if (lc === "ping google.com") {
      printLines([
        { cls: "dt-info", text: "  PING google.com: 56 bytes of data" },
        {
          cls: "dt-ok",
          text: "  64 bytes from 142.250.80.46: icmp_seq=1 ttl=117 time=4.7 ms",
        },
        {
          cls: "dt-ok",
          text: "  64 bytes from 142.250.80.46: icmp_seq=2 ttl=117 time=4.2 ms",
        },
        { cls: "dt-dim", text: "  ^C  2 packets sent, 2 received, 0% loss" },
        { cls: "dt-blank", text: "" },
      ]);
      return;
    }
    if (lc === "hello" || lc === "hi") {
      addLine("dt-ok", "  Hello! I'm Palash. Type 'help' to explore.");
      addLine("dt-blank", "");
      return;
    }
    if (lc === "date") {
      addLine("dt-info", "  " + new Date().toUTCString());
      addLine("dt-blank", "");
      return;
    }

    addLine("dt-err", `  command not found: ${cmd}`);
    addLine("dt-dim", "  Type 'help' for a list of commands.");
    addLine("dt-blank", "");
  }

  function open() {
    const terminal = document.getElementById("devops-terminal");
    dtBody = document.getElementById("dt-body");
    dtInput = document.getElementById("dt-input");
    if (!terminal) return;

    terminal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
    dtBody.innerHTML = "";

    setTimeout(() => {
      printLines([
        {
          cls: "dt-bright",
          text: "┌──────────────────────────────────────────────────────────┐",
        },
        {
          cls: "dt-bright",
          text: "│   PALASH SRIVASTAVA :: PORTFOLIO TERMINAL   v2.4.1        │",
        },
        {
          cls: "dt-bright",
          text: "│   Platform Engineer · DevOps · SRE                        │",
        },
        {
          cls: "dt-bright",
          text: "└──────────────────────────────────────────────────────────┘",
        },
        { cls: "dt-blank", text: "" },
        {
          cls: "dt-info",
          text: "  You chose DevOps Mode. Navigate this portfolio like a pro.",
        },
        {
          cls: "dt-info",
          text: "  Real commands. Real output. Zero YAML headaches.",
        },
        { cls: "dt-blank", text: "" },
        {
          cls: "dt-dim",
          text: "  Quick start: type 'help'  |  switch back: type 'exit'",
        },
        { cls: "dt-blank", text: "" },
      ]);
      setTimeout(() => dtInput.focus(), 400);
    }, 200);

    // Input events
    dtInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const v = dtInput.value;
        dtInput.value = "";
        handle(v);
        dtBody.scrollTop = dtBody.scrollHeight;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        if (historyIdx < cmdHistory.length - 1) {
          historyIdx++;
          dtInput.value = cmdHistory[historyIdx];
        }
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (historyIdx > 0) {
          historyIdx--;
          dtInput.value = cmdHistory[historyIdx];
        } else {
          historyIdx = -1;
          dtInput.value = "";
        }
      }
    });

    // Tab autocomplete (basic)
    dtInput.addEventListener("keydown", (e) => {
      if (e.key === "Tab") {
        e.preventDefault();
        const v = dtInput.value.toLowerCase();
        const candidates = [
          "help",
          "ls",
          "pwd",
          "whoami",
          "cat about.md",
          "cat skills.yaml",
          "cat experience.log",
          "cat contact.env",
          "git log",
          "top",
          "env",
          "uptime",
          "ssh contact",
          "kubectl get pods",
          "kubectl get nodes",
          "docker ps",
          "deploy prod",
          "terraform plan",
          "terraform apply",
          "neofetch",
          "incident",
          "pager",
          "ps aux",
          "history",
          "curl ifconfig.me",
          "ping google.com",
          "clear",
          "exit",
        ];
        const match = candidates.find((c) => c.startsWith(v) && c !== v);
        if (match) dtInput.value = match;
      }
    });

    // Exit button
    document.getElementById("dt-exit")?.addEventListener("click", () => {
      terminal.classList.add("dt-exit");
      document.body.style.overflow = "";
      setTimeout(() => terminal.classList.add("hidden"), 400);
    });
  }

  return { open };
})();

/* ─────────────────────────────────────────
   3.  BOOTSTRAP
───────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  BootManager.run();
});

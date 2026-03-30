const lockScreen = document.getElementById("lock-screen");
const desktopShell = document.getElementById("desktop-shell");
const unlockButton = document.getElementById("unlock-button");
const menuTime = document.getElementById("menu-time");
const menuDate = document.getElementById("menu-date");
const lockTime = document.getElementById("lock-time");
const lockDate = document.getElementById("lock-date");
const windowLayer = document.getElementById("window-layer");
const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".nav");
const desktopThemeToggle = document.getElementById("desktop-theme-toggle");
const mobileThemeToggle = document.getElementById("mobile-theme-toggle");
const dockItems = document.querySelectorAll(".dock-item");
const windows = Array.from(document.querySelectorAll("[data-window]"));
const finderButtons = document.querySelectorAll("[data-finder-panel]");
const finderPanels = document.querySelectorAll("[data-finder-view]");
const terminalForm = document.getElementById("terminal-form");
const terminalInput = document.getElementById("terminal-input");
const terminalOutput = document.getElementById("terminal-output");

let highestZIndex = 20;
let dragState = null;

const isDesktopMode = () => window.innerWidth > 920;

const getSavedTheme = () => localStorage.getItem("portfolio-theme") || "dark";

const applyTheme = (theme) => {
  document.body.classList.toggle("light-theme", theme === "light");
  const nextAction = theme === "light" ? "Switch to dark theme" : "Switch to light theme";
  [desktopThemeToggle, mobileThemeToggle].forEach((toggle) => {
    if (!toggle) return;
    toggle.setAttribute("aria-label", nextAction);
    toggle.setAttribute("title", nextAction);
  });
};

const toggleTheme = () => {
  const nextTheme = document.body.classList.contains("light-theme") ? "dark" : "light";
  localStorage.setItem("portfolio-theme", nextTheme);
  applyTheme(nextTheme);
};

const setClock = () => {
  const now = new Date();
  const timeText = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const dateText = now.toLocaleDateString([], {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  const lockDateText = now.toLocaleDateString([], {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  if (menuTime) menuTime.textContent = timeText;
  if (menuDate) menuDate.textContent = dateText;
  if (lockTime) lockTime.textContent = timeText;
  if (lockDate) lockDate.textContent = lockDateText;
};

const syncDockState = () => {
  dockItems.forEach((item) => {
    const target = item.dataset.open;
    const targetWindow = document.getElementById(target);
    item.classList.toggle(
      "active",
      Boolean(targetWindow) && !targetWindow.classList.contains("hidden-window")
    );
  });
};

const focusWindow = (windowEl) => {
  highestZIndex += 1;
  windows.forEach((item) => item.classList.remove("is-focused"));
  windowEl.classList.add("is-focused");
  windowEl.style.zIndex = String(highestZIndex);
};

const openWindow = (windowId) => {
  const target = document.getElementById(windowId);
  if (!target) return;

  target.classList.remove("hidden-window");
  focusWindow(target);
  syncDockState();

  if (windowId === "terminal-window" && terminalInput) {
    window.setTimeout(() => terminalInput.focus(), 50);
  }
};

const closeWindow = (windowId) => {
  const target = document.getElementById(windowId);
  if (!target) return;

  target.classList.add("hidden-window");
  target.classList.remove("is-focused");
  syncDockState();
};

const toggleFinderPanel = (panelName) => {
  finderButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.finderPanel === panelName);
  });

  finderPanels.forEach((panel) => {
    panel.classList.toggle("is-active", panel.dataset.finderView === panelName);
  });
};

const startDesktop = () => {
  if (!lockScreen || !desktopShell) return;

  lockScreen.classList.add("hidden");
  desktopShell.classList.remove("hidden");
  syncDockState();
  windows.forEach((windowEl) => {
    if (!windowEl.classList.contains("hidden-window")) {
      focusWindow(windowEl);
    }
  });
};

const clampWindowPosition = (windowEl, nextLeft, nextTop) => {
  const stageBounds = windowLayer.getBoundingClientRect();
  const windowBounds = windowEl.getBoundingClientRect();

  const minLeft = 8;
  const minTop = 8;
  const maxLeft = stageBounds.width - windowBounds.width - 8;
  const maxTop = stageBounds.height - windowBounds.height - 8;

  return {
    left: Math.min(Math.max(nextLeft, minLeft), Math.max(minLeft, maxLeft)),
    top: Math.min(Math.max(nextTop, minTop), Math.max(minTop, maxTop)),
  };
};

const beginDrag = (event) => {
  if (!isDesktopMode()) return;

  const handle = event.target.closest("[data-drag-handle]");
  if (!handle) return;

  const windowEl = handle.closest("[data-window]");
  if (!windowEl || windowEl.classList.contains("hidden-window")) return;

  focusWindow(windowEl);

  const windowRect = windowEl.getBoundingClientRect();
  const layerRect = windowLayer.getBoundingClientRect();

  dragState = {
    windowEl,
    offsetX: event.clientX - windowRect.left,
    offsetY: event.clientY - windowRect.top,
    layerLeft: layerRect.left,
    layerTop: layerRect.top,
  };

  document.body.style.userSelect = "none";
};

const onDrag = (event) => {
  if (!dragState || !isDesktopMode()) return;

  const nextLeft = event.clientX - dragState.layerLeft - dragState.offsetX;
  const nextTop = event.clientY - dragState.layerTop - dragState.offsetY;
  const clamped = clampWindowPosition(dragState.windowEl, nextLeft, nextTop);

  dragState.windowEl.style.left = `${clamped.left}px`;
  dragState.windowEl.style.top = `${clamped.top}px`;
};

const endDrag = () => {
  dragState = null;
  document.body.style.userSelect = "";
};

const resetDesktopStateForMobile = () => {
  if (isDesktopMode()) return;
  endDrag();
};

const escapeHtml = (value) =>
  value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

const projectDirectory = [
  {
    slug: "rewear",
    name: "ReWear",
    summary: "Circular-fashion exchange platform with swap, redeem, and moderation flows.",
    windowId: "rewear-window",
    liveUrl: "projects/rewear.html",
    githubUrl: "https://github.com/anjalii40",
  },
  {
    slug: "primetrade",
    name: "PrimeTrade",
    summary: "Full-stack assessment build with JWT auth, RBAC, admin tools, and API docs.",
    windowId: "primetrade-window",
    liveUrl: "https://hiring-assessment-primetrade.vercel.app",
    githubUrl: "https://github.com/anjalii40/Hiring-Assessment---Primetrade",
  },
  {
    slug: "auction",
    name: "Live Auction",
    summary: "Realtime bidding flow with synchronized timers and event-driven UI feedback.",
    windowId: "auction-window",
    liveUrl: "projects/live-auction.html",
    githubUrl: "https://github.com/anjalii40",
  },
  {
    slug: "rating",
    name: "Content Rating",
    summary: "Go and PostgreSQL powered recommendation system for content scoring.",
    windowId: "rating-window",
    liveUrl: "projects/content-rating.html",
    githubUrl: "https://github.com/anjalii40",
  },
];

const appendTerminalLine = (content, { html = false, className = "" } = {}) => {
  if (!terminalOutput) return;

  const line = document.createElement("div");
  line.className = ["terminal-line", className].filter(Boolean).join(" ");

  if (html) {
    line.innerHTML = content;
  } else {
    line.textContent = content;
  }

  terminalOutput.appendChild(line);
  terminalOutput.scrollTop = terminalOutput.scrollHeight;
};

const renderProjectCard = (project) => `
  <div class="terminal-card">
    <div class="terminal-card-title">${project.name}</div>
    <div class="terminal-card-copy">${project.summary}</div>
    <div class="terminal-links">
      <button class="terminal-link" type="button" data-open="${project.windowId}">Open in Safari</button>
      <a class="terminal-link secondary" href="${project.liveUrl}" target="_blank" rel="noreferrer">Live link</a>
      <a class="terminal-link secondary" href="${project.githubUrl}" target="_blank" rel="noreferrer">GitHub</a>
    </div>
  </div>
`;

const terminalCommands = {
  help() {
    appendTerminalLine(
      'Available commands: <span class="terminal-accent">help</span>, <span class="terminal-accent">profile</span>, <span class="terminal-accent">contact</span>, <span class="terminal-accent">resume</span>, <span class="terminal-accent">project</span>, <span class="terminal-accent">clear</span>.',
      { html: true }
    );
    appendTerminalLine(
      'Use <span class="terminal-accent">project rewear</span> or <span class="terminal-accent">project primetrade</span> to jump directly to one case study.',
      { html: true }
    );
  },
  profile() {
    appendTerminalLine(
      `
        <div class="terminal-card">
          <div class="terminal-card-title">Anjali Prajapati</div>
          <div class="terminal-card-copy">Software developer focused on polished product experiences, clean backend architecture, and thoughtful full-stack execution.</div>
          <div class="terminal-links">
            <button class="terminal-link" type="button" data-open="profile-window">Open profile</button>
          </div>
        </div>
      `,
      { html: true }
    );
  },
  contact() {
    appendTerminalLine(
      `
        <div class="terminal-card">
          <div class="terminal-card-title">Contact options</div>
          <div class="terminal-card-copy">anjaliiprajapati04@gmail.com · Haridwar, India · Open to internships and software roles.</div>
          <div class="terminal-links">
            <button class="terminal-link" type="button" data-open="contact-window">Open contact</button>
            <button class="terminal-link secondary" type="button" data-open="mail-window">Open Mail</button>
            <button class="terminal-link secondary" type="button" data-open="chat-window">Open Chat</button>
            <a class="terminal-link secondary" href="mailto:anjaliiprajapati04@gmail.com">Email now</a>
          </div>
        </div>
      `,
      { html: true }
    );
  },
  resume() {
    appendTerminalLine(
      `
        <div class="terminal-card">
          <div class="terminal-card-title">Resume ready</div>
          <div class="terminal-card-copy">Open the Preview-style window or download the PDF directly.</div>
          <div class="terminal-links">
            <button class="terminal-link" type="button" data-open="resume-window">Open resume</button>
            <a class="terminal-link secondary" href="assets/Anjali_Prajapati_Resume.pdf" download>Download PDF</a>
          </div>
        </div>
      `,
      { html: true }
    );
  },
  project(args = []) {
    if (!args.length) {
      appendTerminalLine("Project directory:", { className: "terminal-command" });
      appendTerminalLine(projectDirectory.map(renderProjectCard).join(""), { html: true });
      return;
    }

    const query = args.join(" ");
    const project = projectDirectory.find(
      (item) => item.slug === query || item.name.toLowerCase().includes(query)
    );

    if (!project) {
      appendTerminalLine(`No project found for "${query}". Try "project" to see all options.`);
      return;
    }

    appendTerminalLine(renderProjectCard(project), { html: true });
  },
  clear() {
    if (!terminalOutput) return;
    terminalOutput.innerHTML = "";
  },
};

const handleTerminalCommand = (rawInput) => {
  const trimmedInput = rawInput.trim();
  if (!trimmedInput) return;

  appendTerminalLine(`anjali@portfolio ~ % ${escapeHtml(trimmedInput)}`, {
    html: true,
    className: "terminal-command",
  });

  const tokens = trimmedInput.toLowerCase().split(/\s+/);
  const [command, ...args] = tokens;

  if (command === "projects") {
    terminalCommands.project(args);
    return;
  }

  const handler = terminalCommands[command];
  if (handler) {
    handler(args);
    return;
  }

  appendTerminalLine(`zsh: command not found: ${trimmedInput}`);
};

setClock();
setInterval(setClock, 30000);
applyTheme(getSavedTheme());

if (unlockButton) {
  unlockButton.addEventListener("click", startDesktop);
}

if (menuToggle && nav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

if (desktopThemeToggle) {
  desktopThemeToggle.addEventListener("click", toggleTheme);
}

if (mobileThemeToggle) {
  mobileThemeToggle.addEventListener("click", toggleTheme);
}

finderButtons.forEach((button) => {
  button.addEventListener("click", () => toggleFinderPanel(button.dataset.finderPanel));
});

windows.forEach((windowEl) => {
  windowEl.addEventListener("mousedown", () => focusWindow(windowEl));
});

document.addEventListener("click", (event) => {
  const opener = event.target.closest("[data-open]");
  if (opener) {
    const targetId = opener.dataset.open;
    if (targetId) openWindow(targetId);
  }

  const control = event.target.closest("[data-action]");
  if (!control) return;

  const target = control.dataset.target;
  const action = control.dataset.action;

  if (action === "close" || action === "minimize") {
    closeWindow(target);
  }
});

if (terminalForm && terminalInput) {
  terminalForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const nextCommand = terminalInput.value;
    handleTerminalCommand(nextCommand);
    terminalInput.value = "";
  });
}

document.addEventListener("mousedown", beginDrag);
document.addEventListener("mousemove", onDrag);
document.addEventListener("mouseup", endDrag);
window.addEventListener("resize", resetDesktopStateForMobile);

toggleFinderPanel("featured");
syncDockState();

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
const desktopThemeLabel = document.getElementById("desktop-theme-label");
const mobileThemeLabel = document.getElementById("mobile-theme-label");
const dockItems = document.querySelectorAll(".dock-item");
const openTriggers = document.querySelectorAll("[data-open]");
const windows = Array.from(document.querySelectorAll("[data-window]"));
const finderButtons = document.querySelectorAll("[data-finder-panel]");
const finderPanels = document.querySelectorAll("[data-finder-view]");

let highestZIndex = 20;
let dragState = null;

const isDesktopMode = () => window.innerWidth > 920;

const getSavedTheme = () => localStorage.getItem("portfolio-theme") || "dark";

const applyTheme = (theme) => {
  document.body.classList.toggle("light-theme", theme === "light");

  if (desktopThemeLabel) {
    desktopThemeLabel.textContent = theme === "light" ? "Light" : "Dark";
  }

  if (mobileThemeLabel) {
    mobileThemeLabel.textContent = theme === "light" ? "Light" : "Dark";
  }
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

openTriggers.forEach((trigger) => {
  trigger.addEventListener("click", () => {
    const targetId = trigger.dataset.open;
    if (targetId) openWindow(targetId);
  });
});

finderButtons.forEach((button) => {
  button.addEventListener("click", () => toggleFinderPanel(button.dataset.finderPanel));
});

windows.forEach((windowEl) => {
  windowEl.addEventListener("mousedown", () => focusWindow(windowEl));
});

document.addEventListener("click", (event) => {
  const control = event.target.closest("[data-action]");
  if (!control) return;

  const target = control.dataset.target;
  const action = control.dataset.action;

  if (action === "close" || action === "minimize") {
    closeWindow(target);
  }
});

document.addEventListener("mousedown", beginDrag);
document.addEventListener("mousemove", onDrag);
document.addEventListener("mouseup", endDrag);
window.addEventListener("resize", resetDesktopStateForMobile);

toggleFinderPanel("profile");
syncDockState();

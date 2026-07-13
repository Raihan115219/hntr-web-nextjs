(function () {
  const MQ = window.matchMedia("(max-width: 900px)");
  let toggle = null;
  let backdrop = null;
  let bound = false;

  function isOpen() {
    return document.body.classList.contains("learn-sidebar-open");
  }

  function setOpen(open) {
    document.body.classList.toggle("learn-sidebar-open", open);
    if (!toggle || !backdrop) return;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    backdrop.setAttribute("aria-hidden", String(!open));
  }

  function bindNavClose() {
    document.querySelectorAll("aside nav a").forEach((link) => {
      link.addEventListener("click", () => {
        if (MQ.matches) setOpen(false);
      });
    });
  }

  function updateMode() {
    if (!toggle || !backdrop) return;
    if (!MQ.matches) {
      setOpen(false);
      toggle.hidden = true;
      backdrop.hidden = true;
      return;
    }
    toggle.hidden = false;
    backdrop.hidden = false;
  }

  function init() {
    const root = document.querySelector("div[data-theme]");
    const sidebar = document.querySelector("aside");
    if (!root || !sidebar) return;
    if (bound) {
      updateMode();
      return;
    }

    toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "learn-nav-toggle";
    toggle.setAttribute("aria-label", "Open navigation");
    toggle.setAttribute("aria-expanded", "false");
    toggle.innerHTML =
      '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M3 4.5h12M3 9h12M3 13.5h12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';
    document.body.appendChild(toggle);

    backdrop = document.createElement("div");
    backdrop.className = "learn-sidebar-backdrop";
    backdrop.setAttribute("aria-hidden", "true");
    document.body.appendChild(backdrop);

    toggle.addEventListener("click", () => setOpen(!isOpen()));
    backdrop.addEventListener("click", () => setOpen(false));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setOpen(false);
    });

    bindNavClose();
    MQ.addEventListener("change", updateMode);
    bound = true;
    updateMode();
  }

  function whenReady() {
    if (document.querySelector("div[data-theme] aside")) {
      init();
      return;
    }

    const observer = new MutationObserver(() => {
      if (document.querySelector("div[data-theme] aside")) {
        observer.disconnect();
        init();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", whenReady);
  } else {
    whenReady();
  }
})();

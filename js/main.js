// Instant, Zero-Flicker Custom Green Precision Ring Cursor
(function initCustomCursor() {
  if (typeof window === "undefined" || window.matchMedia("(pointer: coarse)").matches) return;

  // Restore stored mouse position across page transitions so cursor never blinks/disappears
  const savedX = parseFloat(sessionStorage.getItem("cursor_x"));
  const savedY = parseFloat(sessionStorage.getItem("cursor_y"));

  let mouseX = !isNaN(savedX) ? savedX : -100;
  let mouseY = !isNaN(savedY) ? savedY : -100;
  let cursorX = mouseX;
  let cursorY = mouseY;

  let cursor = null;

  function getOrCreateCursor() {
    if (!cursor) {
      cursor = document.getElementById("custom-precision-cursor");
    }
    if (!cursor && document.body) {
      cursor = document.createElement("div");
      cursor.id = "custom-precision-cursor";
      cursor.className = "custom-precision-cursor";
      if (!isNaN(savedX) && !isNaN(savedY)) {
        cursor.style.transform = `translate3d(${savedX}px, ${savedY}px, 0) translate(-50%, -50%)`;
      } else {
        cursor.style.opacity = "0";
      }
      document.body.appendChild(cursor);
    }
    return cursor;
  }

  // Create cursor as early as possible
  if (document.body) {
    getOrCreateCursor();
  } else {
    document.addEventListener("DOMContentLoaded", getOrCreateCursor);
  }

  window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    sessionStorage.setItem("cursor_x", mouseX);
    sessionStorage.setItem("cursor_y", mouseY);

    const el = getOrCreateCursor();
    if (el && el.style.opacity === "0") {
      el.style.opacity = "1";
    }
  }, { passive: true });

  window.addEventListener("beforeunload", () => {
    sessionStorage.setItem("cursor_x", mouseX);
    sessionStorage.setItem("cursor_y", mouseY);
  });

  // Fast, ultra-responsive physics tracking loop
  function render() {
    if (mouseX > -50 && mouseY > -50) {
      cursorX += (mouseX - cursorX) * 0.45;
      cursorY += (mouseY - cursorY) * 0.45;

      const el = getOrCreateCursor();
      if (el) {
        el.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;
      }
    }
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);

  // Hover & Active States
  const interactiveSelector = "a, button, input, select, textarea, [role='button'], .work-row, .sticker-opt, .qa-question, .travel-btn, .travel-action-btn, .copy-email-btn, .copy-email-trigger";

  document.addEventListener("mouseover", (e) => {
    if (e.target.closest && e.target.closest(interactiveSelector)) {
      if (document.body) document.body.classList.add("cursor-hover");
    }
  }, { passive: true });

  document.addEventListener("mouseout", (e) => {
    if (e.target.closest && e.target.closest(interactiveSelector)) {
      if (document.body) document.body.classList.remove("cursor-hover");
    }
  }, { passive: true });

  document.addEventListener("mousedown", () => {
    if (document.body) document.body.classList.add("cursor-active");
  });

  document.addEventListener("mouseup", () => {
    if (document.body) document.body.classList.remove("cursor-active");
  });
})();

// Highlights the current section link in a project page's sticky sidebar
// as the reader scrolls (project.html + friends).
document.addEventListener("DOMContentLoaded", () => {
  const tocLinks = document.querySelectorAll(".project-toc ol a");
  if (!tocLinks.length) return;

  const sections = [...tocLinks]
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  const setActive = (id) => {
    tocLinks.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries.filter((e) => e.isIntersecting);
      if (visible.length) setActive(visible[0].target.id);
    },
    { rootMargin: "-15% 0px -70% 0px", threshold: 0 }
  );

  sections.forEach((section) => observer.observe(section));
});

// Featured-work slider on the homepage: cycles through project swatches
// automatically and keeps the matching row in the list highlighted.
// Hovering a row jumps the slider to it and pauses autoplay.
document.addEventListener("DOMContentLoaded", () => {
  const rows = document.querySelectorAll(".work-row");
  const slides = document.querySelectorAll(".work-slide");
  if (!rows.length || !slides.length) return;

  let current = 0;
  let paused = false;

  const setActive = (index) => {
    current = index;
    rows.forEach((row) => row.classList.toggle("active", Number(row.dataset.index) === index));
    slides.forEach((slide) => slide.classList.toggle("active", Number(slide.dataset.index) === index));
  };

  const advance = () => {
    if (paused) return;
    setActive((current + 1) % slides.length);
  };

  const timer = setInterval(advance, 5000);

  rows.forEach((row) => {
    row.addEventListener("mouseenter", () => {
      paused = true;
      setActive(Number(row.dataset.index));
    });
    row.addEventListener("mouseleave", () => {
      paused = false;
    });
  });

  window.addEventListener("beforeunload", () => clearInterval(timer));
});

// Universal Copy-to-Clipboard Handler for Emails
document.addEventListener("DOMContentLoaded", () => {
  setupCopyEmailButtons();
  // Re-run setup after components loader renders header & footer
  setTimeout(setupCopyEmailButtons, 100);
});

function setupCopyEmailButtons() {
  const emailTriggers = document.querySelectorAll(".copy-email-btn, .copy-email-trigger, a[href^='mailto:']");

  emailTriggers.forEach((trigger) => {
    if (trigger.dataset.copyBound) return;
    trigger.dataset.copyBound = "true";

    const wrapper = trigger.closest(".copy-email-wrapper");
    const tooltip = wrapper ? wrapper.querySelector(".copy-tooltip") : null;

    trigger.addEventListener("click", (e) => {
      e.preventDefault();
      const email = trigger.getAttribute("data-email") || "justinfung.ca@gmail.com";

      copyToClipboard(email, () => {
        if (tooltip) {
          const originalText = tooltip.dataset.originalText || tooltip.textContent || "COPY TO CLIPBOARD";
          tooltip.dataset.originalText = originalText;
          tooltip.textContent = "COPIED TO CLIPBOARD";
          tooltip.classList.add("show");

          setTimeout(() => {
            tooltip.textContent = originalText;
            tooltip.classList.remove("show");
          }, 2000);
        } else {
          showCopyToast("COPIED TO CLIPBOARD");
        }
      });
    });
  });
}

function copyToClipboard(text, callback) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(callback).catch(() => {
      fallbackCopy(text, callback);
    });
  } else {
    fallbackCopy(text, callback);
  }
}

function fallbackCopy(text, cb) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  try {
    document.execCommand("copy");
    cb();
  } catch (err) {
    console.error("Copy failed:", err);
  }
  document.body.removeChild(textarea);
}

function showCopyToast(msg) {
  let toast = document.getElementById("copy-toast-notification");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "copy-toast-notification";
    toast.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: #18181b;
      color: #ffffff;
      font-family: var(--font-mono, monospace);
      font-size: 11px;
      font-weight: 500;
      padding: 8px 16px;
      border-radius: 6px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
      z-index: 9999;
      opacity: 0;
      transform: translateY(12px);
      transition: all 0.25s ease;
      pointer-events: none;
    `;
    document.body.appendChild(toast);
  }

  toast.textContent = msg;
  toast.style.opacity = "1";
  toast.style.transform = "translateY(0)";

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(12px)";
  }, 2200);
}

// Email Testimonial Carousel handler for case study pages
document.addEventListener("DOMContentLoaded", () => {
  const emailCards = document.querySelectorAll(".email-card");
  const dots = document.querySelectorAll(".carousel-dots .dot");
  const prevBtn = document.querySelector(".carousel-prev");
  const nextBtn = document.querySelector(".carousel-next");
  if (!emailCards.length) return;

  let currentIndex = 0;

  const showCard = (index) => {
    currentIndex = (index + emailCards.length) % emailCards.length;
    emailCards.forEach((card, i) => card.classList.toggle("active", i === currentIndex));
    dots.forEach((dot, i) => dot.classList.toggle("active", i === currentIndex));
  };

  if (prevBtn) prevBtn.addEventListener("click", () => showCard(currentIndex - 1));
  if (nextBtn) nextBtn.addEventListener("click", () => showCard(currentIndex + 1));
  dots.forEach((dot, i) => dot.addEventListener("click", () => showCard(i)));
});

// Interactive Feature Preview Widget tabs and dynamic category filtering
document.addEventListener("DOMContentLoaded", () => {
  const tabBtns = document.querySelectorAll(".preview-tabs .tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");
  if (!tabBtns.length) return;

  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetTab = btn.dataset.tab;
      tabBtns.forEach((b) => b.classList.toggle("active", b === btn));
      tabContents.forEach((c) => c.classList.toggle("active", c.id === `tab-${targetTab}`));
    });
  });

  // Category Chip Filter logic
  const categoryChips = document.querySelectorAll(".category-chip");
  const resourceCards = document.querySelectorAll(".mock-resource-card");

  categoryChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const filter = chip.dataset.filter;
      categoryChips.forEach((c) => c.classList.toggle("active", c === chip));

      resourceCards.forEach((card) => {
        if (filter === "all" || card.dataset.cat === filter) {
          card.classList.remove("hidden");
        } else {
          card.classList.add("hidden");
        }
      });
    });
  });
});

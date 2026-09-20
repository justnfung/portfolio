// Centralized Header and Footer Component Loader
// Edit this file to update the header navigation or footer across all portfolio pages!

document.addEventListener("DOMContentLoaded", () => {
  const isSubfolder = window.location.pathname.includes("/projects/") || window.location.pathname.includes("/resume/");
  const prefix = isSubfolder ? "../" : "";

  // Inject Favicon into head
  if (!document.querySelector("link[rel*='icon']")) {
    const faviconLink = document.createElement("link");
    faviconLink.rel = "icon";
    faviconLink.type = "image/svg+xml";
    faviconLink.href = `${prefix}favicon.svg`;
    document.head.appendChild(faviconLink);
  }

  // 1. Consolidated Header
  const headerContainer = document.getElementById("site-header");
  if (headerContainer) {
    const currentPath = window.location.pathname.split("/").pop() || "index.html";
    
    const isDesign = currentPath === "design.html";
    const isResume = currentPath === "resume.html" || window.location.pathname.includes("/resume");
    const isWork = !isDesign && !isResume && (currentPath === "index.html" || currentPath === "" || window.location.pathname.endsWith("/"));

    headerContainer.innerHTML = `
      <header class="site-header">
        <div class="wrap">
          <div class="site-id">
            <a href="${prefix}index.html" style="color: inherit; text-decoration: none;">
              <strong>JUSTIN FUNG</strong>
              <span>CS &amp; BUSINESS @ IVEY</span>
            </a>
          </div>
          <nav class="site-nav">
            <a href="${prefix}index.html" class="${isWork ? 'active' : ''}">Work</a>
            <a href="${prefix}design.html" class="${isDesign ? 'active' : ''}">Design</a>
            <a href="${prefix}resume.html" class="${isResume ? 'active' : ''}">Resume</a>
            <a href="https://linkedin.com/in/-justinfung" target="_blank" rel="noopener">LinkedIn</a>
            <a href="#" class="copy-email-trigger" data-email="justinfung.ca@gmail.com">Contact</a>
          </nav>
        </div>
      </header>
    `;
  }

  // 2. Consolidated Footer Bar
  const footerContainer = document.getElementById("site-footer");
  if (footerContainer) {
    footerContainer.innerHTML = `
      <footer class="site-footer">
        <div class="wrap footer-bar">
          <div class="footer-copy">
            <span>&copy; 2026 JUSTIN FUNG</span>
            <span class="footer-divider">&bull;</span>
            <span class="copy-email-wrapper">
              <button class="copy-email-btn footer-email-btn" data-email="justinfung.ca@gmail.com" type="button">
                justinfung.ca@gmail.com
              </button>
              <span class="copy-tooltip">COPY TO CLIPBOARD</span>
            </span>
          </div>
          <div class="footer-socials">
            <a href="https://linkedin.com/in/-justinfung" target="_blank" rel="noopener">LinkedIn</a>
            <a href="#" class="copy-email-trigger" data-email="justinfung.ca@gmail.com">Email</a>
          </div>
        </div>
      </footer>
    `;
  }
});

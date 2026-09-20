// Dynamic Design Gallery Image & Video Loader
// Supports manifest.json and live directory scraping

document.addEventListener("DOMContentLoaded", async () => {
  const sections = [
    { key: "feasibility", id: "grid-feasibility", folder: "media/design/feasibility", label: "PEELGOOD – BUSINESS 2257 SECTION WINNERS" },
    { key: "ssc", id: "grid-ssc", folder: "media/design/ssc", label: "@western.ssc" },
    { key: "freelance", id: "grid-freelance", folder: "media/design/freelance", label: "Freelance Designer" },
    { key: "oasis", id: "grid-oasis", folder: "media/design/oasis", label: "A fun sticker I made because I'm a huge Oasis fan" }
  ];

  const videoExts = [".mp4", ".webm", ".mov", ".ogg"];
  const imageExts = [".png", ".jpg", ".jpeg", ".webp", ".svg", ".gif"];
  const isVideoFile = (url) => videoExts.some(ext => url.toLowerCase().split("?")[0].split("#")[0].endsWith(ext));

  // Lightbox Viewer
  const lightbox = document.createElement("div");
  lightbox.className = "design-lightbox";
  lightbox.innerHTML = `
    <div class="lightbox-overlay"></div>
    <div class="lightbox-content">
      <img src="" alt="" class="lightbox-img" style="display:none;" />
      <video src="" class="lightbox-video" controls playsinline style="display:none;"></video>
      <button class="lightbox-close" aria-label="Close lightbox">&times;</button>
    </div>
  `;
  document.body.appendChild(lightbox);

  const lightboxImg = lightbox.querySelector(".lightbox-img");
  const lightboxVideo = lightbox.querySelector(".lightbox-video");
  const lightboxClose = lightbox.querySelector(".lightbox-close");
  const lightboxOverlay = lightbox.querySelector(".lightbox-overlay");

  let activeSourceVideo = null;

  function openLightbox(src, alt, sourceVideoEl = null) {
    // 1. Immediately activate lightbox modal so backdrop and blur render with 0ms delay
    lightbox.classList.add("active");
    document.body.style.overflow = "hidden";

    activeSourceVideo = sourceVideoEl;
    let resumeTime = 0;
    let shouldAutoPlay = false;

    if (sourceVideoEl) {
      resumeTime = sourceVideoEl.currentTime || 0;
      shouldAutoPlay = !sourceVideoEl.paused;
      sourceVideoEl.pause();
      const parent = sourceVideoEl.closest(".design-item");
      if (parent) parent.classList.remove("is-playing");
    }

    // Pause any other in-grid videos
    document.querySelectorAll("video").forEach(v => {
      if (v !== lightboxVideo && v !== sourceVideoEl) {
        v.pause();
        const parent = v.closest(".design-item");
        if (parent) parent.classList.remove("is-playing");
      }
    });

    if (isVideoFile(src)) {
      lightboxImg.style.display = "none";
      lightboxImg.src = "";
      
      const onMetadata = () => {
        lightboxVideo.currentTime = resumeTime;
        if (shouldAutoPlay || resumeTime > 0) {
          lightboxVideo.muted = false;
          lightboxVideo.play().catch(() => {});
        }
        lightboxVideo.removeEventListener("loadedmetadata", onMetadata);
      };
      lightboxVideo.addEventListener("loadedmetadata", onMetadata);

      lightboxVideo.src = src;
      lightboxVideo.muted = false;
      lightboxVideo.style.display = "block";
      
      // Attempt immediate seek/play if metadata is already available
      try {
        if (lightboxVideo.readyState >= 1) {
          lightboxVideo.currentTime = resumeTime;
          lightboxVideo.play().catch(() => {});
        }
      } catch (e) {}
    } else {
      lightboxVideo.style.display = "none";
      lightboxVideo.pause();
      lightboxVideo.src = "";
      lightboxImg.src = src;
      lightboxImg.alt = alt;
      lightboxImg.style.display = "block";
    }
  }

  function closeLightbox() {
    lightbox.classList.remove("active");
    if (activeSourceVideo) {
      const syncTime = lightboxVideo.currentTime || 0;
      const wasPlaying = !lightboxVideo.paused;
      try {
        activeSourceVideo.currentTime = syncTime;
        if (wasPlaying) {
          activeSourceVideo.muted = false;
          activeSourceVideo.play().catch(() => {});
          const parent = activeSourceVideo.closest(".design-item");
          if (parent) parent.classList.add("is-playing");
        }
      } catch (e) {}
      activeSourceVideo = null;
    }
    lightboxVideo.pause();
    lightboxVideo.src = "";
    lightboxImg.src = "";
    document.body.style.overflow = "";
  }

  lightboxClose.addEventListener("click", closeLightbox);
  lightboxOverlay.addEventListener("click", closeLightbox);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && lightbox.classList.contains("active")) {
      closeLightbox();
    }
  });

  // Setup video item with play & expand controls
  function setupVideoItem(itemDiv, videoEl, label) {
    if (itemDiv.dataset.videoBound) return;
    itemDiv.dataset.videoBound = "true";
    itemDiv.dataset.lightboxBound = "true";

    // Ensure play button exists
    let playBtn = itemDiv.querySelector(".video-play-btn");
    if (!playBtn) {
      playBtn = document.createElement("button");
      playBtn.className = "video-play-btn";
      playBtn.setAttribute("aria-label", "Play or pause video");
      playBtn.setAttribute("type", "button");
      playBtn.innerHTML = `
        <svg class="icon-play" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 3 20 12 6 21 6 3"/></svg>
        <svg class="icon-pause" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1.5"/><rect x="14" y="4" width="4" height="16" rx="1.5"/></svg>
      `;
      itemDiv.appendChild(playBtn);
    }

    // Ensure expand button exists
    let expandBtn = itemDiv.querySelector(".video-expand-btn");
    if (!expandBtn) {
      expandBtn = document.createElement("button");
      expandBtn.className = "video-expand-btn";
      expandBtn.setAttribute("aria-label", "Expand video");
      expandBtn.setAttribute("type", "button");
      expandBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>`;
      itemDiv.appendChild(expandBtn);
    }

    function togglePlay(e) {
      if (e) e.stopPropagation();
      if (videoEl.paused) {
        // Unmute audio upon user play
        videoEl.muted = false;
        videoEl.play().catch(() => {
          // Fallback if browser requires muted autoplay
          videoEl.muted = true;
          videoEl.play().catch(() => {});
        });
      } else {
        videoEl.pause();
      }
    }

    videoEl.addEventListener("play", () => itemDiv.classList.add("is-playing"));
    videoEl.addEventListener("pause", () => itemDiv.classList.remove("is-playing"));
    videoEl.addEventListener("ended", () => itemDiv.classList.remove("is-playing"));

    playBtn.addEventListener("click", togglePlay);
    videoEl.addEventListener("click", togglePlay);
    itemDiv.addEventListener("click", (e) => {
      if (e.target !== expandBtn && !expandBtn.contains(e.target)) {
        togglePlay(e);
      }
    });

    expandBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      openLightbox(videoEl.src, label || "Design video preview", videoEl);
    });
  }

  // Attach handlers to any pre-rendered items in HTML
  function attachExistingItemListeners() {
    document.querySelectorAll(".design-item").forEach(item => {
      const vid = item.querySelector("video");
      const img = item.querySelector("img");
      if (vid) {
        setupVideoItem(item, vid, "PeelGood Anatomy Video");
      } else if (img && !item.dataset.lightboxBound) {
        item.dataset.lightboxBound = "true";
        item.addEventListener("click", () => openLightbox(img.src, img.alt || "Design work"));
      }
    });
  }

  attachExistingItemListeners();

  // Sequential 1-N Media Discovery (probes 1.png, 2.jpg, 3.mp4, etc.)
  async function discoverSequentialMedia(folder) {
    const exts = [".png", ".jpg", ".jpeg", ".mp4", ".gif", ".webp", ".mov", ".svg"];
    const found = [];
    let consecutiveMisses = 0;
    const maxMisses = 2;
    const maxItems = 50;

    for (let i = 1; i <= maxItems; i++) {
      let matchedSrc = null;

      for (const ext of exts) {
        const testPath = `${folder}/${i}${ext}`;
        try {
          const res = await fetch(`${testPath}?t=${Date.now()}`, { method: "HEAD" });
          if (res.ok) {
            matchedSrc = testPath;
            break;
          }
        } catch (e) {
          // ignore
        }
      }

      if (matchedSrc) {
        found.push(matchedSrc);
        consecutiveMisses = 0;
      } else {
        consecutiveMisses++;
        if (consecutiveMisses >= maxMisses) {
          break;
        }
      }
    }
    return found;
  }

  for (const sec of sections) {
    const container = document.getElementById(sec.id);
    if (!container) continue;

    // Discover 1..N files sequentially
    const mediaList = await discoverSequentialMedia(sec.folder);

    // If numbered files were found, render them dynamically
    if (mediaList.length > 0) {
      container.innerHTML = "";
      mediaList.forEach((mediaSrc, idx) => {
        const itemDiv = document.createElement("div");
        itemDiv.className = "design-item";
        if (isVideoFile(mediaSrc)) {
          const videoEl = document.createElement("video");
          videoEl.src = mediaSrc;
          videoEl.loop = true;
          videoEl.muted = true;
          videoEl.playsInline = true;
          videoEl.preload = "metadata";
          itemDiv.appendChild(videoEl);
          setupVideoItem(itemDiv, videoEl, `${sec.label} - ${idx + 1}`);
        } else {
          itemDiv.innerHTML = `<img src="${mediaSrc}" alt="${sec.label} - ${idx + 1}" loading="lazy" />`;
          itemDiv.addEventListener("click", () => openLightbox(mediaSrc, `${sec.label} - ${idx + 1}`));
        }
        container.appendChild(itemDiv);
      });
    }
  }
});




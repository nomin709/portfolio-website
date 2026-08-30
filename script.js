const themeToggle = document.querySelector(".theme-toggle");

const applyTheme = (theme) => {
  const isDark = theme === "dark";
  document.body.classList.toggle("dark-theme", isDark);

  if (themeToggle) {
    themeToggle.setAttribute("aria-pressed", String(isDark));
    themeToggle.setAttribute("aria-label", isDark ? "Switch to light theme" : "Switch to dark theme");
  }

  try {
    localStorage.setItem("theme", theme);
  } catch (error) {
    // Ignore storage issues in restricted browsing contexts.
  }
};

const savedTheme = (() => {
  try {
    return localStorage.getItem("theme");
  } catch (error) {
    return null;
  }
})();

const preferredTheme = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
applyTheme(savedTheme || preferredTheme);

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const nextTheme = document.body.classList.contains("dark-theme") ? "light" : "dark";
    applyTheme(nextTheme);
  });
}

const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");

if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

const resumeCard = document.querySelector(".resume-card");
const resumeCollapse = document.querySelector(".resume-collapse");

if (resumeCard && resumeCollapse) {
  resumeCollapse.addEventListener("click", () => {
    const isCollapsed = resumeCard.classList.toggle("is-collapsed");
    resumeCollapse.setAttribute("aria-expanded", String(!isCollapsed));
    resumeCollapse.textContent = isCollapsed ? "View" : "Collapse";
  });
}

const projectCards = document.querySelectorAll(".case-study");
const projectModal = document.querySelector("#project-modal");
const projectModalType = document.querySelector("#project-modal-type");
const projectModalTitle = document.querySelector("#project-modal-title");
const projectModalVisual = document.querySelector("#project-modal-visual");
const projectModalSummary = document.querySelector("#project-modal-summary");
const projectModalDetails = document.querySelector("#project-modal-details");
const projectModalMeta = document.querySelector("#project-modal-meta");
const projectModalClose = document.querySelector(".project-modal-close");

const openProjectModal = (projectCard) => {
  const details = projectCard.querySelector(".project-details");
  const type = projectCard.querySelector(".project-type");
  const title = projectCard.querySelector("h2");
  const visual = projectCard.querySelector(".project-visual");
  const summary = projectCard.querySelector("p:not(.project-type)");
  const meta = projectCard.querySelector(".project-meta");

  if (!projectModal || !details || !type || !title || !visual || !summary || !meta) return;

  projectCards.forEach((card) => {
    const cardToggle = card.querySelector(".project-toggle");
    card.classList.toggle("is-open", card === projectCard);
    if (cardToggle) cardToggle.setAttribute("aria-expanded", String(card === projectCard));
  });

  projectModalType.textContent = type.textContent;
  projectModalTitle.textContent = title.textContent;
  projectModalSummary.textContent = summary.textContent.trim();
  projectModalVisual.replaceChildren(visual.cloneNode(true));
  projectModalDetails.replaceChildren(...Array.from(details.childNodes).map((node) => node.cloneNode(true)));
  projectModalMeta.replaceChildren(...Array.from(meta.childNodes).map((node) => node.cloneNode(true)));
  projectModal.hidden = false;
  document.body.classList.add("modal-open");
  projectModalClose.focus();
};

const closeProjectModal = () => {
  if (!projectModal) return;

  projectModal.hidden = true;
  document.body.classList.remove("modal-open");
  projectCards.forEach((card) => {
    const toggle = card.querySelector(".project-toggle");
    card.classList.remove("is-open");
    if (toggle) toggle.setAttribute("aria-expanded", "false");
  });
};

projectCards.forEach((projectCard) => {
  const toggle = projectCard.querySelector(".project-toggle");

  projectCard.addEventListener("click", (event) => {
    if (event.target.closest("a")) return;
    openProjectModal(projectCard);
  });

  if (toggle) {
    toggle.addEventListener("click", (event) => {
      event.stopPropagation();
      openProjectModal(projectCard);
    });
  }
});

if (window.location.hash && projectCards.length) {
  const selectedProject = document.querySelector(window.location.hash);

  if (selectedProject && selectedProject.classList.contains("case-study")) {
    openProjectModal(selectedProject);
  }
}

if (projectModal) {
  projectModal.addEventListener("click", (event) => {
    if (event.target.matches("[data-modal-close]")) {
      closeProjectModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !projectModal.hidden) {
      closeProjectModal();
    }
  });
}

const canvas = document.querySelector("#data-canvas");

if (canvas) {
  const ctx = canvas.getContext("2d");
  const points = [];
  const colors = ["#ffe26d", "#70a954", "#23b08d", "#e98245"];
  let width = 0;
  let height = 0;
  let animationFrame = 0;

  const resizeCanvas = () => {
    const ratio = window.devicePixelRatio || 1;
    width = canvas.offsetWidth;
    height = canvas.offsetHeight;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  };

  const seedPoints = () => {
    points.length = 0;
    const count = Math.max(42, Math.floor(width / 22));

    for (let index = 0; index < count; index += 1) {
      points.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius: Math.random() * 2.6 + 1.4,
        color: colors[index % colors.length],
      });
    }
  };

  const draw = () => {
    ctx.clearRect(0, 0, width, height);

    points.forEach((point, index) => {
      point.x += point.vx;
      point.y += point.vy;

      if (point.x < 0 || point.x > width) point.vx *= -1;
      if (point.y < 0 || point.y > height) point.vy *= -1;

      for (let nextIndex = index + 1; nextIndex < points.length; nextIndex += 1) {
        const nextPoint = points[nextIndex];
        const distance = Math.hypot(point.x - nextPoint.x, point.y - nextPoint.y);

        if (distance < 145) {
          ctx.beginPath();
          ctx.moveTo(point.x, point.y);
          ctx.lineTo(nextPoint.x, nextPoint.y);
          ctx.strokeStyle = `rgba(255, 255, 255, ${0.16 - distance / 1000})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      ctx.beginPath();
      ctx.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
      ctx.fillStyle = point.color;
      ctx.fill();
    });

    animationFrame = requestAnimationFrame(draw);
  };

  const reset = () => {
    cancelAnimationFrame(animationFrame);
    resizeCanvas();
    seedPoints();
    draw();
  };

  window.addEventListener("resize", reset);
  reset();
}

const featuredGrid = document.querySelector("[data-featured-source]");

if (featuredGrid) {
  const sourceUrl = featuredGrid.getAttribute("data-featured-source");

  fetch(sourceUrl)
    .then((response) => response.text())
    .then((html) => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const featured = Array.from(doc.querySelectorAll('[data-featured="true"]'));

      if (!featured.length) return;

      featuredGrid.replaceChildren(
        ...featured.map((article) => {
          const card = document.createElement("article");
          card.className = "project-card";

          const visual = article.querySelector(".project-visual");
          if (visual) card.appendChild(visual.cloneNode(true));

          const type = article.querySelector(".project-type");
          if (type) {
            const typeEl = document.createElement("p");
            typeEl.className = "project-type";
            typeEl.textContent = type.textContent;
            card.appendChild(typeEl);
          }

          const title = article.querySelector("h2");
          const titleEl = document.createElement("h3");
          titleEl.textContent = title ? title.textContent : "";
          card.appendChild(titleEl);

          const summary = article.querySelector("p:not(.project-type)");
          const summaryEl = document.createElement("p");
          summaryEl.textContent = summary ? summary.textContent.trim() : "";
          card.appendChild(summaryEl);

          card.addEventListener("click", () => openProjectModal(article));

          return card;
        })
      );
    })
    .catch(() => {
      // Fetch failed — keep the static fallback cards already in index.html.
    });
}
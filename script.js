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

/* =========================================================
   PROJECT MODAL & DATA RENDERING
========================================================= */

const projectModal = document.querySelector("#project-modal");
const projectModalType = document.querySelector("#project-modal-type");
const projectModalTitle = document.querySelector("#project-modal-title");
const projectModalVisual = document.querySelector("#project-modal-visual");
const projectModalSummary = document.querySelector("#project-modal-summary");
const projectModalDetails = document.querySelector("#project-modal-details");
const projectModalMeta = document.querySelector("#project-modal-meta");
const projectModalClose = document.querySelector(".project-modal-close");

function createVisualHTML(visual, title) {
  if (!visual) return '<div class="project-visual"></div>';
  if (visual.type === "image") {
    return `
      <div class="project-visual">
        <img src="${visual.src}" alt="${visual.alt || title}" loading="lazy" />
      </div>`;
  }
  if (visual.type === "forecast") {
    return `
      <div class="project-visual forecast">
        <span></span><span></span><span></span><span></span><span></span>
      </div>`;
  }
  if (visual.type === "cluster") {
    return `
      <div class="project-visual cluster">
        <span></span><span></span><span></span><span></span><span></span><span></span>
      </div>`;
  }
  if (visual.type === "nlp") {
    const tags = visual.tags || ["NLP", "Text", "ML"];
    return `
      <div class="project-visual nlp">
        ${tags.map(t => `<span>${t}</span>`).join("")}
      </div>`;
  }
  if (visual.type === "dashboard") {
    return `
      <div class="project-visual dashboard">
        <span></span><span></span><span></span><span></span>
      </div>`;
  }
  return '<div class="project-visual"></div>';
}

function openProjectModalData(project) {
  if (!projectModal) return;

  projectModalType.textContent = project.type;
  projectModalTitle.textContent = project.title;
  projectModalSummary.textContent = project.summary;
  projectModalVisual.innerHTML = createVisualHTML(project.visual, project.title);

  let detailsHTML = `<p>${project.details.overview}</p>`;
  if (project.details.problem || project.details.methods || project.details.outcome) {
    detailsHTML += `
      <ul class="detail-list">
        ${project.details.problem ? `<li><strong>Problem:</strong> ${project.details.problem}</li>` : ""}
        ${project.details.methods ? `<li><strong>Methods:</strong> ${project.details.methods}</li>` : ""}
        ${project.details.outcome ? `<li><strong>Outcome:</strong> ${project.details.outcome}</li>` : ""}
      </ul>`;
  }

  if (project.links && project.links.length > 0) {
    detailsHTML += `
      <p class="detail-links">
        ${project.links.map(l => `<a href="${l.url}" target="_blank" rel="noreferrer">${l.label}</a>`).join(" ")}
      </p>`;
  }

  projectModalDetails.innerHTML = detailsHTML;
  projectModalMeta.innerHTML = `
    <span>${project.tags ? project.tags.join(", ") : ""}</span>
    <strong>${project.year}</strong>
  `;

  projectModal.hidden = false;
  document.body.classList.add("modal-open");
  if (projectModalClose) projectModalClose.focus();
}

function closeProjectModal() {
  if (!projectModal) return;
  projectModal.hidden = true;
  document.body.classList.remove("modal-open");
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

/* Render Projects on projects.html and index.html */
async function initProjects() {
  const projectsContainer = document.querySelector("[data-projects-container]");
  const featuredContainer = document.querySelector("[data-featured-source]");

  if (!projectsContainer && !featuredContainer) return;

  try {
    const response = await fetch("lib/projects.json");
    const projects = await response.json();

    // 1. Render all projects on projects.html
    if (projectsContainer) {
      projectsContainer.innerHTML = projects.map(p => `
        <article id="${p.id}" class="case-study" ${p.featured ? 'data-featured="true"' : ""}>
          <p class="project-type">${p.type}</p>
          <h2>${p.title}</h2>
          ${createVisualHTML(p.visual, p.title)}
          <p>${p.summary}</p>
          <div class="project-meta">
            <span>${p.tags ? p.tags.join(", ") : ""}</span>
            <strong>${p.year}</strong>
          </div>
        </article>
      `).join("");

      projectsContainer.querySelectorAll(".case-study").forEach((card, idx) => {
        card.addEventListener("click", (e) => {
          if (e.target.closest("a")) return;
          openProjectModalData(projects[idx]);
        });
      });

      // Handle direct hash navigation (e.g., projects.html#neutrino)
      if (window.location.hash) {
        const targetId = window.location.hash.substring(1);
        const match = projects.find(p => p.id === targetId);
        if (match) openProjectModalData(match);
      }
    }

    // 2. Render featured projects on index.html
    if (featuredContainer) {
      const featured = projects.filter(p => p.featured);
      featuredContainer.innerHTML = featured.map(p => `
        <article class="project-card">
          ${createVisualHTML(p.visual, p.title)}
          <p class="project-type">${p.type}</p>
          <h3>${p.title}</h3>
          <p>${p.summary}</p>
        </article>
      `).join("");

      featuredContainer.querySelectorAll(".project-card").forEach((card, idx) => {
        card.addEventListener("click", () => openProjectModalData(featured[idx]));
      });
    }
  } catch (error) {
    console.error("Failed to load projects.json:", error);
  }
}

document.addEventListener("DOMContentLoaded", initProjects);
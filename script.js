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
      <div class="modal-links">
        <p class="detail-links">
          ${project.links.map(l => `<a href="${l.url}" class="modal-btn" target="_blank" rel="noreferrer">${l.label}</a>`).join(" ")}
        </p>
      </div>`;
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

/* Render Projects and Filters on projects.html and index.html */
async function initProjects() {
  const projectsContainer = document.querySelector("[data-projects-container]");
  const featuredContainer = document.querySelector("[data-featured-source]");

  if (!projectsContainer && !featuredContainer) return;

  try {
    const response = await fetch("lib/projects.json");
    const projects = await response.json();

    const renderCards = (items) => {
      if (!projectsContainer) return;
      projectsContainer.innerHTML = items.map(p => `
        <article id="${p.id}" class="case-study" data-year="${p.year}" ${p.featured ? 'data-featured="true"' : ""}>
          <h2>${p.title}</h2>
          ${createVisualHTML(p.visual, p.title)}
          <p class="project-type">${p.type}</p>
          <p>${p.summary}</p>
          ${p.badge ? `<span class="card-status-badge">${p.badge}</span>` : ""}
          <div class="project-meta">
            <span>${p.tags ? p.tags.join(", ") : ""}</span>
            <strong>${p.year}</strong>
          </div>
        </article>
      `).join("");

      projectsContainer.querySelectorAll(".case-study").forEach((card, idx) => {
        card.addEventListener("click", (e) => {
          if (e.target.closest("a")) return;
          openProjectModalData(items[idx]);
        });
      });
    };

    if (projectsContainer) {
      renderCards(projects);
    }

    if (featuredContainer) {
      const featured = projects.filter(p => p.featured);
      featuredContainer.innerHTML = featured.map(p => `
        <article class="project-card">
          ${createVisualHTML(p.visual, p.title)}
          <p class="project-type">${p.type}</p>
          <h3>${p.title}</h3>
          <p>${p.summary}</p>
          ${p.badge ? `<span class="card-status-badge">${p.badge}</span>` : ""}
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

document.addEventListener('DOMContentLoaded', () => {
  const dropdown = document.getElementById('sort-dropdown');
  const trigger = dropdown.querySelector('.dropdown-trigger');
  const label = dropdown.querySelector('.dropdown-label');
  const items = dropdown.querySelectorAll('.dropdown-item');
  
  // Grab the container that holds your project cards
  const grid = document.querySelector('.project-list'); 

  // 1. Toggle Menu Open/Close
  trigger.addEventListener('click', (e) => {
    e.preventDefault();
    dropdown.classList.toggle('open');
  });

  // 2. Handle Item Clicks
  items.forEach(item => {
    item.addEventListener('click', () => {
      // Update active visual state
      items.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      
      // Update the label text (removes the "year: " part for a cleaner look)
      const rawText = item.innerText.replace('year: ', '');
      label.innerText = `sort by: ${rawText}`;
      
      // Close the menu
      dropdown.classList.remove('open');
      
      // Trigger the sort function
      runSort();
    });
  });

  // 3. Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('#sort-dropdown')) {
      dropdown.classList.remove('open');
    }
  });

  // --- THE SORT ENGINE ---
  function runSort() {
    // Check which option is currently active
    const activeSort = dropdown.querySelector('.dropdown-item.active').dataset.value;
    
    // Select all projects
    const projects = Array.from(document.querySelectorAll('.case-study'));

    // Sort the array of HTML elements
    projects.sort((a, b) => {
      const yearA = parseInt(a.dataset.year || 0);
      const yearB = parseInt(b.dataset.year || 0);
      
      if (activeSort === 'featured') {
        // Check if the items are featured (returns 1 if true, 0 if false)
        const isFeaturedA = a.dataset.featured === 'true' ? 1 : 0;
        const isFeaturedB = b.dataset.featured === 'true' ? 1 : 0;
        
        // If one is featured and the other isn't, put the featured one first
        if (isFeaturedA !== isFeaturedB) {
          return isFeaturedB - isFeaturedA; 
        }
        
        // If both are featured (or neither is featured), fall back to sorting by newest year
        return yearB - yearA;
      } 
      
      // Standard year sorting
      else if (activeSort === 'year-desc') {
        return yearB - yearA;
      } else {
        return yearA - yearB; // year-asc
      }
    });

    // Re-append the elements to the grid in their new order
    projects.forEach(project => grid.appendChild(project));
  }
});
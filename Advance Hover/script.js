// Project data with minimalist titles
const projects = [
  {
    id: 1,
    title: "Silence",
    year: "2021",
    image:
      "https://cdn.cosmos.so/7d47d4e2-0eff-4e2f-9734-9d24a8ba067e?format=jpeg"
  },
  {
    id: 2,
    title: "Resonance",
    year: "2022",
    image:
      "https://cdn.cosmos.so/5eee2d2d-3d4d-4ae5-96d4-cdbae70a2387?format=jpeg"
  },
  {
    id: 3,
    title: "Essence",
    year: "2022",
    image:
      "https://cdn.cosmos.so/def30e8a-34b2-48b1-86e1-07ec5c28f225?format=jpeg"
  },
  {
    id: 4,
    title: "Void",
    year: "2023",
    image:
      "https://cdn.cosmos.so/44d7cb23-6759-49e4-9dc1-acf771b3a0d1?format=jpeg"
  },
  {
    id: 5,
    title: "Presence",
    year: "2023",
    image:
      "https://cdn.cosmos.so/7712fe42-42ca-4fc5-9590-c89f2db99978?format=jpeg"
  },
  {
    id: 6,
    title: "Flow",
    year: "2024",
    image:
      "https://cdn.cosmos.so/cbee1ec5-01b6-4ffe-9f34-7da7980454cf?format=jpeg"
  },
  {
    id: 7,
    title: "Clarity",
    year: "2024",
    image:
      "https://cdn.cosmos.so/2e91a9d1-db85-4499-ad37-6222a6fea23b?format=jpeg"
  },
  {
    id: 8,
    title: "Breath",
    year: "2024",
    image:
      "https://cdn.cosmos.so/ff2ac3d3-fa94-4811-89f6-0d008b27e439?format=jpeg"
  },
  {
    id: 9,
    title: "Stillness",
    year: "2025",
    image:
      "https://cdn.cosmos.so/c39a4043-f489-4406-8018-a103a3f89802?format=jpeg"
  },
  {
    id: 10,
    title: "Surrender",
    year: "2025",
    image:
      "https://cdn.cosmos.so/e5e399f2-4050-463b-a781-4f5a1615f28e?format=jpeg"
  }
];

document.addEventListener("DOMContentLoaded", function () {
  const projectsContainer = document.querySelector(".projects-container");
  const backgroundImage = document.getElementById("background-image");

  // Render projects
  renderProjects(projectsContainer);

  // Initialize animations
  initialAnimation();

  // Preload images
  preloadImages();

  // Add hover events to project items
  setupHoverEvents(backgroundImage, projectsContainer);
});

// Render project items
function renderProjects(container) {
  projects.forEach((project) => {
    const projectItem = document.createElement("div");
    projectItem.classList.add("project-item");
    projectItem.dataset.id = project.id;
    projectItem.dataset.image = project.image;

    projectItem.innerHTML = `
      <div class="project-title">${project.title}</div>
      <div class="project-year">${project.year}</div>
    `;

    container.appendChild(projectItem);
  });
}

// Initial animation for project items
function initialAnimation() {
  const projectItems = document.querySelectorAll(".project-item");

  // Set initial state
  projectItems.forEach((item, index) => {
    item.style.opacity = "0";
    item.style.transform = "translateY(20px)";

    // Animate in with staggered delay
    setTimeout(() => {
      item.style.transition = "opacity 0.8s ease, transform 0.8s ease";
      item.style.opacity = "1";
      item.style.transform = "translateY(0)";
    }, index * 60);
  });
}

// Setup hover events for project items
function setupHoverEvents(backgroundImage, projectsContainer) {
  const projectItems = document.querySelectorAll(".project-item");
  let currentImage = null;
  let zoomTimeout = null;

  // Preload all images to ensure immediate display
  const preloadedImages = {};
  projects.forEach((project) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = project.image;
    preloadedImages[project.id] = img;
  });

  projectItems.forEach((item) => {
    item.addEventListener("mouseenter", function () {
      const imageUrl = this.dataset.image;

      // Clear any pending zoom timeout
      if (zoomTimeout) {
        clearTimeout(zoomTimeout);
      }

      // Reset transform and transition
      backgroundImage.style.transition = "none";
      backgroundImage.style.transform = "scale(1.2)";

      // Immediately show the new image
      backgroundImage.src = imageUrl;
      backgroundImage.style.opacity = "1";

      // Force browser to acknowledge the scale reset before animating
      // This ensures the zoom effect happens every time
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          // Re-enable transition and animate to scale 1.0
          backgroundImage.style.transition =
            "transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
          backgroundImage.style.transform = "scale(1.0)";
        });
      });

      // Update current image
      currentImage = imageUrl;
    });
  });

  // Handle mouse leaving the projects container
  projectsContainer.addEventListener("mouseleave", function () {
    // Hide the image
    backgroundImage.style.opacity = "0";
    currentImage = null;
  });
}

// Preload images
function preloadImages() {
  projects.forEach((project) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = project.image;
  });
}

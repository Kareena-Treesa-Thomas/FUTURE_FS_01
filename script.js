const roles = [
  "Aspiring AI Engineer",
  "GSSOC '26 Contributor",
  "Open Source Contributor",
  "Hackathon Builder",
  "Full Stack Developer",
];

const profileData = {
  connections: "1500+",
  jobRoles:
    "Full Stack Web Development Intern, Campus Ambassador, Open Source Contributor, Technical Content Writer",
};

const githubUser = "Kareena-Treesa-Thomas";
const typedRole = document.querySelector("#typed-role");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function updateText(selector, value) {
  document.querySelectorAll(selector).forEach((element) => {
    element.textContent = value;
  });
}

function applyProfileData() {
  Object.entries(profileData).forEach(([field, value]) => {
    updateText(`[data-profile-field="${field}"]`, value);
  });
}

function formatNumber(value) {
  if (!Number.isFinite(value)) return "0";
  if (value >= 1000) {
    const formatted = (value / 1000).toFixed(value >= 10000 ? 0 : 1).replace(/\.0$/, "");
    return `${formatted}k`;
  }
  return String(value);
}

async function loadGitHubMetrics() {
  const fields = document.querySelectorAll("[data-github-field]");
  if (!fields.length) return;

  try {
    const [userResponse, reposResponse] = await Promise.all([
      fetch(`https://api.github.com/users/${githubUser}`, { headers: { Accept: "application/vnd.github+json" } }),
      fetch(`https://api.github.com/users/${githubUser}/repos?per_page=100&sort=updated`, {
        headers: { Accept: "application/vnd.github+json" },
      }),
    ]);

    if (!userResponse.ok || !reposResponse.ok) {
      throw new Error("GitHub API request failed");
    }

    const user = await userResponse.json();
    const repos = await reposResponse.json();
    const repoList = Array.isArray(repos) ? repos : [];
    const stars = repoList.reduce((total, repo) => total + (repo.stargazers_count || 0), 0);

    const metrics = {
      publicRepos: formatNumber(user.public_repos ?? repoList.length),
      followers: formatNumber(user.followers ?? 0),
      stars: formatNumber(stars),
    };

    Object.entries(metrics).forEach(([field, value]) => {
      updateText(`[data-github-field="${field}"]`, value);
    });
  } catch (error) {
    updateText('[data-github-field="publicRepos"]', "Live when online");
    updateText('[data-github-field="followers"]', "Live when online");
    updateText('[data-github-field="stars"]', "Live when online");
  }
}

applyProfileData();
loadGitHubMetrics();

let roleIndex = 0;
let charIndex = roles[0].length;
let deleting = true;

function typeRole() {
  if (!typedRole || reduceMotion) return;

  const current = roles[roleIndex];
  typedRole.textContent = current.slice(0, charIndex);

  if (deleting) {
    charIndex -= 1;
    if (charIndex <= 0) {
      deleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
    }
  } else {
    charIndex += 1;
    if (charIndex >= roles[roleIndex].length) {
      deleting = true;
      window.setTimeout(typeRole, 1200);
      return;
    }
  }

  window.setTimeout(typeRole, deleting ? 48 : 72);
}

window.setTimeout(typeRole, 900);

const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelectorAll(".site-nav a");

navToggle?.addEventListener("click", () => {
  const isOpen = document.body.classList.toggle("nav-open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    document.body.classList.remove("nav-open");
    navToggle?.setAttribute("aria-expanded", "false");
  });
});

const revealItems = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window && !reduceMotion) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14 }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

const sections = document.querySelectorAll("main section[id]");

if ("IntersectionObserver" in window) {
  const activeObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.getAttribute("id");
        navLinks.forEach((link) => {
          link.classList.toggle("is-active", link.getAttribute("href") === `#${id}`);
        });
      });
    },
    { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
  );

  sections.forEach((section) => activeObserver.observe(section));
}

document.querySelectorAll(".project-card").forEach((card) => {
  const toggle = () => {
    const isFlipped = card.classList.toggle("is-flipped");
    card.setAttribute("aria-pressed", String(isFlipped));
  };

  card.addEventListener("click", (event) => {
    if (event.target.closest("a")) return;
    toggle();
  });

  card.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    toggle();
  });
});

const backToTop = document.querySelector(".back-to-top");

window.addEventListener(
  "scroll",
  () => {
    backToTop?.classList.toggle("is-visible", window.scrollY > 720);
  },
  { passive: true }
);

backToTop?.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
});

const form = document.querySelector("#contact-form");
const formStatus = document.querySelector("#form-status");

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const message = String(formData.get("message") || "").trim();

  const subject = encodeURIComponent(`Portfolio inquiry from ${name}`);
  const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);

  window.location.href = `mailto:kareenatreesa07@gmail.com?subject=${subject}&body=${body}`;
  if (formStatus) {
    formStatus.textContent = "Opening your email app with the message ready to send.";
  }
});

const canvas = document.querySelector("#particle-canvas");
const ctx = canvas?.getContext("2d");
let particles = [];
let width = 0;
let height = 0;
let animationFrame = 0;

function resizeCanvas() {
  if (!canvas || !ctx) return;
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * ratio);
  canvas.height = Math.floor(height * ratio);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

  const count = Math.min(88, Math.max(34, Math.floor(width / 18)));
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.38,
    vy: (Math.random() - 0.5) * 0.34,
    r: Math.random() * 1.8 + 0.8,
  }));
}

function drawParticles() {
  if (!ctx) return;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "rgba(99, 230, 247, 0.72)";
  ctx.strokeStyle = "rgba(53, 167, 255, 0.14)";
  ctx.lineWidth = 1;

  particles.forEach((particle, index) => {
    if (!reduceMotion) {
      particle.x += particle.vx;
      particle.y += particle.vy;
    }

    if (particle.x < -20) particle.x = width + 20;
    if (particle.x > width + 20) particle.x = -20;
    if (particle.y < -20) particle.y = height + 20;
    if (particle.y > height + 20) particle.y = -20;

    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
    ctx.fill();

    for (let nextIndex = index + 1; nextIndex < particles.length; nextIndex += 1) {
      const next = particles[nextIndex];
      const dx = particle.x - next.x;
      const dy = particle.y - next.y;
      const distance = Math.hypot(dx, dy);

      if (distance < 118) {
        ctx.globalAlpha = (118 - distance) / 118;
        ctx.beginPath();
        ctx.moveTo(particle.x, particle.y);
        ctx.lineTo(next.x, next.y);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }
  });

  if (!reduceMotion) {
    animationFrame = window.requestAnimationFrame(drawParticles);
  }
}

if (canvas && ctx) {
  resizeCanvas();
  drawParticles();
  window.addEventListener("resize", () => {
    window.cancelAnimationFrame(animationFrame);
    resizeCanvas();
    drawParticles();
  });
}

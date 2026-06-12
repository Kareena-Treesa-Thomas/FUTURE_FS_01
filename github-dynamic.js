// ============================================
// DYNAMIC GITHUB API — Kareena Treesa Thomas
// No API key needed — public repos only
// ============================================

const GITHUB_USERNAME = "Kareena-Treesa-Thomas";
const GITHUB_API = `https://api.github.com/users/${GITHUB_USERNAME}`;
const REPOS_API = `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=10`;

// ── Fetch GitHub profile stats ──────────────────────────────
async function fetchGitHubStats() {
  try {
    const res = await fetch(GITHUB_API);
    if (!res.ok) throw new Error("GitHub API failed");
    const data = await res.json();

    // Update stat counters
    document.getElementById("gh-repos").textContent = data.public_repos ?? "—";
    document.getElementById("gh-followers").textContent = data.followers ?? "—";
    document.getElementById("gh-following").textContent = data.following ?? "—";
    document.getElementById("gh-name").textContent = data.name ?? GITHUB_USERNAME;
    document.getElementById("gh-bio").textContent = data.bio ?? "Building AI-powered systems.";

  } catch (err) {
    console.warn("GitHub stats fetch failed:", err);
    document.getElementById("gh-repos").textContent = "—";
    document.getElementById("gh-followers").textContent = "—";
  }
}

// ── Fetch latest repos ──────────────────────────────────────
async function fetchLatestRepos() {
  const container = document.getElementById("gh-repos-list");
  if (!container) return;

  try {
    const res = await fetch(REPOS_API);
    if (!res.ok) throw new Error("Repos fetch failed");
    const repos = await res.json();

    // Clear loading state
    container.innerHTML = "";

    // Filter out forked repos optionally — show all here
    repos.forEach(repo => {
      const updated = new Date(repo.updated_at);
      const timeAgo = getTimeAgo(updated);

      const card = document.createElement("div");
      card.className = "gh-repo-card";
      card.innerHTML = `
        <div class="gh-repo-top">
          <a class="gh-repo-name" href="${repo.html_url}" target="_blank" rel="noopener noreferrer">
            <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8V1.5Z"/></svg>
            ${repo.name}
          </a>
          ${repo.fork ? '<span class="gh-fork-badge">Fork</span>' : ""}
        </div>
        <p class="gh-repo-desc">${repo.description ?? "No description provided."}</p>
        <div class="gh-repo-meta">
          ${repo.language ? `<span class="gh-lang"><span class="gh-lang-dot"></span>${repo.language}</span>` : ""}
          <span class="gh-stars">
            <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"/></svg>
            ${repo.stargazers_count}
          </span>
          <span class="gh-updated">Updated ${timeAgo}</span>
        </div>
      `;
      container.appendChild(card);
    });

  } catch (err) {
    console.warn("Repos fetch failed:", err);
    container.innerHTML = `<p class="gh-error">Could not load repositories. <a href="https://github.com/${GITHUB_USERNAME}" target="_blank">View on GitHub →</a></p>`;
  }
}

// ── Helper: time ago ────────────────────────────────────────
function getTimeAgo(date) {
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  if (diff < 31536000) return `${Math.floor(diff / 2592000)}mo ago`;
  return `${Math.floor(diff / 31536000)}y ago`;
}

// ── Init on DOM ready ───────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  fetchGitHubStats();
  fetchLatestRepos();
});
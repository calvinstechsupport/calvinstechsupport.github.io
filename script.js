
const toggles = document.querySelectorAll('[data-menu]');
const panel = document.querySelector('.mobile-panel');
toggles.forEach(btn => btn.addEventListener('click', () => panel.classList.toggle('open')));

const form = document.getElementById('requestForm');
if (form) {
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('reqName')?.value.trim() || 'Not provided';
    const device = document.getElementById('reqDevice')?.value.trim() || 'Not provided';
    const problem = document.getElementById('reqProblem')?.value.trim() || 'Not provided';
    const area = document.getElementById('reqArea')?.value || 'Not provided';
    const msg = `Hi Calvin, I need tech support.%0A%0AName: ${encodeURIComponent(name)}%0ADevice: ${encodeURIComponent(device)}%0AProblem: ${encodeURIComponent(problem)}%0AArea: ${encodeURIComponent(area)}%0A%0AI can send pictures/video next.`;
    window.open(`https://wa.me/27683947321?text=${msg}`, '_blank');
  });
}


// ---------- Theme settings ----------
(function () {
  const body = document.body;
  const savedTheme = localStorage.getItem("cts-theme") || "light";
  const savedAccent = localStorage.getItem("cts-accent") || "orange";

  function applyTheme(theme) {
    body.classList.toggle("dark-mode", theme === "dark");
    localStorage.setItem("cts-theme", theme);
    document.querySelectorAll("[data-theme-choice]").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.themeChoice === theme);
    });
    document.querySelectorAll(".theme-label").forEach(label => {
      label.textContent = theme === "dark" ? "Light" : "Dark";
    });
  }

  function applyAccent(accent) {
    body.classList.remove("accent-blue", "accent-green");
    if (accent === "blue") body.classList.add("accent-blue");
    if (accent === "green") body.classList.add("accent-green");
    localStorage.setItem("cts-accent", accent);
    document.querySelectorAll("[data-accent-choice]").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.accentChoice === accent);
    });
  }

  applyTheme(savedTheme);
  applyAccent(savedAccent);

  document.addEventListener("click", function (event) {
    const themeToggle = event.target.closest("[data-theme-toggle]");
    if (themeToggle) {
      const next = body.classList.contains("dark-mode") ? "light" : "dark";
      applyTheme(next);
    }

    const settingsToggle = event.target.closest("[data-settings-toggle]");
    if (settingsToggle) {
      const panel = document.querySelector(".settings-panel");
      if (panel) panel.classList.toggle("open");
    }

    const themeChoice = event.target.closest("[data-theme-choice]");
    if (themeChoice) applyTheme(themeChoice.dataset.themeChoice);

    const accentChoice = event.target.closest("[data-accent-choice]");
    if (accentChoice) applyAccent(accentChoice.dataset.accentChoice);

    const panel = document.querySelector(".settings-panel");
    if (panel && panel.classList.contains("open")) {
      const clickedInside = event.target.closest(".settings-panel") || event.target.closest("[data-settings-toggle]");
      if (!clickedInside) panel.classList.remove("open");
    }
  });
})();

(() => {
  'use strict';

  const body = document.body;
  const root = document.documentElement;
  const mobilePanel = document.querySelector('.mobile-panel');
  const menuButtons = document.querySelectorAll('[data-menu]');
  const settingsPanel = document.querySelector('.settings-panel');

  const safeRead = (key, fallback) => {
    try { return localStorage.getItem(key) || fallback; } catch (_) { return fallback; }
  };
  const safeWrite = (key, value) => {
    try { localStorage.setItem(key, value); } catch (_) { /* Preferences still work for this page. */ }
  };

  function applyTheme(theme) {
    const isDark = theme === 'dark';
    body.classList.toggle('dark-mode', isDark);
    root.classList.toggle('dark-mode', isDark);
    safeWrite('cts-theme', isDark ? 'dark' : 'light');
    document.querySelectorAll('[data-theme-choice]').forEach((button) => {
      const active = button.dataset.themeChoice === (isDark ? 'dark' : 'light');
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
      button.setAttribute('aria-pressed', String(isDark));
      const label = button.querySelector('.theme-label');
      if (label) label.textContent = isDark ? 'Light' : 'Dark';
      if (button.firstChild && button.firstChild.nodeType === Node.TEXT_NODE) button.firstChild.textContent = isDark ? '☀️ ' : '🌙 ';
      button.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    });
    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) themeColor.setAttribute('content', isDark ? '#07111f' : '#002f50');
  }

  function applyAccent(accent) {
    body.classList.remove('accent-blue', 'accent-green');
    if (accent === 'blue') body.classList.add('accent-blue');
    if (accent === 'green') body.classList.add('accent-green');
    safeWrite('cts-accent', ['orange', 'blue', 'green'].includes(accent) ? accent : 'orange');
    document.querySelectorAll('[data-accent-choice]').forEach((button) => {
      const active = button.dataset.accentChoice === accent;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }

  function setMenu(open) {
    if (!mobilePanel) return;
    mobilePanel.classList.toggle('open', open);
    mobilePanel.setAttribute('aria-hidden', String(!open));
    if (open) mobilePanel.removeAttribute('inert');
    else mobilePanel.setAttribute('inert', '');
    menuButtons.forEach((button) => {
      if (button.classList.contains('menu-btn')) button.setAttribute('aria-expanded', String(open));
    });
    if (open) {
      const closeButton = mobilePanel.querySelector('.close-btn');
      if (closeButton) closeButton.focus();
    } else {
      const opener = document.querySelector('.menu-btn');
      if (opener && document.activeElement && mobilePanel.contains(document.activeElement)) opener.focus();
    }
  }

  function setSettings(open) {
    if (!settingsPanel) return;
    settingsPanel.classList.toggle('open', open);
    settingsPanel.setAttribute('aria-hidden', String(!open));
    if (open) settingsPanel.removeAttribute('inert');
    else settingsPanel.setAttribute('inert', '');
    document.querySelectorAll('[data-settings-toggle]').forEach((button) => button.setAttribute('aria-expanded', String(open)));
  }

  // The small head script applies the dark class before first paint; keep body state in sync.
  const storedTheme = safeRead('cts-theme', 'light');
  applyTheme(storedTheme === 'dark' ? 'dark' : 'light');
  const storedAccent = safeRead('cts-accent', 'orange');
  applyAccent(['orange', 'blue', 'green'].includes(storedAccent) ? storedAccent : 'orange');

  menuButtons.forEach((button) => button.addEventListener('click', () => {
    setMenu(!mobilePanel?.classList.contains('open'));
  }));

  document.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    if (target.closest('[data-theme-toggle]')) {
      applyTheme(body.classList.contains('dark-mode') ? 'light' : 'dark');
    }
    const themeChoice = target.closest('[data-theme-choice]');
    if (themeChoice) applyTheme(themeChoice.dataset.themeChoice === 'dark' ? 'dark' : 'light');

    const accentChoice = target.closest('[data-accent-choice]');
    if (accentChoice) applyAccent(accentChoice.dataset.accentChoice);

    if (target.closest('[data-settings-toggle]')) {
      setSettings(!settingsPanel?.classList.contains('open'));
    }

    if (settingsPanel?.classList.contains('open') && !target.closest('.settings-panel') && !target.closest('[data-settings-toggle]')) {
      setSettings(false);
    }

    if (mobilePanel?.classList.contains('open') && target.closest('.mobile-panel a')) {
      setMenu(false);
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      if (mobilePanel?.classList.contains('open')) setMenu(false);
      if (settingsPanel?.classList.contains('open')) setSettings(false);
    }
  });

  // No backend: validate locally, URL-encode the message, and hand off only on deliberate submit.
  const requestForm = document.getElementById('requestForm');
  if (requestForm) {
    const deviceField = requestForm.querySelector('#reqDevice');
    const problemField = requestForm.querySelector('#reqProblem');
    // Clear a custom trim-validation error as soon as the visitor edits the field.
    deviceField?.addEventListener('input', () => deviceField.setCustomValidity(''));
    problemField?.addEventListener('input', () => problemField.setCustomValidity(''));
    requestForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const read = (selector) => requestForm.querySelector(selector)?.value.trim() || '';
      const name = read('#reqName') || 'Not provided';
      const device = read('#reqDevice');
      const problem = read('#reqProblem');
      const deviceInput = requestForm.querySelector('#reqDevice');
      const problemInput = requestForm.querySelector('#reqProblem');
      const area = read('#reqArea') || 'Not provided';
      if (deviceInput) deviceInput.setCustomValidity(device ? '' : 'Please enter the device type.');
      if (problemInput) problemInput.setCustomValidity(problem ? '' : 'Please describe the problem.');
      if (!device || !problem) {
        requestForm.reportValidity();
        return;
      }
      const message = [
        'Hi Calvin, I need tech support.',
        '',
        `Name: ${name}`,
        `Device: ${device}`,
        `Problem: ${problem}`,
        `Area: ${area}`,
        '',
        'I can send pictures/video next.'
      ].join('\n');
      const url = `https://wa.me/27683947321?text=${encodeURIComponent(message)}`;
      const opened = window.open(url, '_blank');
      if (opened) opened.opener = null;
      if (!opened) {
        const feedback = requestForm.querySelector('[data-form-feedback]') || requestForm.querySelector('.form-note');
        if (feedback) feedback.textContent = 'Your browser may have blocked the new tab. Allow pop-ups for this site, or use the WhatsApp link in the page header.';
      }
    });
  }
})();

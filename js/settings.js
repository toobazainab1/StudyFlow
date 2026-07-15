/* ==========================================================================
   StudyFlow — settings.js
   Standalone script for settings.html. Shares localStorage keys with the
   main dashboard (script.js) but is otherwise fully self-contained.
   ========================================================================== */

(function () {
  'use strict';

  const KEYS = {
    assignments: 'studyflow.assignments',
    courses: 'studyflow.courses',
    exams: 'studyflow.exams',
    notes: 'studyflow.notes',
    theme: 'studyflow.theme',
    streak: 'studyflow.streak',
    studyMinutes: 'studyflow.studyMinutes'
  };

  /* ---------- DOM References ---------- */
  const sidebarToggle = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('sidebar');
  const sidebarOverlay = document.getElementById('sidebarOverlay');

  const darkModeToggle = document.getElementById('darkModeToggle');
  const settingsThemeToggle = document.getElementById('settingsThemeToggle');

  const exportDataBtn = document.getElementById('exportDataBtn');
  const importDataInput = document.getElementById('importDataInput');
  const clearDataBtn = document.getElementById('clearDataBtn');

  const toastContainer = document.getElementById('toastContainer');

  /* ---------- Helpers ---------- */
  function loadJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (err) {
      console.error(`Could not load "${key}":`, err);
      return fallback;
    }
  }

  function saveJSON(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.error(`Could not save "${key}":`, err);
    }
  }

  function todayISO() {
    return new Date().toISOString().split('T')[0];
  }

  function showToast(message, type = 'default') {
    const toast = document.createElement('div');
    toast.className = 'toast' + (type !== 'default' ? ` toast--${type}` : '');
    toast.textContent = message;
    toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
  }

  /* ---------- Sidebar (mobile) ---------- */
  function openSidebar() {
    sidebar.classList.add('is-open');
    sidebarOverlay.classList.add('is-visible');
    sidebarToggle.setAttribute('aria-expanded', 'true');
  }

  function closeSidebar() {
    sidebar.classList.remove('is-open');
    sidebarOverlay.classList.remove('is-visible');
    sidebarToggle.setAttribute('aria-expanded', 'false');
  }

  sidebarToggle.addEventListener('click', () => {
    sidebar.classList.contains('is-open') ? closeSidebar() : openSidebar();
  });

  sidebarOverlay.addEventListener('click', closeSidebar);

  /* ---------- Dark Mode ---------- */
  function applyTheme(isDark) {
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem(KEYS.theme, 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem(KEYS.theme, 'light');
    }
    darkModeToggle.setAttribute('aria-pressed', String(isDark));
    darkModeToggle.setAttribute('title', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    darkModeToggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
  }

  function initTheme() {
    applyTheme(localStorage.getItem(KEYS.theme) === 'dark');
  }

  function toggleTheme() {
    applyTheme(document.documentElement.getAttribute('data-theme') !== 'dark');
  }

  darkModeToggle.addEventListener('click', toggleTheme);
  settingsThemeToggle.addEventListener('click', toggleTheme);

  /* ---------- Export Data ---------- */
  exportDataBtn.addEventListener('click', () => {
    const backup = {
      assignments: loadJSON(KEYS.assignments, []),
      courses: loadJSON(KEYS.courses, []),
      exams: loadJSON(KEYS.exams, []),
      notes: localStorage.getItem(KEYS.notes) || '',
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `studyflow-backup-${todayISO()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast('Backup downloaded', 'success');
  });

  /* ---------- Import Data ---------- */
  importDataInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        const looksValid = Array.isArray(data.assignments) && Array.isArray(data.courses) && Array.isArray(data.exams);

        if (!looksValid) {
          showToast('That file doesn\'t look like a valid StudyFlow backup.', 'danger');
          return;
        }

        const confirmed = window.confirm('This will replace your current assignments, courses, and exams with the data from this file. Continue?');
        if (!confirmed) return;

        saveJSON(KEYS.assignments, data.assignments);
        saveJSON(KEYS.courses, data.courses);
        saveJSON(KEYS.exams, data.exams);

        if (typeof data.notes === 'string') {
          localStorage.setItem(KEYS.notes, data.notes);
        }

        showToast('Backup restored. Visit the Dashboard to see your data.', 'success');
      } catch (err) {
        console.error('Import failed:', err);
        showToast('Could not read that file. Make sure it\'s a valid StudyFlow backup.', 'danger');
      }
      importDataInput.value = '';
    };
    reader.readAsText(file);
  });

  /* ---------- Clear All Data ---------- */
  clearDataBtn.addEventListener('click', () => {
    const confirmed = window.confirm('This will permanently delete all assignments, courses, exams, and notes from this browser. This cannot be undone. Continue?');
    if (!confirmed) return;

    Object.values(KEYS).forEach((key) => {
      if (key !== KEYS.theme) localStorage.removeItem(key);
    });

    showToast('All data cleared', 'danger');
  });

  /* ---------- Keyboard: Escape closes mobile sidebar ---------- */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeSidebar();
  });

  /* ---------- Init ---------- */
  initTheme();
})();
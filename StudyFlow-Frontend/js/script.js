/* ==========================================================================
   StudyFlow — script.js
   Vanilla JavaScript only. No frameworks, no libraries.
   ========================================================================== */

(function () {
  'use strict';

  /* ==========================================================================
     STORAGE KEYS
     ========================================================================== */
  const KEYS = {
    assignments: 'studyflow.assignments',
    courses: 'studyflow.courses',
    exams: 'studyflow.exams',
    notes: 'studyflow.notes',
    theme: 'studyflow.theme',
    streak: 'studyflow.streak',
    studyMinutes: 'studyflow.studyMinutes'
  };

  /* ==========================================================================
     STATE
     ========================================================================== */
  let assignments = loadJSON(KEYS.assignments, null);
  let courses = loadJSON(KEYS.courses, null);
  let exams = loadJSON(KEYS.exams, null);

  let currentFilter = 'all';
  let currentSearch = '';
  let calendarViewDate = new Date();

  /* ==========================================================================
     DOM REFERENCES
     ========================================================================== */
  const todayDateEl = document.getElementById('todayDate');
  const studyStreakEl = document.getElementById('studyStreak');

  const addAssignmentBtn = document.getElementById('addAssignmentBtn');
  const assignmentForm = document.getElementById('assignmentForm');
  const cancelAssignmentBtn = document.getElementById('cancelAssignmentBtn');
  const assignmentList = document.getElementById('assignmentList');
  const assignmentEmptyState = document.getElementById('assignmentEmptyState');
  const filterButtons = document.querySelectorAll('.filter-btn');
  const assignmentSearch = document.getElementById('assignmentSearch');
  let editingAssignmentId = null;

  const statAssignments = document.getElementById('statAssignments');
  const statCourses = document.getElementById('statCourses');
  const statHours = document.getElementById('statHours');
  const statCompletion = document.getElementById('statCompletion');

  const sidebarToggle = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('sidebar');
  const sidebarOverlay = document.getElementById('sidebarOverlay');
  const navLinks = document.querySelectorAll('.nav-link:not(.nav-link--external)');
  const bottomNavLinks = document.querySelectorAll('.bottom-nav-link');

  const darkModeToggle = document.getElementById('darkModeToggle');

  const pomodoroTime = document.getElementById('pomodoroTime');
  const pomodoroRingFill = document.getElementById('pomodoroRingFill');
  const pomodoroStart = document.getElementById('pomodoroStart');
  const pomodoroPause = document.getElementById('pomodoroPause');
  const pomodoroReset = document.getElementById('pomodoroReset');

  const notesTextarea = document.getElementById('notesTextarea');
  const saveNotesBtn = document.getElementById('saveNotesBtn');
  const notesSavedMsg = document.getElementById('notesSavedMsg');

  const toastContainer = document.getElementById('toastContainer');

  const addCourseBtn = document.getElementById('addCourseBtn');
  const courseForm = document.getElementById('courseForm');
  const cancelCourseBtn = document.getElementById('cancelCourseBtn');
  const progressList = document.getElementById('progressList');
  const courseEmptyState = document.getElementById('courseEmptyState');

  const addExamBtn = document.getElementById('addExamBtn');
  const examForm = document.getElementById('examForm');
  const cancelExamBtn = document.getElementById('cancelExamBtn');
  const examList = document.getElementById('examList');
  const examEmptyState = document.getElementById('examEmptyState');

  const calendarGrid = document.getElementById('calendarGrid');
  const calendarMonthLabel = document.getElementById('calendarMonthLabel');
  const calendarPrevBtn = document.getElementById('calendarPrevBtn');
  const calendarNextBtn = document.getElementById('calendarNextBtn');
  const calendarModal = document.getElementById('calendarModal');
  const calendarModalOverlay = document.getElementById('calendarModalOverlay');
  const calendarModalCloseBtn = document.getElementById('calendarModalCloseBtn');

  /* ==========================================================================
     GENERIC HELPERS
     ========================================================================== */
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

  function addDays(n) {
    const d = new Date();
    d.setDate(d.getDate() + n);
    return d.toISOString().split('T')[0];
  }

  function todayISO() {
    return new Date().toISOString().split('T')[0];
  }

  function formatDate(iso) {
    if (!iso) return 'No due date';
    const date = new Date(iso + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffDays = Math.round((date - today) / 86400000);

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function showToast(message, type = 'default') {
    const toast = document.createElement('div');
    toast.className = 'toast' + (type !== 'default' ? ` toast--${type}` : '');
    toast.textContent = message;
    toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
  }

  // A toast with an "Undo" action. Stays up longer than a normal toast and
  // only calls onUndo if the button is clicked before it auto-dismisses.
  function showUndoToast(message, onUndo) {
    const toast = document.createElement('div');
    toast.className = 'toast toast--undo';

    const text = document.createElement('span');
    text.textContent = message;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'toast-undo-btn';
    btn.textContent = 'Undo';

    toast.appendChild(text);
    toast.appendChild(btn);
    toastContainer.appendChild(toast);

    let dismissed = false;
    function dismiss(ranUndo) {
      if (dismissed) return;
      dismissed = true;
      clearTimeout(autoTimeout);
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 250);
      if (ranUndo) onUndo();
    }

    const autoTimeout = setTimeout(() => dismiss(false), 4800);
    btn.addEventListener('click', () => dismiss(true));
  }

  /* ==========================================================================
     TODAY'S DATE
     ========================================================================== */
  function renderTodayDate() {
    const today = new Date();
    const formatted = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    todayDateEl.textContent = formatted;

    const printDateEl = document.getElementById('printDate');
    if (printDateEl) printDateEl.textContent = formatted;
  }

  /* ==========================================================================
     STUDY STREAK (dynamic, based on consecutive days visited)
     ========================================================================== */
  function updateStreak() {
    const streak = loadJSON(KEYS.streak, { count: 0, lastDate: null });
    const today = todayISO();

    if (streak.lastDate === today) {
      // already counted today, do nothing
    } else {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayISO = yesterday.toISOString().split('T')[0];

      if (streak.lastDate === yesterdayISO) {
        streak.count += 1;
      } else {
        streak.count = 1;
      }
      streak.lastDate = today;
      saveJSON(KEYS.streak, streak);
    }

    studyStreakEl.textContent = streak.count;
  }

  /* ==========================================================================
     CELEBRATION (confetti) — fires once when completion reaches 100%
     ========================================================================== */
  let hasCelebratedThisSession = false;

  function maybeCelebrate(percent) {
    if (percent === 100 && !hasCelebratedThisSession && assignments.length > 0) {
      hasCelebratedThisSession = true;
      launchConfetti();
      showToast('All assignments complete. Great work!', 'success');
    }
    if (percent < 100) {
      hasCelebratedThisSession = false;
    }
  }

  function launchConfetti() {
    const colors = ['#5E60CE', '#64DFDF', '#80FFDB', '#2DC653', '#F4A261'];
    for (let i = 0; i < 40; i++) {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      piece.style.left = `${Math.random() * 100}vw`;
      piece.style.background = colors[Math.floor(Math.random() * colors.length)];
      piece.style.animationDelay = `${Math.random() * 0.4}s`;
      piece.style.animationDuration = `${1.2 + Math.random() * 0.8}s`;
      document.body.appendChild(piece);
      setTimeout(() => piece.remove(), 2200);
    }
  }

  /* ==========================================================================
     ASSIGNMENTS
     ========================================================================== */
  if (!assignments) {
    assignments = [
      { id: crypto.randomUUID(), course: 'Database Systems', title: 'ER Diagram Submission', dueDate: addDays(2), priority: 'high', estimatedTime: '2 hrs', completed: false },
      { id: crypto.randomUUID(), course: 'Software Engineering', title: 'Sprint Retrospective Report', dueDate: addDays(4), priority: 'medium', estimatedTime: '1 hr', completed: false },
      { id: crypto.randomUUID(), course: 'Artificial Intelligence', title: 'Neural Network Lab', dueDate: addDays(-1), priority: 'low', estimatedTime: '3 hrs', completed: true }
    ];
    saveJSON(KEYS.assignments, assignments);
  }

  function isOverdue(a) {
    return !a.completed && a.dueDate && a.dueDate < todayISO();
  }

  function getFilteredAssignments() {
    return assignments.filter((a) => {
      const query = currentSearch.trim().toLowerCase();
      const matchesSearch = !query || a.title.toLowerCase().includes(query) || a.course.toLowerCase().includes(query);
      if (!matchesSearch) return false;

      switch (currentFilter) {
        case 'pending': return !a.completed;
        case 'completed': return a.completed;
        case 'high':
        case 'medium':
        case 'low':
          return a.priority === currentFilter;
        default:
          return true;
      }
    });
  }

  function renderAssignments() {
    const filtered = getFilteredAssignments();
    assignmentList.innerHTML = '';

    if (filtered.length === 0) {
      assignmentEmptyState.hidden = false;
      assignmentEmptyState.querySelector('span').textContent =
        assignments.length === 0
          ? 'No assignments yet. Add one above to get started.'
          : 'No assignments match your current filter or search.';
    } else {
      assignmentEmptyState.hidden = true;
      filtered.forEach((a) => assignmentList.appendChild(buildAssignmentCard(a)));
    }

    updateStats();
  }

  function buildAssignmentCard(a) {
    const li = document.createElement('li');
    li.className = 'assignment-card' + (a.completed ? ' is-completed' : '');
    li.dataset.id = a.id;
    const overdue = isOverdue(a);

    li.innerHTML = `
      <p class="assignment-course">${escapeHtml(a.course)}</p>
      <p class="assignment-title">${escapeHtml(a.title)}</p>
      <div class="assignment-meta">
        <span class="badge-priority ${a.priority}">${capitalize(a.priority)} priority</span>
        <span class="badge-status">${a.completed ? 'Completed' : 'Pending'}</span>
        <span class="badge-date" style="${overdue ? 'color:var(--danger); border-color:var(--danger);' : ''}">
          ${overdue ? 'Overdue &middot; ' : ''}${formatDate(a.dueDate)}
        </span>
        ${a.estimatedTime ? `<span class="badge-time">${escapeHtml(a.estimatedTime)}</span>` : ''}
      </div>
      <div class="assignment-actions">
        <button type="button" class="complete-btn" title="${a.completed ? 'Mark as not completed' : 'Mark as completed'}" aria-label="${a.completed ? 'Undo complete for ' + escapeHtml(a.title) : 'Mark ' + escapeHtml(a.title) + ' as complete'}">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>
          <span>${a.completed ? 'Undo' : 'Complete'}</span>
        </button>
        <button type="button" class="edit-btn" title="Edit this assignment" aria-label="Edit ${escapeHtml(a.title)}">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z"/></svg>
          <span>Edit</span>
        </button>
        <button type="button" class="delete-btn" title="Delete this assignment" aria-label="Delete ${escapeHtml(a.title)}">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6z"/></svg>
          <span>Delete</span>
        </button>
      </div>
    `;
    return li;
  }

  function updateStats() {
    const total = assignments.length;
    const completed = assignments.filter((a) => a.completed).length;
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

    statAssignments.textContent = assignments.filter((a) => !a.completed).length;
    statCompletion.textContent = `${percent}%`;
    statCourses.textContent = courses.length;

    const minutes = loadJSON(KEYS.studyMinutes, 0);
    statHours.textContent = `${(minutes / 60).toFixed(1)}`;

    maybeCelebrate(percent);
    renderCalendar(); // due-date dots depend on current assignments/exams
  }

  function addAssignment(data) {
    assignments.unshift({
      id: crypto.randomUUID(),
      course: data.assignmentCourse.trim(),
      title: data.assignmentTitle.trim(),
      dueDate: data.assignmentDueDate || '',
      priority: data.assignmentPriority,
      estimatedTime: (data.assignmentTime || '').trim(),
      completed: false
    });
    saveJSON(KEYS.assignments, assignments);
    renderAssignments();
    showToast(`"${data.assignmentTitle.trim()}" added`, 'success');
  }

  function updateAssignment(id, data) {
    const a = assignments.find((item) => item.id === id);
    if (!a) return;
    a.course = data.assignmentCourse.trim();
    a.title = data.assignmentTitle.trim();
    a.dueDate = data.assignmentDueDate || '';
    a.priority = data.assignmentPriority;
    a.estimatedTime = (data.assignmentTime || '').trim();
    saveJSON(KEYS.assignments, assignments);
    renderAssignments();
    showToast(`"${a.title}" updated`, 'success');
  }

  function deleteAssignment(id) {
    const index = assignments.findIndex((item) => item.id === id);
    if (index === -1) return;
    const removed = assignments[index];

    assignments.splice(index, 1);
    renderAssignments();

    let restored = false;
    const finalizeTimeout = setTimeout(() => {
      if (!restored) saveJSON(KEYS.assignments, assignments);
    }, 5000);

    showUndoToast(`"${removed.title}" deleted`, () => {
      restored = true;
      clearTimeout(finalizeTimeout);
      assignments.splice(index, 0, removed);
      saveJSON(KEYS.assignments, assignments);
      renderAssignments();
      showToast(`"${removed.title}" restored`, 'success');
    });
  }

  function toggleComplete(id) {
    const a = assignments.find((item) => item.id === id);
    if (a) {
      a.completed = !a.completed;
      saveJSON(KEYS.assignments, assignments);
      renderAssignments();
      showToast(a.completed ? `"${a.title}" marked complete` : `"${a.title}" marked pending`);
    }
  }

  function startEditAssignment(id) {
    const a = assignments.find((item) => item.id === id);
    if (!a) return;

    editingAssignmentId = id;
    document.getElementById('assignmentCourse').value = a.course;
    document.getElementById('assignmentTitle').value = a.title;
    document.getElementById('assignmentDueDate').value = a.dueDate;
    document.getElementById('assignmentPriority').value = a.priority;
    document.getElementById('assignmentTime').value = a.estimatedTime;

    assignmentForm.hidden = false;
    assignmentForm.querySelector('button[type="submit"]').textContent = 'Update Assignment';
    document.getElementById('assignmentCourse').focus();
  }

  function resetAssignmentForm() {
    assignmentForm.reset();
    assignmentForm.hidden = true;
    editingAssignmentId = null;
    assignmentForm.querySelector('button[type="submit"]').textContent = 'Save Assignment';
  }

  addAssignmentBtn.addEventListener('click', () => {
    const isHidden = assignmentForm.hidden;
    if (isHidden) {
      assignmentForm.hidden = false;
      document.getElementById('assignmentCourse').focus();
    } else {
      resetAssignmentForm();
    }
  });

  cancelAssignmentBtn.addEventListener('click', resetAssignmentForm);

  assignmentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(assignmentForm).entries());
    if (!data.assignmentCourse.trim() || !data.assignmentTitle.trim()) return;

    if (editingAssignmentId) {
      updateAssignment(editingAssignmentId, data);
    } else {
      addAssignment(data);
    }
    resetAssignmentForm();
  });

  assignmentList.addEventListener('click', (e) => {
    const card = e.target.closest('.assignment-card');
    if (!card) return;
    const id = card.dataset.id;

    if (e.target.closest('.complete-btn')) toggleComplete(id);
    else if (e.target.closest('.delete-btn')) deleteAssignment(id);
    else if (e.target.closest('.edit-btn')) startEditAssignment(id);
  });

  assignmentSearch.addEventListener('input', (e) => {
    currentSearch = e.target.value;
    renderAssignments();
  });

  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      renderAssignments();
    });
  });

  /* ==========================================================================
     COURSES
     ========================================================================== */
  if (!courses) {
    courses = [
      { id: crypto.randomUUID(), name: 'Software Engineering', progress: 80 },
      { id: crypto.randomUUID(), name: 'Database Systems', progress: 65 },
      { id: crypto.randomUUID(), name: 'Artificial Intelligence', progress: 90 }
    ];
    saveJSON(KEYS.courses, courses);
  }

  function renderCourses() {
    progressList.innerHTML = '';

    if (courses.length === 0) {
      courseEmptyState.hidden = false;
    } else {
      courseEmptyState.hidden = true;
      courses.forEach((c) => progressList.appendChild(buildCourseItem(c)));
    }

    statCourses.textContent = courses.length;
  }

  function buildCourseItem(course) {
    const div = document.createElement('div');
    div.className = 'progress-item';
    div.dataset.id = course.id;

    div.innerHTML = `
      <div class="progress-item-body">
        <div class="progress-item-label">
          <span>${escapeHtml(course.name)}</span>
          <span>${course.progress}%</span>
        </div>
        <div class="progress-bar" role="progressbar" aria-valuenow="${course.progress}" aria-valuemin="0" aria-valuemax="100" aria-label="${escapeHtml(course.name)} progress">
          <div class="progress-fill" style="--progress: ${course.progress}%;"></div>
        </div>
      </div>
      <button type="button" class="course-delete-btn" title="Delete this course" aria-label="Delete ${escapeHtml(course.name)}">
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6z"/></svg>
      </button>
    `;
    return div;
  }

  function addCourse(data) {
    const progress = Math.min(100, Math.max(0, parseInt(data.courseProgress, 10) || 0));
    courses.push({ id: crypto.randomUUID(), name: data.courseName.trim(), progress });
    saveJSON(KEYS.courses, courses);
    renderCourses();
    showToast(`"${data.courseName.trim()}" added`, 'success');
  }

  function deleteCourse(id) {
    const index = courses.findIndex((item) => item.id === id);
    if (index === -1) return;
    const removed = courses[index];

    courses.splice(index, 1);
    renderCourses();

    let restored = false;
    const finalizeTimeout = setTimeout(() => {
      if (!restored) saveJSON(KEYS.courses, courses);
    }, 5000);

    showUndoToast(`"${removed.name}" removed`, () => {
      restored = true;
      clearTimeout(finalizeTimeout);
      courses.splice(index, 0, removed);
      saveJSON(KEYS.courses, courses);
      renderCourses();
      showToast(`"${removed.name}" restored`, 'success');
    });
  }

  addCourseBtn.addEventListener('click', () => {
    const isHidden = courseForm.hidden;
    courseForm.hidden = !isHidden;
    if (isHidden) document.getElementById('courseName').focus();
  });

  cancelCourseBtn.addEventListener('click', () => {
    courseForm.reset();
    courseForm.hidden = true;
  });

  courseForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(courseForm).entries());
    if (!data.courseName.trim()) return;
    addCourse(data);
    courseForm.reset();
    courseForm.hidden = true;
  });

  progressList.addEventListener('click', (e) => {
    const item = e.target.closest('.progress-item');
    if (!item) return;
    if (e.target.closest('.course-delete-btn')) deleteCourse(item.dataset.id);
  });

  /* ==========================================================================
     EXAMS
     ========================================================================== */
  if (!exams) {
    exams = [
      { id: crypto.randomUUID(), course: 'Database Systems', date: addDays(6), difficulty: 'medium' },
      { id: crypto.randomUUID(), course: 'Artificial Intelligence', date: addDays(10), difficulty: 'hard' }
    ];
    saveJSON(KEYS.exams, exams);
  }

  function examCountdownText(dateISO) {
    const examDate = new Date(dateISO + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffDays = Math.round((examDate - today) / 86400000);

    if (diffDays < 0) return { text: 'Past', isPast: true };
    if (diffDays === 0) return { text: 'Today', isPast: false };
    if (diffDays === 1) return { text: '1 day left', isPast: false };
    return { text: `${diffDays} days left`, isPast: false };
  }

  function renderExams() {
    examList.innerHTML = '';

    // Sort soonest-first so the list is always meaningfully ordered
    const sorted = [...exams].sort((a, b) => (a.date > b.date ? 1 : -1));

    if (sorted.length === 0) {
      examEmptyState.hidden = false;
    } else {
      examEmptyState.hidden = true;
      sorted.forEach((exam) => examList.appendChild(buildExamCard(exam)));
    }
  }

  function buildExamCard(exam) {
    const li = document.createElement('li');
    li.className = 'exam-card';
    li.dataset.id = exam.id;

    const countdown = examCountdownText(exam.date);
    const formattedDate = new Date(exam.date + 'T00:00:00').toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric'
    });

    li.innerHTML = `
      <div class="exam-info">
        <p class="exam-course">${escapeHtml(exam.course)}</p>
        <p class="exam-date">${formattedDate}</p>
        <p class="exam-countdown${countdown.isPast ? ' is-past' : ''}">${countdown.text}</p>
      </div>
      <div class="exam-side">
        <span class="exam-difficulty ${exam.difficulty}">${capitalize(exam.difficulty)}</span>
        <button type="button" class="exam-delete-btn" title="Delete this exam" aria-label="Delete exam for ${escapeHtml(exam.course)}">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6z"/></svg>
        </button>
      </div>
    `;
    return li;
  }

  function addExam(data) {
    exams.push({
      id: crypto.randomUUID(),
      course: data.examCourse.trim(),
      date: data.examDate,
      difficulty: data.examDifficulty
    });
    saveJSON(KEYS.exams, exams);
    renderExams();
    renderCalendar();
    showToast(`Exam for "${data.examCourse.trim()}" added`, 'success');
  }

  function deleteExam(id) {
    const index = exams.findIndex((item) => item.id === id);
    if (index === -1) return;
    const removed = exams[index];

    exams.splice(index, 1);
    renderExams();
    renderCalendar();

    let restored = false;
    const finalizeTimeout = setTimeout(() => {
      if (!restored) saveJSON(KEYS.exams, exams);
    }, 5000);

    showUndoToast(`Exam for "${removed.course}" removed`, () => {
      restored = true;
      clearTimeout(finalizeTimeout);
      exams.splice(index, 0, removed);
      saveJSON(KEYS.exams, exams);
      renderExams();
      renderCalendar();
      showToast(`Exam for "${removed.course}" restored`, 'success');
    });
  }

  addExamBtn.addEventListener('click', () => {
    const isHidden = examForm.hidden;
    examForm.hidden = !isHidden;
    if (isHidden) document.getElementById('examCourse').focus();
  });

  cancelExamBtn.addEventListener('click', () => {
    examForm.reset();
    examForm.hidden = true;
  });

  examForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(examForm).entries());
    if (!data.examCourse.trim() || !data.examDate) return;
    addExam(data);
    examForm.reset();
    examForm.hidden = true;
  });

  examList.addEventListener('click', (e) => {
    const card = e.target.closest('.exam-card');
    if (!card) return;
    if (e.target.closest('.exam-delete-btn')) deleteExam(card.dataset.id);
  });

  /* ==========================================================================
     CALENDAR
     ========================================================================== */
  function renderCalendar() {
    const year = calendarViewDate.getFullYear();
    const month = calendarViewDate.getMonth();

    calendarMonthLabel.textContent = calendarViewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const firstDayOfWeek = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const todayStr = todayISO();

    calendarGrid.innerHTML = '';

    for (let i = 0; i < firstDayOfWeek; i++) {
      const empty = document.createElement('div');
      empty.className = 'calendar-day is-empty';
      calendarGrid.appendChild(empty);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const cellDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const cell = document.createElement('div');
      cell.className = 'calendar-day' + (cellDate === todayStr ? ' is-today' : '');

      const hasAssignment = assignments.some((a) => a.dueDate === cellDate);
      const hasExam = exams.some((ex) => ex.date === cellDate);

      let dotsHtml = '';
      if (hasAssignment || hasExam) {
        dotsHtml = '<span class="calendar-day-dots">';
        if (hasAssignment) dotsHtml += '<span class="calendar-day-dot calendar-day-dot--assignment"></span>';
        if (hasExam) dotsHtml += '<span class="calendar-day-dot calendar-day-dot--exam"></span>';
        dotsHtml += '</span>';
      }

      cell.innerHTML = `<span>${day}</span>${dotsHtml}`;
      calendarGrid.appendChild(cell);
    }
  }

  calendarPrevBtn.addEventListener('click', () => {
    calendarViewDate.setMonth(calendarViewDate.getMonth() - 1);
    renderCalendar();
  });

  calendarNextBtn.addEventListener('click', () => {
    calendarViewDate.setMonth(calendarViewDate.getMonth() + 1);
    renderCalendar();
  });

  /* ==========================================================================
     CALENDAR MODAL (popup)
     ========================================================================== */
  function openCalendarModal() {
    calendarViewDate = new Date(); // always open on the current month
    renderCalendar();
    calendarModal.hidden = false;
    calendarModalOverlay.hidden = false;
    calendarModalCloseBtn.focus();
  }

  function closeCalendarModal() {
    calendarModal.hidden = true;
    calendarModalOverlay.hidden = true;
  }

  function isCalendarModalOpen() {
    return !calendarModal.hidden;
  }

  calendarModalCloseBtn.addEventListener('click', closeCalendarModal);
  calendarModalOverlay.addEventListener('click', closeCalendarModal);

  /* ==========================================================================
     SIDEBAR / MOBILE NAVIGATION
     ========================================================================== */
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

  const viewToSelector = {
    dashboard: '#dashboard',
    assignments: '#assignments',
    courses: '#courses',
    pomodoro: '#pomodoro',
    notes: '#notes'
  };

  function handleNavClick(view) {
    // Calendar is a popup, not a page section — open the modal and stop here.
    if (view === 'calendar') {
      openCalendarModal();
      return;
    }

    const selector = viewToSelector[view];
    navLinks.forEach((l) => l.classList.toggle('active', l.dataset.view === view));
    bottomNavLinks.forEach((l) => l.classList.toggle('active', l.dataset.view === view));

    if (selector) {
      const target = document.querySelector(selector);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      handleNavClick(link.dataset.view);
      closeSidebar();
    });
  });

  bottomNavLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      handleNavClick(link.dataset.view);
    });
  });

  /* ==========================================================================
     DARK MODE
     ========================================================================== */
  function applyTheme(isDark) {
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem(KEYS.theme, 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem(KEYS.theme, 'light');
    }
    [darkModeToggle].forEach((btn) => {
      btn.setAttribute('aria-pressed', String(isDark));
      btn.setAttribute('title', isDark ? 'Switch to light mode' : 'Switch to dark mode');
      btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    });
  }

  function initTheme() {
    const saved = localStorage.getItem(KEYS.theme);
    applyTheme(saved === 'dark');
  }

  function toggleTheme() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    applyTheme(!isDark);
  }

  darkModeToggle.addEventListener('click', toggleTheme);

  /* ==========================================================================
     POMODORO TIMER
     ========================================================================== */
  const POMODORO_TOTAL_SECONDS = 25 * 60;
  const RING_CIRCUMFERENCE = 339.3;

  let pomodoroSecondsLeft = POMODORO_TOTAL_SECONDS;
  let pomodoroIntervalId = null;

  function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  function renderPomodoro() {
    pomodoroTime.textContent = formatTime(pomodoroSecondsLeft);
    const fraction = pomodoroSecondsLeft / POMODORO_TOTAL_SECONDS;
    pomodoroRingFill.style.strokeDashoffset = RING_CIRCUMFERENCE * (1 - fraction);
  }

  function logCompletedStudyMinutes(minutes) {
    const total = loadJSON(KEYS.studyMinutes, 0) + minutes;
    saveJSON(KEYS.studyMinutes, total);
    statHours.textContent = `${(total / 60).toFixed(1)}`;
  }

  function startPomodoro() {
    if (pomodoroIntervalId) return;
    pomodoroIntervalId = setInterval(() => {
      if (pomodoroSecondsLeft <= 0) {
        clearInterval(pomodoroIntervalId);
        pomodoroIntervalId = null;
        logCompletedStudyMinutes(25);
        showToast('Focus session complete. Take a short break.', 'success');
        return;
      }
      pomodoroSecondsLeft--;
      renderPomodoro();
    }, 1000);
  }

  function pausePomodoro() {
    clearInterval(pomodoroIntervalId);
    pomodoroIntervalId = null;
  }

  function resetPomodoro() {
    pausePomodoro();
    pomodoroSecondsLeft = POMODORO_TOTAL_SECONDS;
    renderPomodoro();
  }

  pomodoroStart.addEventListener('click', startPomodoro);
  pomodoroPause.addEventListener('click', pausePomodoro);
  pomodoroReset.addEventListener('click', resetPomodoro);

  /* ==========================================================================
     NOTES
     ========================================================================== */
  function loadNotes() {
    const saved = localStorage.getItem(KEYS.notes);
    if (saved) notesTextarea.value = saved;
  }

  saveNotesBtn.addEventListener('click', () => {
    localStorage.setItem(KEYS.notes, notesTextarea.value);
    notesSavedMsg.hidden = false;
    setTimeout(() => { notesSavedMsg.hidden = true; }, 2000);
  });

  /* ==========================================================================
     KEYBOARD SHORTCUTS
     ========================================================================== */
  document.addEventListener('keydown', (e) => {
    const tag = document.activeElement.tagName;
    const isTyping = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';

    if (e.key === '/' && !isTyping) {
      e.preventDefault();
      assignmentSearch.focus();
    }

    if (e.key === 'Escape') {
      if (isCalendarModalOpen()) {
        closeCalendarModal();
      }
      resetAssignmentForm();
      courseForm.hidden = true;
      examForm.hidden = true;
      closeSidebar();
    }
  });

  /* ==========================================================================
     INITIAL RENDER
     ========================================================================== */
  renderTodayDate();
  updateStreak();
  initTheme();
  renderCourses();
  renderExams();
  renderAssignments();
  renderCalendar();
  renderPomodoro();
  loadNotes();
})();
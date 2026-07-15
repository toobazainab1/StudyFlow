# StudyFlow

**A Smart Student Productivity Dashboard**

StudyFlow is a modern, responsive academic dashboard that helps university students organize assignments, track course progress, manage exams, and stay focused — all in one elegant interface. Built as Project 1 of the Decode Labs Full Stack Development internship.

---

## Project Overview

StudyFlow brings together everything a student needs to stay on top of their semester:

- A snapshot of today's date, a motivational quote, and a **dynamic study streak** that tracks real consecutive-day usage
- Live statistics for assignments, courses, study hours, and completion rate — all calculated from real data, not hardcoded
- A full assignment tracker with priorities, due dates, status, and inline editing
- A course manager with editable progress bars
- An exam tracker with live countdowns
- A visual timeline of today's class schedule
- A **Calendar popup** highlighting assignment and exam due dates across the month
- A built-in Pomodoro focus timer with an animated progress ring — completed sessions automatically add to your Study Hours stat
- A quick-notes pad that remembers what you wrote
- A dedicated **Settings page** for theme, data backup, and data management

The interface is designed to feel like a real SaaS product — in the spirit of tools like Notion, Todoist, and Linear — rather than a typical class assignment.

---

## Features

**Assignment Management**
- Add, edit, delete, and mark assignments as complete
- **Undo on delete** — deleting shows a 5-second "Undo" toast before anything is permanently removed
- Live search across course name and assignment title
- Filter by status (Pending / Completed) or priority (High / Medium / Low)
- Automatic recalculation of remaining assignments and completion percentage
- A confetti celebration when you hit 100% completion

**Courses & Exams**
- Add/remove courses with editable progress bars (feeds the "Courses" stat automatically)
- Add/remove exams with live countdowns ("3 days left", "Today", etc.), sorted soonest-first

**Calendar**
- Opens as a popup from the sidebar or mobile bottom nav — doesn't clutter the main dashboard
- Month view with prev/next navigation, dots marking days with assignments or exams due

**Focus Tools**
- 25-minute Pomodoro timer with Start / Pause / Reset controls and an animated circular progress ring
- Completed sessions log real minutes toward your Study Hours stat

**Settings (separate page — `settings.html`)**
- Dark mode toggle
- Export all data as a JSON backup file
- Import a previous backup to restore your data
- Clear all data, with a confirmation prompt
- Keyboard shortcuts reference

**Personalization**
- Dark mode, remembered across visits and across both pages
- Quick notes saved automatically to Local Storage
- Keyboard shortcuts: `/` focuses search, `Esc` closes any open form, popup, or menu

**Design & Accessibility**
- Fully responsive: mobile (single column + bottom nav), tablet, desktop, and large desktop layouts
- Mobile hamburger menu with a slide-in sidebar
- Semantic HTML5 throughout (`header`, `nav`, `main`, `section`, `article`, `aside`, `footer`)
- Keyboard-accessible controls, visible focus states, and ARIA labels on every icon-only button
- Custom favicon matching the brand palette
- A dedicated **print stylesheet** — printing the dashboard produces a clean, ink-friendly assignment list with the header, sidebar, and buttons hidden
- Respects `prefers-reduced-motion` for users who've disabled animations at the OS level

---

## Technologies

This project is intentionally built **without any frameworks or libraries**, to demonstrate a solid grasp of core web fundamentals:

- **HTML5** — semantic structure across two pages
- **CSS3** — CSS Grid, Flexbox, custom properties (variables), `clamp()`, keyframe animations, `@media print`
- **Vanilla JavaScript (ES6+)** — DOM manipulation, `localStorage`, the File/Blob APIs (for backup export/import), event delegation, no external dependencies

No React, Vue, Angular, Bootstrap, Tailwind, jQuery, or backend of any kind.

---

## Folder Structure

```
StudyFlow-Frontend/
│
├── index.html            # Main dashboard (landing page)
├── settings.html          # Standalone Settings page
│
├── css/
│   ├── styles.css         # Design tokens, base styles, all components, modal & print styles
│   └── responsive.css     # Tablet / desktop / large-desktop breakpoints
│
├── js/
│   ├── script.js          # Dashboard logic: assignments, courses, exams, calendar, pomodoro, notes
│   └── settings.js        # Settings page logic: theme, export/import/clear data
│
├── assets/
│   ├── images/
│   └── icons/
│       └── favicon.svg    # Brand-matching gradient favicon
│
├── README.md
├── LICENSE
└── .gitignore
```

Both pages share the same `css/styles.css` and `css/responsive.css`, so styling stays consistent without duplication.

---

## How to Run

No build tools, package managers, or installation required.

1. Download or clone this folder
2. Open `index.html` directly in your browser, **or**
3. For the best experience (and to avoid any local file/CORS quirks), serve it with a simple local server:
   - **VS Code:** right-click `index.html` → "Open with Live Server"
   - **Python:** `python3 -m http.server`, then visit `http://localhost:8000`

That's it — the app runs entirely in the browser, with all data (assignments, courses, exams, notes, theme preference, study streak) stored in your browser's Local Storage.

---

## Future Improvements

- Connect to a real backend API (planned as a future Decode Labs milestone) to replace Local Storage with persistent, multi-device data
- Add a real month/week Calendar page instead of a popup, once backend data supports richer scheduling
- User authentication so each student has their own saved dashboard
- Push notifications / reminders for upcoming due dates and exams
- Drag-and-drop reordering for assignments

---

**Built by Tooba Zainab.** Powered by Decode Labs — Full Stack Development Internship, 2026 Batch.
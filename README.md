# HICIT Academic Management System

A front-end prototype of an integrated academic administration dashboard for **HICIT**. The interface is **Arabic (right-to-left)** and designed for desktop.

**Live demo:** https://khl0udatiya.github.io/academic_setup_system_HICIT/

> This is a design prototype. All data is demo data held in memory, so changes are lost on refresh. There is no backend.

---

## Features

The system is organized into six areas, matching the sidebar:

| Area | Screens |
|---|---|
| **Dashboard** | Institute overview and institute profile |
| **Academic Setup** | Academic regulations (with a regulation builder), scientific departments, global course catalog |
| **System Members** | Faculty and teaching assistants, staff and roles with role-based permissions (RBAC) |
| **Students & Cohorts** | Cohort and student onboarding (including bulk Excel import), academic status tracking and overrides, promotion and department branching |
| **Term Operations** | Course offerings and scheduling, teaching load, registration and overrides |
| **Control & Grading** | Instructor assessment log (40% year work), grade processing and rules engine, verification, control locking and result publishing |

The sidebar adapts to the selected role ("View as" persona), so each role only sees the screens it has permission for.

---

## Tech stack

- **React 18**: UI components
- **Tailwind CSS**: styling
- **Lucide**: icons
- **Babel Standalone**: compiles JSX in the browser

There is **no build step**. Everything loads from CDNs, so an internet connection is required.

---

## Project structure

```
├── index.html                 Entry point, loads all the files below in order
├── css/styles.css             Custom styles (font, background, sidebar gradient, scrollbar)
├── js/
│   ├── tailwind-config.js     Brand colors and font settings
│   ├── data/                  Demo data (students, courses, staff, roles...)
│   ├── utils/                 Academic rules and grading calculations
│   ├── config/navigation.js   Sidebar items, sub-tabs, and role access rules
│   ├── App.jsx                App shell: sidebar, header, state, and routing between screens
│   ├── main.js                Mounts the app
│   └── components/            One file per screen or modal, grouped by sidebar section
│       ├── dashboard/
│       ├── academic-setup/
│       ├── system-members/
│       ├── students-cohorts/
│       ├── term-operations/
│       └── control-grading/
├── merge.py                   Merges everything into one HTML file
└── README-ar.md               Arabic guide to the code
```

Each screen lives in its own file, so editing one section does not affect the others.

---

## Run locally

Opening `index.html` by double-click will **not** work, because browsers block loading the separate script files from your computer. Use one of these:

**VS Code + Live Server (recommended)**
1. Open the project folder in VS Code.
2. Install the **Live Server** extension.
3. Right-click `index.html` and choose **Open with Live Server**.

**Python**
```bash
python -m http.server 8000
```
Then open http://localhost:8000.

**Single file (double-click friendly)**
```bash
python merge.py
```
This creates `HICIT-single-file.html`, which opens directly in the browser.

---

## Deploy

The project is hosted on **GitHub Pages**, served from the `main` branch root. Any static host (Netlify, Vercel, and so on) also works.

---

## Notes

- Designed for desktop. The layout does not yet include responsive (mobile) breakpoints.
- There is no data persistence, authentication, or API. The role switcher is a UI simulation.
- See [`README-ar.md`](README-ar.md) for a detailed Arabic guide to the files and how to edit them.

# 🌲 Alireza Lotfi Moghaddam — Software Engineer Portfolio

[![Vue 3](https://img.shields.io/badge/Vue-3.5+-4FC08D?style=flat-square&logo=vue.js&logoColor=white)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-7.x-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![.NET Core](https://img.shields.io/badge/.NET-9.0-512BD4?style=flat-square&logo=dotnet&logoColor=white)](https://dotnet.microsoft.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)
[![Website](https://img.shields.io/badge/Live-alirezalotfimoghaddam.ir-38BDF8?style=flat-square&logo=google-chrome&logoColor=white)](https://alirezalotfimoghaddam.ir/)

> A high-performance, aesthetic, and accessible developer portfolio engineered with Vue 3, featuring glassmorphism aesthetics, an integrated terminal emulator, real-time procedural Web Audio synthesis, and an automated Jamstack SSG pipeline for GitHub Pages.

---

## 🌟 Overview

This repository powers the personal website and technical portfolio of **Alireza Lotfi Moghaddam (Damoon)**, a Software Engineer specializing in **C# / .NET, ASP.NET Core, WPF desktop applications, queue systems, and backend development**.

Instead of relying on heavy frameworks or template libraries, this project is built from scratch with a focus on **speed, engineering rigor, zero-friction UX, and forward-looking web craftsmanship**.

---

## 🚀 Key Architectural Features

### 1. 🪟 Hybrid Two-Tier Experience
- **Liquid Identity Card**: An immersive hero section with procedural liquid caustics, spotlight cursor tracking (`--x`, `--y`), and reactive glassmorphism.
- **Pure Minimal Dashboard**: An editorial, distraction-free technical showcase split into clean sections: About, Experience, Projects, Skills, and Engineering Notes.
- **Quick Peek / Recruiter Mode**: Instant entry for recruiters and hiring managers who need immediate access to resume, case studies, and contact info.

### 2. 💻 Integrated Terminal Emulator (`Ctrl + K`)
- Built-in interactive CLI with tab auto-completion, command history traversal (`Up`/`Down`), and custom commands (`help`, `whoami`, `projects`, `skills`, `status`, `neofetch`, `matrix`, `vcard`, etc.).
- Direct interaction with live portfolio data.

### 3. 🔊 Zero-Asset Web Audio Synthesizer
- All sound effects (keypresses, UI clicks, boot chimes, theme switch chirps) are synthesized in real-time via the browser's raw **Web Audio API** using sine and triangle oscillators with exponential gain envelopes.
- Zero audio assets downloaded over the wire (0 KB transferred).
- Respects user preferences: muted by default with persistent user preference storage in `localStorage`.

### 4. ⚡ Jamstack SSG & Search Engine Optimization (SEO)
- Automated pre-rendering pipeline via `scripts/generate-static-pages.mjs`.
- Generates fully crawlable HTML pages for all route endpoints (`/projects/`, `/experience/`, `/notes/`, individual project case studies, and technical notes).
- Injects rich **JSON-LD Schema.org** structured data (`Person`, `SoftwareSourceCode`, `CollectionPage`, `ProfilePage`, `WebSite`).
- Automatically generates and keeps both `dist/sitemap.xml` and `public/sitemap.xml` in sync with all dynamic routes and modification timestamps.

### 5. 📱 Offline-First PWA & Cache Invalidation
- Service Worker registration with automatic `SKIP_WAITING` controller change notifications.
- Displays an unobtrusive update toast when a new version is deployed.
- Includes a dedicated offline fallback experience.

### 6. 🧪 E2E Test Suite
- Automated end-to-end testing with **Playwright** (`tests/e2e/`), covering navigation, terminal commands, guestbook flows, and SEO metadata integrity.

---

## 📂 Project Architecture

```plaintext
├── public/
│   ├── dynamicData/         # Decoupled JSON data layer (projects, experience, notes, skills)
│   ├── fonts/               # IranYekan & monospace font assets
│   ├── manifest.json        # PWA application manifest
│   ├── robots.txt           # Crawler instructions & sitemap link
│   ├── sitemap.xml          # Dynamically generated search engine sitemap
│   └── sw.js                # Offline caching service worker
├── scripts/
│   └── generate-static-pages.mjs  # Post-build SSG & sitemap generation script
├── src/
│   ├── assets/              # Core stylesheets and SVG visual assets
│   ├── components/
│   │   ├── dashboard/       # Dashboard sections (UserProfile, MainContent, tabs, etc.)
│   │   ├── LiquidIdentityCard.vue  # Hero glassmorphic card with liquid animation
│   │   ├── TerminalModal.vue       # Interactive developer CLI terminal
│   │   ├── CustomCursor.vue        # Fluid cursor with magnetic hover states
│   │   ├── MatrixRain.vue          # Ambient digital rain canvas effect
│   │   └── PrintResumeView.vue     # Clean printable resume template
│   ├── composables/
│   │   ├── useAudioSynth.js        # Web Audio API procedural synthesizer
│   │   ├── useNavigation.js        # Lightweight History API client router
│   │   ├── usePortfolio.js         # Reactive data store & vCard generator
│   │   ├── useSEO.js               # Reactive document title & meta tags manager
│   │   └── useTheme.js             # Multi-theme CSS variable switcher
│   ├── App.vue              # Root application shell
│   ├── main.js              # Vue 3 entry point & SW lifecycle
│   └── style.css            # Design tokens, typography & CSS variables
├── tests/
│   └── e2e/                 # Playwright test specs
├── package.json
└── vite.config.js           # Vite configuration & version injection
```

---

## 🛠️ Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm` or `pnpm`

### Installation
```bash
# Clone the repository
git clone https://github.com/AlirezaLotfiM/AlirezaLotfiM.github.io.git
cd AlirezaLotfiM.github.io

# Install dependencies
npm install
```

### Development
```bash
# Start local development server with hot-reload
npm run dev
```

### Production Build & SSG Generation
```bash
# Compile client assets and execute static page generation
npm run build
```

### End-to-End Testing
```bash
# Run Playwright E2E suite
npm run test:e2e
```

### Deployment to GitHub Pages
```bash
# Builds and deploys the 'dist' directory to gh-pages branch
npm run deploy
```

---

## ⌨️ Shortcuts & Easter Eggs

| Shortcut / Action | Feature |
| :--- | :--- |
| `Ctrl + K` / `Cmd + K` | Open / Close Interactive Terminal |
| `Ctrl + Z` | Toggle Zen Mode (when reading a technical note) |
| `Tab` | Auto-complete command in Terminal |
| `↑` / `↓` | Traverse command history in Terminal |
| `↑ ↑ ↓ ↓ ← → ← → B A` | **Konami Code**: Neon mode unlocked |

---

## 👤 Author

**Alireza Lotfi Moghaddam (Damoon)**  
*Software Engineer (.NET / Backend / C# / WPF)*

- 🌐 Website: [alirezalotfimoghaddam.ir](https://alirezalotfimoghaddam.ir)
- 🐙 GitHub: [@AlirezaLotfiM](https://github.com/AlirezaLotfiM)
- 💼 LinkedIn: [alireza-lotfi-moghaddam](https://linkedin.com/in/alireza-lotfi-moghaddam-378a8018a)
- ✉️ Email: `Lotfi.moghaddam.alireza@gmail.com`

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

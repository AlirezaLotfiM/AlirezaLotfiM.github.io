# 🌲 Alireza Lotfi Moghaddam — Portfolio & Engineering Showcase

[![Vue 3](https://img.shields.io/badge/Vue-3.5-4FC08D?style=flat-square&logo=vue.js&logoColor=white)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-7.x-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![.NET Core](https://img.shields.io/badge/.NET-9.0-512BD4?style=flat-square&logo=dotnet&logoColor=white)](https://dotnet.microsoft.com/)
[![Typography](https://img.shields.io/badge/Font-Peyda%20Variable-06B6D4?style=flat-square)](https://fontiran.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)
[![Website](https://img.shields.io/badge/Live-alirezalotfimoghaddam.ir-38BDF8?style=flat-square&logo=google-chrome&logoColor=white)](https://alirezalotfimoghaddam.ir/)

> A high-performance, minimalist personal portfolio and engineering dashboard built with Vue 3, featuring glassmorphism aesthetics, Peyda Variable typography, interactive developer CLI, procedural Web Audio, and an automated Jamstack SSG pipeline.

---

## 🌟 Highlights

- **Liquid Identity Card**: Procedural glassmorphic hero card with dynamic cursor tracking and identity actions.
- **Editorial Dashboard**: Swiss/minimalist technical showcase covering About, Experience, Projects, Skills, and Engineering Notes.
- **Command Palette (`Ctrl + K`)**: Raycast-style spotlight search for instant navigation across projects, experience, and notes.
- **Developer CLI Terminal**: Interactive terminal emulator with command history, auto-completion, and utilities (`help`, `neofetch`, `matrix`, `projects`, etc.).
- **Zero-Asset Web Audio**: Procedural sound effects synthesized at runtime using the native Web Audio API (0 KB audio assets).
- **Jamstack SSG & SEO**: Automated pre-rendering generating 14 crawlable routes with full JSON-LD structured data and synced XML sitemaps.
- **Offline-First PWA**: Service Worker caching with automatic updates and offline support.

---

## 📂 Project Structure

```plaintext
├── public/
│   ├── dynamicData/       # Decoupled JSON data (projects, experience, notes, skills)
│   ├── manifest.json      # PWA application manifest
│   ├── sitemap.xml        # Auto-generated search engine sitemap
│   └── sw.js              # Offline caching service worker
├── scripts/
│   └── generate-static-pages.mjs  # Post-build SSG pre-renderer
├── src/
│   ├── components/
│   │   ├── dashboard/     # Layout, sections, header & command palette
│   │   ├── LiquidIdentityCard.vue  # Hero glassmorphic card
│   │   ├── TerminalModal.vue       # Interactive CLI terminal
│   │   ├── MatrixRain.vue          # Ambient canvas matrix effect
│   │   └── PrintResumeView.vue     # Printable A4 resume
│   ├── composables/       # Audio synth, data store, SEO & theme hooks
│   ├── App.vue            # Root shell
│   └── style.css          # Design tokens, Peyda font & theme system
└── package.json
```

---

## 🛠️ Quick Start

```bash
# Clone the repository
git clone https://github.com/AlirezaLotfiM/AlirezaLotfiM.github.io.git
cd AlirezaLotfiM.github.io

# Install dependencies
npm install

# Start local dev server
npm run dev

# Build for production & generate static pages
npm run build

# Deploy to GitHub Pages
npm run deploy
```

---

## ⌨️ Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Ctrl + K` / `Cmd + K` | Open Command Palette / Spotlight Search |
| `Ctrl + Z` | Toggle Zen Mode (inside technical notes) |
| `Tab` | Auto-complete command in Terminal |
| `↑` / `↓` | History traversal in Terminal |

---

## 👤 Author

**Alireza Lotfi Moghaddam (Damoon)**  
*Software Engineer (.NET / ASP.NET Core / C# / WPF)*

- 🌐 Website: [alirezalotfimoghaddam.ir](https://alirezalotfimoghaddam.ir)
- 🐙 GitHub: [@AlirezaLotfiM](https://github.com/AlirezaLotfiM)
- 💼 LinkedIn: [alireza-lotfi-moghaddam](https://linkedin.com/in/alireza-lotfi-moghaddam-378a8018a)
- ✉️ Email: `hi@alirz.ir`

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

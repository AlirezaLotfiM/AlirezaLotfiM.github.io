<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import CustomCursor from "./components/CustomCursor.vue";
import CyberParticles from "./components/CyberParticles.vue";
import MatrixRain from "./components/MatrixRain.vue";
import TerminalModal from "./components/TerminalModal.vue";
import ContextMenu from "./components/ContextMenu.vue";
import BootSequence from "./components/BootSequence.vue";
import MusicPlayer from "./components/MusicPlayer.vue";

import UserProfile from "./components/dashboard/UserProfile.vue";
import MainContent from "./components/dashboard/MainContent.vue";
import SkillRack from "./components/dashboard/SkillRack.vue";

import { usePortfolio } from "./composables/usePortfolio";
import { useTheme } from "./composables/useTheme";

// --- Composables ---
const {
  projects,
  mySkills,
  userGithub,
  fetchData,
  selectedNote,
  closeNote,
  profile
} = usePortfolio();

const { currentThemeColor } = useTheme();

// --- App State ---
const appVersion = "1.3.5"; // Bumped version
const showBoot = ref(true);
const isBooted = ref(false);
const isMatrixMode = ref(false);
const showTerminal = ref(false);
const isZenMode = ref(false);
const contextMenu = ref({ visible: false, x: 0, y: 0 });

// --- Methods ---
const handleBootComplete = () => {
  showBoot.value = false;
  setTimeout(() => (isBooted.value = true), 100);
};

const handleMouseMove = (e) => {
  if (window.innerWidth < 768) return;
  const cards = document.querySelectorAll(".spotlight-card");
  cards.forEach((card) => {
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--x", `${e.clientX - rect.left}px`);
    card.style.setProperty("--y", `${e.clientY - rect.top}px`);
  });
};

const onContextMenu = (e) => {
  e.preventDefault();
  contextMenu.value = { visible: true, x: e.clientX, y: e.clientY };
};

const handleMenuAction = (action) => {
  contextMenu.value.visible = false;
  if (action === "terminal") showTerminal.value = true;
  if (action === "matrix") isMatrixMode.value = !isMatrixMode.value;
  if (action === "source")
    window.open(`https://github.com/${userGithub.value}`, "_blank");
  if (action === "email") navigator.clipboard.writeText(profile.value.contact?.email || "");
};

const handleKeydown = (e) => {
  if (e.ctrlKey && e.key === "k") {
    e.preventDefault();
    showTerminal.value = !showTerminal.value;
  }
  if (e.ctrlKey && e.key === "z" && selectedNote.value) {
    e.preventDefault();
    isZenMode.value = !isZenMode.value;
  }
};

const toggleZenMode = () => {
  isZenMode.value = !isZenMode.value;
  if (!isZenMode.value && selectedNote.value) {
    // Optional: close note when exiting zen mode? No, just exit zen.
  }
};

// --- Lifecycle ---
let typeTimeout = null; // Used in UserProfile, but logic moved there. App.vue doesn't need it.

onMounted(() => {
  fetchData();
  window.addEventListener("keydown", handleKeydown);
  document.addEventListener("contextmenu", onContextMenu);

  console.log(
    "%c Hello from Damoon! 🌲💻 \n Looking for bugs? Good luck! ",
    "background: #0a0a0a; color: #67FF64; font-size: 14px; padding: 15px; border-radius: 5px; border: 2px solid #67FF64; font-family: monospace;",
  );

  // Konami Code
  const konamiCode = [
    "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
    "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight",
    "b", "a",
  ];
  let konamiIndex = 0;
  window.addEventListener("keydown", (e) => {
    if (e.key === konamiCode[konamiIndex]) {
      konamiIndex++;
      if (konamiIndex === konamiCode.length) {
        alert("🎉 System Hacked by Damoon! God Mode Enabled. 🚀");
        document.documentElement.style.setProperty("--neon", "#ff00ff");
        konamiIndex = 0;
      }
    } else {
      konamiIndex = 0;
    }
  });
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeydown);
  document.removeEventListener("contextmenu", onContextMenu);
});
</script>

<template>
  <CustomCursor />
  <Transition name="fade">
    <BootSequence v-if="showBoot" @completed="handleBootComplete" />
  </Transition>

  <div v-show="!showBoot" class="main-wrapper" :class="{ 'fade-in-enter': isBooted }">
    <Transition name="fade">
      <component :is="isMatrixMode ? MatrixRain : CyberParticles" :color="currentThemeColor" :key="currentThemeColor" />
    </Transition>

    <TerminalModal :visible="showTerminal" :projects="projects" :skills="mySkills" :contact="{
      email: profile.contact?.email,
      linkedin: profile.contact?.linkedin,
      github: userGithub,
      telegram: profile.contact?.telegramId,
    }" :learning="profile.learning" :version="appVersion" username="Damoon" role="Software Engineer" @close="showTerminal = false" />

    <MusicPlayer />

    <ContextMenu :visible="contextMenu.visible" :x="contextMenu.x" :y="contextMenu.y" @action="handleMenuAction"
      @close="contextMenu.visible = false" />

    <div class="dashboard" @mousemove="handleMouseMove" :class="{ 'zen-mode': isZenMode }">
      <div class="layout-grid" :class="{ 'zen-active': isZenMode }">

        <!-- Profile Column -->
        <UserProfile @open-terminal="showTerminal = true" />

        <!-- Main Content Column -->
        <MainContent
          :is-zen-mode="isZenMode"
          @toggle-zen="toggleZenMode"
        />

        <!-- Skills Column -->
        <SkillRack />

      </div>

      <footer class="app-footer" dir="ltr">
        <span class="made-by">Handcrafted by
          <strong class="brand-signature" style="color: var(--neon)">Damoon</strong></span>
        <span class="divider">|</span>
        <span class="version-tag">v{{ appVersion }}</span>
        <span class="divider">|</span>
        <span class="ai-credit">Co-piloted by <span class="gemini-text">Gemini</span></span>
      </footer>
    </div>
  </div>
</template>

<style scoped>
/* App specific global-ish layout styles that aren't in components.css */
/* Many styles are now in components.css or style.css, or specific components. */
/* We keep the layout grid and footer here as they define the page structure. */

.dashboard {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: 25px;
  box-sizing: border-box;
  transition: 0.3s;
}

.dashboard.zen-mode {
  padding: 0 !important;
}

.layout-grid {
  display: grid;
  grid-template-columns: 280px 1fr 260px;
  gap: 25px;
  width: 100%;
  max-width: 1600px;
  margin: 0 auto;
  flex: 1;
  min-height: 0;
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.layout-grid.zen-active {
  grid-template-columns: 0px 1fr 0px;
  gap: 0;
  width: 100%;
  max-width: none;
}

/* Hide sidebars in zen mode */
.layout-grid.zen-active :deep(.col-profile),
.layout-grid.zen-active :deep(.col-skills) {
  opacity: 0;
  pointer-events: none;
  padding: 0;
  overflow: hidden;
  width: 0; /* Add width 0 to collapse */
}

.layout-grid.zen-active :deep(.col-main.glass-panel) {
  border-radius: 0;
  border: none;
}

.dashboard.zen-mode .app-footer {
  display: none !important;
}

.app-footer {
  width: 100%;
  max-width: 1600px;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  padding-top: 15px;
  color: var(--text-secondary);
  font-size: 0.8rem;
  font-family: monospace;
  opacity: 0.7;
  transition: 0.3s;
  flex-shrink: 0;
}

.app-footer:hover {
  opacity: 1;
}

.divider {
  color: var(--text-secondary);
}

.gemini-text {
  background: linear-gradient(90deg, #4285f4, #9b72cb, #d96570);
  -webkit-background-clip: text;
  color: transparent;
  font-weight: bold;
}

.brand-signature {
  font-family: "Courier New", monospace;
  letter-spacing: 1px;
  text-shadow: 0 0 5px var(--neon), 0 0 10px var(--neon);
  transition: all 0.3s ease;
  display: inline-block;
  cursor: default;
}

.brand-signature:hover {
  text-shadow: 0 0 10px var(--neon), 0 0 20px var(--neon), 0 0 30px var(--neon);
  transform: scale(1.1);
}

.version-tag {
  font-family: monospace;
  background: var(--item-bg);
  padding: 2px 6px;
  border-radius: 4px;
  color: var(--text-secondary);
  font-size: 0.75rem;
  border: 1px solid var(--panel-border);
}

/* Mobile responsive */
@media (max-width: 1024px) {
  .dashboard {
    display: block;
    padding: 15px;
    height: auto;
    overflow: auto;
  }
  .layout-grid {
    display: flex;
    flex-direction: column;
    height: auto;
    max-height: none;
    gap: 20px;
  }
  .dashboard.zen-mode {
    height: 100vh !important;
    overflow: hidden !important;
    display: flex !important;
    flex-direction: column;
    padding: 0 !important;
  }
  .layout-grid.zen-active {
    display: flex;
    flex-direction: column;
    height: 100% !important;
    gap: 0;
  }
  .layout-grid.zen-active :deep(.col-profile),
  .layout-grid.zen-active :deep(.col-skills) {
    display: none !important;
  }
  .layout-grid.zen-active :deep(.col-main) {
    flex: 1;
    height: 100% !important;
    max-height: 100%;
    display: flex;
    flex-direction: column;
    border-radius: 0;
    border: none;
  }
}
</style>

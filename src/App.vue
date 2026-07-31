<script setup>
import {
  defineAsyncComponent,
  onMounted,
  onUnmounted,
  ref,
  watch,
} from "vue";
import BootSequence from "./components/BootSequence.vue";
import LiquidIdentityCard from "./components/LiquidIdentityCard.vue";

import { usePortfolio } from "./composables/usePortfolio";
import { useTheme } from "./composables/useTheme";
import { useAudioSynth } from "./composables/useAudioSynth";
import {
  getNoteSlug,
  getProjectPath,
  useNavigation,
} from "./composables/useNavigation";
import { useSEO } from "./composables/useSEO";

const CustomCursor = defineAsyncComponent(() => import("./components/CustomCursor.vue"));
const MatrixRain = defineAsyncComponent(() => import("./components/MatrixRain.vue"));
const TerminalModal = defineAsyncComponent(() => import("./components/TerminalModal.vue"));
const UserProfile = defineAsyncComponent(() => import("./components/dashboard/UserProfile.vue"));
const MainContent = defineAsyncComponent(() => import("./components/dashboard/MainContent.vue"));
const SkillRack = defineAsyncComponent(() => import("./components/dashboard/SkillRack.vue"));
const GlobalCommandBar = defineAsyncComponent(
  () => import("./components/dashboard/GlobalCommandBar.vue"),
);
const PrintResumeView = defineAsyncComponent(
  () => import("./components/PrintResumeView.vue"),
);
const PureMinimalLayout = defineAsyncComponent(
  () => import("./components/dashboard/PureMinimalLayout.vue"),
);

// --- Composables ---
const {
  projects,
  notes,
  mySkills,
  userGithub,
  fetchData,
  selectedNote,
  openNote,
  closeNote,
  activeTab,
  profile,
  resumeUrl
} = usePortfolio();

const { currentThemeColor } = useTheme();
const { playBootChime } = useAudioSynth();
const { currentPath, route, navigateTo } = useNavigation();
const { setSEO, siteUrl } = useSEO();

// --- App State ---
const appVersion = __APP_VERSION__;
const prefersReducedMotion =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const showBoot = ref(
  typeof window !== "undefined" &&
    window.location.pathname === "/" &&
    !prefersReducedMotion &&
    !window.sessionStorage.getItem("portfolio-boot-seen"),
);
const isBooted = ref(false);
const showIdentityCard = ref(route.value.isHome);
const isEnteringDashboard = ref(false);
const isMatrixMode = ref(false);
const showTerminal = ref(false);
const isZenMode = ref(false);
const terminalInitialCommand = ref('');

// --- Methods ---
const handleRunCommand = (cmd) => {
  terminalInitialCommand.value = cmd;
  showTerminal.value = true;
};

const handleBootComplete = () => {
  window.sessionStorage.setItem("portfolio-boot-seen", "true");
  showBoot.value = false;
  setTimeout(() => {
    isBooted.value = true;
    playBootChime();
  }, 100);
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

const enterDashboard = () => {
  if (isEnteringDashboard.value) return;
  isEnteringDashboard.value = true;
  window.setTimeout(() => {
    showIdentityCard.value = false;
    isEnteringDashboard.value = false;
    navigateTo("/projects/");
  }, prefersReducedMotion ? 0 : 420);
};

const goHome = () => {
  closeNote();
  isZenMode.value = false;
  showIdentityCard.value = true;
  navigateTo("/");
};

const routeToTab = {
  projects: "projects",
  interests: "interests",
  roadmap: "roadmap",
  experience: "history",
  guestbook: "guestbook",
  notes: "notes",
};

const plainText = (value) =>
  String(value || "")
    .replace(/[`*_>#\[\]()!-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const updateRouteState = () => {
  const nextRoute = route.value;
  if (typeof document !== "undefined") {
    if (nextRoute.isResume) {
      document.documentElement.classList.add("resume-active");
      document.body.classList.add("resume-active");
    } else {
      document.documentElement.classList.remove("resume-active");
      document.body.classList.remove("resume-active");
    }
  }

  if (nextRoute.isHome) {
    showIdentityCard.value = true;
    closeNote();
    return;
  }

  showIdentityCard.value = false;
  activeTab.value = routeToTab[nextRoute.section] || "projects";

  if (nextRoute.isNote) {
    const note = notes.value.find((item) => getNoteSlug(item) === nextRoute.slug);
    if (note && selectedNote.value?.id !== note.id) openNote(note);
  } else if (selectedNote.value) {
    closeNote();
  }
};

const updateRouteSEO = () => {
  const nextRoute = route.value;
  const person = {
    "@type": "Person",
    "@id": `${siteUrl}/#person`,
    name: "Alireza Lotfi Moghaddam",
    alternateName: ["علیرضا لطفی مقدم", "Alireza Lotfi", "Damoon"],
    url: siteUrl,
    image: `${siteUrl}/Damoon-d.jpg`,
    jobTitle: "Software Engineer",
    sameAs: [
      `https://github.com/${userGithub.value}`,
      profile.value.contact?.linkedin,
    ].filter(Boolean),
    knowsAbout: [
      "C#",
      ".NET",
      "ASP.NET Core",
      "WPF",
      "Distributed Systems",
      "API Design",
      "SQL Server",
    ],
  };

  if (nextRoute.isProject) {
    const project = projects.value.find(
      (item) => getProjectPath(item) === nextRoute.path,
    );
    if (project) {
      setSEO({
        title: `${project.name} | پروژه‌های علیرضا لطفی مقدم`,
        description: plainText(project.description).slice(0, 160),
        path: nextRoute.path,
        type: "article",
        structuredData: {
          "@context": "https://schema.org",
          "@type": "SoftwareSourceCode",
          name: project.name,
          description: plainText(project.description),
          codeRepository: project.html_url !== "#" ? project.html_url : undefined,
          programmingLanguage: project.language,
          author: person,
          dateModified: project.updatedAt,
          url: `${siteUrl}${nextRoute.path}`,
        },
      });
      return;
    }
  }

  if (nextRoute.isNote) {
    const note = notes.value.find((item) => getNoteSlug(item) === nextRoute.slug);
    if (note) {
      setSEO({
        title: `${note.title} | یادداشت‌های علیرضا لطفی مقدم`,
        description: plainText(note.body).slice(0, 160),
        path: nextRoute.path,
        type: "article",
        structuredData: {
          "@context": "https://schema.org",
          "@type": "Article",
          headline: note.title,
          description: plainText(note.body).slice(0, 200),
          datePublished: note.created_at,
          dateModified:
            note.comments?.at(-1)?.created_at || note.created_at,
          author: person,
          mainEntityOfPage: `${siteUrl}${nextRoute.path}`,
        },
      });
      return;
    }
  }

  const sectionSEO = {
    home: {
      title:
        "علیرضا لطفی مقدم | Alireza Lotfi Moghaddam — Software Engineer",
      description:
        "مهندس نرم‌افزار متخصص در C#، ASP.NET Core، WPF، طراحی API و سیستم‌های توزیع‌شده.",
    },
    projects: {
      title: "پروژه‌ها | علیرضا لطفی مقدم",
      description:
        "مطالعات موردی پروژه‌های بک‌اند، دسکتاپ، بلادرنگ و سازمانی علیرضا لطفی مقدم.",
    },
    experience: {
      title: "سوابق کاری | علیرضا لطفی مقدم",
      description:
        "سوابق کاری و تجربه مهندسی نرم‌افزار علیرضا لطفی مقدم در توسعه API، WPF و سامانه‌های عملیاتی.",
    },
    notes: {
      title: "یادداشت‌ها | علیرضا لطفی مقدم",
      description:
        "یادداشت‌های فنی و تاریخچه توسعه پروژه‌های علیرضا لطفی مقدم.",
    },
    interests: {
      title: "علاقه‌مندی‌های فنی | علیرضا لطفی مقدم",
      description:
        "علاقه‌مندی‌های علیرضا لطفی مقدم در معماری نرم‌افزار، سیستم‌های توزیع‌شده و تعامل سخت‌افزار و نرم‌افزار.",
    },
    roadmap: {
      title: "مسیر یادگیری | علیرضا لطفی مقدم",
      description:
        "مسیر یادگیری و اهداف فنی علیرضا لطفی مقدم در معماری، داده و هوش مصنوعی.",
    },
    guestbook: {
      title: "دفترچه یادگاری | علیرضا لطفی مقدم",
      description: "پیام‌ها و بازخوردهای بازدیدکنندگان پورتفولیوی علیرضا لطفی مقدم.",
    },
    resume: {
      title: "رزومه علیرضا لطفی مقدم | Printable Resume",
      description: "نسخه قابل چاپ و متنی رزومه علیرضا لطفی مقدم، ارشد نرم‌افزار.",
    },
  };
  const meta = sectionSEO[nextRoute.section] || sectionSEO.home;

  setSEO({
    ...meta,
    path: nextRoute.path,
    structuredData:
      nextRoute.isHome
        ? {
            "@context": "https://schema.org",
            "@type": "ProfilePage",
            "@id": `${siteUrl}/#profile`,
            url: siteUrl,
            name: meta.title,
            mainEntity: person,
          }
        : {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: meta.title,
            description: meta.description,
            url: `${siteUrl}${nextRoute.path}`,
            author: person,
          },
  });
};

let konamiIndex = 0;
const konamiCode = [
  "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
  "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight",
  "b", "a",
];
const handleKonami = (event) => {
  if (event.key === konamiCode[konamiIndex]) {
    konamiIndex += 1;
    if (konamiIndex === konamiCode.length) {
      document.documentElement.style.setProperty("--neon", "#ff00ff");
      konamiIndex = 0;
    }
  } else {
    konamiIndex = 0;
  }
};

watch([currentPath, notes, projects, profile], () => {
  updateRouteState();
  updateRouteSEO();
});

onMounted(() => {
  fetchData();
  window.addEventListener("keydown", handleKeydown);
  window.addEventListener("keydown", handleKonami);
  updateRouteState();
  updateRouteSEO();

  console.log(
    "%c Hello from Damoon! 🌲💻 \n Looking for bugs? Good luck! ",
    "background: #0a0a0a; color: #67FF64; font-size: 14px; padding: 15px; border-radius: 5px; border: 2px solid #67FF64; font-family: monospace;",
  );

});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeydown);
  window.removeEventListener("keydown", handleKonami);
});
</script>

<template>
  <a class="skip-link" href="#main-content">رفتن به محتوای اصلی</a>
  <CustomCursor />
  <Transition name="fade">
    <BootSequence v-if="showBoot" @completed="handleBootComplete" />
  </Transition>

  <div v-show="!showBoot" class="main-wrapper" :class="{ 'fade-in-enter': isBooted }">
    <Transition name="fade">
      <MatrixRain v-if="isMatrixMode" :color="currentThemeColor" :key="currentThemeColor" />
      <div v-else class="ambient-backdrop" aria-hidden="true">
        <span class="ambient-orb orb-one"></span>
        <span class="ambient-orb orb-two"></span>
      </div>
    </Transition>

    <TerminalModal :visible="showTerminal" :initial-command="terminalInitialCommand" :projects="projects" :skills="mySkills" :contact="{
      email: profile.contact?.email,
      linkedin: profile.contact?.linkedin,
      github: userGithub,
      telegram: profile.contact?.telegramId,
    }" :learning="profile.learning" :version="appVersion" username="Damoon" role="Software Engineer" @close="showTerminal = false; terminalInitialCommand = ''" @toggle-matrix="isMatrixMode = !isMatrixMode" />

    <div class="dashboard" @mousemove="handleMouseMove" :class="{ 'zen-mode': isZenMode, 'resume-active': route.isResume }">
      <Transition name="identity-card">
        <LiquidIdentityCard
          v-if="showIdentityCard"
          :profile="profile"
          :resume-url="resumeUrl"
          :projects-count="projects.length"
          :class="{ exiting: isEnteringDashboard }"
          @enter="enterDashboard"
          @open-terminal="showTerminal = true"
        />
      </Transition>

      <div v-if="route.isResume" class="resume-mode-container">
        <PrintResumeView />
      </div>

      <div v-else-if="!showIdentityCard" class="pure-layout-wrapper">
        <PureMinimalLayout
          id="main-content"
          :is-zen-mode="isZenMode"
          @toggle-zen="toggleZenMode"
          @open-terminal="showTerminal = true"
          @go-home="goHome"
        />
      </div>

      <footer class="app-footer" dir="ltr" :class="{ dimmed: showIdentityCard }">
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
  min-height: 100dvh;
  width: 100%;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  padding: 0;
  box-sizing: border-box;
  transition: 0.3s;
  position: relative;
  z-index: 1;
  touch-action: pan-y;
}

.dashboard.zen-mode {
  padding: 0 !important;
}

.dashboard.resume-active {
  overflow-y: auto !important;
  height: auto !important;
  min-height: 100dvh;
}

.resume-mode-container {
  flex: 1;
  width: 100%;
  overflow-y: auto;
  min-height: 0;
}

.layout-grid {
  display: grid;
  grid-template-columns: 280px 1fr 260px;
  gap: 18px;
  width: 100%;
  max-width: 1580px;
  margin: 0 auto;
  flex: 1;
  min-height: 0;
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.layout-grid.intro-active {
  filter: blur(12px);
  transform: scale(0.965);
  opacity: 0.3;
  pointer-events: none;
}

.layout-grid.intro-leaving {
  filter: blur(0);
  transform: scale(1);
  opacity: 1;
}

.layout-grid.zen-active {
  grid-template-columns: 0px 1fr 0px;
  gap: 0;
  width: 100%;
  max-width: none;
}

/* Column 2 wrapper: stacks command bar + tabbed content */
.col-main-wrapper {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 0;
  height: 100%;
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

.layout-grid.zen-active .col-main-wrapper :deep(.col-main.glass-panel) {
  border-radius: 0;
  border: none;
}

.dashboard.zen-mode .app-footer {
  display: none !important;
}

.app-footer {
  width: 100%;
  max-width: 1580px;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  padding-top: 14px;
  color: var(--text-secondary);
  font-size: 0.8rem;
  font-family: var(--font-mono);
  opacity: 0.8;
  transition: 0.3s;
  flex-shrink: 0;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.42);
}

.app-footer.dimmed {
  opacity: 0.2;
  filter: blur(6px);
}

.identity-card-enter-active,
.identity-card-leave-active {
  transition: opacity 0.42s ease, transform 0.42s ease, filter 0.42s ease;
}

.identity-card-enter-from,
.identity-card-leave-to {
  opacity: 0;
  transform: translateY(18px) scale(0.97);
  filter: blur(10px);
}

.app-footer:hover {
  opacity: 1;
}

.divider {
  color: var(--text-secondary);
}

.gemini-text {
  background: linear-gradient(90deg, #5b8fca, #7caad7, #83c0d8);
  -webkit-background-clip: text;
  color: transparent;
  font-weight: bold;
}

.brand-signature {
  font-family: var(--font-mono);
  letter-spacing: 0.04em;
  text-shadow: 0 0 12px rgba(255, 255, 255, 0.7);
  transition: all 0.3s ease;
  display: inline-block;
  cursor: default;
}

.brand-signature:hover {
  text-shadow: 0 0 16px rgba(255, 255, 255, 0.82);
  transform: translateY(-1px);
}

.version-tag {
  background: rgba(255, 255, 255, 0.32);
  padding: 4px 10px;
  border-radius: 999px;
  color: var(--text-secondary);
  font-size: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.54);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.56);
}

.ambient-backdrop {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.ambient-orb {
  position: absolute;
  display: block;
  border-radius: 50%;
  filter: blur(58px);
  opacity: 0.32;
  animation: ambientFloat 24s ease-in-out infinite;
}

.orb-one {
  width: 24vw;
  height: 24vw;
  top: 10%;
  left: 8%;
  min-width: 180px;
  min-height: 180px;
  background: rgba(255, 255, 255, 0.46);
}

.orb-two {
  width: 18vw;
  height: 18vw;
  right: 12%;
  top: 18%;
  min-width: 140px;
  min-height: 140px;
  background: rgba(177, 216, 248, 0.24);
  animation-duration: 28s;
  animation-direction: reverse;
}

@keyframes ambientFloat {
  0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
  50% { transform: translate3d(1.5vw, -1.5vw, 0) scale(1.05); }
}

/* Mobile responsive */
@media (max-width: 1024px) {
  .dashboard {
    display: block;
    padding: 14px;
    min-height: 100dvh;
    height: auto;
    overflow-x: hidden;
    overflow-y: auto;
  }
  .layout-grid {
    display: flex;
    flex-direction: column;
    height: auto;
    max-height: none;
    gap: 20px;
  }
  .layout-grid :deep(.col-profile) {
    order: 1;
  }
  .col-main-wrapper {
    order: 2;
  }
  .layout-grid :deep(.col-skills) {
    order: 3;
  }
  .layout-grid.intro-active {
    transform: scale(0.98);
  }
  .app-footer {
    flex-wrap: wrap;
    gap: 10px;
    padding: 18px 0 4px;
    text-align: center;
  }
  .dashboard.zen-mode {
    height: 100dvh !important;
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
  .layout-grid.zen-active .col-main-wrapper :deep(.col-main) {
    flex: 1;
    height: 100% !important;
    max-height: 100%;
    display: flex;
    flex-direction: column;
    border-radius: 0;
    border: none;
  }
  .layout-grid.zen-active .col-main-wrapper {
    gap: 0;
  }
}
</style>

<script setup>
import { ref, onMounted, onUnmounted, defineAsyncComponent } from 'vue';
import { usePortfolio } from '../../composables/usePortfolio';
import { useAudioSynth } from '../../composables/useAudioSynth';
import { useNavigation } from '../../composables/useNavigation';

const ProjectsTab = defineAsyncComponent(() => import('./tabs/ProjectsTab.vue'));
const InterestsTab = defineAsyncComponent(() => import('./tabs/InterestsTab.vue'));
const RoadmapTab = defineAsyncComponent(() => import('./tabs/RoadmapTab.vue'));
const NotesTab = defineAsyncComponent(() => import('./tabs/NotesTab.vue'));
const HistoryTab = defineAsyncComponent(() => import('./tabs/HistoryTab.vue'));
const GuestbookTab = defineAsyncComponent(() => import('./tabs/GuestbookTab.vue'));

import SkeletonGrid from '../skeletons/SkeletonGrid.vue';
import SkeletonList from '../skeletons/SkeletonList.vue';

const {
  activeTab,
  selectedNote,
  loading,
  activeFilter,
  availableLanguages,
  projects,
  closeNote,
  profile,
} = usePortfolio();

const { playClick } = useAudioSynth();
const { tabPaths, navigateFromEvent } = useNavigation();

const props = defineProps({
  isZenMode: Boolean
});

const emit = defineEmits(['toggle-zen', 'open-terminal']);

const activeSection = ref('about');
const contentBodyRef = ref(null);
let observer = null;

const navItems = [
  { id: 'about', label: 'درباره من', icon: '✦' },
  { id: 'projects', label: 'پروژه‌ها', icon: '🚀' },
  { id: 'experience', label: 'سوابق کاری', icon: '💼' },
  { id: 'interests', label: 'حوزه‌های تمرکز', icon: '⚡' },
  { id: 'roadmap', label: 'مسیر من', icon: '🗺️' },
  { id: 'notes', label: 'یادداشت‌ها', icon: '📝' },
];

onMounted(() => {
  if (!contentBodyRef.value) return;

  const sections = contentBodyRef.value.querySelectorAll('.elite-section');
  if (!sections.length) return;

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          activeSection.value = entry.target.id;
        }
      });
    },
    {
      root: contentBodyRef.value,
      threshold: 0.15,
      rootMargin: '-10% 0px -40% 0px',
    }
  );

  sections.forEach((sec) => observer.observe(sec));
});

onUnmounted(() => {
  if (observer) observer.disconnect();
});

const scrollToSection = (sectionId, event) => {
  playClick();
  closeNote();
  if (event) event.preventDefault();

  const target = document.getElementById(sectionId);
  if (target) {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};
</script>

<template>
  <main class="col-main master-minimal-canvas main-box">
    <!-- Floating Exit Zen Button -->
    <button v-if="isZenMode" @click="playClick(); emit('toggle-zen')" class="exit-zen-btn" title="خروج از حالت تمرکز (Ctrl + Z)" dir="rtl">
      <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
      </svg>
      <span>خروج از حالت تمرکز</span>
    </button>

    <!-- Floating Master Dock Navigation -->
    <header class="master-dock-header" :class="{ hidden: isZenMode }">
      <nav class="dock-nav-list" aria-label="ناوبری اصلی پورتفولیو">
        <a
          v-for="item in navItems"
          :key="item.id"
          :href="`#${item.id}`"
          @click="scrollToSection(item.id, $event)"
          :class="{ active: !selectedNote && activeSection === item.id }"
        >
          <span class="dock-icon">{{ item.icon }}</span>
          <span class="dock-label">{{ item.label }}</span>
        </a>
      </nav>

      <a
        :href="tabPaths.resume"
        @click="navigateFromEvent($event, tabPaths.resume)"
        class="dock-resume-btn"
        title="مشاهده رزومه A4"
      >
        📄 مشاهده رزومه
      </a>
    </header>

    <div class="content-body master-scroll-pane" ref="contentBodyRef">
      <div v-if="loading" class="loading-skeletons">
        <SkeletonGrid v-if="activeTab === 'projects' || activeTab === 'interests'" />
        <SkeletonList v-else />
      </div>

      <div v-else-if="selectedNote" class="thread-view-wrapper">
        <NotesTab :is-detail="true" @toggle-zen="emit('toggle-zen')" :is-zen-mode="isZenMode" />
      </div>

      <!-- Pure Masterpiece Minimalist Content Stream -->
      <div v-else class="master-canvas-stream">
        <!-- 00 // HERO ABOUT -->
        <section id="about" class="elite-section hero-section-box">
          <div class="hero-header-block">
            <span class="hero-kicker mono-ui" dir="ltr">SENIOR SOFTWARE ENGINEER & BACKEND ARCHITECT</span>
            <h1>علیرضا لطفی مقدم</h1>
            <p class="hero-tagline">
              معمار نرم‌افزار متمرکز بر توسعه سیستم‌های توزیع‌شده با کارایی بالا، موتورهای C# و .NET Core، پردازش داده و نرم‌افزارهای دسکتاپ صنعتی (WPF).
            </p>
          </div>

          <div class="hero-stats-row">
            <div class="hero-stat-card">
              <span class="num mono-ui">+۶</span>
              <span class="label">سال سابقه تخصصی</span>
            </div>
            <div class="hero-stat-card">
              <span class="num mono-ui">+۱۵</span>
              <span class="label">پروژه عملیاتی</span>
            </div>
            <div class="hero-stat-card">
              <span class="num mono-ui">.NET / C#</span>
              <span class="label">استک اصلی</span>
            </div>
          </div>

          <div class="hero-actions-row">
            <a :href="tabPaths.resume" @click="navigateFromEvent($event, tabPaths.resume)" class="hero-btn primary">
              📄 دریافت رزومه A4
            </a>
            <button @click="emit('open-terminal')" class="hero-btn secondary mono-ui">
              ⌨️ ترمینال CLI (Ctrl+K)
            </button>
          </div>
        </section>

        <!-- 01 // PROJECTS -->
        <section id="projects" class="elite-section">
          <div class="elite-title-bar">
            <div class="title-left">
              <span class="sec-icon">🚀</span>
              <h2>پروژه‌ها و شاهکارهای مهندسی</h2>
            </div>
          </div>
          <ProjectsTab />
        </section>

        <!-- 02 // EXPERIENCE -->
        <section id="experience" class="elite-section">
          <div class="elite-title-bar">
            <div class="title-left">
              <span class="sec-icon">💼</span>
              <h2>سوابق کاری و دستاوردهای اجرایی</h2>
            </div>
          </div>
          <HistoryTab />
        </section>

        <!-- 03 // INTERESTS -->
        <section id="interests" class="elite-section">
          <div class="elite-title-bar">
            <div class="title-left">
              <span class="sec-icon">⚡</span>
              <h2>حوزه‌های تخصصی و تمرکز فنی</h2>
            </div>
          </div>
          <InterestsTab />
        </section>

        <!-- 04 // ROADMAP -->
        <section id="roadmap" class="elite-section">
          <div class="elite-title-bar">
            <div class="title-left">
              <span class="sec-icon">🗺️</span>
              <h2>مسیر من و اهداف توسعه</h2>
            </div>
          </div>
          <RoadmapTab />
        </section>

        <!-- 05 // NOTES -->
        <section id="notes" class="elite-section">
          <div class="elite-title-bar">
            <div class="title-left">
              <span class="sec-icon">📝</span>
              <h2>یادداشت‌های فنی و مقالات</h2>
            </div>
          </div>
          <NotesTab />
        </section>

        <!-- 06 // GUESTBOOK -->
        <section id="guestbook" class="elite-section">
          <div class="elite-title-bar">
            <div class="title-left">
              <span class="sec-icon">✒️</span>
              <h2>دفترچه یادگاری</h2>
            </div>
          </div>
          <GuestbookTab />
        </section>
      </div>
    </div>
  </main>
</template>

<style scoped>
.master-minimal-canvas {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: transparent;
  border: none;
  box-shadow: none;
}

.master-dock-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 16px;
  background: var(--item-bg);
  border: 1px solid var(--panel-border);
  border-radius: 18px;
  margin-bottom: 18px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 8px 24px rgba(0, 0, 0, 0.2);
}

.master-dock-header.hidden {
  display: none !important;
}

.dock-nav-list {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  scrollbar-width: none;
}

.dock-nav-list::-webkit-scrollbar {
  display: none;
}

.dock-nav-list a {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 12px;
  font-size: 0.84rem;
  color: var(--text-secondary);
  text-decoration: none;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  white-space: nowrap;
  background: transparent;
  border: 1px solid transparent;
}

.dock-nav-list a:hover {
  color: var(--text-main);
  background: var(--item-hover-bg);
  border-color: var(--panel-border);
}

.dock-nav-list a.active {
  color: var(--neon);
  background: rgba(56, 189, 248, 0.12);
  border-color: var(--neon);
  font-weight: 700;
  box-shadow: 0 0 14px rgba(56, 189, 248, 0.25);
}

.dock-resume-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 12px;
  background: var(--neon);
  color: #040814;
  font-size: 0.82rem;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.2s ease;
  white-space: nowrap;
  box-shadow: 0 0 16px rgba(56, 189, 248, 0.3);
}

.dock-resume-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 0 20px rgba(56, 189, 248, 0.5);
}

.master-scroll-pane {
  flex: 1;
  overflow-y: auto;
  padding-right: 4px;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
}

.master-canvas-stream {
  display: flex;
  flex-direction: column;
  gap: 48px;
}

.hero-section-box {
  padding: 32px 30px;
  background: var(--item-bg);
  border: 1px solid var(--panel-border);
  border-radius: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 16px 36px rgba(0, 0, 0, 0.25);
}

.hero-header-block {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.hero-kicker {
  font-size: 0.76rem;
  color: var(--neon);
  font-weight: 700;
  letter-spacing: 1px;
}

.hero-header-block h1 {
  margin: 0;
  font-size: 2.1rem;
  color: var(--text-main);
  font-weight: 800;
  line-height: 1.25;
}

.hero-tagline {
  margin: 0;
  font-size: 0.98rem;
  color: var(--text-secondary);
  line-height: 1.75;
  text-align: justify;
}

.hero-stats-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}

.hero-stat-card {
  padding: 16px;
  background: var(--bar-bg);
  border: 1px solid var(--panel-border);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  text-align: center;
}

.hero-stat-card .num {
  font-size: 1.35rem;
  font-weight: 800;
  color: var(--neon);
}

.hero-stat-card .label {
  font-size: 0.78rem;
  color: var(--text-secondary);
}

.hero-actions-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.hero-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 22px;
  border-radius: 14px;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  font-family: inherit;
}

.hero-btn.primary {
  background: var(--neon);
  color: #040814;
  border: none;
  box-shadow: 0 0 16px rgba(56, 189, 248, 0.3);
}

.hero-btn.primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 0 24px rgba(56, 189, 248, 0.5);
}

.hero-btn.secondary {
  background: var(--item-bg);
  border: 1px solid var(--panel-border);
  color: var(--text-main);
}

.hero-btn.secondary:hover {
  border-color: var(--neon);
  background: var(--item-hover-bg);
}

.elite-section {
  scroll-margin-top: 20px;
}

.elite-title-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--panel-border);
}

.title-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.sec-icon {
  font-size: 1.3rem;
}

.title-left h2 {
  margin: 0;
  font-size: 1.25rem;
  color: var(--text-main);
  font-weight: 700;
}

@media (max-width: 1024px) {
  .master-dock-header {
    flex-direction: column;
    align-items: stretch;
  }

  .hero-stats-row {
    grid-template-columns: 1fr;
  }

  .hero-actions-row {
    flex-direction: column;
  }

  .hero-btn {
    width: 100%;
  }
}
</style>

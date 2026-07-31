<script setup>
import { ref, onMounted, onUnmounted, defineAsyncComponent } from 'vue';
import { usePortfolio } from '../../composables/usePortfolio';
import { useAudioSynth } from '../../composables/useAudioSynth';
import { useNavigation, getProjectPath } from '../../composables/useNavigation';

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

const emit = defineEmits(['toggle-zen']);

const activeSection = ref('about');
const contentBodyRef = ref(null);
let observer = null;

const navItems = [
  { id: 'about', label: 'درباره من', num: '۰۰' },
  { id: 'experience', label: 'سوابق کاری', num: '۰۱' },
  { id: 'projects', label: 'پروژه‌ها', num: '۰۲' },
  { id: 'interests', label: 'علاقه‌مندی‌ها', num: '۰۳' },
  { id: 'roadmap', label: 'مسیر من', num: '۰۴' },
  { id: 'notes', label: 'یادداشت‌ها', num: '۰۵' },
];

onMounted(() => {
  if (!contentBodyRef.value) return;

  const sections = contentBodyRef.value.querySelectorAll('.minimal-section');
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
  <main class="col-main minimalist-canvas main-box">
    <!-- Floating Exit Zen Button -->
    <button v-if="isZenMode" @click="playClick(); emit('toggle-zen')" class="exit-zen-btn" title="خروج از حالت تمرکز (Ctrl + Z)" dir="rtl">
      <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
      </svg>
      <span>خروج از حالت تمرکز</span>
    </button>

    <!-- Minimalist Navigation Bar -->
    <header class="minimal-nav-bar" :class="{ hidden: isZenMode }">
      <nav class="minimal-nav-list" aria-label="ناوبری اصلی">
        <a
          v-for="item in navItems"
          :key="item.id"
          :href="`#${item.id}`"
          @click="scrollToSection(item.id, $event)"
          :class="{ active: !selectedNote && activeSection === item.id }"
        >
          <span class="nav-num mono-ui" dir="ltr">{{ item.num }}</span>
          <span class="nav-label">{{ item.label }}</span>
        </a>
      </nav>

      <div v-if="(activeSection === 'projects' || activeTab === 'projects') && !selectedNote" class="minimal-filter-row">
        <div class="filter-chips">
          <button v-for="lang in availableLanguages" :key="lang" @click="activeFilter = lang"
            :class="{ 'active-filter': activeFilter === lang }" class="filter-btn">
            <span>{{ lang === 'All' ? 'همه' : lang }}</span>
            <span class="chip-count">
              {{ lang === 'All' ? projects.length : projects.filter(p => p.language && p.language.includes(lang)).length }}
            </span>
          </button>
        </div>
      </div>
    </header>

    <div class="content-body minimal-scroll-pane" ref="contentBodyRef">
      <div v-if="loading" class="loading-skeletons">
        <SkeletonGrid v-if="activeTab === 'projects' || activeTab === 'interests'" />
        <SkeletonList v-else />
      </div>

      <div v-else-if="selectedNote" class="thread-view-wrapper">
        <NotesTab :is-detail="true" @toggle-zen="emit('toggle-zen')" :is-zen-mode="isZenMode" />
      </div>

      <!-- Pure Minimalist Canvas Content Stream -->
      <div v-else class="minimal-canvas-stream">
        <!-- 00 // ABOUT ME -->
        <section id="about" class="minimal-section">
          <div class="section-title-line">
            <span class="sec-num mono-ui" dir="ltr">00 //</span>
            <h2>درباره من</h2>
          </div>
          <div class="about-text-block">
            <p class="lead-paragraph">
              من <strong>علیرضا لطفی مقدم</strong> هستم؛ مهندس نرم‌افزار ارشد و معمار سیستم متمرکز بر <strong>C#، ASP.NET Core، سیستم‌های توزیع‌شده و WPF</strong>.
            </p>
            <p>
              بیش از ۶ سال است که در زمینه طراحی سامانه‌های با کارایی بالا (High-Performance)، یکپارچه‌سازی سخت‌افزاری و بیومتریک (Suprema/WIA)، معمار سرویس‌های بلادرنگ (SignalR) و توسعه ابزارهای هوشمند دسکتاپ فعالیت می‌کنم.
            </p>
          </div>
        </section>

        <!-- 01 // EXPERIENCE -->
        <section id="experience" class="minimal-section">
          <div class="section-title-line">
            <span class="sec-num mono-ui" dir="ltr">01 //</span>
            <h2>سوابق کاری</h2>
          </div>
          <HistoryTab />
        </section>

        <!-- 02 // PROJECTS -->
        <section id="projects" class="minimal-section">
          <div class="section-title-line">
            <span class="sec-num mono-ui" dir="ltr">02 //</span>
            <h2>پروژه‌های برجسته</h2>
          </div>
          <ProjectsTab />
        </section>

        <!-- 03 // INTERESTS -->
        <section id="interests" class="minimal-section">
          <div class="section-title-line">
            <span class="sec-num mono-ui" dir="ltr">03 //</span>
            <h2>علاقه‌مندی‌ها و حوزه‌های تخصصی</h2>
          </div>
          <InterestsTab />
        </section>

        <!-- 04 // ROADMAP -->
        <section id="roadmap" class="minimal-section">
          <div class="section-title-line">
            <span class="sec-num mono-ui" dir="ltr">04 //</span>
            <h2>مسیر من و یادگیری</h2>
          </div>
          <RoadmapTab />
        </section>

        <!-- 05 // NOTES -->
        <section id="notes" class="minimal-section">
          <div class="section-title-line">
            <span class="sec-num mono-ui" dir="ltr">05 //</span>
            <h2>یادداشت‌های فنی</h2>
          </div>
          <NotesTab />
        </section>

        <!-- 06 // GUESTBOOK -->
        <section id="guestbook" class="minimal-section">
          <div class="section-title-line">
            <span class="sec-num mono-ui" dir="ltr">06 //</span>
            <h2>یادگاری</h2>
          </div>
          <GuestbookTab />
        </section>
      </div>
    </div>
  </main>
</template>

<style scoped>
.minimalist-canvas {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: transparent;
  border: none;
  box-shadow: none;
}

.minimal-nav-bar {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px 16px;
  background: var(--item-bg);
  border: 1px solid var(--panel-border);
  border-radius: 16px;
  margin-bottom: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.minimal-nav-bar.hidden {
  display: none !important;
}

.minimal-nav-list {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  scrollbar-width: none;
}

.minimal-nav-list::-webkit-scrollbar {
  display: none;
}

.minimal-nav-list a {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 12px;
  font-size: 0.84rem;
  color: var(--text-secondary);
  text-decoration: none;
  transition: all 0.2s ease;
  white-space: nowrap;
  background: transparent;
  border: 1px solid transparent;
}

.minimal-nav-list a:hover {
  color: var(--text-main);
  background: var(--item-hover-bg);
  border-color: var(--panel-border);
}

.minimal-nav-list a.active {
  color: var(--neon);
  background: rgba(56, 189, 248, 0.1);
  border-color: var(--neon);
  font-weight: 700;
  box-shadow: 0 0 12px rgba(56, 189, 248, 0.2);
}

.nav-num {
  font-size: 0.72rem;
  opacity: 0.7;
}

.minimal-filter-row {
  display: flex;
  padding-top: 8px;
  border-top: 1px solid var(--panel-border);
}

.filter-chips {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.filter-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--item-bg);
  border: 1px solid var(--panel-border);
  color: var(--text-secondary);
  font-size: 0.76rem;
  padding: 5px 12px;
  border-radius: 999px;
  cursor: pointer;
  transition: 0.2s;
}

.filter-btn:hover {
  background: var(--item-hover-bg);
  color: var(--text-main);
  border-color: var(--neon);
}

.filter-btn.active-filter {
  background: rgba(56, 189, 248, 0.15);
  color: var(--neon);
  border-color: var(--neon);
  font-weight: 700;
}

.chip-count {
  font-size: 0.7rem;
  padding: 1px 6px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid var(--panel-border);
  color: var(--text-soft);
  font-family: var(--font-mono, monospace);
}

.minimal-scroll-pane {
  flex: 1;
  overflow-y: auto;
  padding-right: 4px;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
}

.minimal-canvas-stream {
  display: flex;
  flex-direction: column;
  gap: 50px;
}

.minimal-section {
  scroll-margin-top: 20px;
}

.section-title-line {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--panel-border);
}

.sec-num {
  font-size: 0.9rem;
  color: var(--neon);
  font-weight: 700;
}

.section-title-line h2 {
  margin: 0;
  font-size: 1.25rem;
  color: var(--text-main);
  font-weight: 700;
}

.about-text-block {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 22px 24px;
  background: var(--item-bg);
  border: 1px solid var(--panel-border);
  border-radius: 18px;
  line-height: 1.8;
  color: var(--text-secondary);
  font-size: 0.95rem;
}

.lead-paragraph {
  color: var(--text-main);
  font-size: 1.05rem;
}

.about-text-block strong {
  color: var(--neon);
}

.exit-zen-btn {
  position: absolute;
  top: 18px;
  right: 24px;
  z-index: 100;
  background: var(--glass-panel);
  border: 1px solid var(--panel-border);
  color: var(--text-soft);
  padding: 8px 14px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.76rem;
  cursor: pointer;
  transition: all 0.25s ease;
  backdrop-filter: blur(10px);
}
</style>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { usePortfolio } from '../../composables/usePortfolio';
import { useAudioSynth } from '../../composables/useAudioSynth';
import { useNavigation } from '../../composables/useNavigation';
import { useI18n } from '../../composables/useI18n';
import { useSmoothScroll } from '../../composables/useSmoothScroll';

// Child Modular Components
import EditorialHeader from './EditorialHeader.vue';
import EditorialSidebar from './EditorialSidebar.vue';
import AboutSection from './AboutSection.vue';
import ExperienceSection from './ExperienceSection.vue';
import ProjectsSection from './ProjectsSection.vue';
import SkillsSection from './SkillsSection.vue';
import NotesSection from './NotesSection.vue';
import CommandPaletteModal from './CommandPaletteModal.vue';
import CaseStudyModal from './CaseStudyModal.vue';
import EditorialFooter from './EditorialFooter.vue';

const { selectedNote, closeNote, activeFilter } = usePortfolio();
const { playClick } = useAudioSynth();
const { t, isRtl } = useI18n();
const { navigateTo } = useNavigation();

const emit = defineEmits(['open-terminal', 'go-home', 'toggle-zen']);

const props = defineProps({
  isZenMode: Boolean,
});

// --- State ---
const activeSection = ref('about');
const activeSubItem = ref('');
const scrollProgress = ref(0);
const showQrModal = ref(false);
const isPaletteOpen = ref(false);
const isCaseStudyOpen = ref(false);
const selectedCaseStudy = ref(null);
const highlightedProjectSlug = ref('');
const notesSectionRef = ref(null);

// Buttery smooth inertia scroll on window (Matt Trice style)
const { scrollTo: smoothScrollTo } = useSmoothScroll();

const sectionRoutes = {
  about: '/',
  experience: '/experience/',
  projects: '/projects/',
  skills: '/skills/',
  notes: '/notes/'
};

// --- URL & Scroll Sync ---
const getSectionFromUrl = () => {
  if (typeof window === 'undefined') return 'about';
  const path = window.location.pathname.toLowerCase().replace(/\/$/, '') || '/';
  const hash = window.location.hash.toLowerCase().replace('#', '');

  if (hash && ['about', 'experience', 'projects', 'skills', 'notes'].includes(hash)) {
    return hash;
  }

  if (path.includes('experience')) return 'experience';
  if (path.includes('projects')) return 'projects';
  if (path.includes('skills')) return 'skills';
  if (path.includes('notes')) return 'notes';
  return 'about';
};

const syncUrlWithSection = (sectionId) => {
  if (typeof window === 'undefined') return;
  const targetRoute = sectionRoutes[sectionId] || '/';
  if (window.location.pathname !== targetRoute && window.location.pathname + '/' !== targetRoute) {
    window.history.replaceState(null, '', targetRoute);
  }
};

let isManualNavScrolling = false;
let scrollLockTimeout = null;

const updateScrollProgress = () => {
  if (typeof window === 'undefined') return;
  const total = document.documentElement.scrollHeight - window.innerHeight;
  scrollProgress.value = total > 0 ? Math.min(100, Math.max(0, (window.scrollY / total) * 100)) : 0;
};

const updateActiveSectionOnScroll = () => {
  if (typeof document === 'undefined' || isManualNavScrolling) return;

  const scrollPosition = window.scrollY;
  const windowHeight = window.innerHeight;
  const fullHeight = document.documentElement.scrollHeight;

  const expEl = document.getElementById('experience');
  const projectsEl = document.getElementById('projects');
  const skillsEl = document.getElementById('skills');
  const notesEl = document.getElementById('notes');

  let activeId = 'about';

  // Responsive cascade: check from bottom-most section upwards
  if (scrollPosition + windowHeight >= fullHeight - 120) {
    activeId = 'notes';
  } else if (notesEl && notesEl.getBoundingClientRect().top <= windowHeight * 0.65) {
    activeId = 'notes';
  } else if (skillsEl && skillsEl.getBoundingClientRect().top <= windowHeight * 0.60) {
    activeId = 'skills';
  } else if (projectsEl && projectsEl.getBoundingClientRect().top <= windowHeight * 0.58) {
    activeId = 'projects';
  } else if (expEl && expEl.getBoundingClientRect().top <= windowHeight * 0.58) {
    activeId = 'experience';
  } else {
    activeId = 'about';
  }

  if (activeSection.value !== activeId) {
    activeSection.value = activeId;
    syncUrlWithSection(activeId);
  }

  // --- Sub-item scroll tracking (only for experience and projects) ---
  if (activeId === 'experience') {
    const expSubIds = ['exp-card-1', 'exp-card-2'];
    for (const sId of expSubIds) {
      const el = document.getElementById(sId);
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= windowHeight * 0.45 && rect.bottom > 100) {
          activeSubItem.value = sId;
          break;
        }
      }
    }
  } else if (activeId === 'projects') {
    const projSubIds = [
      'project-legacy-queue-systems',
      'project-biodaru-qms',
      'project-nava-music-player',
      'project-biodaroo-training-suite'
    ];
    for (const sId of projSubIds) {
      const el = document.getElementById(sId);
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= windowHeight * 0.45 && rect.bottom > 100) {
          activeSubItem.value = sId;
          break;
        }
      }
    }
  } else {
    activeSubItem.value = '';
  }
};

const handleScrollEvent = () => {
  updateActiveSectionOnScroll();
  updateScrollProgress();
};

const scrollToSection = (sectionId, event) => {
  playClick();
  closeNote();
  if (event) event.preventDefault();

  isManualNavScrolling = true;
  if (scrollLockTimeout) clearTimeout(scrollLockTimeout);

  activeSection.value = sectionId;
  syncUrlWithSection(sectionId);

  const target = document.getElementById(sectionId);
  if (!target) {
    isManualNavScrolling = false;
    return;
  }

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;
  const topOffset = isMobile ? 110 : 80;
  const elementPosition = target.getBoundingClientRect().top + window.scrollY;
  const targetTop = Math.max(0, elementPosition - topOffset);

  smoothScrollTo(targetTop, { duration: 1.1 });

  scrollLockTimeout = setTimeout(() => {
    isManualNavScrolling = false;
  }, 950);
};

const scrollToTarget = (targetId, event) => {
  playClick();
  if (event) event.preventDefault();

  const el = document.getElementById(targetId);
  if (!el) {
    if (targetId.startsWith('exp-')) {
      scrollToSection('experience');
    } else if (targetId.startsWith('project-')) {
      scrollToSection('projects');
    } else {
      scrollToSection(targetId);
    }
    return;
  }

  isManualNavScrolling = true;
  if (scrollLockTimeout) clearTimeout(scrollLockTimeout);

  activeSubItem.value = targetId;

  if (targetId.startsWith('exp-')) {
    activeSection.value = 'experience';
    syncUrlWithSection('experience');
  } else if (targetId.startsWith('project-')) {
    activeSection.value = 'projects';
    syncUrlWithSection('projects');
    const slug = targetId.replace('project-', '');
    highlightedProjectSlug.value = slug;
    setTimeout(() => {
      if (highlightedProjectSlug.value === slug) {
        highlightedProjectSlug.value = '';
      }
    }, 3500);
  } else if (['experience', 'projects', 'skills', 'notes', 'about'].includes(targetId)) {
    activeSection.value = targetId;
    syncUrlWithSection(targetId);
  }

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;
  const topOffset = isMobile ? 100 : 84;
  const elementPosition = el.getBoundingClientRect().top + window.scrollY;
  const targetTop = Math.max(0, elementPosition - topOffset);

  smoothScrollTo(targetTop, { duration: 1.1 });

  scrollLockTimeout = setTimeout(() => {
    isManualNavScrolling = false;
  }, 950);
};

const navigateToProject = (relProj) => {
  playClick();
  const slug = relProj.slug || relProj.id;
  highlightedProjectSlug.value = slug;

  const targetId = `project-${slug}`;
  const el = document.getElementById(targetId);

  if (el) {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;
    const topOffset = isMobile ? 110 : 80;
    const elementPosition = el.getBoundingClientRect().top + window.scrollY;
    const targetTop = Math.max(0, elementPosition - topOffset);

    smoothScrollTo(targetTop, { duration: 1.1 });
  } else {
    scrollToSection('projects');
  }

  setTimeout(() => {
    if (highlightedProjectSlug.value === slug) {
      highlightedProjectSlug.value = '';
    }
  }, 3500);
};

const handlePillarTechSelect = (tech) => {
  activeFilter.value = tech;
  scrollToSection('projects');
};

const openCaseStudy = (job) => {
  selectedCaseStudy.value = job;
  isCaseStudyOpen.value = true;
};

const handleGlobalKeydown = (e) => {
  if (e.ctrlKey && e.key === 'k') {
    e.preventDefault();
    isPaletteOpen.value = !isPaletteOpen.value;
  }
  if (e.key === 'Escape') {
    if (showQrModal.value) showQrModal.value = false;
    if (isCaseStudyOpen.value) isCaseStudyOpen.value = false;
    if (isPaletteOpen.value) isPaletteOpen.value = false;
  }
};

onMounted(() => {
  if (typeof window !== 'undefined') {
    window.addEventListener('scroll', handleScrollEvent, { passive: true });
    window.addEventListener('keydown', handleGlobalKeydown);
  }

  updateScrollProgress();

  const initialSection = getSectionFromUrl();
  activeSection.value = initialSection;

  if (initialSection !== 'about') {
    setTimeout(() => {
      scrollToSection(initialSection);
    }, 120);
  }
});

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('scroll', handleScrollEvent);
    window.removeEventListener('keydown', handleGlobalKeydown);
  }
});
</script>

<template>
  <div class="master-shell" :dir="isRtl ? 'rtl' : 'ltr'">
    <!-- GLASSMORPHYSIC SWISS TOP BAR -->
    <EditorialHeader
      :is-zen-mode="isZenMode"
      :scroll-progress="scrollProgress"
      @open-terminal="emit('open-terminal')"
      @open-palette="isPaletteOpen = true"
    />

    <!-- 00 // STANDALONE HERO BANNER (Full width above sticky stage) -->
    <div v-if="!isZenMode" class="hero-stage-container">
      <AboutSection
        @show-qr="showQrModal = true"
        @explore-work="scrollToSection('experience')"
      />
    </div>

    <!-- WORK STAGE: STICKY TREE SIDEBAR + EDITORIAL STREAM (01 to 04) -->
    <div id="work-stage" class="editorial-layout" :class="{ 'zen-mode': isZenMode }">
      <!-- TREE TABLE OF CONTENTS SIDEBAR -->
      <EditorialSidebar
        v-if="!isZenMode"
        :active-section="activeSection"
        :active-sub-item="activeSubItem"
        :section-routes="sectionRoutes"
        @scroll-to-section="scrollToSection"
        @scroll-to-target="scrollToTarget"
        @show-qr="showQrModal = true"
        @scroll-top="scrollToSection('about')"
      />

      <!-- MAIN SCROLLING STREAM (01 to 04) -->
      <main class="editorial-content">
        <!-- 01 // EXPERIENCE -->
        <ExperienceSection
          @open-case-study="openCaseStudy"
          @navigate-to-project="navigateToProject"
        />

        <!-- 02 // PROJECTS -->
        <ProjectsSection :highlighted-slug="highlightedProjectSlug" />

        <!-- 03 // SKILLS & PILLARS -->
        <SkillsSection @select-tech="handlePillarTechSelect" />

        <!-- 04 // NOTES -->
        <NotesSection ref="notesSectionRef" />

        <!-- EDITORIAL FOOTER -->
        <EditorialFooter
          @scroll-to-top="scrollToSection('about')"
          @open-terminal="emit('open-terminal')"
        />
      </main>
    </div>

    <!-- COMMAND PALETTE MODAL (Ctrl+K) -->
    <CommandPaletteModal
      :is-open="isPaletteOpen"
      @close="isPaletteOpen = false"
      @navigate-section="scrollToSection"
      @select-project="navigateToProject"
      @open-note="(n) => notesSectionRef?.openNoteDrawer(n)"
      @open-terminal="emit('open-terminal')"
      @open-resume="navigateTo('/resume')"
    />

    <!-- CASE STUDY MODAL -->
    <CaseStudyModal
      :is-open="isCaseStudyOpen"
      :study-data="selectedCaseStudy"
      @close="isCaseStudyOpen = false"
    />

    <!-- QR CODE MODAL OVERLAY -->
    <Transition name="fade">
      <div v-if="showQrModal" class="qr-modal-overlay" @click.self="showQrModal = false">
        <div class="qr-modal-card">
          <button class="close-qr-btn" @click="showQrModal = false">✕</button>
          <h3>📱 اسکن کد QR پورتفولیو</h3>
          <p>با دوربین گوشی اسکن کنید تا آدرس سایت مستقیماً باز شود:</p>
          <div class="qr-image-wrap">
            <img src="/qr-code.svg" alt="QR Code Alireza Lotfi Portfolio" width="200" height="200" />
          </div>
          <div class="qr-url-pill mono-ui" dir="ltr">alirezalotfimoghaddam.ir</div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.master-shell {
  width: 100%;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
}

/* HERO STAGE CONTAINER */
.hero-stage-container {
  max-width: 1380px;
  margin: 0 auto;
  width: 100%;
  padding: 24px 28px 12px;
  box-sizing: border-box;
}

@media (max-width: 1024px) {
  .hero-stage-container {
    padding: 16px 16px 8px;
  }
}

@media (max-width: 480px) {
  .hero-stage-container {
    padding: 12px 12px 4px;
  }
}

/* DESKTOP EDITORIAL LAYOUT (NATURAL WINDOW SCROLL + STICKY SIDEBAR) */
.editorial-layout {
  display: grid;
  grid-template-columns: 290px 1fr;
  gap: 52px;
  max-width: 1380px;
  margin: 0 auto;
  width: 100%;
  padding: 12px 28px 48px;
  box-sizing: border-box;
  position: relative;
}

.editorial-layout.zen-mode {
  grid-template-columns: 1fr;
  padding: 0;
}

/* CONTENT STREAM */
.editorial-content {
  display: flex;
  flex-direction: column;
  gap: 68px;
  padding: 10px 14px 40px 14px;
  box-sizing: border-box;
  min-width: 0;
}

/* MOBILE RESPONSIVE OVERRIDES */
@media (max-width: 1024px) {
  .editorial-layout {
    display: flex;
    flex-direction: column;
    padding: 10px 16px 40px;
    gap: 24px;
  }

  .editorial-content {
    padding: 0;
    gap: 44px;
  }
}

@media (max-width: 480px) {
  .editorial-layout {
    padding: 8px 10px 32px;
    gap: 16px;
  }

  .editorial-content {
    gap: 36px;
  }
}

.editorial-stream-footer {
  padding-top: 28px;
  border-top: 1px solid var(--panel-border, #cbd5e1);
  min-height: 80px;
  contain: layout style;
}

.footer-bottom-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}

@media (max-width: 640px) {
  .footer-bottom-row {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
    text-align: center;
  }

  .scroll-top-btn {
    width: 100%;
  }
}

.copyright {
  font-size: 0.78rem;
  color: var(--text-soft, #64748b);
  margin: 0;
}

.scroll-top-btn {
  background: var(--item-bg, #ffffff);
  border: 1px solid var(--panel-border, #cbd5e1);
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--text-secondary, #334155);
  cursor: pointer;
  transition: all 0.15s ease;
}

.scroll-top-btn:hover {
  border-color: var(--neon, #4f46e5);
  color: var(--neon, #4f46e5);
}

/* QR MODAL */
.qr-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 10000;
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.qr-modal-card {
  width: 100%;
  max-width: 360px;
  background: var(--item-bg, #ffffff);
  border: 1px solid var(--panel-border, #cbd5e1);
  border-radius: 20px;
  padding: 28px 24px;
  text-align: center;
  position: relative;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.3);
}

.close-qr-btn {
  position: absolute;
  top: 14px;
  right: 14px;
  background: transparent;
  border: none;
  font-size: 1.1rem;
  color: var(--text-soft, #64748b);
  cursor: pointer;
}

.qr-modal-card h3 {
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--text-main, #0f172a);
  margin: 0 0 8px;
}

.qr-modal-card p {
  font-size: 0.82rem;
  color: var(--text-secondary, #475569);
  margin: 0 0 18px;
}

.qr-image-wrap {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}

.qr-image-wrap img {
  border-radius: 12px;
  padding: 8px;
  background: #ffffff;
  border: 1px solid var(--panel-border, #cbd5e1);
}

.qr-url-pill {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--neon, #4f46e5);
  background: rgba(79, 70, 229, 0.08);
  padding: 4px 12px;
  border-radius: 999px;
  display: inline-block;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

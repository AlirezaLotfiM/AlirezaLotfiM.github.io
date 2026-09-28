<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { usePortfolio } from '../../composables/usePortfolio';
import { useAudioSynth } from '../../composables/useAudioSynth';
import { useNavigation } from '../../composables/useNavigation';
import { useI18n } from '../../composables/useI18n';

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
const contentPaneRef = ref(null);
const scrollProgress = ref(0);
const showQrModal = ref(false);
const isPaletteOpen = ref(false);
const isCaseStudyOpen = ref(false);
const selectedCaseStudy = ref(null);
const highlightedProjectSlug = ref('');
const notesSectionRef = ref(null);

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
  const isMobile = window.innerWidth < 1024;
  if (isMobile) {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    scrollProgress.value = total > 0 ? Math.min(100, Math.max(0, (window.scrollY / total) * 100)) : 0;
  } else if (contentPaneRef.value) {
    const total = contentPaneRef.value.scrollHeight - contentPaneRef.value.clientHeight;
    scrollProgress.value = total > 0 ? Math.min(100, Math.max(0, (contentPaneRef.value.scrollTop / total) * 100)) : 0;
  }
};

const updateActiveSectionOnScroll = () => {
  if (typeof document === 'undefined' || isManualNavScrolling) return;

  const sectionIds = ['about', 'experience', 'projects', 'skills', 'notes'];
  const sections = sectionIds
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  if (!sections.length) return;

  const isMobile = window.innerWidth < 1024;
  let activeId = activeSection.value;

  if (isMobile) {
    const scrollPosition = window.scrollY;
    const windowHeight = window.innerHeight;
    const fullHeight = document.documentElement.scrollHeight;

    if (scrollPosition + windowHeight >= fullHeight - 80) {
      activeId = 'notes';
    } else {
      sections.forEach((sec) => {
        const secRect = sec.getBoundingClientRect();
        if (secRect.top <= 140 && secRect.bottom > 60) {
          activeId = sec.id;
        }
      });
    }
  } else if (contentPaneRef.value) {
    const containerRect = contentPaneRef.value.getBoundingClientRect();
    const isAtBottom =
      contentPaneRef.value.scrollHeight - contentPaneRef.value.scrollTop - contentPaneRef.value.clientHeight < 80;

    if (isAtBottom) {
      activeId = 'notes';
    } else {
      sections.forEach((sec) => {
        const secRect = sec.getBoundingClientRect();
        const relativeTop = secRect.top - containerRect.top;
        if (relativeTop <= 180 && secRect.bottom - containerRect.top > 60) {
          activeId = sec.id;
        }
      });
    }
  }

  if (activeSection.value !== activeId) {
    activeSection.value = activeId;
    syncUrlWithSection(activeId);
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

  if (isMobile) {
    const topOffset = 114;
    const elementPosition = target.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({
      top: Math.max(0, elementPosition - topOffset),
      behavior: 'smooth',
    });
  } else if (contentPaneRef.value) {
    const containerTop = contentPaneRef.value.getBoundingClientRect().top;
    const targetTop = target.getBoundingClientRect().top;
    const offset = targetTop - containerTop + contentPaneRef.value.scrollTop;

    contentPaneRef.value.scrollTo({
      top: Math.max(0, offset - 14),
      behavior: 'smooth',
    });
  }

  scrollLockTimeout = setTimeout(() => {
    isManualNavScrolling = false;
  }, 750);
};

const navigateToProject = (relProj) => {
  playClick();
  const slug = relProj.slug || relProj.id;
  highlightedProjectSlug.value = slug;

  const targetId = `project-${slug}`;
  const el = document.getElementById(targetId);

  if (el) {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;
    if (isMobile) {
      const topOffset = 118;
      const elementPosition = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: Math.max(0, elementPosition - topOffset),
        behavior: 'smooth',
      });
    } else if (contentPaneRef.value) {
      const containerTop = contentPaneRef.value.getBoundingClientRect().top;
      const targetTop = el.getBoundingClientRect().top;
      const offset = targetTop - containerTop + contentPaneRef.value.scrollTop;

      contentPaneRef.value.scrollTo({
        top: Math.max(0, offset - 18),
        behavior: 'smooth',
      });
    }
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

const handleLayoutWheel = (e) => {
  // If mouse is over sidebar or padding on desktop, forward scroll to contentPaneRef
  if (typeof window !== 'undefined' && window.innerWidth >= 1024 && contentPaneRef.value) {
    if (!e.target.closest('.editorial-content') &&
        !e.target.closest('.palette-dialog') &&
        !e.target.closest('.study-dialog') &&
        !e.target.closest('.qr-modal-card') &&
        !e.target.closest('.note-reader-card')) {
      contentPaneRef.value.scrollTop += e.deltaY;
    }
  }
};

onMounted(() => {
  if (typeof window !== 'undefined') {
    window.addEventListener('scroll', handleScrollEvent, { passive: true });
    window.addEventListener('keydown', handleGlobalKeydown);
  }
  if (contentPaneRef.value) {
    contentPaneRef.value.addEventListener('scroll', handleScrollEvent, { passive: true });
  }

  updateScrollProgress();

  const initialSection = getSectionFromUrl();
  activeSection.value = initialSection;

  if (initialSection !== 'about') {
    setTimeout(() => {
      scrollToSection(initialSection);
    }, 80);
  }
});

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('scroll', handleScrollEvent);
    window.removeEventListener('keydown', handleGlobalKeydown);
  }
  if (contentPaneRef.value) {
    contentPaneRef.value.removeEventListener('scroll', handleScrollEvent);
  }
});
</script>

<template>
  <div class="master-shell" :dir="isRtl ? 'rtl' : 'ltr'">
    <!-- SWISS TOP BAR -->
    <EditorialHeader
      :is-zen-mode="isZenMode"
      :scroll-progress="scrollProgress"
      @open-terminal="emit('open-terminal')"
      @open-palette="isPaletteOpen = true"
    />

    <!-- EDITORIAL LAYOUT (DESKTOP: FIXED SIDEBAR + SCROLLING CONTENT / MOBILE: FULL-PAGE FLOW) -->
    <div class="editorial-layout" :class="{ 'zen-mode': isZenMode }" @wheel="handleLayoutWheel">
      <!-- SIDEBAR (STAYS STRICTLY FIXED & STATIONARY ON DESKTOP) -->
      <EditorialSidebar
        v-if="!isZenMode"
        :active-section="activeSection"
        :section-routes="sectionRoutes"
        :selected-note="selectedNote"
        @scroll-to-section="scrollToSection"
        @show-qr="showQrModal = true"
      />

      <!-- MAIN SCROLLING STREAM -->
      <main class="editorial-content" ref="contentPaneRef">
        <!-- 00 // ABOUT -->
        <AboutSection @show-qr="showQrModal = true" />

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

        <!-- STREAM FOOTER -->
        <footer class="editorial-stream-footer">
          <div class="footer-bottom-row">
            <p class="copyright mono-ui" dir="ltr">{{ t('copyright') }}</p>
            <button @click="scrollToSection('about')" class="scroll-top-btn">
              {{ t('backToTop') }}
            </button>
          </div>
        </footer>
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

/* DESKTOP EDITORIAL LAYOUT (FIXED SIDEBAR + INDEPENDENT STREAM) */
.editorial-layout {
  display: grid;
  grid-template-columns: 290px 1fr;
  gap: 52px;
  max-width: 1380px;
  margin: 0 auto;
  width: 100%;
  height: calc(100vh - 64px);
  max-height: calc(100vh - 64px);
  padding: 10px 28px 0;
  box-sizing: border-box;
  overflow: hidden;
  position: relative;
}

.editorial-layout.zen-mode {
  grid-template-columns: 1fr;
  padding: 0;
}

/* CONTENT STREAM */
.editorial-content {
  overflow-y: auto;
  height: 100%;
  max-height: 100%;
  display: flex;
  flex-direction: column;
  gap: 68px;
  padding: 14px 20px 90px 20px;
  scroll-behavior: smooth;
  scrollbar-width: thin;
  box-sizing: border-box;
}

/* MOBILE RESPONSIVE OVERRIDES */
@media (max-width: 1024px) {
  .editorial-layout {
    display: flex;
    flex-direction: column;
    padding: 10px 14px 40px;
    gap: 20px;
    height: auto;
    max-height: none;
    overflow: visible;
  }

  .editorial-content {
    overflow: visible;
    max-height: none;
    height: auto;
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

<script setup>
import { defineAsyncComponent } from 'vue';
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
} = usePortfolio();

const { playClick } = useAudioSynth();
const { tabPaths, navigateFromEvent } = useNavigation();

const props = defineProps({
  isZenMode: Boolean
});

const emit = defineEmits(['toggle-zen']);
</script>

<template>
  <main class="col-main glass-panel main-box">
    <!-- Floating Exit Zen Button -->
    <button v-if="isZenMode" @click="playClick(); emit('toggle-zen')" class="exit-zen-btn" title="خروج از حالت تمرکز (Ctrl + Z)" dir="rtl">
      <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
      </svg>
      <span>خروج از حالت تمرکز</span>
    </button>

    <header class="tabs-header" :class="{ hidden: isZenMode }">
      <nav class="main-tabs" aria-label="بخش‌های اصلی">
        <a :href="tabPaths.projects"
          @click="playClick(); closeNote(); navigateFromEvent($event, tabPaths.projects)"
          :aria-current="!selectedNote && activeTab === 'projects' ? 'page' : undefined"
          :class="{ active: !selectedNote && activeTab === 'projects' }">
          پروژه‌ها
        </a>
        <a :href="tabPaths.interests"
          @click="playClick(); closeNote(); navigateFromEvent($event, tabPaths.interests)"
          :aria-current="!selectedNote && activeTab === 'interests' ? 'page' : undefined"
          :class="{ active: !selectedNote && activeTab === 'interests' }">
          علاقه‌مندی
        </a>
        <a :href="tabPaths.roadmap"
          @click="playClick(); closeNote(); navigateFromEvent($event, tabPaths.roadmap)"
          :aria-current="!selectedNote && activeTab === 'roadmap' ? 'page' : undefined"
          :class="{ active: !selectedNote && activeTab === 'roadmap' }">
          مسیر من
        </a>
        <a :href="tabPaths.history"
          @click="playClick(); closeNote(); navigateFromEvent($event, tabPaths.history)"
          :aria-current="!selectedNote && activeTab === 'history' ? 'page' : undefined"
          :class="{ active: !selectedNote && activeTab === 'history' }">
          سوابق
        </a>
        <a :href="tabPaths.guestbook"
          @click="playClick(); closeNote(); navigateFromEvent($event, tabPaths.guestbook)"
          :aria-current="!selectedNote && activeTab === 'guestbook' ? 'page' : undefined"
          :class="{ active: !selectedNote && activeTab === 'guestbook' }">
          یادگاری
        </a>
        <a :href="tabPaths.notes"
          @click="playClick(); closeNote(); navigateFromEvent($event, tabPaths.notes)"
          :aria-current="activeTab === 'notes' || selectedNote ? 'page' : undefined"
          :class="{ active: activeTab === 'notes' || selectedNote }">
          یادداشت
        </a>
      </nav>

      <div v-if="activeTab === 'projects' && !selectedNote" class="header-controls">
        <div class="project-controls">
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
      </div>
    </header>

    <div class="content-body">
      <div v-if="loading" class="loading-skeletons">
        <SkeletonGrid v-if="activeTab === 'projects' || activeTab === 'interests'" />
        <SkeletonList v-else />
      </div>

      <Transition name="fade-slide" mode="out-in">
        <div v-if="!loading && selectedNote" class="thread-view-wrapper" key="thread">
          <NotesTab :is-detail="true" @toggle-zen="emit('toggle-zen')" :is-zen-mode="isZenMode" />
        </div>

        <ProjectsTab v-else-if="!loading && activeTab === 'projects'" key="projects" />
        <InterestsTab v-else-if="!loading && activeTab === 'interests'" key="interests" />
        <RoadmapTab v-else-if="!loading && activeTab === 'roadmap'" key="roadmap" />
        <HistoryTab v-else-if="!loading && activeTab === 'history'" key="history" />
        <GuestbookTab v-else-if="!loading && activeTab === 'guestbook'" key="guestbook" />
        <NotesTab v-else-if="!loading && activeTab === 'notes'" key="notes" />
      </Transition>
    </div>
  </main>
</template>

<style scoped>
.col-main {
  height: 100%;
  min-height: 0;
  transition: 0.3s;
}

.tabs-header.hidden {
  display: none !important;
}

.main-tabs {
  display: flex;
  width: 100%;
  border-bottom: 1px solid rgba(255, 255, 255, 0.44);
  overflow-x: auto;
  scrollbar-width: none;
}

.main-tabs::-webkit-scrollbar {
  display: none;
}

.main-tabs a {
  flex: 1;
  padding: 15px 12px;
  font-size: 0.86rem;
  white-space: nowrap;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: -1px;
  text-align: center;
  min-width: fit-content;
  position: relative;
}

.main-tabs a:hover {
  color: var(--text-main);
  background: var(--item-hover-bg);
}

.main-tabs a.active {
  color: var(--text-main);
  border-bottom: 2px solid var(--neon);
  background: var(--item-bg);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.05),
    0 8px 18px rgba(0, 0, 0, 0.15);
}

.header-controls {
  border-top: 1px solid rgba(255, 255, 255, 0.26);
  padding: 10px 24px 0;
}

.project-controls {
  display: flex;
  width: 100%;
  align-items: center;
  min-height: 36px;
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
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
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
  box-shadow: 0 0 10px rgba(56, 189, 248, 0.25);
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

.filter-btn.active-filter .chip-count {
  background: var(--neon);
  color: #040814;
  border-color: var(--neon);
  font-weight: 700;
}

.content-body {
  padding: 22px 24px 24px;
  overflow-y: auto;
  height: 100%;
  -webkit-overflow-scrolling: touch;
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
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  font-family: inherit;
}

.exit-zen-btn:hover {
  border-color: var(--neon);
  color: var(--text-main);
  box-shadow: 0 0 10px rgba(var(--neon-rgb), 0.2);
  transform: translateY(-1px);
}

.exit-zen-btn:active {
  transform: translateY(0) scale(0.97);
}

.tabs-header {
  position: relative;
}

@media (max-width: 1024px) {
  .col-main {
    order: 2;
    height: auto;
    min-height: 420px;
  }

  .tabs-header {
    display: flex;
    flex-direction: column;
  }

  .header-controls,
  .content-body {
    padding-left: 14px;
    padding-right: 14px;
  }

  .content-body {
    overflow: visible;
    height: auto;
  }

  .main-tabs {
    padding: 0 6px;
    gap: 4px;
    border-bottom: none;
    flex-wrap: nowrap;
    scroll-padding-inline: 14px;
  }

  .main-tabs a {
    flex: 0 0 auto;
    padding: 12px 14px;
    border: 1px solid rgba(214, 229, 243, 0.78);
    border-radius: 14px;
    margin-bottom: 0;
    background: rgba(255, 255, 255, 0.4);
  }

  .main-tabs a.active {
    border-bottom: 1px solid rgba(179, 202, 225, 1);
  }
}

@media (max-width: 640px) {
  .col-main {
    min-height: 0;
  }

  .header-controls,
  .content-body {
    padding-left: 12px;
    padding-right: 12px;
  }
  
  .exit-zen-btn {
    top: 14px;
    right: 14px;
    padding: 6px 10px;
    font-size: 0.72rem;
  }
}
</style>

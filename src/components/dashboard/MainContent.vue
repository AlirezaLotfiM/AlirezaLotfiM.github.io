<script setup>
import { computed } from 'vue';
import { usePortfolio } from '../../composables/usePortfolio';

import ProjectsTab from './tabs/ProjectsTab.vue';
import InterestsTab from './tabs/InterestsTab.vue';
import RoadmapTab from './tabs/RoadmapTab.vue';
import NotesTab from './tabs/NotesTab.vue';
import HistoryTab from './tabs/HistoryTab.vue';

import SkeletonGrid from '../skeletons/SkeletonGrid.vue';
import SkeletonList from '../skeletons/SkeletonList.vue';

const {
  activeTab,
  selectedNote,
  loading,
  activeFilter,
  availableLanguages,
  closeNote,
} = usePortfolio();

defineProps(['isZenMode']);
const emit = defineEmits(['toggle-zen', 'open-terminal']);

const tabCommand = computed(() => {
  if (selectedNote.value) return 'open note --focus';

  const map = {
    projects: 'ls projects --architectures',
    interests: 'cat interests.json',
    roadmap: 'show roadmap --active',
    history: 'cat history.log',
    notes: 'ls notes --recent',
  };

  return map[activeTab.value] || map.projects;
});
</script>

<template>
  <main class="col-main glass-panel main-box">
    <header class="tabs-header" :class="{ hidden: isZenMode }">
      <div class="command-shell" dir="ltr">
        <span class="prompt mono-ui">alireza@portfolio:~$</span>
        <span class="command-text mono-ui">{{ tabCommand }}</span>
        <button class="command-shortcut mono-ui" type="button" @click="emit('toggle-zen')" v-if="selectedNote">
          Zen
        </button>
        <button v-else class="command-shortcut mono-ui" type="button" @click="emit('open-terminal')" title="Ctrl + K">
          Terminal
        </button>
      </div>

      <nav class="main-tabs" aria-label="Main Navigation">
        <button @click="selectedNote ? closeNote() : (activeTab = 'projects')"
          :class="{ active: !selectedNote && activeTab === 'projects' }">
          پروژه‌ها
        </button>
        <button @click="selectedNote ? closeNote() : (activeTab = 'interests')"
          :class="{ active: !selectedNote && activeTab === 'interests' }">
          علاقه‌مندی
        </button>
        <button @click="selectedNote ? closeNote() : (activeTab = 'roadmap')"
          :class="{ active: !selectedNote && activeTab === 'roadmap' }">
          مسیر من
        </button>
        <button @click="selectedNote ? closeNote() : (activeTab = 'history')"
          :class="{ active: !selectedNote && activeTab === 'history' }">
          سوابق
        </button>
        <button @click="activeTab = 'notes'" :class="{ active: activeTab === 'notes' || selectedNote }">
          یادداشت
        </button>
      </nav>

      <div v-if="activeTab === 'projects' && !selectedNote" class="header-controls">
        <div class="project-controls">
          <div class="filter-chips">
            <button v-for="lang in availableLanguages" :key="lang" @click="activeFilter = lang"
              :class="{ 'active-filter': activeFilter === lang }" class="filter-btn">
              {{ lang === 'All' ? 'همه' : lang }}
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

.command-shell {
  margin: 18px 24px 14px;
  padding: 12px 14px;
  border-radius: 16px;
  border: 1px solid var(--panel-border);
  background: var(--item-bg);
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
  overflow: hidden;
}

.prompt {
  color: var(--accent-strong);
  white-space: nowrap;
}

.command-text {
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--text-secondary);
}

.command-shortcut {
  flex-shrink: 0;
  border: 1px solid var(--panel-border);
  background: var(--item-bg);
  color: var(--text-soft);
  border-radius: 10px;
  padding: 6px 10px;
  font-size: 0.72rem;
}

button.command-shortcut {
  cursor: pointer;
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

.main-tabs button {
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

.main-tabs button:hover {
  color: var(--text-main);
  background: var(--item-hover-bg);
}

.main-tabs button.active {
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
}

.filter-btn.active-filter {
  background: var(--item-hover-bg);
  color: var(--text-main);
  border-color: var(--neon);
  font-weight: 700;
}

.content-body {
  padding: 22px 24px 24px;
  overflow-y: auto;
  height: 100%;
  -webkit-overflow-scrolling: touch;
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

  .command-shell {
    margin: 14px 14px 12px;
    padding: 11px 12px;
    gap: 8px;
    font-size: 0.74rem;
    flex-wrap: wrap;
    align-items: flex-start;
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

  .main-tabs button {
    flex: 0 0 auto;
    padding: 12px 14px;
    border: 1px solid rgba(214, 229, 243, 0.78);
    border-radius: 14px;
    margin-bottom: 0;
    background: rgba(255, 255, 255, 0.4);
  }

  .main-tabs button.active {
    border-bottom: 1px solid rgba(179, 202, 225, 1);
  }
}

@media (max-width: 640px) {
  .col-main {
    min-height: 0;
  }

  .command-shell {
    margin: 12px 12px 10px;
    padding: 10px 11px;
  }

  .prompt,
  .command-text,
  .command-shortcut {
    font-size: 0.7rem;
  }

  .header-controls,
  .content-body {
    padding-left: 12px;
    padding-right: 12px;
  }
}
</style>

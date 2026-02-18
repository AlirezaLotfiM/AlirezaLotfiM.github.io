<script setup>
import { computed } from 'vue';
import { usePortfolio } from '../../composables/usePortfolio';
import ThemeSwitcher from './ThemeSwitcher.vue';

import ProjectsTab from './tabs/ProjectsTab.vue';
import InterestsTab from './tabs/InterestsTab.vue';
import RoadmapTab from './tabs/RoadmapTab.vue';
import NotesTab from './tabs/NotesTab.vue';
import HistoryTab from './tabs/HistoryTab.vue';
import GuestbookTab from './tabs/GuestbookTab.vue';

const {
  activeTab,
  selectedNote,
  loading,
  activeFilter,
  availableLanguages,
  closeNote
} = usePortfolio();

// Zen mode is handled in App.vue globally via class binding, but the button to toggle it is here.
// We need to emit an event or use a shared state for Zen mode.
// In App.vue, isZenMode is ref.
// I will add isZenMode to usePortfolio or emit it.
// Since it affects the layout (siblings of MainContent), it should probably be in usePortfolio or emitted.
// Let's check where it is used. It hides col-profile and col-skills.
// So App.vue needs to know.
// I'll emit 'toggle-zen' from here.
const props = defineProps(['isZenMode']);
const emit = defineEmits(['toggle-zen']);

</script>

<template>
  <main class="col-main glass-panel main-box">
    <!-- Header: Tabs & Controls -->
    <header class="tabs-header" :class="{ hidden: isZenMode }">
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
        <button @click="selectedNote ? closeNote() : (activeTab = 'guestbook')"
          :class="{ active: !selectedNote && activeTab === 'guestbook' }">
          یادگاری
        </button>
        <button @click="activeTab = 'notes'" :class="{ active: activeTab === 'notes' || selectedNote }">
          یادداشت
        </button>
      </nav>

      <div class="header-controls">
        <div class="project-controls">
          <div class="controls-left">
            <div v-if="activeTab === 'projects' && !selectedNote" class="filter-chips">
              <button v-for="lang in availableLanguages" :key="lang" @click="activeFilter = lang"
                :class="{ 'active-filter': activeFilter === lang }" class="filter-btn">
                {{ lang === "All" ? "همه" : lang }}
              </button>
            </div>
          </div>
          <div class="controls-right">
            <ThemeSwitcher />
          </div>
        </div>
      </div>
    </header>

    <!-- Content Body -->
    <div class="content-body">
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
      </div>

      <Transition name="fade-slide" mode="out-in">
        <!-- Notes Detail View (overrides tabs) -->
        <div v-if="selectedNote" class="thread-view-wrapper" key="thread">
           <!-- We can pass the selectedNote handling to NotesTab or keep it here.
                Since the UI structure in App.vue had the detail view *replacing* the grid,
                it's easier to let NotesTab handle both list and detail, OR handle detail here.
                In App.vue, the detail view code is massive.
                I will move the Detail View logic into NotesTab.vue and pass a prop 'viewMode=detail'.
                BUT, activeTab might be 'projects' when opening a note?
                Wait, openNote is only called from Notes list?
                In App.vue: <div v-if="selectedNote">...</div> else if projects...
                So selectedNote overrides everything.
                I will let NotesTab handle the detail view if I can pass props, but selectedNote is global state.
                Let's put the Note Detail logic in a separate component 'NoteDetail.vue' and use it here.
                Actually, simpler: Let NotesTab handle everything related to notes (list and detail).
                But selectedNote overrides *other* tabs too? No, usually you only open notes from Notes tab.
                Let's check App.vue.
                Ah, notes are in `notes-list`.
                So when I click a note, selectedNote becomes true.
                I will instantiate NotesTab if selectedNote is true, or if activeTab is notes.
           -->
           <NotesTab :is-detail="true" @toggle-zen="emit('toggle-zen')" :is-zen-mode="isZenMode"/>
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

.main-box {
  /* Inherits glass-panel properties */
}

/* Header Styles */
.tabs-header.hidden {
  display: none !important;
}

.main-tabs {
  display: flex;
  width: 100%;
  border-bottom: 1px solid var(--panel-border);
  overflow-x: auto;
  scrollbar-width: none;
}

.main-tabs::-webkit-scrollbar {
  display: none;
}

.main-tabs button {
  flex: 1;
  padding: 12px 10px;
  font-size: 0.95rem;
  white-space: nowrap;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--text-secondary);
  font-family: inherit;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: -1px;
  text-align: center;
  min-width: fit-content;
}

.main-tabs button:hover {
  color: var(--text-main);
  background: var(--item-bg);
}

.main-tabs button.active {
  color: var(--text-main);
  border-bottom: 2px solid var(--neon);
  background: linear-gradient(to top, var(--item-hover-bg), transparent);
}

.header-controls {
  border-top: 1px solid var(--panel-border);
  padding-top: 10px;
  width: 100%;
  padding-left: 30px;
  padding-right: 30px;
}

.project-controls {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
}

.controls-left {
  display: flex;
  justify-content: flex-start;
}

.controls-right {
  display: flex;
  flex-grow: 1;
  justify-content: flex-end;
}

.filter-chips {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-btn {
  background: var(--item-bg);
  border: 1px solid var(--panel-border);
  color: var(--text-secondary);
  font-size: 0.8rem;
  padding: 4px 12px;
  border-radius: 20px;
  cursor: pointer;
  transition: 0.2s;
}

.filter-btn:hover {
  background: var(--item-hover-bg);
  color: var(--text-main);
}

.filter-btn.active-filter {
  background: var(--neon);
  color: black;
  border-color: var(--neon);
  font-weight: bold;
}

.content-body {
  padding: 25px;
  overflow-y: auto;
  height: 100%;
}

/* Mobile */
@media (max-width: 1024px) {
  .col-main {
    order: 2;
    height: auto;
    min-height: 500px;
  }
  .content-body {
    overflow: visible;
    height: auto;
  }
}
</style>

<script setup>
import { ref } from 'vue';
import { usePortfolio } from '../../../composables/usePortfolio';
import { useTilt } from '../../../composables/useTilt';
import ArchitectureModal from '../../ArchitectureModal.vue';

const { filteredProjects, getTechDetails } = usePortfolio();
const { handleCardTilt, resetCard } = useTilt();

const showArchModal = ref(false);
const currentArchDiagram = ref('');
const currentArchTitle = ref('');

// Tooltip State
const tooltip = ref({
  visible: false,
  text: '',
  x: 0,
  y: 0
});

const showTooltip = (event, text) => {
  const rect = event.currentTarget.getBoundingClientRect();
  tooltip.value = {
    visible: true,
    text,
    // Center horizontally, place above target
    x: rect.left + rect.width / 2,
    y: rect.top - 8
  };
};

const hideTooltip = () => {
  tooltip.value.visible = false;
};

const openArchitecture = (p) => {
  currentArchTitle.value = p.name;
  currentArchDiagram.value = p.architecture;
  showArchModal.value = true;
};

const getTechList = (langString) => {
  if (!langString) return [];
  return langString.split(/\s*\/\s*/).map(l => getTechDetails(l));
};
</script>

<template>
  <div class="grid-list">
    <ArchitectureModal
      :visible="showArchModal"
      :diagram="currentArchDiagram"
      :title="currentArchTitle"
      @close="showArchModal = false"
    />

    <!-- Teleported Tooltip -->
    <Teleport to="body">
      <div v-if="tooltip.visible"
           class="global-tech-tooltip"
           :style="{ top: tooltip.y + 'px', left: tooltip.x + 'px' }">
        {{ tooltip.text }}
      </div>
    </Teleport>

    <a v-for="p in filteredProjects" :key="p.id" :href="p.html_url"
      :target="p.html_url === '#' ? '' : '_blank'" class="grid-item spotlight-card"
      @mousemove="handleCardTilt" @mouseleave="resetCard">
      <div class="spotlight-bg"></div>
      <div class="card-head">
        <span class="folder-icon">{{
          p.isPrivate ? "🔒" : "📂"
        }}</span>

        <div class="lang-container" v-if="p.language">
          <span
            v-for="tech in getTechList(p.language)"
            :key="tech.name"
            class="lang-badge"
            :style="{
              borderColor: tech.color,
              color: tech.color,
              background: tech.color + '15',
            }"
            @mouseenter="showTooltip($event, tech.name)"
            @mouseleave="hideTooltip"
          >
            <span class="dot" :style="{ background: tech.color }"></span>
            {{ tech.short }}
          </span>
        </div>

      </div>
      <h4>{{ p.name }}</h4>
      <p>{{ p.description }}</p>
      <div class="card-footer">
        <div class="footer-row">
          <span class="arrow-link">{{
            p.isPrivate ? "پروژه سازمانی" : "مشاهده سورس"
            }}
            &larr;</span>

          <button v-if="p.architecture" class="arch-btn" @click.prevent="openArchitecture(p)">
            View Architecture 🏗️
          </button>
        </div>
      </div>
    </a>
    <div v-if="filteredProjects.length === 0" class="empty-state">
      پروژه‌ای یافت نشد.
    </div>
  </div>
</template>

<style scoped>
.grid-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 15px;
}

.grid-item {
  position: relative;
  text-decoration: none;
  color: var(--text-main);
  background: var(--item-bg);
  border: 1px solid var(--panel-border);
  border-radius: 16px;
  overflow: hidden;
  transition: 0.2s;
  padding: 25px 20px 20px;
  display: flex;
  flex-direction: column;
  min-height: 180px;
}

.card-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start; /* Changed to handle multi-row badges nicely */
  margin-bottom: 15px;
  z-index: 2;
  position: relative;
}

.folder-icon {
  font-size: 1.2rem;
  opacity: 0.7;
}

.lang-container {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: flex-end;
  max-width: 70%;
}

.lang-badge {
  font-size: 0.75rem;
  padding: 4px 8px;
  border-radius: 50px;
  border: 1px solid;
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 600;
  position: relative;
  cursor: help;
  transition: transform 0.2s;
}

.lang-badge:hover {
  transform: translateY(-2px);
  /* Slight glow on hover */
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  display: inline-block;
}

.grid-item h4 {
  margin: 0 0 10px;
  font-size: 1.1rem;
  z-index: 2;
  position: relative;
}

.grid-item p {
  font-size: 0.9rem;
  color: var(--text-muted);
  line-height: 1.6;
  margin: 0;
  flex-grow: 1;
  z-index: 2;
  position: relative;
}

.card-footer {
  margin-top: 15px;
  font-size: 0.8rem;
  color: var(--neon);
  z-index: 2;
  position: relative;
  border-top: 1px solid var(--panel-border);
  padding-top: 10px;
}

.footer-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.arrow-link {
  color: var(--neon);
  opacity: 0;
  transition: 0.3s;
  transform: translateX(5px);
}

.grid-item:hover .arrow-link {
  opacity: 1;
  transform: translateX(0);
}

.arch-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid var(--panel-border);
  color: var(--text-main);
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 0.7rem;
  cursor: pointer;
  transition: 0.2s;
  z-index: 5;
}

.arch-btn:hover {
  background: var(--neon);
  color: black;
  border-color: var(--neon);
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  color: var(--text-muted);
  padding: 40px;
}

/* Mobile */
@media (max-width: 1024px) {
  .grid-list {
    grid-template-columns: 1fr;
  }
}
</style>

<!-- Global Styles for Tooltip (outside scoped) -->
<style>
.global-tech-tooltip {
  position: fixed;
  transform: translateX(-50%) translateY(-100%);
  background: var(--bg-main); /* Using main bg for contrast */
  color: var(--text-main);
  border: 1px solid var(--panel-border);
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 0.75rem;
  white-space: nowrap;
  pointer-events: none;
  z-index: 9999;
  box-shadow: 0 4px 12px rgba(0,0,0,0.5);
  backdrop-filter: blur(4px);
  /* Animation */
  animation: tooltip-pop 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes tooltip-pop {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-90%) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(-100%) scale(1);
  }
}
</style>

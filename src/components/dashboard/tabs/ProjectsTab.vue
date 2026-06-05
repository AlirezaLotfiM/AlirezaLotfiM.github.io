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

const tooltip = ref({
  visible: false,
  text: '',
  x: 0,
  y: 0,
});

const showTooltip = (event, text) => {
  const rect = event.currentTarget.getBoundingClientRect();
  tooltip.value = {
    visible: true,
    text,
    x: rect.left + rect.width / 2,
    y: rect.top - 8,
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
  return langString.split(/\s*\/\s*/).map((l) => getTechDetails(l));
};
</script>

<template>
  <div class="projects-shell">
    <div class="grid-list">
      <ArchitectureModal
        :visible="showArchModal"
        :diagram="currentArchDiagram"
        :title="currentArchTitle"
        @close="showArchModal = false"
      />

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
          <div class="title-block">
            <span class="folder-icon">{{ p.isPrivate ? '[]' : '{}' }}</span>
            <h4>{{ p.name }}</h4>
          </div>

          <div v-if="p.status" class="card-metadata mono-ui" dir="ltr">
            <span class="meta-chip">{{ p.status }}</span>
          </div>
        </div>

        <p class="card-summary">{{ p.description }}</p>

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

        <div class="detail-grid">
          <div v-if="p.role" class="detail-item">
            <span class="detail-label mono-ui" dir="ltr">role</span>
            <span class="detail-value">{{ p.role }}</span>
          </div>
          <div v-if="p.architectureSummary" class="detail-item">
            <span class="detail-label mono-ui" dir="ltr">architecture</span>
            <span class="detail-value">{{ p.architectureSummary }}</span>
          </div>
          <div class="detail-item" v-if="p.impact">
            <span class="detail-label mono-ui" dir="ltr">impact</span>
            <span class="detail-value">{{ p.impact }}</span>
          </div>
        </div>

        <div class="card-footer">
          <div class="footer-row">
            <span class="arrow-link">
              {{ p.isPrivate ? 'پروژه سازمانی' : 'مشاهده سورس' }} &larr;
            </span>

            <button v-if="p.architecture" class="arch-btn mono-ui" @click.prevent="openArchitecture(p)">
              architecture
            </button>
          </div>
        </div>
      </a>
      <div v-if="filteredProjects.length === 0" class="empty-state">
        پروژه‌ای یافت نشد.
      </div>
    </div>
  </div>
</template>

<style scoped>
.projects-shell {
  display: flex;
  flex-direction: column;
  gap: 18px;
}




.grid-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.grid-item {
  position: relative;
  text-decoration: none;
  color: var(--text-main);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(235, 245, 252, 0.76));
  border: 1px solid rgba(207, 223, 239, 1);
  border-radius: 20px;
  overflow: hidden;
  transition: 0.24s ease;
  padding: 20px 18px 16px;
  display: flex;
  flex-direction: column;
  min-height: 100%;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.86),
    0 12px 28px rgba(77, 121, 168, 0.08);
}

.grid-item:hover {
  border-color: rgba(192, 212, 232, 1);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(232, 243, 252, 0.86));
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.92),
    0 18px 34px rgba(77, 121, 168, 0.12);
}

.card-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 14px;
}

.title-block {
  display: flex;
  gap: 10px;
  align-items: baseline;
  min-width: 0;
}

.folder-icon {
  font-size: 0.85rem;
  color: var(--accent-strong);
  font-family: var(--font-mono);
}

.card-metadata {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 6px;
}

.grid-item h4 {
  margin: 0;
  font-size: 1.08rem;
  line-height: 1.5;
  min-height: calc(1.5em * 2);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-summary {
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.72;
  margin: 0 0 12px;
  min-height: calc(1.72em * 3);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.lang-container {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 14px;
  min-height: 34px;
  align-content: flex-start;
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
  cursor: help;
  transition: transform 0.2s;
}

.lang-badge:hover {
  transform: translateY(-2px);
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  display: inline-block;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
  margin-top: auto;
  min-height: 0;
}

.detail-item {
  display: grid;
  grid-template-columns: minmax(84px, 96px) minmax(0, 1fr);
  align-items: start;
  column-gap: 14px;
  row-gap: 4px;
  padding-top: 10px;
  border-top: 1px solid rgba(214, 229, 243, 0.72);
}

.detail-label {
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-soft);
  padding-top: 2px;
  white-space: nowrap;
}

.detail-value {
  font-size: 0.82rem;
  color: var(--text-main);
  line-height: 1.65;
  align-self: start;
  min-width: 0;
}

.card-footer {
  margin-top: 15px;
  font-size: 0.8rem;
  color: var(--accent-strong);
  border-top: 1px solid rgba(214, 229, 243, 0.96);
  padding-top: 12px;
  min-height: 54px;
  display: flex;
  align-items: center;
}

.footer-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.arrow-link {
  color: var(--accent-strong);
  opacity: 0.7;
  transition: 0.3s;
}

.grid-item:hover .arrow-link {
  opacity: 1;
}

.arch-btn {
  border: 1px solid rgba(204, 220, 236, 1);
  background: rgba(255, 255, 255, 0.7);
  color: var(--accent-strong);
  border-radius: 12px;
  padding: 8px 10px;
  cursor: pointer;
}

@media (max-width: 1024px) {
  .detail-item,
  .footer-row {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  .detail-item {
    gap: 6px;
  }

  .grid-item h4,
  .card-summary {
    min-height: 0;
    display: block;
  }

  .lang-container,
  .card-footer {
    min-height: 0;
  }
}
</style>

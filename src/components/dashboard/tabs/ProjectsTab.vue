<script setup>
import { ref } from 'vue';
import { usePortfolio } from '../../../composables/usePortfolio';
import { useTilt } from '../../../composables/useTilt';
import ArchitectureModal from '../../ArchitectureModal.vue';

const { filteredProjects, getLangColor } = usePortfolio();
const { handleCardTilt, resetCard } = useTilt();

const showArchModal = ref(false);
const currentArchDiagram = ref('');
const currentArchTitle = ref('');

const openArchitecture = (p) => {
  currentArchTitle.value = p.name;
  currentArchDiagram.value = p.architecture;
  showArchModal.value = true;
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

    <a v-for="p in filteredProjects" :key="p.id" :href="p.html_url"
      :target="p.html_url === '#' ? '' : '_blank'" class="grid-item spotlight-card"
      @mousemove="handleCardTilt" @mouseleave="resetCard">
      <div class="spotlight-bg"></div>
      <div class="card-head">
        <span class="folder-icon">{{
          p.isPrivate ? "🔒" : "📂"
        }}</span><span class="lang-capsule" v-if="p.language" :style="{
            borderColor: getLangColor(p.language),
            color: getLangColor(p.language),
            background: getLangColor(p.language) + '15',
          }"><span class="dot" :style="{ background: getLangColor(p.language) }"></span>{{ p.language
          }}</span>
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
  padding: 20px;
  display: flex;
  flex-direction: column;
  min-height: 180px;
}

.card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  z-index: 2;
  position: relative;
}

.folder-icon {
  font-size: 1.2rem;
  opacity: 0.7;
}

.lang-capsule {
  font-size: 0.75rem;
  padding: 4px 10px;
  border-radius: 50px;
  border: 1px solid;
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
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

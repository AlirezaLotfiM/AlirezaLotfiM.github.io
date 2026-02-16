<script setup>
import { usePortfolio } from '../../../composables/usePortfolio';
import { useTilt } from '../../../composables/useTilt';

const { filteredProjects, getLangColor } = usePortfolio();
const { handleCardTilt, resetCard } = useTilt();
</script>

<template>
  <div class="grid-list">
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
        <span class="arrow-link">{{
          p.isPrivate ? "پروژه سازمانی" : "مشاهده سورس"
          }}
          &larr;</span>
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
  color: white;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.1);
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
  text-align: left;
  font-size: 0.8rem;
  color: var(--neon);
  z-index: 2;
  position: relative;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding-top: 10px;
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

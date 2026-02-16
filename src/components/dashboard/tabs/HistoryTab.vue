<script setup>
import { useWorkExperience } from '../../../composables/useWorkExperience';
import { useTilt } from '../../../composables/useTilt';

const { workExperiences } = useWorkExperience();
const { handleCardTilt, resetCard } = useTilt();
</script>

<template>
  <ul class="history-list">
    <li v-for="(job, index) in workExperiences" :key="job.id" class="history-item spotlight-card"
      @mousemove="handleCardTilt" @mouseleave="resetCard">
      <div class="spotlight-bg"></div>

      <div class="history-marker">
        <div class="marker-dot"></div>
        <div class="marker-line" v-if="index !== workExperiences.length - 1"></div>
      </div>

      <div class="history-content">
        <div class="job-header">
          <h4>{{ job.title }}</h4>
          <span class="company-badge">{{ job.company }}</span>
        </div>

        <span class="job-period">{{ job.period }}</span>

        <div v-if="Array.isArray(job.description)" class="job-desc-list">
          <ul>
            <li v-for="(item, i) in job.description" :key="i">{{ item }}</li>
          </ul>
        </div>
        <p v-else class="job-desc">{{ job.description }}</p>

        <div class="tech-stack" v-if="job.technologies">
          <span v-for="tech in job.technologies" :key="tech" class="tech-pill">{{ tech }}</span>
        </div>
      </div>
    </li>
  </ul>
</template>

<style scoped>
.history-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 10px;
  margin: 0;
  list-style: none;
}

.history-item {
  position: relative;
  display: flex;
  padding: 20px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  overflow: hidden;
  gap: 20px;
}

.history-marker {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 20px;
}

.marker-dot {
  width: 12px;
  height: 12px;
  background: var(--neon);
  border-radius: 50%;
  box-shadow: 0 0 10px var(--neon);
  flex-shrink: 0;
  margin-top: 5px;
}

.marker-line {
  width: 2px;
  background: rgba(255, 255, 255, 0.1);
  flex-grow: 1;
  margin-top: 5px;
  margin-bottom: -25px; /* Extend to next item */
}

.history-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.job-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.job-header h4 {
  margin: 0;
  color: white;
  font-size: 1.1rem;
}

.company-badge {
  background: rgba(255, 255, 255, 0.1);
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  color: #ddd;
}

.job-period {
  font-size: 0.8rem;
  color: var(--neon);
  font-family: monospace;
}

.job-desc {
  color: var(--text-muted);
  font-size: 0.9rem;
  line-height: 1.6;
  margin: 0;
}

.job-desc-list ul {
  margin: 0;
  padding-right: 20px;
  color: var(--text-muted);
  font-size: 0.9rem;
  line-height: 1.6;
}

.job-desc-list li {
  margin-bottom: 5px;
}

.tech-stack {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 5px;
}

.tech-pill {
  font-size: 0.75rem;
  padding: 2px 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: #ccc;
  transition: 0.2s;
}

.tech-pill:hover {
  border-color: var(--neon);
  color: var(--neon);
}

/* Mobile */
@media (max-width: 600px) {
  .history-item {
    flex-direction: column;
    gap: 10px;
  }
  .history-marker {
    display: none;
  }
}
</style>

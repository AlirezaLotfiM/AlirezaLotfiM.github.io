<script setup>
import { usePortfolio } from '../../../composables/usePortfolio';
import { useTilt } from '../../../composables/useTilt';

const { roadmapItems } = usePortfolio();
const { handleCardTilt, resetCard } = useTilt();
</script>

<template>
  <div class="roadmap-list">
    <div v-for="(step, index) in roadmapItems" :key="index" class="roadmap-item spotlight-card"
      :class="step.status" @mousemove="handleCardTilt" @mouseleave="resetCard">
      <div class="spotlight-bg"></div>
      <div class="step-line"></div>
      <div class="step-dot"></div>
      <div class="step-content">
        <h4>{{ step.title }}</h4>
        <p>{{ step.desc }}</p>
        <span class="status-badge">{{
          step.status === "done"
            ? "انجام شده ✅"
            : step.status === "progress"
              ? "در حال کار 🚧"
              : "در برنامه 📅"
        }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.roadmap-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 10px;
}

.roadmap-item {
  position: relative;
  padding: 20px 60px 20px 20px;
  background: var(--item-bg);
  border: 1px solid var(--panel-border);
  border-radius: 15px;
  overflow: hidden;
}

.step-line {
  position: absolute;
  right: 30px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--panel-border);
}

.step-dot {
  position: absolute;
  right: 24px;
  top: 25px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid var(--text-secondary);
  background: var(--bg-main);
  z-index: 2;
}

.roadmap-item.done .step-dot {
  border-color: var(--neon);
  background: var(--neon);
  box-shadow: 0 0 10px var(--neon);
}

.roadmap-item.progress .step-dot {
  border-color: #f1c40f;
  background: #f1c40f;
  box-shadow: 0 0 10px #f1c40f;
}

.roadmap-item.todo .step-dot {
  border-color: #555;
}

.step-content h4 {
  margin: 0 0 5px;
  color: var(--text-main);
  font-size: 1.1rem;
}

.step-content p {
  margin: 0 0 10px;
  color: var(--text-secondary);
  font-size: 0.9rem;
  line-height: 1.6;
}

.status-badge {
  font-size: 0.75rem;
  padding: 3px 8px;
  border-radius: 6px;
  background: var(--item-hover-bg);
  color: var(--text-secondary);
}
</style>

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
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  overflow: hidden;
}

.step-line {
  position: absolute;
  right: 30px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: rgba(255, 255, 255, 0.1);
}

.step-dot {
  position: absolute;
  right: 24px;
  top: 25px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid #555;
  background: #000;
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
  color: white;
  font-size: 1.1rem;
}

.step-content p {
  margin: 0 0 10px;
  color: var(--text-muted);
  font-size: 0.9rem;
  line-height: 1.6;
}

.status-badge {
  font-size: 0.75rem;
  padding: 3px 8px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.05);
  color: #ccc;
}
</style>

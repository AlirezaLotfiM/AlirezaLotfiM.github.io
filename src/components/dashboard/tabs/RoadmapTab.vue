<script setup>
import { usePortfolio } from '../../../composables/usePortfolio';
import { useTilt } from '../../../composables/useTilt';

const { roadmapItems } = usePortfolio();
const { handleCardTilt, resetCard } = useTilt();

const statusMap = {
  done: 'stable',
  progress: 'shipping',
  todo: 'queued',
};
</script>

<template>
  <div class="roadmap-shell">
    <div class="roadmap-list">
      <div v-for="(step, index) in roadmapItems" :key="index" class="roadmap-item spotlight-card"
        :class="step.status" @mousemove="handleCardTilt" @mouseleave="resetCard">
        <div class="spotlight-bg"></div>
        <div class="step-line"></div>
        <div class="step-dot"></div>
        <div class="step-content">
          <div class="item-topline mono-ui" dir="ltr">
            <span>step_{{ index + 1 }}</span>
            <span>{{ statusMap[step.status] }}</span>
          </div>
          <h4>{{ step.title }}</h4>
          <p>{{ step.desc }}</p>
          <span class="status-badge">{{
            step.status === 'done'
              ? 'انجام شده ✅'
              : step.status === 'progress'
                ? 'در حال کار 🚧'
                : 'در برنامه 📅'
          }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.roadmap-shell {
  display: flex;
  flex-direction: column;
  gap: 18px;
}




.roadmap-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 4px 0;
}

.roadmap-item {
  position: relative;
  padding: 22px 60px 22px 22px;
  background: var(--item-bg);
  border: 1px solid var(--panel-border);
  border-radius: 20px;
  overflow: hidden;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.05),
    0 12px 28px rgba(0, 0, 0, 0.15);
}

.roadmap-item:hover {
  border-color: var(--neon);
  background: var(--item-hover-bg);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.08),
    0 18px 34px rgba(0, 0, 0, 0.22);
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
  border-color: var(--accent-strong);
  background: var(--accent-strong);
  box-shadow: 0 0 10px var(--accent-strong);
}

.roadmap-item.progress .step-dot {
  border-color: #d3a22c;
  background: #d3a22c;
  box-shadow: 0 0 10px rgba(211, 162, 44, 0.38);
}

.roadmap-item.todo .step-dot {
  border-color: var(--panel-border);
}

.item-topline {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  color: var(--text-soft);
  font-size: 0.7rem;
  margin-bottom: 8px;
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
  line-height: 1.72;
}

.status-badge {
  font-size: 0.75rem;
  padding: 5px 10px;
  border-radius: 999px;
  background: var(--item-bg);
  border: 1px solid var(--panel-border);
  color: var(--text-secondary);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

</style>

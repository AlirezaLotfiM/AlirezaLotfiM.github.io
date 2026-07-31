<script setup>
import { usePortfolio } from '../../../composables/usePortfolio';
import { useTilt } from '../../../composables/useTilt';

const { roadmapItems } = usePortfolio();
const { handleCardTilt, resetCard } = useTilt();

const statusMap = {
  done: 'ارتقا یافته',
  progress: 'در حال یادگیری',
  todo: 'در برنامه آینده',
};
</script>

<template>
  <div class="roadmap-shell">
    <div class="roadmap-header-bar">
      <div class="header-title-block">
        <h3>🗺️ مسیر یادگیری و توسعه اهداف فنی</h3>
        <p class="subtitle">اهداف کوتاه مدت و بلندمدت در معماری نرم‌افزار، هوش مصنوعی و توسعه ابزارها</p>
      </div>
    </div>

    <div class="roadmap-list">
      <div
        v-for="(step, index) in roadmapItems"
        :key="index"
        class="roadmap-item spotlight-card"
        :class="step.status"
        @mousemove="handleCardTilt"
        @mouseleave="resetCard"
      >
        <div class="spotlight-bg"></div>
        <div class="step-indicator">
          <div class="step-dot"></div>
          <div class="step-line" v-if="index < roadmapItems.length - 1"></div>
        </div>

        <div class="step-content">
          <div class="item-topline">
            <span class="step-badge mono-ui" dir="ltr">STEP {{ index + 1 }}</span>
            <span class="status-badge" :class="step.status">
              {{
                step.status === 'done'
                  ? 'انجام شده ✅'
                  : step.status === 'progress'
                    ? 'در حال پیشرفت 🚧'
                    : 'در برنامه آینده 📅'
              }}
            </span>
          </div>

          <h4>{{ step.title }}</h4>
          <p>{{ step.desc }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.roadmap-shell {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.roadmap-header-bar {
  padding: 16px 20px;
  background: var(--item-bg);
  border: 1px solid var(--panel-border);
  border-radius: 16px;
}

.header-title-block h3 {
  margin: 0 0 4px 0;
  font-size: 1.1rem;
  color: var(--text-main);
}

.header-title-block .subtitle {
  margin: 0;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.roadmap-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.roadmap-item {
  position: relative;
  display: flex;
  gap: 20px;
  padding: 20px 22px;
  background: var(--item-bg);
  border: 1px solid var(--panel-border);
  border-radius: 18px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 10px 24px rgba(0, 0, 0, 0.15);
}

.roadmap-item:hover {
  border-color: var(--neon);
  background: var(--item-hover-bg);
  transform: translateY(-2px);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 16px 30px rgba(0, 0, 0, 0.22);
}

.step-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  min-width: 24px;
}

.step-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid var(--text-secondary);
  background: var(--bg-main);
  z-index: 2;
  margin-top: 4px;
  transition: 0.3s;
}

.roadmap-item.done .step-dot {
  border-color: var(--neon);
  background: var(--neon);
  box-shadow: 0 0 10px var(--neon);
}

.roadmap-item.progress .step-dot {
  border-color: #f59e0b;
  background: #f59e0b;
  box-shadow: 0 0 10px rgba(245, 158, 11, 0.4);
}

.step-line {
  flex: 1;
  width: 2px;
  background: var(--panel-border);
  margin-top: 6px;
}

.step-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.item-topline {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 4px;
}

.step-badge {
  font-size: 0.72rem;
  color: var(--neon);
  font-weight: 700;
  letter-spacing: 0.5px;
  background: rgba(56, 189, 248, 0.08);
  padding: 3px 8px;
  border-radius: 6px;
  border: 1px solid rgba(56, 189, 248, 0.2);
}

.status-badge {
  font-size: 0.76rem;
  padding: 3px 10px;
  border-radius: 8px;
  background: var(--item-bg);
  border: 1px solid var(--panel-border);
  color: var(--text-secondary);
  font-weight: 600;
}

.status-badge.done {
  border-color: var(--neon);
  color: var(--neon);
}

.status-badge.progress {
  border-color: #f59e0b;
  color: #f59e0b;
}

.step-content h4 {
  margin: 0;
  color: var(--text-main);
  font-size: 1.05rem;
  font-weight: 700;
}

.step-content p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.88rem;
  line-height: 1.7;
  text-align: justify;
}
</style>

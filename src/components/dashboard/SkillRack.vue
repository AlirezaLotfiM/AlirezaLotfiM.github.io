<script setup>
import { usePortfolio } from '../../composables/usePortfolio';

const { mySkills, toPersianDigits } = usePortfolio();
</script>

<template>
  <aside class="col-skills glass-panel skills-box">
    <div class="panel-header">
      <h3>ماژول‌های تخصص</h3>
    </div>
    <div class="rack-container scroll-area">
      <div v-for="skill in mySkills" :key="skill.name" class="skill-module" dir="ltr">
        <div class="module-header">
          <div class="module-title">
            <span class="status-dot"></span>
            <span class="skill-name">{{ skill.name }}</span>
          </div>
          <span class="skill-percent" dir="rtl">{{ toPersianDigits(skill.level) }}٪</span>
        </div>

        <div class="module-bar-bg">
          <div class="module-bar-fill" :style="{ width: skill.level + '%' }">
            <div class="bar-glow"></div>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.col-skills {
  height: 100%;
  padding: 0;
  display: flex;
  flex-direction: column;
}

.skills-box {
  /* Inherits glass-panel properties from App.vue via shared CSS if needed,
     but local styles override or extend. */
}

.panel-header h3 {
  margin: 0;
  padding: 20px;
  font-size: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--neon);
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 2px;
  text-shadow: 0 0 10px rgba(103, 255, 100, 0.3);
}

.rack-container {
  padding: 20px;
  height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.skill-module {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  padding: 15px;
  transition: all 0.3s ease;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.skill-module:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateX(5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.module-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
}

.module-title {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
}

.skill-name {
  font-size: 0.85rem;
  color: #ddd;
  font-weight: 500;
  line-height: 1.4;
  white-space: normal;
  word-break: break-word;
  text-align: left;
}

.skill-percent {
  font-family: "Vazirmatn", sans-serif;
  font-weight: bold;
  font-size: 0.85rem;
  color: var(--neon);
  opacity: 0.8;
  flex-shrink: 0;
}

.status-dot {
  width: 6px;
  height: 6px;
  background-color: var(--neon);
  border-radius: 50%;
  box-shadow: 0 0 5px var(--neon);
  animation: pulse-dot 2s infinite;
  flex-shrink: 0;
}

@keyframes pulse-dot {
  0% { opacity: 0.4; box-shadow: 0 0 0 var(--neon); }
  50% { opacity: 1; box-shadow: 0 0 8px var(--neon); }
  100% { opacity: 0.4; box-shadow: 0 0 0 var(--neon); }
}

.module-bar-bg {
  width: 100%;
  height: 6px;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 3px;
  overflow: hidden;
  position: relative;
}

.module-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, transparent, var(--neon));
  border-radius: 3px;
  position: relative;
  box-shadow: 0 0 10px var(--neon);
  animation: fill-bar 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  max-width: 0; /* Changed from width to max-width to match keyframe */
}

@keyframes fill-bar {
  0% { max-width: 0; }
  100% { max-width: 100%; }
}

.bar-glow {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 5px;
  background: #fff;
  opacity: 0.6;
  filter: blur(2px);
  box-shadow: 0 0 5px #fff;
}

/* Mobile */
@media (max-width: 1024px) {
  .col-skills {
    order: 3;
    height: auto;
  }
  .rack-container {
    overflow: visible;
    height: auto;
  }
  /* In Zen mode on mobile, this is hidden by parent layout rules in App.vue/shared CSS */
}
</style>

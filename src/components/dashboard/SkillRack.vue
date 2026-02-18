<script setup>
import { usePortfolio } from '../../composables/usePortfolio';

const { mySkills, toPersianDigits } = usePortfolio();
</script>

<template>
  <aside class="col-skills glass-panel skills-box">
    <header class="panel-header">
      <h3>ماژول‌های تخصص</h3>
    </header>
    <ul class="rack-container scroll-area">
      <li v-for="skill in mySkills" :key="skill.name" class="skill-module" dir="ltr">
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
      </li>
    </ul>

    <!-- Currently Learning Section -->
    <div class="learning-wrapper">
      <div class="learning-box">
        <div class="learning-header">
          <span class="pulse-dot-large"></span>
          <span class="title">Currently Learning</span>
        </div>
        <div class="learning-content">
          <div class="learning-item">
            <span class="icon">🎯</span>
            <span class="text">Focus: <strong class="highlight">Dapr & K8s</strong></span>
          </div>
          <div class="learning-item">
            <span class="icon">📚</span>
            <span class="text">Reading: <strong class="highlight">DDIA</strong></span>
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
  border-bottom: 1px solid var(--panel-border);
  color: var(--neon);
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 2px;
  text-shadow: 0 0 10px var(--neon);
}

.rack-container {
  padding: 20px;
  margin: 0;
  list-style: none;
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 15px;
  min-height: 0; /* Important for flex child scroll */
}

/* Learning Section Styles */
.learning-wrapper {
  padding: 15px 20px 20px;
  border-top: 1px solid var(--panel-border);
  background: rgba(0, 0, 0, 0.2);
}

.learning-box {
  padding: 12px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid var(--panel-border);
  border-radius: 12px;
  width: 100%;
}

.learning-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 0.8rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.pulse-dot-large {
  width: 8px;
  height: 8px;
  background: var(--neon);
  border-radius: 50%;
  box-shadow: 0 0 5px var(--neon);
  animation: pulse-dot-large 2s infinite;
}

@keyframes pulse-dot-large {
  0% { transform: scale(0.95); opacity: 0.7; }
  50% { transform: scale(1.1); opacity: 1; box-shadow: 0 0 10px var(--neon); }
  100% { transform: scale(0.95); opacity: 0.7; }
}

.learning-content {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.learning-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: var(--text-main);
}

.learning-item .icon {
  font-size: 1rem;
}

.learning-item .highlight {
  color: var(--neon);
  font-weight: normal;
}

.skill-module {
  background: var(--item-bg);
  border: 1px solid var(--panel-border);
  border-radius: 10px;
  padding: 15px;
  transition: all 0.3s ease;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.skill-module:hover {
  background: var(--item-hover-bg);
  border-color: var(--text-secondary);
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
  color: var(--text-main);
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
  background: var(--bar-bg);
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
  background: var(--text-main);
  opacity: 0.6;
  filter: blur(2px);
  box-shadow: 0 0 5px var(--text-main);
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

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { usePortfolio } from '../../composables/usePortfolio';

const { mySkills, toPersianDigits, profile } = usePortfolio();

const stackModules = computed(() =>
  profile.value.stackModules || [
    { label: 'shipping', value: 'Backend services' },
    { label: 'learning', value: profile.value.learning?.focus || 'Dapr & K8s' },
    { label: 'stack', value: 'C# / PostgreSQL / Vue' },
  ],
);

const moduleIcons = {
  shipping: '📦',
  learning: '🚀',
  stack: '🛠️'
};

const moduleTitles = {
  shipping: 'توسعه جاری (Shipping)',
  learning: 'تمرکز آموزشی (Learning)',
  stack: 'زنجیره ابزار (Tech Stack)'
};

const currentSlide = ref(0);
const progress = ref(0);
let progressInterval = null;
const slideDuration = 4500;
const stepTime = 30;

const startProgress = () => {
  progress.value = 0;
  if (progressInterval) clearInterval(progressInterval);
  
  const startTime = Date.now();
  progressInterval = setInterval(() => {
    const elapsed = Date.now() - startTime;
    progress.value = Math.min(100, (elapsed / slideDuration) * 100);
    
    if (elapsed >= slideDuration) {
      nextSlide();
    }
  }, stepTime);
};

const stopProgress = () => {
  if (progressInterval) {
    clearInterval(progressInterval);
    progressInterval = null;
  }
};

const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % stackModules.value.length;
  startProgress();
};

const prevSlide = () => {
  currentSlide.value = (currentSlide.value - 1 + stackModules.value.length) % stackModules.value.length;
  startProgress();
};

const goToSlide = (index) => {
  currentSlide.value = index;
  startProgress();
};

onMounted(() => {
  startProgress();
});

onUnmounted(() => {
  stopProgress();
});
</script>

<template>
  <aside class="col-skills glass-panel skills-box">
    <header class="panel-header">
      <span class="section-kicker">skills/modules</span>
      <h3>ماژول‌های تخصص</h3>
      <p>Capability map with practical delivery bias.</p>
    </header>

    <ul class="rack-container scroll-area">
      <li v-for="skill in mySkills" :key="skill.name" class="skill-module" dir="ltr">
        <div class="module-meta mono-ui">
          <span class="module-path">module/{{ skill.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') }}</span>
          <span class="module-level">{{ toPersianDigits(skill.level) }}%</span>
        </div>
        <div class="module-header">
          <div class="module-title">
            <span class="status-dot"></span>
            <span class="skill-name">{{ skill.name }}</span>
          </div>
          <span class="skill-percent mono-ui">L{{ Math.round(skill.level / 10) }}</span>
        </div>

        <div class="module-bar-bg">
          <div class="module-bar-fill" :style="{ width: skill.level + '%' }">
            <div class="bar-glow"></div>
          </div>
        </div>
      </li>
    </ul>

    <div class="stack-console" @mouseenter="stopProgress" @mouseleave="startProgress">
      <div class="console-head">
        <span class="module-eyebrow">SYSTEM STATUS</span>
        <div class="carousel-pagination">
          <button 
            v-for="(_, index) in stackModules" 
            :key="index" 
            class="page-dot" 
            :class="{ active: currentSlide === index }" 
            @click="goToSlide(index)"
            :aria-label="`Go to slide ${index + 1}`"
          ></button>
        </div>
      </div>
      <div class="module-divider"></div>
      
      <div class="carousel-wrapper">
        <div class="carousel-content">
          <Transition name="slide-fade" mode="out-in">
            <div :key="currentSlide" class="status-card-minimal">
              <div class="status-icon">{{ moduleIcons[stackModules[currentSlide].label] || '⚡' }}</div>
              <div class="status-info">
                <span class="status-title">{{ moduleTitles[stackModules[currentSlide].label] || stackModules[currentSlide].label }}</span>
                <span class="status-value" :dir="stackModules[currentSlide].label === 'stack' ? 'ltr' : 'rtl'">
                  {{ stackModules[currentSlide].value }}
                </span>
              </div>
            </div>
          </Transition>
        </div>
      </div>
      <div class="slide-progress-bar" :style="{ width: `${progress}%` }"></div>
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

.panel-header {
  padding: 18px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.34);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.panel-header h3 {
  margin: 0;
  font-size: 0.98rem;
  color: var(--text-main);
  letter-spacing: 0.04em;
}

.panel-header p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.82rem;
  line-height: 1.6;
}

.rack-container {
  padding: 20px;
  margin: 0;
  list-style: none;
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  display: flex;
  flex-direction: column;
  gap: 15px;
  min-height: 0;
}

.skill-module {
  background: var(--item-bg);
  border: 1px solid var(--panel-border);
  border-radius: 16px;
  padding: 14px;
  transition: all 0.3s ease;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.skill-module:hover {
  background: var(--item-hover-bg);
  border-color: var(--neon);
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.module-meta {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  font-size: 0.68rem;
  color: var(--text-soft);
}

.module-path,
.module-level {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
  font-weight: bold;
  font-size: 0.78rem;
  color: var(--accent-strong);
  opacity: 0.8;
  flex-shrink: 0;
}

.status-dot {
  width: 6px;
  height: 6px;
  background-color: var(--neon);
  border-radius: 50%;
  box-shadow: 0 0 8px var(--neon);
  animation: pulse-dot 2s infinite;
  flex-shrink: 0;
}

@keyframes pulse-dot {
  0% { opacity: 0.4; box-shadow: 0 0 0 rgba(255, 255, 255, 0); }
  50% { opacity: 1; box-shadow: 0 0 8px var(--neon); }
  100% { opacity: 0.4; box-shadow: 0 0 0 rgba(255, 255, 255, 0); }
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
  background: linear-gradient(90deg, var(--neon), var(--accent-strong));
  border-radius: 3px;
  position: relative;
  box-shadow: 0 0 12px var(--neon);
}

.bar-glow {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.65), transparent);
  animation: scan 2.8s linear infinite;
}

@keyframes scan {
  from { transform: translateX(-100%); }
  to { transform: translateX(100%); }
}

.stack-console {
  padding: 14px 18px 16px;
  border-top: 1px solid var(--panel-border);
  background: var(--item-bg);
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: relative;
}

.console-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
}

.carousel-wrapper {
  width: 100%;
}

.carousel-content {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.carousel-pagination {
  display: flex;
  align-items: center;
  gap: 5px;
}

.page-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  border: none;
  padding: 0;
  cursor: pointer;
  transition: all 0.25s ease;
}

.page-dot:hover {
  background: rgba(255, 255, 255, 0.4);
}

.page-dot.active {
  background: var(--neon);
  box-shadow: 0 0 5px var(--neon);
  width: 10px;
  border-radius: 2px;
}

.status-card-minimal {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 4px 0;
  height: 52px;
}

.slide-progress-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 1.5px;
  background: var(--neon);
  box-shadow: 0 0 5px var(--neon);
  transition: width 0.04s linear;
}

.status-icon {
  font-size: 1.15rem;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--panel-border);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.status-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}

.status-title {
  font-size: 0.64rem;
  color: var(--text-soft);
  font-weight: 600;
  text-transform: uppercase;
}

.status-value {
  font-size: 0.78rem;
  color: var(--text-main);
  font-weight: 700;
  line-height: 1.4;
  word-break: break-word;
}

@keyframes pulse {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(103, 255, 100, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 5px rgba(103, 255, 100, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(103, 255, 100, 0); }
}

/* Carousel transitions */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.22s ease;
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(8px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-8px);
}

@media (max-width: 1024px) {
  .col-skills {
    order: 3;
    height: auto;
  }

  .rack-container {
    overflow: visible;
  }

  .console-head {
    justify-content: flex-start;
  }

  .live-status {
    position: static;
    margin-right: auto;
  }
}

@media (max-width: 640px) {
  .panel-header,
  .rack-container,
  .stack-console {
    padding-left: 14px;
    padding-right: 14px;
  }
}
</style>

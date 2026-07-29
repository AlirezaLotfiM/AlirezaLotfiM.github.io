<script setup>
import { ref, onMounted } from 'vue';

const emit = defineEmits(['completed']);
const progress = ref(0);

onMounted(() => {
  const duration = 700;
  const start = performance.now();
  
  const updateProgress = (now) => {
    const elapsed = now - start;
    const pct = Math.min(1, elapsed / duration);
    
    // Easing function for smooth progress deceleration near the end
    const easeOutQuad = t => t * (2 - t);
    progress.value = Math.round(easeOutQuad(pct) * 100);
    
    if (pct < 1) {
      requestAnimationFrame(updateProgress);
    } else {
      setTimeout(() => emit('completed'), 100);
    }
  };
  
  requestAnimationFrame(updateProgress);
});
</script>

<template>
  <div class="boot-screen">
    <!-- Subtle expanding ambient glow behind the logo -->
    <div class="ambient-glow" :style="{ transform: `scale(${1 + progress * 0.005})`, opacity: 0.15 + (progress * 0.002) }"></div>

    <div class="loader-container">
      <button class="skip-boot" type="button" @click="emit('completed')">رد کردن</button>
      <!-- Glowing Abstract Diamond Logo -->
      <div class="logo-container">
        <svg viewBox="0 0 100 100" class="logo-svg">
          <polygon points="50,15 85,50 50,85 15,50" class="logo-outer" />
          <polygon points="50,28 72,50 50,72 28,50" class="logo-inner" />
        </svg>
      </div>

      <!-- Info Area -->
      <div class="info-area">
        <span class="loading-label">INITIALIZING SYSTEM</span>
        <span class="percent-label">{{ progress }}%</span>
      </div>

      <!-- Hair-thin Sleek Progress Bar -->
      <div class="progress-track">
        <div class="progress-fill" :style="{ width: `${progress}%` }">
          <div class="glow-point"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.boot-screen {
  position: fixed;
  inset: 0;
  background: #040814;
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.ambient-glow {
  position: absolute;
  width: 400px;
  height: 400px;
  border-radius: 50%;
  background: radial-gradient(circle, var(--neon, #38bdf8) 0%, transparent 70%);
  pointer-events: none;
  filter: blur(50px);
  transition: transform 0.1s ease-out, opacity 0.1s ease-out;
}

.loader-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 90%;
  max-width: 320px;
  gap: 24px;
  position: relative;
  z-index: 2;
}

.skip-boot {
  position: fixed;
  top: 20px;
  left: 20px;
  border: 1px solid rgba(255, 255, 255, 0.28);
  border-radius: 999px;
  padding: 8px 14px;
  color: #f8fafc;
  background: rgba(15, 23, 42, 0.72);
  cursor: pointer;
}

.logo-container {
  width: 80px;
  height: 80px;
  position: relative;
}

.logo-svg {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 0 8px var(--neon, #38bdf8));
}

.logo-outer {
  fill: none;
  stroke: var(--neon, #38bdf8);
  stroke-width: 2.5;
  stroke-linejoin: round;
  transform-origin: center;
  animation: logoPulse 2s ease-in-out infinite alternate;
}

.logo-inner {
  fill: var(--neon, #38bdf8);
  opacity: 0.15;
  stroke: var(--neon, #38bdf8);
  stroke-width: 1.5;
  stroke-linejoin: round;
  transform-origin: center;
  animation: logoPulseInner 2s ease-in-out infinite alternate;
}

.info-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.loading-label {
  font-size: 0.64rem;
  letter-spacing: 0.25em;
  color: var(--text-soft, #94a3b8);
  font-weight: 600;
  text-transform: uppercase;
}

.percent-label {
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--text-main, #f1f5f9);
  font-family: monospace;
  letter-spacing: -0.02em;
}

.progress-track {
  width: 220px;
  height: 2px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 99px;
  overflow: hidden;
  position: relative;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--neon, #38bdf8), #0284c7);
  border-radius: 99px;
  position: relative;
  transition: width 0.08s ease-out;
  box-shadow: 0 0 8px var(--neon, #38bdf8);
}

.glow-point {
  position: absolute;
  right: 0;
  top: -2px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 0 10px #fff, 0 0 4px var(--neon, #38bdf8);
}

@keyframes logoPulse {
  0% {
    transform: scale(0.96);
    opacity: 0.8;
  }
  100% {
    transform: scale(1.02);
    opacity: 1;
    filter: drop-shadow(0 0 12px var(--neon, #38bdf8));
  }
}

@keyframes logoPulseInner {
  0% {
    transform: scale(0.93);
    opacity: 0.1;
  }
  100% {
    transform: scale(1.04);
    opacity: 0.25;
  }
}
</style>

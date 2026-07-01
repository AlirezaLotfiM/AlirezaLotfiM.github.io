<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const cursorX = ref(-100);
const cursorY = ref(-100);
const dotX = ref(-100);
const dotY = ref(-100);
let rafId = 0;
let isCursorEnabled = false;

const onMouseMove = (e) => {
  cursorX.value = e.clientX;
  cursorY.value = e.clientY;
};

const animate = () => {
  // حرکت نرم دایره دور
  dotX.value += (cursorX.value - dotX.value) * 0.15;
  dotY.value += (cursorY.value - dotY.value) * 0.15;
  rafId = requestAnimationFrame(animate);
};

onMounted(() => {
  isCursorEnabled = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!isCursorEnabled) return;
  window.addEventListener('mousemove', onMouseMove);
  animate();
});
onUnmounted(() => {
  if (!isCursorEnabled) return;
  window.removeEventListener('mousemove', onMouseMove);
  cancelAnimationFrame(rafId);
});
</script>

<template>
  <div class="cursor-wrapper">
    <div class="main-dot" :style="{ transform: `translate(${cursorX}px, ${cursorY}px)` }"></div>
    <div class="ring-dot" :style="{ transform: `translate(${dotX}px, ${dotY}px)` }"></div>
  </div>
</template>

<style scoped>
.cursor-wrapper {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  pointer-events: none; z-index: 9999;
  mix-blend-mode: difference;
}
@media (max-width: 768px) { .cursor-wrapper { display: none; } }

.main-dot {
  position: absolute; width: 8px; height: 8px;
  background: var(--neon); border-radius: 50%;
  left: -4px; top: -4px;
}
.ring-dot {
  position: absolute; width: 40px; height: 40px;
  border: 1px solid var(--neon); border-radius: 50%;
  left: -20px; top: -20px; opacity: 0.5;
}
</style>

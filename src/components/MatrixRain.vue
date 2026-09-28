<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { useTheme } from '../composables/useTheme';

const props = defineProps(['color']);
const { isDark } = useTheme();

const canvasRef = ref(null);
let ctx = null;
let animationFrameId = null;
let lastFrameTime = 0;

const fontSize = 16;
let columns = 0;
let drops = [];

// Matrix character pool: katakana glyphs, digits, and cyber symbols
const chars = '0123456789ABCDEFｦｱｳｴｵｶｷｹｺｻｼｽｾｿﾀﾂﾃﾅﾆﾇﾈﾊﾋﾎﾏﾐﾑﾒﾓﾔﾕﾗﾘﾜXYZ<>/+-*~$=#%';

const initCanvas = () => {
  const canvas = canvasRef.value;
  if (!canvas) return;
  
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  columns = Math.ceil(canvas.width / fontSize);
  drops = Array(columns)
    .fill(0)
    .map(() => Math.floor(Math.random() * -40)); // staggered entry from top
    
  clearCanvas();
};

const clearCanvas = () => {
  if (!ctx || !canvasRef.value) return;
  ctx.fillStyle = isDark.value ? '#080d1a' : '#f8fafc';
  ctx.fillRect(0, 0, canvasRef.value.width, canvasRef.value.height);
};

const draw = (currentTime) => {
  animationFrameId = requestAnimationFrame(draw);

  // Throttle to ~35 FPS for smooth cinematic matrix feel and low CPU usage
  if (currentTime - lastFrameTime < 28) return;
  lastFrameTime = currentTime;

  const canvas = canvasRef.value;
  if (!canvas || !ctx) return;

  // Trail fade layer
  // Dark mode: translucent dark fill for smooth fading tails
  // Light mode: translucent light fill
  ctx.fillStyle = isDark.value ? 'rgba(8, 13, 26, 0.12)' : 'rgba(248, 250, 252, 0.16)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.font = `600 ${fontSize}px "JetBrains Mono", monospace`;
  ctx.textAlign = 'center';

  const defaultDarkColor = props.color || '#22c55e'; // Iconic phosphor green or theme neon
  const defaultLightColor = '#2563eb'; // Vibrant high-contrast azure blue for light mode

  for (let i = 0; i < drops.length; i++) {
    const char = chars[Math.floor(Math.random() * chars.length)];
    const x = i * fontSize + fontSize / 2;
    const y = drops[i] * fontSize;

    if (y > 0) {
      if (isDark.value) {
        // Dark Mode: Head character is brilliant white-green glow, tail is phosphor neon
        ctx.fillStyle = Math.random() > 0.85 ? '#ffffff' : defaultDarkColor;
        ctx.shadowColor = defaultDarkColor;
        ctx.shadowBlur = Math.random() > 0.85 ? 8 : 3;
      } else {
        // Light Mode: Head character is deep bold navy, tail is crisp azure
        ctx.fillStyle = Math.random() > 0.85 ? '#0f172a' : defaultLightColor;
        ctx.shadowBlur = 0;
      }

      ctx.fillText(char, x, y);
    }

    // Reset drop to top with randomized delay once off screen
    if (y > canvas.height && Math.random() > 0.96) {
      drops[i] = 0;
    }

    drops[i]++;
  }

  // Reset shadow for next frame pass
  if (isDark.value) {
    ctx.shadowBlur = 0;
  }
};

const handleResize = () => {
  initCanvas();
};

onMounted(() => {
  const canvas = canvasRef.value;
  if (!canvas) return;
  ctx = canvas.getContext('2d');

  initCanvas();
  animationFrameId = requestAnimationFrame(draw);

  window.addEventListener('resize', handleResize);
});

watch(isDark, () => {
  clearCanvas();
});

onUnmounted(() => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
  window.removeEventListener('resize', handleResize);
});
</script>

<template>
  <canvas ref="canvasRef" class="matrix-canvas" :class="{ 'light-matrix': !isDark }" aria-hidden="true"></canvas>
</template>

<style scoped>
.matrix-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 0;
  opacity: 0.88;
  pointer-events: none;
  transition: opacity 0.4s ease;
}

.matrix-canvas.light-matrix {
  opacity: 0.72;
}
</style>

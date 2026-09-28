<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { useTheme } from '../composables/useTheme';

const props = defineProps(['color']);
const { isDark } = useTheme();

const canvasRef = ref(null);
let ctx = null;
let intervalId = null;

const handleResize = () => {
  const canvas = canvasRef.value;
  if (!canvas) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
};

const clearCanvas = () => {
  if (!ctx || !canvasRef.value) return;
  ctx.fillStyle = isDark.value ? '#080d1a' : '#f8fafc';
  ctx.fillRect(0, 0, canvasRef.value.width, canvasRef.value.height);
};

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const canvas = canvasRef.value;
  if (!canvas) return;
  ctx = canvas.getContext('2d');
  
  handleResize();
  clearCanvas();

  const columns = Math.floor(canvas.width / 20);
  const drops = Array(columns).fill(1);
  const chars = '01'; // کاراکترهای باینری دیجیتال

  const draw = () => {
    // در حالت لایت: لایه‌برداری با رنگ زمینه روشن برای جلوگیری از تیره و کدر شدن صفحه
    // در حالت دارک: لایه‌برداری با رنگ تیره زمینه
    ctx.fillStyle = isDark.value ? 'rgba(8, 13, 26, 0.08)' : 'rgba(248, 250, 252, 0.14)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = '15px monospace';

    for (let i = 0; i < drops.length; i++) {
      const text = chars[Math.floor(Math.random() * chars.length)];

      if (isDark.value) {
        // دارک: نئون سایان/سبز با درخشش سر قطره
        ctx.fillStyle = drops[i] * 20 < canvas.height * 0.12 ? '#ffffff' : (props.color || '#38bdf8');
      } else {
        // لایت: آبی/سورمه‌ای تکنولوژیک مات و شیک با کنتراست عالی روی سفید
        ctx.fillStyle = drops[i] * 20 < canvas.height * 0.12 ? '#1e1b4b' : '#3b82f6';
      }

      ctx.fillText(text, i * 20, drops[i] * 20);

      if (drops[i] * 20 > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }
  };

  const isMobile = window.innerWidth < 768;
  intervalId = setInterval(draw, isMobile ? 80 : 45);

  window.addEventListener('resize', handleResize);
});

watch(isDark, () => {
  clearCanvas();
});

onUnmounted(() => {
  clearInterval(intervalId);
  window.removeEventListener('resize', handleResize);
});
</script>

<template>
  <canvas ref="canvasRef" class="matrix-canvas" :class="{ 'light-matrix': !isDark }"></canvas>
</template>

<style scoped>
.matrix-canvas {
  position: fixed; 
  top: 0; 
  left: 0; 
  z-index: -1; 
  opacity: 0.68;
  pointer-events: none;
  transition: opacity 0.3s ease;
}

.matrix-canvas.light-matrix {
  opacity: 0.45;
}
</style>

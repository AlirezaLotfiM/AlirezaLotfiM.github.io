<script setup>
import { onMounted, onUnmounted, ref } from 'vue';

const props = defineProps(['color']);
const canvasRef = ref(null);
let ctx = null;
let intervalId = null;

onMounted(() => {
  const canvas = canvasRef.value;
  ctx = canvas.getContext('2d');
  
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const columns = Math.floor(canvas.width / 20);
  const drops = Array(columns).fill(1);
  const chars = '01'; // کاراکترهای باینری

  const draw = () => {
    // سیاهی با شفافیت کم برای ایجاد رد (Trail)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // رنگ متنی که از والد میاد (یا سبز پیش‌فرض)
    ctx.fillStyle = props.color || '#67FF64'; 
    ctx.font = '15px monospace';

    for (let i = 0; i < drops.length; i++) {
      const text = chars[Math.floor(Math.random() * chars.length)];
      ctx.fillText(text, i * 20, drops[i] * 20);

      if (drops[i] * 20 > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }
  };

  // سرعت بیشتر (عدد کمتر = سریعتر)
  intervalId = setInterval(draw, 45); 

  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
});

onUnmounted(() => clearInterval(intervalId));
</script>

<template>
  <canvas ref="canvasRef" class="matrix-canvas"></canvas>
</template>

<style scoped>
.matrix-canvas {
  position: fixed; 
  top: 0; 
  left: 0; 
  z-index: -1; 
  opacity: 0.75; /* شفافیت بالا برای دیده شدن بهتر */
  pointer-events: none;
}
</style>
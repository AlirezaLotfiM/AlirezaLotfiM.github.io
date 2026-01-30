<script setup>
import { onMounted, onUnmounted, ref } from 'vue';

// دریافت رنگ از والد
const props = defineProps(['color']);

const canvasRef = ref(null);
let ctx = null;
let particlesArray = [];
let animationFrameId;

const init = () => {
  particlesArray = [];
  let numberOfParticles = (window.innerWidth * window.innerHeight) / 10000;
  for (let i = 0; i < numberOfParticles; i++) {
    let size = (Math.random() * 2) + 1;
    let x = (Math.random() * (window.innerWidth - size * 2) + size * 2);
    let y = (Math.random() * (window.innerHeight - size * 2) + size * 2);
    let directionX = (Math.random() * 1) - 0.5;
    let directionY = (Math.random() * 1) - 0.5;
    
    // استفاده از رنگ پویا
    let color = props.color || '#67FF64'; 
    
    particlesArray.push({ x, y, directionX, directionY, size, color });
  }
};

const drawParticles = () => {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  for (let i = 0; i < particlesArray.length; i++) {
    let p = particlesArray[i];
    p.x += p.directionX;
    p.y += p.directionY;
    if (p.x > window.innerWidth || p.x < 0) p.directionX = -p.directionX;
    if (p.y > window.innerHeight || p.y < 0) p.directionY = -p.directionY;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2, false);
    ctx.fillStyle = p.color;
    ctx.fill();
    for (let j = i; j < particlesArray.length; j++) {
      let p2 = particlesArray[j];
      let distance = ((p.x - p2.x) * (p.x - p2.x)) + ((p.y - p2.y) * (p.y - p2.y));
      if (distance < (window.innerWidth / 7) * (window.innerHeight / 7)) {
        let opacityValue = 1 - (distance / 20000);
        // تبدیل رنگ هگز به RGB برای اعمال Opacity (ساده‌سازی شده)
        // اینجا فقط از رنگ اصلی استفاده می‌کنیم چون تبدیل هگز به rgba طولانی است
        // برای سادگی خط‌ها را همرنگ ذرات می‌کشیم با شفافیت کمتر
        ctx.strokeStyle = p.color; 
        ctx.globalAlpha = opacityValue; // کنترل شفافیت خط
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
        ctx.globalAlpha = 1; // بازگشت به حالت عادی
      }
    }
  }
  animationFrameId = requestAnimationFrame(drawParticles);
};

onMounted(() => {
  ctx = canvasRef.value.getContext('2d');
  canvasRef.value.width = window.innerWidth;
  canvasRef.value.height = window.innerHeight;
  init();
  drawParticles();
  window.addEventListener('resize', () => {
    canvasRef.value.width = window.innerWidth;
    canvasRef.value.height = window.innerHeight;
    init();
  });
});
onUnmounted(() => cancelAnimationFrame(animationFrameId));
</script>
<template>
  <canvas ref="canvasRef" style="position: fixed; top: 0; left: 0; z-index: -1; pointer-events: none; opacity: 0.4;"></canvas>
</template>
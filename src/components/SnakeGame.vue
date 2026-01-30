<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';

const emit = defineEmits(['close']);
const canvasRef = ref(null);
const containerRef = ref(null); // رفرنس به کادر نگهدارنده
const score = ref(0);
const highScore = ref(localStorage.getItem('snake_highscore') || 0);
const isGameOver = ref(false);

// تنظیمات بازی
const gridSize = 15; // سایز هر خانه
let tileCountX = 20;
let tileCountY = 20;
let ctx = null;
let gameInterval = null;

let snake = [{ x: 10, y: 10 }];
let food = { x: 5, y: 5 };
let dx = 0;
let dy = 0;

// تابع تنظیم سایز بوم بازی بر اساس سایز پنجره ترمینال
const resizeCanvas = () => {
  if (containerRef.value && canvasRef.value) {
    const { width, height } = containerRef.value.getBoundingClientRect();
    // تنظیم ابعاد کانواس
    canvasRef.value.width = width - 20; // 20px padding
    canvasRef.value.height = height - 60; // فضای هدر و فوتر رو کم می‌کنیم
    
    // محاسبه تعداد خانه‌ها بر اساس سایز جدید
    tileCountX = Math.floor(canvasRef.value.width / gridSize);
    tileCountY = Math.floor(canvasRef.value.height / gridSize);
  }
};

const drawGame = () => {
  if (isGameOver.value || !ctx) return;

  // پاک کردن صفحه
  ctx.fillStyle = '#0c0c0c';
  ctx.fillRect(0, 0, canvasRef.value.width, canvasRef.value.height);

  // رسم مار
  ctx.shadowBlur = 0;
  snake.forEach((part, index) => {
    ctx.fillStyle = index === 0 ? '#fff' : '#67FF64';
    ctx.fillRect(part.x * gridSize, part.y * gridSize, gridSize - 1, gridSize - 1);
  });

  // رسم غذا
  ctx.fillStyle = '#ff0055';
  ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 1, gridSize - 1);

  // اگر حرکت شروع نشده، ادامه نده
  if (dx === 0 && dy === 0) return;

  const head = { x: snake[0].x + dx, y: snake[0].y + dy };

  // تله‌پورت از دیوارها
  if (head.x < 0) head.x = tileCountX - 1;
  if (head.x >= tileCountX) head.x = 0;
  if (head.y < 0) head.y = tileCountY - 1;
  if (head.y >= tileCountY) head.y = 0;

  // برخورد با خود
  for (let i = 0; i < snake.length; i++) {
    if (head.x === snake[i].x && head.y === snake[i].y) {
      gameOver();
      return;
    }
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score.value++;
    if (score.value > highScore.value) {
      highScore.value = score.value;
      localStorage.setItem('snake_highscore', highScore.value);
    }
    placeFood();
  } else {
    snake.pop();
  }
};

const placeFood = () => {
  food = {
    x: Math.floor(Math.random() * tileCountX),
    y: Math.floor(Math.random() * tileCountY)
  };
};

const gameOver = () => {
  isGameOver.value = true;
  clearInterval(gameInterval);
};

const resetGame = () => {
  resizeCanvas(); // اطمینان از سایز درست قبل از شروع
  snake = [{ x: Math.floor(tileCountX / 2), y: Math.floor(tileCountY / 2) }];
  dx = 0; dy = 0;
  score.value = 0;
  isGameOver.value = false;
  placeFood();
  
  if (gameInterval) clearInterval(gameInterval);
  gameInterval = setInterval(drawGame, 80);
};

const handleKeydown = (e) => {
  // جلوگیری از اسکرول فقط اگر بازی فعال است
  if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.key)) {
    e.preventDefault();
  }

  switch (e.key) {
    case 'ArrowUp': if (dy !== 1) { dx = 0; dy = -1; } break;
    case 'ArrowDown': if (dy !== -1) { dx = 0; dy = 1; } break;
    case 'ArrowLeft': if (dx !== 1) { dx = -1; dy = 0; } break;
    case 'ArrowRight': if (dx !== -1) { dx = 1; dy = 0; } break;
    case 'Escape': emit('close'); break;
  }
};

onMounted(() => {
  if (canvasRef.value) {
    ctx = canvasRef.value.getContext('2d');
    nextTick(() => {
      resetGame();
      window.addEventListener('keydown', handleKeydown);
      window.addEventListener('resize', resizeCanvas);
    });
  }
});

onUnmounted(() => {
  clearInterval(gameInterval);
  window.removeEventListener('keydown', handleKeydown);
  window.removeEventListener('resize', resizeCanvas);
});
</script>

<template>
  <div class="game-embedded" ref="containerRef">
    <div class="game-header">
      <div class="stats">
        <span>SCORE: {{ score }}</span>
        <span>HIGH: {{ highScore }}</span>
      </div>
      <button @click="$emit('close')" class="close-text">[X] CLOSE GAME</button>
    </div>
    
    <div class="canvas-container">
      <canvas ref="canvasRef"></canvas>
      
      <div v-if="isGameOver" class="game-msg">
        <h3 style="color:#ff5f56">GAME OVER</h3>
        <p>Press <span style="color:#fff; border:1px solid #555; padding:0 4px;">R</span> or click below</p>
        <button @click="resetGame">RESTART</button>
      </div>
      
      <div v-else-if="dx === 0 && dy === 0" class="game-msg">
        <p>PRESS ARROW KEYS TO START</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.game-embedded {
  width: 100%; 
  height: 100%; /* مهم: ارتفاع پر شود */
  display: flex; 
  flex-direction: column;
  background: #0c0c0c;
  overflow: hidden;
  position: relative; /* جلوگیری از خروج از کادر */
}

.game-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 5px 10px; background: #1a1a1a; border-bottom: 1px solid #333;
  font-family: monospace; font-size: 0.9rem; color: #67FF64;
}
.stats { display: flex; gap: 15px; }
.close-text {
  background: none; border: none; color: #ff5f56; cursor: pointer; font-family: inherit; font-weight: bold;
}
.close-text:hover { color: #fff; }

.canvas-container {
  flex: 1; 
  display: flex; 
  justify-content: center; 
  align-items: center; 
  position: relative;
  background: #000;
  width: 100%;
}

.game-msg {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
  text-align: center; color: #67FF64; font-family: monospace;
  background: rgba(0,0,0,0.8); padding: 20px; border: 1px solid #333;
}
.game-msg button {
  margin-top: 10px; background: #67FF64; color: #000; border: none; padding: 5px 10px; 
  cursor: pointer; font-weight: bold; font-family: monospace;
}
</style>
<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const emit = defineEmits(['close']);
const canvasRef = ref(null);
const score = ref(0);
const highScore = ref(localStorage.getItem('snake_highscore') || 0);
const isGameOver = ref(false);
const gameStarted = ref(false);

const CANVAS_SIZE = 300; 
const GRID_SIZE = 15;    
const TILE_COUNT = CANVAS_SIZE / GRID_SIZE;

let ctx = null;
let gameInterval = null;
let snake = [];
let food = { x: 10, y: 10 };
let dx = 0; let dy = 0;
let nextDx = 0; let nextDy = 0;

const getThemeColor = () => getComputedStyle(document.documentElement).getPropertyValue('--neon').trim() || '#67FF64';

const initGame = () => {
  if (!canvasRef.value) return;
  canvasRef.value.width = CANVAS_SIZE;
  canvasRef.value.height = CANVAS_SIZE;
  resetState();
  draw();
};

const resetState = () => {
  snake = [{ x: 10, y: 10 }];
  dx = 0; dy = 0; nextDx = 0; nextDy = 0;
  score.value = 0;
  isGameOver.value = false;
  gameStarted.value = false;
  placeFood();
};

const startGame = () => {
  if (gameStarted.value) return;
  gameStarted.value = true;
  nextDx = 1; nextDy = 0;
  if (gameInterval) clearInterval(gameInterval);
  gameInterval = setInterval(gameLoop, 100);
};

const restartGame = () => {
  if (gameInterval) clearInterval(gameInterval);
  initGame();
  startGame();
};

const changeDirection = (dir) => {
  if (!gameStarted.value) {
    startGame();
    if(dir === 'up') { nextDx = 0; nextDy = -1; }
    if(dir === 'down') { nextDx = 0; nextDy = 1; }
    if(dir === 'left') { nextDx = -1; nextDy = 0; }
    if(dir === 'right') { nextDx = 1; nextDy = 0; }
    return;
  }
  if (isGameOver.value) return;

  switch(dir) {
    case 'up': if (dy !== 1) { nextDx = 0; nextDy = -1; } break;
    case 'down': if (dy !== -1) { nextDx = 0; nextDy = 1; } break;
    case 'left': if (dx !== 1) { nextDx = -1; nextDy = 0; } break;
    case 'right': if (dx !== -1) { nextDx = 1; nextDy = 0; } break;
  }
};

const placeFood = () => {
  let valid = false;
  while (!valid) {
    food = { x: Math.floor(Math.random() * TILE_COUNT), y: Math.floor(Math.random() * TILE_COUNT) };
    valid = !snake.some(p => p.x === food.x && p.y === food.y);
  }
};

const gameLoop = () => {
  dx = nextDx; dy = nextDy;
  const head = { x: snake[0].x + dx, y: snake[0].y + dy };

  if (head.x < 0) head.x = TILE_COUNT - 1;
  if (head.x >= TILE_COUNT) head.x = 0;
  if (head.y < 0) head.y = TILE_COUNT - 1;
  if (head.y >= TILE_COUNT) head.y = 0;

  if (snake.some((p, i) => i !== 0 && p.x === head.x && p.y === head.y)) {
    gameOver();
    return;
  }

  snake.unshift(head);
  if (head.x === food.x && head.y === food.y) {
    score.value++;
    if(score.value > highScore.value) {
      highScore.value = score.value;
      localStorage.setItem('snake_highscore', highScore.value);
    }
    placeFood();
  } else {
    snake.pop();
  }
  draw();
};

const draw = () => {
  if (!ctx) return;
  const themeColor = getThemeColor();
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  ctx.fillStyle = '#ff0055'; 
  ctx.beginPath(); ctx.arc((food.x*GRID_SIZE)+GRID_SIZE/2, (food.y*GRID_SIZE)+GRID_SIZE/2, GRID_SIZE/2-2, 0, 2*Math.PI); ctx.fill();
  snake.forEach((p, i) => {
    ctx.fillStyle = i === 0 ? '#fff' : themeColor;
    ctx.fillRect(p.x*GRID_SIZE+1, p.y*GRID_SIZE+1, GRID_SIZE-2, GRID_SIZE-2);
  });
};

const gameOver = () => {
  isGameOver.value = true;
  gameStarted.value = false;
  clearInterval(gameInterval);
};

const handleKeydown = (e) => {
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) e.preventDefault();
  if (e.key === 'Escape') emit('close');
  if (e.key === 'Enter' || e.key === ' ') isGameOver.value ? restartGame() : (!gameStarted.value && startGame());
  switch(e.key) {
    case 'ArrowUp': changeDirection('up'); break;
    case 'ArrowDown': changeDirection('down'); break;
    case 'ArrowLeft': changeDirection('left'); break;
    case 'ArrowRight': changeDirection('right'); break;
  }
};

onMounted(() => {
  ctx = canvasRef.value.getContext('2d');
  initGame();
  window.addEventListener('keydown', handleKeydown);
});
onUnmounted(() => {
  clearInterval(gameInterval);
  window.removeEventListener('keydown', handleKeydown);
});
</script>

<template>
  <div class="snake-box">
    <div class="game-header">
      <span class="game-title">SNAKE.EXE</span>
      <button class="close-btn" @click="$emit('close')">×</button>
    </div>

    <div class="game-body">
      <div class="canvas-wrap">
        <canvas ref="canvasRef" class="pixel-canvas"></canvas>
        <div v-if="!gameStarted && !isGameOver" class="overlay-msg">PRESS START</div>
        <div v-if="isGameOver" class="overlay-msg fail">GAME OVER</div>
      </div>

      <div class="controls-wrap">
        <div class="score-display">
          <div>SCORE: <span class="val">{{ score }}</span></div>
          <div>HIGH: <span class="val high">{{ highScore }}</span></div>
        </div>

        <div class="dpad">
          <div class="d-row"><button class="btn" @click="changeDirection('up')">▲</button></div>
          <div class="d-row">
            <button class="btn" @click="changeDirection('left')">◀</button>
            <button class="btn action" @click="isGameOver ? restartGame() : startGame()">●</button>
            <button class="btn" @click="changeDirection('right')">▶</button>
          </div>
          <div class="d-row"><button class="btn" @click="changeDirection('down')">▼</button></div>
        </div>

        <div class="info-txt">Use Arrows / Buttons</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* کادر اصلی بازی: ساده و بدون پوزیشن مطلق خطرناک */
.snake-box {
  background: rgba(15, 20, 25, 0.98);
  border: 1px solid #444;
  border-radius: 8px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.8);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  /* جلوگیری از بزرگ شدن بیش از حد */
  max-width: 100%;
}

.game-header {
  background: #222; padding: 8px 12px;
  display: flex; justify-content: space-between; align-items: center;
  border-bottom: 1px solid #444; color: #ccc; font-weight: bold; font-family: monospace;
}
.close-btn { background: none; border: none; color: #ff5f56; font-size: 1.4rem; cursor: pointer; line-height: 1; }

.game-body {
  display: flex; gap: 20px; padding: 20px;
  align-items: flex-start; justify-content: center;
  flex-wrap: wrap; /* در موبایل می‌شکند */
}

/* Canvas Wrapper */
.canvas-wrap {
  position: relative;
  border: 2px solid #333;
  line-height: 0;
  background: #000;
}

.pixel-canvas {
  width: 300px; height: 300px; display: block;
  image-rendering: pixelated; /* کیفیت بالا */
}

.overlay-msg {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%);
  background: rgba(0,0,0,0.8); color: var(--neon); padding: 5px 10px;
  font-family: monospace; font-weight: bold; border: 1px solid var(--neon);
  pointer-events: none; white-space: nowrap;
}
.overlay-msg.fail { color: #ff5f56; border-color: #ff5f56; }

/* Controls Wrapper */
.controls-wrap {
  display: flex; flex-direction: column; gap: 20px; align-items: center;
  min-width: 120px;
}

.score-display {
  width: 100%; background: #1a1a1a; padding: 10px; border-radius: 6px;
  text-align: center; border: 1px solid #333; color: #888; font-family: monospace; font-size: 0.9rem;
}
.val { color: #fff; font-weight: bold; }
.val.high { color: var(--neon); }

.dpad { display: flex; flex-direction: column; gap: 5px; }
.d-row { display: flex; gap: 5px; justify-content: center; }

.btn {
  width: 40px; height: 40px; background: #222; border: 1px solid #444;
  border-radius: 6px; color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: 0.1s;
}
.btn:active { background: var(--neon); color: #000; }
.btn.action { border-color: var(--neon); color: var(--neon); }

.info-txt { font-size: 0.75rem; color: #555; text-align: center; font-family: monospace; }
</style>
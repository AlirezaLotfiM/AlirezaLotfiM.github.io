<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';

const emit = defineEmits(['exit']);

const canvasRef = ref(null);
const score = ref(0);
const highScore = ref(localStorage.getItem('snake_highscore') || 0);
const gameState = ref('START'); // START, PLAYING, GAMEOVER
const showCursor = ref(true);

// Game constants
const GRID_SIZE = 20;
let TILE_COUNT_X = 20;
let TILE_COUNT_Y = 15;
const GAME_SPEED = 100;

// Game state
let ctx = null;
let gameInterval = null;
let snake = [];
let food = { x: 10, y: 10 };
let dx = 0; let dy = 0;
let nextDx = 0; let nextDy = 0;

// Colors
const getThemeColor = () => getComputedStyle(document.documentElement).getPropertyValue('--neon').trim() || '#67FF64';

const resizeCanvas = () => {
  if (!canvasRef.value) return;
  const parent = canvasRef.value.parentElement;
  if (parent) {
    canvasRef.value.width = parent.clientWidth;
    canvasRef.value.height = parent.clientHeight;
    TILE_COUNT_X = Math.floor(canvasRef.value.width / GRID_SIZE);
    TILE_COUNT_Y = Math.floor(canvasRef.value.height / GRID_SIZE);
  }
};

const initGame = () => {
  if (!canvasRef.value) return;
  ctx = canvasRef.value.getContext('2d');
  resizeCanvas();
  resetState();
  draw();
  window.addEventListener('resize', () => {
    resizeCanvas();
    draw();
  });
};

const resetState = () => {
  snake = [{ x: Math.floor(TILE_COUNT_X / 2), y: Math.floor(TILE_COUNT_Y / 2) }];
  dx = 0; dy = 0; nextDx = 0; nextDy = 0;
  score.value = 0;
  gameState.value = 'START';
  placeFood();
};

const startGame = () => {
  if (gameState.value === 'PLAYING') return;
  gameState.value = 'PLAYING';
  nextDx = 1; nextDy = 0; // Start moving right
  if (gameInterval) clearInterval(gameInterval);
  gameInterval = setInterval(gameLoop, GAME_SPEED);
};

const placeFood = () => {
  let valid = false;
  while (!valid) {
    food = {
      x: Math.floor(Math.random() * TILE_COUNT_X),
      y: Math.floor(Math.random() * TILE_COUNT_Y)
    };
    // Ensure food doesn't spawn on snake
    valid = !snake.some(p => p.x === food.x && p.y === food.y);
  }
};

const changeDirection = (dir) => {
  if (gameState.value === 'START' || gameState.value === 'GAMEOVER') {
    if (gameState.value === 'GAMEOVER') resetState();
    startGame();
    // Set initial direction based on key
    if(dir === 'up') { nextDx = 0; nextDy = -1; }
    if(dir === 'down') { nextDx = 0; nextDy = 1; }
    if(dir === 'left') { nextDx = -1; nextDy = 0; }
    if(dir === 'right') { nextDx = 1; nextDy = 0; }
    return;
  }

  // Prevent reversing direction directly
  switch(dir) {
    case 'up': if (dy !== 1) { nextDx = 0; nextDy = -1; } break;
    case 'down': if (dy !== -1) { nextDx = 0; nextDy = 1; } break;
    case 'left': if (dx !== 1) { nextDx = -1; nextDy = 0; } break;
    case 'right': if (dx !== -1) { nextDx = 1; nextDy = 0; } break;
  }
};

const gameLoop = () => {
  dx = nextDx; dy = nextDy;
  const head = { x: snake[0].x + dx, y: snake[0].y + dy };

  // Wrap around (Toroidal world) or Wall collision?
  // Let's do Wrap around for better UX in small terminal
  if (head.x < 0) head.x = TILE_COUNT_X - 1;
  if (head.x >= TILE_COUNT_X) head.x = 0;
  if (head.y < 0) head.y = TILE_COUNT_Y - 1;
  if (head.y >= TILE_COUNT_Y) head.y = 0;

  // Self collision
  if (snake.some((p, i) => i !== 0 && p.x === head.x && p.y === head.y)) {
    gameOver();
    return;
  }

  snake.unshift(head);

  // Eat food
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

const gameOver = () => {
  gameState.value = 'GAMEOVER';
  clearInterval(gameInterval);
  draw();
};

const draw = () => {
  if (!ctx || !canvasRef.value) return;
  const themeColor = getThemeColor();

  // Clear background
  ctx.fillStyle = '#0c0c0c';
  ctx.fillRect(0, 0, canvasRef.value.width, canvasRef.value.height);

  // Draw Grid (optional, low opacity)
  ctx.strokeStyle = '#1a1a1a';
  ctx.lineWidth = 1;
  /*
  for(let x=0; x<=canvasRef.value.width; x+=GRID_SIZE) {
    ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x, canvasRef.value.height); ctx.stroke();
  }
  for(let y=0; y<=canvasRef.value.height; y+=GRID_SIZE) {
    ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(canvasRef.value.width, y); ctx.stroke();
  }
  */

  // Draw Snake
  snake.forEach((p, i) => {
    ctx.fillStyle = i === 0 ? '#fff' : themeColor;
    // Draw with slight padding for blocky look
    ctx.fillRect(p.x * GRID_SIZE + 1, p.y * GRID_SIZE + 1, GRID_SIZE - 2, GRID_SIZE - 2);

    // Glow effect for head
    if (i === 0) {
      ctx.shadowBlur = 10;
      ctx.shadowColor = themeColor;
    } else {
      ctx.shadowBlur = 0;
    }
  });
  ctx.shadowBlur = 0; // Reset

  // Draw Food
  ctx.fillStyle = '#ff0055';
  ctx.beginPath();
  ctx.arc((food.x * GRID_SIZE) + GRID_SIZE/2, (food.y * GRID_SIZE) + GRID_SIZE/2, GRID_SIZE/2 - 2, 0, Math.PI * 2);
  ctx.fill();

  // Draw UI Overlays
  if (gameState.value === 'START') {
    drawCenterText("SNAKE.EXE", -20, 24, themeColor);
    drawCenterText("PRESS ARROW KEYS TO START", 20, 14, "#888");
  } else if (gameState.value === 'GAMEOVER') {
    drawCenterText("GAME OVER", -20, 24, "#ff0055");
    drawCenterText(`SCORE: ${score.value}`, 10, 16, "#fff");
    drawCenterText("PRESS SPACE TO RESTART", 40, 14, "#888");
  }
};

const drawCenterText = (text, yOffset, fontSize, color) => {
  ctx.fillStyle = color;
  ctx.font = `bold ${fontSize}px Consolas, monospace`;
  ctx.textAlign = 'center';
  ctx.fillText(text, canvasRef.value.width / 2, canvasRef.value.height / 2 + yOffset);
};

const handleKeydown = (e) => {
  // Prevent default scrolling for game keys
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
    e.preventDefault();
  }

  if (e.key === 'Escape') {
    if (gameInterval) clearInterval(gameInterval);
    emit('exit');
    return;
  }

  if (e.key === ' ' || e.key === 'Enter') {
    if (gameState.value === 'GAMEOVER' || gameState.value === 'START') {
        if(gameState.value === 'GAMEOVER') resetState();
        startGame();
    }
  }

  switch(e.key) {
    case 'ArrowUp': changeDirection('up'); break;
    case 'ArrowDown': changeDirection('down'); break;
    case 'ArrowLeft': changeDirection('left'); break;
    case 'ArrowRight': changeDirection('right'); break;
  }
};

onMounted(() => {
  initGame();
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  if (gameInterval) clearInterval(gameInterval);
  window.removeEventListener('keydown', handleKeydown);
  window.removeEventListener('resize', resizeCanvas);
});
</script>

<template>
  <div class="snake-terminal-container">
    <div class="game-info-bar">
      <span>SCORE: {{ score }}</span>
      <span class="high-score">HIGH: {{ highScore }}</span>
      <span class="exit-hint">[ESC] TO EXIT</span>
    </div>
    <div class="canvas-wrapper">
      <canvas ref="canvasRef"></canvas>
      <div class="scanlines"></div>
    </div>
  </div>
</template>

<style scoped>
.snake-terminal-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #0c0c0c;
  overflow: hidden;
  position: relative;
}

.game-info-bar {
  display: flex;
  justify-content: space-between;
  padding: 5px 10px;
  background: #111;
  border-bottom: 1px solid #333;
  color: #888;
  font-family: 'Consolas', monospace;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.high-score {
  color: var(--neon);
}

.exit-hint {
  font-size: 0.8rem;
}

.canvas-wrapper {
  flex: 1;
  position: relative;
  overflow: hidden;
}

canvas {
  display: block;
  /* width and height are set by JS */
}

/* CRT Scanline Effect */
.scanlines {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0),
    rgba(255, 255, 255, 0) 50%,
    rgba(0, 0, 0, 0.2) 50%,
    rgba(0, 0, 0, 0.2)
  );
  background-size: 100% 4px;
  pointer-events: none;
  z-index: 10;
  opacity: 0.6;
}
</style>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const isPlaying = ref(false);
const audioRef = ref(null);
const volume = ref(0.5);
const currentTrackIndex = ref(0);
const isMinimized = ref(true); // default to minimized (floating mini capsule) for cleaner initial look!

// Dragging state
const playerRef = ref(null);
const isDragging = ref(false);
const offset = ref({ x: 0, y: 0 });

const tracks = [
  {
    title: "Neon Nights",
    artist: "Turntable at Warm",
    url: "https://alirezalotfimoghaddam.s3.ir-thr-at1.arvanstorage.ir/music%2FNeon%20Nights%20-%20Turntable%20at%20Warm.mp3?versionId=",
  }
];

const togglePlay = () => {
  if (!audioRef.value) return;
  if (isPlaying.value) {
    audioRef.value.pause();
  } else {
    audioRef.value.play().catch(e => console.log("Audio play failed", e));
  }
  isPlaying.value = !isPlaying.value;
};

const nextTrack = () => {
  currentTrackIndex.value = (currentTrackIndex.value + 1) % tracks.length;
  isPlaying.value = false;
  setTimeout(() => {
    if(audioRef.value) {
      audioRef.value.load();
      togglePlay();
    }
  }, 100);
};

const updateVolume = (e) => {
  volume.value = e.target.value;
  if (audioRef.value) audioRef.value.volume = volume.value;
};

const handleEnded = () => {
  nextTrack();
};

const toggleMinimize = () => {
  isMinimized.value = !isMinimized.value;
};

// Drag Logic
const startDrag = (e) => {
  if (['BUTTON', 'INPUT', 'IMG'].includes(e.target.tagName) || e.target.closest('.mini-audio-capsule') || e.target.closest('.minimize-btn')) return;

  isDragging.value = true;
  const rect = playerRef.value.getBoundingClientRect();
  offset.value = {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };

  playerRef.value.style.transition = 'none';

  window.addEventListener('mousemove', onDrag);
  window.addEventListener('mouseup', stopDrag);
};

const onDrag = (e) => {
  if (!isDragging.value) return;

  const x = e.clientX - offset.value.x;
  const y = e.clientY - offset.value.y;

  playerRef.value.style.left = `${x}px`;
  playerRef.value.style.top = `${y}px`;
  playerRef.value.style.bottom = 'auto';
  playerRef.value.style.right = 'auto';
  playerRef.value.style.transform = 'none';
};

const stopDrag = () => {
  isDragging.value = false;
  playerRef.value.style.transition = 'width 0.35s cubic-bezier(0.16, 1, 0.3, 1), height 0.35s cubic-bezier(0.16, 1, 0.3, 1), border-radius 0.3s';
  window.removeEventListener('mousemove', onDrag);
  window.removeEventListener('mouseup', stopDrag);
};

onMounted(() => {
  if (audioRef.value) {
    audioRef.value.volume = volume.value;
  }
});
</script>

<template>
  <div
    ref="playerRef"
    class="music-player"
    :class="{ minimized: isMinimized }"
    @mousedown="startDrag"
    dir="ltr"
  >
    <!-- MINIMIZED: Ultra-Minimalist Floating Audio Capsule -->
    <div v-if="isMinimized" class="mini-audio-capsule" @click.stop="toggleMinimize">
      <!-- Animated mini soundwave icon -->
      <div class="mini-wave" :class="{ playing: isPlaying }">
        <span class="wave-bar"></span>
        <span class="wave-bar"></span>
        <span class="wave-bar"></span>
        <span class="wave-bar"></span>
      </div>
      
      <!-- Mini text -->
      <span class="mini-title">{{ isPlaying ? tracks[currentTrackIndex].title : 'Music Player' }}</span>
      
      <!-- Floating tiny play indicator dot -->
      <span class="status-dot" :class="{ active: isPlaying }"></span>
    </div>

    <!-- EXPANDED: Premium Digital Audio Widget -->
    <div v-else class="expanded-player">
      <!-- Header -->
      <div class="player-header">
        <div class="track-info">
          <span class="track-title">{{ tracks[currentTrackIndex].title }}</span>
          <span class="track-artist">{{ tracks[currentTrackIndex].artist }}</span>
        </div>
        <button class="minimize-btn" @click.stop="toggleMinimize" title="Collapse Player">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="4" y1="12" x2="20" y2="12" />
          </svg>
        </button>
      </div>

      <!-- Controls & Volume -->
      <div class="player-controls">
        <button class="control-btn play-btn" @click.stop="togglePlay" :title="isPlaying ? 'Pause' : 'Play'">
          <svg v-if="isPlaying" viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
          </svg>
          <svg v-else viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </button>
        
        <button class="control-btn" @click.stop="nextTrack" title="Next Track">
          <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
            <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
          </svg>
        </button>

        <div class="volume-wrap">
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--text-soft); margin-right: 4px;">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
          </svg>
          <input
            type="range"
            min="0" max="1" step="0.01"
            :value="volume"
            @input="updateVolume"
            class="volume-slider"
            @mousedown.stop
          />
        </div>
      </div>

      <!-- Visualizer (Glowing 8 channels) -->
      <div class="visualizer" :class="{ static: !isPlaying }">
        <div class="bar bar-1"></div>
        <div class="bar bar-2"></div>
        <div class="bar bar-3"></div>
        <div class="bar bar-4"></div>
        <div class="bar bar-5"></div>
        <div class="bar bar-6"></div>
        <div class="bar bar-7"></div>
        <div class="bar bar-8"></div>
      </div>
    </div>

    <!-- Audio Element -->
    <audio
      ref="audioRef"
      :src="tracks[currentTrackIndex].url"
      @ended="handleEnded"
      @pause="isPlaying = false"
      @play="isPlaying = true"
    ></audio>
  </div>
</template>

<style scoped>
.music-player {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 250px;
  background: var(--glass-panel);
  backdrop-filter: blur(20px) saturate(140%);
  -webkit-backdrop-filter: blur(20px) saturate(140%);
  border: 1px solid var(--panel-border);
  border-radius: 18px;
  padding: 12px;
  z-index: 9999;
  box-shadow: 
    0 16px 36px rgba(0, 0, 0, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  font-family: inherit;
  transition: width 0.35s cubic-bezier(0.16, 1, 0.3, 1), height 0.35s cubic-bezier(0.16, 1, 0.3, 1), border-radius 0.3s;
  cursor: grab;
  user-select: none;
}

.music-player:hover {
  border-color: var(--neon);
  box-shadow: 
    0 20px 42px rgba(0, 0, 0, 0.4),
    0 0 10px rgba(var(--neon-rgb), 0.15);
}

.music-player:active {
  cursor: grabbing;
}

/* Minimized State: Sleek dynamic capsule dock */
.music-player.minimized {
  width: 145px;
  height: 38px;
  padding: 0 12px;
  border-radius: 99px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.mini-audio-capsule {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  cursor: pointer;
}

.mini-wave {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 12px;
  flex-shrink: 0;
}

.wave-bar {
  width: 2px;
  height: 2px;
  background-color: var(--neon);
  border-radius: 1px;
}

.mini-wave.playing .wave-bar {
  animation: miniBounce 0.8s ease-in-out infinite alternate;
}
.mini-wave.playing .wave-bar:nth-child(1) { animation-delay: 0.1s; }
.mini-wave.playing .wave-bar:nth-child(2) { animation-delay: 0.4s; }
.mini-wave.playing .wave-bar:nth-child(3) { animation-delay: 0.2s; }
.mini-wave.playing .wave-bar:nth-child(4) { animation-delay: 0.5s; }

@keyframes miniBounce {
  0% { height: 2px; }
  100% { height: 12px; }
}

.mini-title {
  font-size: 0.72rem;
  color: var(--text-main);
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  text-align: center;
}

.status-dot {
  width: 5px;
  height: 5px;
  background-color: var(--text-soft);
  border-radius: 50%;
  transition: all 0.3s;
  flex-shrink: 0;
}

.status-dot.active {
  background-color: #67ff64;
  box-shadow: 0 0 6px #67ff64;
}

/* Expanded State */
.expanded-player {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.player-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.track-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.track-title {
  color: var(--text-main);
  font-size: 0.8rem;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.track-artist {
  color: var(--text-soft);
  font-size: 0.65rem;
}

.minimize-btn {
  background: var(--item-bg);
  border: 1px solid var(--panel-border);
  color: var(--text-soft);
  width: 22px;
  height: 22px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.minimize-btn:hover {
  background: var(--item-hover-bg);
  border-color: var(--neon);
  color: var(--text-main);
}

.player-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.control-btn {
  background: var(--item-bg);
  border: 1px solid var(--panel-border);
  color: var(--text-secondary);
  width: 26px;
  height: 26px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.control-btn:hover {
  background: var(--item-hover-bg);
  border-color: var(--neon);
  color: var(--text-main);
  transform: scale(1.05);
}

.control-btn.play-btn {
  background: var(--neon);
  border-color: var(--neon);
  color: #040814;
}

.control-btn.play-btn:hover {
  filter: brightness(1.15);
  transform: scale(1.08);
}

.volume-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 4px;
}

.volume-slider {
  width: 100%;
  height: 3px;
  -webkit-appearance: none;
  background: var(--item-bg);
  border-radius: 99px;
  outline: none;
  direction: ltr;
}

.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 8px;
  height: 8px;
  background: var(--neon);
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 0 5px var(--neon);
}

.visualizer {
  display: flex;
  justify-content: center;
  gap: 3px;
  margin-top: 4px;
  height: 16px;
  align-items: flex-end;
  pointer-events: none;
}

.bar {
  width: 3px;
  background: var(--neon);
  border-radius: 99px;
  animation: visualize 0.6s infinite alternate;
}

.visualizer.static .bar {
  animation: none !important;
  height: 3px !important;
  opacity: 0.4;
}

.bar-1 { animation-delay: 0.1s; height: 30%; }
.bar-2 { animation-delay: 0.3s; height: 60%; }
.bar-3 { animation-delay: 0s; height: 45%; }
.bar-4 { animation-delay: 0.4s; height: 80%; }
.bar-5 { animation-delay: 0.2s; height: 50%; }
.bar-6 { animation-delay: 0.5s; height: 75%; }
.bar-7 { animation-delay: 0.15s; height: 35%; }
.bar-8 { animation-delay: 0.35s; height: 90%; }

@keyframes visualize {
  0% { height: 20%; opacity: 0.4; }
  100% { height: 100%; opacity: 1; }
}
</style>

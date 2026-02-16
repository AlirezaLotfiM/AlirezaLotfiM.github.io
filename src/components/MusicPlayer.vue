<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const isPlaying = ref(false);
const audioRef = ref(null);
const volume = ref(0.5);
const currentTrackIndex = ref(0);
const isMinimized = ref(false);

// Dragging state
const playerRef = ref(null);
const isDragging = ref(false);
const offset = ref({ x: 0, y: 0 });
const position = ref({ right: 20, bottom: 20 }); // Using right/bottom for RTL friendly default, but drag will likely set left/top or transform.
// Actually, dragging usually sets left/top. Let's stick to standard dragging.
// But initial position is bottom-right.
const useTransform = ref(false);
const dragPos = ref({ x: 0, y: 0 });

const tracks = [
  {
    title: "Neon Dreams",
    artist: "Synthwave Mix",
    url: "/music/neon-dreams.mp3", // Placeholder
  },
  {
    title: "Cyber City",
    artist: "Lo-Fi Beats",
    url: "/music/cyber-city.mp3", // Placeholder
  }
];

const togglePlay = () => {
  if (!audioRef.value) return;
  if (isPlaying.value) {
    audioRef.value.pause();
  } else {
    audioRef.value.play().catch(e => console.log("Audio play failed (user interaction needed first)", e));
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

const toggleMinimize = (e) => {
  // Prevent toggle if it was a drag
  isMinimized.value = !isMinimized.value;
};

// Drag Logic
const startDrag = (e) => {
  // Ignore clicks on buttons/inputs
  if (['BUTTON', 'INPUT'].includes(e.target.tagName)) return;

  isDragging.value = true;
  const rect = playerRef.value.getBoundingClientRect();
  // Calculate offset from top-left of the element
  offset.value = {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };

  // Disable transition during drag
  playerRef.value.style.transition = 'none';

  window.addEventListener('mousemove', onDrag);
  window.addEventListener('mouseup', stopDrag);
};

const onDrag = (e) => {
  if (!isDragging.value) return;

  // Set position based on mouse - offset
  // We need to switch from bottom/right positioning to top/left on first drag, or use transform.
  // Easiest is to set left/top directly.
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
  playerRef.value.style.transition = 'width 0.3s, height 0.3s'; // Restore transition
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
    <!-- Header / Drag Handle -->
    <div class="player-header">
      <div class="track-info" v-if="!isMinimized">
        <span class="track-title">{{ tracks[currentTrackIndex].title }}</span>
        <span class="track-artist">{{ tracks[currentTrackIndex].artist }}</span>
      </div>
      <div class="mini-icon" v-else @click.stop="toggleMinimize">🎵</div>

      <button class="minimize-btn" @click.stop="toggleMinimize">
        {{ isMinimized ? '+' : '−' }}
      </button>
    </div>

    <!-- Controls -->
    <div class="player-controls" v-show="!isMinimized">
      <button class="control-btn" @click.stop="togglePlay">
        {{ isPlaying ? '❚❚' : '▶' }}
      </button>
      <button class="control-btn" @click.stop="nextTrack">⏭</button>

      <div class="volume-wrap">
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

    <!-- Audio Element -->
    <audio
      ref="audioRef"
      :src="tracks[currentTrackIndex].url"
      @ended="handleEnded"
      @pause="isPlaying = false"
      @play="isPlaying = true"
    ></audio>

    <!-- Visualizer Animation (CSS only) -->
    <div class="visualizer" v-if="isPlaying && !isMinimized">
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
    </div>
  </div>
</template>

<style scoped>
.music-player {
  position: fixed;
  bottom: 20px;
  right: 20px; /* Initial position */
  width: 250px;
  background: rgba(10, 10, 10, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid var(--neon, #67FF64);
  border-radius: 8px;
  padding: 10px;
  z-index: 9999;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.5);
  font-family: 'Consolas', monospace;
  transition: width 0.3s, height 0.3s;
  cursor: grab;
  user-select: none;
}

.music-player:active {
  cursor: grabbing;
}

.music-player.minimized {
  width: 50px;
  height: 50px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  overflow: hidden;
}

.player-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  pointer-events: none; /* Let clicks pass through to container for dragging, except buttons */
}

.player-header > * {
  pointer-events: auto;
}

.minimized .player-header {
  margin-bottom: 0;
  width: 100%;
  height: 100%;
  justify-content: center;
}

.track-info {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  pointer-events: none;
}

.track-title {
  color: #fff;
  font-size: 0.85rem;
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.track-artist {
  color: var(--text-muted, #888);
  font-size: 0.7rem;
}

.minimize-btn {
  background: none;
  border: none;
  color: var(--neon, #67FF64);
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0 5px;
}

.minimized .minimize-btn {
  display: none;
}

.player-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.control-btn {
  background: none;
  border: 1px solid var(--neon, #67FF64);
  color: var(--neon, #67FF64);
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  transition: 0.2s;
  flex-shrink: 0;
}

.control-btn:hover {
  background: var(--neon, #67FF64);
  color: #000;
}

.volume-wrap {
  flex: 1;
  display: flex;
  align-items: center;
}

.volume-slider {
  width: 100%;
  height: 4px;
  -webkit-appearance: none;
  background: #333;
  border-radius: 2px;
  outline: none;
  direction: ltr; /* Force LTR for volume slider */
}

.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 10px;
  height: 10px;
  background: var(--neon, #67FF64);
  border-radius: 50%;
  cursor: pointer;
}

.visualizer {
  display: flex;
  justify-content: center;
  gap: 3px;
  margin-top: 8px;
  height: 15px;
  align-items: flex-end;
  pointer-events: none;
}

.bar {
  width: 4px;
  background: var(--neon, #67FF64);
  animation: visualize 0.5s infinite alternate;
}

.bar:nth-child(1) { animation-delay: 0s; height: 40%; }
.bar:nth-child(2) { animation-delay: 0.1s; height: 70%; }
.bar:nth-child(3) { animation-delay: 0.3s; height: 50%; }
.bar:nth-child(4) { animation-delay: 0.2s; height: 80%; }

@keyframes visualize {
  0% { height: 20%; opacity: 0.5; }
  100% { height: 100%; opacity: 1; }
}

.mini-icon {
  font-size: 1.5rem;
  animation: spin 3s linear infinite;
  cursor: pointer;
  pointer-events: auto;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>

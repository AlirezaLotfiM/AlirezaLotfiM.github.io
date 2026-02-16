<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const isPlaying = ref(false);
const audioRef = ref(null);
const volume = ref(0.5);
const currentTrackIndex = ref(0);
const isMinimized = ref(false);

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

const toggleMinimize = () => {
  isMinimized.value = !isMinimized.value;
};

onMounted(() => {
  if (audioRef.value) {
    audioRef.value.volume = volume.value;
  }
});
</script>

<template>
  <div class="music-player" :class="{ minimized: isMinimized }" @click="isMinimized ? toggleMinimize() : null">
    <!-- Header / Drag Handle -->
    <div class="player-header">
      <div class="track-info" v-if="!isMinimized">
        <span class="track-title">{{ tracks[currentTrackIndex].title }}</span>
        <span class="track-artist">{{ tracks[currentTrackIndex].artist }}</span>
      </div>
      <div class="mini-icon" v-else>🎵</div>

      <button class="minimize-btn" @click="toggleMinimize">
        {{ isMinimized ? '+' : '−' }}
      </button>
    </div>

    <!-- Controls -->
    <div class="player-controls" v-show="!isMinimized">
      <button class="control-btn" @click="togglePlay">
        {{ isPlaying ? '❚❚' : '▶' }}
      </button>
      <button class="control-btn" @click="nextTrack">⏭</button>

      <input
        type="range"
        min="0" max="1" step="0.01"
        :value="volume"
        @input="updateVolume"
        class="volume-slider"
      />
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
  right: 20px;
  width: 250px;
  background: rgba(10, 10, 10, 0.85);
  backdrop-filter: blur(10px);
  border: 1px solid var(--neon, #67FF64);
  border-radius: 8px;
  padding: 10px;
  z-index: 9999;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.5);
  font-family: 'Consolas', monospace;
  transition: width 0.3s, height 0.3s, transform 0.3s;
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
  cursor: pointer;
}

.player-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
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
  display: none; /* Click anywhere to expand */
}

/* When minimized, clicking the container expands it, so we need a click handler on root if minimized?
   Actually the button is hidden. I'll make the whole div clickable when minimized.
*/

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
}

.control-btn:hover {
  background: var(--neon, #67FF64);
  color: #000;
}

.volume-slider {
  flex: 1;
  height: 4px;
  -webkit-appearance: none;
  background: #333;
  border-radius: 2px;
  outline: none;
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
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>

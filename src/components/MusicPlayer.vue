<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const isPlaying = ref(false);
const audioRef = ref(null);
const volume = ref(0.5);
const currentTrackIndex = ref(0);

const props = defineProps({
  isMinimized: {
    type: Boolean,
    default: true
  }
});
const emit = defineEmits(['toggle-minimize']);

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
  emit('toggle-minimize');
};

const handleMusicEvent = (e) => {
  const { action } = e.detail;
  if (!audioRef.value) return;

  if (action === 'play') {
    if (!isPlaying.value) togglePlay();
  } else if (action === 'pause') {
    if (isPlaying.value) togglePlay();
  } else if (action === 'next') {
    nextTrack();
  } else if (action === 'toggle') {
    togglePlay();
  }
};

onMounted(() => {
  if (audioRef.value) {
    audioRef.value.volume = volume.value;
  }
  window.addEventListener('portfolio-music', handleMusicEvent);
});

onUnmounted(() => {
  window.removeEventListener('portfolio-music', handleMusicEvent);
});
</script>

<template>
  <div
    class="music-player"
    :class="{ minimized: isMinimized }"
    dir="ltr"
  >
    <!-- MINIMIZED: Sleek, compact status bar fitting sidebar width -->
    <div v-if="isMinimized" class="mini-player-layout" @click="toggleMinimize">
      <div class="mini-left">
        <div class="mini-wave" :class="{ playing: isPlaying }">
          <span class="wave-bar"></span>
          <span class="wave-bar"></span>
          <span class="wave-bar"></span>
        </div>
        <span class="mini-title">{{ isPlaying ? tracks[currentTrackIndex].title : 'Music Player' }}</span>
      </div>
      
      <div class="mini-right" @click.stop>
        <!-- Mini Play/Pause -->
        <button class="mini-control-btn" @click="togglePlay" :title="isPlaying ? 'Pause' : 'Play'">
          <svg v-if="isPlaying" viewBox="0 0 24 24" width="10" height="10" fill="currentColor">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
          </svg>
          <svg v-else viewBox="0 0 24 24" width="10" height="10" fill="currentColor">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </button>
        <!-- Expand Arrow -->
        <button class="mini-expand-btn" @click="toggleMinimize" title="Expand Controls">
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="18 15 12 9 6 15" />
          </svg>
        </button>
      </div>
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
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
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
  position: relative;
  width: 100%;
  background: var(--glass-panel);
  backdrop-filter: blur(20px) saturate(140%);
  -webkit-backdrop-filter: blur(20px) saturate(140%);
  border: 1px solid var(--panel-border);
  border-radius: 20px;
  padding: 12px;
  box-shadow: 
    inset 0 1px 0 rgba(255, 255, 255, 0.03),
    0 8px 20px rgba(0, 0, 0, 0.15);
  font-family: inherit;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  user-select: none;
  box-sizing: border-box;
  flex-shrink: 0;
}

.music-player:hover {
  border-color: var(--neon);
  box-shadow: 
    0 10px 24px rgba(0, 0, 0, 0.2),
    0 0 8px rgba(var(--neon-rgb), 0.08);
}

/* Minimized State */
.music-player.minimized {
  padding: 8px 12px;
  cursor: pointer;
}

.mini-player-layout {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.mini-left {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  flex: 1;
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
  height: 3px;
  background-color: var(--neon);
  border-radius: 1px;
  transition: height 0.2s ease;
}

.mini-wave.playing .wave-bar {
  animation: miniBounce 0.8s ease-in-out infinite alternate;
}
.mini-wave.playing .wave-bar:nth-child(1) { animation-delay: 0.15s; }
.mini-wave.playing .wave-bar:nth-child(2) { animation-delay: 0.4s; }
.mini-wave.playing .wave-bar:nth-child(3) { animation-delay: 0.25s; }

@keyframes miniBounce {
  0% { height: 3px; }
  100% { height: 12px; }
}

.mini-title {
  font-size: 0.72rem;
  color: var(--text-main);
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mini-right {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.mini-control-btn {
  background: var(--neon);
  border: 1px solid var(--neon);
  color: #040814;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.mini-control-btn:hover {
  transform: scale(1.1);
  filter: brightness(1.15);
}

.mini-expand-btn {
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
  transition: all 0.2s ease;
}

.mini-expand-btn:hover {
  background: var(--item-hover-bg);
  border-color: var(--neon);
  color: var(--text-main);
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
  min-width: 0;
  flex: 1;
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
  transition: all 0.2s ease;
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
  gap: 8px;
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
  transition: all 0.2s ease;
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
  justify-content: space-between;
  gap: 3px;
  margin-top: 4px;
  height: 16px;
  align-items: flex-end;
  pointer-events: none;
  padding: 0 2px;
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

@media (max-width: 1024px) {
  .music-player {
    max-width: 100%;
  }
}
</style>

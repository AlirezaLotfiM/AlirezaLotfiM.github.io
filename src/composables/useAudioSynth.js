import { ref } from 'vue';

const isMuted = ref(true); // default to muted to respect user's initial silence preference!

const toggleMute = () => {
  isMuted.value = !isMuted.value;
  localStorage.setItem('sfx-muted', isMuted.value ? 'true' : 'false');
};

// Initialize mute state from localStorage
if (localStorage.getItem('sfx-muted') !== null) {
  isMuted.value = localStorage.getItem('sfx-muted') === 'true';
}

let audioCtx = null;

const getAudioContext = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

const playClick = () => {
  if (isMuted.value) return;
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.02, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  } catch (e) {
    console.warn("SFX error", e);
  }
};

const playKey = () => {
  if (isMuted.value) return;
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    // Randomize frequency slightly to feel like natural keyboard
    const freq = 600 + Math.random() * 150;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.03, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  } catch (e) {
    console.warn("SFX error", e);
  }
};

const playThemeChirp = () => {
  if (isMuted.value) return;
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1800, ctx.currentTime + 0.35);

    gain.gain.setValueAtTime(0.02, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch (e) {
    console.warn("SFX error", e);
  }
};

const playBootChime = () => {
  if (isMuted.value) return;
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // Play a dual chord chime (C5 & G5) that sweeps up
    const freqs = [523.25, 783.99]; // C5, G5
    
    freqs.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq - 100, now + index * 0.08);
      osc.frequency.exponentialRampToValueAtTime(freq, now + 0.15 + index * 0.08);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 0.4 + index * 0.08);
      
      gain.gain.setValueAtTime(0, now + index * 0.08);
      gain.gain.linearRampToValueAtTime(0.015, now + 0.05 + index * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6 + index * 0.08);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now + index * 0.08);
      osc.stop(now + 0.7 + index * 0.08);
    });
  } catch (e) {
    console.warn("SFX error", e);
  }
};

export function useAudioSynth() {
  return {
    isMuted,
    toggleMute,
    playClick,
    playKey,
    playThemeChirp,
    playBootChime
  };
}

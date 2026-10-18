<script setup>
import { ref, onMounted, nextTick, onUnmounted } from 'vue';
import { useTheme } from '../../composables/useTheme';
import { useAudioSynth } from '../../composables/useAudioSynth';

const { isDark, isPaper, isLight } = useTheme();
const { playClick } = useAudioSynth();

const isAnimating = ref(false);
const hasDrawnOnce = ref(false);
const wrapperRef = ref(null);
let animationTimer = null;

const triggerRewrite = () => {
  // Reset animation cleanly
  isAnimating.value = false;
  clearTimeout(animationTimer);

  nextTick(() => {
    isAnimating.value = true;
    hasDrawnOnce.value = true;
    playClick();

    // Duration of complete writing sequence
    animationTimer = setTimeout(() => {
      isAnimating.value = false;
    }, 1300);
  });
};

onMounted(() => {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    hasDrawnOnce.value = true;
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !hasDrawnOnce.value) {
          triggerRewrite();
          observer.disconnect();
        }
      });
    },
    { threshold: 0.25 }
  );

  if (wrapperRef.value) {
    observer.observe(wrapperRef.value);
  }
});

onUnmounted(() => {
  clearTimeout(animationTimer);
});

const handleClick = () => {
  playClick();
};
</script>

<template>
  <div
    ref="wrapperRef"
    class="damoon-sig-wrapper"
    dir="ltr"
    :class="{
      'is-dark': isDark,
      'is-paper': isPaper,
      'is-light': isLight,
      'is-animating': isAnimating,
      'has-drawn': hasDrawnOnce
    }"
  >
    <a
      href="https://alirezalotfimoghaddam.ir"
      target="_blank"
      rel="noopener noreferrer"
      class="damoon-sig-link"
      dir="ltr"
      @mouseenter="triggerRewrite"
      @click="handleClick"
    >
      <span class="sig-label mono-font">Crafted by</span>

      <svg
        class="damoon-svg"
        viewBox="0 0 320 110"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="امضای دیجیتال علیرضا لطفی مقدم (دامون)"
        role="img"
      >
        <defs>
          <!-- Theme-Adaptive Linear Gradient -->
          <linearGradient id="damoon-neon-grad" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stop-color="var(--sig-stop-1)" />
            <stop offset="50%" stop-color="var(--sig-stop-2)" />
            <stop offset="100%" stop-color="var(--sig-stop-3)" />
          </linearGradient>
        </defs>

        <g class="sig-group">
          <!-- ۱. حرف D -->
          <path
            class="sig-path draw-d"
            d="M 62 18 L 35 88 M 20 40 C 55 12, 108 18, 92 54 C 76 86, 25 96, 22 80 C 19 66, 52 58, 78 56"
            stroke="url(#damoon-neon-grad)"
            stroke-width="4"
            stroke-linecap="round"
            stroke-linejoin="round"
          />

          <!-- ۲. حروف amoon -->
          <path
            class="sig-path draw-amoon"
            d="M 96 52 C 82 52, 76 68, 86 68 C 94 68, 98 54, 100 50 C 98 62, 100 68, 108 66 C 112 56, 116 50, 118 50 C 116 58, 115 68, 115 68 C 118 54, 126 50, 128 52 C 130 56, 127 68, 127 68 C 131 54, 139 50, 142 52 C 145 56, 142 68, 148 66 C 155 64, 160 56, 166 52 C 158 54, 155 68, 165 68 C 174 68, 178 56, 170 52 C 164 49, 174 52, 186 52 C 178 54, 175 68, 185 68 C 194 68, 198 56, 190 52 C 185 49, 196 52, 204 50 C 202 58, 200 68, 200 68 C 205 52, 214 48, 217 52 C 220 56, 216 68, 226 65 C 245 60, 275 48, 298 44"
            stroke="url(#damoon-neon-grad)"
            stroke-width="3.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />

          <!-- ۳. خط تیز زیر امضا -->
          <path
            class="sig-path draw-slash"
            d="M 65 92 Q 155 74 235 66 L 165 86 L 225 78"
            stroke="url(#damoon-neon-grad)"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />

          <!-- ۴. نقطه‌های پرتابی -->
          <circle class="sig-dot dot-1" cx="308" cy="42" r="2.5" fill="var(--sig-dot-1)" />
          <circle class="sig-dot dot-2" cx="248" cy="65" r="2.5" fill="var(--sig-dot-2)" />
          <circle class="sig-dot dot-3" cx="238" cy="77" r="2" fill="var(--sig-dot-3)" />
        </g>
      </svg>
    </a>
  </div>
</template>

<style scoped>
/* ── THEME PALETTES ── */

/* 1. Swiss Minimalist Light */
.damoon-sig-wrapper.is-light {
  --sig-stop-1: #09090b;
  --sig-stop-2: #2563eb;
  --sig-stop-3: #1d4ed8;
  --sig-dot-1: #2563eb;
  --sig-dot-2: #09090b;
  --sig-dot-3: #1d4ed8;
  --sig-glow-1: rgba(37, 99, 235, 0.28);
  --sig-glow-2: rgba(29, 78, 216, 0.15);
  --sig-label-color: #71717a;
  --sig-label-hover: #1d4ed8;
}

/* 2. Fidibo Warm Paper */
.damoon-sig-wrapper.is-paper {
  --sig-stop-1: #2b2621;
  --sig-stop-2: #78350f;
  --sig-stop-3: #b45309;
  --sig-dot-1: #b45309;
  --sig-dot-2: #2b2621;
  --sig-dot-3: #92400e;
  --sig-glow-1: rgba(180, 83, 9, 0.25);
  --sig-glow-2: rgba(120, 53, 15, 0.15);
  --sig-label-color: #786e64;
  --sig-label-hover: #b45309;
}

/* 3. Space Obsidian Dark (Exact Cyber Neon Aesthetic) */
.damoon-sig-wrapper.is-dark {
  --sig-stop-1: #00f5d4;
  --sig-stop-2: #9b5de5;
  --sig-stop-3: #f72585;
  --sig-dot-1: #f72585;
  --sig-dot-2: #00f5d4;
  --sig-dot-3: #f72585;
  --sig-glow-1: rgba(0, 245, 212, 0.7);
  --sig-glow-2: rgba(155, 93, 229, 0.5);
  --sig-glow-3: rgba(247, 37, 133, 0.8);
  --sig-label-color: #94a3b8;
  --sig-label-hover: #00f5d4;
}

/* Enforce Left-to-Right orientation so "Crafted by" is on the left and signature is on the right */
.damoon-sig-wrapper {
  direction: ltr !important;
  text-align: left !important;
  display: inline-flex;
  align-items: center;
  padding: 4px 0;
  user-select: none;
}

.damoon-sig-link {
  direction: ltr !important;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  opacity: 0.85;
  cursor: pointer;
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1),
              opacity 0.3s ease;
}

.sig-label {
  font-size: 0.76rem;
  color: var(--sig-label-color, var(--text-soft));
  letter-spacing: 0.4px;
  white-space: nowrap;
  transition: color 0.3s ease, letter-spacing 0.3s ease;
}

.damoon-svg {
  width: 140px;
  height: auto;
  overflow: visible;
  filter: drop-shadow(0px 2px 6px var(--sig-glow-1, rgba(37, 99, 235, 0.15)));
  transition: filter 0.3s ease, transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

/* Base Rested State (stays drawn once finished) */
.draw-d {
  stroke-dasharray: 400;
  stroke-dashoffset: 0;
}

.draw-amoon {
  stroke-dasharray: 650;
  stroke-dashoffset: 0;
}

.draw-slash {
  stroke-dasharray: 350;
  stroke-dashoffset: 0;
}

.sig-dot {
  opacity: 1;
  transform: none;
  transform-origin: center;
}

/* Hidden before initial entry */
.damoon-sig-wrapper:not(.has-drawn) .draw-d {
  stroke-dashoffset: 400;
}
.damoon-sig-wrapper:not(.has-drawn) .draw-amoon {
  stroke-dashoffset: 650;
}
.damoon-sig-wrapper:not(.has-drawn) .draw-slash {
  stroke-dashoffset: 350;
}
.damoon-sig-wrapper:not(.has-drawn) .sig-dot {
  opacity: 0;
}

/* ══════════════════════════════════════════════════════════════════
   SMOOTH REWRITE ANIMATION (Viewport Arrival + Hover Trigger)
   ══════════════════════════════════════════════════════════════════ */
.is-animating .draw-d {
  animation: write-d 0.45s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.is-animating .draw-amoon {
  stroke-dashoffset: 650;
  animation: write-amoon 0.65s cubic-bezier(0.4, 0, 0.2, 1) 0.18s forwards;
}

.is-animating .draw-slash {
  stroke-dashoffset: 350;
  animation: write-slash 0.4s ease-out 0.58s forwards;
}

.is-animating .dot-1 {
  animation: pop-dot 0.35s ease-out 0.72s backwards;
}

.is-animating .dot-2 {
  animation: pop-dot 0.35s ease-out 0.82s backwards;
}

.is-animating .dot-3 {
  animation: pop-dot 0.35s ease-out 0.92s backwards;
}

/* Hover Lift & Glow */
.damoon-sig-link:hover {
  opacity: 1;
  transform: translateY(-2px);
}

.damoon-sig-link:hover .sig-label {
  color: var(--sig-label-hover, var(--neon));
}

.damoon-sig-link:hover .damoon-svg {
  transform: scale(1.02);
  filter: drop-shadow(0px 3px 12px var(--sig-glow-1, rgba(37, 99, 235, 0.35)));
}

.damoon-sig-wrapper.is-dark .damoon-sig-link:hover .sig-label {
  text-shadow: 0 0 8px rgba(0, 245, 212, 0.5);
}

.damoon-sig-wrapper.is-dark .damoon-sig-link:hover .damoon-svg {
  animation: neon-pulse 1.5s infinite alternate ease-in-out;
}

/* Animation Keyframes */
@keyframes neon-pulse {
  0% {
    filter: drop-shadow(0 0 4px var(--sig-glow-1)) drop-shadow(0 0 10px var(--sig-glow-2));
  }
  100% {
    filter: drop-shadow(0 0 8px var(--sig-glow-1)) drop-shadow(0 0 18px var(--sig-glow-3)) drop-shadow(0 0 28px var(--sig-glow-2));
  }
}

@keyframes write-d {
  0% {
    stroke-dashoffset: 400;
  }
  100% {
    stroke-dashoffset: 0;
  }
}

@keyframes write-amoon {
  0% {
    stroke-dashoffset: 650;
  }
  100% {
    stroke-dashoffset: 0;
  }
}

@keyframes write-slash {
  0% {
    stroke-dashoffset: 350;
  }
  100% {
    stroke-dashoffset: 0;
  }
}

@keyframes pop-dot {
  0% {
    opacity: 0;
    transform: scale(0) translate(-8px, 4px);
  }
  70% {
    opacity: 1;
    transform: scale(1.4) translate(1px, -1px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translate(0, 0);
  }
}

@media (max-width: 640px) {
  .damoon-sig-link {
    gap: 8px;
  }
  .damoon-svg {
    width: 125px;
  }
}
</style>

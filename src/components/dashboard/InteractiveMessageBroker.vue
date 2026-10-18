<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useAudioSynth } from '../../composables/useAudioSynth';
import { useTheme } from '../../composables/useTheme';

const { playClick, playKey } = useAudioSynth();
const { isDark, isPaper, isLight } = useTheme();

// Self-contained Explorable Progress & Simulation State
const currentProgress = ref(0.08); // Starts at stage 1
const isAutoPlaying = ref(false);
let autoPlayRaf = null;
let lastAutoPlayTime = null;
let stageTransitionRaf = null;
const DURATION_MS = 12000; // 12 seconds for complete cinematic walkthrough

const activeStage = computed(() => {
  const p = currentProgress.value;
  if (p >= 0.66) return 2;
  if (p >= 0.33) return 1;
  return 0;
});

// Audio feedback on stage change
watch(activeStage, (newStage, oldStage) => {
  if (newStage !== oldStage) {
    playKey();
  }
});

const stages = [
  {
    num: '۰۱',
    badge: 'AMQP Binding',
    mobileBadge: 'اتصال امن',
    title: 'پرده اول: اتصال امن و ناهمگام (AMQP Binding)',
    desc: 'تولیدکننده پیام (Publisher) و مصرف‌کننده (Consumer) به صورت مستقیم با یکدیگر در ارتباط نیستند؛ هر دو از طریق یک کانال امن با Message Broker نشست برقرار می‌کنند تا کوپلینگ زمانی و مکانی حذف شود.',
    metrics: [
      { label: 'پروتکل', val: 'AMQP 0-9-1' },
      { label: 'وضعیت کانال', val: 'Connected' },
      { label: 'کوپلینگ کلاینت', val: 'Decoupled' }
    ]
  },
  {
    num: '۰۲',
    badge: 'FIFO Enqueue',
    mobileBadge: 'صف‌بندی FIFO',
    title: 'پرده دوم: جذب فشار بار و صف‌بندی ترتیبی (Buffer)',
    desc: 'پیام‌ها در حافظه برخط کارگزار به ترتیب دقیق ورود (FIFO) چیده می‌شوند. اگر سرویس‌های بک‌اند یا دیتابیس کند شوند، سیستم قفل نمی‌شود و صف بار ورودی را بدون هدررفت مهار می‌کند.',
    metrics: [
      { label: 'عمق صف جاری', val: '۳ بسته در بافر' },
      { label: 'نظم توزیع', val: 'Strict FIFO' },
      { label: 'پایداری داده', val: 'Disk / Memory' }
    ]
  },
  {
    num: '۰۳',
    badge: 'ACK Delivery',
    mobileBadge: 'تحویل و تایید',
    title: 'پرده سوم: تحویل تضمینی و تاییدیه پردازش (ACK Delivery)',
    desc: 'مصرف‌کننده بسته اول را از سرِ صف دریافت می‌کند. تنها پس از پردازش موفق، سیگنال تایید (ACK) ارسال می‌شود و بسته از صف خارج می‌گردد. پیام‌های بعدی آماده پردازش می‌شوند.',
    metrics: [
      { label: 'بسته پردازش', val: 'P01 (ACK 200)' },
      { label: 'تضمین تحویل', val: 'At-Least-Once' },
      { label: 'بسته‌های نوبت', val: '۲ بسته باقی' }
    ]
  }
];

// Packets definition for visualization
const packets = [
  { id: 'p1', code: 'P01', label: 'رویداد تراکنشی #842', color: '#38bdf8' },
  { id: 'p2', code: 'P02', label: 'لاگ اثرانگشت بیومتریک', color: '#818cf8' },
  { id: 'p3', code: 'P03', label: 'رویداد فیش کیوسک', color: '#34d399' }
];

// Smooth progress transition helper
const animateProgressTo = (target, duration = 350) => {
  cancelAnimationFrame(stageTransitionRaf);
  if (isAutoPlaying.value) stopAutoPlay();

  const start = currentProgress.value;
  const startTime = performance.now();

  const step = (now) => {
    const elapsed = now - startTime;
    const t = Math.min(1, elapsed / duration);
    const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    currentProgress.value = start + (target - start) * ease;
    if (t < 1) {
      stageTransitionRaf = requestAnimationFrame(step);
    }
  };
  stageTransitionRaf = requestAnimationFrame(step);
};

const jumpToStage = (index) => {
  playClick();
  const targetFraction = index === 0 ? 0.08 : index === 1 ? 0.48 : 0.88;
  animateProgressTo(targetFraction);
};

const nextStage = () => {
  playClick();
  const next = (activeStage.value + 1) % stages.length;
  jumpToStage(next);
};

const prevStage = () => {
  playClick();
  const prev = (activeStage.value - 1 + stages.length) % stages.length;
  jumpToStage(prev);
};

// Auto-Play Controls
const startAutoPlay = () => {
  playClick();
  cancelAnimationFrame(stageTransitionRaf);
  if (currentProgress.value >= 0.98) {
    currentProgress.value = 0;
  }
  isAutoPlaying.value = true;
  lastAutoPlayTime = performance.now();

  const loop = (now) => {
    if (!isAutoPlaying.value) return;
    const delta = now - lastAutoPlayTime;
    lastAutoPlayTime = now;

    const next = currentProgress.value + (delta / DURATION_MS);
    if (next >= 1) {
      currentProgress.value = 1;
      isAutoPlaying.value = false;
      return;
    }
    currentProgress.value = next;
    autoPlayRaf = requestAnimationFrame(loop);
  };

  cancelAnimationFrame(autoPlayRaf);
  autoPlayRaf = requestAnimationFrame(loop);
};

const stopAutoPlay = () => {
  if (isAutoPlaying.value) {
    playClick();
  }
  isAutoPlaying.value = false;
  cancelAnimationFrame(autoPlayRaf);
};

const toggleAutoPlay = () => {
  if (isAutoPlaying.value) {
    stopAutoPlay();
  } else {
    startAutoPlay();
  }
};

const scrubberRailRef = ref(null);
const handleScrubberClick = (e) => {
  if (!scrubberRailRef.value) return;
  playClick();
  if (isAutoPlaying.value) stopAutoPlay();
  const rect = scrubberRailRef.value.getBoundingClientRect();
  // In RTL, right side is 0 and left side is 100%
  const clickOffsetFromRight = rect.right - e.clientX;
  const fraction = Math.max(0, Math.min(1, clickOffsetFromRight / rect.width));
  animateProgressTo(fraction, 220);
};

onUnmounted(() => {
  cancelAnimationFrame(autoPlayRaf);
  cancelAnimationFrame(stageTransitionRaf);
});

const persianNumbers = ['۱', '۲', '۳'];

// Stage interpolation helpers
const stageProgressNormalized = computed(() => {
  const p = currentProgress.value;
  if (activeStage.value === 0) return Math.min(1, p / 0.33);
  if (activeStage.value === 1) return Math.min(1, (p - 0.33) / 0.33);
  return Math.min(1, (p - 0.66) / 0.34);
});

// Smooth easing interpolation
const interpolate = (t, startT, endT, startX, endX) => {
  if (t <= startT) return startX;
  if (t >= endT) return endX;
  const progress = (t - startT) / (endT - startT);
  // Smooth cubic easeInOut
  const ease = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
  return startX + (endX - startX) * ease;
};

// ── Packet 1 Dynamics ──
const packet1Transform = computed(() => {
  if (activeStage.value === 0) {
    return 'translate(690px, 155px)';
  }
  if (activeStage.value === 1) {
    // Departs from Publisher (690px) and arrives at Queue Head (390px)
    const t = stageProgressNormalized.value;
    const x = interpolate(t, 0.0, 0.40, 690, 390);
    return `translate(${x}px, 155px)`;
  }
  // Stage 2: departs from Queue Head (390px) to Consumer (150px)
  const t = stageProgressNormalized.value;
  const x = interpolate(t, 0.05, 0.68, 390, 150);
  return `translate(${x}px, 155px)`;
});

const packet1Opacity = computed(() => {
  if (activeStage.value === 0) return 0;
  if (activeStage.value === 1) {
    const t = stageProgressNormalized.value;
    return Math.min(1, 0.4 + (t / 0.06) * 0.6);
  }
  // Stage 2: dissolves when consumed
  const t = stageProgressNormalized.value;
  if (t > 0.70) return Math.max(0, 1 - (t - 0.70) / 0.22);
  return 1;
});

// ── Packet 2 Dynamics ──
const packet2Transform = computed(() => {
  if (activeStage.value === 0) {
    return 'translate(690px, 155px)';
  }
  if (activeStage.value === 1) {
    // Departs after P1 from Publisher (690px) to Queue Slot 2 (440px)
    const t = stageProgressNormalized.value;
    const x = interpolate(t, 0.25, 0.68, 690, 440);
    return `translate(${x}px, 155px)`;
  }
  // Stage 2: advances forward from Slot 2 (440px) to Head (390px) as P1 is consumed!
  const t = stageProgressNormalized.value;
  const x = interpolate(t, 0.25, 0.70, 440, 390);
  return `translate(${x}px, 155px)`;
});

const packet2Opacity = computed(() => {
  if (activeStage.value === 0) return 0;
  if (activeStage.value === 1) {
    const t = stageProgressNormalized.value;
    if (t < 0.20) return 0;
    return Math.min(1, (t - 0.20) / 0.08);
  }
  return 1;
});

// ── Packet 3 Dynamics ──
const packet3Transform = computed(() => {
  if (activeStage.value === 0) {
    return 'translate(690px, 155px)';
  }
  if (activeStage.value === 1) {
    // Departs after P2 from Publisher (690px) to Queue Tail (490px)
    const t = stageProgressNormalized.value;
    const x = interpolate(t, 0.52, 0.92, 690, 490);
    return `translate(${x}px, 155px)`;
  }
  // Stage 2: advances forward from Tail (490px) to Slot 2 (440px)
  const t = stageProgressNormalized.value;
  const x = interpolate(t, 0.35, 0.80, 490, 440);
  return `translate(${x}px, 155px)`;
});

const packet3Opacity = computed(() => {
  if (activeStage.value === 0) return 0;
  if (activeStage.value === 1) {
    const t = stageProgressNormalized.value;
    if (t < 0.48) return 0;
    return Math.min(1, (t - 0.48) / 0.08);
  }
  return 1;
});
</script>

<template>
  <div ref="containerRef" class="scrolly-container" dir="rtl">
    <!-- Pinned Visual Stage -->
    <div class="sticky-viewport">
      <div class="explorable-card" :class="{ 'is-dark': isDark, 'is-light': isLight, 'is-paper': isPaper }">
        
        <!-- Header Ribbon -->
        <div class="card-masthead">
          <div class="masthead-title-col">
            <span class="mono-badge">EXPLORABLE SYSTEM ARCHITECTURE • ۰۱</span>
            <h3 class="explorable-heading">آناتومی یک Message Broker: از انتشار تا مصرف (FIFO)</h3>
          </div>
          <div class="masthead-controls-wrap">
            <!-- Auto-Play Simulation Trigger Button -->
            <button
              type="button"
              class="autoplay-pill-btn"
              :class="{ 'is-active': isAutoPlaying, 'is-ended': currentProgress >= 0.98 && !isAutoPlaying }"
              @click="toggleAutoPlay"
              :title="isAutoPlaying ? 'توقف اجرای خودکار' : 'اجرای خودکار سناریوی کامل'"
            >
              <span class="autoplay-status-dot"></span>
              <span class="autoplay-btn-icon">{{ isAutoPlaying ? '❚❚' : (currentProgress >= 0.98 ? '↺' : '▶') }}</span>
              <span class="autoplay-btn-label">
                {{ isAutoPlaying ? 'توقف شبیه‌سازی' : (currentProgress >= 0.98 ? 'شروع مجدد از ابتدا' : (currentProgress > 0.08 ? 'ادامه شبیه‌سازی' : 'اجرای خودکار')) }}
              </span>
            </button>

            <div
              ref="scrubberRailRef"
              class="progress-indicator interactive-scrubber"
              @click="handleScrubberClick"
              title="کلیک برای پرش به هر نقطه از شبیه‌سازی"
            >
              <span class="stage-label">
                <span v-if="isAutoPlaying" class="live-pulse-txt">🔴 زنده:</span>
                <span>مرحله</span>
                <span class="stage-num-highlight">{{ persianNumbers[activeStage] }}</span>
                <span>از ۳</span>
              </span>
              <div class="progress-bar-rail">
                <div class="progress-bar-fill" :style="{ width: `${Math.round(currentProgress * 100)}%` }"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- ═══════════════════════════════════════════════
             THE ISOMETRIC WIREFRAME VISUAL STAGE (SVG)
             ═══════════════════════════════════════════════ -->
        <div class="visual-canvas-box">
          <svg class="iso-svg" viewBox="0 0 840 280" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="pipeGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.8" />
                <stop offset="50%" stop-color="#818cf8" stop-opacity="0.9" />
                <stop offset="100%" stop-color="#34d399" stop-opacity="0.8" />
              </linearGradient>

              <!-- Editorial Book-Reader Warm Gradient -->
              <linearGradient id="pipeGlowPaper" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#b45309" stop-opacity="0.9" />
                <stop offset="50%" stop-color="#78350f" stop-opacity="0.95" />
                <stop offset="100%" stop-color="#166534" stop-opacity="0.9" />
              </linearGradient>

              <filter id="neonBlur" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            <!-- Guide grid subtle lines -->
            <path d="M 60,180 L 780,180" class="iso-axis-line" />
            <path d="M 60,140 L 780,140" class="iso-axis-line-faint" />
            <path d="M 60,220 L 780,220" class="iso-axis-line-faint" />

            <!-- Dynamic Connecting Wire / Pipe -->
            <path
              d="M 690,180 L 530,180 M 350,180 L 150,180"
              class="connecting-bus-wire"
              :class="{ 'wire-active': activeStage >= 0 }"
            />

            <!-- ── NODE 01: PUBLISHER (Right side for RTL) ── -->
            <g class="iso-node-group" transform="translate(690, 180)">
              <!-- Base Platform -->
              <polygon points="0,-22 44,-2 0,18 -44,-2" class="node-base-poly" />
              <polygon points="-44,-2 0,18 0,36 -44,16" class="node-wall-left" />
              <polygon points="0,18 44,-2 44,16 0,36" class="node-wall-right" />
              
              <!-- Indicator Light -->
              <circle cx="0" cy="-2" r="5" class="node-pulse-bulb publisher-bulb" />

              <!-- Node Label -->
              <text x="0" y="58" class="node-txt-title">Publisher</text>
              <text x="0" y="74" class="node-txt-sub mono-font">تولیدکننده رویداد</text>
            </g>

            <!-- ── NODE 02: THE QUEUE BUFFER (Center) ── -->
            <g class="iso-node-group" transform="translate(440, 180)">
              <!-- Elongated Buffer Platform -->
              <polygon points="0,-26 100,-2 0,22 -100,-2" class="node-base-poly queue-base" />
              <polygon points="-100,-2 0,22 0,40 -100,16" class="node-wall-left" />
              <polygon points="0,22 100,-2 100,16 0,40" class="node-wall-right" />

              <!-- Slot Dividers in the Queue -->
              <path d="M -35,5 L -35,32 M 35,5 L 35,32" class="queue-divider-line" />

              <!-- Node Label -->
              <text x="0" y="62" class="node-txt-title">Message Broker</text>
              <text x="0" y="78" class="node-txt-sub mono-font">صَف رویدادها (FIFO)</text>
            </g>

            <!-- ── NODE 03: CONSUMER (Left side) ── -->
            <g class="iso-node-group" transform="translate(150, 180)">
              <!-- Base Platform -->
              <polygon points="0,-22 44,-2 0,18 -44,-2" class="node-base-poly" />
              <polygon points="-44,-2 0,18 0,36 -44,16" class="node-wall-left" />
              <polygon points="0,18 44,-2 44,16 0,36" class="node-wall-right" />

              <!-- Indicator Light -->
              <circle
                cx="0"
                cy="-2"
                r="5"
                class="node-pulse-bulb consumer-bulb"
                :class="{ 'is-consuming': activeStage === 2 }"
              />

              <!-- Node Label -->
              <text x="0" y="58" class="node-txt-title">Consumer</text>
              <text x="0" y="74" class="node-txt-sub mono-font">مصرف‌کننده و ایجنت</text>
            </g>

            <!-- ═══════════════════════════════════════════════
                 ISOMETRIC DATA CUBES (PACKETS IN MOTION)
                 ═══════════════════════════════════════════════ -->

            <!-- PACKET 3: Generated in stage 1, parked in tail of queue -->
            <g
              v-if="activeStage >= 1"
              class="iso-cube-group packet-3"
              :style="{
                transform: packet3Transform,
                opacity: packet3Opacity
              }"
            >
              <!-- Top Face -->
              <polygon points="0,-14 18,-4 0,6 -18,-4" class="cube-face-top p3-top" />
              <!-- Left Face -->
              <polygon points="-18,-4 0,6 0,22 -18,12" class="cube-face-left p3-left" />
              <!-- Right Face -->
              <polygon points="0,6 18,-4 18,12 0,22" class="cube-face-right p3-right" />
              <text x="0" y="-3" class="cube-lbl mono-font">P03</text>
            </g>

            <!-- PACKET 2: Middle of queue -->
            <g
              v-if="activeStage >= 1"
              class="iso-cube-group packet-2"
              :style="{
                transform: packet2Transform,
                opacity: packet2Opacity
              }"
            >
              <!-- Top Face -->
              <polygon points="0,-14 18,-4 0,6 -18,-4" class="cube-face-top p2-top" />
              <!-- Left Face -->
              <polygon points="-18,-4 0,6 0,22 -18,12" class="cube-face-left p2-left" />
              <!-- Right Face -->
              <polygon points="0,6 18,-4 18,12 0,22" class="cube-face-right p2-right" />
              <text x="0" y="-3" class="cube-lbl mono-font">P02</text>
            </g>

            <!-- PACKET 1: Head of queue, departs from Publisher first and consumed in stage 2 -->
            <g
              v-if="activeStage >= 1"
              class="iso-cube-group packet-1"
              :style="{
                transform: packet1Transform,
                opacity: packet1Opacity
              }"
            >
              <!-- Top Face -->
              <polygon points="0,-14 18,-4 0,6 -18,-4" class="cube-face-top p1-top" />
              <!-- Left Face -->
              <polygon points="-18,-4 0,6 0,22 -18,12" class="cube-face-left p1-left" />
              <!-- Right Face -->
              <polygon points="0,6 18,-4 18,12 0,22" class="cube-face-right p1-right" />
              <text x="0" y="-3" class="cube-lbl mono-font">P01</text>
            </g>

            <!-- Acknowledgment Signal Pulse (Stage 3) -->
            <g
              v-if="activeStage === 2 && stageProgressNormalized > 0.4"
              class="ack-signal-group"
              :style="{ transform: `translate(${150 + stageProgressNormalized * 280}px, 140px)` }"
            >
              <circle cx="0" cy="0" r="4" class="ack-pulse-circle" />
              <text x="0" y="-8" class="ack-txt mono-font">ACK 200</text>
            </g>
          </svg>
        </div>

        <!-- ═══════════════════════════════════════════════
             EDITORIAL STAGE NARRATIVE & CONTROLS
             ═══════════════════════════════════════════════ -->
        <div class="narrative-footer">
          <!-- Step Switcher Tabs with Navigation Arrows -->
          <div class="stage-stepper-pills">
            <!-- Right button (in RTL): Previous Stage (moves rightward toward ۰۱) -->
            <button
              type="button"
              class="stepper-arrow-btn"
              @click="prevStage"
              :disabled="activeStage === 0"
              title="مرحله قبلی (بازگشت به راست)"
              aria-label="مرحله قبلی"
            >
              <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
            <button
              v-for="(st, idx) in stages"
              :key="idx"
              type="button"
              class="stepper-btn"
              :class="{ active: activeStage === idx }"
              @click="jumpToStage(idx)"
              :title="st.title"
            >
              <span class="step-idx mono-font">{{ st.num }}</span>
              <span class="step-badge-text desktop-only-text">{{ st.badge }}</span>
              <span class="step-badge-text mobile-only-text">{{ st.mobileBadge }}</span>
            </button>
            <!-- Left button (in RTL): Next Stage (moves leftward toward ۰۳) -->
            <button
              type="button"
              class="stepper-arrow-btn"
              @click="nextStage"
              :disabled="activeStage === stages.length - 1"
              title="مرحله بعدی (پیشروی به چپ)"
              aria-label="مرحله بعدی"
            >
              <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
          </div>

          <!-- Dynamic Textual Beat -->
          <div class="narrative-content-card">
            <div class="narrative-header-row">
              <h4 class="narrative-title">{{ stages[activeStage].title }}</h4>
              <span class="mono-status-chip">{{ stages[activeStage].badge }}</span>
            </div>
            
            <p class="narrative-desc">{{ stages[activeStage].desc }}</p>

            <!-- Micro Metrics Grid -->
            <div class="narrative-metrics-grid">
              <div
                v-for="(m, mi) in stages[activeStage].metrics"
                :key="mi"
                class="micro-metric-item"
              >
                <span class="micro-m-lbl">{{ m.label }}</span>
                <span class="micro-m-val mono-font">{{ m.val }}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
/* ══════════════════════════════════════════════════════════════════
   SCROLLYTELLING STAGE CONTAINER
   ══════════════════════════════════════════════════════════════════ */
.scrolly-container {
  position: relative;
  height: auto;
  margin: 28px 0 44px;
}

.sticky-viewport {
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
  z-index: 10;
}

.explorable-card {
  width: 100%;
  border-radius: 18px;
  border: 1px solid var(--panel-border);
  background: var(--panel-bg);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: all 0.3s ease;
}

.is-light.explorable-card {
  background: #ffffff;
  border-color: #e4e4e7;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.05);
}

.is-dark.explorable-card {
  background: rgba(15, 23, 42, 0.88);
  border-color: rgba(148, 163, 184, 0.18);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.55);
}

.is-paper.explorable-card {
  background: #fbf7ee;
  border-color: #e2d7c5;
  box-shadow: 0 8px 30px rgba(180, 83, 9, 0.08);
}

.is-paper .card-masthead {
  border-bottom-color: #ede2d2;
}

.is-paper .visual-canvas-box {
  background: #f3ece0;
}

.is-paper .node-base-poly {
  fill: #faf6ee;
  stroke: #d8cbb8;
}

.is-paper .node-wall-left {
  fill: #e8ded0;
  stroke: #d8cbb8;
}

.is-paper .node-wall-right {
  fill: #eee5d8;
  stroke: #d8cbb8;
}

.is-paper .autoplay-pill-btn {
  background: #f3ece0;
  border-color: #e2d7c5;
  color: #49423b;
}

.is-paper .autoplay-pill-btn:hover {
  background: #ede3d2;
  border-color: #b45309;
  color: #b45309;
}

.is-paper .autoplay-pill-btn.is-active {
  background: #b45309;
  border-color: #b45309;
  color: #ffffff;
}

.is-paper .stepper-btn {
  background: #f3ece0;
  border-color: #e2d7c5;
  color: #574e44;
}

.is-paper .stepper-btn.active {
  background: #b45309;
  border-color: #b45309;
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(180, 83, 9, 0.25);
}

.is-paper .narrative-content-card {
  background: #fbf7ee;
  border-color: #e2d7c5;
}

.is-paper .narrative-metrics-grid {
  border-top-color: #ede2d2;
}

/* Masthead Header */
.card-masthead {
  padding: 16px 20px 14px;
  border-bottom: 1px solid var(--panel-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.is-light .card-masthead {
  border-bottom-color: #f1f5f9;
}

.masthead-title-col {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.mono-badge {
  font-family: var(--font-mono);
  font-size: 0.68rem;
  letter-spacing: 0.06em;
  color: var(--neon);
  font-weight: 700;
}

.explorable-heading {
  font-size: 1.05rem;
  font-weight: 800;
  margin: 0;
  color: var(--text-main);
  letter-spacing: -0.01em;
}

.masthead-controls-wrap {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* Auto-Play Pill Button */
.autoplay-pill-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 6px 14px;
  border-radius: 999px;
  border: 1px solid var(--panel-border);
  background: var(--item-bg);
  color: var(--text-main);
  font-family: var(--font-sans);
  font-size: 0.76rem;
  font-weight: 750;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  user-select: none;
}

.autoplay-pill-btn:hover {
  background: var(--item-hover-bg);
  border-color: var(--neon);
  color: var(--neon);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.15);
}

.autoplay-status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--text-soft);
  transition: all 0.25s ease;
  flex-shrink: 0;
}

.autoplay-btn-icon {
  font-size: 0.7rem;
  line-height: 1;
  display: inline-block;
}

.autoplay-btn-label {
  font-size: 0.74rem;
  letter-spacing: -0.01em;
}

/* Active State */
.autoplay-pill-btn.is-active {
  background: #2563eb;
  border-color: #2563eb;
  color: #ffffff;
  box-shadow: 0 0 16px rgba(37, 99, 235, 0.45);
}

.autoplay-pill-btn.is-active .autoplay-status-dot {
  background: #4ade80;
  box-shadow: 0 0 8px #4ade80;
  animation: liveDotPulse 1.4s infinite ease-in-out;
}

/* Ended Replay State */
.autoplay-pill-btn.is-ended {
  border-color: #10b981;
  color: #10b981;
  background: rgba(16, 185, 129, 0.08);
}

.autoplay-pill-btn.is-ended .autoplay-status-dot {
  background: #10b981;
}

.is-light .autoplay-pill-btn {
  background: #f8fafc;
  border-color: #e2e8f0;
  color: #334155;
}

.is-light .autoplay-pill-btn:hover {
  background: #eff6ff;
  border-color: #93c5fd;
  color: #1d4ed8;
}

.is-light .autoplay-pill-btn.is-active {
  background: #2563eb;
  border-color: #2563eb;
  color: #ffffff;
}

.is-paper .autoplay-pill-btn {
  background: #fbf7ee;
  border-color: #dcd0be;
  color: #2b2621;
}

.is-paper .autoplay-pill-btn:hover {
  background: #ede0cf;
  border-color: #b45309;
  color: #b45309;
  box-shadow: 0 2px 8px rgba(180, 83, 9, 0.15);
}

.is-paper .autoplay-pill-btn.is-active {
  background: #b45309;
  border-color: #b45309;
  color: #ffffff;
  box-shadow: 0 2px 10px rgba(180, 83, 9, 0.3);
}

.is-paper .autoplay-pill-btn.is-active .autoplay-status-dot {
  background: #fef08a;
  box-shadow: 0 0 6px #fef08a;
}

.is-paper .autoplay-pill-btn.is-ended {
  border-color: #166534;
  color: #166534;
  background: #f0fdf4;
}

.is-paper .autoplay-pill-btn.is-ended .autoplay-status-dot {
  background: #166534;
}

@keyframes liveDotPulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.6); opacity: 0.5; }
}

.live-pulse-txt {
  color: #ef4444;
  font-weight: 800;
  font-size: 0.68rem;
  margin-left: 2px;
  animation: blinkLive 1.5s infinite ease-in-out;
}

@keyframes blinkLive {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.progress-indicator {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 5px;
}

.stage-label {
  font-family: var(--font-sans);
  font-size: 0.74rem;
  font-weight: 600;
  color: var(--text-soft);
  letter-spacing: normal;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  direction: rtl;
}

.stage-num-highlight {
  color: var(--neon);
  font-weight: 800;
}

.interactive-scrubber {
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 8px;
  transition: all 0.2s ease;
  user-select: none;
}

.interactive-scrubber:hover {
  background: var(--item-hover-bg);
}

.interactive-scrubber:hover .progress-bar-rail {
  transform: scaleY(1.3);
}

.progress-bar-rail {
  width: 90px;
  height: 4px;
  background: var(--panel-border);
  border-radius: 999px;
  overflow: hidden;
  transition: transform 0.2s ease;
}

.progress-bar-fill {
  height: 100%;
  background: var(--neon);
  border-radius: 999px;
  transition: width 0.08s linear;
}

/* ══════════════════════════════════════════════════════════════════
   VISUAL SVG CANVAS
   ══════════════════════════════════════════════════════════════════ */
.visual-canvas-box {
  width: 100%;
  background: rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px 12px;
  overflow: hidden;
  position: relative;
}

.is-light .visual-canvas-box {
  background: #f8fafc;
}

.is-paper .visual-canvas-box {
  background: #f2eadb;
}

.is-paper .iso-axis-line {
  stroke: #dfd3c0;
  opacity: 0.6;
}

.is-paper .iso-axis-line-faint {
  stroke: #e6dcce;
  opacity: 0.45;
}

.is-paper .wire-active {
  stroke: url(#pipeGlowPaper);
  filter: drop-shadow(0 0 4px rgba(180, 83, 9, 0.25));
}

.iso-svg {
  width: 100%;
  max-width: 800px;
  height: auto;
  min-height: 200px;
  overflow: visible;
}

/* Axis Lines */
.iso-axis-line {
  stroke: var(--panel-border);
  stroke-width: 1px;
  stroke-dasharray: 4 4;
  opacity: 0.45;
}

.iso-axis-line-faint {
  stroke: var(--panel-border);
  stroke-width: 1px;
  stroke-dasharray: 2 6;
  opacity: 0.2;
}

/* Bus wire connecting nodes */
.connecting-bus-wire {
  stroke: var(--panel-border);
  stroke-width: 2px;
  transition: all 0.3s ease;
}

.wire-active {
  stroke: url(#pipeGlow);
  stroke-width: 2.5px;
  filter: drop-shadow(0 0 6px rgba(56, 189, 248, 0.35));
}

/* Node Platforms */
.node-base-poly {
  fill: var(--item-bg);
  stroke: var(--panel-border);
  stroke-width: 1.5px;
  transition: all 0.3s ease;
}

.is-light .node-base-poly {
  fill: #ffffff;
  stroke: #cbd5e1;
}

.is-dark .node-base-poly {
  fill: rgba(30, 41, 59, 0.9);
  stroke: rgba(148, 163, 184, 0.3);
}

.is-paper .node-base-poly {
  fill: #faf6ee;
  stroke: #dcd0be;
}

.node-wall-left {
  fill: rgba(0, 0, 0, 0.3);
  stroke: var(--panel-border);
  stroke-width: 1px;
}

.is-light .node-wall-left {
  fill: #e2e8f0;
  stroke: #cbd5e1;
}

.is-paper .node-wall-left {
  fill: #e8ded0;
  stroke: #dcd0be;
}

.node-wall-right {
  fill: rgba(0, 0, 0, 0.15);
  stroke: var(--panel-border);
  stroke-width: 1px;
}

.is-light .node-wall-right {
  fill: #f1f5f9;
  stroke: #cbd5e1;
}

.is-paper .node-wall-right {
  fill: #f2eadb;
  stroke: #dcd0be;
}

.queue-divider-line {
  stroke: var(--panel-border);
  stroke-width: 1px;
  stroke-dasharray: 2 2;
}

.node-pulse-bulb {
  fill: #38bdf8;
  filter: drop-shadow(0 0 8px #38bdf8);
  animation: pulseBeacon 2s infinite ease-in-out;
}

.consumer-bulb.is-consuming {
  fill: #34d399;
  filter: drop-shadow(0 0 10px #34d399);
}

.is-paper .node-pulse-bulb {
  fill: #b45309;
  filter: drop-shadow(0 0 5px rgba(180, 83, 9, 0.5));
}

.is-paper .consumer-bulb.is-consuming {
  fill: #166534;
  filter: drop-shadow(0 0 6px rgba(22, 101, 52, 0.5));
}

@keyframes pulseBeacon {
  0%, 100% { opacity: 0.4; r: 4px; }
  50% { opacity: 1; r: 6px; }
}

.node-txt-title {
  fill: var(--text-main);
  font-size: 13px;
  font-weight: 750;
  text-anchor: middle;
  font-family: var(--font-sans);
}

.node-txt-sub {
  fill: var(--text-soft);
  font-size: 10.5px;
  text-anchor: middle;
}

/* ═══════════════════════════════════════════════
   ISOMETRIC CUBES (PACKETS)
   ═══════════════════════════════════════════════ */
.iso-cube-group {
  transition: transform 0.08s linear, opacity 0.3s ease;
  will-change: transform;
}

.cube-lbl {
  font-size: 8px;
  font-weight: 700;
  text-anchor: middle;
  fill: #ffffff;
  pointer-events: none;
}

/* Cube P1 (Cyan) */
.p1-top { fill: #38bdf8; stroke: #7dd3fc; stroke-width: 1px; }
.p1-left { fill: #0284c7; stroke: #0369a1; stroke-width: 1px; }
.p1-right { fill: #0ea5e9; stroke: #0284c7; stroke-width: 1px; }

/* Cube P2 (Indigo) */
.p2-top { fill: #818cf8; stroke: #a5b4fc; stroke-width: 1px; }
.p2-left { fill: #4f46e5; stroke: #4338ca; stroke-width: 1px; }
.p2-right { fill: #6366f1; stroke: #4f46e5; stroke-width: 1px; }

/* Cube P3 (Emerald) */
.p3-top { fill: #34d399; stroke: #6ee7b7; stroke-width: 1px; }
.p3-left { fill: #059669; stroke: #047857; stroke-width: 1px; }
.p3-right { fill: #10b981; stroke: #059669; stroke-width: 1px; }

/* ── Editorial Book-Reader Warm Cubes (Terracotta, Walnut, Forest Sage) ── */
.is-paper .p1-top { fill: #d97706; stroke: #b45309; }
.is-paper .p1-left { fill: #92400e; stroke: #78350f; }
.is-paper .p1-right { fill: #b45309; stroke: #92400e; }

.is-paper .p2-top { fill: #a16207; stroke: #854d0e; }
.is-paper .p2-left { fill: #713f12; stroke: #58310c; }
.is-paper .p2-right { fill: #854d0e; stroke: #713f12; }

.is-paper .p3-top { fill: #15803d; stroke: #166534; }
.is-paper .p3-left { fill: #14532d; stroke: #052e16; }
.is-paper .p3-right { fill: #166534; stroke: #14532d; }

.consumed-fade {
  opacity: 0.15;
  filter: blur(2px);
}

/* Ack Signal */
.ack-signal-group {
  transition: transform 0.1s linear;
}

.ack-pulse-circle {
  fill: #34d399;
  filter: drop-shadow(0 0 6px #34d399);
}

.ack-txt {
  font-size: 9px;
  font-weight: 700;
  fill: #34d399;
  text-anchor: middle;
}

.is-paper .ack-pulse-circle {
  fill: #166534;
  filter: drop-shadow(0 0 4px rgba(22, 101, 52, 0.4));
}

.is-paper .ack-txt {
  fill: #166534;
}

/* ═══════════════════════════════════════════════
   NARRATIVE FOOTER
   ═══════════════════════════════════════════════ */
.narrative-footer {
  padding: 16px 20px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.stage-stepper-pills {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.stepper-arrow-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid var(--panel-border);
  background: var(--item-bg);
  color: var(--text-soft);
  font-size: 1.15rem;
  line-height: 1;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

.stepper-arrow-btn:hover:not(:disabled) {
  background: var(--item-hover-bg);
  color: var(--neon);
  border-color: var(--neon);
}

.stepper-arrow-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.stepper-arrow-btn svg {
  display: block;
  pointer-events: none;
}

.is-paper .stepper-arrow-btn {
  background: #f3ece0;
  border-color: #e2d7c5;
  color: #574e44;
}

.is-paper .stepper-arrow-btn:hover:not(:disabled) {
  background: #ede3d2;
  border-color: #b45309;
  color: #b45309;
}

.stepper-btn {
  background: var(--item-bg);
  border: 1px solid var(--panel-border);
  border-radius: 8px;
  padding: 5px 12px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.78rem;
  color: var(--text-soft);
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.is-light .stepper-btn {
  background: #f8fafc;
  border-color: #e2e8f0;
}

.stepper-btn:hover {
  color: var(--text-main);
  border-color: var(--text-soft);
}

.stepper-btn.active {
  background: var(--neon);
  border-color: var(--neon);
  color: #ffffff;
  font-weight: 700;
  box-shadow: 0 2px 10px rgba(56, 189, 248, 0.35);
}

.is-light .stepper-btn.active {
  background: #2563eb;
  border-color: #2563eb;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
}

.is-paper .stepper-btn {
  background: #fbf7ee;
  border-color: #dcd0be;
  color: #49423b;
}

.is-paper .stepper-btn:hover {
  background: #ede0cf;
  color: #2b2621;
  border-color: #c9bcab;
}

.is-paper .stepper-btn.active {
  background: #b45309;
  border-color: #b45309;
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(180, 83, 9, 0.25);
}

.step-idx {
  font-size: 0.72rem;
  opacity: 0.85;
}

.narrative-content-card {
  padding: 14px 16px;
  border-radius: 12px;
  background: var(--item-bg);
  border: 1px solid var(--panel-border);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.is-light .narrative-content-card {
  background: #f8fafc;
  border-color: #e2e8f0;
}

.is-dark .narrative-content-card {
  background: rgba(15, 23, 42, 0.55);
  border-color: rgba(148, 163, 184, 0.12);
}

.is-paper .narrative-content-card {
  background: #fbf7ee;
  border-color: #e2d7c5;
  box-shadow: 0 2px 10px rgba(43, 38, 33, 0.04);
}

.narrative-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.narrative-title {
  font-size: 0.95rem;
  font-weight: 750;
  color: var(--text-main);
  margin: 0;
}

.mono-status-chip {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  padding: 2px 8px;
  border-radius: 4px;
  background: rgba(56, 189, 248, 0.1);
  border: 1px solid rgba(56, 189, 248, 0.25);
  color: var(--neon);
}

.is-paper .mono-status-chip {
  background: #f5ebe0;
  border-color: #d6c6af;
  color: #92400e;
}

.narrative-desc {
  font-size: 0.86rem;
  line-height: 1.75;
  color: var(--text-secondary);
  margin: 0;
}

.narrative-metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 10px;
  margin-top: 6px;
  padding-top: 10px;
  border-top: 1px solid var(--panel-border);
}

.is-light .narrative-metrics-grid {
  border-top-color: #e2e8f0;
}

.micro-metric-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.micro-m-lbl {
  font-size: 0.7rem;
  color: var(--text-soft);
}

.micro-m-val {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--text-main);
}

.desktop-only-text {
  display: inline;
}

.mobile-only-text {
  display: none;
}

@media (max-width: 680px) {
  .desktop-only-text {
    display: none;
  }
  .mobile-only-text {
    display: inline;
  }

  .scrolly-container {
    height: auto;
    margin: 16px 0 24px;
  }

  .sticky-viewport {
    position: relative;
    top: 0;
    padding: 0;
  }

  .explorable-card {
    border-radius: 14px;
    max-height: none;
    overflow: hidden;
  }

  .card-masthead {
    padding: 10px 14px 8px;
    gap: 8px;
  }

  .masthead-controls-wrap {
    width: 100%;
    justify-content: space-between;
    gap: 8px;
    padding-top: 6px;
    border-top: 1px dashed var(--panel-border);
  }

  .autoplay-pill-btn {
    padding: 4px 10px;
    font-size: 0.68rem;
    gap: 5px;
  }

  .autoplay-btn-label {
    font-size: 0.68rem;
  }

  .masthead-title-col {
    gap: 2px;
  }

  .mono-badge {
    font-size: 0.6rem;
  }

  .explorable-heading {
    font-size: 0.86rem;
    line-height: 1.35;
  }

  .stage-label {
    font-size: 0.68rem;
  }

  .progress-bar-rail {
    width: 65px;
    height: 2.5px;
  }

  .visual-canvas-box {
    padding: 6px 4px;
  }

  .iso-svg {
    min-height: 135px;
    max-height: 165px;
  }

  /* SVG typography enlarged for crisp mobile readability */
  .node-txt-title {
    font-size: 16.5px;
    font-weight: 850;
  }

  .node-txt-sub {
    font-size: 13.5px;
    font-weight: 700;
  }

  .cube-lbl {
    font-size: 12px;
    font-weight: 800;
  }

  .ack-txt {
    font-size: 13px;
    font-weight: 800;
  }

  .narrative-footer {
    padding: 10px 12px 12px;
    gap: 8px;
  }

  .stage-stepper-pills {
    display: flex;
    gap: 5px;
    width: 100%;
  }

  .stepper-btn {
    flex: 1;
    justify-content: center;
    padding: 5px 4px;
    font-size: 0.72rem;
    gap: 4px;
    border-radius: 6px;
  }

  .step-idx {
    font-size: 0.72rem;
  }

  .step-badge-text {
    font-size: 0.68rem;
  }

  .narrative-content-card {
    padding: 8px 10px 10px;
    gap: 6px;
  }

  .narrative-header-row {
    gap: 6px;
  }

  .narrative-title {
    font-size: 0.82rem;
    line-height: 1.35;
  }

  .mono-status-chip {
    font-size: 0.62rem;
    padding: 2px 6px;
  }

  .narrative-desc {
    font-size: 0.76rem;
    line-height: 1.55;
    margin: 2px 0 6px;
  }

  .narrative-metrics-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 4px;
    margin-top: 4px;
    padding-top: 6px;
  }

  .micro-m-lbl {
    font-size: 0.6rem;
  }

  .micro-m-val {
    font-size: 0.7rem;
  }
}
</style>

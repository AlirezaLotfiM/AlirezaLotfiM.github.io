<script setup>
import { ref, computed, watch, onUnmounted } from 'vue';
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
const DURATION_MS = 12000; // 12 seconds for full simulation

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
    badge: 'Serial I/O Stream',
    mobileBadge: 'ورودی سریال',
    title: 'پرده اول: استریم بایت‌های سریال و وقفه سخت‌افزاری (RS485 / COM)',
    desc: 'با لمس سنسور بیومتریک Suprema یا کلید استند نوبت، بایت‌های خام هگزادسیمال (STX، داده و چکسام CRC-16) بدون بافر ناپایدار از درگاه سریال ارسال می‌شوند. درایور نرم‌افزاری وظیفه بازسازی و مونتاژ تکه‌پکت‌های قطعه‌قطعه شده (Packet Reconstruction) را بر عهده دارد.',
    metrics: [
      { label: 'پروتکل سخت‌افزار', val: 'RS-485 / USB-COM' },
      { label: 'نرخ انتقال داده', val: '115200 Baud' },
      { label: 'صحت‌سنجی فریم', val: 'CRC-16 Checksum' }
    ]
  },
  {
    num: '۰۲',
    badge: 'Non-Blocking WPF',
    mobileBadge: 'پردازش غیرمسدود',
    title: 'پرده دوم: پردازش غیرمسدودکننده و تفکیک تردها در WPF (Background Worker)',
    desc: 'برای پیشگیری کامل از فریز شدن کلاینت کیوسک‌های لمسی بانک، عملیات سنگین تطبیق الگوی بیومتریک و لیسنر سریال در ترد پشت‌صحنه (Task / Background Worker) اجرا می‌شود و تنها نتیجه نهایی از طریق UI Dispatcher به صورت کاملاً روان (۶۰ FPS) به رابط کاربری تزریق می‌گردد.',
    metrics: [
      { label: 'پایداری کیوسک', val: '60 FPS بدون فریز' },
      { label: 'تفکیک تردها', val: 'Task & Dispatcher' },
      { label: 'مدیریت خطا', val: 'Port Auto-Recovery' }
    ]
  },
  {
    num: '۰۳',
    badge: 'SignalR & ESC/POS',
    mobileBadge: 'سینک و چاپ فیش',
    title: 'پرده سوم: همگام‌سازی بلادرنگ (SignalR) و دستور چاپ مستقیم حرارتی',
    desc: 'رویداد نوبت از طریق هاب SignalR به سرور مرکزی ارسال و در دیتابیس SQL Server ثبت می‌شود. هم‌زمان، دستور بایتی ESC/POS در کمتر از ۱۸۰ میلی‌ثانیه به چاپگر حرارتی ارسال شده، فیش صادر می‌شود و کلاینت‌های باجه و نمایشگر سالن به‌طور آنی مطلع می‌گردند.',
    metrics: [
      { label: 'پروتکل شبکه', val: 'SignalR WebSocket' },
      { label: 'زمان کل تراکنش', val: '< 180 ms' },
      { label: 'دستورات پرینتر', val: 'ESC/POS Direct Cut' }
    ]
  }
];

const persianNumbers = ['۱', '۲', '۳'];

// Stage progress normalized [0, 1] within active stage
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
  const ease = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
  return startX + (endX - startX) * ease;
};

// ── Packet 1: Raw Serial Hex Frame (Hardware -> WPF) ──
const packet1Transform = computed(() => {
  if (activeStage.value === 0) {
    const t = stageProgressNormalized.value;
    const x = interpolate(t, 0.05, 0.85, 680, 440);
    return `translate(${x}px, 155px)`;
  }
  return 'translate(440px, 155px)';
});

const packet1Opacity = computed(() => {
  if (activeStage.value === 0) {
    const t = stageProgressNormalized.value;
    return Math.min(1, 0.4 + (t / 0.15) * 0.6);
  }
  if (activeStage.value === 1) {
    const t = stageProgressNormalized.value;
    return Math.max(0, 1 - t * 1.5);
  }
  return 0;
});

// ── Packet 2: Dispatch Token (WPF Worker -> SignalR -> Server) ──
const packet2Transform = computed(() => {
  if (activeStage.value <= 1) {
    if (activeStage.value === 1) {
      const t = stageProgressNormalized.value;
      const x = interpolate(t, 0.2, 0.9, 440, 180);
      return `translate(${x}px, 155px)`;
    }
    return 'translate(440px, 155px)';
  }
  return 'translate(180px, 155px)';
});

const packet2Opacity = computed(() => {
  if (activeStage.value === 0) return 0;
  if (activeStage.value === 1) {
    const t = stageProgressNormalized.value;
    if (t < 0.2) return 0;
    return Math.min(1, (t - 0.2) / 0.15);
  }
  if (activeStage.value === 2) {
    const t = stageProgressNormalized.value;
    return Math.max(0, 1 - t * 1.2);
  }
  return 0;
});

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
  const clickOffsetFromRight = rect.right - e.clientX;
  const fraction = Math.max(0, Math.min(1, clickOffsetFromRight / rect.width));
  animateProgressTo(fraction, 220);
};

onUnmounted(() => {
  cancelAnimationFrame(autoPlayRaf);
  cancelAnimationFrame(stageTransitionRaf);
});
</script>

<template>
  <div class="scrolly-container" dir="rtl">
    <div class="sticky-viewport">
      <div class="explorable-card" :class="{ 'is-dark': isDark, 'is-light': isLight, 'is-paper': isPaper }">
        
        <!-- Header Ribbon -->
        <div class="card-masthead">
          <div class="masthead-title-col">
            <span class="mono-badge">HARDWARE-SOFTWARE PIPELINE • ۰۲</span>
            <h3 class="explorable-heading">آناتومی پل سخت‌افزار و نرم‌افزار: از سنسور تا سرور بلادرنگ</h3>
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
             THE ISOMETRIC HARDWARE-SOFTWARE CANVAS (SVG)
             ═══════════════════════════════════════════════ -->
        <div class="visual-canvas-box">
          <svg class="iso-svg" viewBox="0 0 840 280" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="hwGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#10b981" stop-opacity="0.9" />
                <stop offset="50%" stop-color="#06b6d4" stop-opacity="0.9" />
                <stop offset="100%" stop-color="#3b82f6" stop-opacity="0.9" />
              </linearGradient>

              <linearGradient id="hwGlowPaper" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#059669" stop-opacity="0.9" />
                <stop offset="50%" stop-color="#0284c7" stop-opacity="0.9" />
                <stop offset="100%" stop-color="#b45309" stop-opacity="0.9" />
              </linearGradient>
            </defs>

            <!-- Guide grid subtle lines -->
            <path d="M 60,180 L 780,180" class="iso-axis-line" />
            <path d="M 60,140 L 780,140" class="iso-axis-line-faint" />
            <path d="M 60,220 L 780,220" class="iso-axis-line-faint" />

            <!-- Dynamic Connecting Wire / Serial Bus -->
            <path
              d="M 680,180 L 440,180 M 440,180 L 180,180"
              class="connecting-bus-wire"
              :class="{ 'wire-active': activeStage >= 0 }"
            />

            <!-- ── NODE 01: INDUSTRIAL HARDWARE (Right side for RTL) ── -->
            <g class="iso-node-group" transform="translate(680, 180)">
              <!-- Base Platform -->
              <polygon points="0,-22 48,-2 0,18 -48,-2" class="node-base-poly" />
              <polygon points="-48,-2 0,18 0,36 -48,16" class="node-wall-left" />
              <polygon points="0,18 48,-2 48,16 0,36" class="node-wall-right" />
              
              <!-- Biometric / Hardware Optical Sensor Ring -->
              <circle cx="0" cy="-2" r="7" class="hw-scanner-lens" :class="{ 'lens-active': activeStage === 0 }" />
              <circle cx="0" cy="-2" r="3" class="hw-scanner-core" />

              <!-- Node Label -->
              <text x="0" y="58" class="node-txt-title">سخت‌افزار / سنسور</text>
              <text x="0" y="74" class="node-txt-sub mono-font">Suprema & Kiosk RS485</text>
            </g>

            <!-- ── NODE 02: C# WPF CLIENT & DISPATCHER (Center) ── -->
            <g class="iso-node-group" transform="translate(440, 180)">
              <!-- Elongated Platform -->
              <polygon points="0,-26 80,-2 0,22 -80,-2" class="node-base-poly wpw-base" />
              <polygon points="-80,-2 0,22 0,40 -80,16" class="node-wall-left" />
              <polygon points="0,22 80,-2 80,16 0,40" class="node-wall-right" />

              <!-- Worker Thread Pulse Indicator -->
              <circle cx="-25" cy="-2" r="4" class="worker-thread-dot" :class="{ active: activeStage === 1 }" />
              <circle cx="25" cy="-2" r="4" class="dispatcher-ui-dot" :class="{ active: activeStage >= 1 }" />
              <path d="M -15,-2 L 15,-2" class="dispatcher-bridge-line" />

              <!-- Node Label -->
              <text x="0" y="62" class="node-txt-title">کلاینت دسکتاپ WPF</text>
              <text x="0" y="78" class="node-txt-sub mono-font">Background Task & Dispatcher</text>
            </g>

            <!-- ── NODE 03: CENTRAL SERVER & PRINTER (Left side) ── -->
            <g class="iso-node-group" transform="translate(180, 180)">
              <!-- Base Platform -->
              <polygon points="0,-22 48,-2 0,18 -48,-2" class="node-base-poly" />
              <polygon points="-48,-2 0,18 0,36 -48,16" class="node-wall-left" />
              <polygon points="0,18 48,-2 48,16 0,36" class="node-wall-right" />

              <!-- Thermal Receipt Cut Indicator -->
              <rect x="-10" y="-8" width="20" height="12" rx="2" class="thermal-receipt-icon" :class="{ 'is-printing': activeStage === 2 }" />

              <!-- Node Label -->
              <text x="0" y="58" class="node-txt-title">سرور مرکزی و چاپگر</text>
              <text x="0" y="74" class="node-txt-sub mono-font">SignalR Hub & ESC/POS</text>
            </g>

            <!-- ═══════════════════════════════════════════════
                 ISOMETRIC DATA PACKETS IN MOTION
                 ═══════════════════════════════════════════════ -->

            <!-- PACKET 1: Raw Serial Byte Stream (Hardware -> WPF) -->
            <g
              v-if="activeStage === 0 || (activeStage === 1 && stageProgressNormalized < 0.5)"
              class="iso-cube-group packet-serial"
              :style="{
                transform: packet1Transform,
                opacity: packet1Opacity
              }"
            >
              <polygon points="0,-14 18,-4 0,6 -18,-4" class="cube-face-top p-serial-top" />
              <polygon points="-18,-4 0,6 0,22 -18,12" class="cube-face-left p-serial-left" />
              <polygon points="0,6 18,-4 18,12 0,22" class="cube-face-right p-serial-right" />
              <text x="0" y="-3" class="cube-lbl mono-font">0x02</text>
            </g>

            <!-- PACKET 2: Dispatch Token (WPF Worker -> Server Hub) -->
            <g
              v-if="activeStage >= 1"
              class="iso-cube-group packet-dispatch"
              :style="{
                transform: packet2Transform,
                opacity: packet2Opacity
              }"
            >
              <polygon points="0,-14 18,-4 0,6 -18,-4" class="cube-face-top p-dispatch-top" />
              <polygon points="-18,-4 0,6 0,22 -18,12" class="cube-face-left p-dispatch-left" />
              <polygon points="0,6 18,-4 18,12 0,22" class="cube-face-right p-dispatch-right" />
              <text x="0" y="-3" class="cube-lbl mono-font">SYNC</text>
            </g>

            <!-- Thermal Ticket Receipt Ejection (Stage 3) -->
            <g
              v-if="activeStage === 2 && stageProgressNormalized > 0.35"
              class="ticket-eject-group"
              :style="{ transform: `translate(180px, ${145 - stageProgressNormalized * 30}px)` }"
            >
              <rect x="-14" y="-12" width="28" height="24" rx="2" class="ticket-paper" />
              <line x1="-8" y1="-5" x2="8" y2="-5" class="ticket-line" />
              <line x1="-8" y1="0" x2="4" y2="0" class="ticket-line" />
              <text x="0" y="8" class="ticket-num mono-font">#۸۴۲</text>
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
/* Scrollytelling in-flow stage container */
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

/* Card Masthead */
.card-masthead {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px 14px;
  border-bottom: 1px solid var(--panel-border);
  gap: 16px;
  flex-wrap: wrap;
}

.masthead-title-col {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.mono-badge {
  font-family: var(--font-mono);
  font-size: 0.68rem;
  letter-spacing: 0.8px;
  color: var(--neon);
  text-transform: uppercase;
  font-weight: 700;
}

.explorable-heading {
  font-size: 0.95rem;
  font-weight: 800;
  margin: 0;
  color: var(--text-main);
  letter-spacing: -0.2px;
}

.masthead-controls-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Autoplay Pill Button */
.autoplay-pill-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--item-bg);
  border: 1px solid var(--panel-border);
  border-radius: 999px;
  padding: 6px 14px;
  font-size: 0.74rem;
  font-weight: 700;
  color: var(--text-main);
  cursor: pointer;
  transition: all 0.25s ease;
  user-select: none;
}

.autoplay-pill-btn:hover {
  background: var(--item-hover-bg);
  border-color: var(--neon);
  color: var(--neon);
}

.autoplay-pill-btn.is-active {
  background: var(--neon);
  border-color: var(--neon);
  color: #ffffff;
}

.autoplay-status-dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: currentColor;
}

.autoplay-pill-btn.is-active .autoplay-status-dot {
  animation: pulse-dot 1s infinite alternate ease-in-out;
}

@keyframes pulse-dot {
  0% { transform: scale(0.8); opacity: 0.5; }
  100% { transform: scale(1.3); opacity: 1; }
}

.autoplay-btn-icon {
  font-size: 0.8rem;
  line-height: 1;
}

.progress-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  user-select: none;
}

.interactive-scrubber {
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.interactive-scrubber:hover {
  background: var(--item-hover-bg);
}

.interactive-scrubber:hover .progress-bar-rail {
  transform: scaleY(1.3);
}

.stage-label {
  font-size: 0.72rem;
  color: var(--text-soft);
  display: flex;
  align-items: center;
  gap: 4px;
}

.stage-num-highlight {
  color: var(--neon);
  font-weight: 800;
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

/* Visual Canvas */
.visual-canvas-box {
  width: 100%;
  background: rgba(0, 0, 0, 0.12);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 12px 16px;
  overflow: hidden;
}

.is-light .visual-canvas-box {
  background: #f8fafc;
}

.is-dark .visual-canvas-box {
  background: rgba(2, 6, 23, 0.65);
}

.iso-svg {
  width: 100%;
  max-width: 840px;
  height: auto;
  min-height: 190px;
  max-height: 250px;
  overflow: visible;
}

.iso-axis-line {
  stroke: var(--panel-border);
  stroke-width: 1;
  stroke-dasharray: 4 4;
  opacity: 0.55;
}

.iso-axis-line-faint {
  stroke: var(--panel-border);
  stroke-width: 0.5;
  stroke-dasharray: 2 6;
  opacity: 0.3;
}

.connecting-bus-wire {
  stroke: var(--panel-border);
  stroke-width: 2.5;
  stroke-linecap: round;
  transition: stroke 0.4s ease;
}

.connecting-bus-wire.wire-active {
  stroke: url(#hwGlow);
}

.is-paper .connecting-bus-wire.wire-active {
  stroke: url(#hwGlowPaper);
}

/* Nodes */
.node-base-poly {
  fill: var(--panel-bg);
  stroke: var(--panel-border);
  stroke-width: 1.5;
  transition: fill 0.3s ease;
}

.is-dark .node-base-poly {
  fill: #0f172a;
  stroke: #334155;
}

.node-wall-left {
  fill: rgba(0, 0, 0, 0.08);
  stroke: var(--panel-border);
  stroke-width: 1;
}

.is-dark .node-wall-left {
  fill: #090d16;
  stroke: #1e293b;
}

.node-wall-right {
  fill: rgba(0, 0, 0, 0.04);
  stroke: var(--panel-border);
  stroke-width: 1;
}

.is-dark .node-wall-right {
  fill: #0b1120;
  stroke: #1e293b;
}

.node-txt-title {
  font-size: 13.5px;
  font-weight: 800;
  fill: var(--text-main);
  text-anchor: middle;
}

.node-txt-sub {
  font-size: 10px;
  fill: var(--text-soft);
  text-anchor: middle;
}

/* Hardware Scanner Lens */
.hw-scanner-lens {
  fill: #10b981;
  opacity: 0.4;
  transition: all 0.3s ease;
}

.hw-scanner-lens.lens-active {
  opacity: 0.9;
  filter: drop-shadow(0 0 6px #10b981);
}

.hw-scanner-core {
  fill: #059669;
}

/* Worker & Dispatcher Dots */
.worker-thread-dot {
  fill: var(--text-soft);
  opacity: 0.4;
  transition: all 0.3s ease;
}

.worker-thread-dot.active {
  fill: #06b6d4;
  opacity: 1;
  filter: drop-shadow(0 0 6px #06b6d4);
}

.dispatcher-ui-dot {
  fill: var(--text-soft);
  opacity: 0.4;
  transition: all 0.3s ease;
}

.dispatcher-ui-dot.active {
  fill: #3b82f6;
  opacity: 1;
  filter: drop-shadow(0 0 6px #3b82f6);
}

.dispatcher-bridge-line {
  stroke: var(--panel-border);
  stroke-width: 1.5;
  stroke-dasharray: 2 2;
}

.thermal-receipt-icon {
  fill: var(--text-soft);
  opacity: 0.4;
  transition: all 0.3s ease;
}

.thermal-receipt-icon.is-printing {
  fill: #f59e0b;
  opacity: 1;
  filter: drop-shadow(0 0 6px #f59e0b);
}

/* Cubes (Packets) */
.iso-cube-group {
  transition: transform 0.08s linear;
}

.p-serial-top { fill: #10b981; }
.p-serial-left { fill: #059669; }
.p-serial-right { fill: #047857; }

.p-dispatch-top { fill: #06b6d4; }
.p-dispatch-left { fill: #0891b2; }
.p-dispatch-right { fill: #0e7490; }

.cube-lbl {
  font-size: 8px;
  font-weight: 800;
  fill: #ffffff;
  text-anchor: middle;
}

/* Ticket Ejection */
.ticket-paper {
  fill: #ffffff;
  stroke: #cbd5e1;
  stroke-width: 1;
  filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.15));
}

.ticket-line {
  stroke: #94a3b8;
  stroke-width: 1;
}

.ticket-num {
  font-size: 8px;
  font-weight: 900;
  fill: #1e293b;
  text-anchor: middle;
}

/* Narrative Footer */
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

.stepper-btn {
  background: var(--item-bg);
  border: 1px solid var(--panel-border);
  color: var(--text-soft);
  font-size: 0.76rem;
  font-weight: 700;
  padding: 6px 14px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

.stepper-btn:hover {
  background: var(--item-hover-bg);
  color: var(--text-main);
  border-color: var(--neon);
}

.stepper-btn.active {
  background: var(--neon);
  border-color: var(--neon);
  color: #ffffff;
  box-shadow: 0 2px 10px rgba(37, 99, 235, 0.3);
}

.is-paper .stepper-btn.active {
  background: #b45309;
  border-color: #b45309;
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

.narrative-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.narrative-title {
  margin: 0;
  font-size: 0.88rem;
  font-weight: 800;
  color: var(--text-main);
}

.mono-status-chip {
  font-family: var(--font-mono);
  font-size: 0.65rem;
  padding: 2px 8px;
  border-radius: 4px;
  background: var(--panel-border);
  color: var(--text-soft);
  font-weight: 700;
}

.narrative-desc {
  margin: 0;
  font-size: 0.8rem;
  line-height: 1.7;
  color: var(--text-soft);
}

.narrative-metrics-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  padding-top: 6px;
  border-top: 1px dashed var(--panel-border);
}

.micro-metric-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.micro-m-lbl {
  font-size: 0.65rem;
  color: var(--text-soft);
}

.micro-m-val {
  font-size: 0.74rem;
  font-weight: 700;
  color: var(--text-main);
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
  }

  .progress-bar-rail {
    width: 65px;
    height: 3px;
  }

  .narrative-metrics-grid {
    grid-template-columns: 1fr;
    gap: 6px;
  }
}
</style>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { usePortfolio } from '../composables/usePortfolio';
import { useNavigation } from '../composables/useNavigation';

const { downloadVCard } = usePortfolio();
const { tabPaths, navigateFromEvent } = useNavigation();
const showQrModal = ref(false);

const props = defineProps({
  profile: {
    type: Object,
    default: () => ({}),
  },
  resumeUrl: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['enter']);

const handleKeydown = (e) => {
  if (e.key === 'Escape' && showQrModal.value) {
    e.preventDefault();
    showQrModal.value = false;
    return;
  }
  if (e.key === 'Enter' && !showQrModal.value) {
    const tag = document.activeElement?.tagName?.toLowerCase();
    if (tag !== 'input' && tag !== 'textarea') {
      emit('enter');
    }
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
  if (copyTimeout) clearTimeout(copyTimeout);
});

const cardData = computed(() => props.profile.identityCard || {});

const heroTitle = computed(() => cardData.value.name || props.profile.name || 'علیرضا لطفی‌مقدم');
const heroRole = computed(() => cardData.value.role || props.profile.titles?.[0] || props.profile.role || 'Software Engineer');
const heroBio = computed(() =>
  cardData.value.bio || props.profile.bio || 'توسعه‌دهنده نرم‌افزار با +۵ سال سابقه فعالیت در شرکت نداپرداز (از سال ۱۴۰۰) و اکوسیستم .NET؛ آماده همکاری پروژه‌ای و تمام‌وقت.',
);
const heroFocus = computed(() => cardData.value.focus || props.profile.learning?.focus || 'ASP.NET Core');
const contactEmail = computed(() => cardData.value.email || props.profile.cardEmail || 'hi@alirz.ir');
const eyebrow = computed(() => cardData.value.eyebrow || 'Available for Projects');
const badges = computed(() =>
  (cardData.value.badges || props.profile.badges || ['Backend', 'API Design', 'Database']).slice(0, 3),
);
const enterLabel = computed(() => cardData.value.enterLabel || 'ورود به داشبورد');
const resumeLabel = computed(() => cardData.value.resumeLabel || 'رزومه');
const githubUrl = computed(() => `https://github.com/${props.profile.githubUser || 'AlirezaLotfiM'}`);
const linkedinUrl = computed(() => props.profile.contact?.linkedin || 'https://linkedin.com/in/alireza-lotfi-moghaddam-378a8018a');

const emailCopied = ref(false);
let copyTimeout = null;

const copyEmailToClipboard = async () => {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(contactEmail.value);
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = contactEmail.value;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    emailCopied.value = true;
    if (copyTimeout) clearTimeout(copyTimeout);
    copyTimeout = setTimeout(() => {
      emailCopied.value = false;
    }, 2200);
  } catch (err) {
    console.error('Failed to copy email:', err);
  }
};
</script>

<template>
  <section class="identity-overlay">
    <div class="scene">
      <div class="card-shadow"></div>
      <div class="card-glow"></div>

      <article class="glass-card spotlight-card">
        <div class="frame-highlight"></div>

        <div class="liquid" aria-hidden="true">
          <div class="liquid-fill"></div>
          <div class="liquid-surface"></div>
          <div class="caustics"></div>
          <div class="bubbles">
            <span class="bubble bubble-1"></span>
            <span class="bubble bubble-2"></span>
            <span class="bubble bubble-3"></span>
            <span class="bubble bubble-4"></span>
          </div>
        </div>

        <div class="reflections"></div>

        <div class="content">
          <div class="card-top">
            <div class="identity-block">
              <div class="eyebrow status-badge mono-ui" dir="ltr">
                <span class="status-pulse-dot" aria-hidden="true"></span>
                <span>{{ eyebrow }}</span>
              </div>
              <h1 class="name">{{ heroTitle }}</h1>
              <p class="role mono-ui" dir="ltr">{{ heroRole }}</p>
              <p class="title">{{ heroBio }}</p>
              <div class="badge-row" dir="ltr">
                <span class="badge-chip focus-badge mono-ui" style="border-color: var(--neon); color: var(--neon); font-weight: 700;">Focus: {{ heroFocus }}</span>
                <span v-for="badge in badges" :key="badge" class="badge-chip mono-ui">{{ badge }}</span>
              </div>
            </div>

            <div class="avatar-panel">
              <div class="avatar-glow">
                <img
                  :src="profile.avatarUrl || '/Damoon-d.jpg'"
                  alt="پرتره علیرضا لطفی مقدم"
                  width="848"
                  height="804"
                  fetchpriority="high"
                  decoding="async"
                />
              </div>
            </div>
          </div>

          <div class="card-bottom">
            <!-- Primary Navigation Actions -->
            <div class="main-actions">
              <button class="primary-btn" type="button" @click="emit('enter')" title="ورود به داشبورد پورتفولیو">
                <span>{{ enterLabel }}</span>
                <kbd class="key-hint" aria-hidden="true">↵</kbd>
              </button>
              <a
                class="secondary-btn"
                :href="tabPaths.resume"
                @click="navigateFromEvent($event, tabPaths.resume)"
                title="مشاهده و دریافت رزومه رسمی"
              >
                <span>{{ resumeLabel }}</span>
              </a>
            </div>

            <!-- Unified Minimalist Connect Dock -->
            <div class="connect-dock" dir="ltr">
              <!-- Copy Email Button -->
              <button
                class="dock-btn"
                :class="{ 'copied': emailCopied }"
                type="button"
                @click="copyEmailToClipboard"
                :title="emailCopied ? 'ایمیل کپی شد!' : `کپی ایمیل (${contactEmail})`"
                aria-label="کپی آدرس ایمیل"
              >
                <svg v-if="!emailCopied" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
                <svg v-else viewBox="0 0 24 24" width="16" height="16" fill="currentColor" class="copied-check">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
                <span class="dock-tooltip">{{ emailCopied ? 'کپی شد! ✓' : contactEmail }}</span>
              </button>

              <!-- GitHub Link -->
              <a
                :href="githubUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="dock-btn github-btn"
                title="GitHub Profile"
                aria-label="پروفایل گیت‌هاب"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                </svg>
                <span class="dock-tooltip">GitHub</span>
              </a>

              <!-- LinkedIn Link -->
              <a
                :href="linkedinUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="dock-btn linkedin-btn"
                title="LinkedIn Profile"
                aria-label="پروفایل لینکدین"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                </svg>
                <span class="dock-tooltip">LinkedIn</span>
              </a>

              <!-- QR Code Trigger -->
              <button
                class="dock-btn qr-btn"
                type="button"
                @click="showQrModal = true"
                title="اسکن کد QR"
                aria-label="نمایش کد QR"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M3 3h8v8H3V3zm2 2v4h4V5H5zm8-2h8v8h-8V3zm2 2v4h4V5h-4zM3 13h8v8H3v-8zm2 2v4h4v-4H5zm13-2h3v2h-3v-2zm-3 2h2v3h-2v-3zm3 3h3v3h-3v-3zm-3 2h2v1h-2v-1zm4-4h2v2h-2v-2zm-2 2h2v2h-2v-2z"/>
                </svg>
                <span class="dock-tooltip">اسکن QR</span>
              </button>

              <!-- vCard Download Trigger -->
              <button
                class="dock-btn vcard-btn"
                type="button"
                @click="downloadVCard"
                title="دانلود کارت تماس (vCard)"
                aria-label="دانلود کارت تماس"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-7-2h5v-2h-5v2zm0-4h5v-2h-5v2zm-3.5-3c.83 0 1.5-.67 1.5-1.5S9.33 7 8.5 7 7 7.67 7 8.5 7.67 10 8.5 10zm0 1.5c-1.1 0-3.3.56-3.3 1.67V14h6.6v-.83c0-1.11-2.2-1.67-3.3-1.67z"/>
                </svg>
                <span class="dock-tooltip">ذخیره vCard</span>
              </button>
            </div>
          </div>
        </div>
      </article>
    </div>

    <!-- QR CODE MODAL OVERLAY -->
    <Transition name="fade">
      <div v-if="showQrModal" class="qr-modal-overlay" @click.self="showQrModal = false">
        <div class="qr-modal-card">
          <button class="close-qr-btn" type="button" @click.stop="showQrModal = false" aria-label="بستن پنجره">✕</button>
          <h3>📱 اسکن کد QR پورتفولیو</h3>
          <p>با دوربین گوشی اسکن کنید تا آدرس سایت مستقیماً باز شود:</p>
          <div class="qr-image-wrap">
            <img src="/qr-code.svg" alt="QR Code Alireza Lotfi Portfolio" width="200" height="200" />
          </div>
          <div class="qr-url-pill mono-ui" dir="ltr">alirezalotfimoghaddam.ir</div>
        </div>
      </div>
    </Transition>
  </section>
</template>

<style scoped>
.identity-overlay {
  position: absolute;
  inset: 0;
  z-index: 4;
  display: grid;
  place-items: center;
  padding: 28px;
  pointer-events: none;
  transition: transform 0.42s ease, opacity 0.42s ease, filter 0.42s ease;
}

.identity-overlay.exiting {
  transform: translateY(-18px) scale(0.985);
  opacity: 0;
  filter: blur(10px);
}

.scene {
  position: relative;
  width: min(100%, 680px);
  min-height: 480px;
  pointer-events: auto;
}

.card-shadow,
.card-glow {
  position: absolute;
  inset: 0;
  border-radius: 34px;
  pointer-events: none;
}

.card-shadow {
  inset: 8% 7% -4%;
  background: rgba(17, 31, 49, 0.16);
  filter: blur(28px);
  transform: translateY(12px) scale(0.92);
  opacity: 0.85;
}

.card-glow {
  inset: -3%;
  background:
    radial-gradient(circle at var(--shine-x) var(--shine-y), var(--neon) 12%, transparent 24%),
    radial-gradient(circle at 50% 110%, var(--neon) 8%, transparent 30%);
  filter: blur(28px);
  opacity: 0.35;
  animation: glowDrift 12s ease-in-out infinite;
}

.glass-card {
  position: relative;
  width: 100%;
  min-height: 480px;
  border-radius: 34px;
  overflow: hidden;
  background: var(--glass-panel);
  border: 1px solid var(--panel-border);
  box-shadow:
    0 32px 70px rgba(0, 0, 0, 0.22),
    inset 0 1px 0 rgba(255, 255, 255, 0.05),
    inset 18px 18px 40px rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(28px) saturate(170%);
  -webkit-backdrop-filter: blur(28px) saturate(170%);
  isolation: isolate;
}

.glass-card::before,
.glass-card::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.glass-card::before {
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.05), transparent 22%),
    radial-gradient(circle at var(--shine-x) var(--shine-y), rgba(255, 255, 255, 0.04), transparent 18%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.05), transparent 26%, transparent 72%, rgba(255, 255, 255, 0.02));
  mix-blend-mode: screen;
  opacity: 0.88;
}

.glass-card::after {
  inset: 1px;
  border-radius: 33px;
  border: 1px solid var(--panel-border);
}

.frame-highlight {
  position: absolute;
  inset: 12px;
  border-radius: 26px;
  border: 1px solid rgba(255, 255, 255, 0.14);
}

.content {
  position: absolute;
  inset: 0;
  z-index: 3;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 34px 38px;
}

.card-top {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 32px;
  align-items: center;
}

.identity-block {
  min-width: 0;
}

.avatar-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
}

.avatar-glow {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  padding: 4px;
  background: linear-gradient(135deg, var(--item-bg), var(--item-hover-bg));
  border: 1px solid var(--panel-border);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  transition: all 0.3s ease;
}

.avatar-glow img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.avatar-glow:hover {
  border-color: var(--neon);
  box-shadow: 0 0 18px var(--neon);
}

.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  width: fit-content;
  padding: 6px 14px;
  border-radius: 999px;
  margin-bottom: 14px;
  background: rgba(16, 185, 129, 0.08);
  border: 1px solid rgba(16, 185, 129, 0.28);
  color: #10b981;
  font-size: 0.68rem;
  letter-spacing: 0.08em;
  font-weight: 600;
  transition: all 0.25s ease;
}

.status-pulse-dot {
  position: relative;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 6px rgba(16, 185, 129, 0.8);
  flex-shrink: 0;
}

.status-pulse-dot::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: #10b981;
  animation: pulseComposited 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  will-change: transform, opacity;
}

@keyframes pulseComposited {
  0% {
    transform: scale(1);
    opacity: 0.8;
  }
  70%, 100% {
    transform: scale(2.6);
    opacity: 0;
  }
}

.name {
  margin: 0;
  font-size: clamp(1.85rem, 3.8vw, 2.45rem);
  line-height: 1.18;
  color: var(--text-main);
  text-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

.role {
  margin: 10px 0 0;
  color: var(--neon);
  font-size: 0.84rem;
}

.title {
  margin: 14px 0 0;
  max-width: 430px;
  font-size: 0.88rem;
  line-height: 1.86;
  color: var(--text-secondary);
}

.badge-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 18px;
}

.badge-chip {
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid var(--panel-border);
  background: var(--item-bg);
  color: var(--text-secondary);
  font-size: 0.71rem;
}

.focus-label {
  font-size: 0.66rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(49, 84, 118, 0.76);
}

.focus-value {
  font-size: 0.98rem;
  color: var(--text-main);
}

.card-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  border-top: 1px solid var(--panel-border);
  padding-top: 22px;
}

.main-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.primary-btn,
.secondary-btn {
  border-radius: 14px;
  padding: 10px 18px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  text-decoration: none;
  text-align: center;
  white-space: nowrap;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.primary-btn {
  background: var(--neon);
  color: #ffffff !important;
  border: 1px solid var(--neon);
  box-shadow: 0 4px 14px rgba(79, 70, 229, 0.25);
}

.primary-btn:hover {
  filter: brightness(1.12);
  box-shadow: 0 0 18px var(--neon);
  transform: translateY(-2px);
}

.key-hint {
  display: inline-block;
  margin-right: 6px;
  padding: 1px 6px;
  font-size: 0.68rem;
  font-family: var(--font-mono);
  background: rgba(255, 255, 255, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: 6px;
  vertical-align: middle;
  line-height: 1.2;
}

@media (max-width: 640px) {
  .key-hint {
    display: none;
  }
}

.secondary-btn {
  border: 1px solid var(--panel-border);
  background: var(--item-bg);
  color: var(--text-main);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.secondary-btn:hover {
  background: var(--item-hover-bg);
  border-color: var(--neon);
  color: var(--neon);
  transform: translateY(-2px);
}

.primary-btn:active,
.secondary-btn:active,
.dock-btn:active {
  transform: translateY(0) scale(0.97);
}

/* Unified Minimalist Connect Dock */
.connect-dock {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--item-bg);
  border: 1px solid var(--panel-border);
  padding: 5px 8px;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

.dock-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: transparent;
  border: 1px solid transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  text-decoration: none;
  padding: 0;
}

.dock-btn:hover {
  color: var(--text-main);
  background: var(--item-hover-bg);
  border-color: var(--panel-border);
  transform: translateY(-2px);
}

.dock-btn.github-btn:hover {
  color: var(--text-main);
  border-color: rgba(148, 163, 184, 0.5);
}

.dock-btn.linkedin-btn:hover {
  color: #0a66c2;
  border-color: rgba(10, 102, 194, 0.4);
  background: rgba(10, 102, 194, 0.08);
}

.dock-btn.copied {
  color: #10b981 !important;
  border-color: rgba(16, 185, 129, 0.4);
  background: rgba(16, 185, 129, 0.1);
}

.copied-check {
  animation: checkPop 0.25s ease-out;
}

@keyframes checkPop {
  0% { transform: scale(0.6); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

/* Tooltip on dock items */
.dock-tooltip {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%) translateY(4px);
  padding: 4px 8px;
  background: var(--text-main);
  color: var(--bg-main);
  font-family: var(--font-sans);
  font-size: 0.68rem;
  font-weight: 500;
  border-radius: 6px;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  transition: all 0.18s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  z-index: 10;
}

.dock-tooltip::after {
  content: "";
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 4px solid transparent;
  border-top-color: var(--text-main);
}

.dock-btn:hover .dock-tooltip {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

.liquid {
  position: absolute;
  inset: 0;
  z-index: 1;
  overflow: hidden;
}

.liquid-fill {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 24%;
  background:
    linear-gradient(180deg, rgba(230, 244, 255, 0.18) 0%, rgba(191, 225, 252, 0.14) 24%, rgba(111, 162, 214, 0.14) 72%, rgba(76, 116, 168, 0.16) 100%),
    linear-gradient(90deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0.04));
  border-top: 1px solid rgba(255, 255, 255, 0.22);
}

.liquid-surface {
  position: absolute;
  left: 0;
  right: 0;
  top: calc(76% - 2px);
  height: 18px;
  z-index: 2;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(255, 255, 255, 0.32) 35%, rgba(255, 255, 255, 0.02) 100%);
  opacity: 0.68;
}

.caustics {
  position: absolute;
  left: 2%;
  right: 2%;
  top: 77%;
  bottom: 0;
  background:
    radial-gradient(circle at 20% 16%, rgba(255, 255, 255, 0.16), transparent 16%),
    radial-gradient(circle at 75% 22%, rgba(255, 255, 255, 0.12), transparent 18%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.1), transparent 45%);
  mix-blend-mode: screen;
  opacity: 0.34;
}

.reflections {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  background:
    linear-gradient(115deg, transparent 24%, rgba(255, 255, 255, 0.18) 34%, transparent 46%),
    radial-gradient(circle at var(--shine-x) var(--shine-y), rgba(255, 255, 255, 0.14), transparent 18%);
  mix-blend-mode: screen;
  opacity: 0.74;
}

.bubbles {
  position: absolute;
  inset: 80% 0 0;
  z-index: 2;
  overflow: hidden;
}

.bubble {
  position: absolute;
  bottom: -24px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, rgba(255, 255, 255, 0.88), rgba(255, 255, 255, 0.14) 62%, transparent 70%);
  opacity: 0.55;
  animation: bubbleRise var(--duration) linear infinite;
  animation-delay: var(--delay);
  left: var(--left);
  transform: scale(var(--scale));
}

.bubble-1 { --left: 16%; --delay: 0s; --duration: 8s; --scale: 0.9; }
.bubble-2 { --left: 34%; --delay: 2.1s; --duration: 7.2s; --scale: 0.75; }
.bubble-3 { --left: 58%; --delay: 1.2s; --duration: 8.4s; --scale: 0.95; }
.bubble-4 { --left: 78%; --delay: 2.8s; --duration: 7.8s; --scale: 0.84; }

@keyframes glowDrift {
  0%, 100% { transform: translate3d(0, 0, 0); }
  50% { transform: translate3d(1.5%, -2%, 0); }
}

@keyframes bubbleRise {
  0% { transform: translate3d(0, 0, 0) scale(var(--scale)); opacity: 0; }
  15% { opacity: 0.45; }
  100% { transform: translate3d(16px, -160px, 0) scale(calc(var(--scale) * 1.1)); opacity: 0; }
}

@media (max-width: 900px) {
  .identity-overlay {
    padding: 12px;
    align-items: center;
    justify-content: center;
    overflow-y: auto;
  }

  .scene {
    width: min(100%, 620px);
    aspect-ratio: auto;
    height: auto;
    max-height: 92vh;
    display: flex;
    flex-direction: column;
  }

  .glass-card {
    min-height: auto;
    height: auto;
    max-height: 92vh;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }

  .content {
    padding: 20px 18px;
    gap: 16px;
    position: relative;
    z-index: 3;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 100%;
    box-sizing: border-box;
  }

  .card-top {
    display: flex;
    flex-direction: column-reverse;
    align-items: center;
    gap: 14px;
    text-align: center;
  }

  .avatar-glow {
    width: 96px;
    height: 96px;
  }

  .identity-block {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .identity-block .title {
    text-align: center;
  }

  .badge-row {
    justify-content: center;
  }

  .card-bottom {
    display: flex;
    flex-direction: column-reverse;
    gap: 12px;
    align-items: stretch;
  }

  .main-actions {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 8px;
    width: 100%;
  }

  .main-actions .primary-btn,
  .main-actions .secondary-btn {
    padding: 10px 14px;
    font-size: 0.8rem;
    width: 100%;
  }

  .connect-dock {
    justify-content: center;
    gap: 10px;
    padding: 5px 12px;
    width: fit-content;
    margin: 0 auto;
  }
}

@media (max-width: 640px) {
  .identity-overlay {
    padding: 8px;
  }

  .glass-card {
    backdrop-filter: blur(16px) saturate(130%);
    -webkit-backdrop-filter: blur(16px) saturate(130%);
    border-radius: 24px;
  }

  .content {
    padding: 16px 14px;
    gap: 12px;
  }

  .avatar-glow {
    width: 86px;
    height: 86px;
  }

  .name {
    font-size: 1.35rem;
  }

  .title {
    font-size: 0.8rem;
    line-height: 1.7;
  }

  .eyebrow {
    font-size: 0.6rem;
    padding: 4px 10px;
    margin-bottom: 8px;
  }

  .main-actions {
    grid-template-columns: 1fr;
  }

  .connect-dock {
    width: 100%;
    justify-content: space-around;
  }
}

.qr-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 10000;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  pointer-events: auto;
}

.qr-modal-card {
  position: relative;
  background: #ffffff;
  color: #0f172a;
  border-radius: 24px;
  padding: 28px 24px;
  max-width: 340px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
  direction: rtl;
  pointer-events: auto;
}

.close-qr-btn {
  position: absolute;
  top: 14px;
  left: 14px;
  background: #f1f5f9;
  border: none;
  border-radius: 50%;
  width: 34px;
  height: 34px;
  cursor: pointer;
  font-weight: bold;
  font-size: 15px;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: auto;
  z-index: 2;
}

.close-qr-btn:hover {
  background: #e2e8f0;
  color: #0f172a;
  transform: scale(1.08);
}

.close-qr-btn:active {
  transform: scale(0.95);
}

.qr-modal-card h3 {
  margin: 0 0 6px 0;
  font-size: 1.15rem;
  color: #0f172a;
}

.qr-modal-card p {
  margin: 0 0 18px 0;
  font-size: 0.82rem;
  color: #64748b;
  text-align: center;
}

.qr-image-wrap {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 12px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  margin-bottom: 16px;
}

.qr-image-wrap img {
  display: block;
  max-width: 100%;
  height: auto;
}

.qr-url-pill {
  font-size: 0.8rem;
  font-weight: 700;
  color: #4f46e5;
  background: #f1f5f9;
  padding: 6px 14px;
  border-radius: 8px;
  display: inline-block;
}
</style>

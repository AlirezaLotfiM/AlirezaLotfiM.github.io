<script setup>
import { ref, computed } from 'vue';
import { usePortfolio } from '../composables/usePortfolio';

const { downloadVCard } = usePortfolio();
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

const cardData = computed(() => props.profile.identityCard || {});

const heroTitle = computed(() => cardData.value.name || props.profile.name || 'علیرضا لطفی‌مقدم');
const heroRole = computed(() => cardData.value.role || props.profile.titles?.[0] || props.profile.role || 'Backend Developer');
const heroBio = computed(() =>
  cardData.value.bio || props.profile.bio || 'توسعه دهنده بک اند با تمرکز بر سیستم های پایدار، طراحی داده و معماری فنی تمیز.',
);
const heroFocus = computed(() => cardData.value.focus || props.profile.learning?.focus || 'ASP.NET Core');
const contactEmail = computed(() => cardData.value.email || props.profile.cardEmail || 'hello@alireza.dev');
const eyebrow = computed(() => cardData.value.eyebrow || 'backend identity');
const badges = computed(() =>
  (cardData.value.badges || props.profile.badges || ['Backend', 'API Design', 'PostgreSQL']).slice(0, 3),
);
const enterLabel = computed(() => cardData.value.enterLabel || 'ورود به داشبورد');
const resumeLabel = computed(() => cardData.value.resumeLabel || 'رزومه');
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
              <div class="eyebrow mono-ui" dir="ltr">{{ eyebrow }}</div>
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
            <div class="contact-card">
              <span class="fact-label">ایمیل</span>
              <span class="fact-value mono-ui" dir="ltr">{{ contactEmail }}</span>
            </div>

            <div class="action-strip">
              <button class="secondary-btn" type="button" @click="downloadVCard" title="دانلود کارت تماس (vCard) برای ذخیره در گوشی">
                📇 vCard
              </button>
              <button class="secondary-btn" type="button" @click="showQrModal = true" title="نمایش کد QR برای اسکن با گوشی">
                📱 QR
              </button>
              <a
                class="secondary-btn"
                :href="resumeUrl || profile.resumeUrl || '/MyResume.pdf'"
                target="_blank"
                rel="noopener noreferrer"
              >
                {{ resumeLabel }}
              </a>
              <button class="primary-btn" type="button" @click="emit('enter')">{{ enterLabel }}</button>
            </div>
          </div>
        </div>
      </article>
    </div>

    <!-- QR CODE MODAL OVERLAY -->
    <Transition name="fade">
      <div v-if="showQrModal" class="qr-modal-overlay" @click.self="showQrModal = false">
        <div class="qr-modal-card">
          <button class="close-qr-btn" @click="showQrModal = false">✕</button>
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
  gap: 8px;
  width: fit-content;
  padding: 8px 12px;
  border-radius: 999px;
  margin-bottom: 14px;
  background: var(--item-bg);
  border: 1px solid var(--panel-border);
  color: var(--text-secondary);
  font-size: 0.66rem;
  letter-spacing: 0.12em;
}

.eyebrow::before {
  content: "";
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--neon);
  box-shadow: 0 0 12px var(--neon);
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
  gap: 20px;
  border-top: 1px solid var(--panel-border);
  padding-top: 24px;
}

.contact-card {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.fact-label {
  font-size: 0.72rem;
  color: var(--text-soft);
}

.fact-value {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--text-main);
  overflow-wrap: anywhere;
}

.action-strip {
  display: flex;
  gap: 12px;
  align-items: center;
}

.primary-btn,
.secondary-btn {
  border-radius: 16px;
  padding: 12px 18px;
  font-size: 0.78rem;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  text-decoration: none;
  text-align: center;
  white-space: nowrap;
  font-weight: 700;
}

.primary-btn {
  background: var(--neon);
  color: #ffffff !important;
  border: 1px solid var(--neon);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
}

.primary-btn:hover {
  filter: brightness(1.15);
  box-shadow: 0 0 16px var(--neon);
  transform: translateY(-2px);
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
  color: var(--text-main);
  transform: translateY(-2px);
}

.primary-btn:active,
.secondary-btn:active {
  transform: translateY(0) scale(0.97);
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
    padding: 16px;
  }

  .scene {
    width: min(100%, 620px);
    aspect-ratio: auto;
  }

  .glass-card {
    min-height: 560px;
  }

  .content {
    padding: 18px;
  }

  .card-top {
    display: flex;
    flex-direction: column-reverse;
    align-items: center;
    gap: 16px;
    text-align: center;
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

  .card-bottom,
  .action-strip {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .identity-overlay {
    align-items: start;
    overflow-y: auto;
  }

  .scene {
    width: 100%;
  }

  .glass-card {
    min-height: auto;
    backdrop-filter: blur(16px) saturate(130%);
    -webkit-backdrop-filter: blur(16px) saturate(130%);
  }

  .content {
    position: relative;
    gap: 14px;
    padding: 14px;
  }

  .identity-block,
  .focus-panel,
  .contact-card,
  .action-strip {
    border-radius: 18px;
  }

  .identity-block,
  .focus-panel {
    padding: 16px;
  }

  .contact-card {
    padding: 12px 14px;
  }

  .name {
    font-size: 1.5rem;
  }

  .title {
    font-size: 0.82rem;
    line-height: 1.75;
  }

  .badge-row {
    margin-top: 14px;
  }

  .primary-btn,
  .secondary-btn {
    width: 100%;
    white-space: normal;
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
}

.close-qr-btn {
  position: absolute;
  top: 14px;
  left: 14px;
  background: #f1f5f9;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  cursor: pointer;
  font-weight: bold;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.close-qr-btn:hover {
  background: #e2e8f0;
  color: #0f172a;
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

<script setup>
import { computed } from 'vue';

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
                <span v-for="badge in badges" :key="badge" class="badge-chip mono-ui">{{ badge }}</span>
              </div>
            </div>

            <div class="focus-panel">
              <span class="focus-label mono-ui" dir="ltr">Primary Focus</span>
              <strong class="focus-value mono-ui" dir="ltr">{{ heroFocus }}</strong>
            </div>
          </div>

          <div class="card-bottom">
            <div class="contact-card">
              <span class="fact-label">ایمیل</span>
              <span class="fact-value mono-ui" dir="ltr">{{ contactEmail }}</span>
            </div>

            <div class="action-strip">
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
  aspect-ratio: 1.68;
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
    radial-gradient(circle at var(--shine-x) var(--shine-y), rgba(255, 255, 255, 0.24), transparent 24%),
    radial-gradient(circle at 50% 110%, rgba(164, 210, 255, 0.16), transparent 30%);
  filter: blur(28px);
  opacity: 0.72;
  animation: glowDrift 12s ease-in-out infinite;
}

.glass-card {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 34px;
  overflow: hidden;
  background:
    linear-gradient(160deg, rgba(255, 255, 255, 0.84) 0%, rgba(243, 249, 255, 0.68) 42%, rgba(220, 236, 250, 0.58) 100%),
    rgba(255, 255, 255, 0.32);
  border: 1px solid rgba(255, 255, 255, 0.72);
  box-shadow:
    0 32px 70px rgba(77, 121, 168, 0.14),
    inset 0 1px 0 rgba(255, 255, 255, 0.9),
    inset 18px 18px 40px rgba(255, 255, 255, 0.08);
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
    linear-gradient(135deg, rgba(255, 255, 255, 0.58), transparent 22%),
    radial-gradient(circle at var(--shine-x) var(--shine-y), rgba(255, 255, 255, 0.18), transparent 18%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.18), transparent 26%, transparent 72%, rgba(255, 255, 255, 0.08));
  mix-blend-mode: screen;
  opacity: 0.88;
}

.glass-card::after {
  inset: 1px;
  border-radius: 33px;
  border: 1px solid rgba(255, 255, 255, 0.24);
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
  display: grid;
  grid-template-rows: 1fr auto;
  gap: 16px;
  padding: 26px;
}

.card-top {
  display: grid;
  grid-template-columns: minmax(0, 1.7fr) minmax(170px, 0.72fr);
  gap: 16px;
  align-items: stretch;
}

.identity-block,
.focus-panel,
.contact-card,
.action-strip {
  border-radius: 24px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.36), rgba(229, 241, 252, 0.18));
  border: 1px solid rgba(255, 255, 255, 0.42);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.22);
}

.identity-block {
  padding: 22px;
  min-width: 0;
}

.focus-panel {
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 10px;
  text-align: center;
}

.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  width: fit-content;
  padding: 8px 12px;
  border-radius: 999px;
  margin-bottom: 14px;
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.48);
  color: rgba(28, 54, 83, 0.86);
  font-size: 0.66rem;
  letter-spacing: 0.12em;
}

.eyebrow::before {
  content: "";
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.95), rgba(179, 219, 255, 0.42));
  box-shadow: 0 0 12px rgba(255, 255, 255, 0.55);
}

.name {
  margin: 0;
  font-size: clamp(1.85rem, 3.8vw, 2.45rem);
  line-height: 1.18;
  color: #17314c;
  text-shadow: 0 10px 20px rgba(255, 255, 255, 0.42);
}

.role {
  margin: 10px 0 0;
  color: var(--accent-strong);
  font-size: 0.84rem;
}

.title {
  margin: 14px 0 0;
  max-width: 430px;
  font-size: 0.88rem;
  line-height: 1.86;
  color: rgba(36, 67, 98, 0.9);
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
  border: 1px solid rgba(203, 221, 239, 0.95);
  background: rgba(255, 255, 255, 0.6);
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
  color: #17314c;
}

.card-bottom {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 12px;
  align-items: stretch;
}

.contact-card {
  min-width: 0;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
}

.fact-label {
  font-size: 0.72rem;
  color: rgba(56, 90, 123, 0.72);
}

.fact-value {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: #17314c;
  overflow-wrap: anywhere;
}

.action-strip {
  padding: 8px;
  display: grid;
  grid-template-columns: auto auto;
  gap: 8px;
  align-items: center;
}

.primary-btn,
.secondary-btn {
  border-radius: 16px;
  padding: 12px 16px;
  font-size: 0.78rem;
  cursor: pointer;
  transition: 0.25s ease;
  text-decoration: none;
  text-align: center;
  white-space: nowrap;
}

.primary-btn {
  border: 1px solid rgba(86, 129, 177, 1);
  background: linear-gradient(180deg, rgba(94, 144, 196, 0.96), rgba(76, 122, 171, 0.9));
  color: #fff;
}

.secondary-btn {
  border: 1px solid rgba(204, 220, 236, 1);
  background: rgba(255, 255, 255, 0.76);
  color: var(--text-main);
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

  .card-top,
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
</style>

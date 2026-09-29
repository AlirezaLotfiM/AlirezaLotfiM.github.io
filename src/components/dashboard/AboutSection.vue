<script setup>
import { ref } from 'vue';
import { usePortfolio } from '../../composables/usePortfolio';
import { useI18n } from '../../composables/useI18n';
import { useTheme } from '../../composables/useTheme';
import { useAudioSynth } from '../../composables/useAudioSynth';
import { useNavigation } from '../../composables/useNavigation';
import AnimatedCountUp from './AnimatedCountUp.vue';

const emit = defineEmits(['show-qr', 'explore-work']);

const { profile, downloadVCard } = usePortfolio();
const { t, isRtl } = useI18n();
const { isDark } = useTheme();
const { playClick } = useAudioSynth();
const { tabPaths, navigateFromEvent } = useNavigation();

const emailCopied = ref(false);

const copyEmail = () => {
  const mail = profile.value?.contact?.email || 'hi@alirz.ir';
  playClick();
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    navigator.clipboard.writeText(mail);
  }
  emailCopied.value = true;
  setTimeout(() => {
    emailCopied.value = false;
  }, 2200);
};

const handleExploreClick = () => {
  playClick();
  emit('explore-work');
};
</script>

<template>
  <section id="about" class="editorial-hero-banner" :dir="isRtl ? 'rtl' : 'ltr'">
    <!-- Top Identity & Eyebrow -->
    <div class="hero-intro-header">
      <div class="hero-greeting-pill">
        <span class="greeting-wave">👋</span>
        <span>{{ t('heroGreeting') }}</span>
      </div>
      <h1 class="hero-name-title">{{ t('name') }}</h1>
      <div class="hero-role-row">
        <span class="hero-role-title">{{ t('heroRoleFa') }}</span>
        <span class="hero-role-tech mono-ui" dir="ltr">.NET • C# • Backend</span>
      </div>
      <p class="hero-tagline">{{ t('bio') }}</p>
    </div>

    <!-- Editorial Narrative & Achievements -->
    <div class="hero-narrative-wrap">
      <p class="hero-lead-text">
        {{ t('aboutLead') }}
      </p>
      <p class="hero-secondary-text">
        {{ t('aboutP2') }}
      </p>

      <!-- STATS & METRICS COUNTER STRIP -->
      <div class="hero-specs-strip">
        <div class="spec-strip-item">
          <span class="spec-num">
            <AnimatedCountUp :target="5" prefix="+" :suffix="` ${t('specExpUnit')}`" />
          </span>
          <span class="spec-lbl">{{ t('specExpLabel') }}</span>
        </div>

        <div class="spec-strip-divider"></div>

        <div class="spec-strip-item">
          <span class="spec-num">
            <AnimatedCountUp :target="16" suffix="+" />
          </span>
          <span class="spec-lbl">{{ t('specProjLabel') }}</span>
        </div>

        <div class="spec-strip-divider"></div>

        <div class="spec-strip-item">
          <span class="spec-num spec-tech" dir="ltr">{{ t('specTechNum') }}</span>
          <span class="spec-lbl">{{ t('specTechLabel') }}</span>
        </div>
      </div>

      <!-- PRIMARY ACTION BUTTONS -->
      <div class="hero-actions-cluster">
        <button
          @click="handleExploreClick"
          class="hero-btn primary-explore"
          :class="{ 'is-dark': isDark }"
          type="button"
        >
          <span>مشاهده سوابق و پروژه‌ها</span>
          <span class="btn-down-arrow">↓</span>
        </button>

        <a :href="tabPaths.resume" @click="navigateFromEvent($event, tabPaths.resume)" class="hero-btn resume-pdf">
          <span>{{ t('resumeBtn') }}</span>
          <span class="mono-ui">PDF ↗</span>
        </a>

        <button @click="copyEmail" class="hero-btn email-copy" type="button" :title="emailCopied ? t('emailCopied') : t('copyEmail')">
          <span class="btn-icon">✉</span>
          <span class="mono-ui" dir="ltr">{{ profile.contact?.email || 'hi@alirz.ir' }}</span>
          <span class="copy-feedback-pill" :class="{ show: emailCopied }">
            {{ emailCopied ? 'کپی شد!' : 'کپی' }}
          </span>
        </button>

        <button @click="downloadVCard" class="hero-btn tool-btn" title="ذخیره مستقیم شماره و اطلاعات در گوشی (vCard)" type="button">
          <span>📇 {{ t('vcardBtn') }}</span>
        </button>

        <button @click="emit('show-qr')" class="hero-btn tool-btn" title="نمایش کد QR پورتفولیو" type="button">
          <span>📱 {{ t('qrBtn') }}</span>
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.editorial-hero-banner {
  display: flex;
  flex-direction: column;
  gap: 28px;
  padding: 36px 0 32px;
  border-bottom: 1px solid var(--panel-border, #cbd5e1);
  box-sizing: border-box;
}

.hero-intro-header {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.hero-greeting-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.84rem;
  font-weight: 600;
  color: var(--neon, #0284c7);
  background: rgba(2, 132, 199, 0.08);
  border: 1px solid rgba(2, 132, 199, 0.18);
  padding: 5px 14px;
  border-radius: 9999px;
  width: fit-content;
  margin-bottom: 6px;
}

.greeting-wave {
  font-size: 1rem;
}

.hero-name-title {
  font-size: 2.35rem;
  font-weight: 800;
  line-height: 1.25;
  color: var(--text-main, #0f172a);
  letter-spacing: -0.025em;
  margin: 0;
}

.hero-role-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin: 2px 0;
}

.hero-role-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--neon, #0284c7);
}

:global([data-theme="space-glass"]) .hero-role-title,
:global([data-theme="dark"]) .hero-role-title {
  color: #38bdf8;
}

.hero-role-tech {
  font-size: 0.78rem;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 999px;
  background: var(--bar-bg, #f1f5f9);
  border: 1px solid var(--panel-border, #cbd5e1);
  color: var(--text-soft, #64748b);
  letter-spacing: 0.02em;
}

:global([data-theme="space-glass"]) .hero-role-tech,
:global([data-theme="dark"]) .hero-role-tech {
  background: rgba(30, 41, 59, 0.7);
  border-color: rgba(255, 255, 255, 0.12);
  color: #94a3b8;
}

.hero-tagline {
  font-size: 1.05rem;
  line-height: 1.7;
  color: var(--text-soft, #64748b);
  margin: 4px 0 0;
  max-width: 820px;
}

.hero-narrative-wrap {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 980px;
}

.hero-lead-text {
  font-size: 1.08rem;
  line-height: 1.95;
  color: var(--text-main, #0f172a);
  font-weight: 500;
  margin: 0;
}

.hero-secondary-text {
  font-size: 0.98rem;
  line-height: 1.9;
  color: var(--text-secondary, #334155);
  margin: 0;
}

/* STATS & SPECS STRIP */
.hero-specs-strip {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 32px;
  margin-top: 14px;
  padding: 16px 24px;
  background: var(--item-bg, #ffffff);
  border: 1px solid var(--panel-border, #cbd5e1);
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.04);
  width: fit-content;
  box-sizing: border-box;
}

:global([data-theme="space-glass"]) .hero-specs-strip,
:global([data-theme="dark"]) .hero-specs-strip {
  background: rgba(15, 23, 42, 0.65);
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.spec-strip-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.spec-strip-item .spec-num {
  font-size: 1.45rem;
  color: var(--neon, #0284c7);
  font-weight: 800;
  line-height: 1.2;
}

.spec-strip-item .spec-lbl {
  font-size: 0.78rem;
  color: var(--text-soft, #64748b);
  font-weight: 600;
}

.spec-strip-divider {
  width: 1px;
  height: 32px;
  background: var(--panel-border, #cbd5e1);
  opacity: 0.8;
}

/* ACTION BUTTONS CLUSTER */
.hero-actions-cluster {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 14px;
}

.hero-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 16px;
  border-radius: 10px;
  font-family: inherit;
  font-size: 0.84rem;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  border: 1px solid var(--panel-border, #cbd5e1);
  background: var(--item-bg, #ffffff);
  color: var(--text-main, #0f172a);
  transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
  user-select: none;
}

:global([data-theme="space-glass"]) .hero-btn,
:global([data-theme="dark"]) .hero-btn {
  background: rgba(15, 23, 42, 0.7);
  border-color: rgba(255, 255, 255, 0.12);
  color: #f8fafc;
}

.hero-btn:hover {
  border-color: var(--neon, #0284c7);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.hero-btn.primary-explore {
  background: #0f172a;
  color: #ffffff;
  border-color: #0f172a;
}

.hero-btn.primary-explore.is-dark {
  background: var(--neon, #38bdf8);
  color: #080d1a;
  border-color: var(--neon, #38bdf8);
  font-weight: 700;
}

.hero-btn.primary-explore:hover {
  background: var(--neon, #0284c7);
  border-color: var(--neon, #0284c7);
  color: #ffffff;
}

.hero-btn.primary-explore.is-dark:hover {
  background: #0284c7;
  border-color: #0284c7;
  color: #ffffff;
}

.hero-btn.resume-pdf {
  border-color: rgba(2, 132, 199, 0.35);
  color: var(--neon, #0284c7);
}

:global([data-theme="space-glass"]) .hero-btn.resume-pdf,
:global([data-theme="dark"]) .hero-btn.resume-pdf {
  border-color: rgba(56, 189, 248, 0.35);
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.08);
}

.btn-down-arrow {
  font-size: 0.95rem;
  transition: transform 0.2s ease;
}

.hero-btn.primary-explore:hover .btn-down-arrow {
  transform: translateY(2px);
}

.copy-feedback-pill {
  font-size: 0.7rem;
  padding: 1px 6px;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.06);
  opacity: 0.8;
}

.copy-feedback-pill.show {
  background: #10b981;
  color: #ffffff;
  opacity: 1;
}

@media (max-width: 768px) {
  .hero-name-title {
    font-size: 1.85rem;
  }

  .hero-specs-strip {
    width: 100%;
    justify-content: space-around;
    gap: 12px;
    padding: 12px 14px;
  }

  .spec-strip-item .spec-num {
    font-size: 1.15rem;
  }

  .spec-strip-item .spec-lbl {
    font-size: 0.7rem;
  }
}
</style>

<script setup>
import { usePortfolio } from '../../composables/usePortfolio';
import { useI18n } from '../../composables/useI18n';
import { useNavigation } from '../../composables/useNavigation';
import AnimatedCountUp from './AnimatedCountUp.vue';

const emit = defineEmits(['show-qr']);

const { downloadVCard } = usePortfolio();
const { t, isRtl } = useI18n();
const { tabPaths, navigateFromEvent } = useNavigation();
</script>

<template>
  <section id="about" class="editorial-section" :dir="isRtl ? 'rtl' : 'ltr'">
    <div class="sec-title-bar">
      <span class="num mono-ui" dir="ltr">{{ isRtl ? '۰۰ //' : '00 //' }}</span>
      <h2>{{ t('aboutTitle') }}</h2>
    </div>

    <div class="text-content">
      <p class="lead">
        {{ t('aboutLead') }}
      </p>
      <p>
        {{ t('aboutP2') }}
      </p>
      <p class="availability-callout">
        <span class="callout-dot"></span>
        {{ t('availabilityCallout') }}
      </p>

      <!-- EDITORIAL SPECS STRIP WITH ANIMATED NUMBERS -->
      <div class="editorial-specs-strip">
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

      <!-- MOBILE-ONLY ACTION BUTTONS BLOCK -->
      <div class="mobile-action-tools">
        <a :href="tabPaths.resume" @click="navigateFromEvent($event, tabPaths.resume)" class="editorial-resume-btn">
          <span>{{ t('resumeBtn') }}</span>
          <span class="btn-arrow mono-ui">PDF ↗</span>
        </a>
        <div class="sidebar-contact-tools">
          <button @click="downloadVCard" class="tool-chip-btn" title="ذخیره مستقیم شماره و اطلاعات در گوشی (vCard)">
            📇 {{ t('vcardBtn') }}
          </button>
          <button @click="emit('show-qr')" class="tool-chip-btn" title="نمایش کد QR پورتفولیو">
            📱 {{ t('qrBtn') }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.editorial-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.sec-title-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--neon, #4f46e5);
}

.sec-title-bar .num {
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--neon, #4f46e5);
}

.sec-title-bar h2 {
  font-size: 1.35rem;
  font-weight: 800;
  color: var(--text-main, #0f172a);
  margin: 0;
}

.text-content {
  font-size: 0.95rem;
  line-height: 1.85;
  color: var(--text-secondary, #334155);
}

.text-content .lead {
  font-size: 1.05rem;
  color: var(--text-main, #0f172a);
  font-weight: 500;
  line-height: 1.9;
}

.availability-callout {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 14px 18px;
  background: rgba(79, 70, 229, 0.05);
  border: 1px solid rgba(79, 70, 229, 0.18);
  border-radius: 12px;
  font-size: 0.88rem;
  color: var(--text-main, #0f172a);
  margin-top: 18px;
}

.callout-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--neon, #4f46e5);
  box-shadow: 0 0 8px var(--neon, #4f46e5);
  margin-top: 6px;
  flex-shrink: 0;
}

/* EDITORIAL SPECS STRIP */
.editorial-specs-strip {
  display: flex;
  align-items: center;
  justify-content: space-around;
  gap: 16px;
  margin-top: 26px;
  padding: 18px 24px;
  background: var(--item-bg, #ffffff);
  border: 1px solid var(--panel-border, #cbd5e1);
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.04);
  font-family: var(--font-sans);
  transition: all 0.2s ease;
}

.editorial-specs-strip:hover {
  border-color: rgba(79, 70, 229, 0.35);
  box-shadow: 0 8px 24px rgba(79, 70, 229, 0.08);
}

.spec-strip-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 4px;
  font-family: var(--font-sans);
}

.spec-strip-item .spec-num {
  font-family: var(--font-sans);
  font-size: 1.35rem;
  color: var(--neon, #4f46e5);
  font-weight: 800;
  line-height: 1.2;
}

.spec-strip-item .spec-num.spec-tech {
  letter-spacing: 0.5px;
}

.spec-strip-item .spec-lbl {
  font-family: var(--font-sans);
  font-size: 0.82rem;
  color: var(--text-secondary, #475569);
  font-weight: 600;
  line-height: 1.3;
}

.spec-strip-divider {
  width: 1px;
  height: 28px;
  background: var(--panel-border, #cbd5e1);
}

/* MOBILE-ONLY ACTION TOOLS */
.mobile-action-tools {
  display: none;
  flex-direction: column;
  gap: 10px;
  margin-top: 20px;
}

@media (max-width: 1024px) {
  .mobile-action-tools {
    display: flex;
  }
}

.editorial-resume-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  border-radius: 12px;
  background: var(--neon, #4f46e5);
  color: #ffffff;
  text-decoration: none;
  font-size: 0.86rem;
  font-weight: 700;
}

.btn-arrow {
  font-size: 0.75rem;
}

.sidebar-contact-tools {
  display: flex;
  gap: 8px;
}

.tool-chip-btn {
  flex: 1;
  padding: 8px 10px;
  border-radius: 8px;
  background: var(--item-bg, #ffffff);
  border: 1px solid var(--panel-border, #cbd5e1);
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-secondary, #334155);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

@media (max-width: 640px) {
  .editorial-specs-strip {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 6px;
    padding: 12px 8px;
  }

  .spec-strip-divider {
    display: none;
  }

  .spec-strip-item .spec-num {
    font-size: 1.05rem;
  }

  .spec-strip-item .spec-lbl {
    font-size: 0.68rem;
  }
}

@media (max-width: 480px) {
  .editorial-specs-strip {
    gap: 4px;
    padding: 10px 4px;
  }

  .spec-strip-item .spec-num {
    font-size: 0.95rem;
  }

  .spec-strip-item .spec-lbl {
    font-size: 0.64rem;
  }

  .text-content .lead {
    font-size: 0.95rem;
    line-height: 1.8;
  }

  .availability-callout {
    padding: 10px 12px;
    font-size: 0.82rem;
  }
}
</style>

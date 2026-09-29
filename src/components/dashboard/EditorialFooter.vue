<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { usePortfolio } from '../../composables/usePortfolio';
import { useI18n } from '../../composables/useI18n';
import { useAudioSynth } from '../../composables/useAudioSynth';
import { useNavigation } from '../../composables/useNavigation';

const emit = defineEmits(['scroll-to-top', 'open-terminal']);

const { profile, userGithub, downloadVCard } = usePortfolio();
const { t, isRtl } = useI18n();
const { playClick } = useAudioSynth();
const { tabPaths, navigateFromEvent } = useNavigation();

const emailCopied = ref(false);
const currentTime = ref('');
let timerId = null;

const updateTehranTime = () => {
  try {
    const now = new Date();
    currentTime.value = new Intl.DateTimeFormat('fa-IR', {
      timeZone: 'Asia/Tehran',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(now);
  } catch {
    currentTime.value = new Date().toLocaleTimeString();
  }
};

onMounted(() => {
  updateTehranTime();
  timerId = setInterval(updateTehranTime, 1000);
});

onUnmounted(() => {
  if (timerId) clearInterval(timerId);
});

const copyEmail = () => {
  const mail = profile.value?.contact?.email || 'hi@alirz.ir';
  playClick();
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    navigator.clipboard.writeText(mail);
  }
  emailCopied.value = true;
  setTimeout(() => {
    emailCopied.value = false;
  }, 2400);
};

const handleScrollTop = () => {
  playClick();
  emit('scroll-to-top');
};
</script>

<template>
  <footer class="editorial-manifesto-footer" :dir="isRtl ? 'rtl' : 'ltr'">
    <!-- Quick Contact Actions -->
    <div class="footer-action-pills">
      <button @click="copyEmail" class="footer-action-btn primary-copy">
        <span class="btn-icon">✉</span>
        <span class="btn-label">{{ profile.contact?.email || 'hi@alirz.ir' }}</span>
        <span class="copied-pill" :class="{ show: emailCopied }">
          {{ emailCopied ? 'کپی شد!' : 'کپی ایمیل' }}
        </span>
      </button>

      <a
        :href="profile.contact?.telegramUrl || 'https://t.me/DAMOON_X'"
        target="_blank"
        rel="noopener"
        class="footer-action-btn telegram-btn"
      >
        <span class="btn-icon">✈</span>
        <span>ارتباط مستقیم در تلگرام</span>
        <span class="btn-arrow mono-ui">↗</span>
      </a>

      <a
        :href="tabPaths.resume"
        @click="navigateFromEvent($event, tabPaths.resume)"
        class="footer-action-btn resume-btn"
      >
        <span class="btn-icon">📄</span>
        <span>مشاهده و چاپ رزومه (PDF)</span>
        <span class="btn-arrow mono-ui">↗</span>
      </a>
    </div>

    <!-- Metadata & Information Grid -->
    <div class="footer-meta-grid">
      <div class="meta-col">
        <span class="meta-col-title mono-ui" dir="ltr">// LOCATION & TIME</span>
        <div class="time-ticker-box">
          <span class="clock-icon">🕒</span>
          <span class="tehran-time-value mono-ui" dir="ltr">{{ currentTime }}</span>
          <span class="tz-label">تهران (GMT+3:30)</span>
        </div>
        <p class="meta-col-desc">پاسخگویی به ایمیل‌ها و پیام‌ها در کوتاه‌ترین زمان کاری.</p>
      </div>

      <div class="meta-col">
        <span class="meta-col-title mono-ui" dir="ltr">// CORE PARADIGMS</span>
        <div class="footer-tag-cluster" dir="ltr">
          <span class="f-tag">.NET 9</span>
          <span class="f-tag">C#</span>
          <span class="f-tag">Clean Architecture</span>
          <span class="f-tag">SQL Server</span>
          <span class="f-tag">SignalR</span>
          <span class="f-tag">WPF</span>
          <span class="f-tag">Vue.js 3</span>
        </div>
      </div>

      <div class="meta-col">
        <span class="meta-col-title mono-ui" dir="ltr">// CONNECT & REPOS</span>
        <div class="footer-social-links">
          <a :href="`https://github.com/${userGithub || 'AlirezaLotfiM'}`" target="_blank" rel="noopener" class="f-social-link">
            <span>GitHub</span>
            <span class="mono-ui">↗</span>
          </a>
          <a :href="profile.contact?.linkedin || 'https://linkedin.com/in/alireza-lotfi-moghaddam-378a8018a'" target="_blank" rel="noopener" class="f-social-link">
            <span>LinkedIn</span>
            <span class="mono-ui">↗</span>
          </a>
          <button @click="downloadVCard" class="f-social-link btn-like" type="button">
            <span>دانلود کارت ویزیت (vCard)</span>
            <span class="mono-ui">📇</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Bottom Copyright & Back to Top Bar -->
    <div class="footer-closing-bar">
      <p class="footer-legal mono-ui" dir="ltr">
        © {{ new Date().getFullYear() }} Alireza Lotfi Moghaddam. Crafted with Vue 3 & Precision.
      </p>

      <button @click="handleScrollTop" class="footer-scroll-top-btn" type="button">
        <span>بازگشت به ابتدای صفحه</span>
        <span class="top-arrow-icon">↑</span>
      </button>
    </div>
  </footer>
</template>

<style scoped>
.editorial-manifesto-footer {
  margin-top: 48px;
  padding: 48px 0 24px;
  border-top: 1px solid var(--panel-border, #cbd5e1);
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.footer-action-pills {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.footer-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: 12px;
  font-size: 0.84rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
  text-decoration: none;
  border: 1px solid var(--panel-border, #cbd5e1);
  background: var(--item-bg, #ffffff);
  color: var(--text-main, #0f172a);
}

.footer-action-btn:hover {
  transform: translateY(-2px);
  border-color: var(--neon, #0284c7);
  box-shadow: 0 6px 20px rgba(2, 132, 199, 0.12);
}

.footer-action-btn.primary-copy {
  background: var(--text-main, #0f172a);
  color: var(--card-bg, #ffffff);
  border-color: transparent;
}

:global([data-theme="dark"]) .footer-action-btn.primary-copy {
  background: #ffffff;
  color: #090d16;
}

.footer-action-btn.primary-copy:hover {
  background: var(--neon, #0284c7);
  color: #ffffff;
}

.footer-action-btn.telegram-btn {
  background: rgba(14, 165, 233, 0.08);
  border-color: rgba(14, 165, 233, 0.25);
  color: #0284c7;
}

:global([data-theme="dark"]) .footer-action-btn.telegram-btn {
  background: rgba(14, 165, 233, 0.12);
  color: #38bdf8;
  border-color: rgba(56, 189, 248, 0.3);
}

.copied-pill {
  font-size: 0.7rem;
  padding: 2px 6px;
  border-radius: 4px;
  background: rgba(16, 185, 129, 0.2);
  color: #10b981;
}

.footer-meta-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 28px;
  padding: 28px 0;
  border-top: 1px dashed var(--panel-border, #cbd5e1);
  border-bottom: 1px dashed var(--panel-border, #cbd5e1);
}

@media (max-width: 860px) {
  .footer-meta-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }
}

.meta-col {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.meta-col-title {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--text-soft, #64748b);
  letter-spacing: 0.04em;
}

.time-ticker-box {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  background: var(--item-bg, #ffffff);
  border: 1px solid var(--panel-border, #cbd5e1);
  width: fit-content;
}

.tehran-time-value {
  font-weight: 700;
  color: var(--text-main, #0f172a);
  font-size: 0.95rem;
}

.tz-label {
  font-size: 0.72rem;
  color: var(--text-soft, #64748b);
}

.meta-col-desc {
  font-size: 0.8rem;
  color: var(--text-soft, #64748b);
  line-height: 1.6;
  margin: 0;
}

.footer-tag-cluster {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.f-tag {
  font-size: 0.72rem;
  padding: 3px 8px;
  border-radius: 6px;
  background: var(--item-bg, #ffffff);
  border: 1px solid var(--panel-border, #cbd5e1);
  color: var(--text-soft, #64748b);
  font-family: inherit;
}

.footer-social-links {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.f-social-link {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 0.82rem;
  color: var(--text-soft, #64748b);
  text-decoration: none;
  background: var(--item-bg, #ffffff);
  border: 1px solid var(--panel-border, #cbd5e1);
  transition: all 0.18s ease;
}

.f-social-link:hover {
  color: var(--text-main, #0f172a);
  border-color: var(--neon, #0284c7);
  background: var(--card-bg, #ffffff);
}

.f-social-link.btn-like {
  cursor: pointer;
  font-family: inherit;
}

.footer-closing-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  padding-top: 12px;
}

.footer-legal {
  font-size: 0.75rem;
  color: var(--text-soft, #64748b);
  margin: 0;
}

.footer-scroll-top-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 9999px;
  background: var(--item-bg, #ffffff);
  border: 1px solid var(--panel-border, #cbd5e1);
  color: var(--text-soft, #64748b);
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.footer-scroll-top-btn:hover {
  color: var(--text-main, #0f172a);
  border-color: var(--neon, #0284c7);
  transform: translateY(-2px);
}

.top-arrow-icon {
  font-weight: 700;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.4;
    transform: scale(0.9);
  }
}
</style>

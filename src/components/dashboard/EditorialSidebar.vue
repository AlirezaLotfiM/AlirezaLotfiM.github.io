<script setup>
import { ref } from 'vue';
import { usePortfolio } from '../../composables/usePortfolio';
import { useAudioSynth } from '../../composables/useAudioSynth';
import { useI18n } from '../../composables/useI18n';
import { useNavigation } from '../../composables/useNavigation';

const props = defineProps({
  activeSection: {
    type: String,
    default: 'about'
  },
  sectionRoutes: {
    type: Object,
    default: () => ({})
  },
  selectedNote: {
    type: Object,
    default: () => null
  }
});

const emit = defineEmits(['scroll-to-section', 'show-qr']);

const { profile, downloadVCard } = usePortfolio();
const { playClick } = useAudioSynth();
const { t, isRtl } = useI18n();
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

const navItems = [
  { id: 'about', labelKey: 'navAbout', numFa: '۰۰', numEn: '00' },
  { id: 'experience', labelKey: 'navExperience', numFa: '۰۱', numEn: '01' },
  { id: 'projects', labelKey: 'navProjects', numFa: '۰۲', numEn: '02' },
  { id: 'skills', labelKey: 'navSkills', numFa: '۰۳', numEn: '03' },
  { id: 'notes', labelKey: 'navNotes', numFa: '۰۴', numEn: '04' },
];
</script>

<template>
  <aside class="editorial-sidebar" :dir="isRtl ? 'rtl' : 'ltr'">
    <div class="sidebar-top">
      <!-- PURE TYPOGRAPHIC IDENTITY -->
      <div class="sidebar-identity">
        <h1 class="author-name">{{ t('name') }}</h1>
        <p class="role-subtitle mono-ui" dir="ltr">{{ t('role') }}</p>
        <p class="concise-bio">{{ t('bio') }}</p>
        <div class="sidebar-email-row">
          <button @click="copyEmail" class="copy-email-btn mono-ui" :title="emailCopied ? t('emailCopied') : t('copyEmail')">
            <span class="email-icon">✉</span>
            <span class="email-text">{{ profile.contact?.email || 'hi@alirz.ir' }}</span>
            <span class="email-copy-badge">{{ emailCopied ? t('emailCopied') : t('copyEmail') }}</span>
          </button>
        </div>
      </div>

      <!-- NAVIGATION MENU -->
      <nav class="editorial-nav" :aria-label="t('navAbout')">
        <a
          v-for="item in navItems"
          :key="item.id"
          :href="sectionRoutes[item.id] || '#'"
          @click="emit('scroll-to-section', item.id, $event)"
          :class="{ active: !selectedNote && activeSection === item.id }"
        >
          <span class="nav-num mono-ui" dir="ltr">{{ isRtl ? item.numFa : item.numEn }}</span>
          <span class="nav-label">{{ t(item.labelKey) }}</span>
        </a>
      </nav>
    </div>

    <div class="sidebar-bottom">
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
  </aside>
</template>

<style scoped>
.editorial-sidebar {
  width: 290px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: calc(100vh - 84px);
  position: sticky;
  top: 72px;
  box-sizing: border-box;
  padding: 12px 0 20px;
}

@media (max-width: 1024px) {
  .editorial-sidebar {
    width: 100%;
    height: auto;
    position: static;
    padding: 0;
  }

  .concise-bio,
  .sidebar-bottom {
    display: none;
  }

  .sidebar-identity {
    margin-bottom: 10px;
    gap: 4px;
  }

  .author-name {
    font-size: 1.35rem;
  }

  .role-subtitle {
    font-size: 0.78rem;
  }

  .editorial-nav {
    position: sticky;
    top: 58px;
    z-index: 90;
    display: flex;
    flex-direction: row;
    overflow-x: auto;
    white-space: nowrap;
    gap: 8px;
    padding: 8px 4px;
    margin: 4px 0 12px;
    background: var(--bg-main, #f8fafc);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    border-bottom: 1px solid var(--panel-border, #cbd5e1);
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
  }

  .editorial-nav::-webkit-scrollbar {
    display: none;
  }

  .editorial-nav a {
    gap: 6px;
    padding: 6px 14px;
    border-radius: 999px;
    font-size: 0.8rem;
    background: var(--item-bg, #ffffff);
    border: 1px solid var(--panel-border, #cbd5e1);
    flex-shrink: 0;
  }

  .editorial-nav a.active {
    background: var(--neon, #4f46e5);
    border-color: var(--neon, #4f46e5);
    color: #ffffff;
    font-weight: 700;
    box-shadow: 0 2px 8px rgba(79, 70, 229, 0.25);
  }

  .editorial-nav a.active .nav-num {
    color: rgba(255, 255, 255, 0.85);
    opacity: 1;
  }
}

.sidebar-identity {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 24px;
}

.author-name {
  font-size: 1.55rem;
  font-weight: 800;
  color: var(--text-main, #0f172a);
  margin: 0;
  letter-spacing: -0.4px;
}

.role-subtitle {
  font-size: 0.82rem;
  color: var(--neon, #4f46e5);
  font-weight: 700;
  margin: 0;
}

.concise-bio {
  font-size: 0.85rem;
  color: var(--text-secondary, #475569);
  line-height: 1.65;
  margin: 4px 0 0;
}

.sidebar-email-row {
  margin-top: 6px;
}

.copy-email-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  max-width: 100%;
  padding: 5px 10px;
  border-radius: 8px;
  background: var(--item-bg, #ffffff);
  border: 1px solid var(--panel-border, #cbd5e1);
  font-size: 0.76rem;
  color: var(--text-secondary, #334155);
  cursor: pointer;
  transition: all 0.15s ease;
}

.copy-email-btn .email-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.copy-email-btn:hover {
  border-color: var(--neon, #4f46e5);
  color: var(--neon, #4f46e5);
}

.email-copy-badge {
  font-size: 0.68rem;
  color: var(--neon, #4f46e5);
  font-weight: 700;
}

.editorial-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.editorial-nav a {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border-radius: 10px;
  font-size: 0.86rem;
  font-weight: 600;
  color: var(--text-secondary, #475569);
  text-decoration: none;
  transition: all 0.15s ease;
}

.editorial-nav a:hover {
  background: rgba(79, 70, 229, 0.06);
  color: var(--text-main, #0f172a);
}

.editorial-nav a.active {
  background: rgba(79, 70, 229, 0.12);
  color: var(--neon, #4f46e5);
  font-weight: 700;
}

.nav-num {
  font-size: 0.72rem;
  opacity: 0.6;
}

.sidebar-bottom {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid var(--panel-border, #cbd5e1);
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
  transition: all 0.2s ease;
}

.editorial-resume-btn:hover {
  opacity: 0.94;
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(79, 70, 229, 0.3);
}

.btn-arrow {
  font-size: 0.75rem;
  opacity: 0.85;
}

.sidebar-contact-tools {
  display: flex;
  gap: 8px;
}

.tool-chip-btn {
  flex: 1;
  padding: 7px 10px;
  border-radius: 8px;
  background: var(--item-bg, #ffffff);
  border: 1px solid var(--panel-border, #cbd5e1);
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-secondary, #334155);
  cursor: pointer;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.tool-chip-btn:hover {
  border-color: var(--neon, #4f46e5);
  color: var(--neon, #4f46e5);
}
</style>

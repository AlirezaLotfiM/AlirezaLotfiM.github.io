<script setup>
import { usePortfolio } from '../../composables/usePortfolio';
import { useTheme } from '../../composables/useTheme';
import { useAudioSynth } from '../../composables/useAudioSynth';
import { useI18n } from '../../composables/useI18n';

const props = defineProps({
  isZenMode: Boolean,
  scrollProgress: {
    type: Number,
    default: 0
  }
});

const emit = defineEmits(['open-terminal', 'open-palette', 'toggle-theme']);

const { profile, userGithub } = usePortfolio();
const { isDark, toggleTheme } = useTheme();
const { playThemeChirp } = useAudioSynth();
const { t } = useI18n();

const appVersion = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '3.1.0';

const handleThemeToggle = () => {
  playThemeChirp();
  toggleTheme();
  emit('toggle-theme');
};
</script>

<template>
  <header class="swiss-top-bar" :class="{ hidden: isZenMode }">
    <div class="scroll-progress-line" :style="{ transform: `scaleX(${Math.min(Math.max(scrollProgress / 100, 0), 1)})` }"></div>
    <div class="top-bar-inner">
      <!-- RIGHT (RTL): Brand Logo + Version Pill + Status -->
      <div class="header-logo-wrap" title="Damoon Portfolio">
        <img src="/monogram-damoon.png" alt="Damoon" class="damoon-full-logo-img" width="98" height="98" />
        <span class="header-version-pill mono-ui" dir="ltr">v{{ appVersion }}</span>
        <span class="header-availability-badge" :title="t('availableForHire')">
          <span class="availability-pulse-dot"></span>
          {{ t('availableForHire') }}
        </span>
      </div>

      <!-- LEFT (RTL): Actions (Spotlight Search, Theme, Socials, CLI) -->
      <div class="header-actions-row" dir="ltr">
        <!-- Minimal Spotlight Search / Command Palette Trigger -->
        <button
          @click="emit('open-palette')"
          class="header-cmd-btn"
          :title="t('searchPlaceholder')"
          aria-label="جستجو در پورتفولیو (Ctrl+K)"
        >
          <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="cmd-icon-svg">
            <circle cx="11" cy="11" r="7"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <span class="cmd-text">جستجو...</span>
          <kbd class="cmd-kbd">Ctrl K</kbd>
        </button>

        <!-- Theme Switcher -->
        <button
          @click="handleThemeToggle"
          :title="isDark ? 'تغییر به تم لایت' : 'تغییر به تم دارک'"
          class="header-icon-link theme-toggle"
          :aria-label="isDark ? 'تغییر به تم لایت' : 'تغییر به تم دارک'"
        >
          <svg v-if="!isDark" viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
          <svg v-else viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="5"/>
            <line x1="12" y1="1" x2="12" y2="3"/>
            <line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/>
            <line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          </svg>
        </button>

        <!-- Email Link -->
        <a :href="`mailto:${profile.contact?.email || 'hi@alirz.ir'}`" title="ایمیل" class="header-icon-link">
          <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="3"/>
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
          </svg>
        </a>

        <!-- GitHub Link -->
        <a :href="`https://github.com/${userGithub || 'AlirezaLotfiM'}`" target="_blank" rel="noopener" title="گیت‌هاب" class="header-icon-link">
          <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
            <path d="M9 18c-4.51 2-5-2-7-2"/>
          </svg>
        </a>

        <!-- LinkedIn Link -->
        <a :href="profile.contact?.linkedin || 'https://linkedin.com/in/alireza-lotfi-moghaddam-378a8018a'" target="_blank" rel="noopener" title="لینکدین" class="header-icon-link">
          <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
            <rect x="2" y="9" width="4" height="12"/>
            <circle cx="4" cy="4" r="2"/>
          </svg>
        </a>

        <!-- CLI Terminal Button -->
        <button @click="emit('open-terminal')" title="ترمینال دستورات (CLI)" class="header-icon-link cli">
          <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="4 17 10 12 4 7"/>
            <line x1="12" y1="19" x2="20" y2="19"/>
          </svg>
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.swiss-top-bar {
  position: sticky;
  top: 0;
  z-index: 100;
  width: 100%;
  background: rgba(248, 250, 252, 0.8);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-bottom: 1px solid rgba(203, 213, 225, 0.65);
  box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.03);
  padding: 0 24px;
  box-sizing: border-box;
  transition: transform 0.3s ease, background 0.3s ease, border-color 0.3s ease;
}

:global([data-theme="space-glass"]) .swiss-top-bar,
:global([data-theme="dark"]) .swiss-top-bar {
  background: rgba(8, 13, 26, 0.82);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 4px 24px -2px rgba(0, 0, 0, 0.4);
}

.swiss-top-bar.hidden {
  transform: translateY(-100%);
}

.scroll-progress-line {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--neon, #4f46e5), #06b6d4);
  transform-origin: 0% 50%;
  will-change: transform;
  transition: transform 0.1s ease-out;
  z-index: 101;
}

:global([dir="rtl"]) .scroll-progress-line {
  transform-origin: 100% 50%;
}

.top-bar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 58px;
  max-width: 1360px;
  margin: 0 auto;
}

.header-logo-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}

.damoon-full-logo-img {
  width: 54px;
  height: 54px;
  object-fit: contain;
  transition: transform 0.2s ease, filter 0.2s ease;
}

:global([data-theme="space-glass"]) .damoon-full-logo-img,
:global([data-theme="dark"]) .damoon-full-logo-img {
  filter: brightness(0) invert(1) drop-shadow(0 0 10px rgba(56, 189, 248, 0.65));
}

@media (min-width: 1025px) {
  .damoon-full-logo-img {
    width: 72px;
    height: 72px;
  }
}

.header-version-pill {
  font-size: 0.68rem;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 6px;
  background: var(--item-bg, #ffffff);
  border: 1px solid var(--panel-border, #cbd5e1);
  color: var(--text-soft, #64748b);
}

.header-availability-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.72rem;
  font-weight: 600;
  color: #10b981;
  background: rgba(16, 185, 129, 0.08);
  border: 1px solid rgba(16, 185, 129, 0.2);
  padding: 3px 10px;
  border-radius: 999px;
}

@media (max-width: 768px) {
  .header-availability-badge {
    display: none;
  }
}

.availability-pulse-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 6px #10b981;
  animation: pulse 1.6s infinite ease-in-out;
}

.header-actions-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-cmd-btn {
  display: flex;
  align-items: center;
  gap: 7px;
  height: 32px;
  padding: 0 10px 0 8px;
  background: var(--item-bg, #ffffff);
  border: 1px solid var(--panel-border, #cbd5e1);
  border-radius: 8px;
  color: var(--text-soft, #64748b);
  cursor: pointer;
  font-family: inherit;
  font-size: 0.74rem;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  user-select: none;
}

:global([data-theme="dark"]) .header-cmd-btn {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.1);
}

.header-cmd-btn:hover {
  border-color: var(--neon, #4f46e5);
  color: var(--text-main, #0f172a);
  background: var(--card-bg, #ffffff);
  box-shadow: 0 2px 8px rgba(79, 70, 229, 0.08);
}

:global([data-theme="dark"]) .header-cmd-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(99, 102, 241, 0.45);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.35);
  color: #ffffff;
}

.cmd-icon-svg {
  opacity: 0.65;
  flex-shrink: 0;
  transition: opacity 0.2s ease, transform 0.2s ease, color 0.2s ease;
}

.header-cmd-btn:hover .cmd-icon-svg {
  opacity: 1;
  color: var(--neon, #4f46e5);
  transform: scale(1.08);
}

.cmd-text {
  font-size: 0.74rem;
  font-weight: 500;
  color: var(--text-secondary, #475569);
  letter-spacing: -0.01em;
}

:global([data-theme="dark"]) .cmd-text {
  color: var(--text-soft, #94a3b8);
}

.cmd-kbd {
  font-family: inherit;
  font-size: 0.62rem;
  font-weight: 600;
  padding: 1px 5px;
  line-height: 1.3;
  color: var(--text-soft, #64748b);
  background: rgba(148, 163, 184, 0.12);
  border: 1px solid var(--panel-border, #cbd5e1);
  border-radius: 4px;
  letter-spacing: 0.02em;
}

:global([data-theme="dark"]) .cmd-kbd {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.12);
  color: #94a3b8;
}

@media (max-width: 640px) {
  .swiss-top-bar {
    padding: 0 12px;
  }
  .header-actions-row {
    gap: 4px;
  }
  .header-cmd-btn .cmd-text,
  .header-cmd-btn .cmd-kbd {
    display: none;
  }
  .header-cmd-btn {
    padding: 0;
    width: 32px;
    height: 32px;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .swiss-top-bar {
    padding: 0 8px;
  }
  .header-version-pill {
    display: none;
  }
  .header-icon-link {
    min-width: 32px;
    min-height: 32px;
  }
  .header-icon-link.cli {
    display: none;
  }
}

.header-icon-link {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  min-height: 36px;
  border-radius: 8px;
  color: var(--text-secondary, #475569);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
}

.header-icon-link:hover {
  color: var(--neon, #4f46e5);
  background: rgba(79, 70, 229, 0.08);
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.3); opacity: 0.6; }
}
</style>

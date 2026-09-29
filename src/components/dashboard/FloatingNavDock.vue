<script setup>
import { computed } from 'vue';
import { useI18n } from '../../composables/useI18n';
import { useAudioSynth } from '../../composables/useAudioSynth';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  activeSection: {
    type: String,
    default: 'about'
  },
  scrollProgress: {
    type: Number,
    default: 0
  }
});

const emit = defineEmits(['scroll-to-section', 'open-terminal', 'open-palette']);

const { t, isRtl } = useI18n();
const { playClick } = useAudioSynth();

const navItems = [
  { id: 'about', labelKey: 'navAbout', numFa: '۰۰', numEn: '00' },
  { id: 'experience', labelKey: 'navExperience', numFa: '۰۱', numEn: '01' },
  { id: 'projects', labelKey: 'navProjects', numFa: '۰۲', numEn: '02' },
  { id: 'skills', labelKey: 'navSkills', numFa: '۰۳', numEn: '03' },
  { id: 'notes', labelKey: 'navNotes', numFa: '۰۴', numEn: '04' }
];

const handleNavClick = (id, event) => {
  if (event) event.preventDefault();
  playClick();
  emit('scroll-to-section', id);
};
</script>

<template>
  <Transition name="dock-pop">
    <aside
      v-if="visible"
      class="floating-nav-dock-wrap"
      :dir="isRtl ? 'rtl' : 'ltr'"
      role="navigation"
      aria-label="منوی دسترسی سریع شناور"
    >
      <div class="floating-nav-dock">
        <!-- Section Links -->
        <nav class="dock-nav-items">
          <button
            v-for="item in navItems"
            :key="item.id"
            @click="handleNavClick(item.id, $event)"
            class="dock-item-btn"
            :class="{ active: activeSection === item.id }"
            :aria-current="activeSection === item.id ? 'page' : undefined"
          >
            <span class="dock-num mono-ui" dir="ltr">{{ isRtl ? item.numFa : item.numEn }}</span>
            <span class="dock-label">{{ t(item.labelKey) }}</span>
            <span v-if="activeSection === item.id" class="dock-active-glow"></span>
          </button>
        </nav>

        <div class="dock-divider"></div>

        <!-- Utility Shortcuts (CLI & Search) -->
        <div class="dock-actions">
          <button
            @click="emit('open-palette')"
            class="dock-action-icon-btn"
            title="جستجوی سریع (Ctrl+K)"
            aria-label="جستجو"
          >
            <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="7"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </button>

          <button
            @click="emit('open-terminal')"
            class="dock-action-icon-btn terminal-trigger"
            title="ترمینال خط فرمان Damoon CLI"
            aria-label="ترمینال"
          >
            <span class="terminal-prompt-icon mono-ui">&gt;_</span>
          </button>
        </div>
      </div>
    </aside>
  </Transition>
</template>

<style scoped>
.floating-nav-dock-wrap {
  position: fixed;
  bottom: 22px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 90;
  pointer-events: none;
  max-width: calc(100vw - 28px);
}

.floating-nav-dock {
  pointer-events: auto;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 9999px;
  background: var(--card-bg, #ffffff);
  border: 1px solid var(--panel-border, #cbd5e1);
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.06);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

:global([data-theme="dark"]) .floating-nav-dock {
  background: rgba(15, 23, 42, 0.82);
  border-color: rgba(255, 255, 255, 0.12);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.05);
}

.dock-nav-items {
  display: flex;
  align-items: center;
  gap: 3px;
}

.dock-item-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: transparent;
  border: none;
  border-radius: 9999px;
  font-family: inherit;
  font-size: 0.78rem;
  font-weight: 500;
  color: var(--text-soft, #64748b);
  cursor: pointer;
  transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
  user-select: none;
  white-space: nowrap;
}

.dock-item-btn:hover {
  color: var(--text-main, #0f172a);
  background: rgba(0, 0, 0, 0.04);
}

:global([data-theme="dark"]) .dock-item-btn:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.06);
}

.dock-item-btn.active {
  color: var(--text-main, #0f172a);
  font-weight: 700;
  background: var(--item-bg, #f1f5f9);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

:global([data-theme="dark"]) .dock-item-btn.active {
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.12);
  box-shadow: inset 0 0 0 1px rgba(56, 189, 248, 0.25);
}

.dock-num {
  font-size: 0.65rem;
  opacity: 0.75;
  font-weight: 600;
}

.dock-active-glow {
  position: absolute;
  bottom: 2px;
  left: 50%;
  transform: translateX(-50%);
  width: 14px;
  height: 2px;
  background: var(--neon, #0284c7);
  border-radius: 2px;
  box-shadow: 0 0 6px var(--neon, #0284c7);
}

.dock-divider {
  width: 1px;
  height: 20px;
  background: var(--panel-border, #cbd5e1);
  opacity: 0.7;
}

:global([data-theme="dark"]) .dock-divider {
  background: rgba(255, 255, 255, 0.12);
}

.dock-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.dock-action-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: transparent;
  border: 1px solid transparent;
  color: var(--text-soft, #64748b);
  cursor: pointer;
  transition: all 0.2s ease;
}

.dock-action-icon-btn:hover {
  color: var(--text-main, #0f172a);
  background: rgba(0, 0, 0, 0.05);
  border-color: var(--panel-border, #cbd5e1);
}

:global([data-theme="dark"]) .dock-action-icon-btn:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.15);
}

.dock-action-icon-btn.terminal-trigger:hover {
  color: #10b981;
  border-color: rgba(16, 185, 129, 0.35);
  background: rgba(16, 185, 129, 0.1);
}

.terminal-prompt-icon {
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: -1px;
}

/* Animations */
.dock-pop-enter-active,
.dock-pop-leave-active {
  transition: all 0.38s cubic-bezier(0.16, 1, 0.3, 1);
}

.dock-pop-enter-from,
.dock-pop-leave-to {
  opacity: 0;
  transform: translate(-50%, 20px) scale(0.95);
}

/* Responsive Overrides */
@media (max-width: 640px) {
  .floating-nav-dock-wrap {
    bottom: 14px;
    max-width: calc(100vw - 16px);
  }

  .floating-nav-dock {
    padding: 4px 6px;
    gap: 4px;
  }

  .dock-item-btn {
    padding: 5px 8px;
    font-size: 0.74rem;
    gap: 4px;
  }

  .dock-num {
    display: none;
  }

  .dock-action-icon-btn {
    width: 28px;
    height: 28px;
  }
}
</style>

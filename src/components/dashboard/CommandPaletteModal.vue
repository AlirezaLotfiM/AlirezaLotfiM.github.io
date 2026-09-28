<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { usePortfolio } from '../../composables/usePortfolio';
import { useTheme } from '../../composables/useTheme';
import { useI18n } from '../../composables/useI18n';
import { useAudioSynth } from '../../composables/useAudioSynth';

const props = defineProps({
  isOpen: Boolean
});

const emit = defineEmits(['close', 'navigate-section', 'select-project', 'open-note', 'open-terminal', 'open-resume']);

const { projects, notes, workExperience, profile, downloadVCard, activeFilter } = usePortfolio();
const { isDark, toggleTheme } = useTheme();
const { t, isRtl, toggleLocale, currentLocale } = useI18n();
const { playClick, playThemeChirp } = useAudioSynth();

const searchQuery = ref('');
const selectedIndex = ref(0);
const inputRef = ref(null);
const emailCopied = ref(false);

const quickActions = computed(() => [
  {
    id: 'resume',
    category: t('cmdQuickActions'),
    title: t('cmdDownloadResume'),
    icon: '📄',
    action: () => {
      emit('open-resume');
      emit('close');
    }
  },
  {
    id: 'vcard',
    category: t('cmdQuickActions'),
    title: t('cmdDownloadVCard'),
    icon: '📇',
    action: () => {
      downloadVCard();
      emit('close');
    }
  },
  {
    id: 'email',
    category: t('cmdQuickActions'),
    title: emailCopied.value ? t('emailCopied') : t('cmdCopyEmail'),
    icon: '✉️',
    action: () => {
      const mail = profile.value?.contact?.email || 'hi@alirz.ir';
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(mail);
      }
      emailCopied.value = true;
      playClick();
      setTimeout(() => {
        emailCopied.value = false;
        emit('close');
      }, 1200);
    }
  },
  {
    id: 'theme',
    category: t('cmdQuickActions'),
    title: `${t('cmdSwitchTheme')} (${isDark.value ? (isRtl.value ? 'لایت' : 'Light') : (isRtl.value ? 'دارک' : 'Dark')})`,
    icon: isDark.value ? '☀️' : '🌙',
    action: () => {
      playThemeChirp();
      toggleTheme();
    }
  },
  {
    id: 'lang',
    category: t('cmdQuickActions'),
    title: currentLocale.value === 'fa' ? 'Switch Language to English' : 'تغییر زبان به فارسی',
    icon: '🌐',
    action: () => {
      playClick();
      toggleLocale();
    }
  },
  {
    id: 'terminal',
    category: t('cmdQuickActions'),
    title: t('cmdTerminalMode'),
    icon: '💻',
    action: () => {
      emit('open-terminal');
      emit('close');
    }
  }
]);

const projectItems = computed(() => {
  return (projects.value || []).map((p) => ({
    id: `proj-${p.id}`,
    category: t('cmdProjects'),
    title: p.name,
    subtitle: p.language,
    icon: '🚀',
    raw: p,
    action: () => {
      emit('select-project', p);
      emit('close');
    }
  }));
});

const experienceItems = computed(() => {
  return (workExperience.value || []).map((exp) => ({
    id: `exp-${exp.id}`,
    category: t('cmdExperience'),
    title: exp.company,
    subtitle: exp.title,
    icon: '💼',
    action: () => {
      emit('navigate-section', 'experience');
      emit('close');
    }
  }));
});

const skillItems = computed(() => [
  { id: 'skill-dotnet', category: t('cmdSkills'), title: '.NET & C# Ecosystem', subtitle: 'ASP.NET Core / SignalR / Clean Architecture', icon: '⚡', tech: 'C#' },
  { id: 'skill-wpf', category: t('cmdSkills'), title: 'WPF & Hardware Interfacing', subtitle: 'Biometrics / Suprema SDK / WIA Scanner / RS232', icon: '🖥️', tech: 'WPF' },
  { id: 'skill-sql', category: t('cmdSkills'), title: 'SQL Server & Database Tuning', subtitle: 'Query Optimization / Indexing / T-SQL', icon: '💾', tech: 'SQL Server' },
  { id: 'skill-vue', category: t('cmdSkills'), title: 'Vue.js 3 & Modern Frontend', subtitle: 'Vite / Component Architecture / Dashboards', icon: '📊', tech: 'Vue' }
].map((s) => ({
  ...s,
  action: () => {
    activeFilter.value = s.tech;
    emit('navigate-section', 'projects');
    emit('close');
  }
})));

const noteItems = computed(() => {
  return (notes.value || []).map((n) => ({
    id: `note-${n.id}`,
    category: t('cmdNotes'),
    title: n.title,
    subtitle: n.body ? n.body.slice(0, 60) + '...' : '',
    icon: '📝',
    action: () => {
      emit('open-note', n);
      emit('close');
    }
  }));
});

const allItems = computed(() => {
  return [
    ...quickActions.value,
    ...projectItems.value,
    ...experienceItems.value,
    ...skillItems.value,
    ...noteItems.value
  ];
});

const filteredResults = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  if (!query) {
    return allItems.value.slice(0, 9);
  }
  return allItems.value.filter((item) => {
    const titleMatch = item.title?.toLowerCase().includes(query);
    const subtitleMatch = item.subtitle?.toLowerCase().includes(query);
    const catMatch = item.category?.toLowerCase().includes(query);
    return titleMatch || subtitleMatch || catMatch;
  }).slice(0, 15);
});

watch(filteredResults, () => {
  selectedIndex.value = 0;
});

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    searchQuery.value = '';
    selectedIndex.value = 0;
    nextTick(() => {
      inputRef.value?.focus();
    });
  }
});

const handleKeydown = (e) => {
  if (!props.isOpen) return;

  if (e.key === 'Escape') {
    e.preventDefault();
    emit('close');
    return;
  }

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    if (filteredResults.value.length > 0) {
      selectedIndex.value = (selectedIndex.value + 1) % filteredResults.value.length;
      scrollItemIntoView();
    }
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    if (filteredResults.value.length > 0) {
      selectedIndex.value = (selectedIndex.value - 1 + filteredResults.value.length) % filteredResults.value.length;
      scrollItemIntoView();
    }
  } else if (e.key === 'Enter') {
    e.preventDefault();
    const item = filteredResults.value[selectedIndex.value];
    if (item && item.action) {
      item.action();
    }
  }
};

const scrollItemIntoView = () => {
  nextTick(() => {
    const el = document.querySelector('.palette-item.active');
    if (el) {
      el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  });
};

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});
</script>

<template>
  <Transition name="palette-fade">
    <div v-if="isOpen" class="palette-backdrop" @click.self="emit('close')">
      <div class="palette-dialog" role="dialog" aria-modal="true" :dir="isRtl ? 'rtl' : 'ltr'">
        <!-- Search Input Bar -->
        <div class="palette-input-wrap">
          <span class="palette-search-icon">🔍</span>
          <input
            ref="inputRef"
            v-model="searchQuery"
            type="text"
            class="palette-input"
            :placeholder="t('cmdPlaceholder')"
            autocomplete="off"
            spellcheck="false"
          />
          <button v-if="searchQuery" @click="searchQuery = ''" class="clear-btn" title="پاک کردن">✕</button>
          <kbd class="esc-badge" @click="emit('close')">ESC</kbd>
        </div>

        <!-- Results List -->
        <div class="palette-results-list" role="listbox">
          <div v-if="filteredResults.length === 0" class="no-results-state">
            <span class="no-results-icon">🔎</span>
            <p>{{ t('cmdNoResults') }}</p>
          </div>

          <div
            v-for="(item, index) in filteredResults"
            :key="item.id"
            :class="['palette-item', { active: index === selectedIndex }]"
            @click="item.action()"
            @mouseenter="selectedIndex = index"
            role="option"
            :aria-selected="index === selectedIndex"
          >
            <div class="item-icon-box">{{ item.icon }}</div>
            <div class="item-content">
              <div class="item-top-row">
                <span class="item-title">{{ item.title }}</span>
                <span class="item-category-pill">{{ item.category }}</span>
              </div>
              <p v-if="item.subtitle" class="item-subtitle">{{ item.subtitle }}</p>
            </div>
            <span class="item-enter-hint" v-if="index === selectedIndex">↵</span>
          </div>
        </div>

        <!-- Footer / Keyboard Shortcuts -->
        <div class="palette-footer">
          <div class="footer-shortcuts">
            <span class="shortcut"><kbd>↑</kbd><kbd>↓</kbd> {{ isRtl ? 'ناوبری' : 'Navigate' }}</span>
            <span class="shortcut"><kbd>↵</kbd> {{ isRtl ? 'انتخاب' : 'Select' }}</span>
            <span class="shortcut"><kbd>ESC</kbd> {{ isRtl ? 'خروج' : 'Close' }}</span>
          </div>
          <span class="palette-brand">Damoon Command Suite</span>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.palette-backdrop {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 80px 16px 24px;
}

.palette-dialog {
  width: 100%;
  max-width: 640px;
  background: var(--item-bg, #ffffff);
  border: 1px solid var(--panel-border, #cbd5e1);
  border-radius: 18px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.28), 0 0 0 1px rgba(79, 70, 229, 0.15);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: paletteScale 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}

.palette-input-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid var(--panel-border, #e2e8f0);
  background: var(--bar-bg, #f8fafc);
}

.palette-search-icon {
  font-size: 1.15rem;
  opacity: 0.7;
}

.palette-input {
  flex: 1;
  background: transparent;
  border: none;
  font-size: 1.05rem;
  color: var(--text-main, #0f172a);
  outline: none;
  font-family: inherit;
}

.clear-btn {
  background: transparent;
  border: none;
  color: var(--text-soft, #64748b);
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.9rem;
}

.clear-btn:hover {
  background: var(--item-hover-bg, #f1f5f9);
}

.esc-badge {
  font-size: 0.68rem;
  font-weight: 700;
  padding: 3px 8px;
  background: var(--item-bg, #ffffff);
  border: 1px solid var(--panel-border, #cbd5e1);
  border-radius: 6px;
  color: var(--text-soft, #64748b);
  cursor: pointer;
}

.palette-results-list {
  max-height: 380px;
  overflow-y: auto;
  padding: 8px;
  scrollbar-width: thin;
}

.palette-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.15s ease;
  user-select: none;
}

.palette-item:hover,
.palette-item.active {
  background: rgba(79, 70, 229, 0.08);
  border-left: 3px solid var(--neon, #4f46e5);
}

[dir="rtl"] .palette-item.active {
  border-left: none;
  border-right: 3px solid var(--neon, #4f46e5);
}

.item-icon-box {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background: var(--bar-bg, #f1f5f9);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  flex-shrink: 0;
}

.item-content {
  flex: 1;
  min-width: 0;
}

.item-top-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.item-title {
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--text-main, #0f172a);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-category-pill {
  font-size: 0.68rem;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 6px;
  background: var(--panel-border, #e2e8f0);
  color: var(--text-secondary, #475569);
  flex-shrink: 0;
}

.item-subtitle {
  font-size: 0.78rem;
  color: var(--text-soft, #64748b);
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-enter-hint {
  font-size: 0.9rem;
  color: var(--neon, #4f46e5);
  font-weight: 800;
  padding-left: 6px;
}

[dir="rtl"] .item-enter-hint {
  padding-left: 0;
  padding-right: 6px;
}

.no-results-state {
  padding: 40px 16px;
  text-align: center;
  color: var(--text-soft, #64748b);
}

.no-results-icon {
  font-size: 2rem;
  display: block;
  margin-bottom: 8px;
  opacity: 0.6;
}

.palette-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  border-top: 1px solid var(--panel-border, #e2e8f0);
  background: var(--bar-bg, #f8fafc);
  font-size: 0.72rem;
  color: var(--text-soft, #64748b);
}

.footer-shortcuts {
  display: flex;
  gap: 12px;
}

.shortcut kbd {
  background: var(--item-bg, #ffffff);
  border: 1px solid var(--panel-border, #cbd5e1);
  border-radius: 4px;
  padding: 1px 4px;
  font-family: inherit;
  font-size: 0.7rem;
  margin-right: 2px;
}

[dir="rtl"] .shortcut kbd {
  margin-right: 0;
  margin-left: 2px;
}

.palette-brand {
  font-weight: 700;
  letter-spacing: 0.4px;
  opacity: 0.7;
}

@keyframes paletteScale {
  from {
    opacity: 0;
    transform: scale(0.96) translateY(-8px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.palette-fade-enter-active,
.palette-fade-leave-active {
  transition: opacity 0.2s ease;
}

.palette-fade-enter-from,
.palette-fade-leave-to {
  opacity: 0;
}

@media (max-width: 640px) {
  .palette-backdrop {
    padding: 12px;
    align-items: flex-start;
    padding-top: 10vh;
  }

  .palette-dialog {
    border-radius: 16px;
  }

  .palette-input-wrap {
    padding: 12px 14px;
    gap: 8px;
  }

  .palette-input {
    font-size: 0.96rem;
  }

  .palette-results-list {
    max-height: 52vh;
    padding: 6px;
  }

  .palette-item {
    padding: 8px 10px;
    gap: 10px;
  }

  .palette-footer {
    display: none;
  }
}
</style>

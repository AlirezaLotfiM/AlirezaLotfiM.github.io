<script setup>
import { computed, ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { usePortfolio } from '../../composables/usePortfolio';
import { useAudioSynth } from '../../composables/useAudioSynth';
import { useTheme } from '../../composables/useTheme';

const {
  projects,
  mySkills,
  profile,
  userGithub,
} = usePortfolio();

const { themes, setTheme, currentTheme } = useTheme();
const { isMuted, toggleMute, playClick, playKey, playThemeChirp } = useAudioSynth();

const props = defineProps({
  isZenMode: Boolean
});

const emit = defineEmits(['toggle-zen', 'open-terminal', 'toggle-matrix']);

const normalizeLinkedInUrl = (value) => {
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) return value;
  return `https://www.linkedin.com/in/${value.replace(/^\/?in\//, '')}`;
};

const normalizeTelegramUrl = (value) => {
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) return value;
  return `https://t.me/${value.replace(/^@/, '')}`;
};

// Command Palette & Suggestions State
const shellInputValue = ref('');
const shellInputRef = ref(null);
const activeSuggestionIndex = ref(0);
const shellLogs = ref([]);
const showOutputPanel = ref(false);
const activeConsoleView = ref('text');
const isFocused = ref(false);
const uptimeSeconds = computed(() => Math.floor(window.performance ? window.performance.now() / 1000 : 0));

const cmdHistory = ref([]);
const historyIndex = ref(-1);
const hasNavigatedSuggestions = ref(false);

const COMMANDS = ['help', 'whoami', 'skills', 'projects', 'ls', 'status', 'learning', 'contact', 'cls', 'clear', 'exit', 'theme', 'music', 'neofetch', 'zen', 'matrix'];

const suggestions = computed(() => {
  const rawInput = shellInputValue.value;
  
  if (!rawInput) {
    if (showOutputPanel.value) return [];
    return COMMANDS.map(cmd => ({
      type: 'command',
      value: cmd,
      label: cmd,
      desc: getCommandDesc(cmd)
    }));
  }

  const trimmed = rawInput.trim();
  const parts = trimmed.split(/\s+/);
  const mainPart = parts[0].toLowerCase();

  if (!COMMANDS.includes(mainPart)) {
    return COMMANDS.filter(cmd => cmd.includes(mainPart)).map(cmd => ({
      type: 'command',
      value: cmd,
      label: cmd,
      desc: getCommandDesc(cmd)
    }));
  }

  if (mainPart === 'theme') {
    const spaceIndex = rawInput.indexOf(' ');
    if (spaceIndex === -1) {
      return themes.map(t => ({
        type: 'theme',
        value: `theme ${t.id}`,
        label: t.id,
        desc: t.name
      }));
    } else {
      const subPart = rawInput.substring(spaceIndex + 1).trim().toLowerCase().replace(/[-\s]+/g, ' ');
      return themes
        .filter(t => {
          const idClean = t.id.toLowerCase().replace(/[-\s]+/g, ' ');
          const nameClean = t.name.toLowerCase().replace(/[-\s]+/g, ' ');
          return idClean.includes(subPart) || nameClean.includes(subPart);
        })
        .map(t => ({
          type: 'theme',
          value: `theme ${t.id}`,
          label: t.id,
          desc: t.name
        }));
    }
  }

  if (mainPart === 'music') {
    const spaceIndex = rawInput.indexOf(' ');
    const musicActions = [
      { id: 'play', desc: 'پخش موسیقی پس‌زمینه' },
      { id: 'pause', desc: 'توقف پخش موسیقی' },
      { id: 'next', desc: 'پخش آهنگ بعدی' },
      { id: 'toggle', desc: 'پخش / توقف موسیقی' }
    ];

    if (spaceIndex === -1) {
      return musicActions.map(a => ({
        type: 'music',
        value: `music ${a.id}`,
        label: a.id,
        desc: a.desc
      }));
    } else {
      const subPart = rawInput.substring(spaceIndex + 1).trim().toLowerCase();
      return musicActions
        .filter(a => a.id.includes(subPart) || a.desc.includes(subPart))
        .map(a => ({
          type: 'music',
          value: `music ${a.id}`,
          label: a.id,
          desc: a.desc
        }));
    }
  }

  return [];
});

const getCommandDesc = (cmd) => {
  const descs = {
    help: 'نمایش لیست دستورات ورودی',
    whoami: 'نمایش خلاصه مشخصات مهندس',
    skills: 'نمایش لیست مهارت‌ها و سطوح',
    projects: 'نمایش لیست پروژه‌ها',
    ls: 'نمایش پوشه پروژه‌ها',
    status: 'نمایش وضعیت تمرکز یادگیری جاری',
    learning: 'نمایش وضعیت آموزشی جاری',
    contact: 'نمایش راه‌های ارتباطی و آدرس‌ها',
    cls: 'پاک کردن نتایج خط فرمان',
    clear: 'پاک کردن نتایج خط فرمان',
    exit: 'بستن پنل فرمان',
    theme: 'تغییر رنگ تم کلی سایت',
    music: 'کنترل پخش موسیقی پس‌زمینه',
    neofetch: 'چاپ وضعیت سیستم با آرت سایبرپانک',
    zen: 'تغییر حالت تمرکز و پنهان‌سازی ستون‌ها',
    matrix: 'فعال / غیرفعال‌سازی افکت باران ماتریکس پس‌زمینه'
  };
  return descs[cmd] || '';
};

watch(suggestions, () => {
  activeSuggestionIndex.value = 0;
  hasNavigatedSuggestions.value = false;
});

watch(activeSuggestionIndex, () => {
  nextTick(() => {
    const container = document.querySelector('.palette-suggestions');
    if (!container) return;
    const activeEl = container.querySelector('.suggestion-item.active');
    if (!activeEl) return;

    const containerHeight = container.clientHeight;
    const containerTop = container.scrollTop;
    const containerBottom = containerTop + containerHeight;

    const elemTop = activeEl.offsetTop;
    const elemHeight = activeEl.offsetHeight;
    const elemBottom = elemTop + elemHeight;

    if (elemTop < containerTop) {
      container.scrollTop = elemTop;
    } else if (elemBottom > containerBottom) {
      container.scrollTop = elemBottom - containerHeight;
    }
  });
});

const closeTimer = ref(null);

const setAutoCloseTimer = () => {
  if (closeTimer.value) clearTimeout(closeTimer.value);
  closeTimer.value = setTimeout(() => {
    clearLogs();
  }, 8000); // 8 seconds auto-close
};

const resetAutoCloseTimer = () => {
  if (closeTimer.value) {
    clearTimeout(closeTimer.value);
    closeTimer.value = null;
  }
};

const onMouseLeavePalette = () => {
  if (showOutputPanel.value) {
    setAutoCloseTimer();
  }
};

const focusShellInput = () => {
  if (shellInputRef.value) {
    shellInputRef.value.focus();
  }
};

const addLog = (text, cls = '') => {
  shellLogs.value.push({ content: text, class: cls });
};

const clearLogs = () => {
  shellLogs.value = [];
  showOutputPanel.value = false;
  activeConsoleView.value = 'text';
  resetAutoCloseTimer();
};

const selectSuggestion = (sug) => {
  shellInputValue.value = sug.value;
  activeSuggestionIndex.value = 0;
  focusShellInput();
};

const dispatchMusic = (action) => {
  window.dispatchEvent(new CustomEvent('portfolio-music', { detail: { action } }));
  playClick();
};

const triggerThemeCLI = () => {
  shellInputValue.value = 'theme ';
  isFocused.value = true;
  focusShellInput();
  playClick();
};

const handleArrowUp = () => {
  if (cmdHistory.value.length === 0) return;
  if (historyIndex.value === -1) {
    historyIndex.value = cmdHistory.value.length - 1;
  } else if (historyIndex.value > 0) {
    historyIndex.value--;
  }
  shellInputValue.value = cmdHistory.value[historyIndex.value];
};

const handleArrowDown = () => {
  if (historyIndex.value === -1) return;
  if (historyIndex.value < cmdHistory.value.length - 1) {
    historyIndex.value++;
    shellInputValue.value = cmdHistory.value[historyIndex.value];
  } else {
    historyIndex.value = -1;
    shellInputValue.value = '';
  }
};

const handleShellKeydown = (e) => {
  if (e.key === 'ArrowDown') {
    if (e.ctrlKey) {
      e.preventDefault();
      handleArrowDown();
    } else if (isFocused.value && suggestions.value.length > 0 && !showOutputPanel.value) {
      e.preventDefault();
      activeSuggestionIndex.value = (activeSuggestionIndex.value + 1) % suggestions.value.length;
      hasNavigatedSuggestions.value = true;
    }
  }
  else if (e.key === 'ArrowUp') {
    if (e.ctrlKey) {
      e.preventDefault();
      handleArrowUp();
    } else if (isFocused.value && suggestions.value.length > 0 && !showOutputPanel.value) {
      e.preventDefault();
      activeSuggestionIndex.value = (activeSuggestionIndex.value - 1 + suggestions.value.length) % suggestions.value.length;
      hasNavigatedSuggestions.value = true;
    }
  }
  else if (e.key === 'Tab') {
    if (suggestions.value.length > 0) {
      e.preventDefault();
      const selected = suggestions.value[activeSuggestionIndex.value];
      if (selected) {
        const currentLower = shellInputValue.value.trim().toLowerCase();
        if ((currentLower === 'theme' || currentLower === 'music') && !shellInputValue.value.includes(' ')) {
          shellInputValue.value = currentLower + ' ';
        } else {
          shellInputValue.value = selected.value;
        }
        activeSuggestionIndex.value = 0;
        hasNavigatedSuggestions.value = false;
      }
    }
  }
  else if (e.key === 'Escape') {
    clearLogs();
  }
};

const handleShellEnter = () => {
  let rawCmd = shellInputValue.value.trim();

  if (isFocused.value && suggestions.value.length > 0 && !showOutputPanel.value) {
    const activeSug = suggestions.value[activeSuggestionIndex.value];
    if (activeSug) {
      const typedLower = shellInputValue.value.trim().toLowerCase();
      const isBaseCommandOnly = COMMANDS.includes(typedLower);
      const isThemeOrMusicBase = typedLower === 'theme' || typedLower === 'theme ' || typedLower === 'music' || typedLower === 'music ';

      if (hasNavigatedSuggestions.value || (!isBaseCommandOnly && !isThemeOrMusicBase) || !rawCmd) {
        rawCmd = activeSug.value;
      }
    }
  }

  if (!rawCmd) return;

  // Save to command history
  if (cmdHistory.value.length === 0 || cmdHistory.value[cmdHistory.value.length - 1] !== rawCmd) {
    cmdHistory.value.push(rawCmd);
  }
  historyIndex.value = -1;

  const cmdParts = rawCmd.split(/\s+/);
  const mainCmd = cmdParts[0].toLowerCase();

  shellLogs.value = [];
  addLog(`portfolio:~$ ${rawCmd}`, 'echo-row');
  activeConsoleView.value = 'text';

  if (mainCmd === 'help') {
    activeConsoleView.value = 'help';
    showOutputPanel.value = true;
  }
  else if (mainCmd === 'ls' || mainCmd === 'projects') {
    activeConsoleView.value = 'projects';
    showOutputPanel.value = true;
  }
  else if (mainCmd === 'skills') {
    activeConsoleView.value = 'skills';
    showOutputPanel.value = true;
  }
  else if (mainCmd === 'contact') {
    activeConsoleView.value = 'contact';
    showOutputPanel.value = true;
  }
  else if (mainCmd === 'status' || mainCmd === 'learning') {
    activeConsoleView.value = 'status';
    showOutputPanel.value = true;
  }
  else if (mainCmd === 'whoami') {
    addLog(`User:  ${profile.value.name || 'Alireza'}`, 'os-ok');
    addLog(`Role:  ${profile.value.role || 'Developer'}`, 'os-ok');
    if (profile.value.bio) addLog(`Bio:   ${profile.value.bio}`, 'os-dim');
    addLog('Access Level: Root/Admin', 'os-dim');
    activeConsoleView.value = 'text';
    showOutputPanel.value = true;
  }
  else if (mainCmd === 'theme') {
    if (cmdParts.length === 1) {
      activeConsoleView.value = 'theme';
      showOutputPanel.value = true;
    } else {
      const query = cmdParts.slice(1).join(' ').toLowerCase().replace(/[-\s]+/g, ' ');
      const matches = themes.filter(t => {
        const idClean = t.id.toLowerCase().replace(/[-\s]+/g, ' ');
        const nameClean = t.name.toLowerCase().replace(/[-\s]+/g, ' ');
        return idClean.includes(query) || nameClean.includes(query);
      });

      if (matches.length > 0) {
        let selected = matches.find(t => 
          t.id.toLowerCase().replace(/[-\s]+/g, ' ') === query ||
          t.name.toLowerCase().replace(/[-\s]+/g, ' ') === query
        );
        if (!selected) {
          selected = matches[0];
        }
        setTheme(selected.id);
        playThemeChirp();
        addLog(`Theme successfully changed to: ${selected.name}`, 'os-ok');
        if (matches.length > 1) {
          const otherNames = matches.filter(m => m.id !== selected.id).map(m => m.id).join(', ');
          addLog(`Other matches: ${otherNames}`, 'os-dim');
        }
      } else {
        addLog(`Theme matching '${cmdParts.slice(1).join(' ')}' not found. Select a theme from the panel below or type 'theme <id>'.`, 'os-bad');
      }
      activeConsoleView.value = 'text';
      showOutputPanel.value = true;
    }
  }
  else if (mainCmd === 'music') {
    if (cmdParts.length === 1) {
      activeConsoleView.value = 'music';
      showOutputPanel.value = true;
    } else {
      const action = cmdParts[1].toLowerCase();
      if (['play', 'pause', 'next', 'toggle'].includes(action)) {
        window.dispatchEvent(new CustomEvent('portfolio-music', { detail: { action } }));
        playClick();
        addLog(`Sent music command: ${action}`, 'os-ok');
      } else {
        addLog(`Unknown music action '${action}'. Actions: play, pause, next, toggle.`, 'os-bad');
      }
      activeConsoleView.value = 'text';
      showOutputPanel.value = true;
    }
  }
  else if (mainCmd === 'neofetch') {
    activeConsoleView.value = 'neofetch';
    showOutputPanel.value = true;
  }
  else if (mainCmd === 'zen') {
    emit('toggle-zen');
    playClick();
    addLog('Toggled Zen focus mode.', 'os-ok');
    activeConsoleView.value = 'text';
    showOutputPanel.value = true;
  }
  else if (mainCmd === 'matrix') {
    emit('toggle-matrix');
    playClick();
    addLog('Toggled Matrix Rain background effect.', 'os-ok');
    activeConsoleView.value = 'text';
    showOutputPanel.value = true;
  }
  else if (mainCmd === 'clear' || mainCmd === 'cls') {
    clearLogs();
  }
  else if (mainCmd === 'exit') {
    clearLogs();
    if (props.isZenMode) {
      emit('toggle-zen');
    }
  }
  else {
    addLog(`'${rawCmd}' is not recognized as a command. Type 'help' to see list.`, 'os-bad');
    activeConsoleView.value = 'text';
    showOutputPanel.value = true;
  }

  shellInputValue.value = '';
  activeSuggestionIndex.value = 0;

  if (showOutputPanel.value) {
    setAutoCloseTimer();
  } else {
    resetAutoCloseTimer();
  }
};

const shellBarRef = ref(null);

const dropdownStyle = computed(() => {
  if (!shellBarRef.value) return {};
  const rect = shellBarRef.value.getBoundingClientRect();
  return {
    position: 'fixed',
    top: `${rect.bottom + 4}px`,
    left: `${rect.left + 16}px`,
    width: `${rect.width - 32}px`,
    zIndex: 9999,
  };
});

const handleClickOutside = (e) => {
  const container = document.querySelector('.global-command-container');
  const palette = document.querySelector('.shell-palette-teleported');
  if (container && container.contains(e.target)) return;
  if (palette && palette.contains(e.target)) return;
  clearLogs();
  isFocused.value = false;
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  resetAutoCloseTimer();
});
</script>

<template>
  <div class="global-command-container" :class="{ hidden: isZenMode }">
    <div class="command-shell" ref="shellBarRef" dir="ltr" @click="focusShellInput">
      <span class="prompt mono-ui">alireza@portfolio:~$</span>
      <!-- Editable Command Input -->
      <input 
        ref="shellInputRef"
        v-model="shellInputValue"
        @keydown.enter="handleShellEnter"
        @keydown="playKey(); handleShellKeydown($event)"
        @focus="isFocused = true"
        type="text"
        class="shell-input mono-ui"
        placeholder="دستوری وارد کنید..."
        spellcheck="false"
        autocomplete="off"
      />
      <div class="shell-actions" @click.stop>
        <!-- Audio Toggle -->
        <button class="icon-btn audio-btn" type="button" @click="toggleMute(); playClick()" :title="isMuted ? 'فعال‌سازی صدا' : 'قطع صدا'">
          {{ isMuted ? '🔇' : '🔊' }}
        </button>
        
        <!-- Theme Switcher CLI Trigger -->
        <button class="icon-btn theme-btn" type="button" @click="triggerThemeCLI" title="تغییر تم (theme)">
          🎨
        </button>

        <!-- Zen Mode Toggle -->
        <button class="command-shortcut mono-ui" type="button" @click="playClick(); emit('toggle-zen')" :title="isZenMode ? 'خروج از حالت تمرکز (Ctrl + Z)' : 'حالت تمرکز (Ctrl + Z)'">
          {{ isZenMode ? 'Normal' : 'Zen' }}
        </button>

        <!-- Terminal Modal Trigger -->
        <button class="command-shortcut mono-ui" type="button" @click="playClick(); emit('open-terminal')" title="باز کردن ترمینال (Ctrl + K)">
          Terminal
        </button>
      </div>
    </div>

    <!-- Command Palette Dropdown Panel (Teleported to body to escape overflow:hidden) -->
    <Teleport to="body">
      <div 
        v-if="(isFocused && suggestions.length > 0) || showOutputPanel" 
        class="shell-palette glass-panel shell-palette-teleported" 
        dir="ltr"
        :style="dropdownStyle"
        @mouseenter="resetAutoCloseTimer"
        @mouseleave="onMouseLeavePalette"
      >
      <!-- SUGGESTIONS LIST -->
      <div v-if="isFocused && suggestions.length > 0" class="palette-suggestions" @mousedown.prevent>
        <div 
          v-for="(sug, index) in suggestions" 
          :key="sug.value" 
          @click="selectSuggestion(sug)"
          class="suggestion-item"
          :class="{ active: index === activeSuggestionIndex }"
        >
          <span class="sug-label">{{ sug.label }}</span>
          <span class="sug-desc">{{ sug.desc }}</span>
        </div>
      </div>

      <!-- OUTPUT LOGS LIST / CUSTOM INTERACTIVE UI -->
      <div v-if="showOutputPanel && !(isFocused && suggestions.length > 0)" class="palette-console">
        <div class="console-header">
          <span class="console-title mono-ui">> {{ activeConsoleView.toUpperCase() }} OUTPUT</span>
          <button class="console-clear-btn" @click="clearLogs">✕ Close</button>
        </div>

        <div class="console-content scroll-area">
          <!-- 1. CUSTOM VIEW: THEME -->
          <div v-if="activeConsoleView === 'theme'" class="custom-view-theme">
            <p class="view-intro">انتخاب تم سیستم:</p>
            <div class="theme-grid">
              <button 
                v-for="t in themes" 
                :key="t.id" 
                @click="setTheme(t.id); playThemeChirp()"
                class="theme-card"
                :class="{ active: currentTheme.id === t.id }"
              >
                <span class="theme-color-dot" :style="{ backgroundColor: t.colors['--neon'], color: t.colors['--neon'] }"></span>
                <div class="theme-card-info">
                  <span class="theme-card-name">{{ t.name }}</span>
                  <span class="theme-card-id">{{ t.id }}</span>
                </div>
                <span v-if="currentTheme.id === t.id" class="active-badge">✓ Active</span>
              </button>
            </div>
          </div>

          <!-- 2. CUSTOM VIEW: MUSIC -->
          <div v-else-if="activeConsoleView === 'music'" class="custom-view-music">
            <p class="view-intro">کنترل پخش موسیقی پس‌زمینه:</p>
            <div class="music-console-controls">
              <button @click="dispatchMusic('play')" class="music-btn">▶ Play</button>
              <button @click="dispatchMusic('pause')" class="music-btn">⏸ Pause</button>
              <button @click="dispatchMusic('next')" class="music-btn">⏭ Next</button>
              <button @click="dispatchMusic('toggle')" class="music-btn">🔄 Toggle</button>
            </div>
          </div>

          <!-- 3. CUSTOM VIEW: SKILLS -->
          <div v-else-if="activeConsoleView === 'skills'" class="custom-view-skills">
            <p class="view-intro">لیست مهارت‌های فنی:</p>
            <div class="skills-grid">
              <div v-for="s in mySkills" :key="s.name" class="skill-progress-card">
                <div class="skill-header">
                  <span class="skill-name">{{ s.name }}</span>
                  <span class="skill-level">{{ s.level }}%</span>
                </div>
                <div class="progress-bar-bg">
                  <div class="progress-bar-fill" :style="{ width: s.level + '%', backgroundColor: 'var(--neon)' }"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- 4. CUSTOM VIEW: PROJECTS -->
          <div v-else-if="activeConsoleView === 'projects'" class="custom-view-projects">
            <p class="view-intro">لیست پروژه‌های توسعه داده شده:</p>
            <div class="projects-list-grid">
              <div v-for="p in projects" :key="p.id" class="project-list-card">
                <div class="proj-header">
                  <span class="proj-name">{{ p.name }}</span>
                  <span class="proj-lang">{{ p.language }}</span>
                </div>
                <p class="proj-desc">{{ p.description }}</p>
                <div class="proj-footer">
                  <span class="proj-role">{{ p.role }}</span>
                  <span class="proj-status" :class="p.status.toLowerCase()">{{ p.status }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 5. CUSTOM VIEW: CONTACT -->
          <div v-else-if="activeConsoleView === 'contact'" class="custom-view-contact">
            <p class="view-intro">راه‌های ارتباطی با مهندس:</p>
            <div class="contact-cards-grid">
              <a v-if="profile.contact?.email" :href="'mailto:' + profile.contact.email" class="contact-card-link">
                <span class="contact-icon">📧</span>
                <div class="contact-details">
                  <span class="contact-title">ایمیل</span>
                  <span class="contact-val">{{ profile.contact.email }}</span>
                </div>
              </a>
              <a v-if="profile.contact?.linkedin" :href="normalizeLinkedInUrl(profile.contact.linkedin)" target="_blank" rel="noopener noreferrer" class="contact-card-link">
                <span class="contact-icon">🔗</span>
                <div class="contact-details">
                  <span class="contact-title">لینکدین</span>
                  <span class="contact-val">{{ profile.contact.linkedin }}</span>
                </div>
              </a>
              <a v-if="userGithub" :href="'https://github.com/' + userGithub" target="_blank" rel="noopener noreferrer" class="contact-card-link">
                <span class="contact-icon">🐙</span>
                <div class="contact-details">
                  <span class="contact-title">گیت‌هاب</span>
                  <span class="contact-val">@{{ userGithub }}</span>
                </div>
              </a>
              <a v-if="profile.contact?.telegramId" :href="normalizeTelegramUrl(profile.contact.telegramId)" target="_blank" rel="noopener noreferrer" class="contact-card-link">
                <span class="contact-icon">✈️</span>
                <div class="contact-details">
                  <span class="contact-title">تلگرام</span>
                  <span class="contact-val">{{ profile.contact.telegramId }}</span>
                </div>
              </a>
            </div>
          </div>

          <!-- 6. CUSTOM VIEW: STATUS -->
          <div v-else-if="activeConsoleView === 'status'" class="custom-view-status">
            <p class="view-intro">وضعیت تمرکز و یادگیری جاری:</p>
            <div class="status-cards">
              <div class="status-card-item">
                <span class="card-icon">🎯</span>
                <div class="card-text">
                  <span class="card-label">حوزه تمرکز جاری</span>
                  <span class="card-value">{{ profile.learning?.focus || 'توسعه پلتفرم' }}</span>
                </div>
              </div>
              <div class="status-card-item">
                <span class="card-icon">📖</span>
                <div class="card-text">
                  <span class="card-label">در حال مطالعه</span>
                  <span class="card-value">{{ profile.learning?.reading || 'طراحی سیستم‌ها' }}</span>
                </div>
              </div>
              <div class="status-card-item">
                <span class="card-icon">⚡</span>
                <div class="card-text">
                  <span class="card-label">حالت اتمسفر</span>
                  <span class="card-value">کوشا و متمرکز 🚀</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 7. CUSTOM VIEW: HELP -->
          <div v-else-if="activeConsoleView === 'help'" class="custom-view-help">
            <p class="view-intro">لیست دستورات خط فرمان یک‌خطی:</p>
            <div class="help-commands-grid">
              <div 
                v-for="cmd in COMMANDS" 
                :key="cmd" 
                @click="shellInputValue = cmd; focusShellInput()"
                class="help-cmd-item"
              >
                <span class="help-cmd-name">{{ cmd }}</span>
                <span class="help-cmd-desc">{{ getCommandDesc(cmd) }}</span>
              </div>
            </div>
          </div>

          <!-- 8. CUSTOM VIEW: NEOFETCH -->
          <div v-else-if="activeConsoleView === 'neofetch'" class="custom-view-neofetch">
            <div class="neofetch-layout">
              <div class="neofetch-ascii">
                <pre>
██████████████████████
██████████████████████
████   ████   ████   █
████   ████   ████   █
████   ████   ████   █
██████████████████████
██████████████████████
████   ████   ████   █
████   ████   ████   █
                </pre>
              </div>
              <div class="neofetch-info">
                <h3 class="neofetch-user">{{ profile.name || 'Alireza Lotfi Moghaddam' }}</h3>
                <div class="neofetch-divider"></div>
                <div class="neofetch-row"><span class="nf-label">OS:</span> <span class="nf-val">Damoon CyberOS v1.6.0</span></div>
                <div class="neofetch-row"><span class="nf-label">Host:</span> <span class="nf-val">Vite + Vue 3 Single Page Application</span></div>
                <div class="neofetch-row"><span class="nf-label">Uptime:</span> <span class="nf-val">{{ uptimeSeconds }} seconds</span></div>
                <div class="neofetch-row"><span class="nf-label">Shell:</span> <span class="nf-val">Damoon Command Palette</span></div>
                <div class="neofetch-row"><span class="nf-label">Theme:</span> <span class="nf-val">{{ currentTheme.name }}</span></div>
                <div class="neofetch-row"><span class="nf-label">Audio Synth:</span> <span class="nf-val">{{ isMuted ? 'Muted 🔇' : 'Synthesizing 🔊' }}</span></div>
                <div class="neofetch-row"><span class="nf-label">GitHub:</span> <span class="nf-val">github.com/{{ userGithub }}</span></div>
              </div>
            </div>
          </div>

          <!-- 9. FALLBACK VIEW: TEXT LOGS -->
          <div v-else class="console-logs">
            <div v-for="(log, index) in shellLogs" :key="index" :class="['console-line', log.class]">
              {{ log.content }}
            </div>
          </div>
        </div>
      </div>
    </div>
    </Teleport>
  </div>
</template>

<style scoped>
.global-command-container {
  position: relative;
  width: 100%;
  flex-shrink: 0;
  z-index: 200;
}

.global-command-container.hidden {
  display: none !important;
}

.command-shell {
  padding: 14px 18px;
  border-radius: 16px;
  border: 1px solid var(--panel-border);
  background: var(--panel-bg);
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05);
  overflow: hidden;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  transition: all 0.3s ease;
  cursor: text;
}

.command-shell:focus-within {
  border-color: var(--neon);
  box-shadow: 0 0 20px rgba(var(--neon-rgb), 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.05);
  background: var(--glass-panel-base);
}

.prompt {
  color: var(--accent-strong);
  white-space: nowrap;
}

.shell-input {
  flex: 1;
  min-width: 0;
  background: transparent;
  border: none;
  color: var(--text-main);
  outline: none;
  font-size: 0.85rem;
  padding: 0;
  width: 100%;
}

.shell-input::placeholder {
  color: var(--text-soft);
  opacity: 0.5;
}

.shell-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.icon-btn {
  background: transparent;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  padding: 4px;
  border-radius: 8px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-btn:hover {
  background: var(--item-hover-bg);
}

.audio-btn {
  font-size: 0.95rem;
}

.command-shortcut {
  flex-shrink: 0;
  border: 1px solid var(--panel-border);
  background: var(--item-bg);
  color: var(--text-soft);
  border-radius: 10px;
  padding: 6px 10px;
  font-size: 0.72rem;
  cursor: pointer;
  transition: all 0.2s;
}

.command-shortcut:hover {
  border-color: var(--neon);
  color: var(--text-main);
}

.shell-palette {
  position: absolute;
  z-index: 250;
  margin-top: 6px;
  background: var(--glass-panel-base, rgba(15, 20, 30, 0.95));
  backdrop-filter: blur(24px) saturate(200%);
  -webkit-backdrop-filter: blur(24px) saturate(200%);
  border: 1px solid var(--panel-border);
  border-radius: 18px;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.25), 
              0 0 30px rgba(var(--neon-rgb), 0.15),
              inset 0 1px 0 rgba(255, 255, 255, 0.1);
  overflow: hidden;
  animation: slideDown 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  flex-direction: column;
  height: fit-content;
  max-height: 55vh;
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}

.palette-suggestions {
  flex: 1;
  min-height: 0;
  max-height: none;
  overflow-y: auto;
  padding: 10px;
}

.suggestion-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid transparent;
}

.suggestion-item:hover,
.suggestion-item.active {
  background: linear-gradient(90deg, rgba(var(--neon-rgb), 0.15), rgba(var(--neon-rgb), 0.05));
  border-color: rgba(var(--neon-rgb), 0.4);
  box-shadow: 0 4px 15px rgba(var(--neon-rgb), 0.15);
  transform: translateX(4px);
}

.sug-label {
  font-family: var(--mono-font, monospace);
  font-size: 0.85rem;
  color: var(--neon);
  font-weight: 600;
}

.sug-desc {
  font-size: 0.76rem;
  color: var(--text-soft);
  text-align: right;
}

.palette-console {
  border-top: 1px solid var(--panel-border);
  background: rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  max-height: none;
}

.console-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  background: rgba(0, 0, 0, 0.12);
  border-bottom: 1px solid var(--panel-border);
}

.console-title {
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 1px;
  color: var(--text-soft);
}

.console-clear-btn {
  background: transparent;
  border: none;
  color: var(--text-soft);
  font-size: 0.72rem;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: all 0.2s;
}

.console-clear-btn:hover {
  color: var(--text-main);
  background: var(--item-hover-bg);
}

.console-content {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 12px 14px;
}

.view-intro {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-top: 0;
  margin-bottom: 14px;
  text-align: right;
  font-family: inherit;
}

/* Theme View */
.theme-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 10px;
}

.theme-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.25s ease;
  position: relative;
  text-align: left;
}

.theme-card:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.12);
  transform: translateY(-1px);
}

.theme-card.active {
  border-color: var(--neon);
  background: rgba(var(--neon-rgb), 0.06);
  box-shadow: 0 4px 12px rgba(var(--neon-rgb), 0.05);
}

.theme-color-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
  box-shadow: 0 0 8px currentColor;
}

.theme-card-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.theme-card-name {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--text-main);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.theme-card-id {
  font-size: 0.64rem;
  color: var(--text-soft);
  font-family: var(--mono-font, monospace);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.active-badge {
  font-size: 0.65rem;
  font-weight: 600;
  color: var(--neon);
  margin-left: auto;
}

/* Music View */
.music-console-controls {
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
  padding: 10px 0;
}

.music-btn {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: var(--text-main);
  padding: 8px 16px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.8rem;
  min-width: 80px;
}

.music-btn:hover {
  background: var(--neon);
  color: #000;
  border-color: var(--neon);
  box-shadow: 0 0 10px rgba(var(--neon-rgb), 0.3);
}

/* Skills View */
.skills-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
}

.skill-progress-card {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 12px;
}

.skill-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.skill-name {
  font-size: 0.78rem;
  font-weight: 500;
  color: var(--text-main);
}

.skill-level {
  font-size: 0.76rem;
  font-family: var(--mono-font, monospace);
  color: var(--neon);
}

.progress-bar-bg {
  height: 6px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 3px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.8s ease;
}

/* Projects View */
.projects-list-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.project-list-card {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 14px;
  text-align: right;
}

.proj-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
  flex-direction: row-reverse;
}

.proj-name {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--text-main);
}

.proj-lang {
  font-size: 0.72rem;
  font-family: var(--mono-font, monospace);
  color: var(--neon);
  background: rgba(var(--neon-rgb), 0.08);
  padding: 2px 8px;
  border-radius: 6px;
  border: 1px solid rgba(var(--neon-rgb), 0.15);
}

.proj-desc {
  font-size: 0.78rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 8px 0;
}

.proj-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  border-top: 1px dashed rgba(255, 255, 255, 0.04);
  padding-top: 8px;
  flex-direction: row-reverse;
}

.proj-role {
  font-size: 0.72rem;
  color: var(--text-soft);
}

.proj-status {
  font-size: 0.68rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.proj-status.shipping { color: #f59e0b; }
.proj-status.stable { color: #10b981; }
.proj-status.live { color: #3b82f6; }
.proj-status.maintained { color: #8b5cf6; }

/* Contact View */
.contact-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}

.contact-card-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  text-decoration: none;
  transition: all 0.25s;
}

.contact-card-link:hover {
  background: rgba(var(--neon-rgb), 0.06);
  border-color: var(--neon);
  transform: translateY(-2px);
}

.contact-icon {
  font-size: 1.4rem;
  flex-shrink: 0;
}

.contact-details {
  display: flex;
  flex-direction: column;
  text-align: left;
}

.contact-title {
  font-size: 0.64rem;
  color: var(--text-soft);
}

.contact-val {
  font-size: 0.76rem;
  color: var(--text-main);
  font-family: var(--mono-font, monospace);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Status View */
.status-cards {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.status-card-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  flex-direction: row-reverse;
  text-align: right;
}

.card-icon {
  font-size: 1.3rem;
}

.card-text {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.card-label {
  font-size: 0.68rem;
  color: var(--text-soft);
  margin-bottom: 2px;
}

.card-value {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--text-main);
}

/* Help View */
.help-commands-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 10px;
}

.help-cmd-item {
  display: flex;
  flex-direction: column;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.help-cmd-item:hover {
  background: rgba(var(--neon-rgb), 0.08);
  border-color: var(--neon);
  transform: translateY(-1px);
}

.help-cmd-name {
  font-family: var(--mono-font, monospace);
  font-size: 0.78rem;
  color: var(--neon);
  font-weight: 600;
  margin-bottom: 4px;
}

.help-cmd-desc {
  font-size: 0.68rem;
  color: var(--text-soft);
  line-height: 1.4;
}

/* Neofetch View */
.neofetch-layout {
  display: flex;
  gap: 20px;
  align-items: center;
}

.neofetch-ascii pre {
  margin: 0;
  color: var(--neon);
  font-family: var(--mono-font, monospace);
  font-size: 0.7rem;
  line-height: 1.1;
  text-shadow: 0 0 10px rgba(var(--neon-rgb), 0.3);
}

.neofetch-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  text-align: left;
}

.neofetch-user {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-main);
  margin: 0 0 4px;
}

.neofetch-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.15);
  margin-bottom: 8px;
}

.neofetch-row {
  font-size: 0.76rem;
  font-family: var(--mono-font, monospace);
  margin-bottom: 3px;
}

.nf-label {
  color: var(--neon);
  font-weight: 600;
}

.nf-val {
  color: var(--text-main);
}

/* Standard Console Logs */
.console-logs {
  font-family: var(--mono-font, monospace);
  font-size: 0.8rem;
  line-height: 1.6;
  text-align: left;
}

.console-line {
  margin-bottom: 6px;
  white-space: pre-wrap;
  word-break: break-all;
  color: var(--text-main);
}

.console-line.echo-row {
  color: var(--accent-strong);
  font-weight: 600;
  border-bottom: 1px dashed rgba(255, 255, 255, 0.05);
  padding-bottom: 4px;
  margin-bottom: 8px;
}

.console-line.os-dim {
  color: var(--text-soft);
  opacity: 0.8;
}

.console-line.os-warn {
  color: #f59e0b; /* Amber */
  text-shadow: 0 0 8px rgba(245, 158, 11, 0.3);
}

.console-line.os-ok {
  color: #10b981; /* Emerald */
  text-shadow: 0 0 8px rgba(16, 185, 129, 0.3);
}

.console-line.os-bad {
  color: #ef4444; /* Red */
  text-shadow: 0 0 8px rgba(239, 68, 68, 0.3);
}

/* Responsive Overrides */
@media (max-width: 1024px) {
  .global-command-container {
    padding: 0 14px;
    box-sizing: border-box;
    margin-bottom: 12px;
  }
  .command-shell {
    font-size: 0.74rem;
    padding: 11px 12px;
    gap: 8px;
    flex-wrap: wrap;
    align-items: flex-start;
  }
}

@media (max-width: 640px) {
  .global-command-container {
    padding: 0 12px;
    margin-bottom: 10px;
  }
  .command-shell {
    padding: 10px 11px;
  }
  .prompt,
  .shell-input,
  .command-shortcut {
    font-size: 0.7rem;
  }
  .neofetch-layout {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>

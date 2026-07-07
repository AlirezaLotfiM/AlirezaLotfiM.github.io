<script setup>
import { ref, nextTick, watch, onMounted } from 'vue';
import { useTheme } from '../composables/useTheme';
import { useAudioSynth } from '../composables/useAudioSynth';

const { playKey, playThemeChirp, playClick, isMuted } = useAudioSynth();

// دریافت اطلاعات از والد (App.vue)
const props = defineProps({
  visible: Boolean,
  initialCommand: String,
  projects: Array,
  skills: Array,      // لیست مهارت‌ها
  contact: Object,    // آبجکت اطلاعات تماس
  learning: Object,   // وضعیت یادگیری
  version: String,    // ورژن اپلیکیشن
  username: String,   // نام کاربر (Damoon)
  role: String        // عنوان شغلی
});

const emit = defineEmits(['close', 'toggle-matrix']);

const inputRef = ref(null);
const inputValue = ref('');
const history = ref([]);

const { themes, setTheme, currentTheme } = useTheme();

const COMMANDS = ['help', 'whoami', 'skills', 'projects', 'ls', 'status', 'learning', 'contact', 'cls', 'clear', 'exit', 'theme', 'music', 'neofetch', 'matrix'];

// Command history
const cmdHistory = ref([]);
const historyIndex = ref(-1);

// تابع اولیه برای پر کردن تاریخچه با اطلاعات دینامیک
const initTerminal = () => {
  history.value = [
    { type: 'output', content: `Damoon OS [Version ${props.version}]` },
    { type: 'output', content: '(c) Alireza Lotfi Moghaddam. All rights reserved.' },
    { type: 'empty' },
    { type: 'ascii', content: `
  ____    _    __  __  ___   ___  _   _ 
  |  _ \\  / \\  |  \\/  |/ _ \\ / _ \\| \\ | |
  | | | |/ _ \\ | |\\/| | | | | | | |  \\| |
  | |_| / ___ \\| |  | | |_| | |_| | |\\  |
  |____/_/   \\_\\_|  |_|\\___/ \\___/|_| \\_|
  ` },
    { type: 'output', content: `Welcome back, ${props.username || 'User'}.` },
    { type: 'output', content: "Type 'help' to see available commands." },
    { type: 'empty' },
  ];
};

const focusInput = () => {
  nextTick(() => {
    if (inputRef.value) inputRef.value.focus();
  });
};

watch(() => props.visible, (val) => {
  if (val) {
    initTerminal(); // ریست کردن ترمینال موقع باز شدن
    if (props.initialCommand) {
      inputValue.value = props.initialCommand;
      setTimeout(() => {
        handleCommand();
      }, 250);
    } else {
      focusInput();
    }
  }
});

const handleCommand = () => {
  const rawCmd = inputValue.value;
  const cmd = rawCmd.trim();
  const cmdLower = cmd.toLowerCase();
  
  if (rawCmd) {
    history.value.push({ type: 'command', content: rawCmd });
    if (cmdHistory.value.length === 0 || cmdHistory.value[cmdHistory.value.length - 1] !== rawCmd) {
      cmdHistory.value.push(rawCmd);
    }
    historyIndex.value = -1;
  }

  const cmdParts = cmdLower.split(/\s+/);
  const mainCmd = cmdParts[0];

  // --- دستورات ---
  if (mainCmd === 'help') {
    addLog('Available Commands:', 'os-dim');
    addLog('  whoami    - Display user profile');
    addLog('  skills    - List technical skills');
    addLog('  projects  - List projects (ls)');
    addLog('  status    - Current focus & learning');
    addLog('  contact   - Show contact info');
    addLog('  theme     - View/change dynamic theme');
    addLog('  music     - Control digital audio widget');
    addLog('  neofetch  - Print system environment statistics');
    addLog('  matrix    - Toggle Matrix Rain background effect');
    addLog('  cls       - Clear terminal');
    addLog('  exit      - Close terminal');
  } 
  else if (mainCmd === 'ls' || mainCmd === 'projects') {
    addLog('Scanning projects directory...', 'os-dim');
    addLog('');
    if (props.projects && props.projects.length) {
      props.projects.forEach(p => {
        addLog(`<DIR>    ${p.name}`, 'os-line');
      });
    } else {
      addLog('No projects found.', 'os-bad');
    }
    addLog('         MyResume.pdf');
    addLog('');
  } 
  else if (mainCmd === 'skills') {
    addLog('--- LOADED SKILLS ---', 'os-warn');
    if (props.skills && props.skills.length) {
      props.skills.forEach(s => {
        addLog(`[+] ${s.name.padEnd(20)} ${s.level}%`, 'os-ok');
      });
    } else {
      addLog('No skills data loaded.', 'os-bad');
    }
  }
  else if (mainCmd === 'contact') {
    addLog('--- CONTACT CHANNELS ---', 'os-warn');
    if (props.contact) {
      if (props.contact.email) addLog(`Email:    ${props.contact.email}`);
      if (props.contact.linkedin) addLog(`LinkedIn: ${props.contact.linkedin}`);
      if (props.contact.github) addLog(`GitHub:   github.com/${props.contact.github}`);
      if (props.contact.telegram) addLog(`Telegram: ${props.contact.telegram}`);
    }
  }
  else if (mainCmd === 'status' || mainCmd === 'learning') {
    addLog('--- CURRENT FOCUS ---', 'os-warn');
    if (props.learning) {
      if (props.learning.focus) addLog(`Focus:   ${props.learning.focus}`, 'os-ok');
      if (props.learning.reading) addLog(`Reading: ${props.learning.reading}`, 'os-ok');
    } else {
      addLog('No status data.', 'os-dim');
    }
    addLog('Mood:    Productive 🚀', 'os-dim');
  }
  else if (mainCmd === 'whoami') {
    addLog(`User:  ${props.username || 'Unknown'}`, 'os-ok');
    addLog(`Role:  ${props.role || 'Developer'}`, 'os-ok');
    addLog('Access Level: Root/Admin', 'os-dim');
  } 
  else if (mainCmd === 'theme') {
    if (cmdParts.length === 1) {
      addLog('--- THEME SYSTEM ---', 'os-warn');
      addLog(`Current Theme: ${currentTheme.value.name} [ID: ${currentTheme.value.id}]`, 'os-ok');
      addLog('Available Themes:', 'os-dim');
      themes.forEach(t => {
        addLog(`  ${t.id.padEnd(20)} - ${t.name}`);
      });
      addLog('');
      addLog("Usage: theme [theme-id]", 'os-dim');
    } else {
      const query = cmdParts.slice(1).join(' ').replace(/[-\s]+/g, ' ');
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
        const queryOriginal = rawCmd.split(/\s+/).slice(1).join(' ');
        addLog(`Theme matching '${queryOriginal}' not found. Type 'theme' to see all theme IDs.`, 'os-bad');
      }
    }
  }
  else if (mainCmd === 'music') {
    if (cmdParts.length === 1) {
      addLog('--- MUSIC PLAYER ---', 'os-warn');
      addLog('Usage: music [play|pause|next|toggle]', 'os-dim');
      addLog('Controls the background digital audio widget.', 'os-dim');
    } else {
      const action = cmdParts[1];
      if (['play', 'pause', 'next', 'toggle'].includes(action)) {
        window.dispatchEvent(new CustomEvent('portfolio-music', { detail: { action } }));
        addLog(`Sent music command: ${action}`, 'os-ok');
      } else {
        addLog(`Unknown music action '${action}'. Actions: play, pause, next, toggle.`, 'os-bad');
      }
    }
  }
  else if (mainCmd === 'neofetch') {
    addLog('--- SYSTEM ENVIRONMENT ---', 'os-warn');
    addLog('██████████████████████  User:    Alireza Lotfi Moghaddam');
    addLog('██████████████████████  OS:      Damoon CyberOS v1.6.0');
    addLog('████   ████   ████   █  Host:    Vite + Vue 3 Single Page Application');
    addLog('████   ████   ████   █  Kernel:  Web Audio / WebGL Core');
    addLog('████   ████   ████   █  Uptime:  ' + Math.floor(performance.now() / 1000) + ' seconds');
    addLog('██████████████████████  Shell:   Damoon Interactive CLI');
    addLog('██████████████████████  Theme:   ' + currentTheme.value.name);
    addLog('████   ████   ████   █  GitHub:  github.com/AlirezaLotfiM');
    addLog('████   ████   ████   █  Status:  Muted=' + isMuted.value);
  }
  else if (mainCmd === 'matrix') {
    emit('toggle-matrix');
    playClick();
    addLog('Toggled Matrix Rain background effect.', 'os-ok');
  }
  else if (mainCmd === 'clear' || mainCmd === 'cls') {
    history.value = [];
  }
  else if (mainCmd === 'exit') {
    emit('close');
  } 
  else if (cmd !== '') {
    addLog(`'${cmd}' is not recognized as a command.`, 'os-bad');
  }

  inputValue.value = '';
  scrollToBottom();
};

const handleTabComplete = () => {
  const val = inputValue.value;
  if (!val) return;

  const parts = val.split(/\s+/);
  const mainPart = parts[0].toLowerCase();

  if (parts.length === 1) {
    const matches = COMMANDS.filter(cmd => cmd.startsWith(mainPart));
    if (matches.length === 1) {
      inputValue.value = matches[0] + ' ';
    } else if (matches.length > 1) {
      addLog(`C:\\Users\\Damoon>${inputValue.value}`, 'cmd-row');
      addLog(matches.join('    '), 'os-dim');
      scrollToBottom();
    }
  } 
  else if (parts.length === 2 && mainPart === 'theme') {
    const subPart = parts[1].toLowerCase();
    const matches = themes.map(t => t.id).filter(id => id.includes(subPart));
    if (matches.length === 1) {
      inputValue.value = `theme ${matches[0]}`;
    } else if (matches.length > 1) {
      addLog(`C:\\Users\\Damoon>${inputValue.value}`, 'cmd-row');
      addLog(matches.join('    '), 'os-dim');
      scrollToBottom();
    }
  }
  else if (parts.length === 2 && mainPart === 'music') {
    const subPart = parts[1].toLowerCase();
    const musicActions = ['play', 'pause', 'next', 'toggle'];
    const matches = musicActions.filter(a => a.startsWith(subPart));
    if (matches.length === 1) {
      inputValue.value = `music ${matches[0]}`;
    } else if (matches.length > 1) {
      addLog(`C:\\Users\\Damoon>${inputValue.value}`, 'cmd-row');
      addLog(matches.join('    '), 'os-dim');
      scrollToBottom();
    }
  }
};

const handleArrowUp = () => {
  if (cmdHistory.value.length === 0) return;
  if (historyIndex.value === -1) {
    historyIndex.value = cmdHistory.value.length - 1;
  } else if (historyIndex.value > 0) {
    historyIndex.value--;
  }
  inputValue.value = cmdHistory.value[historyIndex.value];
};

const handleArrowDown = () => {
  if (historyIndex.value === -1) return;
  if (historyIndex.value < cmdHistory.value.length - 1) {
    historyIndex.value++;
    inputValue.value = cmdHistory.value[historyIndex.value];
  } else {
    historyIndex.value = -1;
    inputValue.value = '';
  }
};

const addLog = (text, cls = '') => {
  history.value.push({ type: 'output', content: text, class: cls });
};

const scrollToBottom = () => {
  nextTick(() => {
    const container = document.querySelector('.terminal-body');
    if (container) container.scrollTop = container.scrollHeight;
  });
};

onMounted(() => {
  initTerminal();
});
</script>

<template>
  <Transition name="fade">
    <div v-if="visible" class="terminal-overlay" @click.self="$emit('close')">
      <div class="terminal-window ltr-mode">
        
        <div class="terminal-header">
          <div class="header-left">
            <span class="win-icon">C:\</span>
            <span class="window-title">Administrator: Damoon OS v{{ version }}</span>
          </div>
          <div class="window-controls">
            <button class="win-btn close" @click="$emit('close')" title="Close">✕</button>
          </div>
        </div>
        
        <div class="terminal-body" @click="focusInput">
          <div v-for="(line, index) in history" :key="index">
            <div v-if="line.type === 'empty'" class="empty-line"></div>
            <pre v-else-if="line.type === 'ascii'" class="ascii-art">{{ line.content }}</pre>
            <div v-else-if="line.type === 'command'" class="cmd-row">
              <span class="prompt">C:\Users\Damoon></span>
              <span class="cmd-text">{{ line.content }}</span>
            </div>
            <div v-else :class="['output-line', line.class]">{{ line.content }}</div>
          </div>
          
          <div class="input-line">
            <span class="prompt">C:\Users\Damoon></span>
            <input 
              ref="inputRef"
              v-model="inputValue" 
              @keydown.enter="handleCommand" 
              @keydown.tab.prevent="handleTabComplete"
              @keydown.up.prevent="handleArrowUp"
              @keydown.down.prevent="handleArrowDown"
              @keydown="playKey"
              type="text" 
              spellcheck="false" 
              autocomplete="off" 
            />
          </div>
        </div>

      </div>
    </div>
  </Transition>
</template>

<style scoped>
.terminal-overlay {
  position: fixed; inset: 0;
  background: rgba(0, 0, 0, 0.5); backdrop-filter: blur(3px);
  display: flex; align-items: center; justify-content: center; z-index: 1000;
}

.terminal-window {
  width: 900px; height: 600px; max-width: 95%; max-height: 90vh;
  background: #0c0c0c;
  border: 1px solid #333;
  box-shadow: 0 0 40px rgba(0, 0, 0, 0.8);
  display: flex; flex-direction: column;
  position: relative;
  font-family: 'Consolas', 'Lucida Console', monospace;
  direction: ltr !important; 
  text-align: left !important;
}

.terminal-header {
  height: 32px; background: #1c1c1e; color: #fff;
  display: flex; justify-content: space-between; align-items: center;
  padding-left: 12px; flex-shrink: 0; user-select: none;
  border-bottom: 1px solid #2d2d2d;
}

.header-left { display: flex; align-items: center; gap: 8px; overflow: hidden; color: #aaa; }
.win-icon { font-size: 0.75rem; font-weight: bold; border: 1px solid #555; padding: 0 4px; color: #aaa; border-radius: 3px; }
.window-title { font-size: 0.8rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #ccc; }

.window-controls { display: flex; height: 100%; }
.win-btn {
  width: 46px; height: 100%; border: none; background: transparent;
  color: #aaa; font-size: 0.9rem; cursor: pointer; transition: 0.1s;
  display: flex; align-items: center; justify-content: center;
}
.win-btn:hover { background: #3a3a3c; color: #fff; }
.win-btn.close:hover { background: #e81123; color: white; }

.terminal-body {
  flex: 1; padding: 5px; overflow-y: auto; color: #ccc; font-size: 1rem;
  border-top: 1px solid #333;
}

.empty-line { height: 1.2rem; }
.cmd-row { margin-top: 5px; margin-bottom: 2px; }
.prompt { color: #ccc; margin-right: 8px; }
.cmd-text { color: #fff; }

.output-line { margin-bottom: 2px; color: #ccc; word-break: break-word; }
.os-dim { color: #888; }
.os-ok { color: var(--neon); }
.os-warn { color: #60a5fa; }
.os-bad { color: #f87171; }

.ascii-art { 
  font-family: monospace; white-space: pre; 
  color: var(--neon); font-weight: bold; 
  margin: 10px 0; line-height: 1.1; 
}

.input-line { display: flex; align-items: center; margin-top: 5px; }
input { background: transparent; border: none; color: #fff; flex: 1; font-family: inherit; font-size: inherit; outline: none; }

.terminal-body::-webkit-scrollbar { width: 10px; background: #0c0c0c; }
.terminal-body::-webkit-scrollbar-thumb { background: #333; }
.terminal-body::-webkit-scrollbar-thumb:hover { background: #555; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
<script setup>
import { ref, nextTick, watch, onMounted } from 'vue';

// دریافت اطلاعات از والد (App.vue)
const props = defineProps({
  visible: Boolean,
  projects: Array,
  skills: Array,      // لیست مهارت‌ها
  contact: Object,    // آبجکت اطلاعات تماس
  version: String,    // ورژن اپلیکیشن
  username: String,   // نام کاربر (Damoon)
  role: String        // عنوان شغلی
});

const emit = defineEmits(['close']);

const inputRef = ref(null);
const inputValue = ref('');
const history = ref([]);

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
    focusInput();
  }
});

const handleCommand = () => {
  const rawCmd = inputValue.value;
  const cmd = rawCmd.trim().toLowerCase();
  
  if (rawCmd) {
    history.value.push({ type: 'command', content: rawCmd });
  }

  // --- دستورات ---
  if (cmd === 'help') {
    addLog('Available Commands:', 'os-dim');
    addLog('  whoami    - Display user profile');
    addLog('  skills    - List technical skills');
    addLog('  projects  - List projects (ls)');
    addLog('  contact   - Show contact info');
    addLog('  cls       - Clear terminal');
    addLog('  exit      - Close terminal');
  } 
  else if (cmd === 'ls' || cmd === 'projects') {
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
  else if (cmd === 'skills') {
    addLog('--- LOADED SKILLS ---', 'os-warn');
    if (props.skills && props.skills.length) {
      // نمایش مهارت‌ها به صورت لیست
      props.skills.forEach(s => {
        addLog(`[+] ${s.name.padEnd(20)} ${s.level}%`, 'os-ok');
      });
    } else {
      addLog('No skills data loaded.', 'os-bad');
    }
  }
  else if (cmd === 'contact') {
    addLog('--- CONTACT CHANNELS ---', 'os-warn');
    if (props.contact) {
      if (props.contact.email) addLog(`Email:    ${props.contact.email}`);
      if (props.contact.linkedin) addLog(`LinkedIn: ${props.contact.linkedin}`);
      if (props.contact.github) addLog(`GitHub:   github.com/${props.contact.github}`);
      if (props.contact.telegram) addLog(`Telegram: ${props.contact.telegram}`);
    }
  }
  else if (cmd === 'whoami') {
    addLog(`User:  ${props.username || 'Unknown'}`, 'os-ok');
    addLog(`Role:  ${props.role || 'Developer'}`, 'os-ok');
    addLog('Access Level: Root/Admin', 'os-dim');
  } 
  else if (cmd === 'clear' || cmd === 'cls') {
    history.value = [];
  } 
  else if (cmd === 'exit') {
    emit('close');
  } 
  else if (cmd !== '') {
    addLog(`'${cmd}' is not recognized as a command.`, 'os-bad');
  }

  inputValue.value = '';
  scrollToBottom();
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
  height: 32px; background: #fff; color: #000;
  display: flex; justify-content: space-between; align-items: center;
  padding-left: 8px; flex-shrink: 0; user-select: none;
}

.header-left { display: flex; align-items: center; gap: 8px; overflow: hidden; }
.win-icon { font-size: 0.75rem; font-weight: bold; border: 1px solid #000; padding: 0 2px; }
.window-title { font-size: 0.8rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.window-controls { display: flex; height: 100%; }
.win-btn {
  width: 46px; height: 100%; border: none; background: transparent;
  color: #000; font-size: 0.9rem; cursor: pointer; transition: 0.1s;
  display: flex; align-items: center; justify-content: center;
}
.win-btn:hover { background: #e5e5e5; }
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
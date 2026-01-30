<script setup>
import { ref, nextTick, onMounted, watch } from 'vue';

const props = defineProps({
  visible: Boolean,
  projects: Array
});

const emit = defineEmits(['close']);

const inputRef = ref(null);
const inputValue = ref('');
const history = ref([
  { type: 'output', content: 'Initializing Damoon OS v1.2...' },
  { type: 'output', content: 'Loading kernel modules... DONE' },
  { type: 'output', content: 'Mounting file system... DONE' },
  { type: 'ascii', content: `
  ____    _    __  __  ___   ___  _   _ 
 |  _ \\  / \\  |  \\/  |/ _ \\ / _ \\| \\ | |
 | | | |/ _ \\ | |\\/| | | | | | | |  \\| |
 | |_| / ___ \\| |  | | |_| | |_| | |\\  |
 |____/_/   \\_\\_|  |_|\\___/ \\___/|_| \\_|
  ` },
  { type: 'output', content: 'Welcome back, Administrator.' },
  { type: 'output', content: 'Type "help" to see available commands.' },
]);

const focusInput = () => {
  nextTick(() => {
    if (inputRef.value) inputRef.value.focus();
  });
};

watch(() => props.visible, (val) => {
  if (val) focusInput();
});

const handleCommand = () => {
  const cmd = inputValue.value.trim().toLowerCase();
  history.value.push({ type: 'command', content: cmd });
  
  if (cmd === 'help') {
    history.value.push({ type: 'output', content: 'Available commands:' });
    history.value.push({ type: 'output', content: '  ls        - List projects & files' });
    history.value.push({ type: 'output', content: '  whoami    - Display current user' });
    history.value.push({ type: 'output', content: '  clear     - Clear terminal screen' });
    history.value.push({ type: 'output', content: '  contact   - Show contact info' });
    history.value.push({ type: 'output', content: '  exit      - Close terminal' });
  } 
  else if (cmd === 'ls') {
    history.value.push({ type: 'output', content: 'Directory: /home/damoon/projects' });
    props.projects.forEach(p => {
      history.value.push({ type: 'output', content: `  drwx--  ${p.name}` });
    });
    history.value.push({ type: 'output', content: '  -rw-r-  resume.pdf' });
    history.value.push({ type: 'output', content: '  -rw-r-  secrets.txt' });
  } 
  else if (cmd === 'whoami') {
    history.value.push({ type: 'output', content: 'damoon (root/privileged user)' });
  } 
  else if (cmd === 'contact') {
    history.value.push({ type: 'output', content: 'Email: Lotfi.moghaddam.alireza@gmail.com' });
    history.value.push({ type: 'output', content: 'GitHub: @AlirezaLotfiM' });
  }
  else if (cmd === 'clear') {
    history.value = [];
  } 
  else if (cmd === 'exit') {
    emit('close');
  } 
  else if (cmd === '') {
  }
  else {
    history.value.push({ type: 'error', content: `bash: ${cmd}: command not found` });
  }

  inputValue.value = '';
  nextTick(() => {
    const container = document.querySelector('.terminal-body');
    if (container) container.scrollTop = container.scrollHeight;
  });
};
</script>

<template>
  <Transition name="modal-fade">
    <div v-if="visible" class="terminal-overlay" @click.self="$emit('close')">
      <div class="terminal-window ltr-mode">
        <div class="terminal-header">
          <div class="window-title">damoon@root:~</div>
          <button class="close-btn" @click="$emit('close')">×</button>
        </div>
        
        <div class="terminal-body" @click="focusInput">
          <div v-for="(line, index) in history" :key="index" class="line" :class="line.type">
            <span v-if="line.type === 'command'" class="prompt">damoon@root:~$</span>
            <pre v-if="line.type === 'ascii'" class="ascii-art">{{ line.content }}</pre>
            <span v-else-if="line.type !== 'ascii'">{{ line.content }}</span>
          </div>
          
          <div class="input-line">
            <span class="prompt">damoon@root:~$</span>
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
/* اضافه کردن جهت چپ‌چین به کل پنجره ترمینال */
.terminal-window {
  width: 800px;
  height: 500px;
  max-width: 90%;
  background: rgba(10, 10, 10, 0.95);
  border: 1px solid #333;
  border-radius: 10px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: 'Fira Code', 'Consolas', monospace;
  
  /* فیکس جهت متن */
  direction: ltr !important;
  text-align: left !important;
}

.terminal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.terminal-header {
  background: #1a1a1a;
  padding: 10px 15px;
  border-bottom: 1px solid #333;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.window-title {
  color: #ccc;
  font-size: 0.9rem;
}

.close-btn {
  background: #ff5f56;
  border: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  color: transparent;
  cursor: pointer;
}

.terminal-body {
  flex: 1;
  padding: 15px;
  overflow-y: auto;
  color: #eee;
  font-size: 0.95rem;
}

.line {
  margin-bottom: 5px;
  line-height: 1.5;
}

.prompt {
  color: var(--neon);
  margin-right: 10px;
  font-weight: bold;
}

.line.command {
  color: #fff;
}

.line.output {
  color: #ccc;
}

.line.error {
  color: #ff5555;
}

.ascii-art {
  font-family: monospace;
  white-space: pre;
  color: var(--neon);
  font-weight: bold;
  line-height: 1.2;
  margin: 10px 0;
  opacity: 0.8;
}

.input-line {
  display: flex;
  align-items: center;
  margin-top: 5px;
}

input {
  background: transparent;
  border: none;
  color: #fff;
  flex: 1;
  font-family: inherit;
  font-size: inherit;
  outline: none;
  caret-color: var(--neon);
}

.terminal-body::-webkit-scrollbar {
  width: 8px;
}
.terminal-body::-webkit-scrollbar-thumb {
  background: #333;
  border-radius: 4px;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
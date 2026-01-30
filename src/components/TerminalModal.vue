<script setup>
import { ref, onMounted, nextTick } from 'vue';
import SnakeGame from './SnakeGame.vue';

const props = defineProps(['visible', 'projects']);
const emit = defineEmits(['close']);

const input = ref('');
const history = ref([
  { text: 'NexusQueue OS [Version 3.0.1]', type: 'info' },
  { text: '(c) 2026 Alireza Lotfi. All rights reserved.', type: 'info' },
  { text: '', type: 'info' }, 
  { text: 'Type "help" to see available commands.', type: 'info' },
  { text: '', type: 'info' }
]);
const inputRef = ref(null);
const showSnake = ref(false);
const isMaximized = ref(false);

const commands = {
  // لیست دستورات راهنما
  help: () => `
 AVAILABLE COMMANDS:
 -------------------
  about     : View profile summary
  skills    : List technical skills
  projects  : List projects directory
  contact   : Show contact info
  snake     : Launch Snake Game (Secret)
  clear     : Clear terminal screen
  exit      : Close terminal
  `,
  
  about: () => 'Alireza Lotfi | Software Engineer | Specialized in .NET, Desktop & Backend Systems.',
  
  // دستور مهارت‌ها (که جا افتاده بود)
  skills: () => `
 TECHNICAL SKILLS LOADED:
 [####################] 100%
 
  > C# .NET & ASP.NET Core
  > WPF & Windows Forms (Advanced)
  > SQL Server & Entity Framework
  > System Design & Microservices
  > Git & CI/CD
  `,

  contact: () => 'Email: Lotfi.moghaddam.alireza@gmail.com\nLinkedIn: linkedin.com/in/alireza-lotfi-moghaddam',

  projects: () => {
    if (!props.projects || props.projects.length === 0) return 'No projects found.';
    return props.projects.map(p => `  <DIR>   ${p.name}`).join('\n');
  },

  snake: () => { showSnake.value = true; return 'Initializing Snake Protocol...'; },
  
  clear: () => { history.value = []; return null; },
  
  exit: () => { emit('close'); return null; }
};

const execute = () => {
  const cmd = input.value.trim().toLowerCase();
  if (!cmd) return;
  
  history.value.push({ text: `C:\\Users\\Alireza> ${cmd}`, type: 'prompt' });

  if (commands[cmd]) {
    const res = commands[cmd]();
    if (res) history.value.push({ text: res, type: 'output' });
  } else {
    history.value.push({ text: `'${cmd}' is not recognized as an internal or external command.`, type: 'error' });
  }

  input.value = '';
  nextTick(() => {
    const term = document.querySelector('.terminal-body');
    if(term) term.scrollTop = term.scrollHeight;
  });
};

const closeGame = () => {
  showSnake.value = false;
  nextTick(() => inputRef.value?.focus());
};

const toggleMaximize = () => {
  isMaximized.value = !isMaximized.value;
};

onMounted(() => { if(props.visible) nextTick(() => inputRef.value?.focus()); });
</script>

<template>
  <div v-if="visible" class="terminal-overlay" @click.self="$emit('close')">
    <div class="terminal-window" :class="{ 'fullscreen': isMaximized }">
      
      <div class="terminal-header" @dblclick="toggleMaximize">
        <div class="buttons">
          <span class="dot red" @click="$emit('close')" title="Close"></span>
          <span class="dot yellow" title="Minimize"></span>
          <span class="dot green" @click="toggleMaximize" title="Maximize"></span>
        </div>
        <span class="title">Administrator: Command Prompt</span>
      </div>

      <div class="window-content">
        
        <SnakeGame v-if="showSnake" @close="closeGame" />

        <div v-else class="terminal-body" @click="inputRef?.focus()">
          <div v-for="(line, i) in history" :key="i" :class="line.type">
            <pre>{{ line.text }}</pre>
          </div>
          <div class="input-line">
            <span class="prompt-text">C:\Users\Alireza></span>
            <input 
              v-model="input" 
              @keydown.enter="execute" 
              ref="inputRef" 
              type="text" 
              autofocus
              spellcheck="false"
            >
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
.terminal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(5px);
  z-index: 10000; display: flex; justify-content: center; align-items: center;
}

.terminal-window {
  width: 700px; height: 500px; 
  background: #0c0c0c; border: 1px solid #333;
  border-radius: 8px; display: flex; flex-direction: column;
  box-shadow: 0 20px 60px rgba(0,0,0,0.8); overflow: hidden;
  font-family: 'Consolas', 'Lucida Console', monospace;
  
  /* جهت چپ به راست */
  direction: ltr; text-align: left;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.terminal-window.fullscreen { width: 95vw; height: 90vh; }

.terminal-header {
  background: #2d2d2d; padding: 8px 12px; display: flex; align-items: center;
  border-bottom: 1px solid #333; height: 36px; flex-shrink: 0; user-select: none;
}
.buttons { display: flex; gap: 8px; }
.dot { width: 12px; height: 12px; border-radius: 50%; cursor: pointer; transition: 0.2s; }
.dot:hover { filter: brightness(1.2); }
.red { background: #ff5f56; } .yellow { background: #ffbd2e; } .green { background: #27c93f; }
.title { margin: 0 auto; color: #ccc; font-size: 0.8rem; padding-right: 50px; }

.window-content { flex: 1; position: relative; overflow: hidden; display: flex; }

.terminal-body {
  flex: 1; padding: 15px; overflow-y: auto; color: #ccc; font-size: 0.95rem;
  background-color: #0c0c0c; cursor: text;
}

.input-line { display: flex; gap: 8px; margin-top: 5px; align-items: center; }
.prompt-text { color: #ccc; white-space: nowrap; }
input {
  background: transparent; border: none; color: #fff; flex: 1; outline: none; 
  font-family: inherit; font-size: inherit; caret-color: #fff;
}

.info { color: #ccc; margin-bottom: 2px; }
.prompt { color: #ccc; margin-top: 10px; }
.output { color: #67FF64; margin-bottom: 10px; white-space: pre-wrap; line-height: 1.5; font-weight: bold; }
.error { color: #ff5f56; margin-bottom: 5px; }
pre { margin: 0; font-family: inherit; white-space: pre-wrap; }

.terminal-body::-webkit-scrollbar { width: 10px; }
.terminal-body::-webkit-scrollbar-thumb { background: #444; border: 2px solid #0c0c0c; }
</style>
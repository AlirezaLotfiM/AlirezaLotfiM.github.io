<script setup>
// ... (کدهای اسکریپت بدون تغییر) ...
import { ref, onMounted } from 'vue';

const emit = defineEmits(['completed']);
const lines = ref([]);
const texts = [
  "Initializing NexusCore Kernel...",
  "Loading User Profile: Alireza Lotfi...",
  "Decrypting Secure Data...",
  "Mounting Vue.js Modules...",
  "Connection Established.",
  "WELCOME TO NEXUS."
];

onMounted(() => {
  let delay = 0;
  texts.forEach((text, index) => {
    delay += Math.random() * 300 + 100;
    setTimeout(() => {
      lines.value.push(text);
      const container = document.querySelector('.boot-console');
      if(container) container.scrollTop = container.scrollHeight;
      if (index === texts.length - 1) setTimeout(() => emit('completed'), 800);
    }, delay);
  });
});
</script>

<template>
  <div class="boot-screen">
    <div class="boot-console">
      <div v-for="(line, index) in lines" :key="index" class="line">
        <span class="prefix">[OK]</span> {{ line }}
      </div>
      <div class="cursor">_</div>
    </div>
  </div>
</template>

<style scoped>
.boot-screen {
  position: fixed; inset: 0; background: #000; z-index: 99999;
  display: flex; align-items: center; justify-content: center;
  font-family: 'Courier New', monospace;
  
  /* --- فیکس جهت متن --- */
  direction: ltr; 
  text-align: left;
}
.boot-console {
  width: 90%; max-width: 600px;
  color: #67FF64; font-size: 1rem;
  line-height: 1.5;
}
.prefix { color: #fff; font-weight: bold; margin-right: 10px; }
.line { animation: fadeIn 0.1s; margin-bottom: 5px; }
.cursor { animation: blink 1s infinite; display: inline-block; color: #67FF64; }

@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
@keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
</style>
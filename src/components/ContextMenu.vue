<script setup>
defineProps(['x', 'y', 'visible']);
defineEmits(['action', 'close']);
</script>

<template>
  <div 
    v-if="visible" 
    class="custom-context"
    :style="{ top: `${y}px`, left: `${x}px` }"
    @click.stop
  >
    <div class="menu-item" @click="$emit('action', 'terminal')">
      <span>📟</span> Open Terminal
    </div>
    <div class="menu-item" @click="$emit('action', 'matrix')">
      <span>🌧️</span> Toggle Matrix
    </div>
    <div class="sep"></div>
    <div class="menu-item" @click="$emit('action', 'source')">
      <span>💻</span> View Source
    </div>
    <div class="menu-item" @click="$emit('action', 'email')">
      <span>📧</span> Copy Email
    </div>
  </div>
  <div v-if="visible" class="overlay" @click="$emit('close')"></div>
</template>

<style scoped>
.custom-context {
  position: fixed; width: 180px; background: rgba(20, 20, 20, 0.9);
  backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px; padding: 5px; z-index: 99999;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  animation: scaleIn 0.1s ease-out;
}
.menu-item {
  padding: 10px; border-radius: 8px; color: #eee; cursor: pointer;
  display: flex; gap: 10px; align-items: center; font-size: 0.9rem;
  transition: 0.2s;
}
.menu-item:hover { background: #67FF64; color: #000; }
.sep { height: 1px; background: rgba(255,255,255,0.1); margin: 5px 0; }
.overlay { position: fixed; inset: 0; z-index: 99998; }

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}
</style>
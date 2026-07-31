<script setup>
defineProps({
  size: {
    type: Number,
    default: 72
  }
});
</script>

<template>
  <div class="monogram-container" :style="{ width: `${size}px`, height: `${size}px` }">
    <svg viewBox="0 0 100 100" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Architectural Modern Monogram ALM -->
      <!-- A Shape -->
      <path d="M22 76 L50 20 L78 76" stroke="var(--neon)" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M33 54 H67" stroke="var(--neon)" stroke-width="6" stroke-linecap="round"/>
      
      <!-- L Shape Overlay -->
      <path d="M42 38 V76 H74" stroke="var(--text-main)" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
      
      <!-- Architect Accent Dot -->
      <circle cx="78" cy="20" r="4.5" fill="var(--neon)"/>
    </svg>
  </div>
</template>

<style scoped>
.monogram-container {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  cursor: pointer;
  transition: transform 0.25s ease;
}

.monogram-container:hover {
  transform: scale(1.06);
}
</style>

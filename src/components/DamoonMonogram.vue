<script setup>
defineProps({
  size: {
    type: Number,
    default: 84
  }
});
</script>

<template>
  <div class="damoon-monogram-container" :style="{ width: `${size}px`, height: `${size}px` }">
    <svg viewBox="0 0 120 120" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Architectural Geometric 'D' Logo for Damoon -->
      <!-- D Outer Stem -->
      <path d="M30 24 V96" stroke="var(--neon)" stroke-width="8" stroke-linecap="round"/>
      
      <!-- D Curved Arc -->
      <path d="M30 24 H62 C84 24 96 38 96 60 C96 82 84 96 62 96 H30" stroke="var(--neon)" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
      
      <!-- Inner Core Architectural Line -->
      <path d="M48 42 V78 H62 C72 78 78 72 78 60 C78 48 72 42 62 42 Z" stroke="var(--text-main)" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
      
      <!-- Signature Code Bracket Dot -->
      <circle cx="62" cy="60" r="5" fill="var(--neon)"/>
    </svg>
  </div>
</template>

<style scoped>
.damoon-monogram-container {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  cursor: pointer;
  transition: transform 0.25s ease;
}

.damoon-monogram-container:hover {
  transform: scale(1.06);
}
</style>

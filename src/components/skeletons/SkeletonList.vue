<script setup>
</script>

<template>
  <div class="skeleton-list">
    <div v-for="n in 6" :key="n" class="skeleton-row skeleton-shimmer">
      <div class="skeleton-content">
        <div class="skeleton-title"></div>
        <div class="skeleton-meta">
           <div class="skeleton-tag"></div>
           <div class="skeleton-date"></div>
        </div>
        <div class="skeleton-text"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.skeleton-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
}

.skeleton-row {
  padding: 20px 25px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.skeleton-shimmer::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, var(--neon), transparent);
  opacity: 0.05;
  transform: translateX(-100%);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-150%); }
  50% { transform: translateX(150%); }
  100% { transform: translateX(150%); }
}

.skeleton-title {
  height: 22px;
  width: 40%;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  margin-bottom: 12px;
}

.skeleton-meta {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
}

.skeleton-tag {
  width: 60px;
  height: 18px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
}

.skeleton-date {
  width: 80px;
  height: 14px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  align-self: center;
}

.skeleton-text {
  height: 14px;
  width: 80%;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}
</style>

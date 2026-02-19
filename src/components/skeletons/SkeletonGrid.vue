<script setup>
</script>

<template>
  <div class="skeleton-grid">
    <div v-for="n in 6" :key="n" class="skeleton-card skeleton-shimmer">
      <div class="skeleton-header">
        <div class="skeleton-icon"></div>
        <div class="skeleton-badges">
           <div class="badge"></div>
           <div class="badge"></div>
        </div>
      </div>
      <div class="skeleton-title"></div>
      <div class="skeleton-desc"></div>
      <div class="skeleton-desc short"></div>
      <div class="skeleton-footer">
        <div class="skeleton-link"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 15px;
  width: 100%;
}

.skeleton-card {
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 25px 20px 20px;
  display: flex;
  flex-direction: column;
  min-height: 180px;
  position: relative;
  overflow: hidden;
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

.skeleton-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
}

.skeleton-icon {
  width: 24px;
  height: 24px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.skeleton-badges {
  display: flex;
  gap: 5px;
}

.badge {
  width: 40px;
  height: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}

.skeleton-title {
  height: 20px;
  width: 60%;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  margin-bottom: 15px;
}

.skeleton-desc {
  height: 14px;
  width: 90%;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  margin-bottom: 8px;
}

.skeleton-desc.short {
  width: 70%;
}

.skeleton-footer {
  margin-top: auto;
  padding-top: 15px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.skeleton-link {
  width: 80px;
  height: 14px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}
</style>

<script setup>
import { usePortfolio } from '../../../composables/usePortfolio';
import { useTilt } from '../../../composables/useTilt';

const { interests } = usePortfolio();
const { handleCardTilt, resetCard } = useTilt();
</script>

<template>
  <div class="interests-grid">
    <div v-for="(item, index) in interests" :key="index" class="interest-card spotlight-card"
      @mousemove="handleCardTilt" @mouseleave="resetCard">
      <div class="spotlight-bg"></div>
      <div class="interest-icon">{{ item.icon }}</div>
      <h4>{{ item.title }}</h4>
      <p>{{ item.desc }}</p>
    </div>
  </div>
</template>

<style scoped>
.interests-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
  padding: 5px;
}

.interest-card {
  background: var(--item-bg);
  border: 1px solid var(--panel-border);
  border-radius: 15px;
  padding: 20px;
  text-align: center;
  overflow: hidden;
  position: relative;
}

.interest-icon {
  font-size: 2.5rem;
  margin-bottom: 10px;
}

.interest-card h4 {
  margin: 0 0 8px;
  color: var(--text-main);
  font-size: 1.1rem;
}

.interest-card p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.85rem;
  line-height: 1.5;
}
</style>

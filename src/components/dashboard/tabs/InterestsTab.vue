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
  gap: 16px;
  padding: 5px;
}

.interest-card {
  background: var(--item-bg);
  border: 1px solid var(--panel-border);
  border-radius: 18px;
  padding: 22px 18px;
  text-align: center;
  overflow: hidden;
  position: relative;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.05),
    0 12px 28px rgba(0, 0, 0, 0.15);
}

.interest-card:hover {
  background: var(--item-hover-bg);
  border-color: var(--neon);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.08),
    0 16px 30px rgba(0, 0, 0, 0.22);
}

.interest-icon {
  font-size: 2.5rem;
  margin-bottom: 12px;
  filter: drop-shadow(0 8px 16px rgba(77, 121, 168, 0.12));
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
  line-height: 1.7;
}
</style>

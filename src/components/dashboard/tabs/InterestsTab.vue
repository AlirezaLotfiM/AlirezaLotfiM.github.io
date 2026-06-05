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
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.9), rgba(236, 246, 252, 0.74));
  border: 1px solid rgba(207, 223, 239, 1);
  border-radius: 18px;
  padding: 22px 18px;
  text-align: center;
  overflow: hidden;
  position: relative;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.86),
    0 12px 28px rgba(77, 121, 168, 0.08);
}

.interest-card:hover {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(232, 243, 252, 0.84));
  border-color: rgba(192, 212, 232, 1);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.92),
    0 16px 30px rgba(77, 121, 168, 0.1);
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

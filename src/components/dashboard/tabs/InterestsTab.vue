<script setup>
import { usePortfolio } from '../../../composables/usePortfolio';
import { useTilt } from '../../../composables/useTilt';

const { interests } = usePortfolio();
const { handleCardTilt, resetCard } = useTilt();
</script>

<template>
  <div class="interests-shell">
    <div class="interests-header-bar">
      <div class="header-title-block">
        <h3>⭐ علاقه‌مندی‌ها و حوزه‌های تخصصی</h3>
        <p class="subtitle">زمینه‌های مورد علاقه پژوهشی، معماری سیستم و فناوری‌های مورد تمرکز</p>
      </div>
    </div>

    <div class="interests-grid">
      <div
        v-for="(item, index) in interests"
        :key="index"
        class="interest-card spotlight-card"
        @mousemove="handleCardTilt"
        @mouseleave="resetCard"
      >
        <div class="spotlight-bg"></div>
        <div class="card-inner">
          <div class="interest-icon-badge">
            <span class="icon">{{ item.icon || '🎯' }}</span>
          </div>
          <div class="interest-content">
            <h4>{{ item.title }}</h4>
            <p>{{ item.desc }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.interests-shell {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.interests-header-bar {
  padding: 16px 20px;
  background: var(--item-bg);
  border: 1px solid var(--panel-border);
  border-radius: 16px;
}

.header-title-block h3 {
  margin: 0 0 4px 0;
  font-size: 1.1rem;
  color: var(--text-main);
}

.header-title-block .subtitle {
  margin: 0;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.interests-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.interest-card {
  background: var(--item-bg);
  border: 1px solid var(--panel-border);
  border-radius: 18px;
  padding: 20px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 10px 24px rgba(0, 0, 0, 0.15);
}

.interest-card:hover {
  background: var(--item-hover-bg);
  border-color: var(--neon);
  transform: translateY(-2px);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 16px 30px rgba(0, 0, 0, 0.22);
}

.card-inner {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  position: relative;
  z-index: 1;
}

.interest-icon-badge {
  width: 48px;
  height: 48px;
  min-width: 48px;
  border-radius: 14px;
  background: rgba(56, 189, 248, 0.08);
  border: 1px solid rgba(56, 189, 248, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.6rem;
}

.interest-content {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.interest-content h4 {
  margin: 0;
  color: var(--text-main);
  font-size: 1.05rem;
  font-weight: 700;
}

.interest-content p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.86rem;
  line-height: 1.65;
  text-align: justify;
}
</style>

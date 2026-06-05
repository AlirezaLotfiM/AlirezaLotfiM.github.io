<script setup>
import { computed } from 'vue';
import { usePortfolio } from '../../composables/usePortfolio';

const { mySkills, toPersianDigits, profile } = usePortfolio();

const stackModules = computed(() =>
  profile.value.stackModules || [
    { label: 'shipping', value: 'Backend services' },
    { label: 'learning', value: profile.value.learning?.focus || 'Dapr & K8s' },
    { label: 'stack', value: 'C# / PostgreSQL / Vue' },
  ],
);
</script>

<template>
  <aside class="col-skills glass-panel skills-box">
    <header class="panel-header">
      <span class="section-kicker">skills/modules</span>
      <h3>ماژول‌های تخصص</h3>
      <p>Capability map with practical delivery bias.</p>
    </header>

    <ul class="rack-container scroll-area">
      <li v-for="skill in mySkills" :key="skill.name" class="skill-module" dir="ltr">
        <div class="module-meta mono-ui">
          <span class="module-path">module/{{ skill.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') }}</span>
          <span class="module-level">{{ toPersianDigits(skill.level) }}%</span>
        </div>
        <div class="module-header">
          <div class="module-title">
            <span class="status-dot"></span>
            <span class="skill-name">{{ skill.name }}</span>
          </div>
          <span class="skill-percent mono-ui">L{{ Math.round(skill.level / 10) }}</span>
        </div>

        <div class="module-bar-bg">
          <div class="module-bar-fill" :style="{ width: skill.level + '%' }">
            <div class="bar-glow"></div>
          </div>
        </div>
      </li>
    </ul>

    <div class="stack-console">
      <div class="console-head">
        <span class="module-eyebrow">runtime/status</span>
        <span class="code-label">live</span>
      </div>
      <div class="module-divider"></div>
      <div v-for="item in stackModules" :key="item.label" class="console-row">
        <span class="console-key mono-ui">{{ item.label }}</span>
        <span class="console-value">{{ item.value }}</span>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.col-skills {
  height: 100%;
  padding: 0;
  display: flex;
  flex-direction: column;
}

.panel-header {
  padding: 18px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.34);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.panel-header h3 {
  margin: 0;
  font-size: 0.98rem;
  color: var(--text-main);
  letter-spacing: 0.04em;
}

.panel-header p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.82rem;
  line-height: 1.6;
}

.rack-container {
  padding: 20px;
  margin: 0;
  list-style: none;
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  display: flex;
  flex-direction: column;
  gap: 15px;
  min-height: 0;
}

.skill-module {
  background: rgba(255, 255, 255, 0.64);
  border: 1px solid rgba(216, 230, 244, 0.98);
  border-radius: 16px;
  padding: 14px;
  transition: all 0.3s ease;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.54);
}

.skill-module:hover {
  background: rgba(255, 255, 255, 0.82);
  border-color: rgba(204, 221, 238, 1);
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(92, 144, 199, 0.08);
}

.module-meta {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  font-size: 0.68rem;
  color: var(--text-soft);
}

.module-path,
.module-level {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.module-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
}

.module-title {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
}

.skill-name {
  font-size: 0.85rem;
  color: var(--text-main);
  font-weight: 500;
  line-height: 1.4;
  white-space: normal;
  word-break: break-word;
  text-align: left;
}

.skill-percent {
  font-weight: bold;
  font-size: 0.78rem;
  color: var(--accent-strong);
  opacity: 0.8;
  flex-shrink: 0;
}

.status-dot {
  width: 6px;
  height: 6px;
  background-color: var(--accent-strong);
  border-radius: 50%;
  box-shadow: 0 0 8px rgba(92, 144, 199, 0.5);
  animation: pulse-dot 2s infinite;
  flex-shrink: 0;
}

@keyframes pulse-dot {
  0% { opacity: 0.4; box-shadow: 0 0 0 rgba(92, 144, 199, 0.2); }
  50% { opacity: 1; box-shadow: 0 0 8px rgba(92, 144, 199, 0.45); }
  100% { opacity: 0.4; box-shadow: 0 0 0 rgba(92, 144, 199, 0.2); }
}

.module-bar-bg {
  width: 100%;
  height: 6px;
  background: var(--bar-bg);
  border-radius: 3px;
  overflow: hidden;
  position: relative;
}

.module-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, rgba(173, 206, 235, 0.56), var(--accent-strong));
  border-radius: 3px;
  position: relative;
  box-shadow: 0 0 12px rgba(92, 144, 199, 0.26);
}

.bar-glow {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.65), transparent);
  animation: scan 2.8s linear infinite;
}

@keyframes scan {
  from { transform: translateX(-100%); }
  to { transform: translateX(100%); }
}

.stack-console {
  padding: 14px 18px 18px;
  border-top: 1px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.16);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.console-head {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.console-head .code-label {
  position: absolute;
  left: 0;
}

.console-row {
  display: grid;
  grid-template-columns: 70px 1fr;
  gap: 10px;
  align-items: start;
}

.console-key {
  font-size: 0.72rem;
  color: var(--text-soft);
  text-transform: lowercase;
  justify-self: start;
}

.console-value {
  font-size: 0.84rem;
  color: var(--text-main);
  line-height: 1.6;
  justify-self: end;
  text-align: left;
}

@media (max-width: 1024px) {
  .col-skills {
    order: 3;
    height: auto;
  }

  .rack-container {
    overflow: visible;
  }

  .console-head {
    justify-content: flex-start;
  }

  .console-head .code-label {
    position: static;
    margin-right: auto;
  }

  .console-row {
    grid-template-columns: 1fr;
    gap: 4px;
  }

  .console-value {
    justify-self: start;
  }
}

@media (max-width: 640px) {
  .panel-header,
  .rack-container,
  .stack-console {
    padding-left: 14px;
    padding-right: 14px;
  }
}
</style>

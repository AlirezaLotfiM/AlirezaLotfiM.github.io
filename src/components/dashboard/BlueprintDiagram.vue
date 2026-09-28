<script setup>
import { computed } from 'vue';

const props = defineProps({
  blueprint: {
    type: Object,
    required: true
  }
});

const layers = computed(() => props.blueprint?.layers || []);

const cleanLayerName = (name) => {
  if (!name) return '';
  return name.replace(/^[\d۰-۹]+[\.\-\s:]+/, '').trim();
};
</script>

<template>
  <div class="blueprint-diagram-container">
    <div class="blueprint-header-bar">
      <div class="code-title">
        <span class="blueprint-icon">📐</span>
        <span class="blueprint-code mono-ui" dir="ltr">{{ blueprint.code || 'ARCHITECTURE BLUEPRINT' }}</span>
      </div>
      <span class="live-signal-badge">
        <span class="signal-dot"></span>
        DATA FLOW ENGINE
      </span>
    </div>

    <div class="blueprint-layers-stream">
      <div
        v-for="(layer, index) in layers"
        :key="index"
        class="blueprint-layer-item"
      >
        <div class="layer-header">
          <span class="layer-step-badge mono-ui">0{{ index + 1 }}</span>
          <h4 class="layer-title">{{ cleanLayerName(layer.name) }}</h4>
        </div>

        <div class="layer-nodes-grid">
          <div
            v-for="(node, ni) in layer.nodes"
            :key="ni"
            class="node-card"
          >
            <span class="node-bullet"></span>
            <span class="node-text">{{ node }}</span>
          </div>
        </div>

        <!-- Animated Data-Flow Connector -->
        <div v-if="index < layers.length - 1" class="flow-connector-wrapper" aria-hidden="true">
          <div class="connector-track">
            <span class="data-pulse-dot"></span>
          </div>
          <span class="connector-arrow">↓</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.blueprint-diagram-container {
  background: var(--bar-bg, #f8fafc);
  border: 1px solid var(--panel-border, #e2e8f0);
  border-radius: 14px;
  padding: 18px 20px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
}

.blueprint-diagram-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--neon, #4f46e5), transparent);
}

.blueprint-header-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--panel-border, #e2e8f0);
}

.code-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.blueprint-icon {
  font-size: 1.1rem;
}

.blueprint-code {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--neon, #4f46e5);
  letter-spacing: 0.5px;
}

.live-signal-badge {
  font-size: 0.68rem;
  font-weight: 700;
  color: #10b981;
  background: rgba(16, 185, 129, 0.08);
  padding: 2px 8px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  letter-spacing: 0.5px;
}

.signal-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 6px #10b981;
  animation: pulse 1.6s infinite ease-in-out;
}

.blueprint-layers-stream {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.blueprint-layer-item {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.layer-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.layer-step-badge {
  font-size: 0.76rem;
  font-weight: 800;
  color: var(--neon, #4f46e5);
  background: rgba(79, 70, 229, 0.1);
  padding: 2px 8px;
  border-radius: 6px;
}

.layer-title {
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--text-main, #0f172a);
  margin: 0;
}

.layer-nodes-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding-left: 28px;
}

[dir="rtl"] .layer-nodes-grid {
  padding-left: 0;
  padding-right: 28px;
}

.node-card {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: var(--item-bg, #ffffff);
  border: 1px solid var(--panel-border, #cbd5e1);
  border-radius: 8px;
  font-size: 0.78rem;
  color: var(--text-secondary, #334155);
  transition: all 0.15s ease;
}

.node-card:hover {
  border-color: var(--neon, #4f46e5);
  box-shadow: 0 2px 8px rgba(79, 70, 229, 0.12);
  transform: translateY(-1px);
}

.node-bullet {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--neon, #4f46e5);
  opacity: 0.7;
}

.node-text {
  font-weight: 600;
}

.flow-connector-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 24px;
  position: relative;
  margin: 2px 0;
}

.connector-track {
  width: 2px;
  height: 100%;
  background: var(--panel-border, #cbd5e1);
  position: relative;
  overflow: hidden;
}

.data-pulse-dot {
  position: absolute;
  top: 0;
  left: -2px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--neon, #4f46e5);
  box-shadow: 0 0 6px var(--neon, #4f46e5);
  animation: dataPulse 1.8s infinite ease-in-out;
}

.connector-arrow {
  font-size: 0.75rem;
  color: var(--neon, #4f46e5);
  font-weight: 800;
  line-height: 1;
  margin-top: -3px;
}

@keyframes dataPulse {
  0% {
    top: -6px;
    opacity: 0;
  }
  30% {
    opacity: 1;
  }
  100% {
    top: 100%;
    opacity: 0;
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.3);
    opacity: 0.6;
  }
}

@media (max-width: 640px) {
  .blueprint-diagram-container {
    padding: 14px 12px;
    border-radius: 12px;
  }

  .blueprint-header-bar {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    margin-bottom: 12px;
    padding-bottom: 10px;
  }

  .layer-nodes-grid {
    padding-left: 0;
  }

  [dir="rtl"] .layer-nodes-grid {
    padding-right: 0;
  }

  .node-card {
    font-size: 0.74rem;
    padding: 5px 10px;
  }
}
</style>

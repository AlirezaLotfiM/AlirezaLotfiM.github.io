<script setup>
import { nextTick, onUnmounted, ref, watch } from 'vue';

const props = defineProps({
  visible: Boolean,
  diagram: String,
  title: String
});

const emit = defineEmits(['close']);
const containerRef = ref(null);
const closeButtonRef = ref(null);
let mermaidApi = null;
let previousActiveElement = null;

const getMermaid = async () => {
  if (mermaidApi) return mermaidApi;
  const module = await import('mermaid');
  mermaidApi = module.default;
  mermaidApi.initialize({
    startOnLoad: false,
    theme: 'dark',
    securityLevel: 'strict',
    fontFamily: 'monospace',
  });
  return mermaidApi;
};

const renderDiagram = async () => {
  if (!props.diagram || !containerRef.value) return;
  containerRef.value.innerHTML = '<div class="loading">Generating Diagram...</div>';

  try {
    const mermaid = await getMermaid();
    const id = `mermaid-${crypto.randomUUID?.() || Math.random().toString(36).slice(2)}`;
    const { svg } = await mermaid.render(id, props.diagram);
    containerRef.value.innerHTML = svg;
  } catch (e) {
    console.error('Mermaid render error:', e);
    containerRef.value.innerHTML = `<div class="error">Failed to render diagram: ${e.message}</div>`;
  }
};

const closeModal = () => emit('close');
const handleKeydown = (event) => {
  if (event.key === 'Escape') closeModal();
  if (event.key === 'Tab') {
    event.preventDefault();
    closeButtonRef.value?.focus();
  }
};

watch(() => props.visible, async (val) => {
  if (val) {
    previousActiveElement = document.activeElement;
    document.addEventListener('keydown', handleKeydown);
    await nextTick();
    closeButtonRef.value?.focus();
    setTimeout(renderDiagram, 100);
  } else {
    document.removeEventListener('keydown', handleKeydown);
    if (containerRef.value) containerRef.value.innerHTML = '';
    previousActiveElement?.focus?.();
  }
});

onUnmounted(() => document.removeEventListener('keydown', handleKeydown));
</script>

<template>
  <Transition name="fade">
    <div v-if="visible" class="modal-overlay" @click.self="closeModal">
      <div class="modal-window glass-panel" role="dialog" aria-modal="true" aria-labelledby="architecture-title">
        <header class="modal-header">
          <div class="header-title">
            <span class="icon">🏗️</span>
            <h3 id="architecture-title">Architecture: {{ title }}</h3>
          </div>
          <button ref="closeButtonRef" class="close-btn" @click="closeModal" aria-label="بستن نمودار معماری">✕</button>
        </header>

        <div class="diagram-wrapper">
          <div class="diagram-container" ref="containerRef"></div>
        </div>

        <footer class="modal-footer">
          Generated with Mermaid.js
        </footer>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal-window {
  width: 900px;
  max-width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-main);
  border: 1px solid var(--panel-border);
  border-radius: 16px;
  box-shadow: 0 0 40px rgba(0, 0, 0, 0.5);
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid var(--panel-border);
  background: rgba(255, 255, 255, 0.05);
}

.header-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-title h3 {
  margin: 0;
  font-size: 1.1rem;
  color: var(--text-main);
}

.close-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 1.2rem;
  cursor: pointer;
  transition: 0.2s;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.close-btn:hover {
  background: rgba(255, 0, 0, 0.2);
  color: #ff5555;
}

.diagram-wrapper {
  flex: 1;
  overflow: auto;
  padding: 20px;
  background: #0d1117; /* Dark background for diagram */
  display: flex;
  justify-content: center;
  align-items: center;
}

.diagram-container {
  width: 100%;
  display: flex;
  justify-content: center;
}

.loading, .error {
  color: var(--text-muted);
  font-family: monospace;
}

.error {
  color: #ff5555;
}

.modal-footer {
  padding: 10px;
  text-align: center;
  font-size: 0.75rem;
  color: var(--text-muted);
  border-top: 1px solid var(--panel-border);
  background: rgba(0, 0, 0, 0.2);
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

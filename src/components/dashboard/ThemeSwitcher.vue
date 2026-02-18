<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { useTheme } from '../../composables/useTheme';

const { themes, setTheme, currentTheme } = useTheme();
const isOpen = ref(false);
const containerRef = ref(null);
const dropdownStyle = ref({});

const updatePosition = () => {
  if (containerRef.value) {
    const rect = containerRef.value.getBoundingClientRect();
    // Default align left-to-left
    let left = rect.left;
    // If it goes off-screen right, align right-to-right
    if (left + 220 > window.innerWidth) {
      left = rect.right - 220;
    }

    dropdownStyle.value = {
      position: 'fixed',
      top: `${rect.bottom + 5}px`,
      left: `${left}px`,
      width: '220px',
      zIndex: 99999
    };
  }
};

const selectTheme = (themeId) => {
  setTheme(themeId);
  isOpen.value = false;
};

const handleClickOutside = (event) => {
  if (containerRef.value && containerRef.value.contains(event.target)) return;
  const dropdown = document.querySelector('.theme-dropdown');
  if (dropdown && dropdown.contains(event.target)) return;

  isOpen.value = false;
};

watch(isOpen, async (val) => {
  if (val) {
    await nextTick();
    updatePosition();
  }
});

const handleScroll = () => {
  if (isOpen.value) updatePosition();
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  window.addEventListener('resize', handleScroll);
  window.addEventListener('scroll', handleScroll, true);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  window.removeEventListener('resize', handleScroll);
  window.removeEventListener('scroll', handleScroll, true);
});
</script>

<template>
  <div class="theme-switcher" ref="containerRef">
    <button @click.stop="isOpen = !isOpen" class="icon-btn theme-btn" title="تغییر رنگ تم">
      🎨
    </button>

    <Teleport to="body">
      <div v-if="isOpen" class="theme-dropdown glass-panel" :style="dropdownStyle">
        <div class="dropdown-header">Theme Selection</div>
        <div class="theme-grid">
          <button
            v-for="theme in themes"
            :key="theme.id"
            class="theme-option"
            :class="{ active: currentTheme.id === theme.id }"
            @click="selectTheme(theme.id)"
            :title="theme.name"
          >
            <div class="preview-circle" :style="{
              background: theme.colors['--bg-main'],
              borderColor: theme.colors['--neon']
            }"></div>
            <span class="theme-name">{{ theme.name }}</span>
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.theme-switcher {
  position: relative;
  display: inline-block;
}

.theme-dropdown {
  /* Position is handled inline via style binding */
  background: var(--bg-main);
  border: 1px solid var(--panel-border);
  border-radius: 12px;
  padding: 10px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  animation: slideDown 0.2s ease-out;
  display: flex;
  flex-direction: column;
}

.dropdown-header {
  font-size: 0.9rem;
  font-weight: bold;
  color: var(--text-secondary);
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--panel-border);
  text-align: center;
}

.theme-grid {
  display: flex;
  flex-direction: column;
  gap: 5px;
  max-height: 50vh;
  overflow-y: auto;
  padding-right: 5px;
  padding-bottom: 20px;
}

.theme-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  width: 100%;
  transition: 0.2s;
  direction: ltr;
}

.theme-option:hover {
  background: var(--item-hover-bg);
}

.theme-option.active {
  background: var(--item-bg);
  border-color: var(--neon);
}

.preview-circle {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid;
  flex-shrink: 0;
  box-shadow: 0 0 5px rgba(0,0,0,0.2);
}

.theme-name {
  color: var(--text-main);
  font-size: 0.85rem;
  font-weight: 500;
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.theme-grid::-webkit-scrollbar { width: 4px; }
.theme-grid::-webkit-scrollbar-thumb { background: var(--panel-border); border-radius: 4px; }
</style>

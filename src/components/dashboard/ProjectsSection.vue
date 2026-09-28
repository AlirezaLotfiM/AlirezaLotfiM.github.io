<script setup>
import { ref, computed } from 'vue';
import { usePortfolio } from '../../composables/usePortfolio';
import { useI18n } from '../../composables/useI18n';
import { useAudioSynth } from '../../composables/useAudioSynth';
import BlueprintDiagram from './BlueprintDiagram.vue';

const props = defineProps({
  highlightedSlug: {
    type: String,
    default: ''
  }
});

const { projects, activeFilter } = usePortfolio();
const { t, isRtl } = useI18n();
const { playClick } = useAudioSynth();

const expandedProjects = ref({});

const domainFilters = computed(() => [
  { id: 'All', label: t('filterAll') },
  { id: 'Banking', label: t('filterBanking'), match: (p) => (p.name + p.description + (p.scale || '')).toLowerCase().includes('بانک') },
  { id: 'Realtime', label: t('filterRealtime'), match: (p) => (p.language + p.description).toLowerCase().includes('signalr') || (p.language + p.description).toLowerCase().includes('hardware') },
  { id: 'Desktop', label: t('filterDesktop'), match: (p) => (p.language + p.description).toLowerCase().includes('wpf') || (p.language + p.description).toLowerCase().includes('کیوسک') },
  { id: 'C#', label: 'C# / .NET', match: (p) => (p.language || '').includes('C#') || (p.language || '').includes('.NET') },
  { id: 'Vue', label: 'Vue.js', match: (p) => (p.language || '').includes('Vue') },
  { id: 'SQL', label: 'SQL Server', match: (p) => (p.language + p.description + (p.architectureSummary || '')).toLowerCase().includes('sql') }
]);

const currentFilterId = ref('All');

const setFilter = (filterItem) => {
  playClick();
  currentFilterId.value = filterItem.id;
  activeFilter.value = filterItem.id;
};

const filteredProjectsList = computed(() => {
  const fId = currentFilterId.value;
  if (fId === 'All') return projects.value;

  const found = domainFilters.value.find((df) => df.id === fId);
  if (found && found.match) {
    return projects.value.filter(found.match);
  }

  // Fallback to direct language inclusion
  return projects.value.filter((p) => p.language && p.language.includes(fId));
});

const toggleSpecs = (id) => {
  playClick();
  expandedProjects.value[id] = !expandedProjects.value[id];
};

const formatStatus = (st) => {
  if (!st) return null;
  const lower = st.toLowerCase();
  if (lower.includes('بانک') || lower.includes('bank')) return { text: 'عملیاتی در شبکه بانکی کشور', type: 'bank-prod' };
  if (lower.includes('عملیاتی') || lower.includes('live') || lower.includes('prod')) return { text: 'عملیاتی', type: 'prod' };
  if (lower.includes('فعال') || lower.includes('active')) return { text: 'فعال', type: 'prod' };
  if (lower.includes('پایدار') || lower.includes('stable')) return { text: 'پایدار', type: 'prod' };
  if (lower.includes('توسعه') || lower.includes('طراحی') || lower.includes('ship') || lower.includes('dev')) return { text: 'در حال توسعه', type: 'dev' };
  return { text: st, type: 'neutral' };
};
</script>

<template>
  <section id="projects" class="editorial-section" :dir="isRtl ? 'rtl' : 'ltr'">
    <div class="sec-title-bar">
      <span class="num mono-ui" dir="ltr">{{ isRtl ? '۰۲ //' : '02 //' }}</span>
      <h2>{{ t('projectsTitle') }}</h2>
    </div>

    <!-- Multi-Dimensional Domain Filter Bar -->
    <div class="domain-filter-scroll-wrap">
      <div class="domain-filter-bar">
        <button
          v-for="df in domainFilters"
          :key="df.id"
          @click="setFilter(df)"
          :class="['filter-chip-btn', { active: currentFilterId === df.id }]"
          type="button"
        >
          {{ df.label }}
        </button>
      </div>
    </div>

    <!-- Projects Stream -->
    <div class="projects-editorial-stream">
      <article
        v-for="p in filteredProjectsList"
        :key="p.id"
        :id="'project-' + (p.slug || p.id)"
        :class="['project-editorial-card', { 'highlight-pulse': highlightedSlug === (p.slug || p.id) }]"
      >
        <div class="proj-top">
          <h3>
            <a v-if="p.html_url && p.html_url !== '#'" :href="p.html_url" target="_blank" rel="noopener">
              {{ p.name }} <span class="arrow">↗</span>
            </a>
            <span v-else>{{ p.name }}</span>
          </h3>

          <!-- Status Badge -->
          <span v-if="formatStatus(p.status)" class="status-badge-pill" :class="formatStatus(p.status).type">
            <span class="status-dot"></span>
            <span>{{ formatStatus(p.status).text }}</span>
          </span>
        </div>

        <p class="desc">{{ p.description }}</p>

        <div class="meta-line">
          <span class="tech-stack mono-ui" dir="ltr">{{ p.language }}</span>
          <button
            v-if="p.role || p.architectureSummary || (p.details && p.details.length) || p.blueprint"
            @click="toggleSpecs(p.id)"
            class="toggle-specs-btn"
            type="button"
          >
            <span>{{ expandedProjects[p.id] ? t('specsToggleClose') : t('specsToggleOpen') }}</span>
            <span class="chevron-icon" :class="{ rotated: expandedProjects[p.id] }">▾</span>
          </button>
        </div>

        <!-- Expanded Technical Specifications Drawer -->
        <Transition name="drawer-slide">
          <div v-if="expandedProjects[p.id]" class="project-specs-panel">
            <div class="specs-panel-header">
              <span class="specs-header-badge mono-ui" dir="ltr">ENGINEERING ARCHITECTURE SPEC</span>
              <span class="specs-header-dot"></span>
            </div>

            <div class="specs-grid">
              <div v-if="p.role" class="spec-cell">
                <span class="spec-k">{{ t('roleLabel') }}</span>
                <span class="spec-v">{{ p.role }}</span>
              </div>
              <div v-if="p.architectureSummary" class="spec-cell">
                <span class="spec-k">{{ t('architectureLabel') }}</span>
                <span class="spec-v mono-ui" dir="ltr">{{ p.architectureSummary }}</span>
              </div>
              <div v-if="p.impact || p.scale" class="spec-cell">
                <span class="spec-k">{{ t('impactLabel') }}</span>
                <span class="spec-v">{{ p.impact || p.scale }}</span>
              </div>
            </div>

            <!-- Visual Schematic Blueprint Flow Diagram -->
            <div v-if="p.blueprint" class="blueprint-mount-area">
              <BlueprintDiagram :blueprint="p.blueprint" />
            </div>

            <!-- Key Implementations & Technical Challenges -->
            <div v-if="p.details && p.details.length" class="specs-details-block">
              <span class="specs-details-title">{{ t('keyChallenges') }}</span>
              <ul class="specs-bullet-list">
                <li v-for="(detail, di) in p.details" :key="di">
                  <span class="bullet-dot">›</span>
                  <span>{{ detail }}</span>
                </li>
              </ul>
            </div>
          </div>
        </Transition>
      </article>
    </div>
  </section>
</template>

<style scoped>
.editorial-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.sec-title-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--neon, #4f46e5);
}

.sec-title-bar .num {
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--neon, #4f46e5);
}

.sec-title-bar h2 {
  font-size: 1.35rem;
  font-weight: 800;
  color: var(--text-main, #0f172a);
  margin: 0;
}

.domain-filter-scroll-wrap {
  overflow-x: auto;
  scrollbar-width: none;
  padding-bottom: 4px;
}

.domain-filter-bar {
  display: flex;
  gap: 8px;
  min-width: max-content;
}

.filter-chip-btn {
  padding: 6px 14px;
  border-radius: 999px;
  background: var(--item-bg, #ffffff);
  border: 1px solid var(--panel-border, #cbd5e1);
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-secondary, #475569);
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.filter-chip-btn:hover {
  border-color: var(--neon, #4f46e5);
  color: var(--neon, #4f46e5);
}

.filter-chip-btn.active {
  background: var(--neon, #4f46e5);
  border-color: var(--neon, #4f46e5);
  color: #ffffff;
  font-weight: 700;
  box-shadow: 0 2px 10px rgba(79, 70, 229, 0.25);
}

.projects-editorial-stream {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.project-editorial-card {
  background: var(--item-bg, #ffffff);
  border: 1px solid var(--panel-border, #cbd5e1);
  border-radius: 16px;
  padding: 22px 24px;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.03);
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: all 0.2s ease;
}

.project-editorial-card:hover {
  border-color: rgba(79, 70, 229, 0.35);
  box-shadow: 0 8px 24px rgba(79, 70, 229, 0.08);
}

.project-editorial-card.highlight-pulse {
  border-color: var(--neon, #4f46e5);
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.25);
  animation: pulseGlow 1.5s infinite;
}

.proj-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.proj-top h3 {
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--text-main, #0f172a);
  margin: 0;
}

.proj-top h3 a {
  color: inherit;
  text-decoration: none;
}

.proj-top h3 a:hover {
  color: var(--neon, #4f46e5);
}

.status-badge-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 999px;
  background: var(--bar-bg, #f1f5f9);
  border: 1px solid var(--panel-border, #cbd5e1);
  color: var(--text-secondary, #475569);
}

.status-badge-pill.bank-prod {
  background: rgba(16, 185, 129, 0.08);
  border-color: rgba(16, 185, 129, 0.25);
  color: #10b981;
}

.status-badge-pill.prod {
  background: rgba(79, 70, 229, 0.08);
  border-color: rgba(79, 70, 229, 0.25);
  color: var(--neon, #4f46e5);
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.desc {
  font-size: 0.9rem;
  color: var(--text-secondary, #334155);
  line-height: 1.75;
  margin: 0;
}

.meta-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-top: 6px;
  border-top: 1px solid var(--panel-border, #f1f5f9);
  flex-wrap: wrap;
}

.tech-stack {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--neon, #4f46e5);
}

.toggle-specs-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(79, 70, 229, 0.08);
  border: 1px solid rgba(79, 70, 229, 0.2);
  border-radius: 8px;
  padding: 5px 12px;
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--neon, #4f46e5);
  cursor: pointer;
  transition: all 0.15s ease;
}

.toggle-specs-btn:hover {
  background: var(--neon, #4f46e5);
  color: #ffffff;
}

.chevron-icon {
  font-size: 0.85rem;
  transition: transform 0.2s ease;
}

.chevron-icon.rotated {
  transform: rotate(180deg);
}

/* PROJECT SPECS PANEL */
.project-specs-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 18px 20px;
  background: var(--bar-bg, #f8fafc);
  border: 1px solid var(--panel-border, #e2e8f0);
  border-radius: 14px;
  margin-top: 8px;
}

.specs-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.specs-header-badge {
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.5px;
  color: var(--neon, #4f46e5);
}

.specs-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

@media (max-width: 768px) {
  .specs-grid {
    grid-template-columns: 1fr;
  }
}

.spec-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 12px;
  background: var(--item-bg, #ffffff);
  border: 1px solid var(--panel-border, #cbd5e1);
  border-radius: 10px;
}

.spec-k {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--text-soft, #64748b);
}

.spec-v {
  font-size: 0.84rem;
  font-weight: 700;
  color: var(--text-main, #0f172a);
}

.blueprint-mount-area {
  margin-top: 4px;
}

.specs-details-block {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.specs-details-title {
  font-size: 0.84rem;
  font-weight: 700;
  color: var(--text-main, #0f172a);
}

.specs-bullet-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.specs-bullet-list li {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 0.82rem;
  color: var(--text-secondary, #334155);
  line-height: 1.65;
}

.bullet-dot {
  color: var(--neon, #4f46e5);
  font-weight: 800;
  font-size: 1rem;
}

@keyframes pulseGlow {
  0%, 100% {
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.3);
  }
  50% {
    box-shadow: 0 0 0 6px rgba(79, 70, 229, 0.1);
  }
}

.drawer-slide-enter-active,
.drawer-slide-leave-active {
  transition: all 0.25s ease-out;
}

.drawer-slide-enter-from,
.drawer-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (max-width: 640px) {
  .project-editorial-card {
    padding: 16px 14px;
    border-radius: 14px;
    gap: 10px;
  }

  .proj-top h3 {
    font-size: 1.05rem;
  }

  .project-specs-panel {
    padding: 14px 12px;
  }

  .filter-chip-btn {
    padding: 5px 12px;
    font-size: 0.76rem;
  }
}

@media (max-width: 480px) {
  .meta-line {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }

  .toggle-specs-btn {
    width: 100%;
    justify-content: center;
    padding: 8px 12px;
  }
}
</style>

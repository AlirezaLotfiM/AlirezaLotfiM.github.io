<script setup>
import { computed, defineAsyncComponent, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { usePortfolio } from '../../../composables/usePortfolio';
import { useTilt } from '../../../composables/useTilt';
import { getProjectPath, useNavigation } from '../../../composables/useNavigation';

const { projects, filteredProjects, availableLanguages, activeFilter, getTechDetails } = usePortfolio();
const { handleCardTilt, resetCard } = useTilt();
const { route, tabPaths, navigateFromEvent } = useNavigation();
const copiedLink = ref(false);
const highlightedSlug = ref('');

const highlightProject = async (slug) => {
  if (!slug) return;
  highlightedSlug.value = slug;
  await nextTick();
  const targetId = `project-${slug}`;
  const el = document.getElementById(targetId);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  setTimeout(() => {
    if (highlightedSlug.value === slug) {
      highlightedSlug.value = '';
    }
  }, 3500);
};

const checkAndHighlightHash = () => {
  const hash = window.location.hash;
  if (hash && hash.startsWith('#project-')) {
    const slug = hash.replace('#project-', '');
    highlightProject(slug);
  }
};

onMounted(() => {
  checkAndHighlightHash();
  window.addEventListener('hashchange', checkAndHighlightHash);
});

onUnmounted(() => {
  window.removeEventListener('hashchange', checkAndHighlightHash);
});

const getTechList = (langString) => {
  if (!langString) return [];
  return langString.split(/\s*\/\s*/).map((l) => getTechDetails(l));
};

const selectedProject = computed(() =>
  projects.value.find((project) => getProjectPath(project) === route.value.path),
);
</script>

<template>
  <div class="projects-shell">
    <article v-if="route.isProject && selectedProject" class="project-detail">
      <a
        :href="tabPaths.projects"
        class="project-back"
        @click="navigateFromEvent($event, tabPaths.projects)"
      >
        ➜ بازگشت به پروژه‌ها
      </a>

      <header class="project-hero">
        <div>
          <span class="project-kicker mono-ui" dir="ltr">case study / {{ selectedProject.status }}</span>
          <h1>{{ selectedProject.name }}</h1>
          <p>{{ selectedProject.description }}</p>
        </div>
        <div class="project-actions">
          <button
            class="share-btn mono-ui"
            @click="copyProjectLink(selectedProject)"
            :title="copiedLink ? 'کپی شد' : 'کپی لینک پروژه'"
          >
            {{ copiedLink ? 'کپی شد! ✅' : '🔗 کپی لینک' }}
          </button>
          <a
            v-if="selectedProject.html_url && selectedProject.html_url !== '#'"
            :href="selectedProject.html_url"
            target="_blank"
            rel="noopener noreferrer"
            class="source-btn"
          >
            مشاهده سورس
          </a>
          <button
            v-if="selectedProject.architecture"
            class="arch-btn mono-ui"
            @click="openArchitecture(selectedProject)"
          >
            architecture
          </button>
        </div>
      </header>

      <div class="project-facts">
        <div v-if="selectedProject.role">
          <span>نقش</span>
          <strong>{{ selectedProject.role }}</strong>
        </div>
        <div v-if="selectedProject.stackLabel">
          <span>فناوری‌ها</span>
          <strong dir="ltr">{{ selectedProject.stackLabel }}</strong>
        </div>
        <div v-if="selectedProject.architectureSummary">
          <span>معماری</span>
          <strong>{{ selectedProject.architectureSummary }}</strong>
        </div>
        <div v-if="selectedProject.scale">
          <span>مقیاس</span>
          <strong>{{ selectedProject.scale }}</strong>
        </div>
      </div>

      <section v-if="selectedProject.impact" class="case-section">
        <span class="section-label mono-ui">impact</span>
        <h2>اثر پروژه</h2>
        <p>{{ selectedProject.impact }}</p>
      </section>

      <section v-if="selectedProject.details?.length" class="case-section">
        <span class="section-label mono-ui">engineering details</span>
        <h2>جزئیات فنی</h2>
        <ul>
          <li v-for="detail in selectedProject.details" :key="detail">{{ detail }}</li>
        </ul>
      </section>
    </article>

    <div class="grid-list">

      <Teleport to="body">
        <div v-if="tooltip.visible"
            class="global-tech-tooltip"
            :style="{ top: tooltip.y + 'px', left: tooltip.x + 'px' }">
          {{ tooltip.text }}
        </div>
      </Teleport>

      <a v-if="!route.isProject" v-for="p in filteredProjects" :key="p.id" :id="`project-${p.slug}`" :href="getProjectPath(p)"
        :class="['grid-item', 'spotlight-card', { 'highlight-pulse': highlightedSlug === p.slug }]"
        @click="navigateFromEvent($event, getProjectPath(p))"
        @mousemove="handleCardTilt" @mouseleave="resetCard">
        <div class="spotlight-bg"></div>

        <div class="card-head">
          <div class="title-block">
            <span class="folder-icon">{{ p.isPrivate ? '[]' : '{}' }}</span>
            <h4>{{ p.name }}</h4>
          </div>

          <div v-if="p.status" class="card-metadata mono-ui" dir="ltr">
            <span class="meta-chip">{{ p.status }}</span>
          </div>
        </div>

        <p class="card-summary">{{ p.description }}</p>

        <div class="lang-container" v-if="p.language">
          <span
            v-for="tech in getTechList(p.language)"
            :key="tech.name"
            class="lang-badge"
            :style="{
              borderColor: tech.color,
              color: tech.color,
              background: tech.color + '15',
            }"
            @mouseenter="showTooltip($event, tech.name)"
            @mouseleave="hideTooltip"
          >
            <span class="dot" :style="{ background: tech.color }"></span>
            {{ tech.short }}
          </span>
        </div>

        <div class="detail-grid">
          <div v-if="p.role" class="detail-item">
            <span class="detail-label mono-ui" dir="ltr">role</span>
            <span class="detail-value">{{ p.role }}</span>
          </div>
          <div v-if="p.architectureSummary" class="detail-item">
            <span class="detail-label mono-ui" dir="ltr">architecture</span>
            <span class="detail-value">{{ p.architectureSummary }}</span>
          </div>
          <div class="detail-item" v-if="p.impact">
            <span class="detail-label mono-ui" dir="ltr">impact</span>
            <span class="detail-value">{{ p.impact }}</span>
          </div>
        </div>

        <div class="card-footer">
          <div class="footer-row">
            <span class="arrow-link">
              مطالعه پروژه &larr;
            </span>

            <button v-if="p.architecture" class="arch-btn mono-ui" @click.prevent="openArchitecture(p)">
              architecture
            </button>
          </div>
        </div>
      </a>
      <div v-if="!route.isProject && filteredProjects.length === 0" class="empty-state">
        پروژه‌ای یافت نشد.
      </div>
      <div v-if="route.isProject && !selectedProject" class="empty-state">
        این پروژه پیدا نشد.
        <a :href="tabPaths.projects" @click="navigateFromEvent($event, tabPaths.projects)">
          بازگشت به فهرست پروژه‌ها
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.projects-shell {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.project-detail {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.project-back {
  width: fit-content;
  color: var(--accent-strong);
  font-size: 0.85rem;
}

.project-hero,
.project-facts,
.case-section {
  border: 1px solid var(--panel-border);
  background: var(--item-bg);
  border-radius: 22px;
  padding: 24px;
}

.project-hero {
  display: flex;
  justify-content: space-between;
  gap: 24px;
}

.project-hero h1 {
  margin: 8px 0 12px;
  font-size: clamp(1.6rem, 4vw, 2.4rem);
}

.project-hero p,
.case-section p,
.case-section li {
  color: var(--text-secondary);
  line-height: 1.9;
}

.project-kicker,
.section-label {
  color: var(--neon);
  font-size: 0.72rem;
  letter-spacing: 0.08em;
}

.project-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 150px;
}

.source-btn,
.project-actions .arch-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--panel-border);
  border-radius: 12px;
  padding: 10px 14px;
  background: var(--item-hover-bg);
  color: var(--text-main);
}

.project-facts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
}

.project-facts div {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.project-facts span {
  color: var(--text-soft);
  font-size: 0.75rem;
}

.case-section h2 {
  margin: 8px 0 12px;
}

.case-section ul {
  margin: 0;
  padding-right: 20px;
}




.grid-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.grid-item {
  position: relative;
  text-decoration: none;
  color: var(--text-main);
  background: var(--item-bg);
  border: 1px solid var(--panel-border);
  border-radius: 20px;
  overflow: hidden;
  transition: 0.24s ease;
  padding: 20px 18px 16px;
  display: flex;
  flex-direction: column;
  min-height: 100%;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.05),
    0 12px 28px rgba(0, 0, 0, 0.15);
}

.grid-item:hover {
  border-color: var(--neon);
  background: var(--item-hover-bg);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.08),
    0 18px 34px rgba(0, 0, 0, 0.22);
}

.card-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 14px;
}

.title-block {
  display: flex;
  gap: 10px;
  align-items: baseline;
  min-width: 0;
}

.folder-icon {
  font-size: 0.85rem;
  color: var(--accent-strong);
  font-family: var(--font-mono);
}

.card-metadata {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 6px;
}

.grid-item h4 {
  margin: 0;
  font-size: 1.08rem;
  line-height: 1.5;
  min-height: calc(1.5em * 2);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-summary {
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.72;
  margin: 0 0 12px;
  min-height: calc(1.72em * 3);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.lang-container {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 14px;
  min-height: 34px;
  align-content: flex-start;
}

.lang-badge {
  font-size: 0.75rem;
  padding: 4px 8px;
  border-radius: 50px;
  border: 1px solid;
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 600;
  cursor: help;
  transition: transform 0.2s;
}

.lang-badge:hover {
  transform: translateY(-2px);
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  display: inline-block;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
  margin-top: auto;
  min-height: 0;
}

.detail-item {
  display: grid;
  grid-template-columns: minmax(84px, 96px) minmax(0, 1fr);
  align-items: start;
  column-gap: 14px;
  row-gap: 4px;
  padding-top: 10px;
  border-top: 1px solid var(--panel-border);
}

.detail-label {
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-soft);
  padding-top: 2px;
  white-space: nowrap;
}

.detail-value {
  font-size: 0.82rem;
  color: var(--text-main);
  line-height: 1.65;
  align-self: start;
  min-width: 0;
}

.card-footer {
  margin-top: 15px;
  font-size: 0.8rem;
  color: var(--accent-strong);
  border-top: 1px solid var(--panel-border);
  padding-top: 12px;
  min-height: 54px;
  display: flex;
  align-items: center;
}

.footer-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.arrow-link {
  color: var(--accent-strong);
  opacity: 0.7;
  transition: 0.3s;
}

.grid-item:hover .arrow-link {
  opacity: 1;
}

.arch-btn, .share-btn {
  border: 1px solid var(--panel-border);
  background: var(--item-bg);
  color: var(--accent-strong);
  border-radius: 12px;
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.85rem;
}
.arch-btn:hover, .share-btn:hover {
  background: var(--item-hover-bg);
  border-color: var(--neon);
}

.filter-toolbar {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px 18px;
  background: var(--item-bg);
  border: 1px solid var(--panel-border);
  border-radius: 16px;
  margin-bottom: 16px;
}

.filter-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.86rem;
  font-weight: 700;
  color: var(--text-main);
}

.filter-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 10px;
  background: var(--bar-bg);
  border: 1px solid var(--panel-border);
  color: var(--text-secondary);
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.filter-chip:hover {
  border-color: var(--neon);
  color: var(--text-main);
  background: var(--item-hover-bg);
}

.filter-chip.active {
  background: rgba(56, 189, 248, 0.15);
  border-color: var(--neon);
  color: var(--neon);
  box-shadow: 0 0 12px rgba(56, 189, 248, 0.25);
}

.chip-count {
  font-size: 0.72rem;
  padding: 1px 6px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid var(--panel-border);
  color: var(--text-soft);
  font-family: var(--font-mono, monospace);
}

.filter-chip.active .chip-count {
  background: var(--neon);
  color: #040814;
  border-color: var(--neon);
  font-weight: 700;
}

@media (max-width: 1024px) {
  .project-hero {
    flex-direction: column;
  }

  .project-actions {
    flex-direction: row;
  }

  .detail-item,
  .footer-row {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  .detail-item {
    gap: 6px;
  }

  .grid-item h4,
  .card-summary {
    min-height: 0;
    display: block;
  }

  .lang-container,
  .card-footer {
    min-height: 0;
  }
}

@keyframes neonPulse {
  0% {
    box-shadow: inset 0 0 0 2px #38bdf8, 0 0 12px 2px rgba(56, 189, 248, 0.5);
    border-color: #38bdf8;
  }
  50% {
    box-shadow: inset 0 0 0 2px #38bdf8, 0 0 24px 6px rgba(56, 189, 248, 0.85);
    border-color: #38bdf8;
  }
  100% {
    box-shadow: inset 0 0 0 2px #38bdf8, 0 0 12px 2px rgba(56, 189, 248, 0.5);
    border-color: #38bdf8;
  }
}

.highlight-pulse {
  animation: neonPulse 1.1s ease-in-out 3 !important;
  border-color: #38bdf8 !important;
  transition: all 0.6s ease !important;
  position: relative;
  z-index: 10;
}
</style>

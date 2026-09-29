<script setup>
import { usePortfolio } from '../../composables/usePortfolio';
import { useAudioSynth } from '../../composables/useAudioSynth';
import { useI18n } from '../../composables/useI18n';
import { useNavigation } from '../../composables/useNavigation';

const props = defineProps({
  activeSection: {
    type: String,
    default: 'experience'
  },
  activeSubItem: {
    type: String,
    default: ''
  },
  sectionRoutes: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['scroll-to-section', 'scroll-to-target', 'show-qr', 'scroll-top']);

const { downloadVCard } = usePortfolio();
const { playClick } = useAudioSynth();
const { t, isRtl } = useI18n();
const { tabPaths, navigateFromEvent } = useNavigation();

const treeNavGroups = [
  {
    id: 'experience',
    badgeFa: '۰۱',
    badgeEn: '01',
    titleKey: 'expTitle',
    items: [
      { id: 'exp-card-1', label: 'شرکت نداپرداز انفورماتیک', targetId: 'exp-card-1' },
      { id: 'exp-card-2', label: 'پروژه‌های سازمانی بیودارو', targetId: 'exp-card-2' }
    ]
  },
  {
    id: 'projects',
    badgeFa: '۰۲',
    badgeEn: '02',
    titleKey: 'projectsTitle',
    items: [
      { id: 'project-legacy-queue-systems', label: 'پلتفرم نوبت‌دهی شعب نداپرداز', targetId: 'project-legacy-queue-systems' },
      { id: 'project-biodaru-qms', label: 'سامانه متمرکز بیودارو (QMS)', targetId: 'project-biodaru-qms' },
      { id: 'project-nava-music-player', label: 'موزیک‌پلیر نوا (Vibe Coding)', targetId: 'project-nava-music-player' },
      { id: 'project-biodaroo-training-suite', label: 'سامانه آموزش پرسنل بیودارو', targetId: 'project-biodaroo-training-suite' }
    ]
  },
  {
    id: 'skills',
    badgeFa: '۰۳',
    badgeEn: '03',
    titleKey: 'skillsTitle',
    items: []
  },
  {
    id: 'notes',
    badgeFa: '۰۴',
    badgeEn: '04',
    titleKey: 'notesTitle',
    items: []
  }
];

const handleCategoryClick = (groupId, event) => {
  if (event) event.preventDefault();
  playClick();
  emit('scroll-to-section', groupId);
};

const handleSubClick = (targetId, event) => {
  if (event) event.preventDefault();
  playClick();
  emit('scroll-to-target', targetId);
};
</script>

<template>
  <aside class="editorial-tree-sidebar" :dir="isRtl ? 'rtl' : 'ltr'">
    <div class="tree-sidebar-inner">
      <!-- Hierarchical Tree Navigation -->
      <nav class="tree-nav-container" aria-label="فهرست محتوای تخصصی">
        <div
          v-for="group in treeNavGroups"
          :key="group.id"
          class="tree-group-block"
          :class="{ 'group-active': activeSection === group.id }"
        >
          <!-- Category Header Link -->
          <a
            :href="sectionRoutes[group.id] || ('#' + group.id)"
            @click="handleCategoryClick(group.id, $event)"
            class="tree-category-btn"
            :class="{ active: activeSection === group.id }"
          >
            <span class="tree-badge mono-ui" dir="ltr">{{ isRtl ? group.badgeFa : group.badgeEn }}</span>
            <span class="tree-category-name">{{ t(group.titleKey) }}</span>
            <span v-if="activeSection === group.id" class="category-glow-dot"></span>
          </a>

          <!-- Nested Sub-Items Tree -->
          <ul v-if="group.items && group.items.length" class="tree-sub-list">
            <li
              v-for="sub in group.items"
              :key="sub.id"
              class="tree-sub-leaf"
              :class="{ 'leaf-active': activeSubItem === sub.targetId }"
            >
              <a
                :href="'#' + sub.targetId"
                @click="handleSubClick(sub.targetId, $event)"
                class="tree-leaf-link"
              >
                <span class="tree-leaf-dot"></span>
                <span class="tree-leaf-title">{{ sub.label }}</span>
              </a>
            </li>
          </ul>
        </div>
      </nav>

      <!-- Bottom Utility Bar -->
      <div class="tree-sidebar-footer">
        <a :href="tabPaths.resume" @click="navigateFromEvent($event, tabPaths.resume)" class="tree-resume-pill">
          <span>{{ t('resumeBtn') }}</span>
          <span class="mono-ui">PDF ↗</span>
        </a>

        <div class="tree-utility-chips">
          <button @click="downloadVCard" class="tree-chip-btn" title="ذخیره کارت ویزیت (vCard)" type="button">
            📇 vCard
          </button>
          <button @click="emit('show-qr')" class="tree-chip-btn" title="نمایش کد QR" type="button">
            📱 QR
          </button>
        </div>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.editorial-tree-sidebar {
  width: 280px;
  flex-shrink: 0;
  position: sticky;
  top: 88px;
  height: calc(100vh - 108px);
  box-sizing: border-box;
  padding: 6px 0 14px;
  z-index: 40;
}

/* FROSTED GLASS DOCK (Matt Trice InPageNavigation Card Style) */
.tree-sidebar-inner {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  box-sizing: border-box;
  background: rgba(255, 255, 255, 0.76);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--panel-border, rgba(226, 232, 240, 0.8));
  border-radius: 18px;
  padding: 16px 12px;
  box-shadow: 0 4px 20px -2px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(15, 23, 42, 0.02);
  transition: all 0.25s ease;
}

:global([data-theme="space-glass"]) .tree-sidebar-inner,
:global([data-theme="dark"]) .tree-sidebar-inner {
  background: rgba(15, 23, 42, 0.72);
  border-color: rgba(255, 255, 255, 0.08);
  box-shadow: 0 16px 36px -8px rgba(0, 0, 0, 0.45);
}

/* TREE NAVIGATION CONTAINER */
.tree-nav-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
  scrollbar-width: none;
  padding: 2px 2px 8px;
}

.tree-nav-container::-webkit-scrollbar {
  display: none;
}

.tree-group-block {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

/* CATEGORY ITEM (Matt Trice Full-Width Action Chip) */
.tree-category-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 10px;
  border-radius: 8px;
  text-decoration: none;
  color: var(--text-secondary, #475569);
  font-size: 0.82rem;
  font-weight: 600;
  transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  user-select: none;
  background: transparent;
}

.tree-category-btn:hover {
  color: var(--text-main, #0f172a);
  background: rgba(0, 0, 0, 0.04);
}

:global([data-theme="space-glass"]) .tree-category-btn:hover,
:global([data-theme="dark"]) .tree-category-btn:hover {
  color: #f8fafc;
  background: rgba(255, 255, 255, 0.06);
}

.tree-category-btn.active {
  color: var(--neon, #0284c7);
  background: rgba(2, 132, 199, 0.08);
  font-weight: 700;
}

:global([data-theme="space-glass"]) .tree-category-btn.active,
:global([data-theme="dark"]) .tree-category-btn.active {
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.12);
}

/* MONO NUMERICAL BADGE */
.tree-badge {
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--text-soft, #94a3b8);
  background: rgba(0, 0, 0, 0.04);
  padding: 1px 5px;
  border-radius: 4px;
  transition: all 0.18s ease;
}

:global([data-theme="space-glass"]) .tree-badge,
:global([data-theme="dark"]) .tree-badge {
  background: rgba(255, 255, 255, 0.06);
  color: #94a3b8;
}

.tree-category-btn.active .tree-badge {
  color: var(--neon, #0284c7);
  background: rgba(2, 132, 199, 0.14);
}

:global([data-theme="space-glass"]) .tree-category-btn.active .tree-badge,
:global([data-theme="dark"]) .tree-category-btn.active .tree-badge {
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.2);
}

.tree-category-name {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ACTIVE GLOWING DOT INDICATOR */
.category-glow-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--neon, #0284c7);
  box-shadow: 0 0 6px var(--neon, #0284c7);
  flex-shrink: 0;
}

:global([data-theme="space-glass"]) .category-glow-dot,
:global([data-theme="dark"]) .category-glow-dot {
  background: #38bdf8;
  box-shadow: 0 0 8px #38bdf8;
}

/* SUB-LIST ITEMS (Nested Tree Leaves) */
.tree-sub-list {
  list-style: none;
  margin: 0;
  padding: 0;
  margin-right: 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

:global([dir="ltr"]) .tree-sub-list {
  margin-right: 0;
  margin-left: 8px;
}

.tree-sub-leaf {
  position: relative;
}

.tree-leaf-link {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 4px 8px;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-soft, #64748b);
  text-decoration: none;
  border-radius: 6px;
  transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
  user-select: none;
}

.tree-leaf-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--panel-border, #cbd5e1);
  transition: all 0.18s ease;
  flex-shrink: 0;
}

:global([data-theme="space-glass"]) .tree-leaf-dot,
:global([data-theme="dark"]) .tree-leaf-dot {
  background: rgba(255, 255, 255, 0.2);
}

.tree-leaf-link:hover {
  color: var(--text-main, #0f172a);
  background: rgba(0, 0, 0, 0.035);
}

:global([data-theme="space-glass"]) .tree-leaf-link:hover,
:global([data-theme="dark"]) .tree-leaf-link:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.05);
}

.tree-sub-leaf.leaf-active .tree-leaf-link {
  color: var(--text-main, #0f172a);
  background: rgba(0, 0, 0, 0.045);
  font-weight: 600;
}

:global([data-theme="space-glass"]) .tree-sub-leaf.leaf-active .tree-leaf-link,
:global([data-theme="dark"]) .tree-sub-leaf.leaf-active .tree-leaf-link {
  color: #f8fafc;
  background: rgba(255, 255, 255, 0.07);
}

.tree-sub-leaf.leaf-active .tree-leaf-dot {
  background: var(--neon, #0284c7);
  box-shadow: 0 0 6px var(--neon, #0284c7);
  transform: scale(1.3);
}

:global([data-theme="space-glass"]) .tree-sub-leaf.leaf-active .tree-leaf-dot,
:global([data-theme="dark"]) .tree-sub-leaf.leaf-active .tree-leaf-dot {
  background: #38bdf8;
  box-shadow: 0 0 6px #38bdf8;
}

.tree-leaf-title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* BOTTOM UTILITY DOCK */
.tree-sidebar-footer {
  border-top: 1px solid var(--panel-border, rgba(226, 232, 240, 0.8));
  padding-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 7px;
}

:global([data-theme="space-glass"]) .tree-sidebar-footer,
:global([data-theme="dark"]) .tree-sidebar-footer {
  border-color: rgba(255, 255, 255, 0.08);
}

.tree-resume-pill {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 7px 11px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.03);
  border: 1px solid var(--panel-border, rgba(226, 232, 240, 0.8));
  color: var(--text-main, #0f172a);
  text-decoration: none;
  font-size: 0.78rem;
  font-weight: 600;
  transition: all 0.18s ease;
}

:global([data-theme="space-glass"]) .tree-resume-pill,
:global([data-theme="dark"]) .tree-resume-pill {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.08);
  color: #f8fafc;
}

.tree-resume-pill:hover {
  border-color: var(--neon, #0284c7);
  color: var(--neon, #0284c7);
  background: rgba(2, 132, 199, 0.06);
}

:global([data-theme="space-glass"]) .tree-resume-pill:hover,
:global([data-theme="dark"]) .tree-resume-pill:hover {
  border-color: #38bdf8;
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.1);
}

.tree-utility-chips {
  display: flex;
  gap: 6px;
}

.tree-chip-btn {
  flex: 1;
  padding: 5px 8px;
  border-radius: 7px;
  background: transparent;
  border: 1px solid var(--panel-border, rgba(226, 232, 240, 0.8));
  color: var(--text-soft, #64748b);
  font-size: 0.72rem;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  transition: all 0.18s ease;
}

:global([data-theme="space-glass"]) .tree-chip-btn,
:global([data-theme="dark"]) .tree-chip-btn {
  border-color: rgba(255, 255, 255, 0.08);
  color: #94a3b8;
}

.tree-chip-btn:hover {
  color: var(--text-main, #0f172a);
  border-color: var(--neon, #0284c7);
  background: rgba(0, 0, 0, 0.03);
}

:global([data-theme="space-glass"]) .tree-chip-btn:hover,
:global([data-theme="dark"]) .tree-chip-btn:hover {
  color: #ffffff;
  border-color: #38bdf8;
  background: rgba(255, 255, 255, 0.05);
}

@media (max-width: 1024px) {
  .editorial-tree-sidebar {
    display: none;
  }
}
</style>

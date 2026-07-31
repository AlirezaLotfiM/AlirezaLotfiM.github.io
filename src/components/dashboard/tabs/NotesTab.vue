<script setup>
import { ref } from 'vue';
import { usePortfolio } from '../../../composables/usePortfolio';
import { useMarkdown } from '../../../composables/useMarkdown';
import { useTilt } from '../../../composables/useTilt';
import { getNotePath, useNavigation } from '../../../composables/useNavigation';

const {
  notes,
  selectedNote,
  noteComments,
  loadingComments,
  closeNote
} = usePortfolio();

const { parseMarkdown } = useMarkdown();
const { handleCardTilt, resetCard } = useTilt();
const { tabPaths, navigateFromEvent } = useNavigation();

const shareTooltip = ref("کپی لینک");
const props = defineProps(['isZenMode']);
const emit = defineEmits(['toggle-zen']);

const shareNote = () => {
  if (!selectedNote.value) return;
  navigator.clipboard.writeText(window.location.href);
  shareTooltip.value = "لینک کپی شد! ✅";
  setTimeout(() => {
    shareTooltip.value = "کپی لینک";
  }, 2000);
};

const closeNoteView = (event) => {
  closeNote();
  navigateFromEvent(event, tabPaths.notes);
};

</script>

<template>
  <div class="notes-container">
    <!-- Detail View -->
    <article v-if="selectedNote" class="thread-view">
      <div class="thread-shell-tag mono-ui" dir="ltr">notes/thread :: active</div>
      <header class="thread-header">
        <div class="note-meta">
          <h1>{{ selectedNote.title }}</h1>
          <div class="meta-row">
            <span class="post-date">{{
              new Date(selectedNote.created_at).toLocaleDateString(
                "fa-IR",
              )
            }}</span>
            <div class="tag-container inline" v-if="selectedNote.labels && selectedNote.labels.length">
              <span v-for="label in selectedNote.labels" :key="label.id" class="tag-pill" :style="{
                borderColor: '#' + label.color,
                color: '#' + label.color,
                backgroundColor: '#' + label.color + '15',
              }">{{ label.name }}</span>
            </div>
          </div>
        </div>
        <div class="header-left">
          <button @click="shareNote" class="icon-btn share-btn" :title="shareTooltip">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          </button>
          <button @click="emit('toggle-zen')" class="icon-btn zen-btn" :class="{ active: isZenMode }"
            :title="isZenMode ? 'خروج از تمرکز' : 'حالت تمرکز'">
            <svg v-if="!isZenMode" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
            </svg>
            <svg v-else viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 14h6v6M20 10h-6V4M14 10l7-7M10 14l-7 7" />
            </svg>
          </button>
          <a :href="tabPaths.notes" @click="closeNoteView" class="back-btn">
            ➜ بازگشت به یادداشت‌ها
          </a>
        </div>
      </header>
      <div class="thread-content scroll-area">
        <div class="content-block main-post">
          <div class="block-body" v-html="parseMarkdown(selectedNote.body)"></div>
        </div>
        <div v-if="noteComments.length > 0" class="update-separator">
          <span>بروزرسانی‌ها</span>
        </div>
        <div v-if="loadingComments" class="loading-bubble">
          در حال دریافت...
        </div>
        <div v-for="comment in noteComments" :key="comment.id" class="content-block update-post">
          <div class="update-header">
            <span class="update-badge">UPDATE</span><span class="update-date">{{
              new Date(comment.created_at).toLocaleDateString("fa-IR")
            }}</span>
          </div>
          <div class="block-body" v-html="parseMarkdown(comment.body)"></div>
        </div>
      </div>
    </article>

    <!-- List View -->
    <ul v-else class="notes-list">
      <li v-for="n in notes" :key="n.id">
        <a
          :href="getNotePath(n)"
          class="note-row spotlight-card"
          @click="navigateFromEvent($event, getNotePath(n))"
          @mousemove="handleCardTilt"
          @mouseleave="resetCard"
        >
          <div class="spotlight-bg"></div>
          <div class="note-inner">
          <div class="note-head">
            <h4><span class="note-icon">📝</span> {{ n.title }}</h4>
          </div>
          <div class="tag-container" v-if="n.labels && n.labels.length">
            <span v-for="label in n.labels" :key="label.id" class="tag-pill" :style="{
              borderColor: '#' + label.color,
              color: '#' + label.color,
              backgroundColor: '#' + label.color + '15',
            }">{{ label.name }}</span>
          </div>
          <p class="note-preview">
            {{
              n.body
                ? n.body.substring(0, 140) +
                (n.body.length > 140 ? "..." : "")
                : "بدون توضیحات..."
            }}
          </p>
          <div class="note-footer">
            <span class="date">{{
              new Date(n.created_at).toLocaleDateString("fa-IR")
            }}</span><span class="read-btn">مطالعه یادداشت &larr;</span>
          </div>
          </div>
        </a>
      </li>
      <li v-if="notes.length === 0" class="empty-state">
        <p>هنوز یادداشتی منتشر نشده است.</p>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.notes-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.notes-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.note-row {
  padding: 22px 24px;
  border-radius: 20px;
  background: var(--item-bg);
  border: 1px solid var(--panel-border);
  border-right: 4px solid var(--neon);
  position: relative;
  overflow: hidden;
  display: block;
  text-decoration: none;
  color: var(--text-main);
  transition: all 0.25s ease;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.04),
    0 10px 26px rgba(0, 0, 0, 0.14);
}

.note-row:hover {
  border-color: var(--neon);
  background: var(--item-hover-bg);
  transform: translateY(-2px);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.08),
    0 16px 32px rgba(0, 0, 0, 0.22);
}

.note-inner {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.note-head h4 {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-main);
  display: flex;
  align-items: center;
  gap: 10px;
  line-height: 1.4;
}

.thread-shell-tag {
  margin-bottom: 12px;
  font-size: 0.75rem;
  color: var(--text-soft);
  letter-spacing: 0.05em;
}

.note-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
}

.note-preview {
  font-size: 0.92rem;
  color: var(--text-secondary);
  line-height: 1.75;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.note-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  padding-top: 12px;
  border-top: 1px solid var(--panel-border);
}

.date {
  font-size: 0.8rem;
  color: var(--text-muted);
  font-family: var(--font-mono);
}

.read-btn {
  font-size: 0.85rem;
  color: var(--accent-strong);
  font-weight: 600;
  transition: all 0.25s ease;
  display: flex;
  align-items: center;
  gap: 4px;
}

.note-row:hover .read-btn {
  color: var(--neon);
  transform: translateX(-4px);
}

/* Thread View Styles */
.thread-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  animation: fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.thread-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding-bottom: 18px;
  border-bottom: 1px solid var(--panel-border);
  margin-bottom: 22px;
  gap: 16px;
  flex-wrap: wrap;
}

.note-meta {
  flex: 1;
  min-width: 250px;
}

.note-meta h1 {
  margin: 0 0 10px 0;
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--text-main);
  line-height: 1.4;
  border-bottom: none;
  padding-bottom: 0;
}

.header-left {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-shrink: 0;
}

.icon-btn {
  background: var(--item-bg);
  border: 1px solid var(--panel-border);
  color: var(--text-secondary);
  width: 38px;
  height: 38px;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s ease;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

.icon-btn:hover,
.icon-btn.active {
  background: var(--item-hover-bg);
  border-color: var(--neon);
  color: var(--text-main);
  transform: translateY(-1px);
}

.back-btn {
  background: var(--item-bg);
  border: 1px solid var(--panel-border);
  color: var(--text-secondary);
  padding: 8px 14px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.25s ease;
  font-family: inherit;
  font-size: 0.85rem;
  font-weight: 600;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

.back-btn:hover {
  background: var(--item-hover-bg);
  color: var(--text-main);
  border-color: var(--neon);
  transform: translateY(-1px);
}

.post-date {
  font-size: 0.8rem;
  color: var(--text-muted);
  font-family: var(--font-mono);
}

.thread-content {
  flex: 1;
  overflow-y: auto;
  padding-right: 4px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.content-block {
  padding: 24px;
  border-radius: 20px;
  line-height: 1.85;
  font-size: 0.96rem;
  background: var(--item-bg);
  border: 1px solid var(--panel-border);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.04),
    0 10px 28px rgba(0, 0, 0, 0.12);
}

.main-post {
  background: var(--item-bg);
  border: 1px solid var(--panel-border);
}

.update-separator {
  display: flex;
  align-items: center;
  color: var(--accent-strong);
  font-size: 0.82rem;
  font-weight: 600;
  margin: 12px 0;
}

.update-separator::before,
.update-separator::after {
  content: "";
  flex: 1;
  height: 1px;
  background: var(--panel-border);
  margin: 0 12px;
}

.update-post {
  background: var(--item-bg);
  border: 1px solid var(--panel-border);
  border-right: 4px solid var(--neon);
}

.update-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 0.78rem;
}

.update-badge {
  background: var(--neon);
  color: #040814;
  padding: 3px 8px;
  border-radius: 6px;
  font-weight: 700;
  font-size: 0.7rem;
  letter-spacing: 0.05em;
}

.update-date {
  color: var(--text-muted);
  font-family: var(--font-mono);
}

.block-body {
  color: var(--text-main);
  line-height: 1.85;
}

.loading-bubble {
  text-align: center;
  color: var(--neon);
  font-style: italic;
  padding: 16px;
}

.meta-row {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 6px;
  flex-wrap: wrap;
}

/* Markdown specific styles */
:deep(.block-body p) {
  margin-bottom: 1.15em;
  color: var(--text-main);
}

:deep(.block-body img),
:deep(.note-inner img) {
  max-width: 100% !important;
  height: auto !important;
  border-radius: 12px;
  margin: 14px 0;
  border: 1px solid var(--panel-border);
  display: block;
}

:deep(.block-body code.inline-code),
:deep(.block-body :not(pre) > code) {
  font-family: var(--font-mono, monospace);
  background: var(--item-hover-bg);
  padding: 3px 7px;
  border-radius: 6px;
  color: var(--neon);
  font-size: 0.88rem;
  border: 1px solid var(--panel-border);
}

:deep(.block-body a) {
  color: var(--neon);
  text-decoration: underline;
  text-underline-offset: 3px;
  transition: opacity 0.2s;
}

:deep(.block-body a:hover) {
  opacity: 0.85;
}

:deep(.block-body h1),
:deep(.block-body h2),
:deep(.block-body h3),
:deep(.block-body h4) {
  color: var(--text-main);
  font-weight: 700;
  margin-top: 1.6em;
  margin-bottom: 0.6em;
  line-height: 1.4;
}

:deep(.block-body h1) {
  font-size: 1.35rem;
  border-bottom: 1px solid var(--panel-border);
  padding-bottom: 8px;
}

:deep(.block-body h2) {
  font-size: 1.2rem;
}

:deep(.block-body h3) {
  font-size: 1.05rem;
}

:deep(.block-body ul),
:deep(.block-body ol) {
  padding-right: 22px;
  margin-bottom: 1.15em;
  color: var(--text-main);
}

:deep(.block-body li) {
  margin-bottom: 6px;
  line-height: 1.7;
}

:deep(.block-body blockquote) {
  border-right: 4px solid var(--neon);
  border-left: none;
  padding: 12px 18px;
  margin: 16px 0;
  color: var(--text-secondary);
  background: var(--item-hover-bg);
  border-radius: 8px;
}

:deep(.block-body pre.code-block) {
  background: #080c16;
  padding: 18px;
  border-radius: 12px;
  overflow-x: auto;
  border: 1px solid var(--panel-border);
  margin: 16px 0;
  direction: ltr;
  text-align: left;
  box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.4);
}

:deep(.block-body pre.code-block code) {
  font-family: "Fira Code", "Consolas", "Monaco", monospace;
  font-size: 0.88rem;
  color: #e2e8f0;
  line-height: 1.6;
  white-space: pre;
}

:deep(.block-body table) {
  width: 100%;
  border-collapse: collapse;
  margin: 18px 0;
  overflow-x: auto;
  display: block;
}

:deep(.block-body th),
:deep(.block-body td) {
  border: 1px solid var(--panel-border);
  padding: 10px 14px;
  text-align: right;
}

:deep(.block-body th) {
  background: var(--item-hover-bg);
  color: var(--accent-strong);
  font-weight: 600;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>

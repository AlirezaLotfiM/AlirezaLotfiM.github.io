<script setup>
import { ref } from 'vue';
import { usePortfolio } from '../../../composables/usePortfolio';
import { useMarkdown } from '../../../composables/useMarkdown';
import { useTilt } from '../../../composables/useTilt';

const {
  notes,
  selectedNote,
  noteComments,
  loadingComments,
  openNote,
  closeNote
} = usePortfolio();

const { parseMarkdown } = useMarkdown();
const { handleCardTilt, resetCard } = useTilt();

const shareTooltip = ref("کپی لینک");
const props = defineProps(['isZenMode']);
const emit = defineEmits(['toggle-zen']);

const shareNote = () => {
  if (!selectedNote.value) return;
  navigator.clipboard.writeText(selectedNote.value.html_url);
  shareTooltip.value = "لینک کپی شد! ✅";
  setTimeout(() => {
    shareTooltip.value = "کپی لینک";
  }, 2000);
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
            🔗
          </button>
          <button @click="emit('toggle-zen')" class="icon-btn zen-btn" :class="{ active: isZenMode }"
            :title="isZenMode ? 'خروج از تمرکز' : 'حالت تمرکز'">
            {{ isZenMode ? "✕" : "👁️" }}
          </button>
          <button @click="closeNote" class="back-btn">
            ➜ بازگشت
          </button>
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
      <li v-for="n in notes" :key="n.id" class="note-row spotlight-card" @click="openNote(n)"
        @mousemove="handleCardTilt" @mouseleave="resetCard" style="cursor: pointer">
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
            }}</span><span class="read-btn">بخوانید &larr;</span>
          </div>
        </div>
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
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.note-row {
  padding: 22px 24px;
  border-radius: 20px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(235, 245, 252, 0.76));
  border: 1px solid rgba(207, 223, 239, 1);
  border-left: 2px solid rgba(92, 144, 199, 0.18);
  position: relative;
  overflow: hidden;
  display: block;
  text-decoration: none;
  color: var(--text-main);
  transition: 0.24s ease;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.86),
    0 12px 28px rgba(77, 121, 168, 0.08);
}

.note-row:hover {
  border-color: rgba(192, 212, 232, 1);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(232, 243, 252, 0.86));
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.92),
    0 18px 34px rgba(77, 121, 168, 0.12);
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
  font-size: 1.1rem;
  color: var(--text-main);
  display: flex;
  align-items: center;
  gap: 8px;
}

.thread-shell-tag {
  margin-bottom: 10px;
  font-size: 0.72rem;
  color: var(--text-soft);
}

.note-icon {
  font-size: 1.2rem;
}

.note-preview {
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.72;
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
  padding-top: 10px;
  border-top: 1px solid rgba(214, 229, 243, 0.96);
}

.date {
  font-size: 0.8rem;
  color: var(--text-secondary);
  font-family: var(--font-mono);
}

.read-btn {
  font-size: 0.85rem;
  color: var(--accent-strong);
  opacity: 0.8;
  transition: 0.3s;
}

.note-row:hover .read-btn {
  opacity: 1;
  transform: translateX(-5px);
}

/* Thread View Styles */
.thread-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  animation: fadeIn 0.3s;
}

.thread-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(214, 229, 243, 0.96);
  margin-bottom: 20px;
  direction: rtl;
}

.header-left {
  display: flex;
  gap: 10px;
  align-items: center;
}

.back-btn {
  background: rgba(245, 250, 255, 0.94);
  border: 1px solid rgba(209, 225, 240, 1);
  color: var(--text-secondary);
  padding: 7px 12px;
  border-radius: 12px;
  cursor: pointer;
  transition: 0.2s;
  font-family: inherit;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

.back-btn:hover {
  background: rgba(94, 144, 196, 0.96);
  color: #fff;
  border-color: rgba(86, 129, 177, 1);
}

.note-meta h1 {
  margin: 0;
  font-size: 1.3rem; /* Slightly larger for H1 */
  color: var(--text-main);
  border-bottom: none; /* Reset if global H1 has border */
  padding-bottom: 0;
}

.post-date {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.thread-content {
  flex: 1;
  overflow-y: auto;
  padding-right: 5px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.content-block {
  padding: 22px;
  border-radius: 20px;
  line-height: 1.7;
  font-size: 0.95rem;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.86),
    0 12px 28px rgba(77, 121, 168, 0.08);
}

.main-post {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.94), rgba(235, 245, 252, 0.78));
  border: 1px solid rgba(207, 223, 239, 1);
}

.update-separator {
  display: flex;
  align-items: center;
  color: var(--accent-strong);
  font-size: 0.8rem;
  margin: 10px 0;
}

.update-separator::before,
.update-separator::after {
  content: "";
  flex: 1;
  height: 1px;
  background: var(--accent-strong);
  opacity: 0.3;
  margin: 0 10px;
}

.update-post {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(235, 245, 252, 0.74));
  border: 1px solid rgba(207, 223, 239, 1);
  border-right: 4px solid rgba(92, 144, 199, 0.92);
}

.update-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 0.75rem;
}

.update-badge {
  background: var(--neon);
  color: #000;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: bold;
}

.update-date {
  color: var(--text-muted);
}

.block-body {
  color: var(--text-main);
}

.loading-bubble {
  text-align: center;
  color: var(--neon);
  font-style: italic;
}

.meta-row {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-top: 5px;
  flex-wrap: wrap;
}

/* Markdown specific styles */
:deep(.md-image),
:deep(.block-body img),
:deep(.note-inner img) {
  max-width: 100% !important;
  height: auto !important;
  border-radius: 10px;
  margin: 10px 0;
  border: 1px solid var(--panel-border);
  display: block;
}

:deep(.inline-code) {
  font-family: monospace;
  background: var(--item-hover-bg);
  padding: 2px 5px;
  border-radius: 4px;
  color: var(--neon);
}

:deep(a) {
  color: var(--neon);
  text-decoration: underline;
}

:deep(h1),
:deep(h2),
:deep(h3) {
  color: var(--text-main);
  margin-top: 1.5em;
  margin-bottom: 0.5em;
}

:deep(h1) {
  border-bottom: 1px solid var(--panel-border);
  padding-bottom: 10px;
}

:deep(ul),
:deep(ol) {
  padding-right: 20px;
  color: var(--text-main);
}

:deep(li) {
  margin-bottom: 5px;
}

:deep(blockquote) {
  border-right: 3px solid var(--neon);
  padding-right: 15px;
  margin: 15px 0;
  color: var(--text-secondary);
  background: var(--item-bg);
  padding: 10px;
  border-radius: 4px;
}

:deep(pre.code-block) {
  background: var(--bg-main);
  padding: 15px;
  border-radius: 8px;
  overflow-x: auto;
  border: 1px solid var(--panel-border);
  margin: 15px 0;
  direction: ltr;
  text-align: left;
}

:deep(pre.code-block code) {
  font-family: "Consolas", "Monaco", "Courier New", monospace;
  font-size: 0.9rem;
  color: var(--text-main);
  white-space: pre-wrap;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

</style>

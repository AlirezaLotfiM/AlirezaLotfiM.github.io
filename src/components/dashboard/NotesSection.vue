<script setup>
import { ref } from 'vue';
import { usePortfolio } from '../../composables/usePortfolio';
import { useI18n } from '../../composables/useI18n';
import { useAudioSynth } from '../../composables/useAudioSynth';
import { useMarkdown } from '../../composables/useMarkdown';

const emit = defineEmits(['open-note']);

const { notes } = usePortfolio();
const { t, isRtl } = useI18n();
const { playClick } = useAudioSynth();
const { parseMarkdown } = useMarkdown();

const activeReadingNote = ref(null);
const copyNoteTooltip = ref('کپی لینک');

const toPersianDigits = (num) => {
  const faDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(num).replace(/\d/g, (d) => faDigits[d]);
};

const calcReadingTime = (body) => {
  if (!body) return isRtl.value ? '۱ دقیقه مطالعه' : '1 min read';
  const words = body.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.round(words / 180));
  if (!isRtl.value) {
    return `${minutes} min read`;
  }
  return `${toPersianDigits(minutes)} دقیقه مطالعه`;
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  try {
    const locale = isRtl.value ? 'fa-IR' : 'en-US';
    return new Date(dateStr).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return dateStr;
  }
};

const getSnippet = (body) => {
  if (!body) return '';
  return body
    .replace(/```[\s\S]*?```/g, '')
    .replace(/[#*`_>\[\]()!-]/g, '')
    .trim()
    .slice(0, 110) + '...';
};

const openNote = (note) => {
  playClick();
  activeReadingNote.value = note;
  emit('open-note', note);
};

const closeDrawer = () => {
  activeReadingNote.value = null;
  copyNoteTooltip.value = 'کپی لینک';
};

const copyNoteLink = () => {
  if (!activeReadingNote.value) return;
  const url = `${window.location.origin}/notes/${activeReadingNote.value.slug || activeReadingNote.value.id}/`;
  navigator.clipboard.writeText(url);
  copyNoteTooltip.value = 'لینک کپی شد! ✅';
  setTimeout(() => {
    copyNoteTooltip.value = 'کپی لینک';
  }, 2500);
};

defineExpose({
  openNoteDrawer: openNote
});
</script>

<template>
  <section id="notes" class="editorial-section" :dir="isRtl ? 'rtl' : 'ltr'">
    <div class="sec-title-bar">
      <span class="sec-badge mono-ui" dir="ltr">04</span>
      <h2>{{ t('notesTitle') }}</h2>
    </div>

    <div class="notes-stream-container">
      <article
        v-for="note in notes"
        :key="note.id"
        class="note-stream-row"
        @click="openNote(note)"
        tabindex="0"
        @keydown.enter="openNote(note)"
      >
        <div class="note-stream-main">
          <div class="note-stream-meta" :dir="isRtl ? 'rtl' : 'ltr'">
            <span class="note-meta-date">{{ formatDate(note.created_at) }}</span>
            <span class="note-meta-sep" aria-hidden="true">•</span>
            <span class="note-meta-readtime">{{ calcReadingTime(note.body) }}</span>
          </div>
          <h3 class="note-stream-title">{{ note.title }}</h3>
          <p v-if="note.body" class="note-stream-snippet">
            {{ getSnippet(note.body) }}
          </p>
        </div>
        <div class="note-stream-arrow-wrap" aria-hidden="true">
          <span class="note-stream-arrow">{{ isRtl ? '←' : '→' }}</span>
        </div>
      </article>
    </div>

    <!-- NOTES READING MODAL / DRAWER -->
    <Transition name="fade">
      <div v-if="activeReadingNote" class="note-reader-overlay" @click.self="closeDrawer">
        <article class="note-reader-card" role="dialog" aria-modal="true" :dir="isRtl ? 'rtl' : 'ltr'">
          <header class="reader-header">
            <div class="reader-title-wrap">
              <span class="reader-tag mono-ui" dir="ltr">engineering/note</span>
              <h2>{{ activeReadingNote.title }}</h2>
              <div class="reader-meta" :dir="isRtl ? 'rtl' : 'ltr'">
                <span class="meta-date">{{ formatDate(activeReadingNote.created_at) }}</span>
                <span class="meta-sep" aria-hidden="true">•</span>
                <span class="meta-time">{{ calcReadingTime(activeReadingNote.body) }}</span>
              </div>
            </div>
            <div class="reader-actions">
              <button @click="copyNoteLink" class="copy-note-link-btn" :title="copyNoteTooltip">
                🔗 {{ copyNoteTooltip }}
              </button>
              <button @click="closeDrawer" class="close-reader-btn" title="بستن (ESC)">✕</button>
            </div>
          </header>

          <div class="reader-body-content markdown-body" v-html="parseMarkdown(activeReadingNote.body)"></div>
        </article>
      </div>
    </Transition>
  </section>
</template>

<style scoped>
.editorial-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}



.notes-stream-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.note-stream-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  background: var(--item-bg, #ffffff);
  border: 1px solid var(--panel-border, #cbd5e1);
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.note-stream-row:hover {
  border-color: rgba(79, 70, 229, 0.4);
  box-shadow: 0 6px 20px rgba(79, 70, 229, 0.08);
  transform: translateX(-3px);
}

[dir="ltr"] .note-stream-row:hover {
  transform: translateX(3px);
}

.note-stream-main {
  flex: 1;
  min-width: 0;
}

.note-stream-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.74rem;
  color: var(--text-soft, #64748b);
  margin-bottom: 4px;
}

.note-stream-title {
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--text-main, #0f172a);
  margin: 0 0 6px;
}

.note-stream-snippet {
  font-size: 0.84rem;
  color: var(--text-secondary, #475569);
  line-height: 1.6;
  margin: 0;
}

.note-stream-arrow-wrap {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--bar-bg, #f1f5f9);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--neon, #4f46e5);
  font-weight: 800;
  flex-shrink: 0;
  margin-right: 12px;
}

[dir="rtl"] .note-stream-arrow-wrap {
  margin-right: 0;
  margin-left: 12px;
}

/* READING DRAWER OVERLAY */
.note-reader-overlay {
  position: fixed;
  inset: 0;
  z-index: 10000;
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
}

.note-reader-card {
  width: 100%;
  max-width: 800px;
  max-height: 88vh;
  background: var(--item-bg, #ffffff);
  border: 1px solid var(--panel-border, #cbd5e1);
  border-radius: 20px;
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.35);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.reader-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--panel-border, #e2e8f0);
  background: var(--bar-bg, #f8fafc);
  gap: 16px;
}

.reader-title-wrap h2 {
  font-size: 1.3rem;
  font-weight: 800;
  color: var(--text-main, #0f172a);
  margin: 6px 0;
}

.reader-tag {
  font-size: 0.72rem;
  color: var(--neon, #4f46e5);
  font-weight: 700;
}

.reader-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.76rem;
  color: var(--text-soft, #64748b);
}

.reader-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.copy-note-link-btn {
  padding: 5px 12px;
  border-radius: 8px;
  background: var(--item-bg, #ffffff);
  border: 1px solid var(--panel-border, #cbd5e1);
  font-size: 0.76rem;
  font-weight: 600;
  color: var(--text-secondary, #334155);
  cursor: pointer;
  white-space: nowrap;
}

.copy-note-link-btn:hover {
  border-color: var(--neon, #4f46e5);
  color: var(--neon, #4f46e5);
}

.close-reader-btn {
  background: transparent;
  border: none;
  font-size: 1.2rem;
  color: var(--text-soft, #64748b);
  cursor: pointer;
  padding: 4px 8px;
}

.reader-body-content {
  padding: 24px;
  overflow-y: auto;
  line-height: 1.85;
  font-size: 0.95rem;
  color: var(--text-secondary, #334155);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 640px) {
  .note-stream-row {
    padding: 14px 12px;
    border-radius: 12px;
  }

  .note-stream-title {
    font-size: 0.98rem;
  }

  .note-stream-snippet {
    font-size: 0.8rem;
  }

  .note-reader-overlay {
    padding: 10px;
  }

  .note-reader-card {
    max-height: 92vh;
    border-radius: 16px;
  }

  .reader-header {
    padding: 14px 16px;
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }

  .reader-actions {
    justify-content: space-between;
    width: 100%;
  }

  .reader-body-content {
    padding: 16px;
    font-size: 0.9rem;
  }
}
</style>

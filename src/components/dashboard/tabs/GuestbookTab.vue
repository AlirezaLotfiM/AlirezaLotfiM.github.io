<script setup>
import { computed } from 'vue';
import { usePortfolio } from '../../../composables/usePortfolio';

const { guestbookEntries } = usePortfolio();

const entries = computed(() =>
  [...guestbookEntries.value].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  ),
);
</script>

<template>
  <div class="guestbook-tab">
    <div class="guestbook-header">
      <h2>دفترچه یادگاری</h2>
      <!-- <p>این بخش حالا به صورت کامل از داده های استاتیک خود پروژه بارگذاری می شود.</p> -->
    </div>

    <div v-if="entries.length" class="guestbook-list">
      <article v-for="entry in entries" :key="entry.id" class="guestbook-card spotlight-card">
        <div class="spotlight-bg"></div>
        <div class="entry-head">
          <div>
            <h3>{{ entry.name }}</h3>
            <span class="role">{{ entry.role }}</span>
          </div>
          <time :datetime="entry.created_at">
            {{ new Date(entry.created_at).toLocaleDateString('fa-IR') }}
          </time>
        </div>
        <p>{{ entry.message }}</p>
      </article>
    </div>

    <div v-else class="empty-state">
      هنوز پیامی برای این بخش ثبت نشده است.
    </div>
  </div>
</template>

<style scoped>
.guestbook-tab {
  animation: fadeIn 0.5s ease-in-out;
}

.guestbook-header {
  margin-bottom: 20px;
  text-align: center;
}

.guestbook-header h2 {
  color: var(--neon);
  margin-bottom: 10px;
}

.guestbook-header p {
  color: var(--text-secondary);
}

.guestbook-list {
  display: grid;
  gap: 14px;
}

.guestbook-card {
  position: relative;
  overflow: hidden;
  padding: 18px;
  border-radius: 14px;
  border: 1px solid var(--panel-border);
  background: var(--item-bg);
}

.entry-head {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 12px;
  align-items: flex-start;
}

.entry-head h3 {
  margin: 0;
  color: var(--text-main);
}

.role,
time,
.empty-state {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.guestbook-card p {
  position: relative;
  z-index: 1;
  margin: 0;
  line-height: 1.8;
  color: var(--text-main);
}

.empty-state {
  text-align: center;
  padding: 20px;
}
</style>

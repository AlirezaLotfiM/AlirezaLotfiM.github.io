<script setup>
import { ref, computed, onMounted } from 'vue';
import { usePortfolio } from '../../../composables/usePortfolio';

const { guestbookEntries } = usePortfolio();

// Form state
const newName = ref('');
const newRole = ref('');
const newMessage = ref('');
const showToast = ref(false);
const isSubmitting = ref(false);

const localEntries = ref([]);

onMounted(() => {
  // Load custom entries from localStorage
  const saved = localStorage.getItem('custom_guestbook_entries');
  if (saved) {
    try {
      localEntries.value = JSON.parse(saved);
    } catch (e) {
      console.error("Failed to parse local guestbook entries", e);
    }
  }
});

const entries = computed(() => {
  const all = [...guestbookEntries.value, ...localEntries.value];
  return all.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
});

const handleSubmit = () => {
  if (!newName.value.trim() || !newMessage.value.trim()) return;
  
  isSubmitting.value = true;
  
  // Simulate network latency (600ms) for professional feedback feel
  setTimeout(() => {
    const entry = {
      id: Date.now(),
      name: newName.value.trim(),
      role: newRole.value.trim() || 'مهمان پورتفولیو',
      message: newMessage.value.trim(),
      created_at: new Date().toISOString()
    };
    
    localEntries.value.push(entry);
    localStorage.setItem('custom_guestbook_entries', JSON.stringify(localEntries.value));
    
    // Reset form
    newName.value = '';
    newRole.value = '';
    newMessage.value = '';
    
    isSubmitting.value = false;
    
    // Show success notification toast
    showToast.value = true;
    setTimeout(() => {
      showToast.value = false;
    }, 4500);
  }, 600);
};
</script>

<template>
  <div class="guestbook-tab">
    <div class="guestbook-header">
      <h2>دفترچه یادگاری</h2>
      <p>نظر یا متنی به یادگار بنویسید تا در این صفحه ثبت شود.</p>
    </div>

    <!-- New Guestbook Entry Form -->
    <form @submit.prevent="handleSubmit" class="guestbook-form">
      <h3>✍️ ثبت یادگاری جدید</h3>
      <div class="form-row">
        <div class="form-group">
          <label for="guest-name">نام شما *</label>
          <input id="guest-name" v-model="newName" type="text" placeholder="مثلا: رضا علوی" required />
        </div>
        <div class="form-group">
          <label for="guest-role">سمت / نام شرکت</label>
          <input id="guest-role" v-model="newRole" type="text" placeholder="مثلا: مدیر فنی در شرکت X" />
        </div>
      </div>
      <div class="form-group">
        <label for="guest-message">پیام شما *</label>
        <textarea id="guest-message" v-model="newMessage" rows="3" placeholder="یک جمله یادگاری بنویسید..." required></textarea>
      </div>
      <button type="submit" class="submit-btn" :disabled="isSubmitting">
        <span>{{ isSubmitting ? 'در حال ثبت...' : 'ثبت یادگاری' }}</span>
      </button>
    </form>

    <!-- Entries List -->
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

    <!-- Success Toast -->
    <Transition name="slide-fade">
      <div v-if="showToast" class="toast-notification">
        <span>پیام شما با موفقیت ثبت شد! در نسخه واقعی این پیام به پایگاه‌داده ارسال می‌شود. ✨</span>
      </div>
    </Transition>
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
  margin-bottom: 6px;
}

.guestbook-header p {
  color: var(--text-secondary);
  font-size: 0.86rem;
  margin: 0;
}

/* Form Styling */
.guestbook-form {
  background: var(--item-bg);
  border: 1px solid var(--panel-border);
  border-radius: 16px;
  padding: 18px;
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  box-shadow: 
    inset 0 1px 0 rgba(255, 255, 255, 0.03),
    0 12px 28px rgba(0, 0, 0, 0.15);
}

.guestbook-form h3 {
  margin: 0;
  color: var(--text-main);
  font-size: 0.94rem;
  font-weight: 700;
  text-align: right;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

@media (max-width: 640px) {
  .form-row {
    grid-template-columns: 1fr;
    gap: 10px;
  }
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
  text-align: right;
}

.form-group label {
  font-size: 0.72rem;
  color: var(--text-soft);
  font-weight: 600;
}

.form-group input,
.form-group textarea {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--panel-border);
  border-radius: 12px;
  padding: 10px 12px;
  font-size: 0.8rem;
  color: var(--text-main);
  outline: none;
  font-family: inherit;
  transition: all 0.25s ease;
  text-align: right;
}

.form-group input:focus,
.form-group textarea:focus {
  border-color: var(--neon);
  background: rgba(255, 255, 255, 0.04);
  box-shadow: 0 0 10px rgba(var(--neon-rgb), 0.1);
}

.submit-btn {
  background: var(--neon);
  border: none;
  border-radius: 12px;
  color: #040814;
  padding: 11px;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.25s ease;
  font-family: inherit;
  margin-top: 2px;
}

.submit-btn:hover {
  filter: brightness(1.15);
  transform: translateY(-1px);
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* List Styling */
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
  font-size: 0.94rem;
}

.role {
  color: var(--accent-strong);
  font-size: 0.76rem;
  font-weight: 600;
  display: block;
  margin-top: 2px;
}

time {
  color: var(--text-soft);
  font-size: 0.76rem;
  font-family: monospace;
}

.guestbook-card p {
  position: relative;
  z-index: 1;
  margin: 0;
  line-height: 1.8;
  color: var(--text-main);
  font-size: 0.84rem;
  text-align: justify;
}

.empty-state {
  text-align: center;
  padding: 20px;
  color: var(--text-secondary);
  font-size: 0.86rem;
}

/* Success Toast */
.toast-notification {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%) translateY(0);
  background: rgba(23, 49, 76, 0.94);
  border: 1px solid var(--neon);
  border-radius: 16px;
  padding: 12px 20px;
  color: #fff;
  font-size: 0.8rem;
  z-index: 10000;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.25);
  text-align: center;
  backdrop-filter: blur(12px);
  width: max-content;
  max-width: 90%;
  direction: rtl;
}

/* Transitions */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}
.slide-fade-enter-from {
  transform: translateX(-50%) translateY(20px);
  opacity: 0;
}
.slide-fade-leave-to {
  transform: translateX(-50%) translateY(-20px);
  opacity: 0;
}
</style>

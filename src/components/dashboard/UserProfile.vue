<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { usePortfolio } from '../../composables/usePortfolio';

const { userGithub, projects, profile, resumeUrl } = usePortfolio();

const emit = defineEmits(['open-terminal', 'go-home']);

const copiedTooltip = ref(null);
const typeText = ref('');

const titles = computed(() => profile.value.titles || []);

let typeIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typeTimeout = null;

const typeWriter = () => {
  const currentTitles = titles.value;
  if (!currentTitles?.length) return;

  const currentWord = currentTitles[typeIndex % currentTitles.length];
  if (!currentWord) return;

  if (isDeleting) {
    typeText.value = currentWord.substring(0, charIndex - 1);
    charIndex--;
  } else {
    typeText.value = currentWord.substring(0, charIndex + 1);
    charIndex++;
  }

  let typeSpeed = isDeleting ? 50 : 100;
  if (!isDeleting && charIndex === currentWord.length) {
    typeSpeed = 1800;
    isDeleting = true;
  } else if (isDeleting && charIndex === 0) {
    isDeleting = false;
    typeIndex = (typeIndex + 1) % currentTitles.length;
    typeSpeed = 450;
  }
  typeTimeout = setTimeout(typeWriter, typeSpeed);
};

watch(titles, (newTitles) => {
  if (newTitles?.length) {
    clearTimeout(typeTimeout);
    typeIndex = 0;
    charIndex = 0;
    isDeleting = false;
    typeWriter();
  }
}, { immediate: true });

const toPersianDigits = (num) => {
  const id = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num.toString().replace(/[0-9]/g, (w) => id[+w]);
};

const experienceYears = computed(() => {
  const startDate = new Date('2020-08-22');
  const now = new Date();
  let years = now.getFullYear() - startDate.getFullYear();
  if (now.getMonth() < startDate.getMonth()) years--;
  return toPersianDigits(`+${years}`);
});

const profileBadges = computed(() =>
  (profile.value.badges || ['Backend', 'API Design', 'PostgreSQL', 'Distributed Systems']).slice(0, 3),
);

const compactStats = computed(() => [
  { label: 'تجربه', value: `${experienceYears.value} سال` },
  { label: 'پروژه', value: toPersianDigits(`+${projects.value.length}`) },
]);

const copyToClipboard = (text, type) => {
  if (!text) return;
  navigator.clipboard.writeText(text);
  copiedTooltip.value = type;
  setTimeout(() => {
    copiedTooltip.value = null;
  }, 2000);
};

const handleCardTilt = (e) => {
  if (window.innerWidth < 768) return;
  const card = e.currentTarget;
  const rect = card.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;
  card.style.setProperty('--rx', `${((y - centerY) / centerY) * -3}deg`);
  card.style.setProperty('--ry', `${((x - centerX) / centerX) * 3}deg`);
  card.style.setProperty('--x', `${x}px`);
  card.style.setProperty('--y', `${y}px`);
};

const resetCard = (e) => {
  const card = e.currentTarget;
  card.style.setProperty('--rx', '0deg');
  card.style.setProperty('--ry', '0deg');
  card.style.setProperty('--x', '-1000px');
};

onMounted(() => {
  if (titles.value.length > 0) typeWriter();
});

onUnmounted(() => {
  clearTimeout(typeTimeout);
});
</script>

<template>
  <aside class="col-profile">
    <div class="glass-panel profile-box spotlight-card" @mousemove="handleCardTilt" @mouseleave="resetCard">
      <div class="spotlight-bg"></div>

      <header class="profile-header">
        <div class="avatar-glow" @click="emit('go-home')" title="بازگشت به صفحه نخست (کارت ویزیت)" style="cursor: pointer;">
          <img :src="profile.avatarUrl || '/Damoon-d.png'" alt="Avatar" />
        </div>
        <div class="profile-texts">
          <h1>{{ profile.name || '...' }}</h1>
          <p class="role" dir="ltr">
            <span class="typewriter-line"><span class="typewriter">{{ typeText }}</span><span class="cursor">|</span></span>
          </p>
          <p class="role-sub">{{ profile.role }}</p>
        </div>
      </header>

      <div class="badge-row" dir="ltr">
        <span v-for="badge in profileBadges" :key="badge" class="meta-chip">{{ badge }}</span>
      </div>

      <!-- Status Panel -->
      <div class="status-panel" v-if="profile.learning">
        <div class="status-item">
          <span class="status-icon">🚀</span>
          <div class="status-info">
            <span class="status-label">تمرکز یادگیری:</span>
            <strong class="status-value">{{ profile.learning.focus || 'Dapr & K8s' }}</strong>
          </div>
        </div>
      </div>

      <p class="bio-short">
        {{ profile.bio }}
      </p>

      <div class="stats-row">
        <div v-for="stat in compactStats" :key="stat.label" class="simple-stat">
          <span class="stat-label">{{ stat.label }}</span>
          <strong>{{ stat.value }}</strong>
        </div>
      </div>


      <div class="action-buttons">
        <a
          class="resume-btn"
          :href="resumeUrl || profile.resumeUrl || '/MyResume.pdf'"
          target="_blank"
          rel="noopener noreferrer"
          title="دانلود رزومه"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          <span>دانلود رزومه (Resume)</span>
        </a>
      </div>
    </div>

    <!-- Social Floating Bar outside the card -->
    <div class="glass-panel contact-grid social-dock">
      <div class="contact-wrapper">
        <button class="contact-btn email" @click="copyToClipboard(profile.contact?.email, 'email')" aria-label="Email">
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <rect width="20" height="16" x="2" y="4" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>
        </button>
        <div class="tooltip-box">
          <span class="label">ایمیل</span>
          <button class="copy-btn" @click.prevent="copyToClipboard(profile.contact?.email, 'email')">
            {{ copiedTooltip === 'email' ? 'کپی شد! ✅' : 'کپی آدرس' }}
          </button>
        </div>
      </div>
      <div class="contact-wrapper">
        <a :href="profile.contact?.linkedin" target="_blank" class="contact-btn linkedin" aria-label="LinkedIn">
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
            <rect width="4" height="12" x="2" y="9" />
            <circle cx="4" cy="4" r="2" />
          </svg>
        </a>
        <div class="tooltip-box">
          <span class="label">لینکدین</span>
          <button class="copy-btn" @click.prevent="copyToClipboard(profile.contact?.linkedin, 'linkedin')">
            {{ copiedTooltip === 'linkedin' ? 'کپی لینک! ✅' : 'کپی لینک' }}
          </button>
        </div>
      </div>
      <div class="contact-wrapper">
        <a :href="profile.contact?.telegramUrl" target="_blank" class="contact-btn telegram" aria-label="Telegram">
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <path d="m22 2-7 20-4-9-9-4Z" />
            <path d="M22 2 11 13" />
          </svg>
        </a>
        <div class="tooltip-box">
          <span class="label">تلگرام</span>
          <button class="copy-btn" @click.prevent="copyToClipboard(profile.contact?.telegramId, 'telegram')">
            {{ copiedTooltip === 'telegram' ? 'کپی شد! ✅' : 'کپی ID' }}
          </button>
        </div>
      </div>
      <div class="contact-wrapper">
        <a :href="`https://github.com/${userGithub}`" target="_blank" class="contact-btn github" aria-label="GitHub">
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
            <path d="M9 18c-4.51 2-5-2-7-2" />
          </svg>
        </a>
        <div class="tooltip-box">
          <span class="label">گیت‌هاب</span>
        </div>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.col-profile {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: 0.3s;
}

.profile-box {
  flex: 1;
  height: auto !important;
  padding: 20px 18px 22px;
  gap: 14px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 14px;
  text-align: right;
}

.profile-texts {
  min-width: 0;
  flex: 1;
}

.profile-texts h1 {
  font-size: 1.25rem;
  margin: 0 0 4px;
  color: var(--text-main);
}

.role {
  margin: 0 0 6px;
  font-size: 0.86rem;
  color: var(--accent-strong);
  font-family: var(--font-mono);
  min-height: 1.4rem;
}

.typewriter-line {
  display: inline-flex;
  align-items: center;
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
}

.role-sub {
  margin: 0;
  font-size: 0.76rem;
  color: var(--text-soft);
}

.avatar-glow {
  width: 78px;
  height: 78px;
  flex-shrink: 0;
  overflow: hidden;
  border-radius: 50%;
  padding: 4px;
  background: linear-gradient(135deg, var(--item-bg), var(--item-hover-bg));
  border: 1px solid var(--panel-border);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.avatar-glow img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.badge-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: flex-start;
  margin-top: 2px;
}

/* Status Panel */
.status-panel {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.015);
  border: 1px solid var(--panel-border);
  text-align: right;
  transition: all 0.2s ease;
}

.status-item:hover {
  background: rgba(255, 255, 255, 0.03);
  border-color: var(--neon);
}

.status-icon {
  font-size: 1.05rem;
  flex-shrink: 0;
}

.status-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.status-label {
  font-size: 0.68rem;
  color: var(--text-soft);
  font-weight: 600;
}

.status-value {
  font-size: 0.78rem;
  color: var(--text-main);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bio-short {
  margin: 0;
  font-size: 0.86rem;
  line-height: 1.9;
  color: var(--text-soft);
  margin-top: auto;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.simple-stat {
  padding: 10px 12px;
  border-radius: 14px;
  background: var(--item-bg);
  border: 1px solid var(--panel-border);
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 0.7rem;
  color: var(--text-soft);
  margin-bottom: 4px;
}

.simple-stat strong {
  font-size: 0.84rem;
  color: var(--text-main);
}


.action-buttons {
  display: grid;
  grid-template-columns: 1fr;
  margin-top: 2px;
}

.terminal-toggle,
.resume-btn {
  min-width: 0;
  padding: 11px 12px;
  min-height: 44px;
  border-radius: 16px;
  font-size: 0.78rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 700;
  transition: 0.25s ease;
}
.resume-btn {
  background: var(--neon);
  border: 1px solid var(--neon);
  color: #040814;
  text-decoration: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.resume-btn:hover {
  filter: brightness(1.15);
  border-color: var(--neon);
  color: #040814;
  box-shadow: 0 0 16px var(--neon);
  transform: translateY(-2px);
}

.resume-btn:active {
  transform: translateY(0) scale(0.97);
}

.contact-grid {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 6px;
  width: 100%;
  position: relative;
}

.social-dock {
  height: auto !important; /* overrides glass-panel height 100% */
  display: flex;
  flex-direction: row !important;
  justify-content: space-around;
  align-items: center;
  padding: 8px 12px;
  background: var(--item-bg);
  border: 1px solid var(--panel-border);
  border-radius: 20px;
  margin-top: 0px;
  box-shadow: 
    inset 0 1px 0 rgba(255, 255, 255, 0.03),
    0 10px 25px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(12px);
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.social-dock:hover {
  background: var(--item-hover-bg);
  border-color: var(--neon);
}

.contact-wrapper {
  position: relative;
}

.typewriter {
  color: var(--accent-strong);
  font-weight: 700;
}

.cursor {
  animation: blink 1s infinite;
  display: inline-block;
  color: var(--accent-strong);
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

.tooltip-box {
  position: absolute;
  bottom: calc(100% + 14px);
  left: 50%;
  transform: translateX(-50%) translateY(8px) scale(0.96);
  background: var(--bg-main);
  border: 1px solid var(--panel-border);
  border-radius: 16px;
  padding: 10px 10px 9px;
  width: max-content;
  min-width: 146px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 7px;
  opacity: 0;
  pointer-events: none;
  transition: 0.24s ease;
  z-index: 20;
}

.contact-wrapper:hover .tooltip-box {
  opacity: 1;
  transform: translateX(-50%) translateY(0) scale(1);
  pointer-events: auto;
}

.tooltip-box::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border-width: 8px;
  border-style: solid;
  border-color: var(--panel-border) transparent transparent transparent;
}

.tooltip-box .label {
  font-size: 0.72rem;
  color: var(--text-soft);
}

.tooltip-box .copy-btn {
  background: var(--item-bg);
  color: var(--accent-strong);
  border: 1px solid var(--panel-border);
  padding: 6px 10px;
  border-radius: 12px;
  font-size: 0.72rem;
  cursor: pointer;
  width: 100%;
  transition: all 0.2s;
}
.tooltip-box .copy-btn:hover {
  background: var(--item-hover-bg);
  border-color: var(--neon);
}

@media (max-width: 1024px) {
  .col-profile {
    order: 1;
    height: auto;
  }

  .profile-box {
    padding: 16px;
    overflow: visible;
  }

  .profile-header {
    align-items: center;
    gap: 12px;
  }

  .stats-row,
  .action-buttons {
    grid-template-columns: 1fr;
  }

  .contact-grid {
    flex-wrap: wrap;
  }
}

@media (max-width: 640px) {
  .profile-box {
    padding: 14px;
    gap: 12px;
  }

  .profile-header {
    align-items: flex-start;
  }

  .avatar-glow {
    width: 68px;
    height: 68px;
  }

  .profile-texts h1 {
    font-size: 1.1rem;
  }

  .bio-short {
    font-size: 0.82rem;
    line-height: 1.75;
  }


}
</style>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { usePortfolio } from '../../composables/usePortfolio';

const { userGithub, projects, profile } = usePortfolio();

// --- Props & Emits ---
const emit = defineEmits(['open-terminal']);

// --- Local State ---
const copiedTooltip = ref(null);
const typeText = ref("");

// --- Typewriter Logic ---
const titles = computed(() => profile.value.titles || []);

let typeIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typeTimeout = null;

const typeWriter = () => {
  const currentTitles = titles.value;
  if (!currentTitles || currentTitles.length === 0) return;

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
    typeSpeed = 2000;
    isDeleting = true;
  } else if (isDeleting && charIndex === 0) {
    isDeleting = false;
    typeIndex = (typeIndex + 1) % currentTitles.length;
    typeSpeed = 500;
  }
  typeTimeout = setTimeout(typeWriter, typeSpeed);
};

// Restart typewriter when titles change (loaded)
watch(titles, (newTitles) => {
  if (newTitles && newTitles.length > 0) {
    clearTimeout(typeTimeout);
    typeIndex = 0;
    charIndex = 0;
    isDeleting = false;
    typeWriter();
  }
}, { immediate: true });

// --- Helpers ---
const toPersianDigits = (num) => {
  const id = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return num.toString().replace(/[0-9]/g, (w) => id[+w]);
};

const experienceYears = computed(() => {
  const startDate = new Date("2020-08-22");
  const now = new Date();
  let years = now.getFullYear() - startDate.getFullYear();
  if (now.getMonth() < startDate.getMonth()) years--;
  return toPersianDigits(`+${years}`);
});

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
  const rotateX = ((y - centerY) / centerY) * -5;
  const rotateY = ((x - centerX) / centerX) * 5;
  card.style.setProperty("--rx", `${rotateX}deg`);
  card.style.setProperty("--ry", `${rotateY}deg`);
  card.style.setProperty("--x", `${x}px`);
  card.style.setProperty("--y", `${y}px`);
};

const resetCard = (e) => {
  const card = e.currentTarget;
  card.style.setProperty("--rx", `0deg`);
  card.style.setProperty("--ry", `0deg`);
  card.style.setProperty("--x", `-1000px`);
};

onMounted(() => {
  if (titles.value.length > 0) {
    typeWriter();
  }
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
        <div class="avatar-glow">
          <img :src="`https://github.com/${userGithub}.png`" alt="Avatar" />
        </div>
        <div class="profile-texts">
          <h1>{{ profile.name || '...' }}</h1>
          <p class="role" dir="ltr">
            <span class="typewriter">{{ typeText }}</span><span class="cursor">|</span>
          </p>
          <p class="role-sub">{{ profile.role }}</p>
          <div class="availability-badge">
            <span class="pulse-dot"></span>
            <span>Open to New Opportunities</span>
            <div class="tooltip-custom">
              آماده همکاری در پروژه‌های توزیع‌شده و توسعه بک‌اند
            </div>
          </div>
        </div>
      </header>

      <div class="action-buttons">
        <button class="terminal-toggle" @click="emit('open-terminal')" title="Ctrl + K">
          damoon@root:~$
        </button>
        <a class="resume-btn" href="/MyResume.pdf" download="MyResume.pdf" title="دانلود رزومه">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          دانلود رزومه
        </a>
      </div>

      <div class="bio-short">
        {{ profile.bio }}
      </div>
      <div class="stats-row">
        <div class="stat">
          <strong>{{ experienceYears }}</strong><span>سال تجربه</span>
        </div>
        <div class="sep"></div>
        <div class="stat">
          <strong>{{ toPersianDigits(`+${projects.length}`) }}</strong><span>پروژه</span>
        </div>
      </div>

      <div class="contact-grid">
        <div class="contact-wrapper">
          <button class="contact-btn email" @click="copyToClipboard(profile.contact?.email, 'email')" aria-label="Email">
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none"
              stroke-linecap="round" stroke-linejoin="round">
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
          </button>
          <div class="tooltip-box">
            <span class="label">ایمیل</span><button class="copy-btn"
              @click.prevent="copyToClipboard(profile.contact?.email, 'email')">
              {{ copiedTooltip === "email" ? "کپی شد! ✅" : "کپی آدرس" }}
            </button>
          </div>
        </div>
        <div class="contact-wrapper">
          <a :href="profile.contact?.linkedin" target="_blank" class="contact-btn linkedin" aria-label="LinkedIn"><svg
              viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none"
              stroke-linecap="round" stroke-linejoin="round">
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
              <rect width="4" height="12" x="2" y="9" />
              <circle cx="4" cy="4" r="2" />
            </svg></a>
          <div class="tooltip-box">
            <span class="label">لینکدین</span><button class="copy-btn"
              @click.prevent="copyToClipboard(profile.contact?.linkedin, 'linkedin')">
              {{
                copiedTooltip === "linkedin" ? "کپی لینک! ✅" : "کپی لینک"
              }}
            </button>
          </div>
        </div>
        <div class="contact-wrapper">
          <a :href="profile.contact?.telegramUrl" target="_blank" class="contact-btn telegram" aria-label="Telegram"><svg
              viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none"
              stroke-linecap="round" stroke-linejoin="round">
              <path d="m22 2-7 20-4-9-9-4Z" />
              <path d="M22 2 11 13" />
            </svg></a>
          <div class="tooltip-box">
            <span class="label">تلگرام</span><button class="copy-btn"
              @click.prevent="copyToClipboard(profile.contact?.telegramId, 'telegram')">
              {{ copiedTooltip === "telegram" ? "کپی شد! ✅" : "کپی ID" }}
            </button>
          </div>
        </div>
        <div class="contact-wrapper">
          <a :href="`https://github.com/${userGithub}`" target="_blank" class="contact-btn github"
            aria-label="GitHub"><svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor"
              stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <path
                d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
              <path d="M9 18c-4.51 2-5-2-7-2" />
            </svg></a>
          <div class="tooltip-box">
            <span class="label">گیت‌هاب</span>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.col-profile {
  height: 100%;
  min-height: 0;
  transition: 0.3s;
}

.profile-box {
  padding: 30px 25px;
}

.profile-header {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.profile-texts h1 {
  font-size: 1.3rem;
  margin: 5px 0 2px;
  color: var(--text-main);
}

.role {
  font-size: 0.85rem;
  margin-bottom: 2px;
  color: var(--neon);
  opacity: 0.9;
}

.role-sub {
  font-size: 0.75rem;
  margin-bottom: 15px;
  color: var(--text-muted);
}

.availability-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.75rem;
  color: var(--text-main);
  background: rgba(103, 255, 100, 0.1);
  padding: 4px 10px;
  border-radius: 20px;
  border: 1px solid rgba(103, 255, 100, 0.3);
  position: relative;
  cursor: help;
  margin-bottom: 15px;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.availability-badge:hover {
  background: rgba(103, 255, 100, 0.2);
  border-color: var(--neon);
}

.pulse-dot {
  width: 8px;
  height: 8px;
  background-color: var(--neon);
  border-radius: 50%;
  position: relative;
}

.pulse-dot::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  background-color: var(--neon);
  border-radius: 50%;
  animation: pulse-ring 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
}

@keyframes pulse-ring {
  0% { width: 100%; height: 100%; opacity: 0.8; }
  100% { width: 300%; height: 300%; opacity: 0; }
}

.tooltip-custom {
  position: absolute;
  bottom: 125%;
  left: 50%;
  transform: translateX(-50%) translateY(10px);
  background: var(--bg-main);
  border: 1px solid var(--neon);
  padding: 8px 12px;
  border-radius: 8px;
  max-width: 220px;
  width: max-content;
  font-size: 0.75rem;
  text-align: center;
  pointer-events: none;
  opacity: 0;
  transition: 0.3s;
  box-shadow: 0 4px 12px rgba(0,0,0,0.5);
  z-index: 10;
  line-height: 1.5;
  white-space: normal;
  word-wrap: break-word;
}

.tooltip-custom::after {
  content: "";
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border-width: 6px;
  border-style: solid;
  border-color: var(--neon) transparent transparent transparent;
}

.availability-badge:hover .tooltip-custom {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

.bio-short {
  margin: 15px 0;
  font-size: 0.85rem;
  line-height: 1.5;
  color: var(--text-muted);
}

.stats-row {
  margin-bottom: 15px;
  padding: 10px 0;
  display: flex;
  justify-content: center;
  gap: 30px;
  border-top: 1px solid var(--panel-border);
  border-bottom: 1px solid var(--panel-border);
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat strong {
  font-size: 1.4rem;
  color: var(--text-main);
}

.stat span {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.action-buttons {
  display: flex;
  gap: 10px;
  width: 100%;
  margin-bottom: 10px;
}

.terminal-toggle,
.resume-btn {
  flex: 1;
  margin: 0;
  padding: 10px;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  border-radius: 12px;
  font-weight: bold;
  transition: 0.3s;
}

.terminal-toggle {
  background: rgba(0, 0, 0, 0.5);
  color: var(--neon);
  border: 1px solid var(--neon);
  cursor: pointer;
}

.terminal-toggle:hover {
  background: var(--neon);
  color: #000;
  box-shadow: 0 0 15px var(--neon);
}

.resume-btn {
  background: rgba(103, 255, 100, 0.1);
  border: 1px solid var(--neon);
  color: var(--neon);
  text-decoration: none;
  gap: 8px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 0 5px rgba(103, 255, 100, 0.2);
}

.resume-btn:hover {
  background: var(--neon);
  color: #000;
  box-shadow: 0 0 20px var(--neon);
  transform: translateY(-2px);
}

.resume-btn:active {
  transform: translateY(0);
}

.avatar-glow {
  position: relative;
  overflow: hidden;
  width: 90px;
  height: 90px;
  margin: 0 auto 10px;
  border-radius: 50%;
  padding: 4px;
  background: linear-gradient(135deg, var(--neon), transparent);
}

.avatar-glow img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: var(--bg-main);
}

.avatar-glow:hover img {
  animation: glitch-anim 0.3s infinite;
}

.avatar-glow:hover::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(103, 255, 100, 0.5);
  z-index: 2;
  opacity: 0;
  pointer-events: none;
  animation: glitch-flash 0.3s infinite;
  border-radius: 50%;
}

@keyframes glitch-anim {
  0% { transform: translate(0); }
  20% { transform: translate(-2px, 2px); filter: hue-rotate(90deg); }
  40% { transform: translate(-2px, -2px); filter: hue-rotate(0deg); }
  60% { transform: translate(2px, 2px); filter: hue-rotate(180deg); }
  80% { transform: translate(2px, -2px); filter: hue-rotate(0deg); }
  100% { transform: translate(0); }
}

@keyframes glitch-flash {
  0% { opacity: 0; }
  50% { opacity: 0.2; }
  100% { opacity: 0; }
}

.typewriter {
  color: var(--neon);
  font-weight: bold;
}

.cursor {
  animation: blink 1s infinite;
  display: inline-block;
  color: var(--neon);
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

.tooltip-box {
  position: absolute;
  bottom: 125%;
  left: 50%;
  transform: translateX(-50%) translateY(10px);
  background: var(--bg-main);
  border: 1px solid var(--neon);
  border-radius: 8px;
  padding: 8px;
  width: max-content;
  min-width: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  opacity: 0;
  pointer-events: none;
  transition: 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.8);
  z-index: 20;
}

.contact-wrapper:hover .tooltip-box {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
  pointer-events: auto;
}

.tooltip-box::after {
  content: "";
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border-width: 6px;
  border-style: solid;
  border-color: var(--neon) transparent transparent transparent;
}

.tooltip-box .label {
  font-size: 0.75rem;
  color: var(--text-main);
  margin-bottom: 2px;
}

.tooltip-box .copy-btn {
  background: rgba(103, 255, 100, 0.15);
  color: var(--neon);
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.7rem;
  cursor: pointer;
  width: 100%;
  transition: 0.2s;
  font-family: "Vazirmatn";
}

.tooltip-box .copy-btn:hover {
  background: var(--neon);
  color: #000;
}

.contact-grid {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: auto;
  width: 100%;
  position: relative;
  padding-top: 15px;
}
.contact-wrapper {
  position: relative;
}

/* Mobile responsive adjustments */
@media (max-width: 1024px) {
  .col-profile {
    order: 1;
    height: auto;
  }
  .profile-box {
    padding: 20px;
    flex-direction: column;
  }
  .profile-header {
    display: flex;
    align-items: center;
    gap: 15px;
    margin-bottom: 15px;
    text-align: right;
  }
  .avatar-glow {
    margin: 0;
    width: 70px;
    height: 70px;
  }
  .profile-texts h1 {
    font-size: 1.3rem;
    margin: 0;
  }
  .bio-short {
    text-align: right;
    margin: 10px 0;
    font-size: 0.85rem;
  }
  .contact-grid {
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    width: 100%;
    margin-top: 20px;
  }
}
</style>

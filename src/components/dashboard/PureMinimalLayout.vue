<script setup>
import { ref, onMounted, onUnmounted, defineAsyncComponent } from 'vue';
import { usePortfolio } from '../../composables/usePortfolio';
import { useAudioSynth } from '../../composables/useAudioSynth';
import { useNavigation } from '../../composables/useNavigation';

import MonogramLogo from '../MonogramLogo.vue';
import DamoonMonogram from '../DamoonMonogram.vue';

const ArchitectureModal = defineAsyncComponent(() => import('../ArchitectureModal.vue'));

const {
  projects,
  notes,
  profile,
  workExperience,
  interests,
  mySkills,
  userGithub,
  selectedNote,
  activeFilter,
  availableLanguages,
  getTechDetails,
  closeNote,
} = usePortfolio();

const { playClick } = useAudioSynth();
const { tabPaths, navigateFromEvent } = useNavigation();

const emit = defineEmits(['open-terminal', 'go-home', 'toggle-zen']);

const props = defineProps({
  isZenMode: Boolean,
});

const activeSection = ref('about');
const contentPaneRef = ref(null);
let observer = null;

const avatarMode = ref('svg-damoon'); // 'svg-damoon' | 'svg-alm' | 'real-photo'
const toggleAvatarMode = () => {
  playClick();
  if (avatarMode.value === 'svg-damoon') avatarMode.value = 'svg-alm';
  else if (avatarMode.value === 'svg-alm') avatarMode.value = 'real-photo';
  else avatarMode.value = 'svg-damoon';
};

const showArchModal = ref(false);
const currentArchDiagram = ref('');
const currentArchTitle = ref('');

const openArchitecture = (p) => {
  currentArchTitle.value = p.name;
  currentArchDiagram.value = p.architecture;
  showArchModal.value = true;
};

const getTechList = (langString) => {
  if (!langString) return [];
  return langString.split(/\s*\/\s*/).map((l) => getTechDetails(l));
};

const formatStatus = (st) => {
  if (!st) return null;
  const lower = st.toLowerCase();
  if (lower.includes('live') || lower.includes('prod')) return { text: 'عملیاتی', type: 'prod' };
  if (lower.includes('ship') || lower.includes('dev')) return { text: 'در حال توسعه', type: 'dev' };
  return { text: st, type: 'neutral' };
};

const navItems = [
  { id: 'about', label: 'درباره من', num: '۰۰' },
  { id: 'experience', label: 'سوابق کاری', num: '۰۱' },
  { id: 'projects', label: 'پروژه‌ها', num: '۰۲' },
  { id: 'skills', label: 'تخصص‌ها', num: '۰۳' },
  { id: 'notes', label: 'یادداشت‌ها', num: '۰۴' },
];

onMounted(() => {
  if (!contentPaneRef.value) return;

  const sections = contentPaneRef.value.querySelectorAll('.editorial-section');
  if (!sections.length) return;

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          activeSection.value = entry.target.id;
        }
      });
    },
    {
      root: contentPaneRef.value,
      threshold: 0.15,
      rootMargin: '-10% 0px -40% 0px',
    }
  );

  sections.forEach((sec) => observer.observe(sec));
});

onUnmounted(() => {
  if (observer) observer.disconnect();
});

const scrollToSection = (sectionId, event) => {
  playClick();
  closeNote();
  if (event) event.preventDefault();

  const target = document.getElementById(sectionId);
  if (target) {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};
</script>

<template>
  <div class="master-shell">
    <!-- SUBTLE BLURRED TOP BAR (RIGHT: DAMOON MONOGRAM / LEFT: OUTLINE SOCIAL ICONS NO BG) -->
    <header class="swiss-top-bar" :class="{ hidden: isZenMode }">
      <div class="top-bar-inner">
        <!-- RIGHT: Damoon Monogram (Click to toggle SVG / ALM / Real Photo) -->
        <div class="header-logo-wrap" @click="toggleAvatarMode" title="کلیک برای تغییر حالت لوگو">
          <DamoonMonogram v-if="avatarMode === 'svg-damoon'" :size="32" />
          <MonogramLogo v-else-if="avatarMode === 'svg-alm'" :size="32" />
          <img v-else :src="profile.avatarUrl || '/Damoon-d.jpg'" alt="علیرضا لطفی مقدم" class="top-mini-avatar" />
        </div>

        <!-- LEFT: Outline Social Icons (WITHOUT BACKGROUND BOXES) -->
        <div class="header-social-icons" dir="ltr">
          <a :href="`mailto:${profile.contact?.email}`" title="ایمیل" class="header-icon-link">
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="3"/>
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
            </svg>
          </a>

          <a :href="`https://github.com/${userGithub}`" target="_blank" rel="noopener" title="گیت‌هاب" class="header-icon-link">
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
              <path d="M9 18c-4.51 2-5-2-7-2"/>
            </svg>
          </a>

          <a :href="profile.contact?.linkedin" target="_blank" rel="noopener" title="لینکدین" class="header-icon-link">
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
              <rect x="2" y="9" width="4" height="12"/>
              <circle cx="4" cy="4" r="2"/>
            </svg>
          </a>

          <button @click="emit('open-terminal')" title="ترمینال دستورات (Ctrl+K)" class="header-icon-link cli">
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="4 17 10 11 4 5"/>
              <line x1="12" y1="19" x2="20" y2="19"/>
            </svg>
          </button>
        </div>
      </div>
    </header>

    <div class="editorial-layout" :class="{ 'zen-mode': isZenMode }">
      <ArchitectureModal
        :visible="showArchModal"
        :diagram="currentArchDiagram"
        :title="currentArchTitle"
        @close="showArchModal = false"
      />

      <!-- RIGHT SIDEBAR (RIGHT ALIGNED) -->
      <aside v-if="!isZenMode" class="editorial-sidebar">
        <div class="sidebar-top">
          <div class="avatar-ring-box" @click="emit('go-home')" title="صفحه نخست">
            <img :src="profile.avatarUrl || '/Damoon-d.jpg'" alt="علیرضا لطفی مقدم" />
          </div>

          <div class="header-titles">
            <h1>علیرضا لطفی مقدم</h1>
            <p class="role mono-ui" dir="ltr">Senior Software Engineer & .NET Architect</p>
          </div>

          <p class="concise-bio">
            معمار ارشد نرم‌افزار متمرکز بر توسعه سیستم‌های توزیع‌شده C#، ASP.NET Core و اپلیکیشن‌های دسکتاپ صنعتی (WPF).
          </p>

          <nav class="editorial-nav" aria-label="ناوبری اصلی">
            <a
              v-for="item in navItems"
              :key="item.id"
              :href="`#${item.id}`"
              @click="scrollToSection(item.id, $event)"
              :class="{ active: !selectedNote && activeSection === item.id }"
            >
              <span class="nav-num mono-ui" dir="ltr">{{ item.num }}</span>
              <span class="nav-label">{{ item.label }}</span>
            </a>
          </nav>
        </div>

        <div class="sidebar-links">
          <a :href="tabPaths.resume" @click="navigateFromEvent($event, tabPaths.resume)" class="resume-btn">
            📄 مشاهده رزومه رسمی A4 ↗
          </a>
        </div>
      </aside>

      <!-- LEFT STREAM (SWISS EDITORIAL TYPOGRAPHY) -->
      <main class="editorial-content" ref="contentPaneRef">
        <!-- 00 // ABOUT -->
        <section id="about" class="editorial-section">
          <div class="sec-title-bar">
            <span class="num mono-ui" dir="ltr">00 //</span>
            <h2>درباره من</h2>
          </div>
          <div class="text-content">
            <p class="lead">
              من <strong>علیرضا لطفی مقدم</strong> هستم؛ معمار ارشد نرم‌افزار با <strong>+۶ سال سابقه تخصصی</strong> در توسعه سیستم‌های توزیع‌شده با کارایی بالا، موتورهای C# و .NET Core، و اپلیکیشن‌های دسکتاپ صنعتی (WPF).
            </p>
            <p>
              تخصص اصلی من بر پایه‌ی طراحی سیستم‌های بلادرنگ با SignalR، یکپارچه‌سازی سخت‌افزارهای بیومتریک (دستگاه اثر انگشت Suprema و اسکنر WIA) و مدیریت بانک‌های اطلاعاتی سنگین شکل گرفته است.
            </p>
          </div>
        </section>

        <!-- 01 // EXPERIENCE -->
        <section id="experience" class="editorial-section">
          <div class="sec-title-bar">
            <span class="num mono-ui" dir="ltr">01 //</span>
            <h2>سوابق کاری و دستاوردهای اجرایی</h2>
          </div>

          <div class="experience-editorial-stream">
            <article v-for="(job, index) in workExperience" :key="index" class="job-card-row">
              <div class="job-header">
                <div class="job-main-title">
                  <h3>{{ job.role }}</h3>
                  <span class="company-name">@ {{ job.company }}</span>
                </div>
                <span class="period-pill mono-ui" dir="ltr">{{ job.period }}</span>
              </div>

              <p class="job-desc">{{ job.desc }}</p>

              <ul v-if="job.highlights?.length" class="job-bullets">
                <li v-for="hl in job.highlights" :key="hl">{{ hl }}</li>
              </ul>

              <div v-if="job.tech?.length" class="job-tech-row">
                <span v-for="t in job.tech" :key="t" class="tech-tag-item mono-ui" dir="ltr">{{ t }}</span>
              </div>
            </article>
          </div>
        </section>

        <!-- 02 // PROJECTS -->
        <section id="projects" class="editorial-section">
          <div class="sec-title-bar">
            <span class="num mono-ui" dir="ltr">02 //</span>
            <h2>پروژه‌های برجسته</h2>
          </div>

          <!-- Filter Bar -->
          <div class="simple-filter-bar">
            <button
              v-for="lang in availableLanguages"
              :key="lang"
              @click="activeFilter = lang"
              :class="{ active: activeFilter === lang }"
              class="filter-tag"
            >
              {{ lang === 'All' ? 'همه' : lang }}
            </button>
          </div>

          <div class="projects-editorial-stream">
            <article
              v-for="p in projects.filter(proj => activeFilter === 'All' || (proj.language && proj.language.includes(activeFilter)))"
              :key="p.id"
              class="project-editorial-card"
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
                <button v-if="p.architecture" class="arch-btn mono-ui" @click="openArchitecture(p)">
                  architecture ↗
                </button>
              </div>
            </article>
          </div>
        </section>

        <!-- 03 // SKILLS & SPECIALIZATIONS -->
        <section id="skills" class="editorial-section">
          <div class="sec-title-bar">
            <span class="num mono-ui" dir="ltr">03 //</span>
            <h2>تخصص‌ها و حوزه‌های تمرکز فنی</h2>
          </div>

          <div class="skills-editorial-grid">
            <div v-for="(skill, index) in (mySkills.length ? mySkills : interests)" :key="index" class="skill-card-item">
              <div class="skill-icon">{{ skill.icon || '⚡' }}</div>
              <div class="skill-info">
                <h4>{{ skill.title || skill.name }}</h4>
                <p>{{ skill.desc || skill.level }}</p>
              </div>
            </div>
          </div>
        </section>

        <!-- 04 // NOTES -->
        <section id="notes" class="editorial-section">
          <div class="sec-title-bar">
            <span class="num mono-ui" dir="ltr">04 //</span>
            <h2>یادداشت‌های فنی</h2>
          </div>

          <div class="notes-editorial-list">
            <article v-for="note in notes" :key="note.id" class="note-editorial-item">
              <span class="date mono-ui" dir="ltr">{{ note.created_at }}</span>
              <h3>{{ note.title }}</h3>
            </article>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<style scoped>
/* MASTER SHELL */
.master-shell {
  width: 100%;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
}

/* ULTRA-THIN FLUSH TOP BAR */
.swiss-top-bar {
  position: sticky;
  top: 0;
  z-index: 100;
  width: 100%;
  margin: 0;
  padding: 4px 24px;
  background: rgba(248, 250, 252, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--panel-border);
  box-sizing: border-box;
}

.swiss-top-bar.hidden {
  display: none;
}

.top-bar-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 36px;
}

.header-logo-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.header-logo-wrap:hover {
  transform: translateY(-1px);
}

.top-mini-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  object-fit: cover;
  border: 1.5px solid var(--neon);
}

.brand-name-text {
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--text-main);
  letter-spacing: -0.5px;
}

/* OUTLINE SOCIAL ICONS (NO BACKGROUND BOXES) */
.header-social-icons {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-icon-link {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 4px;
  transition: all 0.2s ease;
}

.header-icon-link:hover {
  color: var(--neon);
  transform: translateY(-2px);
}

/* EDITORIAL LAYOUT */
.editorial-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 56px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  min-height: calc(100dvh - 60px);
  padding: 40px 24px;
  box-sizing: border-box;
}

.editorial-layout.zen-mode {
  grid-template-columns: 1fr;
  padding: 0;
}

/* SIDEBAR (RIGHT ALIGNED) */
.editorial-sidebar {
  position: sticky;
  top: 80px;
  max-height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 24px;
  overflow-y: auto;
  scrollbar-width: thin;
}

.sidebar-top {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: right;
  gap: 16px;
}

.avatar-ring-box {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid var(--neon);
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(79, 70, 229, 0.15);
  transition: transform 0.25s ease;
}

.avatar-ring-box:hover {
  transform: scale(1.04);
}

.avatar-ring-box img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.header-titles {
  text-align: right;
}

.header-titles h1 {
  margin: 0 0 4px 0;
  font-size: 1.45rem;
  color: var(--text-main);
  font-weight: 800;
}

.header-titles .role {
  margin: 0;
  font-size: 0.78rem;
  color: var(--neon);
  font-weight: 700;
}

.concise-bio {
  margin: 0;
  font-size: 0.84rem;
  color: var(--text-secondary);
  line-height: 1.65;
  text-align: right;
}

.editorial-nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
  width: 100%;
}

.editorial-nav a {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: var(--text-secondary);
  font-size: 0.88rem;
  padding: 6px 0;
  transition: all 0.2s ease;
  border-right: 2px solid transparent;
}

.nav-num {
  font-size: 0.75rem;
  color: var(--text-soft);
}

.editorial-nav a:hover {
  color: var(--text-main);
}

.editorial-nav a.active {
  color: var(--neon);
  font-weight: 700;
  border-right-color: var(--neon);
  padding-right: 8px;
}

.editorial-nav a.active .nav-num {
  color: var(--neon);
}

.sidebar-links {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.resume-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 16px;
  border-radius: 10px;
  background: rgba(79, 70, 229, 0.08);
  border: 1px solid var(--neon);
  color: var(--neon);
  font-size: 0.84rem;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.2s ease;
}

.resume-btn:hover {
  background: var(--neon);
  color: #ffffff;
  box-shadow: 0 4px 14px rgba(79, 70, 229, 0.2);
}

/* CONTENT STREAM */
.editorial-content {
  overflow-y: auto;
  max-height: calc(100vh - 120px);
  padding-right: 8px;
  scroll-behavior: smooth;
  scrollbar-width: thin;
}

.editorial-section {
  margin-bottom: 56px;
  scroll-margin-top: 20px;
}

.sec-title-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 20px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--panel-border);
}

.sec-title-bar .num {
  font-size: 0.86rem;
  color: var(--neon);
  font-weight: 700;
}

.sec-title-bar h2 {
  margin: 0;
  font-size: 1.2rem;
  color: var(--text-main);
  font-weight: 800;
}

.text-content {
  font-size: 0.96rem;
  color: var(--text-secondary);
  line-height: 1.8;
}

.lead {
  font-size: 1.05rem;
  color: var(--text-main);
}

.text-content strong {
  color: var(--neon);
}

/* EXPERIENCE STREAM */
.experience-editorial-stream {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.job-card-row {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-bottom: 24px;
  border-bottom: 1px dashed var(--panel-border);
}

.job-card-row:last-child {
  border-bottom: none;
}

.job-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.job-main-title h3 {
  margin: 0 0 2px 0;
  font-size: 1.1rem;
  color: var(--text-main);
  font-weight: 700;
}

.company-name {
  font-size: 0.88rem;
  color: var(--neon);
  font-weight: 600;
}

.period-pill {
  font-size: 0.78rem;
  color: var(--neon);
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 8px;
  background: rgba(79, 70, 229, 0.08);
  border: 1px solid rgba(79, 70, 229, 0.2);
}

.job-desc {
  margin: 0;
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.7;
}

.job-bullets {
  margin: 4px 0 0 0;
  padding-right: 18px;
  font-size: 0.88rem;
  color: var(--text-secondary);
  line-height: 1.75;
}

.job-tech-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 4px;
}

.tech-tag-item {
  font-size: 0.74rem;
  padding: 2px 8px;
  border-radius: 6px;
  background: #f1f5f9;
  border: 1px solid var(--panel-border);
  color: var(--text-secondary);
}

/* PROJECTS */
.simple-filter-bar {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
}

.filter-tag {
  background: transparent;
  border: 1px solid var(--panel-border);
  color: var(--text-secondary);
  padding: 4px 12px;
  border-radius: 8px;
  font-size: 0.8rem;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}

.filter-tag:hover, .filter-tag.active {
  border-color: var(--neon);
  color: var(--neon);
}

.projects-editorial-stream {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.project-editorial-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  background: #ffffff;
  border: 1px solid var(--panel-border);
  border-radius: 14px;
  transition: all 0.25s ease;
}

.project-editorial-card:hover {
  border-color: var(--neon);
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(79, 70, 229, 0.1);
}

.proj-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.proj-top h3 {
  margin: 0;
  font-size: 1.08rem;
}

.proj-top a {
  color: var(--text-main);
  text-decoration: none;
}

.proj-top a:hover {
  color: var(--neon);
}

.arrow {
  color: var(--neon);
}

/* STATUS BADGE PILLS */
.status-badge-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.74rem;
  padding: 2px 8px;
  border-radius: 999px;
  font-weight: 600;
}

.status-badge-pill.prod {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
  border: 1px solid rgba(16, 185, 129, 0.25);
}

.status-badge-pill.prod .status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #10b981;
}

.status-badge-pill.dev {
  background: rgba(79, 70, 229, 0.1);
  color: #4f46e5;
  border: 1px solid rgba(79, 70, 229, 0.25);
}

.status-badge-pill.dev .status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #4f46e5;
}

.desc {
  margin: 0;
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.65;
}

.meta-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.78rem;
  color: var(--text-soft);
  margin-top: 4px;
}

.arch-btn {
  background: transparent;
  border: 1px solid var(--panel-border);
  color: var(--neon);
  padding: 3px 8px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.75rem;
}

.arch-btn:hover {
  border-color: var(--neon);
}

/* SKILLS GRID */
.skills-editorial-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}

.skill-card-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px;
  background: #ffffff;
  border: 1px solid var(--panel-border);
  border-radius: 12px;
  transition: all 0.2s ease;
}

.skill-card-item:hover {
  border-color: var(--neon);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.1);
}

.skill-icon {
  font-size: 1.3rem;
}

.skill-info h4 {
  margin: 0 0 2px 0;
  font-size: 0.94rem;
  color: var(--text-main);
  font-weight: 700;
}

.skill-info p {
  margin: 0;
  font-size: 0.82rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

/* NOTES LIST */
.notes-editorial-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.note-editorial-item {
  display: flex;
  align-items: center;
  gap: 16px;
}

.note-editorial-item .date {
  font-size: 0.78rem;
  color: var(--neon);
}

.note-editorial-item h3 {
  margin: 0;
  font-size: 0.95rem;
  color: var(--text-main);
}

@media (max-width: 1024px) {
  .editorial-layout {
    grid-template-columns: 1fr;
    gap: 32px;
    padding: 20px 14px;
  }

  .editorial-sidebar, .editorial-content {
    position: relative;
    top: 0;
    max-height: none;
    overflow: visible;
  }

  .job-header {
    flex-direction: column;
    gap: 4px;
  }
}
</style>

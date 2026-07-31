<script setup>
import { ref, computed, onMounted, onUnmounted, defineAsyncComponent } from 'vue';
import { usePortfolio } from '../../composables/usePortfolio';
import { useAudioSynth } from '../../composables/useAudioSynth';
import { useNavigation, getProjectPath, getNoteSlug } from '../../composables/useNavigation';

const ArchitectureModal = defineAsyncComponent(() => import('../ArchitectureModal.vue'));

const {
  projects,
  notes,
  mySkills,
  profile,
  workExperience,
  interests,
  roadmapItems,
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

const navItems = [
  { id: 'about', label: 'درباره من', num: '۰۰' },
  { id: 'projects', label: 'پروژه‌ها', num: '۰۱' },
  { id: 'experience', label: 'سوابق کاری', num: '۰۲' },
  { id: 'interests', label: 'حوزه‌های تخصصی', num: '۰۳' },
  { id: 'notes', label: 'یادداشت‌ها', num: '۰۴' },
];

onMounted(() => {
  if (!contentPaneRef.value) return;

  const sections = contentPaneRef.value.querySelectorAll('.pure-section');
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
  <div class="pure-root-layout" :class="{ 'zen-mode': isZenMode }">
    <ArchitectureModal
      :visible="showArchModal"
      :diagram="currentArchDiagram"
      :title="currentArchTitle"
      @close="showArchModal = false"
    />

    <!-- RIGHT SIDEBAR: Pure Minimal Sticky Profile Nav (ZERO GLASSMORPHISM) -->
    <aside v-if="!isZenMode" class="pure-sticky-sidebar">
      <div class="sidebar-top-group">
        <div class="profile-avatar-box" @click="emit('go-home')" title="صفحه نخست">
          <img :src="profile.avatarUrl || '/Damoon-d.jpg'" alt="علیرضا لطفی مقدم" />
        </div>

        <div class="profile-heading">
          <h1>{{ profile.name || 'علیرضا لطفی مقدم' }}</h1>
          <p class="role-text mono-ui" dir="ltr">Senior Software Engineer & .NET Architect</p>
        </div>

        <nav class="sidebar-nav" aria-label="ناوبری اصلی">
          <a
            v-for="item in navItems"
            :key="item.id"
            :href="`#${item.id}`"
            @click="scrollToSection(item.id, $event)"
            :class="{ active: !selectedNote && activeSection === item.id }"
          >
            <span class="nav-dot"></span>
            <span class="nav-num mono-ui" dir="ltr">{{ item.num }}</span>
            <span class="nav-text">{{ item.label }}</span>
          </a>
        </nav>
      </div>

      <div class="sidebar-bottom-group">
        <a
          :href="tabPaths.resume"
          @click="navigateFromEvent($event, tabPaths.resume)"
          class="sidebar-resume-btn"
        >
          📄 مشاهده رزومه رسمی A4 ↗
        </a>

        <div class="sidebar-socials" dir="ltr">
          <a :href="`mailto:${profile.contact?.email}`" title="Email" class="icon-link">✉️</a>
          <a :href="`https://github.com/${userGithub}`" target="_blank" rel="noopener" title="GitHub" class="icon-link">🐙</a>
          <a :href="profile.contact?.linkedin" target="_blank" rel="noopener" title="LinkedIn" class="icon-link">💼</a>
          <button @click="emit('open-terminal')" title="CLI Terminal (Ctrl+K)" class="icon-link cli-btn">⌨️</button>
        </div>
      </div>
    </aside>

    <!-- LEFT CONTENT STREAM: PURE NATIVE MINIMALIST HTML (ZERO GLASSMORPHISM) -->
    <main class="pure-content-stream" ref="contentPaneRef">
      <!-- 00 // ABOUT -->
      <section id="about" class="pure-section">
        <div class="section-heading">
          <span class="sec-prefix mono-ui" dir="ltr">00 //</span>
          <h2>درباره من</h2>
        </div>

        <div class="minimal-about-block">
          <p class="about-lead">
            سلام، من <strong>علیرضا لطفی مقدم</strong> هستم؛ معمار ارشد نرم‌افزار با <strong>+۶ سال سابقه تخصصی</strong> در طراحی و توسعه سیستم‌های توزیع‌شده با کارایی بالا، موتورهای C# و .NET Core، و اپلیکیشن‌های دسکتاپ صنعتی (WPF).
          </p>
          <p class="about-body">
            تخصص اصلی من شامل طراحی سرویس‌های بلادرنگ با SignalR، پیاده‌سازی معماری‌های مقیاس‌پذیر، یکپارچه‌سازی سخت‌افزارهای بیومتریک (دستگاه اثر انگشت Suprema و اسکن WIA) و بهینه‌سازی پایگاه‌های داده سنگین است.
          </p>

          <div class="about-stats-grid">
            <div class="stat-pill">
              <span class="stat-num mono-ui">+۶</span>
              <span class="stat-txt">سال سابقه مهندسی</span>
            </div>
            <div class="stat-pill">
              <span class="stat-num mono-ui">+۱۵</span>
              <span class="stat-txt">پروژه عملیاتی</span>
            </div>
            <div class="stat-pill">
              <span class="stat-num mono-ui">.NET / C#</span>
              <span class="stat-txt">استک اصلی</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 01 // PROJECTS -->
      <section id="projects" class="pure-section">
        <div class="section-heading">
          <span class="sec-prefix mono-ui" dir="ltr">01 //</span>
          <h2>پروژه‌ها و مطالعات موردی</h2>
        </div>

        <!-- Tech Filter Bar -->
        <div class="filter-bar">
          <button
            v-for="lang in availableLanguages"
            :key="lang"
            @click="activeFilter = lang"
            :class="{ active: activeFilter === lang }"
            class="filter-chip"
          >
            <span>{{ lang === 'All' ? 'همه پروژه‌ها' : lang }}</span>
            <span class="chip-count">{{ lang === 'All' ? projects.length : projects.filter(p => p.language && p.language.includes(lang)).length }}</span>
          </button>
        </div>

        <!-- Pure Native Projects List (No Glass Panels) -->
        <div class="projects-list">
          <article
            v-for="p in projects.filter(proj => activeFilter === 'All' || (proj.language && proj.language.includes(activeFilter)))"
            :key="p.id"
            class="project-card"
          >
            <header class="project-header">
              <h3>
                <a v-if="p.html_url && p.html_url !== '#'" :href="p.html_url" target="_blank" rel="noopener" class="project-link">
                  {{ p.name }} <span class="arrow">↗</span>
                </a>
                <span v-else>{{ p.name }}</span>
              </h3>
              <span v-if="p.status" class="status-badge mono-ui" dir="ltr">{{ p.status }}</span>
            </header>

            <p class="project-description">{{ p.description }}</p>

            <div v-if="p.language" class="tech-stack-row">
              <span
                v-for="tech in getTechList(p.language)"
                :key="tech.name"
                class="tech-pill"
                :style="{ color: tech.color, borderColor: tech.color + '30', background: tech.color + '0d' }"
              >
                {{ tech.short }}
              </span>
            </div>

            <footer class="project-meta-footer">
              <span v-if="p.role" class="project-role">نقش: <strong>{{ p.role }}</strong></span>
              <button v-if="p.architecture" class="arch-trigger-btn mono-ui" @click="openArchitecture(p)">
                architecture ↗
              </button>
            </footer>
          </article>
        </div>
      </section>

      <!-- 02 // EXPERIENCE -->
      <section id="experience" class="pure-section">
        <div class="section-heading">
          <span class="sec-prefix mono-ui" dir="ltr">02 //</span>
          <h2>سوابق کاری و مسئولیت‌ها</h2>
        </div>

        <!-- Pure Native Experience Timeline (No Glass Cards) -->
        <div class="experience-timeline">
          <article v-for="(job, index) in workExperience" :key="index" class="timeline-entry">
            <div class="entry-sidebar">
              <span class="period-badge mono-ui">{{ job.period }}</span>
            </div>
            <div class="entry-content">
              <h3>{{ job.role }} <span class="at-company">@ {{ job.company }}</span></h3>
              <p v-if="job.desc" class="job-summary">{{ job.desc }}</p>
              <ul v-if="job.highlights?.length" class="job-highlights">
                <li v-for="hl in job.highlights" :key="hl">{{ hl }}</li>
              </ul>
              <div v-if="job.tech?.length" class="job-tech-pills">
                <span v-for="t in job.tech" :key="t" class="simple-tag mono-ui" dir="ltr">{{ t }}</span>
              </div>
            </div>
          </article>
        </div>
      </section>

      <!-- 03 // INTERESTS -->
      <section id="interests" class="pure-section">
        <div class="section-heading">
          <span class="sec-prefix mono-ui" dir="ltr">03 //</span>
          <h2>حوزه‌های تخصصی و تمرکز فنی</h2>
        </div>

        <!-- Pure Native Interests Grid (No Glass Cards) -->
        <div class="interests-native-grid">
          <div v-for="(item, index) in interests" :key="index" class="interest-pill-card">
            <span class="interest-icon">{{ item.icon || '⚡' }}</span>
            <div class="interest-text">
              <h4>{{ item.title }}</h4>
              <p>{{ item.desc }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 04 // NOTES -->
      <section id="notes" class="pure-section">
        <div class="section-heading">
          <span class="sec-prefix mono-ui" dir="ltr">04 //</span>
          <h2>یادداشت‌های فنی</h2>
        </div>

        <!-- Pure Native Notes List -->
        <div class="notes-native-list">
          <article v-for="note in notes" :key="note.id" class="note-entry">
            <div class="note-header">
              <span class="note-date mono-ui" dir="ltr">{{ note.created_at }}</span>
              <h3>{{ note.title }}</h3>
            </div>
            <p class="note-excerpt">{{ (note.body || '').slice(0, 140) }}...</p>
          </article>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
/* PURE MATTE MINIMALIST LAYOUT — ZERO GLASSMORPHISM */
.pure-root-layout {
  display: grid;
  grid-template-columns: 290px 1fr;
  gap: 48px;
  max-width: 1380px;
  margin: 0 auto;
  min-height: 100dvh;
  padding: 40px 24px;
  box-sizing: border-box;
  background: transparent;
}

.pure-root-layout.zen-mode {
  grid-template-columns: 1fr;
  padding: 0;
}

/* RIGHT STICKY SIDEBAR (NO GLASS, NO BLUR) */
.pure-sticky-sidebar {
  position: sticky;
  top: 40px;
  max-height: calc(100vh - 80px);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 24px;
  overflow-y: auto;
  padding-right: 4px;
  scrollbar-width: thin;
}

.sidebar-top-group {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.profile-avatar-box {
  width: 86px;
  height: 86px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid var(--neon);
  cursor: pointer;
  transition: transform 0.25s ease;
}

.profile-avatar-box:hover {
  transform: scale(1.04);
}

.profile-avatar-box img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-heading h1 {
  margin: 0 0 4px 0;
  font-size: 1.55rem;
  color: var(--text-main);
  font-weight: 800;
  letter-spacing: -0.3px;
}

.profile-heading .role-text {
  margin: 0;
  font-size: 0.8rem;
  color: var(--neon);
  font-weight: 700;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
}

.sidebar-nav a {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: var(--text-soft);
  font-size: 0.86rem;
  padding: 6px 0;
  transition: all 0.2s ease;
}

.nav-dot {
  width: 18px;
  height: 2px;
  background: rgba(148, 163, 184, 0.2);
  transition: all 0.25s ease;
}

.sidebar-nav a:hover {
  color: var(--text-main);
}

.sidebar-nav a:hover .nav-dot {
  width: 34px;
  background: var(--text-main);
}

.sidebar-nav a.active {
  color: var(--neon);
  font-weight: 700;
}

.sidebar-nav a.active .nav-dot {
  width: 46px;
  background: var(--neon);
  box-shadow: 0 0 8px var(--neon);
}

.sidebar-bottom-group {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.sidebar-resume-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 16px;
  border-radius: 12px;
  background: rgba(56, 189, 248, 0.1);
  border: 1px solid var(--neon);
  color: var(--neon);
  font-size: 0.84rem;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.2s ease;
}

.sidebar-resume-btn:hover {
  background: var(--neon);
  color: #040814;
  box-shadow: 0 0 16px rgba(56, 189, 248, 0.35);
}

.sidebar-socials {
  display: flex;
  gap: 10px;
}

.icon-link {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.05rem;
  color: var(--text-main);
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.icon-link:hover {
  border-color: var(--neon);
  transform: translateY(-2px);
}

/* LEFT CONTENT STREAM (PURE MATTE, NO GLASS) */
.pure-content-stream {
  overflow-y: auto;
  max-height: calc(100vh - 80px);
  padding-right: 8px;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
}

.pure-section {
  margin-bottom: 56px;
  scroll-margin-top: 20px;
}

.section-heading {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 22px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.15);
}

.sec-prefix {
  font-size: 0.86rem;
  color: var(--neon);
  font-weight: 700;
}

.section-heading h2 {
  margin: 0;
  font-size: 1.25rem;
  color: var(--text-main);
  font-weight: 800;
}

/* ABOUT SECTION */
.minimal-about-block {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px 26px;
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 20px;
  line-height: 1.8;
}

.about-lead {
  font-size: 1.05rem;
  color: var(--text-main);
  margin: 0;
}

.about-body {
  font-size: 0.92rem;
  color: var(--text-soft);
  margin: 0;
  text-align: justify;
}

.minimal-about-block strong {
  color: var(--neon);
}

.about-stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-top: 8px;
}

.stat-pill {
  padding: 12px;
  background: rgba(10, 15, 29, 0.7);
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 2px;
}

.stat-pill .stat-num {
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--neon);
}

.stat-pill .stat-txt {
  font-size: 0.75rem;
  color: var(--text-soft);
}

/* PROJECTS SECTION */
.filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}

.filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 10px;
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(148, 163, 184, 0.12);
  color: var(--text-soft);
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.filter-chip:hover {
  border-color: var(--neon);
  color: var(--text-main);
}

.filter-chip.active {
  background: rgba(56, 189, 248, 0.12);
  border-color: var(--neon);
  color: var(--neon);
  font-weight: 700;
}

.chip-count {
  font-size: 0.72rem;
  padding: 1px 6px;
  border-radius: 999px;
  background: rgba(10, 15, 29, 0.8);
  border: 1px solid rgba(148, 163, 184, 0.15);
  font-family: var(--font-mono, monospace);
}

.projects-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.project-card {
  padding: 20px 22px;
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: all 0.25s ease;
}

.project-card:hover {
  border-color: var(--neon);
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.25);
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.project-header h3 {
  margin: 0;
  font-size: 1.08rem;
  color: var(--text-main);
  font-weight: 700;
}

.project-link {
  color: var(--text-main);
  text-decoration: none;
  transition: color 0.2s;
}

.project-link:hover {
  color: var(--neon);
}

.project-link .arrow {
  color: var(--neon);
}

.status-badge {
  font-size: 0.75rem;
  padding: 3px 9px;
  border-radius: 8px;
  background: rgba(56, 189, 248, 0.08);
  border: 1px solid rgba(56, 189, 248, 0.2);
  color: var(--neon);
  font-weight: 600;
}

.project-description {
  margin: 0;
  font-size: 0.88rem;
  color: var(--text-soft);
  line-height: 1.65;
  text-align: justify;
}

.tech-stack-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tech-pill {
  font-size: 0.74rem;
  padding: 3px 9px;
  border-radius: 8px;
  border: 1px solid;
  font-weight: 600;
}

.project-meta-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 8px;
  border-top: 1px solid rgba(148, 163, 184, 0.12);
  font-size: 0.84rem;
  color: var(--text-soft);
}

.arch-trigger-btn {
  background: rgba(10, 15, 29, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.15);
  color: var(--neon);
  padding: 6px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.2s;
  font-family: var(--font-mono, monospace);
}

.arch-trigger-btn:hover {
  border-color: var(--neon);
  background: rgba(56, 189, 248, 0.1);
}

/* EXPERIENCE TIMELINE */
.experience-timeline {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.timeline-entry {
  display: grid;
  grid-template-columns: 140px 1fr;
  gap: 20px;
  padding: 20px 22px;
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 18px;
  transition: all 0.25s ease;
}

.timeline-entry:hover {
  border-color: var(--neon);
  transform: translateY(-2px);
}

.period-badge {
  font-size: 0.78rem;
  color: var(--neon);
  font-weight: 700;
  background: rgba(56, 189, 248, 0.08);
  padding: 4px 10px;
  border-radius: 8px;
  border: 1px solid rgba(56, 189, 248, 0.2);
  display: inline-block;
}

.entry-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.entry-content h3 {
  margin: 0;
  font-size: 1.05rem;
  color: var(--text-main);
  font-weight: 700;
}

.at-company {
  color: var(--neon);
  font-weight: 600;
}

.job-summary {
  margin: 0;
  font-size: 0.88rem;
  color: var(--text-soft);
  line-height: 1.65;
}

.job-highlights {
  margin: 4px 0 0 0;
  padding-right: 18px;
  font-size: 0.86rem;
  color: var(--text-soft);
  line-height: 1.7;
}

.job-tech-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 6px;
}

.simple-tag {
  font-size: 0.72rem;
  padding: 2px 8px;
  border-radius: 6px;
  background: rgba(10, 15, 29, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.15);
  color: var(--text-soft);
}

/* INTERESTS NATIVE GRID */
.interests-native-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.interest-pill-card {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 18px;
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 16px;
  transition: all 0.25s ease;
}

.interest-pill-card:hover {
  border-color: var(--neon);
  transform: translateY(-2px);
}

.interest-icon {
  font-size: 1.5rem;
}

.interest-text h4 {
  margin: 0 0 4px 0;
  font-size: 1rem;
  color: var(--text-main);
  font-weight: 700;
}

.interest-text p {
  margin: 0;
  font-size: 0.85rem;
  color: var(--text-soft);
  line-height: 1.6;
}

/* NOTES NATIVE LIST */
.notes-native-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.note-entry {
  padding: 18px 20px;
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  transition: all 0.25s ease;
}

.note-entry:hover {
  border-color: var(--neon);
  transform: translateY(-2px);
}

.note-header {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.note-date {
  font-size: 0.74rem;
  color: var(--neon);
}

.note-header h3 {
  margin: 0;
  font-size: 1.05rem;
  color: var(--text-main);
  font-weight: 700;
}

.note-excerpt {
  margin: 0;
  font-size: 0.86rem;
  color: var(--text-soft);
  line-height: 1.6;
}

/* MOBILE RESPONSIVE */
@media (max-width: 1024px) {
  .pure-root-layout {
    grid-template-columns: 1fr;
    gap: 30px;
    padding: 16px 12px;
  }

  .pure-sticky-sidebar {
    position: relative;
    top: 0;
    max-height: none;
    overflow: visible;
  }

  .timeline-entry {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .about-stats-grid {
    grid-template-columns: 1fr;
  }

  .pure-content-stream {
    max-height: none;
    overflow: visible;
  }
}
</style>

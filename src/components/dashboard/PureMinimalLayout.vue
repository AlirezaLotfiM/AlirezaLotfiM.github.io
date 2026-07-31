<script setup>
import { ref, onMounted, onUnmounted, defineAsyncComponent } from 'vue';
import { usePortfolio } from '../../composables/usePortfolio';
import { useAudioSynth } from '../../composables/useAudioSynth';
import { useNavigation } from '../../composables/useNavigation';

const ArchitectureModal = defineAsyncComponent(() => import('../ArchitectureModal.vue'));

const {
  projects,
  notes,
  profile,
  workExperience,
  interests,
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
  { id: 'about', label: 'درباره من' },
  { id: 'projects', label: 'پروژه‌ها' },
  { id: 'experience', label: 'سوابق کاری' },
  { id: 'interests', label: 'تخصص‌ها' },
  { id: 'notes', label: 'یادداشت‌ها' },
];

onMounted(() => {
  if (!contentPaneRef.value) return;

  const sections = contentPaneRef.value.querySelectorAll('.simple-section');
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
      threshold: 0.2,
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
  <div class="ultra-simple-layout" :class="{ 'zen-mode': isZenMode }">
    <ArchitectureModal
      :visible="showArchModal"
      :diagram="currentArchDiagram"
      :title="currentArchTitle"
      @close="showArchModal = false"
    />

    <!-- RIGHT SIDEBAR (ULTRA MINIMAL & CLEAN) -->
    <aside v-if="!isZenMode" class="ultra-sidebar">
      <div class="sidebar-top">
        <div class="avatar-circle" @click="emit('go-home')" title="صفحه نخست">
          <img :src="profile.avatarUrl || '/Damoon-d.jpg'" alt="علیرضا لطفی مقدم" />
        </div>

        <div class="header-titles">
          <h1>علیرضا لطفی مقدم</h1>
          <p class="role mono-ui" dir="ltr">Senior Software Engineer & .NET Architect</p>
        </div>

        <p class="concise-bio">
          معمار ارشد نرم‌افزار متمرکز بر سیستم‌های توزیع‌شده C#، ASP.NET Core و اپلیکیشن‌های دسکتاپ صنعتی (WPF).
        </p>

        <nav class="simple-nav" aria-label="ناوبری اصلی">
          <a
            v-for="item in navItems"
            :key="item.id"
            :href="`#${item.id}`"
            @click="scrollToSection(item.id, $event)"
            :class="{ active: !selectedNote && activeSection === item.id }"
          >
            <span class="dot"></span>
            <span>{{ item.label }}</span>
          </a>
        </nav>
      </div>

      <div class="sidebar-links">
        <a :href="tabPaths.resume" @click="navigateFromEvent($event, tabPaths.resume)" class="resume-btn">
          📄 مشاهده رزومه رسمی A4 ↗
        </a>
        <div class="social-row" dir="ltr">
          <a :href="`mailto:${profile.contact?.email}`" title="Email">✉️ Email</a>
          <span>·</span>
          <a :href="`https://github.com/${userGithub}`" target="_blank" rel="noopener" title="GitHub">🐙 GitHub</a>
          <span>·</span>
          <a :href="profile.contact?.linkedin" target="_blank" rel="noopener" title="LinkedIn">💼 LinkedIn</a>
        </div>
      </div>
    </aside>

    <!-- LEFT STREAM (PURE TEXT & TYPOGRAPHY — NO BOX CARDS) -->
    <main class="ultra-content" ref="contentPaneRef">
      <!-- 00 // ABOUT -->
      <section id="about" class="simple-section">
        <h2 class="sec-title">درباره من</h2>
        <div class="text-content">
          <p class="lead">
            من <strong>علیرضا لطفی مقدم</strong> هستم؛ معمار ارشد نرم‌افزار با <strong>+۶ سال سابقه تخصصی</strong> در توسعه سیستم‌های توزیع‌شده با کارایی بالا، موتورهای C# و .NET Core، و اپلیکیشن‌های دسکتاپ صنعتی (WPF).
          </p>
          <p>
            تخصص کاری من بر پایه‌ی طراحی سیستم‌های بلادرنگ با SignalR، یکپارچه‌سازی سخت‌افزارهای بیومتریک (دستگاه اثر انگشت Suprema و اسکنر WIA) و مدیریت بانک‌های اطلاعاتی سنگین شکل گرفته است.
          </p>
        </div>
      </section>

      <!-- 01 // PROJECTS -->
      <section id="projects" class="simple-section">
        <h2 class="sec-title">پروژه‌های برجسته</h2>

        <!-- Simple Filter Bar -->
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

        <div class="projects-stream">
          <article
            v-for="p in projects.filter(proj => activeFilter === 'All' || (proj.language && proj.language.includes(activeFilter)))"
            :key="p.id"
            class="project-row"
          >
            <div class="proj-top">
              <h3>
                <a v-if="p.html_url && p.html_url !== '#'" :href="p.html_url" target="_blank" rel="noopener">
                  {{ p.name }} <span class="arrow">↗</span>
                </a>
                <span v-else>{{ p.name }}</span>
              </h3>
              <span v-if="p.status" class="status mono-ui" dir="ltr">{{ p.status }}</span>
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

      <!-- 02 // EXPERIENCE -->
      <section id="experience" class="simple-section">
        <h2 class="sec-title">سوابق کاری</h2>

        <div class="experience-stream">
          <article v-for="(job, index) in workExperience" :key="index" class="job-row">
            <div class="job-date mono-ui" dir="ltr">{{ job.period }}</div>
            <div class="job-detail">
              <h3>{{ job.role }} <span class="company">@ {{ job.company }}</span></h3>
              <p class="desc">{{ job.desc }}</p>
              <ul v-if="job.highlights?.length" class="bullets">
                <li v-for="hl in job.highlights" :key="hl">{{ hl }}</li>
              </ul>
            </div>
          </article>
        </div>
      </section>

      <!-- 03 // INTERESTS -->
      <section id="interests" class="simple-section">
        <h2 class="sec-title">حوزه‌های تمرکز فنی</h2>

        <div class="interests-simple-grid">
          <div v-for="(item, index) in interests" :key="index" class="interest-item">
            <span class="icon">{{ item.icon || '⚡' }}</span>
            <div>
              <h4>{{ item.title }}</h4>
              <p>{{ item.desc }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 04 // NOTES -->
      <section id="notes" class="simple-section">
        <h2 class="sec-title">یادداشت‌های فنی</h2>

        <div class="notes-simple-list">
          <article v-for="note in notes" :key="note.id" class="note-item">
            <span class="date mono-ui" dir="ltr">{{ note.created_at }}</span>
            <h3>{{ note.title }}</h3>
          </article>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
/* ULTRA MINIMAL & CLEAN — ZERO BOXES, ZERO GLASS */
.ultra-simple-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 56px;
  max-width: 1200px;
  margin: 0 auto;
  min-height: 100dvh;
  padding: 48px 24px;
  box-sizing: border-box;
}

.ultra-simple-layout.zen-mode {
  grid-template-columns: 1fr;
  padding: 0;
}

/* SIDEBAR */
.ultra-sidebar {
  position: sticky;
  top: 48px;
  max-height: calc(100vh - 96px);
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
  gap: 16px;
}

.avatar-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid var(--neon);
  cursor: pointer;
}

.avatar-circle img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.header-titles h1 {
  margin: 0 0 4px 0;
  font-size: 1.5rem;
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
  font-size: 0.86rem;
  color: var(--text-secondary);
  line-height: 1.65;
}

.simple-nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
}

.simple-nav a {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: var(--text-secondary);
  font-size: 0.88rem;
  padding: 4px 0;
  transition: all 0.2s ease;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--panel-border);
  transition: all 0.2s ease;
}

.simple-nav a:hover {
  color: var(--text-main);
}

.simple-nav a.active {
  color: var(--neon);
  font-weight: 700;
}

.simple-nav a.active .dot {
  background: var(--neon);
  box-shadow: 0 0 8px var(--neon);
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
  background: rgba(56, 189, 248, 0.1);
  border: 1px solid var(--neon);
  color: var(--neon);
  font-size: 0.84rem;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.2s ease;
}

.resume-btn:hover {
  background: var(--neon);
  color: #040814;
}

.social-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.social-row a {
  color: var(--text-secondary);
  text-decoration: none;
}

.social-row a:hover {
  color: var(--neon);
}

/* CONTENT STREAM — NO CARD BOXES */
.ultra-content {
  overflow-y: auto;
  max-height: calc(100vh - 96px);
  padding-right: 8px;
  scroll-behavior: smooth;
  scrollbar-width: thin;
}

.simple-section {
  margin-bottom: 56px;
  scroll-margin-top: 20px;
}

.sec-title {
  font-size: 1.2rem;
  color: var(--text-main);
  font-weight: 800;
  margin: 0 0 20px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--panel-border);
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

.projects-stream {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.project-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-bottom: 20px;
  border-bottom: 1px dashed var(--panel-border);
}

.project-row:last-child {
  border-bottom: none;
}

.proj-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.proj-top h3 {
  margin: 0;
  font-size: 1.1rem;
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

.status {
  font-size: 0.75rem;
  color: var(--neon);
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

/* EXPERIENCE */
.experience-stream {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.job-row {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 20px;
  padding-bottom: 20px;
  border-bottom: 1px dashed var(--panel-border);
}

.job-row:last-child {
  border-bottom: none;
}

.job-date {
  font-size: 0.8rem;
  color: var(--neon);
  font-weight: 700;
}

.job-detail h3 {
  margin: 0 0 6px 0;
  font-size: 1.05rem;
  color: var(--text-main);
}

.company {
  color: var(--neon);
}

.bullets {
  margin: 8px 0 0 0;
  padding-right: 18px;
  font-size: 0.86rem;
  color: var(--text-secondary);
  line-height: 1.7;
}

/* INTERESTS GRID */
.interests-simple-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
}

.interest-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.interest-item .icon {
  font-size: 1.4rem;
}

.interest-item h4 {
  margin: 0 0 2px 0;
  font-size: 0.95rem;
  color: var(--text-main);
}

.interest-item p {
  margin: 0;
  font-size: 0.84rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

/* NOTES LIST */
.notes-simple-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.note-item {
  display: flex;
  align-items: center;
  gap: 16px;
}

.note-item .date {
  font-size: 0.78rem;
  color: var(--neon);
}

.note-item h3 {
  margin: 0;
  font-size: 0.95rem;
  color: var(--text-main);
}

@media (max-width: 1024px) {
  .ultra-simple-layout {
    grid-template-columns: 1fr;
    gap: 32px;
    padding: 20px 14px;
  }

  .ultra-sidebar, .ultra-content {
    position: relative;
    top: 0;
    max-height: none;
    overflow: visible;
  }

  .job-row {
    grid-template-columns: 1fr;
    gap: 6px;
  }
}
</style>

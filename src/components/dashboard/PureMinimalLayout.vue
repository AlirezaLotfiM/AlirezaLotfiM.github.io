<script setup>
import { ref, computed, onMounted, onUnmounted, defineAsyncComponent, watch } from 'vue';
import { usePortfolio } from '../../composables/usePortfolio';
import { useAudioSynth } from '../../composables/useAudioSynth';
import { useNavigation, getProjectPath } from '../../composables/useNavigation';

const ArchitectureModal = defineAsyncComponent(() => import('../ArchitectureModal.vue'));
const HistoryTab = defineAsyncComponent(() => import('./tabs/HistoryTab.vue'));
const InterestsTab = defineAsyncComponent(() => import('./tabs/InterestsTab.vue'));
const RoadmapTab = defineAsyncComponent(() => import('./tabs/RoadmapTab.vue'));
const NotesTab = defineAsyncComponent(() => import('./tabs/NotesTab.vue'));
const GuestbookTab = defineAsyncComponent(() => import('./tabs/GuestbookTab.vue'));

const {
  projects,
  notes,
  mySkills,
  profile,
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
  { id: 'experience', label: 'سوابق کاری', num: '۰۱' },
  { id: 'projects', label: 'پروژه‌ها', num: '۰۲' },
  { id: 'interests', label: 'حوزه‌های تخصصی', num: '۰۳' },
  { id: 'roadmap', label: 'مسیر من', num: '۰۴' },
  { id: 'notes', label: 'یادداشت‌ها', num: '۰۵' },
  { id: 'guestbook', label: 'یادگاری', num: '۰۶' },
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
  <div class="pure-minimal-shell" :class="{ 'zen-mode': isZenMode }">
    <ArchitectureModal
      :visible="showArchModal"
      :diagram="currentArchDiagram"
      :title="currentArchTitle"
      @close="showArchModal = false"
    />

    <!-- RIGHT COLUMN: Sticky Profile & Navigation Sidebar (Glass-Free Pure Matte) -->
    <aside v-if="!isZenMode" class="pure-sidebar">
      <div class="sidebar-header">
        <div class="profile-avatar-ring" @click="emit('go-home')" title="صفحه نخست">
          <img :src="profile.avatarUrl || '/Damoon-d.jpg'" alt="علیرضا لطفی مقدم" />
        </div>
        <div class="profile-identity">
          <h1>{{ profile.name || 'علیرضا لطفی مقدم' }}</h1>
          <p class="subtitle mono-ui" dir="ltr">Senior Software Engineer & .NET Architect</p>
        </div>
      </div>

      <p class="pure-bio">
        {{ profile.bio || 'توسعه‌دهنده ارشد C# و .NET با تخصص در سیستم‌های توزیع‌شده با کارایی بالا، خدمات بلادرنگ و نرم‌افزارهای دسکتاپ صنعتی (WPF).' }}
      </p>

      <nav class="pure-nav-list" aria-label="ناوبری پورتفولیو">
        <a
          v-for="item in navItems"
          :key="item.id"
          :href="`#${item.id}`"
          @click="scrollToSection(item.id, $event)"
          :class="{ active: !selectedNote && activeSection === item.id }"
        >
          <span class="nav-indicator"></span>
          <span class="nav-num mono-ui" dir="ltr">{{ item.num }}</span>
          <span class="nav-label">{{ item.label }}</span>
        </a>
      </nav>

      <div class="sidebar-footer">
        <a
          :href="tabPaths.resume"
          @click="navigateFromEvent($event, tabPaths.resume)"
          class="pure-resume-link"
        >
          📄 مشاهده رزومه رسمی A4 ↗
        </a>

        <div class="pure-social-icons" dir="ltr">
          <a :href="`mailto:${profile.contact?.email}`" title="Email" class="social-icon">✉️</a>
          <a :href="`https://github.com/${userGithub}`" target="_blank" rel="noopener" title="GitHub" class="social-icon">🐙</a>
          <a :href="profile.contact?.linkedin" target="_blank" rel="noopener" title="LinkedIn" class="social-icon">💼</a>
          <button @click="emit('open-terminal')" title="CLI Terminal (Ctrl+K)" class="social-icon cli-btn">⌨️</button>
        </div>
      </div>
    </aside>

    <!-- LEFT COLUMN: Pure Minimalist Content Stream (Glass-Free) -->
    <main class="pure-content-pane" ref="contentPaneRef">
      <div v-if="selectedNote" class="pure-thread-wrapper">
        <NotesTab :is-detail="true" @toggle-zen="emit('toggle-zen')" :is-zen-mode="isZenMode" />
      </div>

      <div v-else class="pure-stream">
        <!-- 00 // ABOUT -->
        <section id="about" class="pure-section">
          <div class="pure-sec-header">
            <span class="sec-num mono-ui" dir="ltr">00 //</span>
            <h2>درباره من</h2>
          </div>
          <div class="pure-card about-card">
            <p class="lead-text">
              من <strong>علیرضا لطفی مقدم</strong> هستم؛ مهندس نرم‌افزار ارشد با تخصص اصلی در <strong>C#، ASP.NET Core، سیستم‌های توزیع‌شده و WPF</strong>.
            </p>
            <p>
              تمرکز اصلی من بر روی طراحی معماری‌های پایداری، پردازش غیرهمزمان داده‌ها با RabbitMQ/SignalR، یکپارچه‌سازی سخت‌افزاری و بیومتریک (دستگاه اثر انگشت Suprema و اسکنر WIA) و توسعه ابزارهای دسکتاپ پرسرعت است.
            </p>
          </div>
        </section>

        <!-- 01 // EXPERIENCE -->
        <section id="experience" class="pure-section">
          <div class="pure-sec-header">
            <span class="sec-num mono-ui" dir="ltr">01 //</span>
            <h2>سوابق کاری</h2>
          </div>
          <HistoryTab />
        </section>

        <!-- 02 // PROJECTS -->
        <section id="projects" class="pure-section">
          <div class="pure-sec-header">
            <span class="sec-num mono-ui" dir="ltr">02 //</span>
            <h2>پروژه‌ها و مطالعات موردی</h2>
          </div>

          <!-- Pure Tech Filter Chips -->
          <div class="pure-filter-chips">
            <button
              v-for="lang in availableLanguages"
              :key="lang"
              @click="activeFilter = lang"
              :class="{ active: activeFilter === lang }"
              class="pure-chip-btn"
            >
              <span>{{ lang === 'All' ? 'همه پروژه‌ها' : lang }}</span>
              <span class="chip-num">{{ lang === 'All' ? projects.length : projects.filter(p => p.language && p.language.includes(lang)).length }}</span>
            </button>
          </div>

          <div class="pure-projects-grid">
            <div v-for="p in projects.filter(proj => activeFilter === 'All' || (proj.language && proj.language.includes(activeFilter)))" :key="p.id" class="pure-project-item">
              <div class="proj-head">
                <h4>
                  <a v-if="p.html_url && p.html_url !== '#'" :href="p.html_url" target="_blank" rel="noopener" class="proj-title-link">
                    {{ p.name }} ↗
                  </a>
                  <span v-else class="proj-title">{{ p.name }}</span>
                </h4>
                <span v-if="p.status" class="proj-status mono-ui" dir="ltr">{{ p.status }}</span>
              </div>

              <p class="proj-desc">{{ p.description }}</p>

              <div v-if="p.language" class="proj-tech-tags">
                <span v-for="tech in getTechList(p.language)" :key="tech.name" class="tech-tag" :style="{ color: tech.color, borderColor: tech.color + '40', background: tech.color + '10' }">
                  {{ tech.short }}
                </span>
              </div>

              <div class="proj-footer">
                <span v-if="p.role" class="proj-role">نقش: <strong>{{ p.role }}</strong></span>
                <button v-if="p.architecture" class="pure-arch-btn mono-ui" @click="openArchitecture(p)">
                  architecture ↗
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- 03 // INTERESTS -->
        <section id="interests" class="pure-section">
          <div class="pure-sec-header">
            <span class="sec-num mono-ui" dir="ltr">03 //</span>
            <h2>حوزه‌های تخصصی و تمرکز فنی</h2>
          </div>
          <InterestsTab />
        </section>

        <!-- 04 // ROADMAP -->
        <section id="roadmap" class="pure-section">
          <div class="pure-sec-header">
            <span class="sec-num mono-ui" dir="ltr">04 //</span>
            <h2>مسیر من و اهداف توسعه</h2>
          </div>
          <RoadmapTab />
        </section>

        <!-- 05 // NOTES -->
        <section id="notes" class="pure-section">
          <div class="pure-sec-header">
            <span class="sec-num mono-ui" dir="ltr">05 //</span>
            <h2>یادداشت‌های فنی</h2>
          </div>
          <NotesTab />
        </section>

        <!-- 06 // GUESTBOOK -->
        <section id="guestbook" class="pure-section">
          <div class="pure-sec-header">
            <span class="sec-num mono-ui" dir="ltr">06 //</span>
            <h2>دفترچه یادگاری</h2>
          </div>
          <GuestbookTab />
        </section>
      </div>
    </main>
  </div>
</template>

<style scoped>
.pure-minimal-shell {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 40px;
  max-width: 1400px;
  margin: 0 auto;
  min-height: 100dvh;
  padding: 40px 20px;
  box-sizing: border-box;
}

.pure-minimal-shell.zen-mode {
  grid-template-columns: 1fr;
  padding: 0;
}

/* SIDEBAR (GLASS-FREE MATTE) */
.pure-sidebar {
  position: sticky;
  top: 40px;
  height: calc(100dvh - 80px);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 24px;
}

.sidebar-header {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.profile-avatar-ring {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid var(--neon);
  box-shadow: 0 0 18px rgba(56, 189, 248, 0.25);
  cursor: pointer;
  transition: transform 0.3s ease;
}

.profile-avatar-ring:hover {
  transform: scale(1.05);
}

.profile-avatar-ring img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-identity h1 {
  margin: 0 0 4px 0;
  font-size: 1.6rem;
  color: var(--text-main);
  font-weight: 800;
}

.profile-identity .subtitle {
  margin: 0;
  font-size: 0.84rem;
  color: var(--neon);
  font-weight: 700;
}

.pure-bio {
  margin: 0;
  font-size: 0.88rem;
  color: var(--text-secondary);
  line-height: 1.7;
  text-align: justify;
}

.pure-nav-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.pure-nav-list a {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: var(--text-secondary);
  font-size: 0.88rem;
  padding: 8px 0;
  transition: all 0.2s ease;
}

.nav-indicator {
  width: 24px;
  height: 2px;
  background: var(--panel-border);
  transition: all 0.3s ease;
}

.pure-nav-list a:hover {
  color: var(--text-main);
}

.pure-nav-list a:hover .nav-indicator {
  width: 44px;
  background: var(--text-main);
}

.pure-nav-list a.active {
  color: var(--neon);
  font-weight: 700;
}

.pure-nav-list a.active .nav-indicator {
  width: 56px;
  background: var(--neon);
  box-shadow: 0 0 10px var(--neon);
}

.sidebar-footer {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.pure-resume-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 18px;
  border-radius: 12px;
  background: rgba(56, 189, 248, 0.12);
  border: 1px solid var(--neon);
  color: var(--neon);
  font-size: 0.86rem;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.2s ease;
}

.pure-resume-link:hover {
  background: var(--neon);
  color: #040814;
  box-shadow: 0 0 18px rgba(56, 189, 248, 0.4);
}

.pure-social-icons {
  display: flex;
  gap: 12px;
}

.social-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--item-bg);
  border: 1px solid var(--panel-border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  color: var(--text-main);
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.social-icon:hover {
  border-color: var(--neon);
  transform: translateY(-2px);
}

/* CONTENT PANE (Pristine Scroll) */
.pure-content-pane {
  overflow-y: auto;
  max-height: calc(100dvh - 80px);
  padding-right: 8px;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
}

.pure-stream {
  display: flex;
  flex-direction: column;
  gap: 50px;
}

.pure-section {
  scroll-margin-top: 20px;
}

.pure-sec-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 22px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--panel-border);
}

.sec-num {
  font-size: 0.9rem;
  color: var(--neon);
  font-weight: 700;
}

.pure-sec-header h2 {
  margin: 0;
  font-size: 1.3rem;
  color: var(--text-main);
  font-weight: 800;
}

.pure-card {
  padding: 22px 24px;
  background: var(--item-bg);
  border: 1px solid var(--panel-border);
  border-radius: 18px;
  line-height: 1.8;
  color: var(--text-secondary);
  font-size: 0.95rem;
}

.lead-text {
  font-size: 1.05rem;
  color: var(--text-main);
}

.pure-card strong {
  color: var(--neon);
}

/* Projects Grid */
.pure-filter-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}

.pure-chip-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 10px;
  background: var(--item-bg);
  border: 1px solid var(--panel-border);
  color: var(--text-secondary);
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  font-family: inherit;
}

.pure-chip-btn:hover {
  border-color: var(--neon);
  color: var(--text-main);
}

.pure-chip-btn.active {
  background: rgba(56, 189, 248, 0.15);
  border-color: var(--neon);
  color: var(--neon);
  font-weight: 700;
}

.chip-num {
  font-size: 0.72rem;
  padding: 1px 6px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid var(--panel-border);
  font-family: var(--font-mono, monospace);
}

.pure-projects-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.pure-project-item {
  padding: 20px 22px;
  background: var(--item-bg);
  border: 1px solid var(--panel-border);
  border-radius: 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.pure-project-item:hover {
  border-color: var(--neon);
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.25);
}

.proj-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.proj-head h4 {
  margin: 0;
  font-size: 1.1rem;
  color: var(--text-main);
  font-weight: 700;
}

.proj-title-link {
  color: var(--text-main);
  text-decoration: none;
  transition: color 0.2s;
}

.proj-title-link:hover {
  color: var(--neon);
}

.proj-status {
  font-size: 0.76rem;
  padding: 3px 10px;
  border-radius: 8px;
  background: rgba(56, 189, 248, 0.08);
  border: 1px solid rgba(56, 189, 248, 0.2);
  color: var(--neon);
  font-weight: 600;
}

.proj-desc {
  margin: 0;
  font-size: 0.88rem;
  color: var(--text-secondary);
  line-height: 1.65;
  text-align: justify;
}

.proj-tech-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tech-tag {
  font-size: 0.74rem;
  padding: 3px 9px;
  border-radius: 8px;
  border: 1px solid;
  font-weight: 600;
}

.proj-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 8px;
  border-top: 1px solid var(--panel-border);
  font-size: 0.84rem;
  color: var(--text-secondary);
}

.pure-arch-btn {
  background: var(--item-bg);
  border: 1px solid var(--panel-border);
  color: var(--neon);
  padding: 6px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.2s;
  font-family: var(--font-mono, monospace);
}

.pure-arch-btn:hover {
  background: var(--item-hover-bg);
  border-color: var(--neon);
}

@media (max-width: 1024px) {
  .pure-minimal-shell {
    grid-template-columns: 1fr;
    gap: 30px;
    padding: 20px 14px;
  }

  .pure-sidebar {
    position: relative;
    top: 0;
    height: auto;
  }

  .pure-content-pane {
    max-height: none;
    overflow: visible;
  }
}
</style>

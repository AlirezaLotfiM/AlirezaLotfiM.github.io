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
  downloadVCard,
} = usePortfolio();

const showQrModal = ref(false);

const { playClick } = useAudioSynth();
const { tabPaths, navigateFromEvent } = useNavigation();

const emit = defineEmits(['open-terminal', 'go-home', 'toggle-zen']);

const props = defineProps({
  isZenMode: Boolean,
});

const appVersion = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '1.7.0';

const activeSection = ref('about');
const contentPaneRef = ref(null);

const getTechList = (langString) => {
  if (!langString) return [];
  return langString.split(/\s*\/\s*/).map((l) => getTechDetails(l));
};

const formatStatus = (st) => {
  if (!st) return null;
  const lower = st.toLowerCase();
  if (lower.includes('عملیاتی') || lower.includes('live') || lower.includes('prod')) return { text: 'عملیاتی', type: 'prod' };
  if (lower.includes('فعال') || lower.includes('active')) return { text: 'فعال', type: 'prod' };
  if (lower.includes('پایدار') || lower.includes('stable')) return { text: 'پایدار', type: 'prod' };
  if (lower.includes('توسعه') || lower.includes('طراحی') || lower.includes('ship') || lower.includes('dev')) return { text: 'در حال توسعه', type: 'dev' };
  if (lower.includes('پشتیبانی') || lower.includes('maintained')) return { text: 'در حال پشتیبانی', type: 'neutral' };
  return { text: st, type: 'neutral' };
};

const navItems = [
  { id: 'about', label: 'درباره من', num: '۰۰' },
  { id: 'experience', label: 'سوابق کاری', num: '۰۱' },
  { id: 'projects', label: 'پروژه‌ها', num: '۰۲' },
  { id: 'skills', label: 'تخصص‌ها', num: '۰۳' },
  { id: 'notes', label: 'یادداشت‌ها', num: '۰۴' },
];

const specializationPillars = [
  {
    category: 'BACKEND ARCHITECTURE',
    title: 'معماری بک‌اند و سیستم‌های توزیع‌شده',
    desc: 'طراحی موتورهای همزمان با کارایی بالا، معماری بلادرنگ با SignalR و پیاده‌سازی الگوهای CQRS و Clean Architecture.',
    techs: ['C# / .NET 9', 'ASP.NET Core', 'SignalR', 'RabbitMQ', 'Clean Architecture', 'CQRS'],
    icon: '⚙️'
  },
  {
    category: 'DESKTOP & INTEGRATION',
    title: 'دسکتاپ صنعتی و یکپارچه‌سازی سخت‌افزار',
    desc: 'توسعه اپلیکیشن‌های دسکتاپ مقیاس‌پذیر با WPF و اتصال مستقیم نرم‌افزار به اسکنرهای بیومتریک و تجهیزات جانبی.',
    techs: ['WPF / MVVM', 'Win32 API', 'Suprema Biometric SDK', 'WIA Scanner SDK', 'Multithreading'],
    icon: '🔌'
  },
  {
    category: 'DATABASE & DATA ENGINE',
    title: 'بانک‌های اطلاعاتی و بهینه‌سازی داده',
    desc: 'طراحی ساختارهای پایگاه داده ارتباطی، بهینه‌سازی کوئری‌های سنگین T-SQL و مدیریت تراکنش‌های با حجم بالا.',
    techs: ['SQL Server', 'EF Core', 'Dapper', 'T-SQL Tuning', 'Indexing Strategy'],
    icon: '💾'
  },
  {
    category: 'INTERACTIVE FRONTEND & AI',
    title: 'تکنولوژی‌های وب و ابزارهای هوش مصنوعی',
    desc: 'خلق دشبوردهای تعاملی وب و یکپارچه‌سازی مدل‌های هوش مصنوعی محلی در برنامه‌های دسکتاپ و سازمانی.',
    techs: ['Vue.js 3', 'Vite / JavaScript', 'LLamaSharp (Local AI)', 'Tesseract OCR'],
    icon: '🚀'
  }
];

const sectionRoutes = {
  about: '/',
  experience: '/experience/',
  projects: '/projects/',
  skills: '/skills/',
  notes: '/notes/'
};

const getSectionFromUrl = () => {
  if (typeof window === 'undefined') return 'about';
  const path = window.location.pathname.toLowerCase().replace(/\/$/, '') || '/';
  const hash = window.location.hash.toLowerCase().replace('#', '');

  if (hash && ['about', 'experience', 'projects', 'skills', 'notes'].includes(hash)) {
    return hash;
  }

  if (path.includes('experience')) return 'experience';
  if (path.includes('projects')) return 'projects';
  if (path.includes('skills')) return 'skills';
  if (path.includes('notes')) return 'notes';
  return 'about';
};

const syncUrlWithSection = (sectionId) => {
  if (typeof window === 'undefined') return;
  const targetRoute = sectionRoutes[sectionId] || '/';
  if (window.location.pathname !== targetRoute && window.location.pathname + '/' !== targetRoute) {
    window.history.replaceState(null, '', targetRoute);
  }
};

const updateActiveSectionOnScroll = () => {
  if (typeof document === 'undefined') return;

  const sectionIds = ['about', 'experience', 'projects', 'skills', 'notes'];
  const sections = sectionIds
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  if (!sections.length) return;

  const isMobile = window.innerWidth < 1024;
  let activeId = activeSection.value;

  if (isMobile) {
    const scrollPosition = window.scrollY;
    const windowHeight = window.innerHeight;
    const fullHeight = document.documentElement.scrollHeight;

    if (scrollPosition + windowHeight >= fullHeight - 80) {
      activeId = 'notes';
    } else {
      sections.forEach((sec) => {
        const secRect = sec.getBoundingClientRect();
        if (secRect.top <= 140 && secRect.bottom > 60) {
          activeId = sec.id;
        }
      });
    }
  } else if (contentPaneRef.value) {
    const containerRect = contentPaneRef.value.getBoundingClientRect();
    const isAtBottom =
      contentPaneRef.value.scrollHeight - contentPaneRef.value.scrollTop - contentPaneRef.value.clientHeight < 100;

    if (isAtBottom) {
      activeId = 'notes';
    } else {
      sections.forEach((sec) => {
        const secRect = sec.getBoundingClientRect();
        const relativeTop = secRect.top - containerRect.top;
        if (relativeTop <= 180 && secRect.bottom - containerRect.top > 60) {
          activeId = sec.id;
        }
      });
    }
  }

  if (activeSection.value !== activeId) {
    activeSection.value = activeId;
    syncUrlWithSection(activeId);
  }
};

const handleScrollEvent = () => {
  updateActiveSectionOnScroll();
};

onMounted(() => {
  if (typeof window !== 'undefined') {
    window.addEventListener('scroll', handleScrollEvent, { passive: true });
  }
  if (contentPaneRef.value) {
    contentPaneRef.value.addEventListener('scroll', handleScrollEvent, { passive: true });
  }

  const initialSection = getSectionFromUrl();
  activeSection.value = initialSection;

  if (initialSection !== 'about') {
    setTimeout(() => {
      const target = document.getElementById(initialSection);
      if (target) {
        const isMobile = window.innerWidth < 1024;
        if (isMobile) {
          const topOffset = 118;
          const elementPosition = target.getBoundingClientRect().top + window.scrollY;
          window.scrollTo({ top: Math.max(0, elementPosition - topOffset), behavior: 'instant' });
        } else if (contentPaneRef.value) {
          const containerTop = contentPaneRef.value.getBoundingClientRect().top;
          const targetTop = target.getBoundingClientRect().top;
          const offset = targetTop - containerTop + contentPaneRef.value.scrollTop;
          contentPaneRef.value.scrollTop = Math.max(0, offset - 12);
        }
      }
    }, 50);
  } else {
    updateActiveSectionOnScroll();
  }
});

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('scroll', handleScrollEvent);
  }
  if (contentPaneRef.value) {
    contentPaneRef.value.removeEventListener('scroll', handleScrollEvent);
  }
});

// Precise container scrolling with dynamic URL & SEO route syncing
const scrollToSection = (sectionId, event) => {
  playClick();
  closeNote();
  if (event) event.preventDefault();

  activeSection.value = sectionId;
  syncUrlWithSection(sectionId);

  const target = document.getElementById(sectionId);
  if (!target) return;

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;

  if (isMobile) {
    const topOffset = 118;
    const elementPosition = target.getBoundingClientRect().top + window.scrollY;
    const offsetPosition = elementPosition - topOffset;
    window.scrollTo({
      top: Math.max(0, offsetPosition),
      behavior: 'smooth',
    });
  } else if (contentPaneRef.value) {
    const containerTop = contentPaneRef.value.getBoundingClientRect().top;
    const targetTop = target.getBoundingClientRect().top;
    const offset = targetTop - containerTop + contentPaneRef.value.scrollTop;

    contentPaneRef.value.scrollTo({
      top: Math.max(0, offset - 12),
      behavior: 'smooth',
    });
  }
};

const highlightedProjectSlug = ref('');

const navigateToProject = async (relProj) => {
  playClick();
  const slug = relProj.slug || relProj.id;
  highlightedProjectSlug.value = slug;

  const targetId = `project-${slug}`;
  const el = document.getElementById(targetId);

  if (el) {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;
    if (isMobile) {
      const topOffset = 120;
      const elementPosition = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: Math.max(0, elementPosition - topOffset),
        behavior: 'smooth',
      });
    } else if (contentPaneRef.value) {
      const containerTop = contentPaneRef.value.getBoundingClientRect().top;
      const targetTop = el.getBoundingClientRect().top;
      const offset = targetTop - containerTop + contentPaneRef.value.scrollTop;

      contentPaneRef.value.scrollTo({
        top: Math.max(0, offset - 20),
        behavior: 'smooth',
      });
    }
  } else {
    scrollToSection('projects');
  }

  setTimeout(() => {
    if (highlightedProjectSlug.value === slug) {
      highlightedProjectSlug.value = '';
    }
  }, 3500);
};
</script>

<template>
  <div class="master-shell">
    <!-- TOP BAR (RIGHT: DAMOON LOGO + VERSION / LEFT: OUTLINE SOCIAL ICONS NO BG) -->
    <header class="swiss-top-bar" :class="{ hidden: isZenMode }">
      <div class="top-bar-inner">
        <!-- RIGHT: Damoon Full Written-out Typographic Logo + Version Pill -->
        <div class="header-logo-wrap" title="Damoon Portfolio">
          <img src="/monogram-damoon.png" alt="Damoon" class="damoon-full-logo-img" width="98" height="98" />
          <span class="header-version-pill mono-ui" dir="ltr">v{{ appVersion }}</span>
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

      <!-- RIGHT SIDEBAR (PURE SWISS EDITORIAL - NO BOXES, NO SCROLLING) -->
      <aside v-if="!isZenMode" class="editorial-sidebar">
        <div class="sidebar-top">
          <!-- PURE TYPOGRAPHIC IDENTITY (BORDERLESS) -->
          <div class="sidebar-identity">
            <h1 class="author-name">علیرضا لطفی مقدم</h1>
            <p class="role-subtitle mono-ui" dir="ltr">Senior Software Engineer & .NET Architect</p>
            <p class="concise-bio">
              توسعه‌دهنده و معمار نرم‌افزار متمرکز بر سیستم‌های توزیع‌شده C#، ASP.NET Core و اپلیکیشن‌های دسکتاپ صنعتی (WPF).
            </p>
          </div>

          <!-- NAVIGATION MENU -->
          <nav class="editorial-nav" aria-label="ناوبری اصلی">
            <a
              v-for="item in navItems"
              :key="item.id"
              :href="sectionRoutes[item.id]"
              @click="scrollToSection(item.id, $event)"
              :class="{ active: !selectedNote && activeSection === item.id }"
            >
              <span class="nav-num mono-ui" dir="ltr">{{ item.num }}</span>
              <span class="nav-label">{{ item.label }}</span>
            </a>
          </nav>
        </div>

        <div class="sidebar-bottom">
          <a :href="tabPaths.resume" @click="navigateFromEvent($event, tabPaths.resume)" class="editorial-resume-btn">
            <span>مشاهده رزومه رسمی A4</span>
            <span class="btn-arrow mono-ui">PDF ↗</span>
          </a>
          <div class="sidebar-contact-tools">
            <button @click="downloadVCard" class="tool-chip-btn" title="ذخیره مستقیم شماره و اطلاعات در گوشی (vCard)">
              📇 vCard
            </button>
            <button @click="showQrModal = true" class="tool-chip-btn" title="نمایش کد QR پورتفولیو">
              📱 QR Code
            </button>
          </div>
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
              من <strong>علیرضا لطفی</strong> (لطفی مقدم) هستم؛ توسعه‌دهنده و معمار نرم‌افزار با <strong>+۶ سال سابقه تخصصی</strong> در توسعه سیستم‌های توزیع‌شده با کارایی بالا، موتورهای C# و .NET Core، و اپلیکیشن‌های دسکتاپ صنعتی (WPF).
            </p>
            <p>
              تخصص اصلی من بر پایه‌ی طراحی سیستم‌های بلادرنگ با SignalR، یکپارچه‌سازی سخت‌افزارهای بیومتریک (دستگاه اثر انگشت Suprema و اسکنر WIA) و مدیریت بانک‌های اطلاعاتی سنگین شکل گرفته است.
            </p>

            <!-- EDITORIAL SPECS STRIP (RELOCATED FROM SIDEBAR FOR CLEAN ELEGANT PRESENTATION) -->
            <div class="editorial-specs-strip">
              <div class="spec-strip-item">
                <span class="spec-num mono-ui" dir="ltr">+۶ سال</span>
                <span class="spec-lbl">سابقه تخصصی</span>
              </div>
              <div class="spec-strip-divider"></div>
              <div class="spec-strip-item">
                <span class="spec-num mono-ui" dir="ltr">۱۶+</span>
                <span class="spec-lbl">پروژه عملیاتی</span>
              </div>
              <div class="spec-strip-divider"></div>
              <div class="spec-strip-item">
                <span class="spec-num mono-ui" dir="ltr">.NET / C#</span>
                <span class="spec-lbl">استک اصلی معماری</span>
              </div>
            </div>
          </div>
        </section>

        <!-- 01 // EXPERIENCE (REDESIGNED TIMELINE STREAM) -->
        <section id="experience" class="editorial-section">
          <div class="sec-title-bar">
            <span class="num mono-ui" dir="ltr">01 //</span>
            <h2>سوابق کاری و دستاوردهای اجرایی</h2>
          </div>

          <div class="experience-timeline-wrapper">
            <article v-for="(job, index) in workExperience" :key="index" class="timeline-job-card">
              <div class="timeline-left-node">
                <span class="node-dot"></span>
                <span class="node-line" v-if="index < workExperience.length - 1"></span>
              </div>

              <div class="job-card-content">
                <div class="job-header-row">
                  <div class="job-title-group">
                    <h3>{{ job.title || job.role }}</h3>
                    <span class="job-company mono-ui">@ {{ job.company }}</span>
                  </div>
                  <span class="period-badge-pill mono-ui" dir="ltr">{{ job.period }}</span>
                </div>

                <p v-if="job.role_summary" class="job-summary-text">{{ job.role_summary }}</p>

                <!-- Achievement Bullet Chips -->
                <div v-if="job.description && Array.isArray(job.description)" class="job-achievements-list">
                  <div v-for="(item, i) in job.description" :key="i" class="achievement-chip-item">
                    <span class="chip-bullet">✦</span>
                    <span class="chip-text">{{ item }}</span>
                  </div>
                </div>

                <!-- Fallback highlights -->
                <div v-else-if="job.highlights && Array.isArray(job.highlights)" class="job-achievements-list">
                  <div v-for="(hl, i) in job.highlights" :key="i" class="achievement-chip-item">
                    <span class="chip-bullet">✦</span>
                    <span class="chip-text">{{ hl }}</span>
                  </div>
                </div>

                <!-- Related Projects Box -->
                <div v-if="job.related_projects && job.related_projects.length" class="job-related-projects-box">
                  <span class="related-title mono-ui">پروژه‌های کلیدی مرتبط:</span>
                  <div class="related-chips-row">
                    <button
                      v-for="relProj in job.related_projects"
                      :key="relProj.id"
                      @click="navigateToProject(relProj)"
                      class="related-project-chip mono-ui"
                      title="مشاهده جزئیات و معماری پروژه"
                    >
                      <span class="chip-icon">📂</span>
                      <span>{{ relProj.name }}</span>
                      <span class="chip-arrow">↗</span>
                    </button>
                  </div>
                </div>

                <!-- Technologies Row -->
                <div v-if="job.technologies?.length || job.tech?.length" class="job-tech-pills-row">
                  <span v-for="t in (job.technologies || job.tech)" :key="t" class="tech-pill-badge mono-ui" dir="ltr">
                    {{ t }}
                  </span>
                </div>
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
              :id="'project-' + (p.slug || p.id)"
              :class="['project-editorial-card', { 'highlight-pulse': highlightedProjectSlug === (p.slug || p.id) }]"
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
              </div>
            </article>
          </div>
        </section>

        <!-- 03 // SKILLS & SPECIALIZATIONS (REDESIGNED ARCHITECTURAL PILLARS) -->
        <section id="skills" class="editorial-section">
          <div class="sec-title-bar">
            <span class="num mono-ui" dir="ltr">03 //</span>
            <h2>تخصص‌ها و حوزه‌های تمرکز فنی</h2>
          </div>

          <div class="specialization-pillars-grid">
            <div v-for="(pillar, index) in specializationPillars" :key="index" class="pillar-card">
              <div class="pillar-top-bar">
                <span class="pillar-category mono-ui" dir="ltr">{{ pillar.category }}</span>
                <span class="pillar-icon">{{ pillar.icon }}</span>
              </div>
              <h3 class="pillar-title">{{ pillar.title }}</h3>
              <p class="pillar-desc">{{ pillar.desc }}</p>

              <div class="pillar-tech-tags">
                <span v-for="tech in pillar.techs" :key="tech" class="pillar-tag-item mono-ui" dir="ltr">
                  {{ tech }}
                </span>
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

        <!-- STREAM FOOTER (SUPPLIES GENEROUS SCROLL SPACE SO #NOTES REACHES TOP & ACTIVE MENU HIGHLIGHTS) -->
        <footer class="editorial-stream-footer">
          <div class="footer-divider"></div>
          <div class="footer-bottom-row">
            <p class="copyright mono-ui" dir="ltr">© 2026 Alireza Lotfi Moghaddam — Systems & Architecture</p>
            <button @click="scrollToSection('about')" class="scroll-top-btn mono-ui">
              ↑ بازگشت به بالا
            </button>
          </div>
        </footer>
      </main>
    </div>

    <!-- QR CODE MODAL OVERLAY -->
    <Transition name="fade">
      <div v-if="showQrModal" class="qr-modal-overlay" @click.self="showQrModal = false">
        <div class="qr-modal-card">
          <button class="close-qr-btn" @click="showQrModal = false">✕</button>
          <h3>📱 اسکن کد QR پورتفولیو</h3>
          <p>با دوربین گوشی اسکن کنید تا آدرس سایت مستقیماً باز شود:</p>
          <div class="qr-image-wrap">
            <img src="/qr-code.svg" alt="QR Code Alireza Lotfi Portfolio" width="200" height="200" />
          </div>
          <div class="qr-url-pill mono-ui" dir="ltr">alirezalotfimoghaddam.ir</div>
        </div>
      </div>
    </Transition>
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

/* FULL-BLEED TRANSPARENT STICKY TOP BAR */
.swiss-top-bar {
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  width: 100%;
  margin: 0;
  padding: 8px 36px;
  background: transparent;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  border-bottom: none;
  box-sizing: border-box;
}

.swiss-top-bar.hidden {
  display: none;
}

.top-bar-inner {
  width: 100%;
  max-width: 100%;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 90px;
}

.header-logo-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}

.damoon-full-logo-img {
  width: 90px;
  height: 90px;
  object-fit: contain;
  filter: var(--logo-filter, drop-shadow(0 2px 8px rgba(79, 70, 229, 0.15)));
  display: block;
}

.header-version-pill {
  font-size: 0.68rem;
  color: var(--neon);
  font-weight: 700;
  padding: 2px 8px;
  background: rgba(79, 70, 229, 0.08);
  border-radius: 6px;
  border: 1px solid rgba(79, 70, 229, 0.18);
}

.header-logo-wrap:hover {
  transform: translateY(-1px);
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
  transition: color 0.2s ease, transform 0.2s ease;
  will-change: transform;
}

.header-icon-link:hover {
  color: var(--neon);
  transform: translateY(-2px);
}

/* EDITORIAL LAYOUT */
.editorial-layout {
  display: grid;
  grid-template-columns: 290px 1fr;
  gap: 72px;
  max-width: 1380px;
  margin: 0 auto;
  width: 100%;
  min-height: calc(100dvh - 110px);
  padding: 16px;
  box-sizing: border-box;
}

.editorial-layout.zen-mode {
  grid-template-columns: 1fr;
  padding: 0;
}

/* SIDEBAR (RIGHT ALIGNED - STRICTLY NO SCROLLBAR, FITS VIEWPORT PERFECTLY) */
.editorial-sidebar {
  position: sticky;
  top: 100px;
  height: fit-content;
  max-height: calc(100vh - 130px);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 28px;
  overflow: hidden; /* ZERO SCROLLBAR */
}

.sidebar-top {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: right;
  gap: 24px;
}

/* PURE TYPOGRAPHIC IDENTITY (NO BOXED CONTAINERS) */
.sidebar-identity {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: right;
  gap: 8px;
}

.sidebar-identity .author-name {
  margin: 0;
  font-size: 1.55rem;
  color: var(--text-main);
  font-weight: 800;
  line-height: 1.25;
  letter-spacing: -0.3px;
}

.sidebar-identity .role-subtitle {
  margin: 0;
  font-size: 0.78rem;
  color: var(--neon);
  font-weight: 700;
}

.sidebar-identity .concise-bio {
  margin: 4px 0 0 0;
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.7;
}

.editorial-nav {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  margin-top: 4px;
}

.editorial-nav a {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: var(--text-secondary);
  font-size: 0.9rem;
  padding: 6px 0;
  transition: all 0.2s ease;
  border-right: 2px solid transparent;
}

.nav-num {
  font-size: 0.76rem;
  color: var(--text-soft);
}

.editorial-nav a:hover {
  color: var(--text-main);
}

.editorial-nav a.active {
  color: var(--neon);
  font-weight: 800;
  border-right-color: var(--neon);
  padding-right: 10px;
}

.editorial-nav a.active .nav-num {
  color: var(--neon);
}

.sidebar-bottom {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.sidebar-contact-tools {
  display: flex;
  gap: 8px;
}

.tool-chip-btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 10px;
  background: var(--item-bg);
  border: 1px solid var(--panel-border);
  color: var(--text-secondary);
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.tool-chip-btn:hover {
  border-color: var(--neon);
  color: var(--neon);
  transform: translateY(-1px);
}

/* HIGH-END SWISS EDITORIAL RESUME BUTTON */
.editorial-resume-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 12px 18px;
  border-radius: 12px;
  background: var(--item-bg);
  border: 1px solid var(--panel-border);
  color: var(--text-main);
  font-size: 0.86rem;
  font-weight: 700;
  text-decoration: none;
  box-shadow: 0 2px 12px rgba(15, 23, 42, 0.04);
  transition: all 0.25s ease;
  box-sizing: border-box;
}

.editorial-resume-btn .btn-arrow {
  font-size: 0.74rem;
  color: var(--neon);
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;
  background: rgba(79, 70, 229, 0.08);
  border: 1px solid rgba(79, 70, 229, 0.18);
  transition: all 0.2s ease;
}

.editorial-resume-btn:hover {
  border-color: var(--neon);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(79, 70, 229, 0.12);
  color: var(--neon);
}

.editorial-resume-btn:hover .btn-arrow {
  background: var(--neon);
  color: #ffffff;
}

/* CONTENT STREAM */
.editorial-content {
  overflow-y: auto;
  max-height: calc(100vh - 120px);
  padding: 10px 20px 20px 20px;
  scroll-behavior: smooth;
  scrollbar-width: thin;
}

.editorial-section {
  margin-bottom: 56px;
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

/* EDITORIAL SPECS STRIP (EMBEDDED IN ABOUT SECTION) */
.editorial-specs-strip {
  display: flex;
  align-items: center;
  justify-content: space-around;
  gap: 16px;
  margin-top: 28px;
  padding: 18px 24px;
  background: var(--item-bg);
  border: 1px solid var(--panel-border);
  border-radius: 14px;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.03);
}

.spec-strip-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 4px;
}

.spec-strip-item .spec-num {
  font-size: 1.15rem;
  color: var(--neon);
  font-weight: 800;
}

.spec-strip-item .spec-lbl {
  font-size: 0.78rem;
  color: var(--text-secondary);
  font-weight: 600;
}

.spec-strip-divider {
  width: 1px;
  height: 28px;
  background: var(--panel-border);
}

/* REDESIGNED EXPERIENCE TIMELINE STREAM */
.experience-timeline-wrapper {
  display: flex;
  flex-direction: column;
  gap: 28px;
  position: relative;
  margin-top: 8px;
}

.timeline-job-card {
  display: flex;
  gap: 18px;
  position: relative;
}

.timeline-left-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 20px;
  flex-shrink: 0;
  padding-top: 6px;
}

.node-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--item-bg);
  border: 3px solid var(--neon);
  box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.12);
}

.node-line {
  width: 2px;
  flex-grow: 1;
  background: linear-gradient(180deg, var(--neon) 0%, rgba(203, 213, 225, 0.4) 100%);
  margin-top: 6px;
}

.job-card-content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 22px;
  background: var(--item-bg);
  border: 1px solid var(--panel-border);
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.03);
  transition: all 0.25s ease;
}

.job-card-content:hover {
  border-color: var(--neon);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(79, 70, 229, 0.1);
}

.job-header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 14px;
}

.job-title-group h3 {
  margin: 0 0 4px 0;
  font-size: 1.15rem;
  color: var(--text-main);
  font-weight: 800;
}

.job-company {
  font-size: 0.86rem;
  color: var(--neon);
  font-weight: 700;
}

.period-badge-pill {
  font-size: 0.76rem;
  color: var(--neon);
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 8px;
  background: rgba(79, 70, 229, 0.08);
  border: 1px solid rgba(79, 70, 229, 0.18);
  white-space: nowrap;
}

.job-summary-text {
  margin: 0;
  font-size: 0.92rem;
  color: var(--text-main);
  font-weight: 600;
  line-height: 1.6;
}

.job-achievements-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 4px;
}

.achievement-chip-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 0.88rem;
  color: var(--text-secondary);
  line-height: 1.7;
}

.chip-bullet {
  color: var(--neon);
  font-size: 0.75rem;
  margin-top: 3px;
}

/* JOB RELATED PROJECTS BOX */
.job-related-projects-box {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 6px;
  padding: 12px 14px;
  background: rgba(79, 70, 229, 0.04);
  border: 1px dashed rgba(79, 70, 229, 0.2);
  border-radius: 12px;
}

.related-title {
  font-size: 0.76rem;
  color: var(--neon);
  font-weight: 700;
}

.related-chips-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.related-project-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 8px;
  background: var(--item-bg);
  border: 1px solid rgba(79, 70, 229, 0.25);
  color: var(--text-main);
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.related-project-chip .chip-icon {
  font-size: 0.85rem;
}

.related-project-chip .chip-arrow {
  color: var(--neon);
  font-size: 0.78rem;
  transition: transform 0.2s ease;
}

.related-project-chip:hover {
  border-color: var(--neon);
  background: var(--neon);
  color: #ffffff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);
}

.related-project-chip:hover .chip-arrow {
  color: #ffffff;
  transform: translateX(-2px);
}

.job-tech-pills-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 6px;
  padding-top: 12px;
  border-top: 1px dashed var(--panel-border);
}

.tech-pill-badge {
  font-size: 0.74rem;
  padding: 3px 9px;
  border-radius: 6px;
  background: var(--item-hover-bg);
  border: 1px solid var(--panel-border);
  color: var(--text-secondary);
  font-weight: 600;
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
  padding: 16px 20px;
  margin: -16px -20px;
}

.project-editorial-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  background: var(--item-bg);
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

/* REDESIGNED SPECIALIZATION PILLARS GRID */
.specialization-pillars-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 20px;
}

.pillar-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 12px;
  padding: 22px;
  background: var(--item-bg);
  border: 1px solid var(--panel-border);
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.03);
  transition: all 0.25s ease;
  position: relative;
  overflow: hidden;
}

.pillar-card::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  height: 3px;
  background: var(--neon);
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.pillar-card:hover {
  border-color: var(--neon);
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(79, 70, 229, 0.12);
}

.pillar-card:hover::before {
  opacity: 1;
}

.pillar-top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pillar-category {
  font-size: 0.72rem;
  color: var(--neon);
  font-weight: 700;
  letter-spacing: 0.5px;
}

.pillar-icon {
  font-size: 1.25rem;
}

.pillar-title {
  margin: 2px 0 0 0;
  font-size: 1.08rem;
  color: var(--text-main);
  font-weight: 800;
  line-height: 1.4;
}

.pillar-desc {
  margin: 0;
  font-size: 0.86rem;
  color: var(--text-secondary);
  line-height: 1.7;
  flex-grow: 1;
}

.pillar-tech-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
  padding-top: 12px;
  border-top: 1px dashed var(--panel-border);
}

.pillar-tag-item {
  font-size: 0.74rem;
  padding: 3px 9px;
  border-radius: 6px;
  background: rgba(79, 70, 229, 0.06);
  border: 1px solid rgba(79, 70, 229, 0.15);
  color: var(--neon);
  font-weight: 600;
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

/* STREAM FOOTER (SUPPLIES GENEROUS SCROLL SPACE SO #NOTES REACHES TOP & ACTIVE MENU HIGHLIGHTS) */
.editorial-stream-footer {
  margin-top: 80px;
  padding-bottom: 240px;
}

.footer-divider {
  width: 100%;
  height: 1px;
  background: var(--panel-border);
  margin-bottom: 24px;
}

.footer-bottom-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.copyright {
  margin: 0;
  font-size: 0.78rem;
  color: var(--text-soft);
}

.scroll-top-btn {
  background: transparent;
  border: 1px solid var(--panel-border);
  color: var(--text-secondary);
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 0.78rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.scroll-top-btn:hover {
  border-color: var(--neon);
  color: var(--neon);
}

@media (max-width: 1024px) {
  .editorial-layout {
    grid-template-columns: 1fr;
    gap: 20px;
    padding: 14px;
  }

  .editorial-sidebar, .editorial-content {
    position: relative;
    top: 0;
    max-height: none;
    overflow: visible;
  }

  .editorial-sidebar .concise-bio {
    display: none;
  }

  .sidebar-identity {
    margin-bottom: 8px;
  }

  .editorial-specs-strip {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    padding: 14px 16px;
  }

  .spec-strip-divider {
    display: none;
  }

  .job-header-row {
    flex-direction: column;
    gap: 4px;
  }
}

@media (max-width: 768px) {
  .swiss-top-bar {
    padding: 4px 16px;
    background: var(--bg-main);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--panel-border);
  }

  .top-bar-inner {
    min-height: 58px;
  }

  .damoon-full-logo-img {
    width: 48px;
    height: 48px;
  }

  .header-version-pill {
    font-size: 0.6rem;
    padding: 1px 5px;
  }

  .header-social-icons {
    gap: 8px;
  }

  .header-icon-link {
    padding: 6px;
  }

  .header-icon-link svg {
    width: 18px;
    height: 18px;
  }

  .editorial-layout {
    gap: 16px;
    padding: 10px;
  }

  .sidebar-identity .author-name {
    font-size: 1.3rem;
  }

  .sidebar-identity .author-lead {
    font-size: 0.84rem;
    line-height: 1.65;
  }

  .editorial-nav {
    position: sticky;
    top: 58px;
    z-index: 95;
    flex-direction: row;
    overflow-x: auto;
    white-space: nowrap;
    padding: 8px 4px;
    margin: 0 0 12px 0;
    background: var(--bg-main);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-bottom: 1px solid var(--panel-border);
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
  }

  .editorial-nav::-webkit-scrollbar {
    display: none;
  }

  .editorial-nav a {
    padding: 6px 12px;
    border-right: none;
    border-bottom: 2px solid transparent;
    border-radius: 8px;
    background: var(--item-bg);
    border: 1px solid var(--panel-border);
    flex-shrink: 0;
    font-size: 0.78rem;
  }

  .editorial-nav a.active {
    border-color: var(--neon);
    background: rgba(79, 70, 229, 0.12);
    color: var(--neon);
  }

  .specialization-pillars-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .pillar-card {
    padding: 16px;
  }

  .job-card-content {
    padding: 14px;
  }

  .timeline-job-card {
    gap: 10px;
  }

  .editorial-specs-strip {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    padding: 12px;
  }

  .spec-item .value {
    font-size: 1.1rem;
  }

  .spec-item .label {
    font-size: 0.65rem;
  }

  .editorial-stream-footer {
    padding-bottom: 100px;
  }
}

@keyframes neonPulse {
  0% {
    box-shadow: inset 0 0 0 2px #4f46e5, 0 0 12px 2px rgba(79, 70, 229, 0.45);
    border-color: #4f46e5;
    background-color: rgba(79, 70, 229, 0.04);
  }
  50% {
    box-shadow: inset 0 0 0 2px #4f46e5, 0 0 24px 6px rgba(79, 70, 229, 0.75);
    border-color: #4f46e5;
    background-color: rgba(79, 70, 229, 0.1);
  }
  100% {
    box-shadow: inset 0 0 0 2px #4f46e5, 0 0 12px 2px rgba(79, 70, 229, 0.45);
    border-color: #4f46e5;
    background-color: rgba(79, 70, 229, 0.04);
  }
}

.highlight-pulse {
  animation: neonPulse 1.1s ease-in-out 3 !important;
  border-color: #4f46e5 !important;
  transition: all 0.6s ease !important;
  position: relative;
  z-index: 5;
}

.qr-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 10000;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.qr-modal-card {
  position: relative;
  background: #ffffff;
  color: #0f172a;
  border-radius: 24px;
  padding: 28px 24px;
  max-width: 340px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
  direction: rtl;
}

.close-qr-btn {
  position: absolute;
  top: 14px;
  left: 14px;
  background: #f1f5f9;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  cursor: pointer;
  font-weight: bold;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.close-qr-btn:hover {
  background: #e2e8f0;
  color: #0f172a;
}

.qr-modal-card h3 {
  margin: 0 0 6px 0;
  font-size: 1.15rem;
  color: #0f172a;
}

.qr-modal-card p {
  margin: 0 0 18px 0;
  font-size: 0.82rem;
  color: #64748b;
  text-align: center;
}

.qr-image-wrap {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 12px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  margin-bottom: 16px;
}

.qr-image-wrap img {
  display: block;
  max-width: 100%;
  height: auto;
}

.qr-url-pill {
  font-size: 0.8rem;
  font-weight: 700;
  color: #4f46e5;
  background: #f1f5f9;
  padding: 6px 14px;
  border-radius: 8px;
  display: inline-block;
}
</style>

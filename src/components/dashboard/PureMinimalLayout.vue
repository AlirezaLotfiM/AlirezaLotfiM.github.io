<script setup>
import { ref, onMounted, onUnmounted, defineAsyncComponent } from 'vue';
import { usePortfolio } from '../../composables/usePortfolio';
import { useAudioSynth } from '../../composables/useAudioSynth';
import { useNavigation } from '../../composables/useNavigation';
import { useTheme } from '../../composables/useTheme';
import { useMarkdown } from '../../composables/useMarkdown';

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

const { playClick, playThemeChirp } = useAudioSynth();
const { currentTheme, toggleTheme, isDark } = useTheme();
const { parseMarkdown } = useMarkdown();
const { tabPaths, navigateFromEvent } = useNavigation();

const emit = defineEmits(['open-terminal', 'go-home', 'toggle-zen']);

const props = defineProps({
  isZenMode: Boolean,
});

const appVersion = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '2.0.0';

const activeSection = ref('about');
const contentPaneRef = ref(null);

// --- Theme Switcher in Header ---
const handleThemeToggle = () => {
  playThemeChirp();
  toggleTheme();
};

// --- Quick Copy Email ---
const emailCopied = ref(false);
const copyEmail = () => {
  const mail = profile.value?.contact?.email || 'Lotfi.moghaddam.alireza@gmail.com';
  playClick();
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    navigator.clipboard.writeText(mail);
  }
  emailCopied.value = true;
  setTimeout(() => {
    emailCopied.value = false;
  }, 2200);
};

// --- Top Scroll Progress ---
const scrollProgress = ref(0);
const updateScrollProgress = () => {
  if (typeof window === 'undefined') return;
  const isMobile = window.innerWidth < 1024;
  if (isMobile) {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    scrollProgress.value = total > 0 ? Math.min(100, Math.max(0, (window.scrollY / total) * 100)) : 0;
  } else if (contentPaneRef.value) {
    const total = contentPaneRef.value.scrollHeight - contentPaneRef.value.clientHeight;
    scrollProgress.value = total > 0 ? Math.min(100, Math.max(0, (contentPaneRef.value.scrollTop / total) * 100)) : 0;
  }
};

// --- Project Specs Accordion ---
const expandedProjects = ref({});
const toggleProjectSpecs = (id) => {
  playClick();
  expandedProjects.value[id] = !expandedProjects.value[id];
};

// --- Notes Reading Drawer ---
const activeReadingNote = ref(null);
const copyNoteTooltip = ref('کپی لینک');

const calcReadingTime = (body) => {
  if (!body) return '۱ دقیقه مطالعه';
  const words = body.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.round(words / 180));
  return `${minutes} دقیقه مطالعه`;
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('fa-IR', {
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

const openNoteDrawer = (note) => {
  playClick();
  activeReadingNote.value = note;
};

const closeNoteDrawer = () => {
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

// --- Cross-Section Interaction for Specialization Pillars ---
const handlePillarTechClick = (tech) => {
  playClick();
  const matched = availableLanguages.value.find(
    (l) => tech.toLowerCase().includes(l.toLowerCase()) || l.toLowerCase().includes(tech.toLowerCase())
  );
  if (matched) {
    activeFilter.value = matched;
  }
  scrollToSection('projects');
};

const handleModalKeydown = (e) => {
  if (e.key === 'Escape') {
    if (showQrModal.value) showQrModal.value = false;
    if (activeReadingNote.value) closeNoteDrawer();
  }
};

const getTechList = (langString) => {
  if (!langString) return [];
  return langString.split(/\s*\/\s*/).map((l) => getTechDetails(l));
};

const formatStatus = (st) => {
  if (!st) return null;
  const lower = st.toLowerCase();
  if (lower.includes('بانک') || lower.includes('bank')) return { text: 'عملیاتی در شبکه بانکی کشور', type: 'bank-prod' };
  if (lower.includes('عملیاتی') || lower.includes('live') || lower.includes('prod')) return { text: 'عملیاتی', type: 'prod' };
  if (lower.includes('فعال') || lower.includes('active')) return { text: 'فعال', type: 'prod' };
  if (lower.includes('پایدار') || lower.includes('stable')) return { text: 'پایدار', type: 'prod' };
  if (lower.includes('توسعه') || lower.includes('طراحی') || lower.includes('ship') || lower.includes('dev')) return { text: 'در حال توسعه', type: 'dev' };
  if (lower.includes('تحقیق') || lower.includes('r&d')) return { text: 'تحقیق و توسعه', type: 'dev' };
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
    category: 'BACKEND SERVICES',
    title: 'توسعه بک‌اند و سرویس‌های سازمانی',
    desc: 'طراحی وب‌سرویس‌های مقیاس‌پذیر و پایدار با ASP.NET Core، پیاده‌سازی معماری لایه‌ای تمیز و ارتباطات بلادرنگ با SignalR.',
    techs: ['C# / .NET', 'ASP.NET Core', 'SignalR Hub', 'Clean Architecture', 'RESTful APIs'],
    icon: '⚡'
  },
  {
    category: 'DESKTOP & HARDWARE',
    title: 'نرم‌افزارهای دسکتاپ و یکپارچه‌سازی سخت‌افزار',
    desc: 'بیش از ۳ سال سابقه توسعه نرم‌افزار کیوسک‌ها و کلاینت‌های باجه بانکی با WPF؛ اتصال مستقیم به اسکنرهای بیومتریک و تجهیزات جانبی.',
    techs: ['WPF / MVVM', 'Hardware Interfacing', 'Suprema SDK', 'WIA Document Scanners', 'Serial Port / RS232'],
    icon: '🖥️'
  },
  {
    category: 'DATABASE & PERFORMANCE',
    title: 'طراحی پایگاه داده و بهینه‌سازی داده‌ها',
    desc: 'طراحی ساختارهای داده‌ای رابطه‌ای، نگارش و عیب‌یابی کوئری‌های پیچیده T-SQL در SQL Server و کار با ابزارهای دسترسی داده.',
    techs: ['SQL Server', 'T-SQL Optimization', 'EF Core', 'Dapper', 'Relational Schema Design'],
    icon: '💾'
  },
  {
    category: 'MODERN WEB & DASHBOARDS',
    title: 'توسعه وب مدرن و سامانه‌های نظارتی',
    desc: 'خلق رابط‌های کاربری تعاملی، پنل‌های نظارت عملیاتی و ابزارهای مانیتورینگ بلادرنگ برای پشتیبانی سامانه‌های سازمانی.',
    techs: ['Vue.js 3', 'JavaScript / Vite', 'Real-time Dashboards', 'Tailored UI Components'],
    icon: '📊'
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

let isManualNavScrolling = false;
let scrollLockTimeout = null;

const updateActiveSectionOnScroll = () => {
  if (typeof document === 'undefined' || isManualNavScrolling) return;

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
    scrollActiveNavIntoView();
  }
};

const scrollActiveNavIntoView = () => {
  if (typeof window === 'undefined' || window.innerWidth >= 1024) return;
  const activeNavEl = document.querySelector('.editorial-nav a.active');
  const navContainer = document.querySelector('.editorial-nav');
  if (activeNavEl && navContainer) {
    const navRect = navContainer.getBoundingClientRect();
    const elRect = activeNavEl.getBoundingClientRect();
    if (elRect.left < navRect.left || elRect.right > navRect.right) {
      const scrollOffset = elRect.left - navRect.left - (navRect.width / 2) + (elRect.width / 2);
      navContainer.scrollBy({ left: scrollOffset, behavior: 'smooth' });
    }
  }
};

const handleScrollEvent = () => {
  updateActiveSectionOnScroll();
  updateScrollProgress();
};

onMounted(() => {
  if (typeof window !== 'undefined') {
    window.addEventListener('scroll', handleScrollEvent, { passive: true });
    window.addEventListener('keydown', handleModalKeydown);
  }
  if (contentPaneRef.value) {
    contentPaneRef.value.addEventListener('scroll', handleScrollEvent, { passive: true });
  }

  updateScrollProgress();

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
    window.removeEventListener('keydown', handleModalKeydown);
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

  isManualNavScrolling = true;
  if (scrollLockTimeout) clearTimeout(scrollLockTimeout);

  activeSection.value = sectionId;
  syncUrlWithSection(sectionId);
  scrollActiveNavIntoView();

  const target = document.getElementById(sectionId);
  if (!target) {
    isManualNavScrolling = false;
    return;
  }

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

  scrollLockTimeout = setTimeout(() => {
    isManualNavScrolling = false;
  }, 750);
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
      <div class="scroll-progress-line" :style="{ width: scrollProgress + '%' }"></div>
      <div class="top-bar-inner">
        <!-- RIGHT: Damoon Full Written-out Typographic Logo + Version Pill + Status -->
        <div class="header-logo-wrap" title="Damoon Portfolio">
          <img src="/monogram-damoon.png" alt="Damoon" class="damoon-full-logo-img" width="98" height="98" />
          <span class="header-version-pill mono-ui" dir="ltr">v{{ appVersion }}</span>
          <span class="header-availability-badge" title="آماده همکاری پروژه‌ای و دورکاری">
            <span class="availability-pulse-dot"></span>
            آماده همکاری پروژه‌ای و دورکاری
          </span>
        </div>

        <!-- LEFT: Outline Social Icons + Theme Switcher (WITHOUT BACKGROUND BOXES) -->
        <div class="header-social-icons" dir="ltr">
          <button @click="handleThemeToggle" :title="isDark ? 'تغییر به تم لایت' : 'تغییر به تم دارک'" class="header-icon-link theme-toggle" :aria-label="isDark ? 'تغییر به تم لایت' : 'تغییر به تم دارک'">
            <svg v-if="!isDark" viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
            <svg v-else viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/>
              <line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/>
              <line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
          </button>

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
            <p class="role-subtitle mono-ui" dir="ltr">Software Engineer (.NET & Backend)</p>
            <p class="concise-bio">
              توسعه‌دهنده نرم‌افزار متمرکز بر اکوسیستم C#، سرویس‌های ASP.NET Core، دسکتاپ صنعتی (WPF) و پایگاه داده.
            </p>
            <div class="sidebar-email-row">
              <button @click="copyEmail" class="copy-email-btn mono-ui" :title="emailCopied ? 'کپی شد!' : 'کلیک برای کپی ایمیل'">
                <span class="email-icon">✉</span>
                <span class="email-text">{{ profile.contact?.email || 'Lotfi.moghaddam.alireza@gmail.com' }}</span>
                <span class="email-copy-badge">{{ emailCopied ? 'کپی شد! ✓' : 'کپی' }}</span>
              </button>
            </div>
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
              من <strong>علیرضا لطفی</strong> (لطفی مقدم) هستم؛ توسعه‌دهنده نرم‌افزار با <strong>۵ سال سابقه فعالیت در شرکت نداپرداز انفورماتیک</strong> و متمرکز بر اکوسیستم <strong>C# و .NET</strong>، توسعه سیستم‌های نوبت‌دهی و اتوماسیون شعب بانکی، اپلیکیشن‌های کیوسک و دسکتاپ با WPF، و بهینه‌سازی دیتابیس در SQL Server.
            </p>
            <p>
              در طول این سال‌ها، تمرکز و دستاورد شاخص من بر <strong>توسعه پلتفرم‌های نرم‌افزاری نوبت‌دهی شعب</strong>، کلاینت‌های باجه و کیوسک‌های شعب بانک‌های مطرح کشور (<strong>مانند بانک ملت، بانک آینده، بانک شهر و...</strong>)، پشتیبانی فنی سامانه‌های نوبت‌دهی، یکپارچه‌سازی سخت‌افزاری و سیستم‌های بلادرنگ بیودارو بوده است.
            </p>
            <p class="availability-callout">
              <span class="callout-dot"></span>
              هم‌اکنون <strong>آماده همکاری به‌صورت پروژه‌ای و دورکاری (Remote & Contract)</strong> در توسعه سیستم‌های بک‌اند، نرم‌افزارهای دسکتاپ و معماری داده هستم.
            </p>

            <!-- EDITORIAL SPECS STRIP (RELOCATED FROM SIDEBAR FOR CLEAN ELEGANT PRESENTATION) -->
            <div class="editorial-specs-strip">
              <div class="spec-strip-item">
                <span class="spec-num">۵ سال</span>
                <span class="spec-lbl">سابقه پیوسته در نداپرداز</span>
              </div>
              <div class="spec-strip-divider"></div>
              <div class="spec-strip-item">
                <span class="spec-num">بانک‌های کشور</span>
                <span class="spec-lbl">ملت، آینده، شهر و...</span>
              </div>
              <div class="spec-strip-divider"></div>
              <div class="spec-strip-item">
                <span class="spec-num mono-ui" dir="ltr">.NET / C#</span>
                <span class="spec-lbl">استک متمرکز</span>
              </div>
            </div>

            <!-- MOBILE-ONLY ACTION BUTTONS BLOCK -->
            <div class="mobile-action-tools">
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
                    <span class="job-company">@ {{ job.company }}</span>
                  </div>
                  <span class="period-badge-pill">{{ job.period }}</span>
                </div>

                <!-- Impact Metrics Badges -->
                <div v-if="job.impact_metrics && job.impact_metrics.length" class="job-impact-metrics-row">
                  <div v-for="(metric, mi) in job.impact_metrics" :key="mi" class="impact-metric-pill">
                    <span class="impact-metric-val">{{ metric.value }}</span>
                    <span class="impact-metric-lbl">{{ metric.label }}</span>
                  </div>
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
                  <span class="related-title">پروژه‌های کلیدی مرتبط:</span>
                  <div class="related-chips-row">
                    <button
                      v-for="relProj in job.related_projects"
                      :key="relProj.id"
                      @click="navigateToProject(relProj)"
                      class="related-project-chip"
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
                <button
                  v-if="p.role || p.architectureSummary || (p.details && p.details.length)"
                  @click="toggleProjectSpecs(p.id)"
                  class="toggle-specs-btn mono-ui"
                  type="button"
                >
                  <span>{{ expandedProjects[p.id] ? 'بستن جزئیات فنی' : 'مشخصات معماری و فنی' }}</span>
                  <span class="chevron-icon" :class="{ rotated: expandedProjects[p.id] }">▾</span>
                </button>
              </div>

              <!-- Expanded Technical Specifications Drawer -->
              <div v-if="expandedProjects[p.id]" class="project-specs-panel">
                <div class="specs-panel-header">
                  <span class="specs-header-badge mono-ui" dir="ltr">ENGINEERING ARCHITECTURE SPEC</span>
                  <span class="specs-header-dot"></span>
                </div>

                <div class="specs-grid">
                  <div v-if="p.role" class="spec-cell">
                    <span class="spec-k">نقش اجرایی</span>
                    <span class="spec-v">{{ p.role }}</span>
                  </div>
                  <div v-if="p.architectureSummary" class="spec-cell">
                    <span class="spec-k">معماری و الگو</span>
                    <span class="spec-v mono-ui" dir="ltr">{{ p.architectureSummary }}</span>
                  </div>
                  <div v-if="p.impact" class="spec-cell">
                    <span class="spec-k">مقیاس عملیاتی / دستاورد</span>
                    <span class="spec-v">{{ p.impact }}</span>
                  </div>
                </div>

                <!-- Architectural Blueprint Schematic Flow -->
                <div v-if="p.blueprint" class="specs-blueprint-card">
                  <div class="blueprint-card-header">
                    <span class="blueprint-code mono-ui" dir="ltr">📐 {{ p.blueprint.code }}</span>
                    <span class="blueprint-tag mono-ui">SCHEMATIC BLUEPRINT</span>
                  </div>
                  <div class="blueprint-flow-layers">
                    <div v-for="(layer, li) in p.blueprint.layers" :key="li" class="blueprint-flow-layer">
                      <div class="blueprint-layer-head">
                        <span class="blueprint-layer-step mono-ui">0{{ li + 1 }}</span>
                        <span class="blueprint-layer-title">{{ layer.name }}</span>
                      </div>
                      <div class="blueprint-nodes-grid">
                        <span v-for="node in layer.nodes" :key="node" class="blueprint-node-pill">
                          {{ node }}
                        </span>
                      </div>
                      <div v-if="li < p.blueprint.layers.length - 1" class="blueprint-layer-connector" aria-hidden="true">
                        <span class="connector-line"></span>
                        <span class="connector-arrow">↓</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div v-if="p.details && p.details.length" class="specs-details-block">
                  <span class="specs-details-title">پیاده‌سازی‌های کلیدی و چالش‌های فنی:</span>
                  <ul class="specs-bullet-list">
                    <li v-for="(detail, di) in p.details" :key="di">
                      <span class="bullet-dot">›</span>
                      <span>{{ detail }}</span>
                    </li>
                  </ul>
                </div>
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
                <button
                  v-for="tech in pillar.techs"
                  :key="tech"
                  @click="handlePillarTechClick(tech)"
                  class="pillar-tag-item mono-ui clickable-tag"
                  dir="ltr"
                  title="کلیک برای فیلتر پروژه‌ها"
                >
                  {{ tech }}
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- 04 // NOTES (EDITORIAL STREAM - NO BUTTON CARDS) -->
        <section id="notes" class="editorial-section">
          <div class="sec-title-bar">
            <span class="num mono-ui" dir="ltr">04 //</span>
            <h2>یادداشت‌های فنی</h2>
          </div>

          <div class="notes-stream-container">
            <article
              v-for="note in notes"
              :key="note.id"
              class="note-stream-row"
              @click="openNoteDrawer(note)"
              tabindex="0"
              @keydown.enter="openNoteDrawer(note)"
            >
              <div class="note-stream-main">
                <div class="note-stream-meta" dir="ltr">
                  <span class="note-meta-date">{{ formatDate(note.created_at) }}</span>
                  <span class="note-meta-sep">•</span>
                  <span class="note-meta-readtime">{{ calcReadingTime(note.body) }}</span>
                </div>
                <h3 class="note-stream-title">{{ note.title }}</h3>
                <p v-if="note.body" class="note-stream-snippet">
                  {{ getSnippet(note.body) }}
                </p>
              </div>
              <div class="note-stream-arrow-wrap" aria-hidden="true">
                <span class="note-stream-arrow">←</span>
              </div>
            </article>
          </div>
        </section>

        <!-- STREAM FOOTER (SUPPLIES GENEROUS SCROLL SPACE SO #NOTES REACHES TOP & ACTIVE MENU HIGHLIGHTS) -->
        <footer class="editorial-stream-footer">
          <div class="footer-divider"></div>
          <div class="footer-bottom-row">
            <p class="copyright mono-ui" dir="ltr">© 2026 Alireza Lotfi Moghaddam — Systems & Architecture</p>
            <button @click="scrollToSection('about')" class="scroll-top-btn">
              ↑ بازگشت به بالا
            </button>
          </div>
        </footer>
      </main>
    </div>

    <!-- NOTES READING MODAL / DRAWER -->
    <Transition name="fade">
      <div v-if="activeReadingNote" class="note-reader-overlay" @click.self="closeNoteDrawer">
        <article class="note-reader-card" role="dialog" aria-modal="true">
          <header class="reader-header">
            <div class="reader-title-wrap">
              <span class="reader-tag mono-ui" dir="ltr">engineering/note</span>
              <h2>{{ activeReadingNote.title }}</h2>
              <div class="reader-meta">
                <span class="meta-date mono-ui" dir="ltr">{{ formatDate(activeReadingNote.created_at) }}</span>
                <span class="meta-sep">·</span>
                <span class="meta-time mono-ui">{{ calcReadingTime(activeReadingNote.body) }}</span>
              </div>
            </div>
            <div class="reader-actions">
              <button @click="copyNoteLink" class="reader-btn" :title="copyNoteTooltip">
                {{ copyNoteTooltip }}
              </button>
              <button @click="closeNoteDrawer" class="reader-close-btn" aria-label="بستن">✕</button>
            </div>
          </header>
          <div class="reader-body markdown-rendered-content" v-html="parseMarkdown(activeReadingNote.body)"></div>
        </article>
      </div>
    </Transition>

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
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.sidebar-contact-tools {
  display: flex;
  gap: 8px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.tool-chip-btn {
  flex: 1 1 0;
  min-width: 0;
  max-width: 100%;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 10px;
  border-radius: 10px;
  background: var(--item-bg);
  border: 1px solid var(--panel-border);
  color: var(--text-secondary);
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
  white-space: nowrap;
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
  gap: 12px;
  margin: 0 0 22px 0;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--panel-border);
  position: relative;
}

.sec-title-bar::after {
  content: '';
  position: absolute;
  bottom: -1px;
  right: 0;
  width: 48px;
  height: 2px;
  background: var(--neon);
  border-radius: 2px;
  transition: width 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.editorial-section:hover .sec-title-bar::after {
  width: 90px;
}

.sec-title-bar .num {
  font-size: 0.88rem;
  color: var(--neon);
  font-weight: 800;
  letter-spacing: 0.05em;
  opacity: 0.9;
}

.sec-title-bar h2 {
  margin: 0;
  font-size: 1.25rem;
  color: var(--text-main);
  font-weight: 800;
  letter-spacing: -0.01em;
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
  font-family: inherit;
}

.period-badge-pill {
  font-size: 0.78rem;
  color: var(--neon);
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 8px;
  background: rgba(79, 70, 229, 0.08);
  border: 1px solid rgba(79, 70, 229, 0.18);
  white-space: nowrap;
  font-family: inherit;
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

/* PROJECTS FILTER BAR (HORIZONTAL SCROLL ON MOBILE) */
.simple-filter-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: none;
  -ms-overflow-style: none;
  -webkit-overflow-scrolling: touch;
  touch-action: pan-x;
  padding: 4px 2px 8px 2px;
}

.simple-filter-bar::-webkit-scrollbar {
  display: none;
}

.filter-tag {
  background: transparent;
  border: 1px solid var(--panel-border);
  color: var(--text-secondary);
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s ease;
  flex-shrink: 0;
  white-space: nowrap;
  user-select: none;
}

.filter-tag:hover, .filter-tag.active {
  border-color: var(--neon);
  background: rgba(79, 70, 229, 0.1);
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

/* Base Mobile Safety & Defensiveness */
.master-shell,
.editorial-layout,
.editorial-sidebar,
.editorial-content,
.editorial-section,
.experience-timeline-wrapper,
.timeline-job-card,
.job-card-content,
.job-header-row,
.job-title-group,
.job-related-projects-box,
.projects-editorial-stream,
.project-editorial-card,
.specialization-pillars-grid,
.pillar-card,
.notes-editorial-list,
.note-editorial-item {
  min-width: 0;
  max-width: 100%;
  box-sizing: border-box;
}

.related-project-chip {
  max-width: 100%;
  white-space: normal;
  word-break: break-word;
  overflow-wrap: break-word;
  box-sizing: border-box;
}

.tech-pill-badge,
.pillar-tag-item,
.period-badge-pill,
.status-badge-pill {
  max-width: 100%;
  word-break: break-word;
  overflow-wrap: break-word;
  box-sizing: border-box;
}

.chip-text,
.job-summary-text,
.desc,
.text-content p,
.sidebar-identity p {
  min-width: 0;
  word-break: break-word;
  overflow-wrap: break-word;
}

.mobile-action-tools {
  display: none;
}

@media (max-width: 1024px) {
  .editorial-layout {
    grid-template-columns: 1fr;
    gap: 16px;
    padding: 12px;
    width: 100%;
    max-width: 100vw;
    box-sizing: border-box;
    overflow-x: hidden;
  }

  .editorial-sidebar, .editorial-content {
    position: relative;
    top: 0;
    max-height: none;
    overflow: visible;
    width: 100%;
    max-width: 100%;
    min-width: 0;
    box-sizing: border-box;
  }

  .editorial-sidebar .concise-bio,
  .editorial-sidebar .sidebar-bottom {
    display: none;
  }

  .mobile-action-tools {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 20px;
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
  }

  .sidebar-identity {
    margin-bottom: 4px;
    width: 100%;
    min-width: 0;
  }

  .editorial-specs-strip {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
    padding: 12px 8px;
    width: 100%;
    box-sizing: border-box;
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
    padding: 4px 10px;
    background: var(--bg-main);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--panel-border);
    width: 100%;
    max-width: 100vw;
    box-sizing: border-box;
  }

  .top-bar-inner {
    min-height: 52px;
    width: 100%;
  }

  .header-logo-wrap {
    gap: 6px;
    flex-shrink: 0;
  }

  .damoon-full-logo-img {
    width: 38px;
    height: 38px;
    flex-shrink: 0;
  }

  .header-version-pill {
    font-size: 0.6rem;
    padding: 1px 5px;
    flex-shrink: 0;
  }

  .header-social-icons {
    gap: 2px;
    flex-shrink: 0;
  }

  .header-icon-link {
    padding: 4px;
    min-width: 34px;
    min-height: 34px;
  }

  .header-icon-link svg {
    width: 18px;
    height: 18px;
  }

  .editorial-layout {
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding: 8px;
    width: 100%;
    max-width: 100vw;
    box-sizing: border-box;
    overflow-x: hidden;
  }

  .sidebar-identity .author-name {
    font-size: 1.25rem;
    word-break: break-word;
  }

  .sidebar-identity .role-subtitle {
    font-size: 0.74rem;
    word-break: break-word;
  }

  .editorial-nav {
    position: sticky;
    top: 52px;
    z-index: 95;
    flex-direction: row;
    overflow-x: auto;
    white-space: nowrap;
    padding: 6px 4px;
    margin: 0 0 12px 0;
    background: var(--bg-main);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-bottom: 1px solid var(--panel-border);
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
    width: 100%;
    max-width: 100vw;
    box-sizing: border-box;
  }

  .editorial-nav::-webkit-scrollbar {
    display: none;
  }

  .editorial-nav a {
    padding: 6px 10px;
    border-right: none;
    border-radius: 8px;
    background: var(--item-bg);
    border: 1px solid var(--panel-border);
    flex-shrink: 0;
    font-size: 0.76rem;
  }

  .editorial-nav a.active {
    border-color: var(--neon);
    background: rgba(79, 70, 229, 0.12);
    color: var(--neon);
    font-weight: 700;
  }

  .experience-timeline-wrapper {
    gap: 16px;
    width: 100%;
  }

  .timeline-job-card {
    display: flex;
    gap: 10px;
    width: 100%;
    min-width: 0;
  }

  .timeline-left-node {
    width: 14px;
    flex-shrink: 0;
    padding-top: 4px;
  }

  .node-dot {
    width: 10px;
    height: 10px;
    border-width: 2px;
  }

  .job-card-content {
    flex: 1;
    min-width: 0;
    width: 100%;
    padding: 14px 12px;
    box-sizing: border-box;
    border-radius: 12px;
    border-right: 3px solid var(--neon);
  }

  .job-header-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
    width: 100%;
  }

  .job-title-group h3 {
    font-size: 0.98rem;
    line-height: 1.35;
    word-break: break-word;
  }

  .job-company {
    font-size: 0.8rem;
    word-break: break-word;
  }

  .period-badge-pill {
    font-size: 0.7rem;
    padding: 2px 7px;
    align-self: flex-start;
  }

  .achievement-chip-item {
    gap: 6px;
    font-size: 0.82rem;
    line-height: 1.6;
    min-width: 0;
  }

  .job-related-projects-box {
    padding: 10px 8px;
    border-radius: 10px;
    width: 100%;
    box-sizing: border-box;
  }

  .related-chips-row {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    width: 100%;
  }

  .related-project-chip {
    padding: 4px 8px;
    font-size: 0.76rem;
    max-width: 100%;
    white-space: normal;
    word-break: break-word;
  }

  .editorial-specs-strip {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 4px;
    padding: 10px 6px;
    width: 100%;
    box-sizing: border-box;
  }

  .spec-strip-item {
    min-width: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .spec-strip-item .spec-num {
    font-size: 0.88rem;
    font-weight: 800;
    max-width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .spec-strip-item .spec-lbl {
    font-size: 0.64rem;
    line-height: 1.25;
    word-break: break-word;
  }

  .specialization-pillars-grid {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
  }

  .pillar-card {
    padding: 14px 12px;
    width: 100%;
    box-sizing: border-box;
  }

  .projects-editorial-stream {
    display: flex;
    flex-direction: column;
    gap: 14px;
    width: 100%;
    margin: 0;
    padding: 0;
  }

  .project-editorial-card {
    padding: 14px 12px;
    width: 100%;
    box-sizing: border-box;
  }

  .proj-top {
    flex-wrap: wrap;
    gap: 6px;
  }

  .proj-top h3 {
    font-size: 0.98rem;
    word-break: break-word;
  }

  .editorial-stream-footer {
    padding-bottom: 90px;
    margin-top: 40px;
  }
}

@media (max-width: 480px) {
  .timeline-left-node {
    display: none;
  }

  .timeline-job-card {
    gap: 0;
    width: 100%;
  }

  .editorial-layout {
    padding: 6px;
  }

  .job-card-content {
    padding: 12px 10px;
    width: 100%;
  }

  .swiss-top-bar {
    padding: 4px 8px;
  }

  .top-bar-inner {
    min-height: 48px;
  }

  .damoon-full-logo-img {
    width: 34px;
    height: 34px;
  }

  .editorial-nav {
    top: 48px;
    padding: 4px 2px;
  }

  .editorial-nav a {
    padding: 4px 8px;
    font-size: 0.72rem;
  }

  .footer-bottom-row {
    flex-direction: column;
    align-items: center;
    gap: 10px;
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

/* Scroll Progress Line */
.scroll-progress-line {
  position: fixed;
  top: 0;
  left: 0;
  height: 3px;
  background: linear-gradient(90deg, #4f46e5, #06b6d4, #10b981);
  z-index: 9999;
  transition: width 0.08s ease-out;
  box-shadow: 0 0 8px rgba(79, 70, 229, 0.4);
}

/* Header Availability Badge */
.header-availability-badge {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 5px 12px;
  background: rgba(16, 185, 129, 0.09);
  border: 1px solid rgba(16, 185, 129, 0.28);
  border-radius: 999px;
  font-size: 0.76rem;
  font-weight: 600;
  color: #059669;
  user-select: none;
  font-family: inherit;
}

.availability-pulse-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
  animation: pulseAvailability 2s infinite cubic-bezier(0.66, 0, 0, 1);
}

@keyframes pulseAvailability {
  0% {
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
  }
  70% {
    box-shadow: 0 0 0 6px rgba(16, 185, 129, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
  }
}

.availability-callout {
  margin-top: 14px;
  padding: 10px 14px;
  background: rgba(16, 185, 129, 0.08);
  border: 1px solid rgba(16, 185, 129, 0.22);
  border-radius: 10px;
  font-size: 0.84rem;
  line-height: 1.7;
  color: var(--text-main);
  display: flex;
  align-items: center;
  gap: 8px;
}

.callout-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #10b981;
  flex-shrink: 0;
  box-shadow: 0 0 6px #10b981;
}

.status-badge-pill.bank-prod {
  background: rgba(16, 185, 129, 0.12);
  color: #059669;
  border: 1px solid rgba(16, 185, 129, 0.32);
  font-weight: 700;
}

.status-badge-pill.bank-prod .status-dot {
  background: #10b981;
  box-shadow: 0 0 6px rgba(16, 185, 129, 0.8);
}

/* Theme Toggle Button */
.header-icon-link.theme-toggle {
  cursor: pointer;
  background: var(--item-bg);
  color: var(--text-main);
  border: 1px solid var(--panel-border);
  transition: all 0.2s ease;
}

.header-icon-link.theme-toggle:hover {
  border-color: var(--neon);
  color: var(--neon);
  transform: translateY(-1px);
}
/* Sidebar Quick Email Copy */
.sidebar-email-row {
  margin-top: 14px;
}

.copy-email-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: var(--item-bg);
  border: 1px solid var(--panel-border);
  border-radius: 999px;
  cursor: pointer;
  color: var(--text-secondary);
  font-size: 0.76rem;
  transition: all 0.2s ease;
  user-select: none;
  max-width: 100%;
}

.copy-email-btn:hover {
  border-color: var(--neon);
  color: var(--neon);
  transform: translateY(-1px);
}

.email-icon {
  font-size: 0.85rem;
  opacity: 0.7;
}

.email-text {
  direction: ltr;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.email-copy-badge {
  font-size: 0.68rem;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 999px;
  background: rgba(79, 70, 229, 0.08);
  color: var(--neon);
}

/* Project Technical Specs Toggle & Panel */
.toggle-specs-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  font-size: 0.76rem;
  font-weight: 600;
  color: var(--text-secondary);
  background: var(--item-bg);
  border: 1px solid var(--panel-border);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toggle-specs-btn:hover {
  color: var(--neon);
  border-color: var(--neon);
  background: var(--item-hover-bg);
}

.chevron-icon {
  transition: transform 0.2s ease;
}

.chevron-icon.rotated {
  transform: rotate(180deg);
}

.project-specs-panel {
  margin-top: 16px;
  padding: 18px 20px;
  border-radius: 14px;
  background: var(--item-bg);
  border: 1px solid var(--panel-border);
  box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.04);
  animation: specsSlideDown 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes specsSlideDown {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.specs-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--panel-border);
}

.specs-header-badge {
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--neon);
}

.specs-header-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--neon);
  box-shadow: 0 0 6px var(--neon);
}

.specs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
  margin-bottom: 14px;
}

.spec-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 12px;
  background: rgba(125, 140, 160, 0.04);
  border-radius: 10px;
  border: 1px solid var(--panel-border);
}

.spec-k {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--text-soft);
  display: block;
}

.spec-v {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-main);
  line-height: 1.5;
}

.specs-details-block {
  padding: 12px 14px;
  background: rgba(125, 140, 160, 0.03);
  border-radius: 10px;
  border: 1px solid var(--panel-border);
}

.specs-details-title {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--text-secondary);
  margin-bottom: 10px;
  display: block;
}

.specs-bullet-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.specs-bullet-list li {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 0.8rem;
  color: var(--text-secondary);
  line-height: 1.75;
  margin-bottom: 6px;
}

.specs-bullet-list li:last-child {
  margin-bottom: 0;
}

.bullet-dot {
  color: var(--neon);
  font-weight: 800;
  font-size: 0.95rem;
  line-height: 1.3;
}

/* Interactive Pillar Clickable Tag */
.clickable-tag {
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

.clickable-tag:hover {
  border-color: var(--neon) !important;
  color: var(--neon) !important;
  background: rgba(79, 70, 229, 0.08) !important;
  transform: translateY(-1px);
}

/* Notes Editorial Stream (Refined, Non-Button Minimalist List) */
.notes-stream-container {
  display: flex;
  flex-direction: column;
}

.note-stream-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 14px;
  border-bottom: 1px solid var(--panel-border);
  cursor: pointer;
  transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
  border-radius: 12px;
  gap: 16px;
}

.note-stream-row:hover {
  background: rgba(79, 70, 229, 0.04);
  transform: translateX(-4px);
}

.note-stream-row:focus-visible {
  outline: 2px solid var(--neon);
  outline-offset: 2px;
}

.note-stream-main {
  flex: 1;
}

.note-stream-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.72rem;
  color: var(--text-soft);
  margin-bottom: 6px;
}

.note-meta-sep {
  opacity: 0.4;
}

.note-stream-title {
  margin: 0 0 6px 0;
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-main);
  transition: color 0.2s ease;
  line-height: 1.45;
}

.note-stream-row:hover .note-stream-title {
  color: var(--neon);
}

.note-stream-snippet {
  margin: 0;
  font-size: 0.82rem;
  color: var(--text-soft);
  line-height: 1.65;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.note-stream-arrow-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
}

.note-stream-arrow {
  font-size: 1.15rem;
  color: var(--text-soft);
  transition: all 0.22s ease;
}

.note-stream-row:hover .note-stream-arrow {
  transform: translateX(-5px);
  color: var(--neon);
}

/* Note Reader Modal Overlay */
.note-reader-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
  animation: fadeInReader 0.2s ease-out;
}

@keyframes fadeInReader {
  from { opacity: 0; }
  to { opacity: 1; }
}

.note-reader-card {
  background: var(--bg-main);
  border: 1px solid var(--panel-border);
  border-radius: 20px;
  width: 100%;
  max-width: 820px;
  max-height: 88vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.35);
  animation: scaleUpReader 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes scaleUpReader {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.reader-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px 26px;
  border-bottom: 1px solid var(--panel-border);
  gap: 16px;
  background: var(--panel-bg);
}

.reader-title-wrap {
  flex: 1;
}

.reader-meta {
  display: flex;
  gap: 12px;
  font-size: 0.76rem;
  color: var(--text-soft);
  margin-bottom: 6px;
  align-items: center;
}

.reader-meta-dot {
  opacity: 0.5;
}

.reader-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 800;
  line-height: 1.45;
  color: var(--text-main);
}

.reader-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.reader-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid var(--panel-border);
  background: var(--item-bg);
  font-size: 0.76rem;
  font-weight: 600;
  cursor: pointer;
  color: var(--text-main);
  transition: all 0.2s ease;
}

.reader-btn:hover {
  border-color: var(--neon);
  color: var(--neon);
}

.reader-close-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid var(--panel-border);
  background: var(--item-bg);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  cursor: pointer;
  color: var(--text-soft);
  transition: all 0.2s ease;
}

.reader-close-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.3);
}

.reader-body {
  padding: 26px 30px;
  overflow-y: auto;
  flex: 1;
  line-height: 1.85;
  direction: rtl;
  text-align: right;
  background: var(--bg-main);
}

.markdown-rendered-content {
  font-size: 0.92rem;
  color: var(--text-main);
}

.markdown-rendered-content h1,
.markdown-rendered-content h2,
.markdown-rendered-content h3,
.markdown-rendered-content h4 {
  margin-top: 1.6em;
  margin-bottom: 0.6em;
  font-weight: 700;
  color: var(--text-main);
  line-height: 1.4;
}

.markdown-rendered-content h2 {
  font-size: 1.2rem;
  border-bottom: 1px solid var(--panel-border);
  padding-bottom: 6px;
}

.markdown-rendered-content h3 {
  font-size: 1.05rem;
}

.markdown-rendered-content p {
  margin: 0.9em 0;
  line-height: 1.85;
  color: var(--text-secondary);
}

.markdown-rendered-content code {
  font-family: var(--font-mono);
  background: rgba(125, 140, 160, 0.12);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.85em;
  direction: ltr;
  display: inline-block;
}

.markdown-rendered-content pre {
  background: #0f172a;
  color: #f8fafc;
  padding: 14px 18px;
  border-radius: 10px;
  overflow-x: auto;
  direction: ltr;
  text-align: left;
  margin: 1.2em 0;
}

.markdown-rendered-content pre code {
  background: transparent;
  padding: 0;
  color: inherit;
  font-size: 0.85rem;
  display: block;
}

.markdown-rendered-content blockquote {
  margin: 1.2em 0;
  padding: 10px 18px;
  border-right: 4px solid var(--neon);
  border-left: none;
  background: rgba(79, 70, 229, 0.04);
  border-radius: 0 8px 8px 0;
  color: var(--text-secondary);
  font-style: italic;
}

.markdown-rendered-content ul,
.markdown-rendered-content ol {
  margin: 0.8em 0;
  padding-right: 22px;
  padding-left: 0;
  line-height: 1.8;
}

.markdown-rendered-content li {
  margin-bottom: 6px;
}

.markdown-rendered-content a {
  color: var(--neon);
  text-decoration: underline;
  text-underline-offset: 3px;
}

.reader-footer {
  padding: 14px 26px;
  border-top: 1px solid var(--panel-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.76rem;
  color: var(--text-soft);
  background: var(--panel-bg);
}

.reader-key-hint {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  padding: 2px 6px;
  background: var(--item-bg);
  border: 1px solid var(--panel-border);
  border-radius: 4px;
}

/* ==========================================================================
   JOB IMPACT METRICS PILLS (NedaPardaz & Key Banking Metrics)
   ========================================================================== */
.job-impact-metrics-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 6px 0 8px 0;
}

.impact-metric-pill {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 5px 11px;
  background: rgba(79, 70, 229, 0.05);
  border: 1px solid rgba(79, 70, 229, 0.18);
  border-radius: 8px;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.impact-metric-pill:hover {
  background: rgba(79, 70, 229, 0.1);
  border-color: var(--neon);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.08);
}

.impact-metric-val {
  font-size: 0.82rem;
  font-weight: 800;
  color: var(--neon);
  letter-spacing: 0.02em;
}

.impact-metric-lbl {
  font-size: 0.74rem;
  color: var(--text-secondary);
  font-weight: 600;
}

/* ==========================================================================
   ARCHITECTURAL BLUEPRINT SCHEMATIC FLOW (Interactive Engineering Flow)
   ========================================================================== */
.specs-blueprint-card {
  margin: 16px 0;
  padding: 16px 18px;
  border-radius: 12px;
  background: var(--bg-main);
  border: 1px dashed rgba(79, 70, 229, 0.32);
  box-shadow: inset 0 0 20px rgba(79, 70, 229, 0.02);
  direction: rtl;
  position: relative;
  overflow: hidden;
}

.specs-blueprint-card::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 3px;
  background: linear-gradient(180deg, var(--neon) 0%, rgba(6, 182, 212, 0.6) 100%);
}

.blueprint-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  margin-bottom: 14px;
  border-bottom: 1px solid var(--panel-border);
}

.blueprint-code {
  font-size: 0.76rem;
  font-weight: 800;
  color: var(--neon);
  letter-spacing: 0.04em;
}

.blueprint-tag {
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  padding: 3px 8px;
  border-radius: 6px;
  background: rgba(79, 70, 229, 0.09);
  color: var(--neon);
  border: 1px solid rgba(79, 70, 229, 0.2);
}

.blueprint-flow-layers {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.blueprint-flow-layer {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.blueprint-layer-head {
  display: flex;
  align-items: center;
  gap: 8px;
}

.blueprint-layer-step {
  font-size: 0.68rem;
  font-weight: 800;
  color: #ffffff;
  background: var(--neon);
  width: 22px;
  height: 22px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 6px rgba(79, 70, 229, 0.3);
}

.blueprint-layer-title {
  font-size: 0.84rem;
  font-weight: 700;
  color: var(--text-main);
}

.blueprint-nodes-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding-right: 30px;
}

.blueprint-node-pill {
  font-size: 0.76rem;
  font-weight: 600;
  padding: 5px 12px;
  border-radius: 8px;
  background: var(--item-bg);
  border: 1px solid var(--panel-border);
  color: var(--text-main);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.blueprint-node-pill:hover {
  border-color: var(--neon);
  color: var(--neon);
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(79, 70, 229, 0.1);
}

.blueprint-layer-connector {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 22px;
  margin: 4px 0 2px 0;
  color: var(--neon);
}

.connector-line {
  display: block;
  width: 1px;
  height: 12px;
  background: var(--neon);
  opacity: 0.4;
}

.connector-arrow {
  font-size: 0.75rem;
  line-height: 1;
  font-weight: 800;
  margin-top: 1px;
  opacity: 0.85;
}

/* ==========================================================================
   FOCUS DIMMING (SUBTLE EDITORIAL FOCUS ON HOVER)
   ========================================================================== */
@media (hover: hover) and (min-width: 769px) {
  .projects-editorial-stream:hover .project-editorial-card:not(:hover) {
    opacity: 0.44;
    filter: grayscale(15%);
    transform: scale(0.995);
    transition: opacity 0.25s ease, transform 0.25s ease, filter 0.25s ease;
  }

  .notes-stream-container:hover .note-stream-row:not(:hover) {
    opacity: 0.44;
    transition: opacity 0.25s ease;
  }
}
</style>

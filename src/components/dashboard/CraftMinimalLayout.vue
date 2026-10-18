<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { usePortfolio } from '../../composables/usePortfolio';
import { useAudioSynth } from '../../composables/useAudioSynth';
import { useTheme } from '../../composables/useTheme';
import { useNavigation } from '../../composables/useNavigation';
import InteractiveMessageBroker from './InteractiveMessageBroker.vue';
import InteractiveHardwareBridge from './InteractiveHardwareBridge.vue';
import DigitalSignature from './DigitalSignature.vue';

const props = defineProps({
  isZenMode: Boolean,
});

const emit = defineEmits(['toggle-zen']);

const { profile } = usePortfolio();
const { playClick } = useAudioSynth();
const { isDark, isPaper, isLight, currentThemeLabel, nextThemeLabel, toggleTheme } = useTheme();
const { navigateTo } = useNavigation();

// State
const activeProjectDossier = ref(null);
const emailCopied = ref(false);
const hoveredProject = ref(null);
const tehranTime = ref('');
const activeArchTab = ref('broker'); // 'broker' | 'hardware'

// Floating Reading Progress & TOC Rail
const activeSectionId = ref('sec-hero');
const navSections = [
  { id: 'sec-hero', number: '۰۱', title: 'معرفی' },
  { id: 'sec-works', number: '۰۲', title: 'آثار شاخص' },
  { id: 'sec-broker', number: '۰۳', title: 'معماری سیستم' },
  { id: 'sec-principles', number: '۰۴', title: 'دیدگاه مهندسی' },
  { id: 'sec-trajectory', number: '۰۵', title: 'مسیر حرفه‌ای' },
  { id: 'sec-skills', number: '۰۶', title: 'قلمروهای فنی' },
  { id: 'sec-connect', number: '۰۷', title: 'ارتباط' },
];

const scrollToSection = (id) => {
  playClick();
  if (typeof document === 'undefined') return;
  const el = document.getElementById(id);
  if (el) {
    const yOffset = -50;
    const y = el.getBoundingClientRect().top + (window.pageYOffset || window.scrollY) + yOffset;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }
};

const scrollToTop = () => {
  playClick();
  if (typeof window !== 'undefined') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

const updateActiveSection = () => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  const scrollPosition = (window.scrollY || window.pageYOffset) + 200;

  for (let i = navSections.length - 1; i >= 0; i--) {
    const el = document.getElementById(navSections[i].id);
    if (el && el.offsetTop <= scrollPosition) {
      activeSectionId.value = navSections[i].id;
      return;
    }
  }
  activeSectionId.value = 'sec-hero';
};

// Scroll-Driven Sticky Showcase for Nava
const navaScrollWrapperRef = ref(null);
const navaTrackRef = ref(null);
const navaScrollProgress = ref(0);
const activeNavaSlideIndex = ref(0);
const navaTrackTranslateX = ref(0);

// Fullscreen Lightbox Modal
const activeLightbox = ref(null);

const openLightbox = (project, index) => {
  playClick();
  activeLightbox.value = {
    project,
    index
  };
};

const closeLightbox = () => {
  playClick();
  activeLightbox.value = null;
};

const nextLightbox = () => {
  if (!activeLightbox.value) return;
  playClick();
  const list = activeLightbox.value.project.screenshots;
  activeLightbox.value.index = (activeLightbox.value.index + 1) % list.length;
};

const prevLightbox = () => {
  if (!activeLightbox.value) return;
  playClick();
  const list = activeLightbox.value.project.screenshots;
  activeLightbox.value.index = (activeLightbox.value.index - 1 + list.length) % list.length;
};

const handleKeydown = (e) => {
  if (!activeLightbox.value) return;
  if (e.key === 'Escape') {
    closeLightbox();
  } else if (e.key === 'ArrowRight') {
    nextLightbox();
  } else if (e.key === 'ArrowLeft') {
    prevLightbox();
  }
};

// Helper to safely unwrap DOM elements whether Vue ref returns an element or an array inside v-for
const getDomElement = (target) => {
  if (!target) return null;
  if (Array.isArray(target)) {
    return target.find(el => el && el.nodeType === 1) || target[0] || null;
  }
  return target && target.nodeType === 1 ? target : null;
};

const toPersianDigits = (num) => {
  const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(num).replace(/[0-9]/g, (d) => farsiDigits[parseInt(d, 10)] || d);
};

// Scroll-Driven Engine for Nava Phone Track
const updateNavaScroll = () => {
  if (typeof window === 'undefined') return;
  if (activeProjectDossier.value !== 'nava-music-player') return;

  const wrapper = getDomElement(navaScrollWrapperRef.value) || document.querySelector('.scroll-driven-gallery-wrapper');
  const track = getDomElement(navaTrackRef.value) || document.querySelector('.phone-track');
  if (!wrapper || !track) return;

  const rect = wrapper.getBoundingClientRect();
  const stickyFrame = wrapper.querySelector('.sticky-gallery-frame');
  const stickyTopOffset = stickyFrame
    ? (parseInt(window.getComputedStyle(stickyFrame).top, 10) || 45)
    : 45;
  const totalPinDistance = wrapper.offsetHeight - window.innerHeight;

  if (totalPinDistance <= 0) {
    navaScrollProgress.value = 0;
    navaTrackTranslateX.value = 0;
    activeNavaSlideIndex.value = 0;
    return;
  }

  const scrolled = stickyTopOffset - rect.top;
  const progress = Math.min(Math.max(scrolled / totalPinDistance, 0), 1);
  navaScrollProgress.value = progress;

  const trackParent = track.parentElement;
  const viewportWidth = trackParent ? trackParent.clientWidth : 800;
  const trackWidth = track.scrollWidth;
  const maxOverflow = Math.max(trackWidth - viewportWidth, 0);

  // In RTL coordinate track: Slide 01 begins at right (translateX = 0).
  // Translating positive X shifts subsequent slides (02 -> 05) into view from the left.
  navaTrackTranslateX.value = progress * maxOverflow;

  const count = 5;
  activeNavaSlideIndex.value = Math.min(Math.floor(progress * count), count - 1);
};

const scrollToNavaSlide = (index) => {
  playClick();
  if (typeof window === 'undefined') return;

  const wrapper = getDomElement(navaScrollWrapperRef.value) || document.querySelector('.scroll-driven-gallery-wrapper');
  if (!wrapper) return;

  const totalPinDistance = wrapper.offsetHeight - window.innerHeight;
  if (totalPinDistance <= 0) {
    const track = getDomElement(navaTrackRef.value) || document.querySelector('.phone-track');
    if (track) {
      const cards = track.querySelectorAll('.phone-mockup-card');
      if (cards[index]) {
        cards[index].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
    activeNavaSlideIndex.value = index;
    return;
  }

  const count = 5;
  const targetProgress = count > 1 ? index / (count - 1) : 0;

  const wrapperRect = wrapper.getBoundingClientRect();
  const currentScrollY = window.scrollY || window.pageYOffset;
  const stickyFrame = wrapper.querySelector('.sticky-gallery-frame');
  const stickyTopOffset = stickyFrame
    ? (parseInt(window.getComputedStyle(stickyFrame).top, 10) || 45)
    : 45;
  const wrapperStartScrollY = currentScrollY + wrapperRect.top - stickyTopOffset;
  const targetScrollY = wrapperStartScrollY + targetProgress * totalPinDistance;

  window.scrollTo({
    top: targetScrollY,
    behavior: 'smooth'
  });
};

// Touch swipe support on mobile for Nava phone track
let touchStartX = 0;
let touchStartY = 0;

const onTrackTouchStart = (e) => {
  if (e.touches && e.touches.length > 0) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }
};

const onTrackTouchEnd = (e) => {
  if (!touchStartX) return;
  const touchEndX = e.changedTouches[0].clientX;
  const touchEndY = e.changedTouches[0].clientY;
  const diffX = touchEndX - touchStartX;
  const diffY = touchEndY - touchStartY;

  // If gesture was predominantly horizontal swipe in RTL
  if (Math.abs(diffX) > 35 && Math.abs(diffX) > Math.abs(diffY)) {
    if (diffX > 0) {
      // Swiping right (pulling next slide from left in RTL) -> next slide
      if (activeNavaSlideIndex.value < 4) {
        scrollToNavaSlide(activeNavaSlideIndex.value + 1);
      }
    } else {
      // Swiping left (pulling previous slide back from right in RTL) -> prev slide
      if (activeNavaSlideIndex.value > 0) {
        scrollToNavaSlide(activeNavaSlideIndex.value - 1);
      }
    }
  }
  touchStartX = 0;
  touchStartY = 0;
};

watch(activeProjectDossier, (newVal) => {
  if (newVal === 'nava-music-player') {
    nextTick(() => {
      setTimeout(updateNavaScroll, 60);
    });
  }
});

// Dynamic Tehran Clock
let clockTimer = null;
const updateTehranTime = () => {
  try {
    const formatter = new Intl.DateTimeFormat('fa-IR', {
      timeZone: 'Asia/Tehran',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    tehranTime.value = formatter.format(new Date());
  } catch (e) {
    const d = new Date();
    tehranTime.value = `${d.getHours()}:${d.getMinutes()}`;
  }
};

const onScroll = () => {
  requestAnimationFrame(() => {
    updateNavaScroll();
    updateActiveSection();
  });
};
const onResize = () => {
  requestAnimationFrame(() => {
    updateNavaScroll();
    updateActiveSection();
  });
};

onMounted(() => {
  updateTehranTime();
  updateActiveSection();
  clockTimer = setInterval(updateTehranTime, 1000);
  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', handleKeydown);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
  }
});

onUnmounted(() => {
  if (clockTimer) clearInterval(clockTimer);
  if (typeof window !== 'undefined') {
    window.removeEventListener('keydown', handleKeydown);
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onResize);
  }
});

const toggleProject = (slug) => {
  playClick();
  activeProjectDossier.value = activeProjectDossier.value === slug ? null : slug;
};

const copyEmail = () => {
  playClick();
  const email = profile.value?.contact?.email || 'hi@alirz.ir';
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    navigator.clipboard.writeText(email);
  }
  emailCopied.value = true;
  setTimeout(() => {
    emailCopied.value = false;
  }, 2200);
};

const navigateToResume = () => {
  playClick();
  navigateTo('/resume/');
};

// Curated Flagship Projects (The 4 Landmark Systems)
const flagshipProjects = [
  {
    slug: 'legacy-queue-systems',
    number: '۰۱',
    title: 'پلتفرم نوبت‌دهی و اتوماسیون شعب بانکی',
    client: 'نداپرداز انفورماتیک • بانک‌های ملت، آینده و شهر',
    period: '۱۴۰۰ — اکنون (۵ سال مستمر)',
    tagline: 'زیرساخت بلادرنگ مدیریت صف، کیوسک‌های لمسی و یکپارچه‌سازی سخت‌افزاری در شعب سراسر کشور.',
    tags: ['C#', '.NET 9', 'WPF (MVVM)', 'Serial / RS485', 'SQL Server', 'ESC/POS Printers'],
    metrics: [
      { label: 'استقرار کشوری', value: 'بانک‌های ملت، آینده و شهر' },
      { label: 'ترافیک روزانه', value: '+۱۰۰,۰۰۰ مراجعه‌کننده' },
      { label: 'پایداری عملیاتی', value: '+۵ سال در ساعات پیک' }
    ],
    pipeline: [
      { node: 'کیوسک لمسی صدور نوبت', type: 'client', tech: 'WPF (MVVM)' },
      { node: 'کنترل‌یونیت سخت‌افزاری', type: 'hw', tech: 'Serial / RS485' },
      { node: 'موتور مرکزی صف و باجه', type: 'engine', tech: '.NET 9 Core' },
      { node: 'پایگاه‌داده تراکنشی', type: 'db', tech: 'SQL Server' }
    ],
    challenge: 'مدیریت بلادرنگ صفوف و پیشگیری از قفل تراکنش‌ها در ساعات اوج شلوغی شعب بانکی، در کنار تضمین ارتباط پایدار با پورت‌های سخت‌افزاری و کیوسک‌های صدور فیش با معماری توزیع‌شده.',
    approach: 'تفکیک کلاینت‌های کیوسک لمسی و باجه (Teller Units)، طراحی موتور مرکزی تخصیص صف بر بستر SQL Server با کوئری‌های بهینه، و برقراری ارتباط سریال ایمن (RS485) با کنترل‌یونیت‌ها و نمایشگرهای سالنی.',
    impact: 'روان‌سازی ترافیک شعب و حذف معطلی صدها هزار شهروند در سراسر کشور با کمترین میزان Down-time ممکن.'
  },
  {
    slug: 'biodaru-qms',
    number: '۰۲',
    title: 'سامانه جامع نوبت‌دهی و احراز هویت بیومتریک پلاسما (QMS)',
    client: 'بیودارو (سازمان انتقال پلاسما)',
    period: '۱۴۰۳ — اکنون',
    tagline: 'بازطراحی صفر تا صد چرخه استاندارد ۹ مرحله‌ای اهدای پلاسما با احراز هویت اثر انگشت و مانیتورینگ متمرکز شعب.',
    tags: ['ASP.NET Core', 'Vue.js 3', 'SignalR Hubs', 'WPF Agent', 'Suprema Biometric SDK'],
    metrics: [
      { label: 'چرخه عملیاتی', value: '۹ مرحله استاندارد مدیکال' },
      { label: 'احراز هویت', value: 'سنسور اثر انگشت Suprema' },
      { label: 'معماری هاب', value: 'ارتباطات سوکت بلادرنگ' }
    ],
    pipeline: [
      { node: 'سنسور بیومتریک اهداکننده', type: 'hw', tech: 'Suprema SDK' },
      { node: 'ایجنت محلی شعب', type: 'agent', tech: 'WPF Bridge' },
      { node: 'هاب بلادرنگ و وب‌سرویس', type: 'engine', tech: 'SignalR & ASP.NET' },
      { node: 'کلاینت ایستگاه‌های پزشک', type: 'client', tech: 'Vue.js 3 SPA' }
    ],
    challenge: 'جایگزینی یک سامانه قدیمی و ناامن با پلتفرمی مدرن که بتواند فرآیند دقیق و چندمرحله‌ای اهدای پلاسما (از پذیرش تا صف پزشک و سالن خون‌گیری) را با احراز هویت بیومتریک تضمین کند.',
    approach: 'طراحی هسته ماژولار ASP.NET Core متصل به ایجنت محلی دسکتاپ برای فراخوانی SDK سخت‌افزاری سنسورهای اثر انگشت و اسکنر اسناد، همراه با هاب‌های SignalR برای به‌روزرسانی آنی وضعیت اهداکنندگان در وب‌اپلیکیشن Vue 3.',
    impact: 'کاهش خطاهای هویتی پزشکی به صفر، حذف کامل کاغذبازی و صف‌های نامنظم و ایجاد داشبورد نظارتی زنده برای مدیریت ارشد بیودارو.'
  },
  {
    slug: 'nava-music-player',
    number: '۰۳',
    title: 'موزیک‌پلیر تجاری نوا (Nava Music Player)',
    client: 'محصول تجاری شخصی • کافه بازار و مایکت',
    period: '۱۴۰۴',
    tagline: 'توسعه و انتشار مستقل اپلیکیشن چندسکویی موسیقی با بهره‌گیری از متدولوژی هوش مصنوعی (Vibe Coding).',
    tags: ['Flutter / Dart', 'Cross-Platform', 'Audio Architecture', 'Vibe Coding', 'AI Workflows'],
    metrics: [
      { label: 'وضعیت انتشار', value: 'کافه بازار و مایکت (+۱۶۰ نصب)' },
      { label: 'معماری اپلیکیشن', value: 'Cross-Platform (اندروید و ویندوز)' },
      { label: 'متدولوژی توسعه', value: 'AI-Augmented Engineering' }
    ],
    pipeline: [
      { node: 'موتور صوتی و بافرینگ', type: 'engine', tech: 'JustAudio Native' },
      { node: 'کنترلر چرخه حیات در پس‌زمینه', type: 'agent', tech: 'Background Services' },
      { node: 'طراحی مبتنی بر هوش مصنوعی', type: 'ai', tech: 'Vibe Coding Workflows' },
      { node: 'کلاینت کراس‌پلتفرم', type: 'client', tech: 'Flutter / Dart' }
    ],
    screenshots: [
      {
        id: 'nava-player',
        num: '۰۱',
        title: 'پخش‌کننده اصلی و کنترل‌های لمسی',
        caption: 'رابط کاربری تاچ با کاور بزرگ آلبوم، ژست‌های حرکتی روان، کنترل شافل، ریپیت و اکولایزر بلادرنگ.',
        src: '/projects/nava/mobile-player.jpg',
        badge: 'Now Playing',
        aspect: 'portrait'
      },
      {
        id: 'nava-lyrics',
        num: '۰۲',
        title: 'متن ترانه همگام کارائوکه (Live Lyrics)',
        caption: 'همگام‌سازی خط‌به‌خط بر اساس تایم‌استمپ موزیک با انیمیشن‌های روان و جلوه بلور پس‌زمینه.',
        src: '/projects/nava/mobile-lyrics.jpg',
        badge: 'Karaoke Sync',
        aspect: 'portrait'
      },
      {
        id: 'nava-home',
        num: '۰۳',
        title: 'صفحه اصلی و میکس‌های هوشمند (Smart Mixes)',
        caption: 'سازمان‌دهی ترک‌ها، میکس‌های هوشمند مبتنی بر هوش مصنوعی و تفکیک موزیک، بی‌کلام و پادکست.',
        src: '/projects/nava/mobile-home.jpg',
        badge: 'Home & Mixes',
        aspect: 'portrait'
      },
      {
        id: 'nava-studio',
        num: '۰۴',
        title: 'استودیو صدا و تولید ویدیوی استوری',
        caption: 'جعبه‌ابزار Remix Studio، ساخت ویدیوی استوری ۹:۱۶ همگام با ترانه، و کارت آماری Nava Wrapped.',
        src: '/projects/nava/mobile-studio.jpg',
        badge: 'Audio Studio',
        aspect: 'portrait'
      },
      {
        id: 'nava-settings',
        num: '۰۵',
        title: 'تنظیمات، تم OLED و شخصی‌سازی',
        caption: 'پشتیبانی از تم‌های Dark، OLED Black، Light، انتخاب پالت‌های رنگی و تنظیم اندازه قلم متن.',
        src: '/projects/nava/mobile-settings.jpg',
        badge: 'Customization',
        aspect: 'portrait'
      }
    ],
    challenge: 'تحویل یک محصول تجاری باکیفیت و بدون باگ صوتی در کمترین زمان ممکن، از ایده تا طراحی و انتشار رسمی روی استورهای مطرح کشور.',
    approach: 'استفاده از متدولوژی پیشرو Vibe Coding؛ تبدیل مفاهیم معماری نرم‌افزار به پرامپت‌ها و ساختارهای منسجم کدی، مدیریت چرخه حیات صوت در پس‌زمینه و رابط کاربری مینیمال با فریم‌ورک Flutter.',
    impact: 'توسعه مستقل و انتشار موفق یک محصول کراس‌پلتفرم واقعی روی کافه بازار و مایکت (+۱۶۰ نصب فعال)؛ اثبات کارآمدی متدولوژی AI-Augmented در ساخت صفر تا صد اپلیکیشن‌های تعاملی.'
  },
  {
    slug: 'neuroflow-platform',
    number: '۰۴',
    title: 'پلتفرم پردازش ناهمگام و رویدادمحور NeuroFlow',
    client: 'پروژه تحقیق و توسعه (R&D Concept)',
    period: 'معماری مدرن سیستم‌ها',
    tagline: 'طراحی پایپ‌لاین ماژولار پردازش توزیع‌شده با تکیه بر پیام‌رسان‌ها و سرویس‌های زمینه‌ای دات‌نت.',
    tags: ['.NET 9 Worker Services', 'RabbitMQ', 'Redis Distributed Cache', 'Event-Driven', 'Clean Architecture'],
    metrics: [
      { label: 'الگوی پیام‌رسانی', value: 'Event-Driven / Pub-Sub' },
      { label: 'مدیریت گلوگاه', value: 'صف‌های پس‌زمینه با تحمل خطا' },
      { label: 'معماری لایه‌ای', value: 'Microservices & CQRS' }
    ],
    pipeline: [
      { node: 'درگاه ورودی پیام‌ها', type: 'client', tech: 'REST WebAPI' },
      { node: 'بروکر پیام‌های توزیع‌شده', type: 'queue', tech: 'RabbitMQ Exchange' },
      { node: 'سرویس‌های پردازش ناهمگام', type: 'engine', tech: '.NET Worker Services' },
      { node: 'حافظه موقت استیت‌ها', type: 'db', tech: 'Redis Cache' }
    ],
    challenge: 'حل معضل گلوگاه‌های پردازشی در وب‌سرویس‌هایی که حجم بالایی از وظایف سنگین محاسباتی یا تراکنش‌های بیرونی را دریافت می‌کنند.',
    approach: 'پیاده‌سازی پایپ‌لاین ناهمگام با استفاده از دات‌نت ورکر سرویس‌ها، لایه صف‌بندی RabbitMQ جهت پخش بار و لایه حافظه توزیع‌شده ردیس برای نگهداری استیت‌های گذرا.',
    impact: 'توسعه یک بلوپرینت معماری مقیاس‌پذیر برای بکارگیری در سیستم‌های پرترافیک و بدون توقف.'
  }
];

// Repertoire Matrix
const skillDomains = [
  {
    title: 'هسته بک‌اند و سیستم‌ها',
    items: ['C#', '.NET 9', 'ASP.NET Core', 'Clean Architecture', 'CQRS', 'SignalR Hubs', 'RESTful API Design', 'Concurrency & Tasking']
  },
  {
    title: 'سخت‌افزار و نرم‌افزارهای دسکتاپ',
    items: ['WPF (MVVM Pattern)', 'WinForms', 'Win32 APIs', 'ارتباطات سریال (RS485 / Serial)', 'سنسورهای بیومتریک Suprema', 'پرینترهای حرارتی ESC/POS']
  },
  {
    title: 'داده‌ها و زیرساخت توزیع‌شده',
    items: ['Microsoft SQL Server', 'بهینه‌سازی T-SQL و ایندکس‌ها', 'Redis Caching', 'RabbitMQ Message Broker', 'Docker Containers', 'Git Flow & CI/CD']
  }
];
</script>

<template>
  <div class="craft-container" :class="{ 'is-dark': isDark, 'is-light': isLight, 'is-paper': isPaper }" dir="rtl">


    <!-- ═══════════════════════════════════════════════
         FLOATING READING PROGRESS & TOC RAIL
         ═══════════════════════════════════════════════ -->
    <nav class="floating-toc-rail" aria-label="فهرست بخش‌های صفحه">
      <div class="toc-rail-track">
        <button
          v-for="sec in navSections"
          :key="sec.id"
          type="button"
          class="toc-node-btn"
          :class="{ 'is-active': activeSectionId === sec.id }"
          @click="scrollToSection(sec.id)"
          :title="sec.title"
          :aria-current="activeSectionId === sec.id ? 'true' : 'false'"
        >
          <!-- Expanding Tick / Dash -->
          <span class="toc-dash"></span>
          <!-- Section Number & Label Pill -->
          <span class="toc-label-pill">
            <span class="toc-num mono-font">{{ sec.number }}</span>
            <span class="toc-title">{{ sec.title }}</span>
          </span>
        </button>
      </div>

      <!-- Quick Scroll to Top Action -->
      <button
        type="button"
        class="toc-top-btn"
        :class="{ 'is-visible': activeSectionId !== 'sec-hero' }"
        @click="scrollToTop"
        title="بازگشت به ابتدای صفحه"
        aria-label="بازگشت به بالا"
      >
        <span class="top-arrow">↑</span>
      </button>
    </nav>

    <!-- ═══════════════════════════════════════════════
         01. THE MASTHEAD / LIVING TELEMETRY WIDGET
         ═══════════════════════════════════════════════ -->
    <header class="masthead">
      <div class="masthead-identity">
        <a href="/" class="masthead-name">علیرضا لطفی مقدم</a>
        <div class="masthead-status">
          <span class="pulse-indicator"></span>
          <span>نداپرداز و بیودارو • تهران</span>
        </div>
      </div>

      <nav class="masthead-actions">
        <!-- Living Telemetry Widget -->
        <div class="telemetry-pill" title="زمان زنده تهران و وضعیت سیستم">
          <span class="telemetry-clock mono-font" dir="ltr">{{ tehranTime }}</span>
          <span class="telemetry-sep">|</span>
          <span class="telemetry-status">تهران</span>
        </div>

        <!-- Theme Toggle -->
        <button
          type="button"
          class="masthead-btn theme-toggle"
          @click="toggleTheme"
          :title="`تغییر تم به ${nextThemeLabel}`"
        >
          <span>{{ currentThemeLabel }}</span>
        </button>
      </nav>
    </header>

    <!-- ═══════════════════════════════════════════════
         02. EDITORIAL INTRO / THE EXECUTIVE STATEMENT
         ═══════════════════════════════════════════════ -->
    <section id="sec-hero" class="editorial-hero">
      <h1 class="hero-statement">
        مهندس نرم‌افزار با تمرکز بر سیستم‌های با مقیاس بالا، تعامل سخت‌افزار-نرم‌افزار و سامانه‌های بلادرنگ.
      </h1>

      <p class="hero-subtext">
        بیش از ۵ سال است که در شرکت نداپرداز انفورماتیک، روی پلتفرم‌های حیاتی نوبت‌دهی و اتوماسیون شعب بزرگ‌ترین بانک‌های کشور (ملت، آینده و شهر) کار می‌کنم؛ جایی که پایداری کیوسک‌های لمسی، صف‌بندی روان و برقراری ارتباط بدون‌خطا با سخت‌افزارها، مستقیماً با آرامش و زمان صدها هزار شهروند در روز پیوند خورده است.
      </p>
    </section>

    <div class="hairline-divider"></div>

    <!-- ═══════════════════════════════════════════════
         03. SELECTED WORK / INTERACTIVE INDEX
         ═══════════════════════════════════════════════ -->
    <section id="sec-works" class="section-container">
      <div class="section-eyebrow-row">
        <h2 class="section-title">آثار شاخص مهندسی</h2>
        <span class="section-count mono-font">۰۴ پروژه برگزیده</span>
      </div>

      <div class="editorial-works-stream">
        <article
          v-for="item in flagshipProjects"
          :key="item.slug"
          class="work-row"
          :class="{ 'is-expanded': activeProjectDossier === item.slug }"
          @mouseenter="hoveredProject = item.slug"
          @mouseleave="hoveredProject = null"
        >
          <div class="work-row-main" @click="toggleProject(item.slug)">
            <!-- Title & Index Header -->
            <div class="work-header">
              <span class="work-index mono-font">{{ item.number }}</span>
              <div class="work-title-wrap">
                <h3 class="work-title">{{ item.title }}</h3>
                <span class="work-client">{{ item.client }}</span>
                <span v-if="item.screenshots && item.screenshots.length" class="work-gallery-badge mono-font">
                  📷 {{ item.screenshots.length }} تصویر رابط کاربری
                </span>
              </div>
              <button type="button" class="work-toggle-btn" :class="{ active: activeProjectDossier === item.slug }">
                <span>{{ activeProjectDossier === item.slug ? 'بستن بررسی' : 'بررسی فنی' }}</span>
                <span class="toggle-arrow">{{ activeProjectDossier === item.slug ? '▲' : '▼' }}</span>
              </button>
            </div>

            <!-- Tagline description -->
            <p class="work-tagline">{{ item.tagline }}</p>

            <!-- Metrics Strip: Strict RTL order (Label first, then Value) -->
            <div class="work-metrics-strip">
              <div v-for="(m, idx) in item.metrics" :key="idx" class="metric-pill">
                <span class="metric-lbl">{{ m.label }}:</span>
                <span class="metric-val mono-font" dir="auto">{{ m.value }}</span>
              </div>
            </div>

            <!-- Tech Tags: Right-aligned chips -->
            <div class="work-tags-list">
              <span v-for="tag in item.tags" :key="tag" class="work-tag" dir="ltr">{{ tag }}</span>
            </div>
          </div>

          <!-- Structured & Elegant Technical Dossier with Architecture Pipeline -->
          <Transition name="expand-dossier">
            <div v-if="activeProjectDossier === item.slug" class="work-dossier">
              <div class="dossier-capsule">
                <div class="dossier-capsule-header">
                  <span class="capsule-title">تحلیل و گزارش معماری سیستم</span>
                  <span class="capsule-period mono-font">{{ item.period }}</span>
                </div>

                <!-- LIVE ARCHITECTURE PIPELINE FLOW -->
                <div class="pipeline-stage">
                  <span class="pipeline-eyebrow mono-font">// دیاگرام جریان داده و پایپ‌لاین معماری</span>
                  <div class="pipeline-track" dir="ltr">
                    <div
                      v-for="(step, sIdx) in item.pipeline"
                      :key="sIdx"
                      class="pipeline-node-wrap"
                    >
                      <div class="pipeline-node" :class="step.type">
                        <span class="node-name">{{ step.node }}</span>
                        <span class="node-tech mono-font">{{ step.tech }}</span>
                      </div>
                      <div v-if="sIdx < item.pipeline.length - 1" class="pipeline-connector">
                        <span class="pulse-beam"></span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- SCROLL-DRIVEN STICKY PHONE SHOWCASE (FOR NAVA) -->
                <div
                  v-if="item.screenshots && item.screenshots.length"
                  :ref="el => { if (el) navaScrollWrapperRef = el; }"
                  class="scroll-driven-gallery-wrapper"
                >
                  <div class="sticky-gallery-frame">
                    <!-- Gallery Top Control Bar -->
                    <div class="gallery-control-bar">
                      <div class="gallery-control-title-wrap">
                        <div class="gallery-eyebrow-pill">
                          <span class="pulse-indicator-small"></span>
                          <span class="mono-font">// نماهای رابط کاربری اپلیکیشن موبایل</span>
                        </div>
                        <h4 class="gallery-control-heading">
                          پیمایش تعاملی نماهای واقعی با اسکرول صفحه
                        </h4>
                      </div>

                      <!-- Interactive Slide Selector Pills -->
                      <div class="gallery-slide-pills">
                        <button
                          v-for="(shot, sIdx) in item.screenshots"
                          :key="shot.id"
                          type="button"
                          class="slide-pill-btn"
                          :class="{ active: activeNavaSlideIndex === sIdx }"
                          @click.stop="scrollToNavaSlide(sIdx)"
                          :title="shot.title"
                        >
                          <span class="mono-font">{{ shot.num }}</span>
                          <span class="pill-badge-label">{{ shot.badge }}</span>
                        </button>
                      </div>
                    </div>

                    <!-- Visual Progress Line -->
                    <div class="gallery-progress-line-track">
                      <div
                        class="gallery-progress-line-fill"
                        :style="{ width: `${navaScrollProgress * 100}%` }"
                      ></div>
                    </div>

                    <!-- Horizontal Track Viewport -->
                    <div
                      class="phone-track-viewport"
                      @touchstart.passive="onTrackTouchStart"
                      @touchend.passive="onTrackTouchEnd"
                    >
                      <div
                        :ref="el => { if (el) navaTrackRef = el; }"
                        class="phone-track"
                        :style="{
                          transform: `translate3d(${navaTrackTranslateX}px, 0, 0)`
                        }"
                      >
                        <div
                          v-for="(shot, sIdx) in item.screenshots"
                          :key="shot.id"
                          class="phone-mockup-card"
                          :class="{ 'is-active-slide': activeNavaSlideIndex === sIdx }"
                          @click.stop="openLightbox(item, sIdx)"
                        >
                          <!-- Realistic Phone Device Shell -->
                          <div class="phone-device-shell">
                            <!-- Top Dynamic Notch / Speaker -->
                            <div class="phone-notch">
                              <span class="notch-speaker"></span>
                              <span class="notch-camera"></span>
                            </div>

                            <!-- Screen Container -->
                            <div class="phone-screen">
                              <img
                                :src="shot.src"
                                :alt="shot.title"
                                class="phone-screen-img"
                                loading="lazy"
                              />
                              <!-- Glass Gradient Reflection -->
                              <div class="phone-glass-reflection"></div>
                              <!-- Hover Zoom Hint -->
                              <div class="phone-hover-overlay">
                                <span class="zoom-chip">🔍 بزرگ‌نمایی</span>
                              </div>
                            </div>
                          </div>

                          <!-- Mockup Caption Block -->
                          <div class="phone-info-block">
                            <div class="phone-info-badge-row">
                              <span class="phone-badge mono-font">{{ shot.badge }}</span>
                              <span class="phone-index mono-font">{{ shot.num }} / ۰۵</span>
                            </div>
                            <h5 class="phone-info-title">{{ shot.title }}</h5>
                            <p class="phone-info-caption">{{ shot.caption }}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Scroll Hint Footer -->
                    <div class="gallery-scroll-hint-row">
                      <span class="scroll-hint-text">
                        <span>↓ برای حرکت در بین نماها و مشاهده ادامه معماری، اسکرول کنید</span>
                      </span>
                      <span class="scroll-counter-pill">
                        نمای {{ toPersianDigits(activeNavaSlideIndex + 1) }} از {{ toPersianDigits(item.screenshots.length) }}
                      </span>
                    </div>
                  </div>
                </div>

                <div class="dossier-grid">
                  <!-- Block 1: Challenge -->
                  <div class="dossier-card challenge-card">
                    <div class="card-tag-row">
                      <span class="card-badge challenge-badge">چالش مهندسی</span>
                    </div>
                    <p class="card-body-text">{{ item.challenge }}</p>
                  </div>

                  <!-- Block 2: Solution & Approach -->
                  <div class="dossier-card approach-card">
                    <div class="card-tag-row">
                      <span class="card-badge approach-badge">راهکار و معماری</span>
                    </div>
                    <p class="card-body-text">{{ item.approach }}</p>
                  </div>
                </div>

                <!-- Block 3: Operational Impact -->
                <div class="dossier-card impact-card">
                  <div class="card-tag-row">
                    <span class="card-badge impact-badge">دستاورد عملیاتی در مقیاس واقعی</span>
                  </div>
                  <p class="card-body-text highlight">{{ item.impact }}</p>
                </div>
              </div>
            </div>
          </Transition>
        </article>
      </div>
    </section>

    <div class="hairline-divider"></div>

    <!-- ═══════════════════════════════════════════════
         03.5 EXPLORABLE SYSTEM ARCHITECTURES (DUAL LAB)
         ═══════════════════════════════════════════════ -->
    <section id="sec-broker" class="section-container">
      <div class="section-eyebrow-row">
        <h2 class="section-title">کاوش تعاملی معماری</h2>
        <span class="section-count mono-font">پژوهش بصری • شبیه‌ساز مهندسی</span>
      </div>

      <!-- Architecture Switcher Tabs -->
      <div class="arch-tab-switcher-row">
        <button
          type="button"
          class="arch-tab-pill-btn"
          :class="{ active: activeArchTab === 'broker' }"
          @click="activeArchTab = 'broker'; playClick()"
        >
          <span class="tab-idx mono-font">۰۱</span>
          <span>کارگزار پیام (Message Broker FIFO)</span>
        </button>
        <button
          type="button"
          class="arch-tab-pill-btn"
          :class="{ active: activeArchTab === 'hardware' }"
          @click="activeArchTab = 'hardware'; playClick()"
        >
          <span class="tab-idx mono-font">۰۲</span>
          <span>پل ارتباطی سخت‌افزار و نرم‌افزار (RS-485 / WPF)</span>
        </button>
      </div>

      <Transition name="fade-fast" mode="out-in">
        <InteractiveMessageBroker v-if="activeArchTab === 'broker'" key="broker" />
        <InteractiveHardwareBridge v-else key="hardware" />
      </Transition>
    </section>

    <div class="hairline-divider"></div>

    <!-- ═══════════════════════════════════════════════
         04. ENGINEERING PRINCIPLES / INSIGHTS
         ═══════════════════════════════════════════════ -->
    <section id="sec-principles" class="section-container">
      <div class="section-eyebrow-row">
        <h2 class="section-title">دیدگاه مهندسی</h2>
        <span class="section-count mono-font">حاصل ۵ سال تجربه عملیاتی</span>
      </div>

      <div class="principles-grid">
        <div class="principle-item">
          <span class="principle-num mono-font">۰۱</span>
          <h3 class="principle-title">پایداری فراتر از کد تمیز است</h3>
          <p class="principle-desc">
            کد خوب کدی نیست که صرفاً تست‌های یونیت لوکال را پاس کند؛ کدی است که وقتی پرینتر حرارتی کیوسک در شلوغ‌ترین شعبه بانک کاغذ تمام می‌کند یا پورت سریال با نوسان مواجه می‌شود، کرش نکند و کل صف شعبه را قفل نیندازد.
          </p>
        </div>

        <div class="principle-item">
          <span class="principle-num mono-font">۰۲</span>
          <h3 class="principle-title">سادگی معماری در فشار واقعی</h3>
          <p class="principle-desc">
            پیچیدگی بیهوده در لایه‌بندی‌ها دشمن نگهداری است. بهترین معماری، سیستمی است که بتوان در ساعت ۲ بعدازظهر زیر فشار چندصد باجه و کیوسک، گلوگاه تراکنش‌های دیتابیس آن را ظرف چند دقیقه ردیابی و برطرف کرد.
          </p>
        </div>

        <div class="principle-item">
          <span class="principle-num mono-font">۰۳</span>
          <h3 class="principle-title">هوش مصنوعی به عنوان شتاب‌دهنده عمیق</h3>
          <p class="principle-desc">
            متدولوژی Vibe Coding برای من جایگزینی اصول مهندسی نیست؛ بلکه قدرت بخشیدن به یک معمار است تا بتواند در کسری از زمان مرسوم، ایده‌های پیچیده تجاری و کراس‌پلتفرم را به محصولات واقعی و پایدار بدل سازد.
          </p>
        </div>
      </div>
    </section>

    <div class="hairline-divider"></div>

    <!-- ═══════════════════════════════════════════════
         05. CAREER TRAJECTORY
         ═══════════════════════════════════════════════ -->
    <section id="sec-trajectory" class="section-container">
      <div class="section-eyebrow-row">
        <h2 class="section-title">مسیر حرفه‌ای</h2>
        <span class="section-count mono-font">سوابق شغلی</span>
      </div>

      <div class="trajectory-list">
        <div class="trajectory-item">
          <div class="trajectory-header">
            <h3 class="trajectory-role">مهندس نرم‌افزار و متخصص سامانه‌های بانکی</h3>
            <span class="trajectory-period mono-font">۱۴۰۰ — اکنون (۵ سال)</span>
          </div>
          <span class="trajectory-company">شرکت نداپرداز انفورماتیک</span>
          <p class="trajectory-desc">
            توسعه و نگهداری اکوسیستم نوبت‌دهی شعب، کلاینت‌های کیوسک و باجه، موتور نمایشگرهای سالنی، و اتصال کنترل‌یونیت‌های سخت‌افزاری برای شعب بانک‌های مطرح کشور (ملت، آینده، شهر).
          </p>
        </div>

        <div class="trajectory-item">
          <div class="trajectory-header">
            <h3 class="trajectory-role">طراح و معمار ارشد سیستم‌های عملیاتی</h3>
            <span class="trajectory-period mono-font">اردیبهشت ۱۴۰۳ — اکنون</span>
          </div>
          <span class="trajectory-company">پروژه‌های سازمانی بیودارو</span>
          <p class="trajectory-desc">
            طراحی و پیاده‌سازی سامانه یکپارچه نوبت‌دهی و احراز هویت بیومتریک پلاسما (QMS)، یکپارچه‌سازی با سنسورهای Suprema و توسعه سامانه‌های آموزش و آزمون پرسنلی.
          </p>
        </div>
      </div>
    </section>

    <div class="hairline-divider"></div>

    <!-- ═══════════════════════════════════════════════
         06. REPERTOIRE / TECHNICAL MATRIX (CENTERED COLUMNS)
         ═══════════════════════════════════════════════ -->
    <section id="sec-skills" class="section-container">
      <div class="section-eyebrow-row">
        <h2 class="section-title">قلمروهای فنی</h2>
        <span class="section-count mono-font">جعبه‌ابزار تخصصی</span>
      </div>

      <div class="skills-domains-grid">
        <div v-for="domain in skillDomains" :key="domain.title" class="skill-domain-col">
          <h3 class="domain-title">{{ domain.title }}</h3>
          <ul class="domain-items-list">
            <li v-for="it in domain.items" :key="it" class="domain-item" dir="auto">
              {{ it }}
            </li>
          </ul>
        </div>
      </div>
    </section>

    <div class="hairline-divider"></div>

    <!-- ═══════════════════════════════════════════════
         07. CONNECT / CHANNELS (EDITORIAL CONTACT)
         ═══════════════════════════════════════════════ -->
    <section id="sec-connect" class="section-container">
      <div class="section-eyebrow-row">
        <h2 class="section-title">ارتباط</h2>
        <span class="section-count mono-font">// راه‌های ارتباطی</span>
      </div>

      <p class="connect-lead">
        همواره مشتاق گفتگو درباره سیستم‌های مقیاس‌بالا، تجربیات فنی و فرصت‌های مهندسی جدید هستم.
      </p>

      <div class="connect-channels-list">
        <!-- Email Row -->
        <div class="channel-row" @click="copyEmail" role="button" tabindex="0" title="کلیک برای کپی ایمیل">
          <span class="channel-label">ایمیل</span>
          <div class="channel-value-wrap">
            <span class="channel-value mono-font" dir="ltr">hi@alirz.ir</span>
            <span class="channel-badge">{{ emailCopied ? 'کپی شد!' : 'کپی' }}</span>
          </div>
        </div>

        <!-- Telegram Row -->
        <a href="https://t.me/DAMOON_X" target="_blank" rel="noopener" class="channel-row">
          <span class="channel-label">تلگرام</span>
          <div class="channel-value-wrap">
            <span class="channel-value mono-font" dir="ltr">@DAMOON_X</span>
            <span class="channel-arrow">↗</span>
          </div>
        </a>

        <!-- LinkedIn Row -->
        <a href="https://linkedin.com/in/alireza-lotfi-moghaddam-378a8018a" target="_blank" rel="noopener" class="channel-row">
          <span class="channel-label">لینکدین</span>
          <div class="channel-value-wrap">
            <span class="channel-value mono-font" dir="ltr">alireza-lotfi-moghaddam</span>
            <span class="channel-arrow">↗</span>
          </div>
        </a>

        <!-- GitHub Row -->
        <a href="https://github.com/AlirezaLotfiM" target="_blank" rel="noopener" class="channel-row">
          <span class="channel-label">گیت‌هاب</span>
          <div class="channel-value-wrap">
            <span class="channel-value mono-font" dir="ltr">@AlirezaLotfiM</span>
            <span class="channel-arrow">↗</span>
          </div>
        </a>

        <!-- Resume Row (The Single Authentic Placement) -->
        <a href="/resume/" @click.prevent="navigateToResume" class="channel-row">
          <span class="channel-label">رزومه</span>
          <div class="channel-value-wrap">
            <span class="channel-value highlight-resume">مشاهده و چاپ نسخه A4</span>
            <span class="channel-arrow">↗</span>
          </div>
        </a>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════
         08. COLOPHON & FOOTER
         ═══════════════════════════════════════════════ -->
    <footer class="editorial-colophon">
      <div class="colophon-signature-row">
        <DigitalSignature />
      </div>
      <div class="colophon-bottom">
        <span class="colophon-copy mono-font">
          © {{ new Date().getFullYear() }} • تهران، ایران
        </span>
      </div>
    </footer>

    <!-- FULLSCREEN LIGHTBOX MODAL -->
    <Teleport to="body">
      <Transition name="lightbox-fade">
        <div v-if="activeLightbox" class="lightbox-backdrop" @click.self="closeLightbox">
          <div class="lightbox-shell">
            <div class="lightbox-header">
              <div class="lightbox-breadcrumbs">
                <span class="lightbox-proj-title">{{ activeLightbox.project.title }}</span>
                <span class="lightbox-sep">/</span>
                <span class="lightbox-dev-badge mono-font">
                  {{ activeLightbox.project.screenshots[activeLightbox.index].badge || 'نمای عمودی' }}
                </span>
                <span class="lightbox-count mono-font">
                  {{ activeLightbox.index + 1 }} از {{ activeLightbox.project.screenshots.length }}
                </span>
              </div>
              <button type="button" class="lightbox-close-btn" @click="closeLightbox" aria-label="بستن">
                ✕
              </button>
            </div>

            <!-- Standard LTR Navigation: Left side is Previous (‹), Right side is Next (›) -->
            <div class="lightbox-stage" dir="ltr">
              <button
                type="button"
                class="lightbox-nav-btn prev"
                @click="prevLightbox"
                aria-label="تصویر قبلی"
                title="تصویر قبلی (کلید جهت چپ)"
              >
                ‹
              </button>

              <div class="lightbox-img-box">
                <img
                  :src="activeLightbox.project.screenshots[activeLightbox.index].src"
                  :alt="activeLightbox.project.screenshots[activeLightbox.index].title"
                  class="lightbox-img"
                  :class="activeLightbox.project.screenshots[activeLightbox.index].aspect"
                />
              </div>

              <button
                type="button"
                class="lightbox-nav-btn next"
                @click="nextLightbox"
                aria-label="تصویر بعدی"
                title="تصویر بعدی (کلید جهت راست)"
              >
                ›
              </button>
            </div>

            <div class="lightbox-footer">
              <div class="lightbox-title-row">
                <h4 class="lightbox-title">{{ activeLightbox.project.screenshots[activeLightbox.index].title }}</h4>
                <div class="lightbox-nav-helpers mono-font">
                  <button type="button" class="helper-btn" @click="prevLightbox">‹ قبلی</button>
                  <span class="helper-sep">|</span>
                  <button type="button" class="helper-btn" @click="nextLightbox">بعدی ›</button>
                </div>
              </div>
              <p class="lightbox-desc">{{ activeLightbox.project.screenshots[activeLightbox.index].caption }}</p>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
/* ══════════════════════════════════════════════════════════════════
   HIGH-CRAFT EDITORIAL STYLES (STRICT RTL, SWISS MINIMAL)
   ══════════════════════════════════════════════════════════════════ */

.craft-container {
  max-width: 860px;
  margin: 0 auto;
  padding: 48px 24px 80px;
  color: var(--text-main);
  font-family: var(--font-sans);
  line-height: 1.8;
  position: relative;
  z-index: 1;
  direction: rtl;
  text-align: right;
}



@media (max-width: 640px) {
  .craft-container {
    padding: 24px 18px 60px;
  }
}

.mono-font {
  font-family: var(--font-mono);
}

/* ─── FLOATING READING PROGRESS & TOC RAIL ─── */
.floating-toc-rail {
  position: fixed;
  right: clamp(18px, 2.5vw, 40px);
  left: auto;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
  z-index: 95;
  pointer-events: auto;
  user-select: none;
  direction: rtl;
}

/* Hide gracefully on screens where side margins are narrower */
@media (max-width: 1160px) {
  .floating-toc-rail {
    display: none;
  }
}

.toc-rail-track {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 14px;
  position: relative;
  padding: 8px 0;
}

.toc-rail-track::before {
  content: '';
  position: absolute;
  top: 8px;
  bottom: 8px;
  right: 5px;
  left: auto;
  width: 1px;
  background: var(--panel-border);
  opacity: 0.6;
  z-index: 1;
}

.is-light .toc-rail-track::before {
  background: #e4e4e7;
  opacity: 1;
}

.toc-node-btn {
  background: none;
  border: none;
  padding: 4px 0;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  position: relative;
  z-index: 2;
  font-family: inherit;
  outline: none;
  direction: rtl;
}

/* Horizontal tick mark on the rail */
.toc-dash {
  width: 11px;
  height: 2px;
  background: var(--text-soft);
  opacity: 0.4;
  border-radius: 2px;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  flex-shrink: 0;
}

.is-light .toc-dash {
  background: #a1a1aa;
  opacity: 0.9;
}

.toc-node-btn:hover .toc-dash {
  width: 18px;
  opacity: 0.9;
  background: var(--text-main);
}

.is-light .toc-node-btn:hover .toc-dash {
  background: #09090b;
  opacity: 1;
}

.toc-node-btn.is-active .toc-dash {
  width: 24px;
  height: 3px;
  opacity: 1;
  background: #38bdf8;
  box-shadow: 0 0 10px rgba(56, 189, 248, 0.7);
}

.is-light .toc-node-btn.is-active .toc-dash {
  background: #2563eb;
  box-shadow: 0 0 8px rgba(37, 99, 235, 0.45);
}

.is-paper .toc-node-btn:hover .toc-dash {
  background: #2b2621;
  opacity: 1;
}

.is-paper .toc-node-btn.is-active .toc-dash {
  background: #2b2621;
  box-shadow: 0 1px 2px rgba(43, 38, 33, 0.25);
}

/* Section label pill: reveals on hover or active */
.toc-label-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px;
  border-radius: 999px;
  background: var(--panel-bg);
  border: 1px solid var(--panel-border);
  font-size: 0.72rem;
  color: var(--text-soft);
  opacity: 0;
  transform: translateX(6px);
  pointer-events: none;
  transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
  white-space: nowrap;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  direction: rtl;
}

.is-light .toc-label-pill {
  background: #ffffff;
  border-color: #e4e4e7;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  color: #27272a;
}

.is-dark .toc-label-pill {
  background: rgba(15, 23, 42, 0.85);
  border-color: rgba(148, 163, 184, 0.2);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.5);
  color: rgba(255, 255, 255, 0.85);
}

.toc-node-btn:hover .toc-label-pill,
.toc-node-btn.is-active .toc-label-pill {
  opacity: 1;
  transform: translateX(0);
}

.toc-node-btn.is-active .toc-label-pill {
  color: var(--text-main);
  font-weight: 750;
  border-color: rgba(56, 189, 248, 0.4);
}

.is-light .toc-node-btn.is-active .toc-label-pill {
  color: #09090b;
  border-color: rgba(37, 99, 235, 0.5);
  box-shadow: 0 4px 14px rgba(37, 99, 235, 0.12);
}

.is-paper .toc-label-pill {
  background: #f2eadb;
  border-color: #e2d7c5;
  box-shadow: 0 4px 12px rgba(43, 38, 33, 0.08);
  color: #2b2621;
}

.is-paper .toc-node-btn.is-active .toc-label-pill {
  color: #2b2621;
  border-color: #2b2621;
  box-shadow: 0 4px 14px rgba(43, 38, 33, 0.12);
}

.toc-num {
  font-size: 0.68rem;
  color: #38bdf8;
  font-weight: 700;
}

.is-light .toc-num {
  color: #2563eb;
}

.is-paper .toc-num {
  color: #2b2621;
}

.toc-title {
  direction: rtl;
}

/* Quick scroll-to-top button at the bottom of the rail */
.toc-top-btn {
  margin-top: 6px;
  margin-right: -8px;
  margin-left: 0;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--panel-bg);
  border: 1px solid var(--panel-border);
  color: var(--text-soft);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.82rem;
  cursor: pointer;
  opacity: 0;
  transform: translateY(8px);
  pointer-events: none;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.is-light .toc-top-btn {
  background: #ffffff;
  border-color: #e4e4e7;
  color: #27272a;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.is-paper .toc-top-btn {
  background: #f2eadb;
  border-color: #e2d7c5;
  color: #2b2621;
  box-shadow: 0 2px 8px rgba(43, 38, 33, 0.06);
}

.toc-top-btn.is-visible {
  opacity: 0.75;
  transform: translateY(0);
  pointer-events: auto;
}

.toc-top-btn:hover {
  opacity: 1;
  color: var(--text-main);
  border-color: var(--text-soft);
  transform: translateY(-2px);
}

.is-light .toc-top-btn:hover {
  color: #0f172a;
  border-color: #94a3b8;
}

.is-paper .toc-top-btn:hover {
  background: #eae0cf;
  color: #2b2621;
  border-color: #2b2621;
}

.top-arrow {
  line-height: 1;
}

/* ─── 01. MASTHEAD ─── */
.masthead {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 24px;
  gap: 16px;
  flex-wrap: wrap;
}

.masthead-identity {
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: right;
}

.masthead-name {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--text-main);
  text-decoration: none;
  letter-spacing: -0.02em;
}

.masthead-status {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: var(--text-soft);
}

.pulse-indicator {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.6);
  animation: pulseDot 2s infinite ease-in-out;
}

@keyframes pulseDot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.85); }
}

.masthead-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* Telemetry Widget */
.telemetry-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 5px 12px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.04);
  border: 1px solid var(--panel-border);
  font-size: 0.78rem;
  color: var(--text-soft);
  user-select: none;
}

.telemetry-clock {
  color: var(--text-main);
  font-weight: 700;
}

.telemetry-sep {
  color: var(--panel-border);
}

.is-light .telemetry-pill {
  background: #ffffff;
  border-color: #e4e4e7;
  color: #52525b;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.is-light .telemetry-clock {
  color: #09090b;
}

.is-light .masthead-name {
  color: #09090b;
}

.is-light .masthead-status {
  color: #52525b;
}

.masthead-btn {
  background: transparent;
  border: 1px solid var(--panel-border);
  color: var(--text-soft);
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 0.82rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  text-decoration: none;
}

.is-light .masthead-btn {
  background: #ffffff;
  border-color: #e4e4e7;
  color: #27272a;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.masthead-btn:hover {
  color: var(--text-main);
  border-color: var(--text-soft);
  background: var(--item-hover-bg);
}

.is-light .masthead-btn:hover {
  background: #f4f4f5;
  border-color: #d4d4d8;
  color: #09090b;
}

/* ─── 02. EDITORIAL HERO ─── */
.editorial-hero {
  padding: 32px 0 24px;
  text-align: right;
}

.hero-statement {
  font-size: clamp(1.4rem, 3.2vw, 2.1rem);
  font-weight: 850;
  line-height: 1.48;
  color: var(--text-main);
  margin: 0 0 20px 0;
  letter-spacing: -0.02em;
}

.is-light .hero-statement {
  color: #09090b;
}

.hero-subtext {
  font-size: 1.05rem;
  line-height: 1.95;
  color: var(--text-secondary);
  margin: 0;
}

.is-light .hero-subtext {
  color: #27272a;
}

/* ─── REACTIVE HAIRLINE DIVIDERS ─── */
.hairline-divider {
  width: 100%;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    var(--panel-border) 20%,
    var(--panel-border) 80%,
    transparent 100%
  );
  opacity: 0.75;
  margin: 40px 0;
}

.is-light .hairline-divider {
  background: linear-gradient(
    90deg,
    transparent 0%,
    #e4e4e7 15%,
    #e4e4e7 85%,
    transparent 100%
  );
  opacity: 1;
}

/* ─── SECTION COMMON ─── */
.section-container {
  padding: 8px 0;
  text-align: right;
}

.section-eyebrow-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 28px;
}

.section-title {
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--text-main);
  margin: 0;
  letter-spacing: -0.01em;
}

.is-light .section-title {
  color: #09090b;
}

.section-count {
  font-size: 0.8rem;
  color: var(--text-soft);
}

.is-light .section-count {
  color: #52525b;
}

/* ─── 03. SELECTED WORKS (FOCUS DAMPING & STREAM) ─── */
.editorial-works-stream {
  display: flex;
  flex-direction: column;
  gap: 0;
}

/* Focus Damping / Spotlight: others dim gracefully across all themes */
.editorial-works-stream:hover .work-row:not(:hover) {
  opacity: 0.35;
  transition: opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1), transform 0.25s ease;
}

.is-dark .editorial-works-stream:hover .work-row:not(:hover) {
  opacity: 0.35;
}

.is-light .editorial-works-stream:hover .work-row:not(:hover) {
  opacity: 0.38;
}

.is-paper .editorial-works-stream:hover .work-row:not(:hover) {
  opacity: 0.38;
}

.editorial-works-stream:hover .work-row:hover {
  opacity: 1;
}

.work-row {
  border-bottom: 1px solid var(--panel-border);
  transition: opacity 0.3s ease, background 0.2s ease, transform 0.2s ease;
  padding: 24px 12px;
  margin: 0 -12px;
  border-radius: 8px;
  text-align: right;
}

.is-light .work-row {
  border-bottom-color: #e4e4e7;
}

.work-row:last-child {
  border-bottom: none;
}

.work-row:hover {
  background: rgba(148, 163, 184, 0.04);
}

.is-light .work-row:hover {
  background: #f4f4f5;
}

.work-row.is-expanded {
  background: rgba(148, 163, 184, 0.05);
}

.is-light .work-row.is-expanded {
  background: #fafafa;
}

.is-paper .work-row:hover {
  background: #ede3d2;
}

.is-paper .work-row.is-expanded {
  background: #fbf7ee;
}

.work-row-main {
  cursor: pointer;
  user-select: none;
}

.work-header {
  display: flex;
  align-items: baseline;
  gap: 16px;
  margin-bottom: 12px;
}

.work-index {
  font-size: 0.9rem;
  font-weight: 800;
  color: var(--text-soft);
  opacity: 0.8;
}

.is-light .work-index {
  opacity: 1;
  color: #52525b;
}

.work-title-wrap {
  flex: 1;
  display: flex;
  align-items: baseline;
  gap: 12px;
  flex-wrap: wrap;
}

.work-title {
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--text-main);
  margin: 0;
  line-height: 1.45;
}

.work-client {
  font-size: 0.85rem;
  color: var(--text-soft);
}

.is-light .work-client {
  color: #52525b;
  font-weight: 550;
}

.work-toggle-btn {
  background: none;
  border: 1px solid var(--panel-border);
  border-radius: 6px;
  color: var(--text-soft);
  padding: 4px 10px;
  font-size: 0.78rem;
  font-family: inherit;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.is-light .work-toggle-btn {
  background: #ffffff;
  border-color: #e4e4e7;
  color: #18181b;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

.work-toggle-btn:hover,
.work-toggle-btn.active {
  color: var(--text-main);
  border-color: var(--text-soft);
  background: var(--item-hover-bg);
}

.is-light .work-toggle-btn:hover,
.is-light .work-toggle-btn.active {
  background: #f4f4f5;
  border-color: #d4d4d8;
  color: #09090b;
}

.toggle-arrow {
  font-size: 0.65rem;
}

.work-tagline {
  font-size: 0.96rem;
  color: var(--text-secondary);
  margin: 0 0 16px 0;
  line-height: 1.75;
}

/* ─── METRICS STRIP: STRICT RTL ORDER (LABEL FIRST, THEN VALUE) ─── */
.work-metrics-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 18px;
  margin-bottom: 16px;
  direction: rtl;
  text-align: right;
}

.metric-pill {
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
  font-size: 0.82rem;
  direction: rtl;
}

.metric-lbl {
  color: var(--text-soft);
  font-weight: 600;
}

.is-light .metric-lbl {
  color: #52525b;
}

.metric-val {
  font-weight: 750;
  color: var(--text-main);
}

.is-light .metric-val {
  color: #09090b;
}

/* ─── TAGS LIST: STRICT RIGHT ALIGNMENT ─── */
.work-tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-start;
  direction: rtl;
}

.work-tag {
  font-size: 0.76rem;
  padding: 3px 8px;
  background: var(--item-hover-bg);
  color: var(--text-soft);
  border-radius: 4px;
  border: 1px solid var(--panel-border);
  font-family: var(--font-mono);
  direction: ltr;
}

.is-light .work-tag {
  background: #f4f4f5;
  border-color: #e4e4e7;
  color: #18181b;
  font-weight: 600;
}

.is-paper .work-tag {
  background: #f4ecdf;
  border-color: #dcd0be;
  color: #49423b;
  font-weight: 600;
}

/* ─── WORK DOSSIER (STRUCTURED ENGINEERING REPORT) ─── */
.work-dossier {
  padding-top: 18px;
  margin-top: 18px;
  border-top: 1px dashed var(--panel-border);
}

.dossier-capsule {
  border-radius: 12px;
  padding: 22px 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  border: 1px solid var(--panel-border);
  background: var(--panel-bg);
}

.is-light .dossier-capsule {
  background: #ffffff;
  border-color: #e4e4e7;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
}

.is-dark .dossier-capsule {
  background: rgba(148, 163, 184, 0.03);
  border-color: var(--panel-border);
}

.is-paper .dossier-capsule {
  background: #fbf7ee;
  border-color: #e2d7c5;
  box-shadow: 0 4px 20px rgba(180, 83, 9, 0.05);
}

@media (max-width: 640px) {
  .dossier-capsule {
    padding: 16px 14px;
  }
}

.dossier-capsule-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--panel-border);
}

.is-light .dossier-capsule-header {
  border-bottom-color: #e4e4e7;
}

.capsule-title {
  font-size: 0.88rem;
  font-weight: 800;
  color: var(--text-main);
}

.is-light .capsule-title {
  color: #09090b;
}

.capsule-period {
  font-size: 0.78rem;
  color: var(--text-soft);
}

.is-light .capsule-period {
  color: #52525b;
}

/* ─── ARCHITECTURE DATA FLOW PIPELINE (VECTOR FLOW) ─── */
.pipeline-stage {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px 14px;
  border-radius: 8px;
  border: 1px solid var(--panel-border);
  overflow-x: auto;
}

.is-light .pipeline-stage {
  background: #f8fafc;
  border-color: #e4e4e7;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.is-dark .pipeline-stage {
  background: rgba(15, 23, 42, 0.45);
  border-color: rgba(148, 163, 184, 0.14);
}

.pipeline-eyebrow {
  font-size: 0.75rem;
  color: var(--text-soft);
  direction: rtl;
  text-align: right;
  font-weight: 600;
}

.is-light .pipeline-eyebrow {
  color: #52525b;
}

.pipeline-track {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 580px;
  padding: 6px 0;
}

@media (max-width: 680px) {
  .pipeline-stage {
    overflow-x: visible;
    padding: 12px 10px;
  }
  .pipeline-track {
    min-width: 0;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    padding: 0;
  }
  .pipeline-node-wrap {
    width: 100%;
    flex: none;
  }
  .pipeline-connector {
    display: none;
  }
  .node-name {
    white-space: normal;
  }
}

.pipeline-node-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.pipeline-node {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px 10px;
  border-radius: 6px;
  background: var(--item-bg);
  border: 1px solid var(--panel-border);
  text-align: left;
}

.is-light .pipeline-node {
  background: #ffffff;
  border-color: #e4e4e7;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.pipeline-node.hw {
  border-color: rgba(245, 158, 11, 0.5);
}

.pipeline-node.engine {
  border-color: rgba(56, 189, 248, 0.5);
}

.pipeline-node.client {
  border-color: rgba(16, 185, 129, 0.5);
}

.pipeline-node.db,
.pipeline-node.queue {
  border-color: rgba(168, 85, 247, 0.5);
}

.is-paper .pipeline-node {
  background: #faf6ee;
  border-color: #dcd0be;
  box-shadow: 0 1px 3px rgba(43, 38, 33, 0.05);
}

.is-paper .pipeline-node.hw {
  border-color: #d97706;
}

.is-paper .pipeline-node.engine {
  border-color: #b45309;
}

.is-paper .pipeline-node.client {
  border-color: #166534;
}

.is-paper .pipeline-node.db,
.is-paper .pipeline-node.queue {
  border-color: #78350f;
}

.node-name {
  font-size: 0.78rem;
  font-weight: 750;
  color: var(--text-main);
  white-space: nowrap;
}

.is-light .node-name {
  color: #09090b;
}

.node-tech {
  font-size: 0.7rem;
  color: var(--text-soft);
}

.is-light .node-tech {
  color: #52525b;
}

.pipeline-connector {
  position: relative;
  width: 28px;
  height: 2px;
  background: var(--panel-border);
  overflow: hidden;
  flex-shrink: 0;
}

.is-light .pipeline-connector {
  background: #e4e4e7;
}

.pulse-beam {
  position: absolute;
  top: 0;
  left: 0;
  width: 12px;
  height: 100%;
  background: #38bdf8;
  box-shadow: 0 0 6px #38bdf8;
  animation: pulseTravel 1.6s infinite ease-in-out;
}

.is-light .pulse-beam {
  background: #2563eb;
  box-shadow: 0 0 8px rgba(37, 99, 235, 0.6);
}

.is-paper .pulse-beam {
  background: #b45309;
  box-shadow: 0 0 6px rgba(180, 83, 9, 0.35);
}

@keyframes pulseTravel {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(250%); }
}

.dossier-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

@media (max-width: 680px) {
  .dossier-grid {
    grid-template-columns: 1fr;
  }
}

.dossier-card {
  padding: 16px 18px;
  border-radius: 8px;
  border: 1px solid var(--panel-border);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.is-light .dossier-card {
  background: #ffffff;
  border-color: #e4e4e7;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.is-dark .dossier-card {
  background: rgba(255, 255, 255, 0.02);
  border-color: var(--panel-border);
}

.card-tag-row {
  display: flex;
  align-items: center;
}

.card-badge {
  font-size: 0.75rem;
  font-weight: 750;
  padding: 2px 8px;
  border-radius: 4px;
}

.challenge-badge {
  background: rgba(239, 68, 68, 0.12);
  color: #ef4444;
}

.approach-badge {
  background: rgba(56, 189, 248, 0.12);
  color: #0284c7;
}

.impact-badge {
  background: rgba(16, 185, 129, 0.12);
  color: #10b981;
}

.is-paper .challenge-badge {
  background: #fdf2f0;
  color: #991b1b;
  border: 1px solid #f8d7da;
}

.is-paper .approach-badge {
  background: #fdf6ec;
  color: #b45309;
  border: 1px solid #fae3c6;
}

.is-paper .impact-badge {
  background: #f0fdf4;
  color: #166534;
  border: 1px solid #bbf7d0;
}

.card-body-text {
  font-size: 0.9rem;
  line-height: 1.85;
  color: var(--text-secondary);
  margin: 0;
}

.is-light .card-body-text {
  color: #27272a;
}

.card-body-text.highlight {
  color: var(--text-main);
  font-weight: 600;
}

.is-light .card-body-text.highlight {
  color: #09090b;
}

.impact-card {
  border-right: 3px solid #10b981;
}

.is-paper .impact-card {
  border-right: 3px solid #166534;
}

/* ─── 04. PRINCIPLES GRID ─── */
.principles-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

@media (max-width: 768px) {
  .principles-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}

.principle-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.principle-num {
  font-size: 0.8rem;
  color: var(--text-soft);
  opacity: 0.7;
}

.is-light .principle-num {
  opacity: 1;
  color: #2563eb;
  font-weight: 800;
}

.is-paper .principle-num {
  opacity: 1;
  color: #b45309;
  font-weight: 800;
}

.principle-title {
  font-size: 1rem;
  font-weight: 750;
  color: var(--text-main);
  margin: 0;
}

.is-light .principle-title {
  color: #09090b;
}

.principle-desc {
  font-size: 0.88rem;
  line-height: 1.85;
  color: var(--text-secondary);
  margin: 0;
}

.is-light .principle-desc {
  color: #27272a;
}

/* ─── 05. CAREER TRAJECTORY ─── */
.trajectory-list {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.trajectory-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.trajectory-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.trajectory-role {
  font-size: 1.05rem;
  font-weight: 750;
  color: var(--text-main);
  margin: 0;
}

.is-light .trajectory-role {
  color: #09090b;
}

.trajectory-period {
  font-size: 0.82rem;
  color: var(--text-soft);
}

.is-light .trajectory-period {
  color: #52525b;
}

.trajectory-company {
  font-size: 0.9rem;
  color: var(--text-soft);
}

.is-light .trajectory-company {
  color: #52525b;
  font-weight: 550;
}

.trajectory-desc {
  font-size: 0.92rem;
  line-height: 1.85;
  color: var(--text-secondary);
  margin: 0;
}

.is-light .trajectory-desc {
  color: #27272a;
}

/* ─── 06. SKILLS MATRIX (CENTERED COLUMNS & BEAUTIFUL BALANCE) ─── */
.skills-domains-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

@media (max-width: 720px) {
  .skills-domains-grid {
    grid-template-columns: 1fr;
    gap: 18px;
  }
}

.skill-domain-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 18px;
  background: rgba(148, 163, 184, 0.03);
  border: 1px solid var(--panel-border);
  border-radius: 12px;
  text-align: center;
}

.is-light .skill-domain-col {
  background: #ffffff;
  border-color: #e4e4e7;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
}

.domain-title {
  font-size: 1rem;
  font-weight: 800;
  color: var(--text-main);
  margin: 0 0 18px 0;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--panel-border);
  width: 100%;
  text-align: center;
}

.is-light .domain-title {
  color: #09090b;
  border-bottom-color: #e4e4e7;
}

.domain-items-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  width: 100%;
}

.domain-item {
  font-size: 0.86rem;
  color: var(--text-secondary);
  padding: 5px 12px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.04);
  border: 1px solid rgba(148, 163, 184, 0.08);
  width: 100%;
  max-width: 220px;
  text-align: center;
  transition: all 0.2s ease;
}

.is-light .domain-item {
  background: #f4f4f5;
  border-color: #e4e4e7;
  color: #18181b;
  font-weight: 550;
}

.domain-item:hover {
  border-color: var(--text-soft);
  color: var(--text-main);
  background: var(--item-hover-bg);
}

.is-light .domain-item:hover {
  background: #e4e4e7;
  color: #09090b;
}

/* ─── 07. CONNECT CHANNELS ─── */
.connect-lead {
  font-size: 0.95rem;
  line-height: 1.85;
  color: var(--text-secondary);
  margin: 0 0 20px 0;
}

.is-light .connect-lead {
  color: #27272a;
}

.connect-channels-list {
  display: flex;
  flex-direction: column;
  border-top: 1px solid var(--panel-border);
}

.is-light .connect-channels-list {
  border-top-color: #e4e4e7;
}

.channel-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 8px;
  border-bottom: 1px solid var(--panel-border);
  text-decoration: none;
  color: inherit;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s ease;
  user-select: none;
}

.is-light .channel-row {
  border-bottom-color: #e4e4e7;
}

.channel-row:hover {
  background: rgba(148, 163, 184, 0.04);
  padding-right: 14px;
  padding-left: 14px;
}

.is-light .channel-row:hover {
  background: #f4f4f5;
}

.channel-label {
  font-size: 0.95rem;
  font-weight: 750;
  color: var(--text-main);
}

.is-light .channel-label {
  color: #09090b;
}

.channel-value-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}

.channel-value {
  font-size: 0.88rem;
  color: var(--text-soft);
  transition: color 0.15s ease;
}

.is-light .channel-value {
  color: #52525b;
}

.channel-row:hover .channel-value {
  color: var(--text-main);
}

.is-light .channel-row:hover .channel-value {
  color: #09090b;
}

.highlight-resume {
  color: var(--text-main) !important;
  font-weight: 750;
}

.is-light .highlight-resume {
  color: #09090b !important;
}

.channel-badge {
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 4px;
  background: var(--item-hover-bg);
  border: 1px solid var(--panel-border);
  color: #10b981;
}

.is-light .channel-badge {
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
  color: #059669;
  font-weight: 600;
}

.channel-arrow {
  font-size: 0.85rem;
  color: var(--text-soft);
  transition: transform 0.2s ease, color 0.2s ease;
}

.channel-row:hover .channel-arrow {
  color: var(--text-main);
  transform: translate(-3px, -3px);
}

/* ─── 08. COLOPHON & FOOTER ─── */
.editorial-colophon {
  margin-top: 60px;
  padding-top: 24px;
  border-top: 1px solid var(--panel-border);
  display: flex;
  flex-direction: column;
  gap: 16px;
  text-align: right;
}

.colophon-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  font-size: 0.8rem;
  color: var(--text-soft);
}

.colophon-city {
  font-size: 0.82rem;
  color: var(--text-soft);
}

/* ─── 03-A. GALLERY BADGE IN PROJECT HEADER ─── */
.work-gallery-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.72rem;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(168, 85, 247, 0.1);
  border: 1px solid rgba(168, 85, 247, 0.28);
  color: #c084fc;
}

.is-light .work-gallery-badge {
  background: #f1f5f9;
  border-color: #cbd5e1;
  color: #2563eb;
}

.is-paper .work-gallery-badge {
  background: #ede0cf;
  border-color: #d6c6af;
  color: #92400e;
}

/* ─── 03-B. SCROLL-DRIVEN STICKY PHONE SHOWCASE (IN-DOSSIER) ─── */
.scroll-driven-gallery-wrapper {
  position: relative;
  /* On desktop: expanded scroll height creates the scrolling travel distance */
  min-height: 220vh;
  margin: 12px 0 24px;
}

@media (max-width: 768px) {
  .scroll-driven-gallery-wrapper {
    min-height: 260vh;
    margin: 8px 0 20px;
  }
}

.sticky-gallery-frame {
  position: -webkit-sticky;
  position: sticky;
  top: clamp(30px, 4.5vh, 48px);
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px 20px;
  border-radius: 14px;
  border: 1px solid var(--panel-border);
  background: var(--panel-bg);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  z-index: 10;
  box-sizing: border-box;
  max-height: calc(100vh - 80px);
}

.is-light .sticky-gallery-frame {
  background: #ffffff;
  border-color: #e2e8f0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.is-dark .sticky-gallery-frame {
  background: rgba(15, 23, 42, 0.75);
  border-color: rgba(148, 163, 184, 0.16);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
}

.is-paper .sticky-gallery-frame {
  background: #fbf7ee;
  border-color: #e2d7c5;
  box-shadow: 0 6px 24px rgba(180, 83, 9, 0.07);
}

@media (max-width: 768px) {
  .sticky-gallery-frame {
    position: -webkit-sticky;
    position: sticky;
    top: clamp(8px, 1.5vh, 20px);
    max-height: calc(100vh - 16px);
    padding: 12px 10px;
    gap: 8px;
  }
}

.gallery-control-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.gallery-control-title-wrap {
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: right;
}

.gallery-eyebrow-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.72rem;
  color: var(--text-soft);
}

.is-light .gallery-eyebrow-pill {
  color: #64748b;
}

.pulse-indicator-small {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #38bdf8;
  box-shadow: 0 0 6px rgba(56, 189, 248, 0.6);
}

.is-paper .pulse-indicator-small {
  background: #b45309;
  box-shadow: 0 0 6px rgba(180, 83, 9, 0.4);
}

.gallery-control-heading {
  font-size: 0.96rem;
  font-weight: 800;
  color: var(--text-main);
  margin: 0;
}

.is-light .gallery-control-heading {
  color: #0f172a;
}

.gallery-slide-pills {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.03);
  padding: 3px 4px;
  border-radius: 8px;
  border: 1px solid var(--panel-border);
}

.is-light .gallery-slide-pills {
  background: #f1f5f9;
  border-color: #e2e8f0;
}

.slide-pill-btn {
  background: transparent;
  border: none;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.74rem;
  font-family: inherit;
  color: var(--text-soft);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  transition: all 0.2s ease;
}

.is-light .slide-pill-btn {
  color: #64748b;
}

.slide-pill-btn:hover {
  color: var(--text-main);
}

.slide-pill-btn.active {
  background: var(--item-hover-bg);
  color: var(--text-main);
  font-weight: 750;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
}

.is-light .slide-pill-btn.active {
  background: #ffffff;
  color: #0f172a;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.pill-badge-label {
  font-size: 0.68rem;
  opacity: 0.85;
}

@media (max-width: 580px) {
  .pill-badge-label {
    display: none;
  }
}

.gallery-progress-line-track {
  width: 100%;
  height: 3px;
  background: var(--panel-border);
  border-radius: 2px;
  overflow: hidden;
}

.is-light .gallery-progress-line-track {
  background: #e2e8f0;
}

.gallery-progress-line-fill {
  height: 100%;
  background: linear-gradient(to left, #38bdf8, #818cf8);
  border-radius: 2px;
  transition: width 0.08s linear;
}

.is-light .gallery-progress-line-fill {
  background: linear-gradient(to left, #0284c7, #4f46e5);
}

.is-paper .gallery-progress-line-track {
  background: #e6dcce;
}

.is-paper .gallery-progress-line-fill {
  background: linear-gradient(to left, #b45309, #d97706);
}

/* Horizontal Track Viewport: Strict Persian RTL */
.phone-track-viewport {
  width: 100%;
  overflow: hidden;
  position: relative;
  padding: 10px 4px 16px;
  direction: rtl; /* Strict Persian RTL coordinate system */
}

@media (max-width: 768px) {
  .phone-track-viewport {
    overflow: hidden;
    padding: 6px 0 10px;
  }
}

.phone-track {
  display: flex;
  align-items: flex-start;
  gap: 24px;
  width: max-content;
  direction: rtl;
  will-change: transform;
  transition: transform 0.08s cubic-bezier(0.16, 1, 0.3, 1);
}

@media (max-width: 768px) {
  .phone-track {
    gap: 16px;
    padding: 0 calc((100% - clamp(170px, 54vw, 210px)) / 2);
  }
}

.phone-mockup-card {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: clamp(145px, 17vw, 180px);
  cursor: pointer;
  scroll-snap-align: center;
  transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.28s ease, filter 0.28s ease;
  opacity: 0.78;
}

@media (max-width: 768px) {
  .phone-mockup-card {
    width: clamp(170px, 54vw, 210px);
    max-width: 210px;
    opacity: 0.45;
    transition: transform 0.25s ease, opacity 0.25s ease;
  }
}

.phone-mockup-card:hover,
.phone-mockup-card.is-active-slide {
  opacity: 1;
  transform: translateY(-4px) scale(1.02);
}

/* Realistic Phone Device Shell */
.phone-device-shell {
  position: relative;
  height: clamp(245px, 33vh, 320px);
  aspect-ratio: 9 / 19.5;
  width: auto;
  margin: 0 auto;
  border-radius: 26px;
  padding: 6px;
  box-sizing: border-box;
  background: #090d16;
  border: 2px solid rgba(255, 255, 255, 0.14);
  box-shadow: 0 14px 30px -8px rgba(0, 0, 0, 0.55), inset 0 0 0 1px rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.is-light .phone-device-shell {
  background: #ffffff;
  border-color: #cbd5e1;
  box-shadow: 0 12px 28px -6px rgba(0, 0, 0, 0.1), inset 0 0 0 1px rgba(0, 0, 0, 0.04);
}

.is-paper .phone-device-shell {
  background: #fbf7ee;
  border-color: #d6c6af;
  box-shadow: 0 12px 28px -6px rgba(43, 38, 33, 0.12), inset 0 0 0 1px rgba(43, 38, 33, 0.04);
}

@media (max-width: 768px) {
  .phone-device-shell {
    height: clamp(230px, 34vh, 280px);
    aspect-ratio: 9 / 19.5;
    width: auto;
    border-radius: 22px;
    padding: 5px;
  }
}

.phone-mockup-card.is-active-slide .phone-device-shell {
  border-color: rgba(56, 189, 248, 0.6);
  box-shadow: 0 16px 36px -6px rgba(56, 189, 248, 0.22), inset 0 0 0 1px rgba(56, 189, 248, 0.3);
}

.is-light .phone-mockup-card.is-active-slide .phone-device-shell {
  border-color: #0284c7;
  box-shadow: 0 14px 30px -6px rgba(2, 132, 199, 0.18), inset 0 0 0 1px rgba(2, 132, 199, 0.2);
}

.is-paper .phone-mockup-card.is-active-slide .phone-device-shell {
  border-color: #b45309;
  box-shadow: 0 14px 30px -6px rgba(180, 83, 9, 0.2), inset 0 0 0 1px rgba(180, 83, 9, 0.25);
}

/* Phone Top Dynamic Notch */
.phone-notch {
  position: absolute;
  top: 9px;
  left: 50%;
  transform: translateX(-50%);
  width: 44px;
  height: 5px;
  background: #000000;
  border-radius: 999px;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  pointer-events: none;
}

.notch-speaker {
  width: 18px;
  height: 2px;
  background: #1e293b;
  border-radius: 2px;
}

.is-light .notch-speaker {
  background: #334155;
}

.notch-camera {
  width: 2.5px;
  height: 2.5px;
  background: #0284c7;
  border-radius: 50%;
  opacity: 0.7;
}

/* Screen */
.phone-screen {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 20px;
  overflow: hidden;
  background: #000000;
}

.phone-screen-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.phone-mockup-card:hover .phone-screen-img {
  transform: scale(1.03);
}

.phone-glass-reflection {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.12) 0%,
    rgba(255, 255, 255, 0.03) 40%,
    transparent 65%
  );
  pointer-events: none;
  border-radius: 20px;
}

.phone-hover-overlay {
  position: absolute;
  inset: 0;
  background: rgba(10, 15, 26, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
  backdrop-filter: blur(2px);
}

.phone-mockup-card:hover .phone-hover-overlay {
  opacity: 1;
}

.zoom-chip {
  font-size: 0.72rem;
  padding: 5px 12px;
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 999px;
  color: #fff;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
}

/* Info Caption Block */
.phone-info-block {
  display: flex;
  flex-direction: column;
  gap: 3px;
  text-align: right;
  padding: 0 4px;
  direction: rtl;
}

.phone-info-badge-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}

.phone-badge {
  font-size: 0.65rem;
  color: #38bdf8;
  font-weight: 700;
}

.is-light .phone-badge {
  color: #0284c7;
}

.is-paper .phone-badge {
  color: #b45309;
}

.phone-index {
  font-size: 0.65rem;
  color: var(--text-soft);
}

.phone-info-title {
  font-size: 0.78rem;
  font-weight: 750;
  color: var(--text-main);
  margin: 0;
  line-height: 1.35;
}

.is-light .phone-info-title {
  color: #0f172a;
}

.is-paper .phone-info-title {
  color: #2b2621;
}

.phone-info-caption {
  font-size: 0.7rem;
  color: var(--text-soft);
  margin: 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.is-light .phone-info-caption {
  color: #475569;
}

.is-paper .phone-info-caption {
  color: #786e64;
}

/* Footer Hint */
.gallery-scroll-hint-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-top: 6px;
  border-top: 1px dashed var(--panel-border);
  font-size: 0.74rem;
  color: var(--text-soft);
}

.is-light .gallery-scroll-hint-row {
  border-top-color: #e2e8f0;
  color: #64748b;
}

.scroll-counter-pill {
  font-weight: 700;
  color: var(--text-main);
}

.is-light .scroll-counter-pill {
  color: #0f172a;
}

/* ─── 03-C. FULLSCREEN LIGHTBOX MODAL ─── */
.lightbox-backdrop {
  position: fixed;
  inset: 0;
  z-index: 100000;
  background: rgba(4, 7, 13, 0.92);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.lightbox-shell {
  max-width: 1080px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 14px;
  max-height: 94vh;
}

.lightbox-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  direction: rtl;
}

.lightbox-breadcrumbs {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.84rem;
  color: var(--text-soft);
  flex-wrap: wrap;
}

.lightbox-proj-title {
  font-weight: 750;
  color: #fff;
}

.lightbox-sep {
  opacity: 0.4;
}

.lightbox-dev-badge {
  padding: 2px 8px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.08);
  color: #38bdf8;
  font-size: 0.74rem;
}

.lightbox-count {
  font-size: 0.76rem;
  color: var(--text-soft);
}

.lightbox-close-btn {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  color: #fff;
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.lightbox-close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

.lightbox-stage {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  position: relative;
  flex: 1;
  min-height: 200px;
}

.lightbox-nav-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 999px;
  width: 48px;
  height: 48px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 1.6rem;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
  user-select: none;
}

.lightbox-nav-btn:hover {
  background: rgba(255, 255, 255, 0.24);
  transform: scale(1.08);
}

.lightbox-img-box {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  max-height: 72vh;
  overflow: hidden;
}

.lightbox-img {
  max-width: 100%;
  max-height: 72vh;
  object-fit: contain;
  border-radius: 12px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.lightbox-footer {
  direction: rtl;
  text-align: right;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.lightbox-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.lightbox-title {
  font-size: 0.95rem;
  font-weight: 750;
  color: #fff;
  margin: 0;
}

.lightbox-nav-helpers {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.78rem;
}

.helper-btn {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.14);
  color: #fff;
  border-radius: 6px;
  padding: 2px 10px;
  font-family: inherit;
  font-size: 0.76rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.helper-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.helper-sep {
  opacity: 0.4;
  color: #fff;
}

.lightbox-desc {
  font-size: 0.84rem;
  color: rgba(255, 255, 255, 0.72);
  margin: 0;
  line-height: 1.7;
}

/* Lightbox Fade Transition */
.lightbox-fade-enter-active,
.lightbox-fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.lightbox-fade-enter-from,
.lightbox-fade-leave-to {
  opacity: 0;
}

/* ─── TRANSITIONS ─── */
.expand-dossier-enter-active,
.expand-dossier-leave-active {
  transition: all 0.28s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
}

.expand-dossier-enter-from,
.expand-dossier-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* Architecture Switcher Row */
.arch-tab-switcher-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 18px 0 8px;
  flex-wrap: wrap;
}

.arch-tab-pill-btn {
  background: var(--item-bg);
  border: 1px solid var(--panel-border);
  border-radius: 999px;
  padding: 8px 18px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--text-soft);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  font-family: inherit;
  user-select: none;
}

.arch-tab-pill-btn:hover {
  color: var(--text-main);
  border-color: var(--text-soft);
  transform: translateY(-1px);
}

.arch-tab-pill-btn.active {
  background: var(--neon);
  border-color: var(--neon);
  color: #ffffff;
  box-shadow: 0 4px 14px rgba(56, 189, 248, 0.3);
}

.is-light .arch-tab-pill-btn.active {
  background: #2563eb;
  border-color: #2563eb;
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
}

.is-paper .arch-tab-pill-btn.active {
  background: #b45309;
  border-color: #b45309;
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(180, 83, 9, 0.25);
}

.tab-idx {
  font-size: 0.72rem;
  opacity: 0.85;
}

.colophon-signature-row {
  display: flex;
  justify-content: center;
  align-items: center;
  padding-bottom: 12px;
}
</style>

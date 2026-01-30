<script setup>
import { ref, onMounted, computed, onUnmounted, nextTick } from 'vue';
import { marked } from 'marked'; // ایمپورت کتابخانه مارک‌داون
import CustomCursor from './components/CustomCursor.vue'; 
import CyberParticles from './components/CyberParticles.vue';
import MatrixRain from './components/MatrixRain.vue';
import TerminalModal from './components/TerminalModal.vue';
import ContextMenu from './components/ContextMenu.vue';
import BootSequence from './components/BootSequence.vue';

const appVersion = 'v1.2.1';

const showBoot = ref(true);
const isBooted = ref(false);
const handleBootComplete = () => { showBoot.value = false; setTimeout(() => isBooted.value = true, 100); };

// --- تنظیمات مارک‌داون ---
const renderer = new marked.Renderer();
renderer.code = ({ text, lang }) => {
  return `<pre class="code-block" dir="ltr"><code>${text}</code></pre>`;
};
renderer.link = ({ href, title, text }) => {
  return `<a href="${href}" target="_blank" title="${title || ''}">${text}</a>`;
};

marked.setOptions({
  renderer: renderer,
  gfm: true,
  breaks: true
});

const parseMarkdown = (text) => {
  if (!text) return '';
  return marked(text);
};

// --- مدیریت تم ---
const themes = [
  { name: 'Matrix Green', color: '#67FF64', bg: 'rgba(103, 255, 100, 0.03)' },
  { name: 'Cyber Blue',   color: '#00f3ff', bg: 'rgba(0, 243, 255, 0.03)' },
  { name: 'Crimson Red',  color: '#ff0055', bg: 'rgba(255, 0, 85, 0.03)' },
  { name: 'Synth Purple', color: '#bc13fe', bg: 'rgba(188, 19, 254, 0.03)' },
];
const currentThemeIndex = ref(0);
const currentThemeColor = ref(themes[0].color);

const toggleTheme = () => {
  currentThemeIndex.value = (currentThemeIndex.value + 1) % themes.length;
  const theme = themes[currentThemeIndex.value];
  currentThemeColor.value = theme.color;
  document.documentElement.style.setProperty('--neon', theme.color);
  document.documentElement.style.setProperty('--glass-panel', `linear-gradient(145deg, rgba(20,20,20,0.9), ${theme.bg})`);
};

// --- اطلاعات کاربر ---
const userGithub = 'AlirezaLotfiM';
const myEmail = 'Lotfi.moghaddam.alireza@gmail.com';
const myLinkedin = 'https://linkedin.com/in/alireza-lotfi-moghaddam-378a8018a';
const myTelegram = 'https://t.me/YourTelegramID';
const myTelegramID = '@YourID';

// --- تایپ‌نویس ---
const typeText = ref('');
const titles = ["Software Engineer", ".NET & Desktop Developer", "Database Enthusiast", "Backend Developer"];
let typeIndex = 0; let charIndex = 0; let isDeleting = false; let typeTimeout = null;

const typeWriter = () => {
  const currentWord = titles[typeIndex];
  if (isDeleting) { typeText.value = currentWord.substring(0, charIndex - 1); charIndex--; } 
  else { typeText.value = currentWord.substring(0, charIndex + 1); charIndex++; }
  let typeSpeed = isDeleting ? 50 : 100;
  if (!isDeleting && charIndex === currentWord.length) { typeSpeed = 2000; isDeleting = true; } 
  else if (isDeleting && charIndex === 0) { isDeleting = false; typeIndex = (typeIndex + 1) % titles.length; typeSpeed = 500; }
  typeTimeout = setTimeout(typeWriter, typeSpeed);
};

// --- دیتا ---
const activeTab = ref('projects');
const activeFilter = ref('All');
const projects = ref([]);
const notes = ref([]);
const loading = ref(true);
const selectedNote = ref(null); 
const noteComments = ref([]);   
const loadingComments = ref(false);
const isMatrixMode = ref(false);
const showTerminal = ref(false);
const isZenMode = ref(false);
const contextMenu = ref({ visible: false, x: 0, y: 0 });
const copiedTooltip = ref(null);
const shareTooltip = ref('کپی لینک');

const mySkills = ref([
  { name: 'C# .NET', level: 85 }, { name: 'WPF & WinForms', level: 80 }, { name: 'SQL Server', level: 65 },     
  { name: 'ASP.NET Core', level: 70 }, { name: 'Entity Framework', level: 75 }, { name: 'Vue.js', level: 35 },         
  { name: 'System Design', level: 30 }, { name: 'Git', level: 60 },
]);

const interests = ref([
  { title: 'Distributed Systems', icon: '🌐', desc: 'شیفته‌ی چالش‌های همگام‌سازی، معماری میکروسرویس و الگوهای Event-Driven.' },
  { title: 'High-Performance DB', icon: '⚡', desc: 'لذت بردن از Tuning کوئری‌های SQL و طراحی ساختارهای داده‌ای بهینه در Redis.' },
  { title: 'OS Internals & Memory', icon: '🧠', desc: 'علاقه به درک عمیق مدیریت حافظه، Threading و نحوه کارکرد سیستم‌عامل (Windows).' },
  { title: 'Automated DevOps', icon: '🚀', desc: 'ساخت پایپ‌لاین‌های CI/CD و کانتینرایز کردن سرویس‌ها برای استقرار بی‌دردسر.' },
]);

const roadmapItems = ref([
  { title: 'Desktop Mastery (WPF/WinForms)', status: 'done', desc: 'توسعه نرم‌افزارهای دسکتاپ پیچیده و سازمانی با C# و تسلط بر چرخه حیات ویندوز.' },
  { title: 'Advanced ASP.NET Core', status: 'progress', desc: 'عمیق شدن در تزریق وابستگی (DI)، میدل‌ورها و تست‌نویسی (xUnit) برای استانداردسازی بکند.' },
  { title: 'Microservices & RabbitMQ', status: 'progress', desc: 'پیاده‌سازی الگوهای توزیع‌شده (CQRS, Saga) و مدیریت صف‌ها در پروژه NexusQueue.' },
  { title: 'High Performance Database', status: 'todo', desc: 'بهینه‌سازی پیشرفته SQL، ایندکس‌گذاری، مدیریت تراکنش‌ها و استفاده از Redis برای کشینگ.' },
  { title: 'DevOps & CI/CD', status: 'todo', desc: 'کانتینرسازی سرویس‌ها با Docker، پایپ‌لاین‌های GitHub Actions و مقدمات Kubernetes.' }
]);

const toPersianDigits = (num) => { const id = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']; return num.toString().replace(/[0-9]/g, (w) => id[+w]); };

const copyToClipboard = (text, type) => { navigator.clipboard.writeText(text); copiedTooltip.value = type; setTimeout(() => { copiedTooltip.value = null; }, 2000); };

const shareNote = () => {
  if (!selectedNote.value) return;
  navigator.clipboard.writeText(selectedNote.value.html_url);
  shareTooltip.value = 'لینک کپی شد! ✅';
  setTimeout(() => { shareTooltip.value = 'کپی لینک'; }, 2000);
};

const experienceYears = computed(() => { const startDate = new Date('2020-08-22'); const now = new Date(); let years = now.getFullYear() - startDate.getFullYear(); if (now.getMonth() < startDate.getMonth()) years--; return toPersianDigits(`+${years}`); });
const getLangColor = (lang) => { if (!lang) return '#888'; const colors = { 'C#': '#178600', 'Vue': '#41b883', 'JavaScript': '#f1e05a', 'HTML': '#e34c26', 'CSS': '#563d7c', 'Python': '#3572A5' }; return colors[lang] || currentThemeColor.value; };

const fetchData = async () => {
  try {
    const [repoRes, noteRes] = await Promise.all([ fetch(`https://api.github.com/users/${userGithub}/repos?sort=updated`), fetch(`https://api.github.com/repos/${userGithub}/${userGithub}.github.io/issues?state=open`) ]);
    const repos = await repoRes.json(); const issues = await noteRes.json();
    let githubProjects = Array.isArray(repos) ? repos.filter(r => !r.fork).slice(0, 6) : [];
    const manualProjects = [ { id: 101, name: 'سامانه مانیتورینگ بانک ملت', language: 'C#', description: 'مانیتورینگ نوبت‌دهی آنلاین (Windows App/Backend).', html_url: '#', isPrivate: true }, { id: 102, name: 'سامانه آموزش بیودارو', language: 'Vue', description: 'فول‌اسک (NET Core + SQL + Vue). پنل آزمون پرسنل.', html_url: '#', isPrivate: true }, { id: 103, name: 'Nexus Queue System', language: 'Concept', description: 'ایده‌پردازی و طراحی اولیه معماری سیستم نوبت‌دهی توزیع‌شده.', html_url: '#', isPrivate: true } ];
    projects.value = [...manualProjects, ...githubProjects]; notes.value = Array.isArray(issues) ? issues : [];
  } catch(e) {} loading.value = false;
};

const openNote = async (note) => { selectedNote.value = note; loadingComments.value = true; noteComments.value = []; try { if (note.comments > 0) { const res = await fetch(note.comments_url); if (res.ok) noteComments.value = await res.json(); } } catch (e) {} loadingComments.value = false; };
const closeNote = () => { selectedNote.value = null; noteComments.value = []; isZenMode.value = false; };

const availableLanguages = computed(() => { const langs = new Set(projects.value.map(p => p.language).filter(Boolean)); return ['All', ...langs]; });
const filteredProjects = computed(() => { if (activeFilter.value === 'All') return projects.value; return projects.value.filter(p => p.language === activeFilter.value); });

const onContextMenu = (e) => { e.preventDefault(); contextMenu.value = { visible: true, x: e.clientX, y: e.clientY }; };
const handleMenuAction = (action) => { contextMenu.value.visible = false; if (action === 'terminal') showTerminal.value = true; if (action === 'matrix') isMatrixMode.value = !isMatrixMode.value; if (action === 'source') window.open(`https://github.com/${userGithub}`, '_blank'); if (action === 'email') navigator.clipboard.writeText(myEmail); };
const handleKeydown = (e) => { 
  if (e.ctrlKey && e.key === 'k') { e.preventDefault(); showTerminal.value = !showTerminal.value; }
  if (e.ctrlKey && e.key === 'z' && selectedNote.value) { e.preventDefault(); isZenMode.value = !isZenMode.value; }
};
const handleMouseMove = (e) => { if (window.innerWidth < 768) return; const cards = document.querySelectorAll('.spotlight-card'); cards.forEach(card => { const rect = card.getBoundingClientRect(); card.style.setProperty('--x', `${e.clientX - rect.left}px`); card.style.setProperty('--y', `${e.clientY - rect.top}px`); }); };
const handleCardTilt = (e) => { if (window.innerWidth < 768) return; const card = e.currentTarget; const rect = card.getBoundingClientRect(); const x = e.clientX - rect.left; y = e.clientY - rect.top; const centerX = rect.width / 2; const centerY = rect.height / 2; const rotateX = ((y - centerY) / centerY) * -5; const rotateY = ((x - centerX) / centerX) * 5; card.style.setProperty('--rx', `${rotateX}deg`); card.style.setProperty('--ry', `${rotateY}deg`); };
const resetCard = (e) => { const card = e.currentTarget; card.style.setProperty('--rx', `0deg`); card.style.setProperty('--ry', `0deg`); card.style.setProperty('--x', `-1000px`); };

onMounted(() => { fetchData(); typeWriter(); window.addEventListener('keydown', handleKeydown); document.addEventListener('contextmenu', onContextMenu); });
onUnmounted(() => { clearTimeout(typeTimeout); window.removeEventListener('keydown', handleKeydown); document.removeEventListener('contextmenu', onContextMenu); });

</script>

<template>
  <CustomCursor />
  <Transition name="fade"><BootSequence v-if="showBoot" @completed="handleBootComplete" /></Transition>

  <div v-show="!showBoot" class="main-wrapper" :class="{ 'fade-in-enter': isBooted }">
    <Transition name="fade">
      <component :is="isMatrixMode ? MatrixRain : CyberParticles" :color="currentThemeColor" :key="currentThemeColor" />
    </Transition>
    
    <TerminalModal :visible="showTerminal" :projects="projects" @close="showTerminal = false" />
    <ContextMenu :visible="contextMenu.visible" :x="contextMenu.x" :y="contextMenu.y" @action="handleMenuAction" @close="contextMenu.visible = false" />
    
    <div class="dashboard" @mousemove="handleMouseMove" :class="{ 'zen-mode': isZenMode }">
      <div class="layout-grid" :class="{ 'zen-active': isZenMode }">
        
        <aside class="col-profile">
          <div class="glass-panel profile-box spotlight-card" @mousemove="handleCardTilt" @mouseleave="resetCard">
            <div class="spotlight-bg"></div>
            <div class="profile-header">
              <div class="avatar-glow"><img :src="`https://github.com/${userGithub}.png`" alt="Avatar"></div>
              <div class="profile-texts">
                <h1>علیرضا لطفی‌مقدم</h1>
                <p class="role"><span class="typewriter">{{ typeText }}</span><span class="cursor">|</span></p>
                <p class="role-sub">Software Expert</p>
              </div>
            </div>
            
            <div class="action-buttons">
              <button class="terminal-toggle" @click="showTerminal = true" title="Ctrl + K">_CMD ></button>
              <a href="/MyResume.pdf" download class="resume-btn" title="دانلود رزومه">📄 PDF</a>
            </div>

            <div class="bio-short">توسعه‌دهنده با تجربه در C#، دیتابیس و سیستم‌های سازمانی. در حال یادگیری معماری‌های توزیع‌شده.</div>
            <div class="stats-row"><div class="stat"><strong>{{ experienceYears }}</strong><span>سال تجربه</span></div><div class="sep"></div><div class="stat"><strong>{{ toPersianDigits(`+${projects.length}`) }}</strong><span>پروژه</span></div></div>
            
            <div class="contact-grid">
              <div class="contact-wrapper">
                <button class="contact-btn email" @click="handleCopy(myEmail, $event, 'کپی ایمیل')" aria-label="Email">
                  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                </button>
                <div class="tooltip-box"><span class="label">ایمیل</span><button class="copy-btn" @click.prevent="copyToClipboard(myEmail, 'email')">{{ copiedTooltip === 'email' ? 'کپی شد! ✅' : 'کپی آدرس' }}</button></div>
              </div>
              <div class="contact-wrapper">
                <a :href="myLinkedin" target="_blank" class="contact-btn linkedin" aria-label="LinkedIn">
                  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
                </a>
                <div class="tooltip-box"><span class="label">لینکدین</span><button class="copy-btn" @click.prevent="copyToClipboard(myLinkedin, 'linkedin')">{{ copiedTooltip === 'linkedin' ? 'کپی لینک! ✅' : 'کپی لینک' }}</button></div>
              </div>
              <div class="contact-wrapper">
                <a :href="myTelegram" target="_blank" class="contact-btn telegram" aria-label="Telegram">
                  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
                </a>
                <div class="tooltip-box"><span class="label">تلگرام</span><button class="copy-btn" @click.prevent="copyToClipboard(myTelegramID, 'telegram')">{{ copiedTooltip === 'telegram' ? 'کپی شد! ✅' : 'کپی ID' }}</button></div>
              </div>
              <div class="contact-wrapper">
                <a :href="`https://github.com/${userGithub}`" target="_blank" class="contact-btn github" aria-label="GitHub">
                  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
                </a>
                <div class="tooltip-box"><span class="label">گیت‌هاب</span></div>
              </div>
            </div>
          </div>
        </aside>

        <main class="col-main glass-panel main-box">
          <div class="tabs-header" :class="{ 'hidden': isZenMode }">
            <div class="main-tabs">
              <button @click="selectedNote ? closeNote() : activeTab='projects'" :class="{active: !selectedNote && activeTab==='projects'}">پروژه‌ها</button>
              <button @click="selectedNote ? closeNote() : activeTab='interests'" :class="{active: !selectedNote && activeTab==='interests'}">علاقه‌مندی</button>
              <button @click="selectedNote ? closeNote() : activeTab='roadmap'" :class="{active: !selectedNote && activeTab==='roadmap'}">مسیر من</button>
              <button @click="activeTab='notes'" :class="{active: activeTab==='notes' || selectedNote}">یادداشت</button>
            </div>
            
            <div class="header-controls">
              <div v-if="activeTab==='projects' && !selectedNote" class="project-controls">
                
                <div class="controls-left">
                  <div class="filter-chips">
                    <button v-for="lang in availableLanguages" :key="lang" @click="activeFilter = lang" :class="{ 'active-filter': activeFilter === lang }" class="filter-btn">
                      {{ lang === 'All' ? 'همه' : lang }}
                    </button>
                  </div>
                </div>

                <div class="controls-right">
                  <button @click="toggleTheme" class="icon-btn theme-btn" title="تغییر رنگ تم">🎨</button>
                </div>

              </div>
            </div>
          </div>

          <div class="content-body">
            <div v-if="loading" class="loading"><div class="spinner"></div></div>
            <Transition name="fade-slide" mode="out-in">
              <div v-if="selectedNote" class="thread-view" key="thread">
                <div class="thread-header">
                  <div class="note-meta">
                    <h3>{{ selectedNote.title }}</h3>
                    <span class="post-date">{{ new Date(selectedNote.created_at).toLocaleDateString('fa-IR') }}</span>
                  </div>
                  <div class="header-left">
                    <button @click="shareNote" class="icon-btn share-btn" :title="shareTooltip">🔗</button>
                    <button @click="isZenMode = !isZenMode" class="icon-btn zen-btn" :class="{ active: isZenMode }" :title="isZenMode ? 'خروج از تمرکز' : 'حالت تمرکز'">{{ isZenMode ? '✕' : '👁️' }}</button>
                    <button @click="closeNote" class="back-btn">➜ بازگشت</button>
                  </div>
                </div>
                <div class="thread-content scroll-area">
                  <div class="content-block main-post"><div class="block-body" v-html="parseMarkdown(selectedNote.body)"></div></div>
                  <div v-if="noteComments.length > 0" class="update-separator"><span>بروزرسانی‌ها</span></div>
                  <div v-if="loadingComments" class="loading-bubble">در حال دریافت...</div>
                  <div v-for="comment in noteComments" :key="comment.id" class="content-block update-post"><div class="update-header"><span class="update-badge">UPDATE</span><span class="update-date">{{ new Date(comment.created_at).toLocaleDateString('fa-IR') }}</span></div><div class="block-body" v-html="parseMarkdown(comment.body)"></div></div>
                </div>
              </div>

              <div v-else-if="!loading && activeTab==='projects'" class="grid-list" key="projects">
                <a v-for="p in filteredProjects" :key="p.id" :href="p.html_url" :target="p.html_url === '#' ? '' : '_blank'" class="grid-item spotlight-card" @mousemove="handleCardTilt" @mouseleave="resetCard"><div class="spotlight-bg"></div><div class="card-head"><span class="folder-icon">{{ p.isPrivate ? '🔒' : '📂' }}</span><span class="lang-capsule" v-if="p.language" :style="{ borderColor: getLangColor(p.language), color: getLangColor(p.language), background: getLangColor(p.language) + '15' }"><span class="dot" :style="{ background: getLangColor(p.language) }"></span>{{ p.language }}</span></div><h4>{{ p.name }}</h4><p>{{ p.description }}</p><div class="card-footer"><span class="arrow-link">{{ p.isPrivate ? 'پروژه سازمانی' : 'مشاهده سورس' }} &larr;</span></div></a>
                <div v-if="filteredProjects.length === 0" class="empty-state">پروژه‌ای یافت نشد.</div>
              </div>
              <div v-else-if="!loading && activeTab==='interests'" class="interests-grid" key="interests">
                <div v-for="(item, index) in interests" :key="index" class="interest-card spotlight-card" @mousemove="handleCardTilt" @mouseleave="resetCard"><div class="spotlight-bg"></div><div class="interest-icon">{{ item.icon }}</div><h4>{{ item.title }}</h4><p>{{ item.desc }}</p></div>
              </div>
              <div v-else-if="!loading && activeTab==='roadmap'" class="roadmap-list" key="roadmap">
                <div v-for="(step, index) in roadmapItems" :key="index" class="roadmap-item spotlight-card" :class="step.status" @mousemove="handleCardTilt" @mouseleave="resetCard"><div class="spotlight-bg"></div><div class="step-line"></div><div class="step-dot"></div><div class="step-content"><h4>{{ step.title }}</h4><p>{{ step.desc }}</p><span class="status-badge">{{ step.status === 'done' ? 'انجام شده ✅' : step.status === 'progress' ? 'در حال کار 🚧' : 'در برنامه 📅' }}</span></div></div>
              </div>
              <div v-else-if="!loading && activeTab==='notes'" class="notes-list" key="notes">
                <div v-for="n in notes" :key="n.id" class="note-row spotlight-card" @click="openNote(n)" @mousemove="handleCardTilt" @mouseleave="resetCard" style="cursor: pointer;"><div class="spotlight-bg"></div><div class="note-inner"><div class="note-head"><h4><span class="note-icon">📝</span> {{ n.title }}</h4></div><p class="note-preview">{{ n.body ? n.body.substring(0, 140) + (n.body.length > 140 ? '...' : '') : 'بدون توضیحات...' }}</p><div class="note-footer"><span class="date">{{ new Date(n.created_at).toLocaleDateString('fa-IR') }}</span><span class="read-btn">بخوانید &larr;</span></div></div></div>
                <div v-if="notes.length === 0" class="empty-state"><p>هنوز یادداشتی منتشر نشده است.</p></div>
              </div>
            </Transition>
          </div>
        </main>

        <aside class="col-skills glass-panel skills-box">
          <div class="panel-header"><h3>مهارت‌ها</h3></div>
          <div class="rack-container scroll-area">
            <div v-for="skill in mySkills" :key="skill.name" class="rack-slot">
              <div class="rack-info"><span class="rack-name">{{ skill.name }}</span><span class="rack-percent">{{ toPersianDigits(skill.level) }}٪</span></div>
              <div class="rack-bar-bg"><div class="rack-bar-fill" :style="{ width: skill.level + '%' }"><div class="scan-line"></div></div><div class="rack-grid-lines"></div></div>
            </div>
          </div>
        </aside>
      </div>
      <footer class="app-footer">
        <span class="made-by">Handcrafted by <strong style="color:var(--neon)">Alireza</strong></span>
        <span class="divider">|</span>
        <span class="version-tag">{{ appVersion }}</span> <span class="divider">|</span>
        <span class="ai-credit">Co-piloted by <span class="gemini-text">Gemini</span></span>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.version-tag { font-family: monospace; background: rgba(255, 255, 255, 0.05); padding: 2px 6px; border-radius: 4px; color: var(--text-muted); font-size: 0.75rem; border: 1px solid rgba(255, 255, 255, 0.1); }
:global(button), :global(input), :global(textarea) { font-family: 'Vazirmatn', sans-serif !important; }
:global(::selection), :global(::-moz-selection) { background: var(--neon); color: #000; text-shadow: none; }
.dashboard { height: 100vh; width: 100vw; overflow: hidden; display: flex; flex-direction: column; padding: 25px; box-sizing: border-box; transition: 0.3s; }
.dashboard.zen-mode { padding: 0 !important; }
.layout-grid { display: grid; grid-template-columns: 280px 1fr 260px; gap: 25px; width: 100%; max-width: 1600px; margin: 0 auto; flex: 1; min-height: 0; transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
.layout-grid.zen-active { grid-template-columns: 0px 1fr 0px; gap: 0; width: 100%; max-width: none; }
.layout-grid.zen-active .col-profile, .layout-grid.zen-active .col-skills { opacity: 0; pointer-events: none; padding: 0; overflow: hidden; }
.layout-grid.zen-active .col-main.glass-panel { border-radius: 0; border: none; }
.col-profile, .col-main, .col-skills { height: 100%; min-height: 0; transition: 0.3s; }
.dashboard.zen-mode .app-footer { display: none !important; }
.app-footer { width: 100%; max-width: 1600px; margin: 0 auto; display: flex; justify-content: center; align-items: center; gap: 15px; padding-top: 15px; color: var(--text-muted); font-size: 0.8rem; font-family: monospace; opacity: 0.7; transition: 0.3s; flex-shrink: 0; }
.app-footer:hover { opacity: 1; }
.divider { color: #333; }
.gemini-text { background: linear-gradient(90deg, #4285F4, #9B72CB, #D96570); -webkit-background-clip: text; color: transparent; font-weight: bold; }
.glass-panel { background: var(--glass-panel); border: 1px solid rgba(255,255,255,0.08); border-top: 1px solid rgba(255,255,255,0.15); border-radius: 20px; backdrop-filter: blur(25px) saturate(120%); display: flex; flex-direction: column; overflow: hidden; position: relative; height: 100%; transition: 0.3s; }
.glass-panel:hover { border-color: rgba(255,255,255,0.2); box-shadow: 0 10px 40px rgba(0,0,0,0.4); }
.profile-box { padding: 30px 25px; } 
.content-body { padding: 25px; overflow-y: auto; height: 100%; } 
.rack-container { padding: 25px; height: 100%; overflow-y: auto; display: flex; flex-direction: column; gap: 20px; } 
.content-body::-webkit-scrollbar, .rack-container::-webkit-scrollbar { width: 6px; }
.content-body::-webkit-scrollbar-thumb, .rack-container::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
.contact-grid { display: flex; justify-content: center; gap: 15px; margin-top: auto; width: 100%; position: relative; padding-top: 15px; }
.contact-wrapper { position: relative; }
.contact-btn { width: 45px; height: 45px; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; color: var(--text-muted); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); cursor: pointer; text-decoration: none; }
.contact-btn svg { transition: transform 0.3s ease; }
.contact-btn:hover { transform: translateY(-3px); color: white; border-color: transparent; }
.contact-btn.email:hover { background: rgba(234, 67, 53, 0.15); color: #ea4335; box-shadow: 0 5px 15px rgba(234, 67, 53, 0.3); }
.contact-btn.linkedin:hover { background: rgba(10, 102, 194, 0.15); color: #0a66c2; box-shadow: 0 5px 15px rgba(10, 102, 194, 0.3); }
.contact-btn.telegram:hover { background: rgba(36, 129, 204, 0.15); color: #2481cc; box-shadow: 0 5px 15px rgba(36, 129, 204, 0.3); }
.contact-btn.github:hover { background: rgba(255, 255, 255, 0.1); color: #ffffff; box-shadow: 0 5px 15px rgba(255, 255, 255, 0.2); }

/* --- استایل هدر و کنترل‌ها (اصلاح شده) --- */
.header-controls { margin-top: 10px; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 10px; width: 100%; padding-left: 30px; padding-right: 30px;}
.project-controls { display: flex; width: 100%; align-items: center; justify-content: space-between; }
/* حالا چپ: فیلترها، راست: تم */
.controls-left { display: flex; justify-content: flex-start; }
.controls-right { display: flex; flex-grow: 1; justify-content: flex-end; }
.filter-chips { display: flex; gap: 8px; flex-wrap: wrap; }

.icon-btn { background: transparent; border: 1px solid var(--neon); color: var(--neon); width: 34px; height: 34px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; transition: 0.3s; }
.icon-btn:hover, .icon-btn.active { background: var(--neon); color: black; box-shadow: 0 0 10px var(--neon); }
.filter-btn { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); color: var(--text-muted); font-size: 0.8rem; padding: 4px 12px; border-radius: 20px; cursor: pointer; transition: 0.2s; }
.filter-btn:hover { background: rgba(255,255,255,0.1); color: white; }
.filter-btn.active-filter { background: var(--neon); color: black; border-color: var(--neon); font-weight: bold; }
.tabs-header.hidden { display: none !important; }
.main-tabs { display: flex; gap: 10px; overflow-x: auto; padding-bottom: 5px; width: 100%; }
.main-tabs button { padding: 8px 16px; font-size: 0.95rem; white-space: nowrap; background: transparent; border: none; border-bottom: 2px solid transparent; color: var(--text-muted); font-family: inherit; cursor: pointer; transition: 0.3s; flex: 1; text-align: center; }
.main-tabs button.active { color: white; border-bottom: 2px solid var(--neon); border-radius: 0; }
.thread-header { display: flex; align-items: center; justify-content: space-between; padding-bottom: 15px; border-bottom: 1px solid rgba(255,255,255,0.1); margin-bottom: 20px; direction: rtl; }
.header-left { display: flex; gap: 10px; align-items: center; }
:deep(.md-image), :deep(.block-body img), :deep(.note-inner img) { max-width: 100% !important; height: auto !important; border-radius: 10px; margin: 10px 0; border: 1px solid rgba(255,255,255,0.1); display: block; }
:deep(.inline-code) { font-family: monospace; background: #333; padding: 2px 5px; border-radius: 4px; color: var(--neon); }
:deep(a) { color: var(--neon); text-decoration: underline; }
:deep(h1), :deep(h2), :deep(h3) { color: var(--text-white); margin-top: 1.5em; margin-bottom: 0.5em; }
:deep(h1) { border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px; }
:deep(ul), :deep(ol) { padding-right: 20px; color: #ddd; }
:deep(li) { margin-bottom: 5px; }
:deep(blockquote) { border-right: 3px solid var(--neon); padding-right: 15px; margin: 15px 0; color: var(--text-muted); background: rgba(255,255,255,0.02); padding: 10px; border-radius: 4px; }
:deep(pre.code-block) { background: #1e1e1e; padding: 15px; border-radius: 8px; overflow-x: auto; border: 1px solid rgba(255,255,255,0.1); margin: 15px 0; direction: ltr; text-align: left; }
:deep(pre.code-block code) { font-family: 'Consolas', 'Monaco', 'Courier New', monospace; font-size: 0.9rem; color: #d4d4d4; white-space: pre-wrap; }
.avatar-glow { position: relative; overflow: hidden; width: 90px; height: 90px; margin: 0 auto 10px; border-radius: 50%; padding: 4px; background: linear-gradient(135deg, var(--neon), transparent); }
.avatar-glow img { width: 100%; height: 100%; border-radius: 50%; background: #000; }
.avatar-glow:hover img { animation: glitch-anim 0.3s infinite; }
.avatar-glow:hover::before { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(103, 255, 100, 0.5); z-index: 2; opacity: 0; pointer-events: none; animation: glitch-flash 0.3s infinite; border-radius: 50%; }
@keyframes glitch-anim { 0% { transform: translate(0); } 20% { transform: translate(-2px, 2px); filter: hue-rotate(90deg); } 40% { transform: translate(-2px, -2px); filter: hue-rotate(0deg); } 60% { transform: translate(2px, 2px); filter: hue-rotate(180deg); } 80% { transform: translate(2px, -2px); filter: hue-rotate(0deg); } 100% { transform: translate(0); } }
@keyframes glitch-flash { 0% { opacity: 0; } 50% { opacity: 0.2; } 100% { opacity: 0; } }
.typewriter { color: var(--neon); font-weight: bold; }
.cursor { animation: blink 1s infinite; display: inline-block; color: var(--neon); }
@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
.tooltip-box { position: absolute; bottom: 125%; left: 50%; transform: translateX(-50%) translateY(10px); background: #0a0a0a; border: 1px solid var(--neon); border-radius: 8px; padding: 8px; width: max-content; min-width: 120px; display: flex; flex-direction: column; align-items: center; gap: 5px; opacity: 0; pointer-events: none; transition: 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55); box-shadow: 0 5px 20px rgba(0,0,0,0.8); z-index: 20; }
.contact-wrapper:hover .tooltip-box { opacity: 1; transform: translateX(-50%) translateY(0); pointer-events: auto; }
.tooltip-box::after { content: ''; position: absolute; top: 100%; left: 50%; transform: translateX(-50%); border-width: 6px; border-style: solid; border-color: var(--neon) transparent transparent transparent; }
.tooltip-box .label { font-size: 0.75rem; color: #fff; margin-bottom: 2px; }
.tooltip-box .copy-btn { background: rgba(103, 255, 100, 0.15); color: var(--neon); border: none; padding: 4px 8px; border-radius: 4px; font-size: 0.7rem; cursor: pointer; width: 100%; transition: 0.2s; font-family: 'Vazirmatn'; }
.tooltip-box .copy-btn:hover { background: var(--neon); color: #000; }
.thread-view { display: flex; flex-direction: column; height: 100%; animation: fadeIn 0.3s; }
.back-btn { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: var(--text-muted); padding: 6px 12px; border-radius: 8px; cursor: pointer; transition: 0.2s; font-family: inherit; }
.back-btn:hover { background: var(--neon); color: #000; border-color: var(--neon); }
.note-meta h3 { margin: 0; font-size: 1.1rem; color: white; }
.post-date { font-size: 0.75rem; color: var(--text-muted); }
.thread-content { flex: 1; overflow-y: auto; padding-right: 5px; display: flex; flex-direction: column; gap: 20px; }
.content-block { padding: 20px; border-radius: 12px; line-height: 1.7; font-size: 0.95rem; }
.main-post { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255,255,255,0.1); }
.update-separator { display: flex; align-items: center; color: var(--neon); font-size: 0.8rem; margin: 10px 0; }
.update-separator::before, .update-separator::after { content: ''; flex: 1; height: 1px; background: rgba(103, 255, 100, 0.3); margin: 0 10px; }
.update-post { background: rgba(103, 255, 100, 0.05); border-left: 3px solid var(--neon); border-radius: 4px; }
.update-header { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 0.75rem; }
.update-badge { background: var(--neon); color: #000; padding: 2px 6px; border-radius: 4px; font-weight: bold; }
.update-date { color: var(--text-muted); }
.block-body { color: #eee; }
.loading-bubble { text-align: center; color: var(--neon); font-style: italic; }
.profile-header { margin-top: 10px; display: flex; flex-direction: column; align-items: center; text-align: center; }
.profile-texts h1 { font-size: 1.3rem; margin: 5px 0 2px; color: white; }
.role { font-size: 0.85rem; margin-bottom: 2px; color: var(--neon); opacity: 0.9; }
.role-sub { font-size: 0.75rem; margin-bottom: 15px; color: var(--text-muted); }
.bio-short { margin: 15px 0; font-size: 0.85rem; line-height: 1.5; color: var(--text-muted); }
.stats-row { margin-bottom: 15px; padding: 10px 0; display: flex; justify-content: center; gap: 30px; border-top: 1px solid rgba(255,255,255,0.05); border-bottom: 1px solid rgba(255,255,255,0.05); }
.stat { display: flex; flex-direction: column; align-items: center; }
.stat strong { font-size: 1.4rem; color: white; }
.stat span { font-size: 0.8rem; color: var(--text-muted); }
.action-buttons { display: flex; gap: 10px; width: 100%; margin-bottom: 10px; }
.terminal-toggle, .resume-btn { flex: 1; margin: 0; padding: 10px; font-size: 0.85rem; display: flex; align-items: center; justify-content: center; height: 40px; border-radius: 12px; font-weight: bold; transition: 0.3s; }
.terminal-toggle { background: rgba(0,0,0,0.5); color: var(--neon); border: 1px solid var(--neon); cursor: pointer; }
.terminal-toggle:hover { background: var(--neon); color: #000; box-shadow: 0 0 15px var(--neon); }
.resume-btn { background: rgba(103, 255, 100, 0.1); border: 1px dashed var(--neon); color: var(--neon); text-decoration: none; }
.resume-btn:hover { background: var(--neon); color: black; border-style: solid; }
.interests-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px; padding: 5px; }
.interest-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.1); border-radius: 15px; padding: 20px; text-align: center; overflow: hidden; position: relative; }
.interest-icon { font-size: 2.5rem; margin-bottom: 10px; }
.interest-card h4 { margin: 0 0 8px; color: white; font-size: 1.1rem; }
.interest-card p { margin: 0; color: var(--text-muted); font-size: 0.85rem; line-height: 1.5; }
.roadmap-list { display: flex; flex-direction: column; gap: 20px; padding: 10px; }
.roadmap-item { position: relative; padding: 20px 60px 20px 20px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.1); border-radius: 15px; overflow: hidden; }
.step-line { position: absolute; right: 30px; top: 0; bottom: 0; width: 2px; background: rgba(255,255,255,0.1); }
.step-dot { position: absolute; right: 24px; top: 25px; width: 14px; height: 14px; border-radius: 50%; border: 2px solid #555; background: #000; z-index: 2; }
.roadmap-item.done .step-dot { border-color: var(--neon); background: var(--neon); box-shadow: 0 0 10px var(--neon); }
.roadmap-item.progress .step-dot { border-color: #f1c40f; background: #f1c40f; box-shadow: 0 0 10px #f1c40f; }
.roadmap-item.todo .step-dot { border-color: #555; }
.step-content h4 { margin: 0 0 5px; color: white; font-size: 1.1rem; }
.step-content p { margin: 0 0 10px; color: var(--text-muted); font-size: 0.9rem; line-height: 1.6; }
.status-badge { font-size: 0.75rem; padding: 3px 8px; border-radius: 6px; background: rgba(255,255,255,0.05); color: #ccc; }
.grid-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 15px; }
.grid-item { position: relative; text-decoration: none; color: white; background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); border-radius: 16px; overflow: hidden; transition: 0.2s; padding: 20px; display: flex; flex-direction: column; min-height: 180px; }
.card-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; z-index: 2; position: relative; }
.folder-icon { font-size: 1.2rem; opacity: 0.7; }
.lang-capsule { font-size: 0.75rem; padding: 4px 10px; border-radius: 50px; border: 1px solid; display: flex; align-items: center; gap: 6px; font-weight: 500; }
.dot { width: 6px; height: 6px; border-radius: 50%; display: inline-block; }
.grid-item h4 { margin: 0 0 10px; font-size: 1.1rem; z-index: 2; position: relative; }
.grid-item p { font-size: 0.9rem; color: var(--text-muted); line-height: 1.6; margin: 0; flex-grow: 1; z-index: 2; position: relative; }
.card-footer { margin-top: 15px; text-align: left; font-size: 0.8rem; color: var(--neon); z-index: 2; position: relative; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 10px; }
.arrow-link { color: var(--neon); opacity: 0; transition: 0.3s; transform: translateX(5px); }
.grid-item:hover .arrow-link { opacity: 1; transform: translateX(0); }
.notes-list { display: flex; flex-direction: column; gap: 10px; }
.note-row { padding: 20px 25px; border-radius: 16px; background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); position: relative; overflow: hidden; display: block; text-decoration: none; color: white; transition: transform 0.1s; }
.note-inner { position: relative; z-index: 2; display: flex; flex-direction: column; gap: 10px; }
.note-head h4 { margin: 0; font-size: 1.1rem; color: var(--text-white); display: flex; align-items: center; gap: 8px; }
.note-icon { font-size: 1.2rem; }
.note-preview { font-size: 0.9rem; color: var(--text-muted); line-height: 1.6; margin: 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.note-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.05); }
.date { font-size: 0.8rem; color: #666; font-family: 'Vazirmatn'; }
.read-btn { font-size: 0.85rem; color: var(--neon); opacity: 0.8; transition: 0.3s; }
.note-row:hover .read-btn { opacity: 1; transform: translateX(-5px); }
.col-skills { height: 100%; padding: 0; }
.panel-header h3 { margin: 0; padding: 20px; font-size: 1.1rem; border-bottom: 1px solid rgba(255,255,255,0.1); color: white; text-align: center; }
.rack-container { padding: 20px; height: 100%; overflow-y: auto; display: flex; flex-direction: column; gap: 20px; }
.rack-slot { display: flex; flex-direction: column; gap: 8px; }
.rack-info { display: flex; justify-content: space-between; font-size: 0.9rem; color: #ddd; }
.rack-percent { color: var(--neon); font-family: 'Vazirmatn'; font-weight: bold; }
.rack-bar-bg { width: 100%; height: 12px; background: rgba(0, 0, 0, 0.5); border: 1px solid rgba(255,255,255,0.1); border-radius: 2px; position: relative; overflow: hidden; }
.rack-bar-fill { height: 100%; background: var(--neon); box-shadow: 0 0 10px var(--neon); position: relative; overflow: hidden; }
.scan-line { position: absolute; top: 0; bottom: 0; width: 20px; background: rgba(255,255,255,0.8); filter: blur(5px); animation: scan 2s infinite linear; }
.rack-grid-lines { position: absolute; inset: 0; background-image: linear-gradient(90deg, rgba(0,0,0,0.8) 1px, transparent 1px); background-size: 10px 100%; pointer-events: none; }
.spotlight-card { --x: -1000px; --y: -1000px; --rx: 0deg; --ry: 0deg; transform: perspective(1000px) rotateX(var(--rx)) rotateY(var(--ry)); will-change: transform; transform-style: preserve-3d; transition: transform 0.1s cubic-bezier(0.2, 0.4, 0.6, 1); }
.spotlight-bg { position: absolute; inset: 0; pointer-events: none; background: radial-gradient(500px circle at var(--x) var(--y), rgba(103, 255, 100, 0.08), transparent 50%); z-index: 1; }
.spotlight-card > * { transform: translateZ(10px); }
.fade-enter-active, .fade-leave-active { transition: opacity 0.5s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.fade-slide-enter-active, .fade-slide-leave-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.fade-slide-enter-from { opacity: 0; transform: translateY(10px); }
.fade-slide-leave-to { opacity: 0; transform: translateY(-10px); }
.scroll-area { overflow-y: auto; padding-right: 5px; }

@media (max-width: 1024px) {
  body { overflow-y: auto; }
  .dashboard { display: block; padding: 15px; height: auto; overflow: auto; }
  .layout-grid { display: flex; flex-direction: column; height: auto; max-height: none; gap: 20px; }
  .dashboard.zen-mode { height: 100vh !important; overflow: hidden !important; display: flex !important; flex-direction: column; padding: 0 !important; }
  .layout-grid.zen-active { display: flex; flex-direction: column; height: 100% !important; gap: 0; }
  .layout-grid.zen-active .col-profile, .layout-grid.zen-active .col-skills { display: none !important; }
  .layout-grid.zen-active .col-main { flex: 1; height: 100% !important; max-height: 100%; display: flex; flex-direction: column; border-radius: 0; border: none; }
  .layout-grid.zen-active .content-body { flex: 1; height: 100%; overflow-y: auto !important; -webkit-overflow-scrolling: touch; padding-bottom: 20px; }
  .col-profile { order: 1; height: auto; }
  .col-main { order: 2; height: auto; min-height: 500px; }
  .col-skills { order: 3; height: auto; }
  .profile-box { padding: 20px; flex-direction: column; }
  .profile-header { display: flex; align-items: center; gap: 15px; margin-bottom: 15px; text-align: right; }
  .avatar-glow { margin: 0; width: 70px; height: 70px; }
  .profile-texts h1 { font-size: 1.3rem; margin: 0; }
  .bio-short { text-align: right; margin: 10px 0; font-size: 0.85rem; }
  .content-body, .rack-container { overflow: visible; height: auto; }
  .grid-list { grid-template-columns: 1fr; }
  .contact-grid { grid-template-columns: 1fr 1fr; gap: 10px; width: 100%; margin-top: 20px; }
  .spotlight-card { transform: none !important; }
}
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
</style>
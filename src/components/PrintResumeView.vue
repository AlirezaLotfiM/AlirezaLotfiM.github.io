<script setup>
import { computed } from 'vue';
import { usePortfolio } from '../composables/usePortfolio';
import { useNavigation } from '../composables/useNavigation';

const { profile, projects, workExperience, mySkills, interests } = usePortfolio();
const { tabPaths, navigateFromEvent, goBackFromResume, lastNonResumePath } = useNavigation();

const printResume = () => {
  if (typeof window !== 'undefined') {
    window.print();
  }
};

const personalDetails = {
  birthDate: '۱۳۷۸/۱۱/۱۳',
  maritalStatus: 'مجرد',
  militaryStatus: 'معافیت تحصیلی',
  city: 'تهران',
  phone: '09109043782',
  phoneDisplay: '(+۹۸) ۹۱۰ ۹۰۴ ۳۷۸۲',
  email: 'lotfi.moghaddam.alireza@gmail.com',
  website: 'alirezalotfimoghaddam.ir',
  github: 'github.com/AlirezaLotfiM',
  linkedin: 'linkedin.com/in/alireza-lotfi-moghaddam-378a8018a',
  telegram: '@DAMOON_X'
};

const summaryText = `برنامه‌نویس نرم‌افزار با چند سال تجربه عملی در توسعه برنامه‌های دسکتاپ (WPF) و سیستم‌های بک‌اند با استفاده از اکوسیستم C# و .NET. دارای تجربه کار با SQL Server و توسعه API با ASP.NET Core. همواره مشتاق یادگیری هستم و در حال حاضر تمرکزم روی ارتقای مهارت‌هایم در زمینه معماری‌های توزیع‌شده، Message Brokerها و توسعه وب (Vue.js) است. هدفم حضور در تیمی پویا برای یادگیری بیشتر، رشد حرفه‌ای و توسعه نرم‌افزارهای کاربردی است.`;

// Dynamic Work Experience computed from experience.json
const fallbackWorkExperiences = [
  {
    title: 'برنامه‌نویس و پشتیبان نرم‌افزار',
    company: 'شرکت نداپرداز انفورماتیک',
    location: 'تهران',
    period: 'شهریور ۱۴۰۰ - اکنون',
    duties: [
      'توسعه و نگهداری APIها و وب‌سرویس‌های بک‌اند با استفاده از تکنولوژی‌های ASP.NET و ASP.NET Core.',
      'طراحی، پیاده‌سازی و پشتیبانی نرم‌افزارهای دسکتاپ (ویندوزی) مبتنی بر WPF و WinForms.',
      'توسعه ابزارهای جانبی و نرم‌افزارهای کاربردی ویندوز با استفاده از زبان Python.',
      'مشارکت در ساخت و توسعه اپلیکیشن‌های موبایل (کراس‌پلتفرم) با بهره‌گیری از Flutter و React Native.',
      'دیباگ، رفع خطا و پشتیبانی فنی مداوم از نرم‌افزارهای در حال اجرا برای تضمین پایداری سیستم‌ها.'
    ]
  }
];

const computedWorkExperiences = computed(() => {
  if (workExperience.value && workExperience.value.length > 0) {
    return workExperience.value.map(job => ({
      title: job.title,
      company: job.company,
      location: job.location || 'تهران',
      period: job.period,
      duties: Array.isArray(job.description) ? job.description : [job.description]
    }));
  }
  return fallbackWorkExperiences;
});

// Concise Dynamic Projects list computed from projects.json (Clean short summary for each project)
const computedProjects = computed(() => {
  if (projects.value && projects.value.length > 0) {
    return projects.value.map(p => ({
      id: p.id,
      name: p.name,
      client: p.role ? `نقش: ${p.role}` : (p.isPrivate ? 'پروژه سازمانی' : 'پروژه اپن‌سورس'),
      stack: p.language || p.stackLabel || '',
      desc: p.description || ''
    }));
  }
  return [];
});

const educationList = [
  {
    degree: 'کارشناسی ارشد کامپیوتر (گرایش نرم‌افزار)',
    school: 'دانشگاه علم و صنعت ایران — تهران',
    period: 'مهر ۱۴۰۲ - شهریور ۱۴۰۴',
    gpa: '۱۷.۲۸',
    keyCourses: 'مهندسی نرم‌افزار پیشرفته (۲۰)، پایگاه داده پیشرفته (۱۹)، داده‌کاوی (۱۸)',
    thesis: 'طراحی و توسعه مدل تشخیص مبتنی بر Deep Learning (پردازش تصویر پزشکی) جهت تشخیص ضایعات پوستی'
  },
  {
    degree: 'کارشناسی کامپیوتر (گرایش نرم‌افزار)',
    school: 'دانشکده فنی شهید شمسی‌پور — تهران',
    period: 'مهر ۱۴۰۰ - شهریور ۱۴۰۲'
  },
  {
    degree: 'کاردانی کامپیوتر (گرایش فناوری اطلاعات IT)',
    school: 'دانشکده فنی شهید شمسی‌پور — تهران',
    period: 'مهر ۱۳۹۸ - شهریور ۱۴۰۰'
  }
];

const researchThesis = {
  title: 'توسعه اپلیکیشن موبایل تشخیص سرطان پوست با مدل EfficientNet-Lite',
  publisher: 'دانشگاه علم و صنعت ایران (شهریور ۱۴۰۴)',
  details: `پژوهش و پیاده‌سازی مدل‌های یادگیری عمیق (Deep Learning) جهت پردازش تصاویر پزشکی. در این تحقیق، با پیش‌پردازش دقیق و تقویت داده‌ها (Data Augmentation) روی دیتاست HAM10000، از ترکیب مدل بهینه‌شده EfficientNet-Lite و الگوریتم خوشه‌بندی Fuzzy C-Means استفاده شد. دستاورد نهایی این پژوهش، طراحی یک شبکه عصبی با دقت بالا و پیاده‌سازی آن در قالب یک مدل سبک و کاربردی برای استفاده در اپلیکیشن موبایلی برای تشخیص زودهنگام ضایعات پوستی بود که موفق به کسب درجه ارزیابی «عالی» شد.`
};

// Dynamic Hard Skills
const fallbackHardSkills = [
  '.NET Ecosystem', 'C# / ASP.NET Core', 'WPF & WinForms', 'Microsoft SQL Server',
  'RESTful API Design', 'Vue.js', 'Python', 'Git & Version Control',
  'SignalR / RabbitMQ', 'Machine Learning / Deep Learning', 'Flutter / Dart', 'React Native'
];

const computedHardSkills = computed(() => {
  if (mySkills.value && mySkills.value.length > 0) {
    const list = [];
    mySkills.value.forEach(cat => {
      if (Array.isArray(cat.items)) {
        cat.items.forEach(item => {
          if (typeof item === 'string') list.push(item);
          else if (item?.name) list.push(item.name);
        });
      }
    });
    if (list.length > 0) return list;
  }
  return fallbackHardSkills;
});

const softSkills = [
  'تفکر تحلیلی و حل مسئله',
  'یادگیری خودآموز و مستمر',
  'مستندسازی و کدنویسی تمیز'
];

const certifications = [
  { name: 'Advanced Python', provider: 'موسسه مکتب‌خونه', date: 'بهمن ۱۳۹۹' },
  { name: 'SQL Fundamentals', provider: 'موسسه SoloLearn', date: 'اسفند ۱۳۹۹' },
  { name: 'Network+', provider: 'مجتمع فنی نارمک', date: 'مهر ۱۳۹۷' },
  { name: 'PHP', provider: 'موسسه SoloLearn', date: 'مرداد ۱۳۹۹' }
];

const computedInterests = computed(() => {
  if (interests.value && interests.value.length > 0) {
    return interests.value.map(item => item.title || item.name || item.desc || item);
  }
  return [
    'طراحی معماری سیستم‌های توزیع‌شده و مقیاس‌پذیر',
    'تعاملات سخت‌افزار و نرم‌افزار'
  ];
});
</script>

<template>
  <div class="cv-wrapper">
    <!-- Top Action Bar (Hidden in Print) -->
    <header class="no-print cv-toolbar glass-panel">
      <div class="toolbar-info">
        <span class="badge">A4 Printable CV</span>
        <span class="text">نسخه متنی کامل و خلاصه پورتفولیو (به‌روزرسانی خودکار با دیتاها)</span>
      </div>
      <div class="toolbar-buttons">
        <a :href="lastNonResumePath || '/'" @click="goBackFromResume($event)" class="btn-back">
          ➜ بازگشت به پورتفولیو
        </a>
        <button class="btn-print" @click="printResume">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 6 2 18 2 18 9"></polyline>
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
            <rect x="6" y="14" width="12" height="8"></rect>
          </svg>
          <span>پرینت / ذخیره به صورت PDF</span>
        </button>
      </div>
    </header>

    <!-- Master A4 Printable Document Container -->
    <article class="cv-document">
      <!-- Top Banner Header -->
      <header class="cv-header">
        <div class="header-content">
          <div class="profile-title-block">
            <h1 class="name">{{ profile.name || 'علیرضا لطفی مقدم' }}</h1>
            <p class="role-subtitle">برنامه‌نویس و پشتیبان نرم‌افزار | Senior .NET & Backend Engineer</p>
            <div class="personal-chips">
              <span>متولد: {{ personalDetails.birthDate }}</span>
              <span>وضعیت تأهل: {{ personalDetails.maritalStatus }}</span>
              <span>سربازی: {{ personalDetails.militaryStatus }}</span>
              <span>شهر: {{ personalDetails.city }}</span>
            </div>
          </div>
          <div class="avatar-block">
            <img src="/Damoon-d.jpg" alt="علیرضا لطفی مقدم" class="avatar-img" />
          </div>
        </div>

        <!-- Contact Bar -->
        <div class="contact-bar">
          <div class="c-item" dir="ltr">
            <span class="c-icon">📧</span>
            <a :href="`mailto:${profile.contact?.email || personalDetails.email}`">{{ profile.contact?.email || personalDetails.email }}</a>
          </div>
          <div class="c-item" dir="ltr">
            <span class="c-icon">📱</span>
            <span>{{ personalDetails.phoneDisplay }}</span>
          </div>
          <div class="c-item" dir="ltr">
            <span class="c-icon">🌐</span>
            <a href="https://alirezalotfimoghaddam.ir" target="_blank">{{ personalDetails.website }}</a>
          </div>
          <div class="c-item" dir="ltr">
            <span class="c-icon">💻</span>
            <a :href="`https://${personalDetails.github}`" target="_blank">{{ personalDetails.github }}</a>
          </div>
        </div>
      </header>

      <!-- 2-Column CV Layout -->
      <div class="cv-grid">
        <!-- Main Column (Right) -->
        <main class="cv-main-col">
          <!-- Summary -->
          <section class="cv-section">
            <div class="section-header">
              <span class="sec-icon">👤</span>
              <h2>خلاصه رزومه</h2>
            </div>
            <p class="summary-p">{{ profile.bio || summaryText }}</p>
          </section>

          <!-- Work Experience -->
          <section class="cv-section">
            <div class="section-header">
              <span class="sec-icon">💼</span>
              <h2>سوابق شغلی</h2>
            </div>
            <div v-for="job in computedWorkExperiences" :key="job.company + job.title" class="job-block">
              <div class="job-top">
                <div class="job-meta">
                  <h3 class="job-title">{{ job.title }}</h3>
                  <span class="company-name">{{ job.company }} ({{ job.location }})</span>
                </div>
                <span class="job-date" dir="ltr">{{ job.period }}</span>
              </div>
              <strong class="bullet-title">وظایف و دستاوردها:</strong>
              <ul class="duties-list">
                <li v-for="(duty, idx) in job.duties" :key="idx">{{ duty }}</li>
              </ul>
            </div>
          </section>

          <!-- Projects & Case Studies (Concise summary format) -->
          <section class="cv-section">
            <div class="section-header">
              <span class="sec-icon">🚀</span>
              <h2>پروژه‌ها و مطالعات موردی</h2>
            </div>
            <div class="projects-grid">
              <div v-for="p in computedProjects" :key="p.id || p.name" class="p-card">
                <div class="p-head">
                  <h4 class="p-title">{{ p.name }}</h4>
                  <span class="p-client">{{ p.client }}</span>
                </div>
                <div v-if="p.stack" class="p-stack" dir="ltr">{{ p.stack }}</div>
                <p class="p-desc">{{ p.desc }}</p>
              </div>
            </div>
          </section>

          <!-- Education -->
          <section class="cv-section">
            <div class="section-header">
              <span class="sec-icon">🎓</span>
              <h2>سوابق تحصیلی</h2>
            </div>
            <div class="edu-list">
              <div v-for="edu in educationList" :key="edu.degree" class="edu-item">
                <div class="edu-top">
                  <strong class="edu-degree">{{ edu.degree }}</strong>
                  <span class="edu-date" dir="ltr">{{ edu.period }}</span>
                </div>
                <p class="edu-school">{{ edu.school }}</p>
                <p v-if="edu.gpa" class="edu-gpa">معدل: <strong>{{ edu.gpa }}</strong> | دروس کلیدی: {{ edu.keyCourses }}</p>
                <p v-if="edu.thesis" class="edu-thesis">پروژه پایانی: {{ edu.thesis }}</p>
              </div>
            </div>
          </section>

          <!-- Research / Thesis -->
          <section class="cv-section">
            <div class="section-header">
              <span class="sec-icon">🔍</span>
              <h2>تحقیقات و پژوهش‌ها</h2>
            </div>
            <div class="research-block">
              <h4 class="res-title">{{ researchThesis.title }}</h4>
              <span class="res-pub">ناشر: {{ researchThesis.publisher }}</span>
              <p class="res-desc">{{ researchThesis.details }}</p>
            </div>
          </section>
        </main>

        <!-- Sidebar Column (Left) -->
        <aside class="cv-side-col">
          <!-- Hard Skills -->
          <section class="side-section">
            <div class="section-header">
              <span class="sec-icon">💡</span>
              <h2>مهارت‌ها</h2>
            </div>
            <div class="skills-chips">
              <span v-for="sk in computedHardSkills" :key="sk" class="skill-chip" dir="ltr">{{ sk }}</span>
            </div>
          </section>

          <!-- Soft Skills -->
          <section class="side-section">
            <div class="section-header">
              <span class="sec-icon">🔲</span>
              <h2>مهارت‌های نرم</h2>
            </div>
            <ul class="soft-list">
              <li v-for="ss in softSkills" :key="ss">{{ ss }}</li>
            </ul>
          </section>

          <!-- Certifications -->
          <section class="side-section">
            <div class="section-header">
              <span class="sec-icon">📜</span>
              <h2>دوره‌ها و گواهی‌نامه‌ها</h2>
            </div>
            <div class="cert-list">
              <div v-for="cert in certifications" :key="cert.name" class="cert-item">
                <strong class="cert-name">{{ cert.name }}</strong>
                <span class="cert-meta">موسسه: {{ cert.provider }} ({{ cert.date }})</span>
              </div>
            </div>
          </section>

          <!-- Languages -->
          <section class="side-section">
            <div class="section-header">
              <span class="sec-icon">🌐</span>
              <h2>زبان‌ها</h2>
            </div>
            <ul class="lang-list">
              <li><strong>فارسی:</strong> زبان مادری</li>
              <li><strong>انگلیسی:</strong> متوسط / تخصصی و فنی</li>
            </ul>
          </section>

          <!-- Interests -->
          <section class="side-section">
            <div class="section-header">
              <span class="sec-icon">⭐</span>
              <h2>علاقه‌مندی‌ها</h2>
            </div>
            <ul class="interests-list">
              <li v-for="(it, iIdx) in computedInterests" :key="iIdx">{{ it }}</li>
            </ul>
          </section>
        </aside>
      </div>
    </article>
  </div>
</template>

<style scoped>
.cv-wrapper {
  max-width: 960px;
  margin: 0 auto;
  padding: 20px 10px 60px;
  direction: rtl;
  color: #1e293b;
}

/* Toolbar */
.cv-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px;
  margin-bottom: 24px;
  border-radius: 16px;
  gap: 16px;
  flex-wrap: wrap;
}

.toolbar-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.badge {
  background: var(--neon);
  color: #ffffff !important;
  font-weight: 700;
  font-size: 0.75rem;
  padding: 4px 10px;
  border-radius: 6px;
}

.text {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.toolbar-buttons {
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn-back {
  color: var(--text-secondary);
  text-decoration: none;
  font-weight: 600;
  font-size: 0.88rem;
  padding: 8px 14px;
  border-radius: 10px;
  background: var(--item-bg);
  border: 1px solid var(--panel-border);
  transition: 0.2s;
}

.btn-back:hover {
  color: var(--text-main);
  border-color: var(--neon);
}

.btn-print {
  background: var(--neon);
  color: #ffffff !important;
  border: none;
  padding: 10px 18px;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: inherit;
  font-size: 0.88rem;
  transition: 0.2s;
}

.btn-print:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(56, 189, 248, 0.4);
}

/* Master A4 Document Paper */
.cv-document {
  background: #ffffff;
  color: #1e293b;
  padding: 36px 40px;
  border-radius: 12px;
  box-shadow: 0 16px 45px rgba(0, 0, 0, 0.28);
  font-family: var(--font-sans, system-ui, sans-serif);
  line-height: 1.6;
}

/* Header */
.cv-header {
  border-bottom: 2px solid #0f172a;
  padding-bottom: 18px;
  margin-bottom: 22px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin-bottom: 16px;
}

.name {
  margin: 0 0 4px 0;
  font-size: 1.85rem;
  font-weight: 800;
  color: #0f172a;
  padding-bottom: 0;
  border: none;
}

.role-subtitle {
  margin: 0 0 8px 0;
  font-size: 0.98rem;
  font-weight: 700;
  color: #0284c7;
}

.personal-chips {
  display: flex;
  gap: 12px;
  font-size: 0.8rem;
  color: #475569;
  flex-wrap: wrap;
}

.personal-chips span {
  background: #f1f5f9;
  padding: 2px 8px;
  border-radius: 4px;
  border: 1px solid #e2e8f0;
}

.avatar-img {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #0f172a;
}

/* Contact Bar */
.contact-bar {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  background: #f8fafc;
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  font-size: 0.82rem;
  color: #334155;
}

.c-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.c-item a {
  color: #0284c7;
  text-decoration: none;
}

.c-item a:hover {
  text-decoration: underline;
}

/* 2-Column Grid */
.cv-grid {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 28px;
}

/* Sections */
.cv-section, .side-section {
  margin-bottom: 22px;
  page-break-inside: avoid;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #0f172a;
  color: #ffffff;
  padding: 6px 12px;
  border-radius: 6px;
  margin-bottom: 12px;
}

.section-header h2 {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 700;
  color: #ffffff;
  padding: 0;
  border: none;
}

.sec-icon {
  font-size: 0.9rem;
}

.summary-p {
  font-size: 0.88rem;
  color: #334155;
  margin: 0;
  line-height: 1.75;
  text-align: justify;
}

/* Jobs */
.job-block {
  margin-bottom: 14px;
  padding-bottom: 14px;
  border-bottom: 1px dashed #e2e8f0;
}

.job-block:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.job-top {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 6px;
}

.job-title {
  margin: 0;
  font-size: 0.96rem;
  font-weight: 700;
  color: #0f172a;
}

.company-name {
  display: block;
  font-size: 0.84rem;
  color: #0284c7;
  font-weight: 600;
}

.job-date {
  font-size: 0.78rem;
  color: #64748b;
  font-family: var(--font-mono, monospace);
  font-weight: 600;
}

.bullet-title {
  display: block;
  font-size: 0.82rem;
  color: #334155;
  margin-bottom: 4px;
}

.duties-list {
  margin: 0;
  padding-right: 18px;
  font-size: 0.85rem;
  color: #334155;
}

.duties-list li {
  margin-bottom: 5px;
  line-height: 1.6;
}

/* Projects */
.projects-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.p-card {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 10px;
  background: #f8fafc;
}

.p-head {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: 4px;
}

.p-title {
  font-size: 0.88rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.p-client {
  font-size: 0.76rem;
  color: #0284c7;
  font-weight: 600;
}

.p-stack {
  font-size: 0.72rem;
  color: #0284c7;
  font-family: var(--font-mono, monospace);
  margin-bottom: 4px;
  font-weight: 600;
}

.p-desc {
  font-size: 0.8rem;
  color: #475569;
  margin: 0;
  line-height: 1.5;
}

/* Education */
.edu-item {
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px dashed #f1f5f9;
}

.edu-item:last-child {
  border-bottom: none;
}

.edu-top {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.edu-degree {
  font-size: 0.9rem;
  color: #0f172a;
}

.edu-date {
  font-size: 0.76rem;
  color: #64748b;
  font-family: var(--font-mono, monospace);
}

.edu-school {
  font-size: 0.82rem;
  color: #0284c7;
  margin: 2px 0;
  font-weight: 600;
}

.edu-gpa, .edu-thesis {
  font-size: 0.78rem;
  color: #475569;
  margin: 2px 0;
}

/* Research */
.research-block {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px;
}

.res-title {
  margin: 0 0 2px 0;
  font-size: 0.88rem;
  font-weight: 700;
  color: #0f172a;
}

.res-pub {
  font-size: 0.76rem;
  color: #0284c7;
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
}

.res-desc {
  font-size: 0.82rem;
  color: #334155;
  margin: 0;
  line-height: 1.6;
}

/* Sidebar Elements */
.skills-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.skill-chip {
  font-size: 0.74rem;
  padding: 3px 8px;
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  color: #0f172a;
  font-weight: 600;
}

.soft-list, .lang-list, .interests-list {
  margin: 0;
  padding-right: 18px;
  font-size: 0.82rem;
  color: #334155;
}

.soft-list li, .lang-list li, .interests-list li {
  margin-bottom: 6px;
}

.cert-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cert-item {
  font-size: 0.8rem;
  border-bottom: 1px dashed #f1f5f9;
  padding-bottom: 4px;
}

.cert-name {
  display: block;
  color: #0f172a;
}

.cert-meta {
  font-size: 0.74rem;
  color: #64748b;
}

/* Print CSS */
@media print {
  body {
    background: #ffffff !important;
    color: #1e293b !important;
  }

  .no-print,
  .cv-toolbar,
  .skip-link,
  #app-update-toast,
  .spotlight-bg,
  .ambient-glow {
    display: none !important;
  }

  .cv-wrapper {
    max-width: 100% !important;
    padding: 0 !important;
    margin: 0 !important;
  }

  .cv-document {
    box-shadow: none !important;
    padding: 0 !important;
    border-radius: 0 !important;
    width: 100% !important;
  }

  .cv-grid {
    display: grid !important;
    grid-template-columns: 1fr 260px !important;
    gap: 22px !important;
  }

  .projects-grid {
    display: grid !important;
    grid-template-columns: 1fr 1fr !important;
    gap: 10px !important;
  }

  .section-header {
    background: #0f172a !important;
    color: #ffffff !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  .personal-chips span,
  .skill-chip,
  .contact-bar,
  .p-card,
  .research-block {
    background: #f8fafc !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  .cv-section,
  .side-section,
  .job-block,
  .p-card,
  .edu-item,
  .research-block {
    break-inside: avoid !important;
    page-break-inside: avoid !important;
  }

  @page {
    size: A4 portrait;
    margin: 10mm 12mm;
  }
}

@media (max-width: 768px) {
  .cv-grid {
    grid-template-columns: 1fr;
  }
  .projects-grid {
    grid-template-columns: 1fr;
  }
  .cv-document {
    padding: 24px 18px;
  }
}
</style>

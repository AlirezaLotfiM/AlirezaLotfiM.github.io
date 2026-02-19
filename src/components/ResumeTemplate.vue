<script setup>
import { computed } from 'vue';

const props = defineProps({
  profile: Object,
  skills: Array,
  experience: Array,
  projects: Array
});

// Helper for Persian digits
const toPersianDigits = (num) => {
   if (!num) return "";
   const id = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
   return num.toString().replace(/[0-9]/g, (w) => id[+w]);
};

const relevantProjects = computed(() => {
    return props.projects ? props.projects.slice(0, 5) : [];
});
</script>

<template>
  <div id="resume-template" class="resume-wrapper">
    <!-- Header -->
    <header class="resume-header">
      <div class="header-content">
        <h1>{{ profile.name }}</h1>
        <h2>{{ profile.role }}</h2>
        <div class="contact-info">
          <span v-if="profile.contact?.email">{{ profile.contact.email }} 📧</span>
          <span v-if="profile.contact?.phone">{{ profile.contact.phone }} 📞</span>
          <span v-if="profile.contact?.linkedin">LinkedIn 🔗</span>
          <span v-if="profile.contact?.website">{{ profile.contact.website }} 🌐</span>
        </div>
      </div>
    </header>

    <div class="resume-body">
      <!-- Right Column (Sidebar) -->
      <aside class="resume-sidebar">
        <section class="section">
            <h3>مهارت‌ها</h3>
            <ul class="skills-list">
                <li v-for="skill in skills" :key="skill.name || skill">
                    {{ skill.name || skill }}
                </li>
            </ul>
        </section>

        <section class="section">
            <h3>تحصیلات</h3>
            <div class="education-item">
                 <!-- Hardcoded fallback if dynamic data isn't structured for education -->
                 <p v-if="profile.learning && profile.learning.university">
                    {{ profile.learning.university }}
                 </p>
                 <p v-else>
                    کارشناسی مهندسی کامپیوتر
                 </p>
            </div>
        </section>

        <section class="section" v-if="profile.languages">
             <h3>زبان‌ها</h3>
             <ul class="skills-list">
                <li v-for="lang in profile.languages" :key="lang">{{ lang }}</li>
             </ul>
        </section>
      </aside>

      <!-- Left Column (Main) -->
      <main class="resume-main">
        <section class="section" v-if="profile.bio">
            <h3>خلاصه رزومه</h3>
            <p class="bio-text">{{ profile.bio }}</p>
        </section>

        <section class="section" v-if="experience && experience.length">
            <h3>سوابق شغلی</h3>
            <div v-for="job in experience" :key="job.company" class="experience-item">
                <div class="job-header">
                    <h4>{{ job.role }}</h4>
                    <span class="company">{{ job.company }}</span>
                </div>
                <div class="job-date">{{ job.period }}</div>
                <p class="job-desc">{{ job.description }}</p>
            </div>
        </section>

        <section class="section" v-if="relevantProjects.length">
            <h3>پروژه‌های منتخب</h3>
            <div v-for="proj in relevantProjects" :key="proj.name" class="project-item">
                <div class="proj-head">
                    <h4>{{ proj.name }}</h4>
                    <small v-if="proj.language" class="tech-stack">{{ proj.language }}</small>
                </div>
                <p>{{ proj.description }}</p>
            </div>
        </section>
      </main>
    </div>
  </div>
</template>

<style scoped>
/* Print Styles */
.resume-wrapper {
    width: 210mm;
    min-height: 297mm;
    padding: 20mm;
    background: white;
    color: #333;
    font-family: 'Vazirmatn', sans-serif;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    direction: rtl;
    line-height: 1.6;
    /* Positioning handled by parent component */
}

.resume-header {
    border-bottom: 2px solid #333;
    padding-bottom: 20px;
    margin-bottom: 20px;
}

.resume-header h1 {
    margin: 0;
    font-size: 2.2rem;
    color: #000;
}

.resume-header h2 {
    margin: 5px 0;
    font-size: 1.4rem;
    color: #555;
    font-weight: normal;
}

.contact-info {
    display: flex;
    gap: 15px;
    font-size: 0.9rem;
    margin-top: 10px;
    flex-wrap: wrap;
    color: #666;
}

.resume-body {
    display: flex;
    gap: 30px;
    flex: 1;
}

.resume-sidebar {
    width: 30%;
    border-left: 1px solid #eee;
    padding-left: 20px;
}

.resume-main {
    width: 70%;
}

.section {
    margin-bottom: 25px;
}

.section h3 {
    border-bottom: 1px solid #333;
    padding-bottom: 5px;
    margin-bottom: 10px;
    font-size: 1.2rem;
    color: #000;
    font-weight: 700;
}

.skills-list {
    list-style: none;
    padding: 0;
}

.skills-list li {
    background: #f5f5f5;
    margin-bottom: 5px;
    padding: 6px 10px;
    border-radius: 4px;
    font-size: 0.9rem;
    color: #444;
}

.experience-item, .project-item {
    margin-bottom: 20px;
}

.job-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 2px;
}

.job-header h4 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: bold;
    color: #222;
}

.company {
    font-weight: bold;
    color: #555;
    font-size: 0.95rem;
}

.job-date {
    font-size: 0.85rem;
    color: #777;
    margin-bottom: 8px;
}

.job-desc, .project-item p, .bio-text {
    font-size: 0.95rem;
    color: #444;
    text-align: justify;
    margin: 0;
}

.proj-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 5px;
}

.proj-head h4 {
    margin: 0;
    font-size: 1.1rem;
    color: #222;
}

.tech-stack {
    color: #666;
    font-size: 0.8rem;
    background: #eee;
    padding: 2px 6px;
    border-radius: 4px;
}
</style>

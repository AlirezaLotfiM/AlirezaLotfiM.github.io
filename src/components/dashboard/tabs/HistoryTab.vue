<script setup>
import { useWorkExperience } from '../../../composables/useWorkExperience';
import { useNavigation } from '../../../composables/useNavigation';

const { workExperiences } = useWorkExperience();
const { navigateTo } = useNavigation();

const goToProject = (event, slug) => {
  if (event) event.preventDefault();
  navigateTo(`/projects/#project-${slug}`);
};
</script>

<template>
  <div class="history-shell">
    <div class="history-header-bar">
      <div class="header-title-block">
        <h3>💼 سوابق شغلی و تجربیات کلیدی</h3>
        <p class="subtitle">مسیر فعالیت‌های حرفه‌ای و پروژه‌های اجرا شده در مجموعه شرکت‌ها و تیم‌ها</p>
      </div>
    </div>

    <div class="timeline-container">
      <div class="neon-line"></div>

      <div v-for="(job, index) in workExperiences" :key="job.id || index" class="timeline-item">
        <!-- Right Side: Header (RTL Right side) -->
        <div class="time-header glass-panel">
          <div class="job-meta-head">
            <h4 class="job-title">{{ job.title }}</h4>
            <span class="company-badge">{{ job.company }}</span>
          </div>
          <span class="period-tag" dir="ltr">{{ job.period }}</span>
        </div>

        <!-- Center: Marker Dot -->
        <div class="time-marker">
          <div class="neon-dot"></div>
        </div>

        <!-- Left Side: Content & Responsibilities -->
        <div class="time-body glass-panel">
          <div class="desc-content">
            <ul v-if="Array.isArray(job.description)" class="desc-list">
              <li v-for="(line, i) in job.description" :key="i">{{ line }}</li>
            </ul>
            <p v-else class="desc-text">{{ job.description }}</p>
          </div>

          <div v-if="job.related_projects && job.related_projects.length > 0" class="related-projects-block">
            <span class="related-title">پروژه‌های مرتبط:</span>
            <div class="related-pills">
              <a
                v-for="proj in job.related_projects"
                :key="proj.id || proj.slug"
                :href="`/projects/#project-${proj.slug}`"
                class="related-pill mono-ui"
                @click="goToProject($event, proj.slug)"
              >
                🚀 {{ proj.name }}
              </a>
            </div>
          </div>

          <div class="tech-stack" v-if="job.technologies && job.technologies.length > 0">
            <span v-for="t in job.technologies" :key="t" class="tech-pill" dir="ltr">{{ t }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.history-shell {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.history-header-bar {
  padding: 16px 20px;
  background: var(--item-bg);
  border: 1px solid var(--panel-border);
  border-radius: 16px;
}

.header-title-block h3 {
  margin: 0 0 4px 0;
  font-size: 1.1rem;
  color: var(--text-main);
}

.header-title-block .subtitle {
  margin: 0;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.timeline-container {
  position: relative;
  padding: 20px 0;
  max-width: 1000px;
  margin: 0 auto;
  width: 100%;
}

/* The vertical timeline line */
.neon-line {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  width: 2px;
  background: linear-gradient(180deg, var(--neon) 0%, rgba(56, 189, 248, 0.2) 100%);
  transform: translateX(-50%);
  z-index: 0;
}

.timeline-item {
  display: flex;
  justify-content: space-between;
  align-items: stretch;
  margin-bottom: 24px;
  position: relative;
  z-index: 1;
  opacity: 1;
  transition: all 0.3s ease;
}

.timeline-item:hover {
  transform: translateY(-2px);
}

.timeline-item:hover .neon-dot {
  background: var(--neon);
  box-shadow: 0 0 12px var(--neon);
  border-color: #ffffff;
}

.timeline-item:hover .glass-panel {
  border-color: var(--neon);
  background: var(--item-hover-bg);
}

/* Columns */
.time-header, .time-body {
  width: 45%;
  padding: 18px 20px;
  border: 1px solid var(--panel-border);
  border-radius: 16px;
  background: var(--item-bg);
  transition: 0.3s;
}

.time-header {
  text-align: right;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 10px;
}

.job-meta-head {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.job-title {
  margin: 0;
  color: var(--text-main);
  font-size: 1.05rem;
  font-weight: 700;
}

.company-badge {
  font-weight: 700;
  color: var(--neon);
  font-size: 0.9rem;
}

.period-tag {
  font-size: 0.8rem;
  color: var(--text-secondary);
  font-family: var(--font-mono, monospace);
  background: rgba(15, 23, 42, 0.6);
  padding: 4px 10px;
  border-radius: 8px;
  border: 1px solid var(--panel-border);
  align-self: flex-start;
}

.time-body {
  text-align: right;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.time-marker {
  width: 10%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.neon-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--bg-main);
  border: 2px solid var(--neon);
  transition: 0.3s;
}

/* Body Styles */
.desc-list {
  margin: 0;
  padding-right: 18px;
  font-size: 0.88rem;
  color: var(--text-secondary);
  line-height: 1.7;
}

.desc-list li {
  margin-bottom: 6px;
}

.desc-text {
  margin: 0;
  font-size: 0.88rem;
  color: var(--text-secondary);
  line-height: 1.7;
}

.related-projects-block {
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px dashed rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.related-title {
  font-size: 0.78rem;
  color: var(--text-muted, #94a3b8);
}

.related-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.related-pill {
  font-size: 0.78rem;
  padding: 4px 10px;
  border-radius: 8px;
  background: rgba(56, 189, 248, 0.12);
  border: 1px solid rgba(56, 189, 248, 0.35);
  color: var(--neon, #38bdf8);
  text-decoration: none;
  transition: all 0.2s ease;
}

.related-pill:hover {
  background: rgba(56, 189, 248, 0.25);
  box-shadow: 0 0 10px rgba(56, 189, 248, 0.4);
  transform: translateY(-1px);
}

.tech-stack {
  margin-top: 14px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tech-pill {
  font-size: 0.74rem;
  background: rgba(56, 189, 248, 0.08);
  border: 1px solid rgba(56, 189, 248, 0.2);
  padding: 3px 10px;
  border-radius: 6px;
  color: var(--text-main);
  font-weight: 500;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .timeline-container {
    padding: 10px 0;
  }

  .neon-line {
    display: none;
  }

  .timeline-item {
    flex-direction: column;
    gap: 12px;
    margin-bottom: 20px;
  }

  .time-marker {
    display: none;
  }

  .time-header, .time-body {
    width: 100%;
  }
}
</style>

<script setup>
import { usePortfolio } from '../../composables/usePortfolio';
import { useI18n } from '../../composables/useI18n';
import { useAudioSynth } from '../../composables/useAudioSynth';

const emit = defineEmits(['open-case-study', 'navigate-to-project']);

const { workExperience } = usePortfolio();
const { t, isRtl } = useI18n();
const { playClick } = useAudioSynth();

const handleCaseStudyClick = (job) => {
  playClick();
  emit('open-case-study', job);
};

const handleProjectChipClick = (relProj) => {
  playClick();
  emit('navigate-to-project', relProj);
};
</script>

<template>
  <section id="experience" class="editorial-section" :dir="isRtl ? 'rtl' : 'ltr'">
    <div class="sec-title-bar">
      <span class="sec-badge mono-ui" dir="ltr">01</span>
      <h2>{{ t('expTitle') }}</h2>
    </div>

    <div class="experience-timeline-wrapper">
      <article
        v-for="(job, index) in workExperience"
        :key="job.id || index"
        class="timeline-job-card"
      >
        <!-- Timeline Left Node & Connector -->
        <div class="timeline-left-node">
          <span class="node-dot"></span>
          <span class="node-line" v-if="index < workExperience.length - 1"></span>
        </div>

        <!-- Main Card Content -->
        <div class="job-card-content">
          <div class="job-header-row">
            <div class="job-title-group">
              <h3>{{ job.title || job.role }}</h3>
              <span class="job-company">@ {{ job.company }}</span>
            </div>
            <div class="job-header-actions">
              <span class="period-badge-pill">{{ job.period }}</span>
              <button
                v-if="job.id === 1"
                @click="handleCaseStudyClick(job)"
                class="case-study-trigger-btn"
                title="مشاهده دیاگرام و جزئیات معماری بانکی"
              >
                {{ t('caseStudyBtn') }}
              </button>
            </div>
          </div>

          <!-- Impact Metrics Badges -->
          <div v-if="job.impact_metrics && job.impact_metrics.length" class="job-impact-metrics-row">
            <div
              v-for="(metric, mi) in job.impact_metrics"
              :key="mi"
              class="impact-metric-pill"
            >
              <span class="metric-dot"></span>
              <span class="metric-lbl">{{ metric.label }}:</span>
              <strong class="metric-val">{{ metric.value }}</strong>
            </div>
          </div>

          <!-- Role Summary -->
          <p v-if="job.role_summary" class="job-role-summary">
            {{ job.role_summary }}
          </p>

          <!-- Core Achievements Bullet Points -->
          <ul class="job-achievements-list">
            <li v-for="(desc, di) in job.description" :key="di" class="achievement-chip-item">
              <span class="achievement-bullet">›</span>
              <span>{{ desc }}</span>
            </li>
          </ul>

          <!-- Associated Technologies Pills -->
          <div v-if="job.technologies || job.tech" class="job-tech-chips-row">
            <span
              v-for="t in (job.technologies || job.tech)"
              :key="t"
              class="tech-pill-badge mono-ui"
              dir="ltr"
            >
              {{ t }}
            </span>
          </div>

          <!-- Associated Projects Link Box -->
          <div v-if="job.related_projects && job.related_projects.length" class="job-related-projects-box">
            <span class="related-lbl">{{ t('relatedProjects') }}</span>
            <div class="related-chips-row">
              <button
                v-for="relProj in job.related_projects"
                :key="relProj.id"
                @click="handleProjectChipClick(relProj)"
                class="related-project-chip"
                type="button"
                title="کلیک برای مشاهده این پروژه در صفحه"
              >
                <span>{{ relProj.name }}</span>
                <span class="chip-arrow">↙</span>
              </button>
            </div>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.editorial-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}



.experience-timeline-wrapper {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.timeline-job-card {
  display: flex;
  gap: 16px;
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
  background: var(--item-bg, #ffffff);
  border: 3px solid var(--neon, #4f46e5);
  box-shadow: 0 0 10px rgba(79, 70, 229, 0.4);
  z-index: 2;
}

.node-line {
  flex: 1;
  width: 2px;
  background: linear-gradient(180deg, var(--neon, #4f46e5), var(--panel-border, #cbd5e1));
  margin-top: 4px;
}

.job-card-content {
  flex: 1;
  background: var(--item-bg, #ffffff);
  border: 1px solid var(--panel-border, #cbd5e1);
  border-radius: 16px;
  padding: 20px 24px;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.03);
  display: flex;
  flex-direction: column;
  gap: 14px;
  transition: all 0.2s ease;
  border-right: 3px solid var(--neon, #4f46e5);
}

[dir="ltr"] .job-card-content {
  border-right: 1px solid var(--panel-border, #cbd5e1);
  border-left: 3px solid var(--neon, #4f46e5);
}

.job-card-content:hover {
  border-color: rgba(79, 70, 229, 0.4);
  box-shadow: 0 8px 24px rgba(79, 70, 229, 0.08);
}

.job-header-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.job-title-group h3 {
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--text-main, #0f172a);
  margin: 0 0 4px;
}

.job-company {
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--neon, #4f46e5);
}

.job-header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.period-badge-pill {
  font-size: 0.74rem;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 999px;
  background: var(--bar-bg, #f1f5f9);
  border: 1px solid var(--panel-border, #cbd5e1);
  color: var(--text-secondary, #475569);
}

.case-study-trigger-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.74rem;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 999px;
  background: rgba(79, 70, 229, 0.1);
  border: 1px solid rgba(79, 70, 229, 0.3);
  color: var(--neon, #4f46e5);
  cursor: pointer;
  transition: all 0.15s ease;
}

.case-study-trigger-btn:hover {
  background: var(--neon, #4f46e5);
  color: #ffffff;
}

.job-impact-metrics-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.impact-metric-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: var(--bar-bg, #f8fafc);
  border: 1px solid var(--panel-border, #e2e8f0);
  border-radius: 8px;
  font-size: 0.76rem;
  color: var(--text-secondary, #475569);
}

.metric-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--neon, #4f46e5);
}

.metric-val {
  color: var(--text-main, #0f172a);
}

.job-role-summary {
  font-size: 0.88rem;
  color: var(--text-secondary, #334155);
  line-height: 1.7;
  margin: 0;
}

.job-achievements-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.achievement-chip-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 0.86rem;
  color: var(--text-secondary, #334155);
  line-height: 1.7;
}

.achievement-bullet {
  color: var(--neon, #4f46e5);
  font-weight: 800;
  font-size: 1.1rem;
  line-height: 1.2;
}

.job-tech-chips-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 4px;
}

.tech-pill-badge {
  font-size: 0.72rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 6px;
  background: var(--bar-bg, #f1f5f9);
  border: 1px solid var(--panel-border, #cbd5e1);
  color: var(--text-secondary, #475569);
}

.job-related-projects-box {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: rgba(79, 70, 229, 0.04);
  border: 1px dashed rgba(79, 70, 229, 0.25);
  border-radius: 10px;
  flex-wrap: wrap;
}

.related-lbl {
  font-size: 0.76rem;
  font-weight: 700;
  color: var(--neon, #4f46e5);
}

.related-chips-row {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.related-project-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px;
  background: var(--item-bg, #ffffff);
  border: 1px solid var(--panel-border, #cbd5e1);
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-main, #0f172a);
  cursor: pointer;
  transition: all 0.15s ease;
}

.related-project-chip:hover {
  border-color: var(--neon, #4f46e5);
  color: var(--neon, #4f46e5);
}

.chip-arrow {
  font-size: 0.72rem;
  color: var(--neon, #4f46e5);
}

@media (max-width: 640px) {
  .timeline-job-card {
    gap: 10px;
  }

  .job-card-content {
    padding: 16px 14px;
    gap: 12px;
  }

  .job-header-row {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }

  .job-header-actions {
    justify-content: flex-start;
  }

  .impact-metric-pill {
    font-size: 0.72rem;
    padding: 3px 8px;
  }

  .job-related-projects-box {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }
}

@media (max-width: 480px) {
  .job-card-content {
    padding: 14px 12px;
  }

  .job-title-group h3 {
    font-size: 1.05rem;
  }

  .job-company {
    font-size: 0.85rem;
  }

  .period-badge-pill,
  .case-study-trigger-btn {
    font-size: 0.7rem;
    padding: 3px 8px;
  }

  .achievement-chip-item {
    font-size: 0.82rem;
  }
}
</style>

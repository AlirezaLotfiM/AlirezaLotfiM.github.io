<script setup>
import { useI18n } from '../../composables/useI18n';
import { useAudioSynth } from '../../composables/useAudioSynth';

const emit = defineEmits(['select-tech']);

const { t, isRtl } = useI18n();
const { playClick } = useAudioSynth();

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
    desc: 'سابقه پیوسته توسعه نرم‌افزار کیوسک‌ها و کلاینت‌های باجه بانکی با WPF؛ اتصال مستقیم به اسکنرهای بیومتریک و تجهیزات جانبی.',
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

const handleTagClick = (tech) => {
  playClick();
  emit('select-tech', tech);
};
</script>

<template>
  <section id="skills" class="editorial-section" :dir="isRtl ? 'rtl' : 'ltr'">
    <div class="sec-title-bar">
      <span class="sec-badge mono-ui" dir="ltr">03</span>
      <h2>{{ t('skillsTitle') }}</h2>
    </div>

    <p class="skills-section-hint">
      💡 {{ t('skillsHint') }}
    </p>

    <div class="specialization-pillars-grid">
      <div
        v-for="(pillar, index) in specializationPillars"
        :key="index"
        class="pillar-card"
      >
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
            @click="handleTagClick(tech)"
            class="pillar-tag-item mono-ui clickable-tag"
            dir="ltr"
            title="کلیک برای فیلتر پروژه‌های مربوطه"
            type="button"
          >
            {{ tech }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.editorial-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}



.skills-section-hint {
  font-size: 0.82rem;
  color: var(--text-soft, #64748b);
  margin: -10px 0 0;
}

.specialization-pillars-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

@media (max-width: 768px) {
  .specialization-pillars-grid {
    grid-template-columns: 1fr;
  }
}

.pillar-card {
  background: var(--item-bg, #ffffff);
  border: 1px solid var(--panel-border, #cbd5e1);
  border-radius: 16px;
  padding: 22px;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.03);
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: all 0.2s ease;
}

.pillar-card:hover {
  border-color: rgba(79, 70, 229, 0.4);
  box-shadow: 0 8px 24px rgba(79, 70, 229, 0.08);
  transform: translateY(-2px);
}

.pillar-top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.pillar-category {
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.6px;
  color: var(--neon, #4f46e5);
}

.pillar-icon {
  font-size: 1.25rem;
}

.pillar-title {
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--text-main, #0f172a);
  margin: 0;
}

.pillar-desc {
  font-size: 0.85rem;
  color: var(--text-secondary, #475569);
  line-height: 1.65;
  margin: 0;
  flex: 1;
}

.pillar-tech-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}

.pillar-tag-item {
  padding: 4px 10px;
  border-radius: 6px;
  background: var(--bar-bg, #f1f5f9);
  border: 1px solid var(--panel-border, #cbd5e1);
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-secondary, #334155);
  cursor: pointer;
  transition: all 0.15s ease;
}

.pillar-tag-item:hover {
  background: var(--neon, #4f46e5);
  border-color: var(--neon, #4f46e5);
  color: #ffffff;
}

@media (max-width: 640px) {
  .pillar-card {
    padding: 16px 14px;
    border-radius: 14px;
    gap: 8px;
  }

  .pillar-title {
    font-size: 0.98rem;
  }

  .pillar-desc {
    font-size: 0.82rem;
  }

  .pillar-tag-item {
    font-size: 0.72rem;
    padding: 3px 8px;
  }
}
</style>

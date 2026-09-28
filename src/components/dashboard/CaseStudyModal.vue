<script setup>
import { ref } from 'vue';
import { useI18n } from '../../composables/useI18n';
import { useAudioSynth } from '../../composables/useAudioSynth';

const props = defineProps({
  isOpen: Boolean,
  studyData: {
    type: Object,
    default: () => null
  }
});

const emit = defineEmits(['close']);
const { isRtl } = useI18n();
const { playClick } = useAudioSynth();

const activeTab = ref('architecture');

const setTab = (tab) => {
  playClick();
  activeTab.value = tab;
};
</script>

<template>
  <Transition name="study-fade">
    <div v-if="isOpen" class="study-overlay" @click.self="emit('close')">
      <div class="study-dialog" role="dialog" aria-modal="true" :dir="isRtl ? 'rtl' : 'ltr'">
        <!-- Dialog Header -->
        <header class="study-header">
          <div class="study-header-badges">
            <span class="study-badge-tag">ENGINEERING CASE STUDY</span>
            <span class="study-badge-status">
              <span class="pulse-dot"></span>
              عملیاتی در شبکه بانکی کشور
            </span>
          </div>
          <button @click="emit('close')" class="study-close-btn" title="بستن (ESC)">✕</button>
        </header>

        <!-- Title & Subtitle -->
        <div class="study-hero">
          <h2>مهندسی و معماری سامانه نوبت‌دهی و اتوماسیون شعب بانکی</h2>
          <p class="study-hero-sub">
            بررسی عمیق معماری فنی، یکپارچه‌سازی سخت‌افزاری و بهینه‌سازی دیتابیس در شعب بانک‌های ملت، آینده و شهر
          </p>
        </div>

        <!-- Navigation Tabs -->
        <div class="study-tabs-bar" role="tablist">
          <button
            @click="setTab('architecture')"
            :class="['study-tab-btn', { active: activeTab === 'architecture' }]"
            type="button"
            role="tab"
            :aria-selected="activeTab === 'architecture'"
          >
            <span class="tab-icon" aria-hidden="true">📐</span>
            <span class="tab-label">معماری و الگوها</span>
          </button>
          <button
            @click="setTab('hardware')"
            :class="['study-tab-btn', { active: activeTab === 'hardware' }]"
            type="button"
            role="tab"
            :aria-selected="activeTab === 'hardware'"
          >
            <span class="tab-icon" aria-hidden="true">🔌</span>
            <span class="tab-label">یکپارچه‌سازی سخت‌افزار</span>
          </button>
          <button
            @click="setTab('database')"
            :class="['study-tab-btn', { active: activeTab === 'database' }]"
            type="button"
            role="tab"
            :aria-selected="activeTab === 'database'"
          >
            <span class="tab-icon" aria-hidden="true">💾</span>
            <span class="tab-label">پایگاه داده و همروندی</span>
          </button>
          <button
            @click="setTab('metrics')"
            :class="['study-tab-btn', { active: activeTab === 'metrics' }]"
            type="button"
            role="tab"
            :aria-selected="activeTab === 'metrics'"
          >
            <span class="tab-icon" aria-hidden="true">🛠️</span>
            <span class="tab-label">چالش‌های واقعی و پایداری</span>
          </button>
        </div>

        <!-- Content Area -->
        <div class="study-body">
          <!-- TAB 1: ARCHITECTURE -->
          <div v-if="activeTab === 'architecture'" class="study-tab-pane">
            <div class="case-card-panel">
              <h3 class="panel-heading">⚡ معماری کلاینت-سرور توزیع‌شده شعب</h3>
              <p class="panel-desc">
                در شعب بانکی با ترافیک بالا، قطعی ثانیه‌ای شبکه نباید روند پذیرش مشتری را متوقف کند. معماری این سیستم با تلفیق مدل‌های رخدادمحور (Event-Driven) و صف‌های حافظه‌ای ایزوله طراحی شده است:
              </p>
              <div class="architecture-flow-box">
                <div class="flow-step-box">
                  <span class="step-num">۰۱</span>
                  <div class="step-details">
                    <strong>لایه کلاینت‌های کیوسک و باجه (WPF / WinForms):</strong>
                    <p>اجرای نرم‌افزارهای سبک دسکتاپ بر پایه الگوی MVVM، با قابلیت کشینگ آفلاین برای تضمین کارکرد هنگام قطعی موقت سوئیچ مرکزی.</p>
                  </div>
                </div>
                <div class="flow-connector">↓</div>
                <div class="flow-step-box">
                  <span class="step-num">۰۲</span>
                  <div class="step-details">
                    <strong>هسته پردازشگر نوبت و صف‌بندی پویا (Core Queue Engine):</strong>
                    <p>مدیریت اولویت مشتریان VIP، انتقال هوشمند بین باجه‌های دارای صف سبک‌تر و اعلام صوتی نوبت‌ها از طریق ماژول اعلان سالنی.</p>
                  </div>
                </div>
                <div class="flow-connector">↓</div>
                <div class="flow-step-box">
                  <span class="step-num">۰۳</span>
                  <div class="step-details">
                    <strong>لایه نوبت‌دهی آنلاین و وب‌سرویس‌ها:</strong>
                    <p>سرویس‌های نوبت‌دهی غیرحضوری بانک ملت برای اتصال درخواست‌های تلفن همراه به صف واقعی شعبه بدون ایجاد تداخل.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- TAB 2: HARDWARE -->
          <div v-if="activeTab === 'hardware'" class="study-tab-pane">
            <div class="case-card-panel">
              <h3 class="panel-heading">🔌 پروتکل‌های سریال و سنسورهای بیومتریک</h3>
              <p class="panel-desc">
                یکی از مهم‌ترین چالش‌های مهندسی، هندل کردن رویدادهای آسنکرون سخت‌افزارهایی بود که در لایه پایین کار می‌کردند:
              </p>
              <div class="hardware-grid">
                <div class="hardware-pill-card">
                  <div class="hw-icon">📟</div>
                  <div class="hw-info">
                    <h4>استندهای دکمه‌ای و پروتکل RS-485</h4>
                    <p>دریافت پکت‌های فیزیکی از استندهای دکمه‌ای شعب با پورت سریال، اعتبارسنجی چکسام (CRC) و ممانعت از ارسال دستورات تکراری بر اثر فشردن مکرر کلید.</p>
                  </div>
                </div>
                <div class="hardware-pill-card">
                  <div class="hw-icon">🖨️</div>
                  <div class="hw-info">
                    <h4>پرینترهای حرارتی صدور فیش نوبت</h4>
                    <p>ارسال دستورات استاندارد ESC/POS جهت چاپ سریع فیش نوبت، کد QR رهگیری، بارکد و لوگوی باکیفیت بانک در کمتر از ۴۰۰ میلی‌ثانیه.</p>
                  </div>
                </div>
                <div class="hardware-pill-card">
                  <div class="hw-icon">👆</div>
                  <div class="hw-info">
                    <h4>اسکنر اثر انگشت بیومتریک Suprema</h4>
                    <p>یکپارچه‌سازی کامل Suprema SDK در اپلیکیشن‌های پذیرش، تطبیق الگوی انگشت با پایگاه داده و جلوگیری از ثبت‌نام‌های نامعتبر.</p>
                  </div>
                </div>
                <div class="hardware-pill-card">
                  <div class="hw-icon">📄</div>
                  <div class="hw-info">
                    <h4>اسکنر اسناد هویتی (WIA SDK)</h4>
                    <p>کنترل خودکار اسکنر مدارک، فشرده‌سازی در لحظه تصاویر و پیوست دیجیتال مدارک هویتی در هنگام تشکیل پرونده.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- TAB 3: DATABASE -->
          <div v-if="activeTab === 'database'" class="study-tab-pane">
            <div class="case-card-panel">
              <h3 class="panel-heading">💾 بهینه‌سازی SQL Server و رفع بن‌بست‌های همزمانی</h3>
              <p class="panel-desc">
                در شعب پرتراکم، فراخوانی همزمان چند باجه می‌توانست منجر به بروز Lock و Deadlock در پایگاه داده شود:
              </p>
              <ul class="solution-bullet-list">
                <li>
                  <span class="bullet-tag">Index Tuning:</span>
                  طراحی ایندکس‌های غیرخوشه‌ای (Non-clustered Indexes) همراه با فیلدهای Include شده برای کوئری‌های پرکاربرد صف‌بندی که میزان Logical Reads را تا ۷۰٪ کاهش داد.
                </li>
                <li>
                  <span class="bullet-tag">Concurrency Control:</span>
                  استفاده از سطح انزوای Snapshot Isolation و استراتژی‌های Optimistic Concurrency برای جلوگیری از بلاک شدن باجه‌های پذیرش در ساعات شلوغی.
                </li>
                <li>
                  <span class="bullet-tag">Stored Procedures:</span>
                  انتقال لاجیک حساس صدور نوبت به Stored Procedureهای کامپایل‌شده جهت حذف Overhead پارس کوئری در تراکنش‌های سنگین.
                </li>
              </ul>
            </div>
          </div>

          <!-- TAB 4: REAL-WORLD CHALLENGES & RESOLUTIONS -->
          <div v-if="activeTab === 'metrics'" class="study-tab-pane">
            <div class="case-card-panel">
              <h3 class="panel-heading">🛠️ چالش‌های محیط واقعی شعب و نحوه مهار آن‌ها</h3>
              <p class="panel-desc">
                استقرار در صدها شعبه بانکی در سراسر کشور با تنوع سخت‌افزاری و نوسانات بستر شبکه، چالش‌های عملیاتی مداومی به همراه داشت که با رویکرد مهندسی و خطایابی مستمر مهار شدند:
              </p>
              
              <ul class="solution-bullet-list">
                <li>
                  <span class="bullet-tag">اتصال و قطع ناگهانی سخت‌افزار:</span>
                  بروز قطعی ناگهانی کابل سریال، گیر کردن رول کاغذ پرینتر حرارتی یا اختلال در سنسورها؛ با پیاده‌سازی مکانیزم Reconnect خودکار و مدیریت State در کلاینت، از متوقف شدن کار پرسنل باجه ممانعت شد.
                </li>
                <li>
                  <span class="bullet-tag">ساعت‌های پیک و ترافیک سنگین:</span>
                  در روزهای پایان ماه یا ساعات شلوغی اول صبح، ارسال همزمان درخواست‌های نوبت‌گیری باعث بروز گلوگاه می‌شد که با بهینه‌سازی تدریجی ایندکس‌های دیتابیس و سبک‌سازی پیلود دیتای کلاینت‌ها رفع شد.
                </li>
                <li>
                  <span class="bullet-tag">ایزولاسیون خطای کیوسک‌ها:</span>
                  طراحی ماژولار به شکلی انجام شد که خرابی یا باگ احتمالی در یک کیوسک لمسی یا نمایشگر، سایر باجه‌های فعال شعبه را از مدار خارج نکند.
                </li>
              </ul>

              <div class="metrics-stat-grid">
                <div class="stat-card">
                  <span class="stat-val">از سال ۱۴۰۰</span>
                  <span class="stat-desc">سابقه توسعه، نگهداری و عیب‌یابی مستمر در سامانه نداپرداز</span>
                </div>
                <div class="stat-card">
                  <span class="stat-val">پایش مداوم</span>
                  <span class="stat-desc">لاگ‌گیری از خطاهای سخت‌افزاری و پچ‌های دوره‌ای نرم‌افزار</span>
                </div>
                <div class="stat-card">
                  <span class="stat-val">ایزولاسیون خطا</span>
                  <span class="stat-desc">تضمین ادامه کار باجه‌ها حتی در صورت قطعی موقت سخت‌افزار جانبی</span>
                </div>
                <div class="stat-card">
                  <span class="stat-val">شعب بانکی کشور</span>
                  <span class="stat-desc">پشتیبانی و استقرار فعال در بانک ملت، آینده، شهر و مراکز سازمانی</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <footer class="study-footer">
          <p class="study-footer-note">
            💡 این سیستم نمونه‌ای از تخصص مهندسی در پروژه‌های صنعتی، اینترپرایز و پایدار بر پایه .NET و WPF است.
          </p>
          <button @click="emit('close')" class="study-btn-primary">متوجه شدم</button>
        </footer>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.study-overlay {
  position: fixed;
  inset: 0;
  z-index: 10000;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
}

.study-dialog {
  width: 100%;
  max-width: 780px;
  max-height: 90vh;
  background: var(--item-bg, #ffffff);
  border: 1px solid var(--panel-border, #cbd5e1);
  border-radius: 20px;
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.35);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: studyScale 0.24s cubic-bezier(0.16, 1, 0.3, 1);
}

.study-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid var(--panel-border, #e2e8f0);
  background: var(--bar-bg, #f8fafc);
}

.study-header-badges {
  display: flex;
  align-items: center;
  gap: 10px;
}

.study-badge-tag {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: var(--neon, #4f46e5);
  background: rgba(79, 70, 229, 0.1);
  padding: 3px 8px;
  border-radius: 6px;
}

.study-badge-status {
  font-size: 0.75rem;
  font-weight: 600;
  color: #10b981;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.pulse-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 8px #10b981;
}

.study-close-btn {
  background: transparent;
  border: none;
  font-size: 1.1rem;
  color: var(--text-soft, #64748b);
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
}

.study-close-btn:hover {
  background: var(--item-hover-bg, #f1f5f9);
  color: var(--text-main, #0f172a);
}

.study-hero {
  padding: 20px 24px 12px;
}

.study-hero h2 {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--text-main, #0f172a);
  margin: 0 0 6px;
}

.study-hero-sub {
  font-size: 0.86rem;
  color: var(--text-secondary, #475569);
  line-height: 1.6;
  margin: 0;
}

.study-tabs-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 24px;
  border-bottom: 1px solid var(--panel-border, #e2e8f0);
  background: var(--bar-bg, #f8fafc);
  overflow-x: auto;
  scrollbar-width: none;
}

.study-tab-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 40px;
  min-height: 40px;
  max-height: 40px;
  padding: 0 16px;
  border-radius: 10px;
  border: 1px solid transparent;
  background: transparent;
  font-size: 0.82rem;
  font-weight: 600;
  line-height: 1;
  color: var(--text-secondary, #475569);
  cursor: pointer;
  white-space: nowrap;
  box-sizing: border-box;
  transition: all 0.15s ease;
  vertical-align: middle;
}

.tab-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.95rem;
  line-height: 1;
  width: 1.25em;
  height: 1.25em;
  flex-shrink: 0;
}

.tab-label {
  display: inline-block;
  line-height: 1.2;
}

.study-tab-btn:hover {
  background: var(--item-hover-bg, #f1f5f9);
}

.study-tab-btn.active {
  background: rgba(79, 70, 229, 0.12);
  color: var(--neon, #4f46e5);
  border-color: rgba(79, 70, 229, 0.2);
  font-weight: 700;
}

.study-body {
  padding: 20px 24px;
  overflow-y: auto;
  flex: 1;
}

.case-card-panel {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.panel-heading {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-main, #0f172a);
  margin: 0;
}

.panel-desc {
  font-size: 0.88rem;
  color: var(--text-secondary, #334155);
  line-height: 1.7;
  margin: 0;
}

.architecture-flow-box {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 8px;
}

.flow-step-box {
  display: flex;
  gap: 14px;
  padding: 14px;
  background: var(--bar-bg, #f8fafc);
  border: 1px solid var(--panel-border, #e2e8f0);
  border-radius: 12px;
}

.step-num {
  font-size: 1rem;
  font-weight: 800;
  color: var(--neon, #4f46e5);
  background: rgba(79, 70, 229, 0.1);
  padding: 4px 10px;
  border-radius: 8px;
  align-self: flex-start;
}

.step-details strong {
  display: block;
  font-size: 0.9rem;
  color: var(--text-main, #0f172a);
  margin-bottom: 4px;
}

.step-details p {
  font-size: 0.82rem;
  color: var(--text-secondary, #475569);
  line-height: 1.6;
  margin: 0;
}

.flow-connector {
  text-align: center;
  color: var(--neon, #4f46e5);
  font-size: 1.1rem;
  font-weight: 800;
}

.hardware-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

@media (max-width: 640px) {
  .hardware-grid {
    grid-template-columns: 1fr;
  }
}

.hardware-pill-card {
  display: flex;
  gap: 12px;
  padding: 14px;
  background: var(--bar-bg, #f8fafc);
  border: 1px solid var(--panel-border, #e2e8f0);
  border-radius: 12px;
}

.hw-icon {
  font-size: 1.6rem;
}

.hw-info h4 {
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--text-main, #0f172a);
  margin: 0 0 4px;
}

.hw-info p {
  font-size: 0.8rem;
  color: var(--text-secondary, #475569);
  line-height: 1.6;
  margin: 0;
}

.solution-bullet-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.solution-bullet-list li {
  padding: 12px 14px;
  background: var(--bar-bg, #f8fafc);
  border: 1px solid var(--panel-border, #e2e8f0);
  border-radius: 10px;
  font-size: 0.85rem;
  line-height: 1.7;
  color: var(--text-secondary, #334155);
}

.bullet-tag {
  font-weight: 800;
  color: var(--neon, #4f46e5);
  margin-left: 6px;
  display: inline-block;
}

[dir="rtl"] .bullet-tag {
  margin-left: 0;
  margin-right: 6px;
}

.metrics-stat-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-top: 6px;
}

@media (max-width: 640px) {
  .metrics-stat-grid {
    grid-template-columns: 1fr;
  }
}

.stat-card {
  padding: 16px;
  background: var(--bar-bg, #f8fafc);
  border: 1px solid var(--panel-border, #e2e8f0);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  border-right: 3px solid var(--neon, #4f46e5);
}

[dir="ltr"] .stat-card {
  border-right: 1px solid var(--panel-border, #e2e8f0);
  border-left: 3px solid var(--neon, #4f46e5);
}

.stat-val {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--neon, #4f46e5);
}

.stat-desc {
  font-size: 0.82rem;
  color: var(--text-secondary, #475569);
  line-height: 1.5;
}

.study-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 24px;
  border-top: 1px solid var(--panel-border, #e2e8f0);
  background: var(--bar-bg, #f8fafc);
  gap: 12px;
}

.study-footer-note {
  font-size: 0.78rem;
  color: var(--text-soft, #64748b);
  margin: 0;
}

.study-btn-primary {
  padding: 8px 18px;
  border-radius: 10px;
  background: var(--neon, #4f46e5);
  color: #ffffff;
  border: none;
  font-size: 0.84rem;
  font-weight: 700;
  cursor: pointer;
  flex-shrink: 0;
}

.study-btn-primary:hover {
  opacity: 0.92;
}

@keyframes studyScale {
  from {
    opacity: 0;
    transform: scale(0.96) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.study-fade-enter-active,
.study-fade-leave-active {
  transition: opacity 0.2s ease;
}

.study-fade-enter-from,
.study-fade-leave-to {
  opacity: 0;
}

@media (max-width: 640px) {
  .study-overlay {
    padding: 8px;
  }

  .study-dialog {
    max-height: 94vh;
    border-radius: 16px;
  }

  .study-header {
    padding: 12px 14px;
  }

  .study-hero {
    padding: 14px 14px 8px;
  }

  .study-hero h2 {
    font-size: 1.1rem;
  }

  .study-hero-sub {
    font-size: 0.8rem;
  }

  .study-tabs-bar {
    padding: 6px 10px;
    gap: 6px;
    -webkit-overflow-scrolling: touch;
  }

  .study-tab-btn {
    height: 36px;
    min-height: 36px;
    max-height: 36px;
    padding: 0 12px;
    font-size: 0.76rem;
    gap: 6px;
  }

  .study-body {
    padding: 14px 12px;
  }

  .panel-heading {
    font-size: 0.98rem;
  }

  .solution-bullet-list li {
    font-size: 0.82rem;
  }

  .study-footer {
    padding: 12px 14px;
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }

  .study-btn-primary {
    width: 100%;
    text-align: center;
  }
}
</style>

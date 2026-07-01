<script setup>
import { onMounted, onUnmounted, ref, nextTick } from 'vue';
import { useWorkExperience } from '../../../composables/useWorkExperience';

const { workExperiences } = useWorkExperience();

const observer = ref(null);

onMounted(async () => {
  await nextTick();

  observer.value = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      // Toggle active class based on intersection
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      } else {
        // Optional: remove active class when scrolling away to re-trigger effect
        entry.target.classList.remove('active');
      }
    });
  }, {
    threshold: 0.2, // Trigger when 20% visible
    rootMargin: "-100px 0px -100px 0px" // Trigger slightly inwards
  });

  const items = document.querySelectorAll('.timeline-item');
  items.forEach(el => observer.value.observe(el));
});

onUnmounted(() => {
  if (observer.value) observer.value.disconnect();
});
</script>

<template>
  <div class="timeline-container">
    <div class="neon-line"></div>

    <div v-for="(job, index) in workExperiences" :key="job.id" class="timeline-item">

      <!-- Right Side: Header (In RTL context, first child is Right) -->
      <div class="time-header glass-panel">
        <h3>{{ job.title }}</h3>
        <div class="company-row">
           <span class="company-badge">{{ job.company }}</span>
           <span class="period">{{ job.period }}</span>
        </div>
      </div>

      <!-- Center: Marker -->
      <div class="time-marker">
        <div class="neon-dot"></div>
      </div>

      <!-- Left Side: Content -->
      <div class="time-body glass-panel">
        <div class="desc-content">
          <ul v-if="Array.isArray(job.description)" class="desc-list">
            <li v-for="(line, i) in job.description" :key="i">{{ line }}</li>
          </ul>
          <p v-else>{{ job.description }}</p>
        </div>

        <div class="tech-stack" v-if="job.technologies">
          <span v-for="t in job.technologies" :key="t" class="tech-pill">{{ t }}</span>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.timeline-container {
  position: relative;
  padding: 40px 10px;
  max-width: 1000px;
  margin: 0 auto;
}

/* The vertical neon line */
.neon-line {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%; /* Centered */
  width: 2px;
  background: rgba(255, 255, 255, 0.1);
  transform: translateX(-50%);
  z-index: 0;
  box-shadow: 0 0 5px rgba(255, 255, 255, 0.05);
}

.timeline-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start; /* Align top */
  margin-bottom: 60px;
  position: relative;
  z-index: 1;
  opacity: 0.3; /* Dimmed by default */
  filter: blur(2px);
  transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  transform: scale(0.95);
}

.timeline-item.active {
  opacity: 1;
  filter: blur(0);
  transform: scale(1);
}

.timeline-item.active .neon-dot {
  background: var(--neon);
  box-shadow: 0 0 10px var(--neon), 0 0 20px var(--neon);
  border-color: #fff;
}

.timeline-item.active .glass-panel {
  border-color: var(--neon);
}

/* Columns */
.time-header, .time-body {
  width: 45%;
  padding: 20px;
  border: 1px solid var(--panel-border);
  border-radius: 12px;
  background: var(--item-bg);
  transition: 0.3s;
}

.time-header::after, .time-body::after {
  border-radius: 11px !important;
}

.time-header {
  text-align: right;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.time-body {
  text-align: right;
}

.time-marker {
  width: 10%;
  display: flex;
  justify-content: center;
  padding-top: 20px; /* Align dot with content roughly */
}

.neon-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #222;
  border: 2px solid #555;
  transition: 0.5s;
}

/* Header Styles */
.time-header h3 {
  margin: 0;
  color: var(--text-main);
  font-size: 1.1rem;
}

.company-row {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.company-badge {
  font-weight: bold;
  color: var(--neon);
}

.period {
  font-size: 0.8rem;
  color: var(--text-muted);
  font-family: monospace;
}

/* Body Styles */
.desc-list {
  margin: 0;
  padding-right: 20px;
  font-size: 0.9rem;
  color: var(--text-muted);
  line-height: 1.6;
}

.desc-list li {
  margin-bottom: 5px;
}

.tech-stack {
  margin-top: 15px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tech-pill {
  font-size: 0.7rem;
  background: rgba(255, 255, 255, 0.05);
  padding: 2px 8px;
  border-radius: 4px;
  color: var(--text-secondary);
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .timeline-container {
    padding: 20px 0;
  }

  .neon-line {
    left: 20px; /* Move line to right/left side depending on RTL? */
    /* Assuming RTL: Left side of screen is "Left". */
    /* Actually let's just stack them and remove the central line complexity */
    display: none;
  }

  .timeline-item {
    flex-direction: column;
    gap: 15px;
    margin-bottom: 40px;
  }

  .time-marker {
    display: none;
  }

  .time-header, .time-body {
    width: 100%;
  }

  .timeline-item.active {
    transform: none;
  }
}
</style>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useI18n } from '../../composables/useI18n';

const props = defineProps({
  target: {
    type: Number,
    required: true
  },
  duration: {
    type: Number,
    default: 1200
  },
  prefix: {
    type: String,
    default: ''
  },
  suffix: {
    type: String,
    default: ''
  }
});

const { isRtl } = useI18n();
const currentVal = ref(0);
const rootRef = ref(null);
let observer = null;
let animationFrameId = null;

const toPersianDigits = (num) => {
  const pDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num.toString().replace(/\d/g, (d) => pDigits[+d]);
};

const formatValue = (num) => {
  if (isRtl.value) {
    return toPersianDigits(num);
  }
  return num.toString();
};

const startAnimation = () => {
  const startTime = performance.now();
  const startNum = 0;
  const endNum = props.target;

  const easeOutQuart = (x) => 1 - Math.pow(1 - x, 4);

  const step = (now) => {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / props.duration, 1);
    const eased = easeOutQuart(progress);
    currentVal.value = Math.round(startNum + (endNum - startNum) * eased);

    if (progress < 1) {
      animationFrameId = requestAnimationFrame(step);
    } else {
      currentVal.value = endNum;
    }
  };

  cancelAnimationFrame(animationFrameId);
  animationFrameId = requestAnimationFrame(step);
};

onMounted(() => {
  if (typeof window !== 'undefined' && 'IntersectionObserver' in window && rootRef.value) {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            startAnimation();
            if (observer) observer.disconnect();
          }
        });
      },
      { threshold: 0.2 }
    );
    observer.observe(rootRef.value);
  } else {
    startAnimation();
  }
});

onUnmounted(() => {
  if (observer) observer.disconnect();
  cancelAnimationFrame(animationFrameId);
});

watch(() => props.target, () => {
  startAnimation();
});
</script>

<template>
  <span ref="rootRef" class="animated-count-up">
    <span v-if="prefix" class="count-prefix">{{ prefix }}</span>
    <span class="count-number">{{ formatValue(currentVal) }}</span>
    <span v-if="suffix" class="count-suffix">{{ suffix }}</span>
  </span>
</template>

<style scoped>
.animated-count-up {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum";
}

.count-prefix,
.count-suffix {
  margin: 0 1px;
}
</style>

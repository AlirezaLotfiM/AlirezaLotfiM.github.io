import { ref, onMounted, onUnmounted } from 'vue';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

export function useSmoothScroll() {
  let lenisInstance = null;
  let rafId = null;
  const isEnabled = ref(true);

  onMounted(() => {
    if (typeof window === 'undefined') return;

    // Respect reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      isEnabled.value = false;
      return;
    }

    try {
      lenisInstance = new Lenis({
        lerp: 0.09,
        duration: 1.15,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1.0,
        touchMultiplier: 1.2,
        autoRaf: false
      });

      const raf = (time) => {
        lenisInstance?.raf(time);
        rafId = requestAnimationFrame(raf);
      };
      rafId = requestAnimationFrame(raf);
    } catch (e) {
      console.warn('Smooth scroll fallback:', e);
    }
  });

  onUnmounted(() => {
    if (rafId) cancelAnimationFrame(rafId);
    if (lenisInstance) {
      lenisInstance.destroy();
      lenisInstance = null;
    }
  });

  const scrollTo = (target, options = {}) => {
    if (lenisInstance) {
      lenisInstance.scrollTo(target, {
        offset: options.offset || 0,
        duration: options.duration || 1.1,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
      });
    } else if (typeof window !== 'undefined') {
      if (typeof target === 'string') {
        const el = document.querySelector(target);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      } else if (typeof target === 'number') {
        window.scrollTo({ top: target, behavior: 'smooth' });
      }
    }
  };

  return {
    scrollTo,
    isEnabled
  };
}

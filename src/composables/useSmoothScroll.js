import { ref, onMounted, onUnmounted } from 'vue';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

let lenisInstance = null;
let rafId = null;
let activeSubscribers = 0;
const isEnabled = ref(true);

export function useSmoothScroll() {
  const isStopped = ref(false);

  const start = () => {
    if (lenisInstance) {
      lenisInstance.start();
      isStopped.value = false;
    }
  };

  const stop = () => {
    if (lenisInstance) {
      lenisInstance.stop();
      isStopped.value = true;
    }
  };

  onMounted(() => {
    if (typeof window === 'undefined') return;
    activeSubscribers++;

    if (lenisInstance) return;

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
        autoRaf: false,
        allowNestedScroll: true,
        prevent: (node) => {
          if (!node || !(node instanceof HTMLElement)) return false;

          // 1. Explicit data-lenis-prevent attribute
          if (node.hasAttribute('data-lenis-prevent') || node.closest('[data-lenis-prevent]')) {
            return true;
          }

          // 2. Modals, Dialogs, Drawers, Overlays, Code blocks, and Terminal
          const insideScrollableContainer = node.closest(
            '[role="dialog"], [aria-modal="true"], .study-dialog, .study-overlay, .study-body, ' +
            '.note-reader-card, .note-reader-overlay, .reader-body-content, ' +
            '.terminal-window, .terminal-overlay, .terminal-body, ' +
            '.palette-dialog, .palette-backdrop, .palette-results-list, ' +
            '.modal-window, .modal-overlay, .diagram-wrapper, ' +
            '.qr-modal-card, .qr-modal-overlay, .resume-mode-container, ' +
            'pre, code, textarea'
          );
          if (insideScrollableContainer) {
            return true;
          }

          // 3. Any element that has its own scrollable vertical area
          let curr = node;
          while (curr && curr !== document.body && curr !== document.documentElement) {
            if (curr instanceof HTMLElement) {
              const style = window.getComputedStyle(curr);
              const overflowY = style.overflowY;
              const overflowX = style.overflowX;
              const hasScrollY = (overflowY === 'auto' || overflowY === 'scroll') && curr.scrollHeight > curr.clientHeight;
              const hasScrollX = (overflowX === 'auto' || overflowX === 'scroll') && curr.scrollWidth > curr.clientWidth;
              if (hasScrollY || hasScrollX) {
                return true;
              }
            }
            curr = curr.parentElement;
          }

          return false;
        }
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
    activeSubscribers--;
    if (activeSubscribers <= 0) {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      if (lenisInstance) {
        lenisInstance.destroy();
        lenisInstance = null;
      }
      activeSubscribers = 0;
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
    stop,
    start,
    isStopped,
    isEnabled
  };
}

import { ref, computed } from 'vue';
import { useAudioSynth } from './useAudioSynth';

const THEME_STORAGE_KEY = 'user-theme-v5';

const themes = [
  {
    id: "swiss-light",
    name: "Swiss Minimalist Light",
    label: "☀ روشن",
    icon: "☀",
    colors: {
      "--bg-main": "#ffffff",
      "--text-main": "#09090b",
      "--text-secondary": "#27272a",
      "--text-soft": "#52525b",
      "--panel-bg": "#ffffff",
      "--panel-border": "#e4e4e7",
      "--item-bg": "#ffffff",
      "--item-hover-bg": "#f4f4f5",
      "--bar-bg": "#ffffff",
      "--neon": "#2563eb",
      "--accent-strong": "#1d4ed8",
      "--glass-panel-base": "#ffffff",
      "--glass-panel-highlight": "rgba(37, 99, 235, 0.04)",
      "--logo-filter": "drop-shadow(0 2px 8px rgba(37, 99, 235, 0.15))"
    }
  },
  {
    id: "paper-reader",
    name: "Fidibo Warm Paper",
    label: "📖 کتابخوان",
    icon: "📖",
    colors: {
      "--bg-main": "#f8f4ec",
      "--text-main": "#2b2621",
      "--text-secondary": "#49423b",
      "--text-soft": "#786e64",
      "--panel-bg": "#f2eadb",
      "--panel-border": "#e2d7c5",
      "--item-bg": "#faf6ee",
      "--item-hover-bg": "#eae0cf",
      "--bar-bg": "#f3ebe0",
      "--neon": "#b45309",
      "--accent-strong": "#92400e",
      "--glass-panel-base": "#f2eadb",
      "--glass-panel-highlight": "rgba(180, 83, 9, 0.05)",
      "--logo-filter": "drop-shadow(0 2px 8px rgba(180, 83, 9, 0.15))"
    }
  },
  {
    id: "space-glass",
    name: "Space Obsidian Dark",
    label: "☾ تاریک",
    icon: "☾",
    colors: {
      "--bg-main": "#080d1a",
      "--text-main": "#f8fafc",
      "--text-secondary": "#cbd5e1",
      "--text-soft": "#94a3b8",
      "--panel-bg": "rgba(15, 23, 42, 0.82)",
      "--panel-border": "rgba(148, 163, 184, 0.18)",
      "--item-bg": "rgba(15, 23, 42, 0.72)",
      "--item-hover-bg": "rgba(30, 41, 59, 0.85)",
      "--bar-bg": "rgba(15, 23, 42, 0.88)",
      "--neon": "#38bdf8",
      "--accent-strong": "#0284c7",
      "--glass-panel-base": "rgba(15, 23, 42, 0.85)",
      "--glass-panel-highlight": "rgba(56, 189, 248, 0.04)",
      "--logo-filter": "brightness(0) invert(1) drop-shadow(0 0 8px rgba(56, 189, 248, 0.5))"
    }
  }
];

const currentTheme = ref(themes[0]);
const currentThemeColor = computed(() => currentTheme.value.colors["--neon"]);
const isDark = computed(() => currentTheme.value.id === "space-glass");
const isPaper = computed(() => currentTheme.value.id === "paper-reader");
const isLight = computed(() => currentTheme.value.id === "swiss-light");

const currentThemeLabel = computed(() => currentTheme.value.label);
const nextThemeLabel = computed(() => {
  if (currentTheme.value.id === "swiss-light") return "📖 کتابخوان";
  if (currentTheme.value.id === "paper-reader") return "☾ تاریک";
  return "☀ روشن";
});

function hexToRgb(hex) {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const fullHex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
  return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : null;
}

function applyTheme(theme) {
  for (const [key, value] of Object.entries(theme.colors)) {
    if (key === "--glass-panel-base" || key === "--glass-panel-highlight") continue;
    document.documentElement.style.setProperty(key, value);
  }
  const glassBase = theme.colors["--glass-panel-base"];
  const glassHighlight = theme.colors["--glass-panel-highlight"];
  document.documentElement.style.setProperty(
    "--glass-panel",
    `linear-gradient(145deg, ${glassBase}, ${glassHighlight})`
  );
  document.documentElement.style.setProperty(
    "--accent-strong",
    theme.colors["--accent-strong"] || theme.colors["--neon"]
  );

  const rgbString = hexToRgb(theme.colors["--neon"]);
  if (rgbString) {
    document.documentElement.style.setProperty("--neon-rgb", rgbString);
  }

  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', theme.id);
    document.documentElement.classList.toggle('dark', theme.id === 'space-glass');
    document.documentElement.classList.toggle('paper', theme.id === 'paper-reader');
    document.documentElement.classList.toggle('light', theme.id === 'swiss-light');
  }

  localStorage.setItem(THEME_STORAGE_KEY, theme.id);
  currentTheme.value = theme;
}

function initTheme() {
  const savedId = typeof localStorage !== 'undefined' ? localStorage.getItem(THEME_STORAGE_KEY) : null;
  if (savedId) {
    const found = themes.find(t => t.id === savedId);
    if (found) applyTheme(found);
    else if (savedId === 'liquid-glass') applyTheme(themes[2]);
    else applyTheme(themes[0]);
  } else if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    applyTheme(themes[2]); // Space Obsidian (Dark)
  } else {
    applyTheme(themes[0]); // Swiss Light
  }
}

initTheme();

export function useTheme() {
  const { playThemeChirp } = useAudioSynth();

  const setTheme = (themeId) => {
    const theme = themes.find(t => t.id === themeId);
    if (theme) {
      applyTheme(theme);
    }
  };

  const toggleTheme = () => {
    try {
      playThemeChirp();
    } catch (e) {}
    const currentIndex = themes.findIndex(t => t.id === currentTheme.value.id);
    const nextIndex = (currentIndex + 1) % themes.length;
    applyTheme(themes[nextIndex]);
  };

  return {
    themes,
    currentTheme,
    currentThemeColor,
    isDark,
    isPaper,
    isLight,
    currentThemeLabel,
    nextThemeLabel,
    setTheme,
    toggleTheme
  };
}

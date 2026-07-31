import { ref, computed } from 'vue';

const THEME_STORAGE_KEY = 'user-theme-v4';

const themes = [
  {
    id: "swiss-light",
    name: "Swiss Minimalist Light",
    colors: {
      "--bg-main": "#f8fafc",
      "--text-main": "#0f172a",
      "--text-secondary": "#334155",
      "--text-soft": "#64748b",
      "--panel-bg": "rgba(255, 255, 255, 0.95)",
      "--panel-border": "rgba(203, 213, 225, 0.8)",
      "--item-bg": "#ffffff",
      "--item-hover-bg": "#f1f5f9",
      "--bar-bg": "#f8fafc",
      "--neon": "#4f46e5",
      "--accent-strong": "#4338ca",
      "--glass-panel-base": "rgba(255, 255, 255, 0.95)",
      "--glass-panel-highlight": "rgba(79, 70, 229, 0.04)"
    }
  },
  {
    id: "space-glass",
    name: "Space Glass",
    colors: {
      "--bg-main": "#0a0f1d",
      "--text-main": "#f1f5f9",
      "--text-secondary": "rgba(226, 232, 240, 0.82)",
      "--text-soft": "#94a3b8",
      "--panel-bg": "rgba(15, 23, 42, 0.62)",
      "--panel-border": "rgba(148, 163, 184, 0.12)",
      "--item-bg": "rgba(30, 41, 59, 0.4)",
      "--item-hover-bg": "rgba(51, 65, 85, 0.6)",
      "--bar-bg": "rgba(15, 23, 42, 0.8)",
      "--neon": "#38bdf8",
      "--accent-strong": "#0284c7",
      "--glass-panel-base": "rgba(15, 23, 42, 0.82)",
      "--glass-panel-highlight": "rgba(56, 189, 248, 0.04)"
    }
  },
  {
    id: "liquid-glass",
    name: "Liquid Glass",
    colors: {
      "--bg-main": "#e8f1f9",
      "--text-main": "#1e293b",
      "--text-secondary": "#475569",
      "--text-soft": "#64748b",
      "--panel-bg": "rgba(255, 255, 255, 0.75)",
      "--panel-border": "rgba(92, 144, 199, 0.2)",
      "--item-bg": "rgba(255, 255, 255, 0.4)",
      "--item-hover-bg": "rgba(92, 144, 199, 0.12)",
      "--bar-bg": "rgba(255, 255, 255, 0.8)",
      "--neon": "#1d4ed8",
      "--accent-strong": "#1e40af",
      "--glass-panel-base": "rgba(255, 255, 255, 0.85)",
      "--glass-panel-highlight": "rgba(219, 234, 254, 0.4)"
    }
  }
];

const currentTheme = ref(themes[0]);
const currentThemeColor = computed(() => currentTheme.value.colors["--neon"]);

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

  localStorage.setItem(THEME_STORAGE_KEY, theme.id);
  currentTheme.value = theme;
}

function initTheme() {
  const savedId = localStorage.getItem(THEME_STORAGE_KEY);
  if (savedId) {
    const found = themes.find(t => t.id === savedId);
    if (found) applyTheme(found);
    else applyTheme(themes[0]);
  } else {
    applyTheme(themes[0]);
  }
}

initTheme();

export function useTheme() {
  const setTheme = (themeId) => {
    const theme = themes.find(t => t.id === themeId);
    if (theme) {
      applyTheme(theme);
    }
  };

  const toggleTheme = () => {
    const currentIndex = themes.findIndex(t => t.id === currentTheme.value.id);
    const nextIndex = (currentIndex + 1) % themes.length;
    applyTheme(themes[nextIndex]);
  };

  return {
    themes,
    currentTheme,
    currentThemeColor,
    setTheme,
    toggleTheme
  };
}

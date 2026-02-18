import { ref, computed } from 'vue';

const themes = [
  {
    id: "matrix-green",
    name: "Matrix Green",
    colors: {
      "--bg-main": "#050505",
      "--text-main": "#ffffff",
      "--text-secondary": "#9ca3af",
      "--panel-bg": "rgba(20, 20, 20, 0.6)",
      "--panel-border": "rgba(255, 255, 255, 0.1)",
      "--item-bg": "rgba(255, 255, 255, 0.02)",
      "--item-hover-bg": "rgba(255, 255, 255, 0.05)",
      "--bar-bg": "rgba(0, 0, 0, 0.4)",
      "--neon": "#67FF64",
      "--glass-panel-base": "rgba(20,20,20,0.9)",
      "--glass-panel-highlight": "rgba(103, 255, 100, 0.03)"
    }
  },
  {
    id: "cyber-blue",
    name: "Cyber Blue",
    colors: {
      "--bg-main": "#050505",
      "--text-main": "#ffffff",
      "--text-secondary": "#9ca3af",
      "--panel-bg": "rgba(20, 20, 20, 0.6)",
      "--panel-border": "rgba(0, 243, 255, 0.1)",
      "--item-bg": "rgba(0, 243, 255, 0.02)",
      "--item-hover-bg": "rgba(0, 243, 255, 0.05)",
      "--bar-bg": "rgba(0, 0, 0, 0.4)",
      "--neon": "#00f3ff",
      "--glass-panel-base": "rgba(20,20,20,0.9)",
      "--glass-panel-highlight": "rgba(0, 243, 255, 0.03)"
    }
  },
  {
    id: "crimson-red",
    name: "Crimson Red",
    colors: {
      "--bg-main": "#050505",
      "--text-main": "#ffffff",
      "--text-secondary": "#9ca3af",
      "--panel-bg": "rgba(20, 20, 20, 0.6)",
      "--panel-border": "rgba(255, 0, 85, 0.1)",
      "--item-bg": "rgba(255, 0, 85, 0.02)",
      "--item-hover-bg": "rgba(255, 0, 85, 0.05)",
      "--bar-bg": "rgba(0, 0, 0, 0.4)",
      "--neon": "#ff0055",
      "--glass-panel-base": "rgba(20,20,20,0.9)",
      "--glass-panel-highlight": "rgba(255, 0, 85, 0.03)"
    }
  },
  {
    id: "synth-purple",
    name: "Synth Purple",
    colors: {
      "--bg-main": "#050505",
      "--text-main": "#ffffff",
      "--text-secondary": "#9ca3af",
      "--panel-bg": "rgba(20, 20, 20, 0.6)",
      "--panel-border": "rgba(188, 19, 254, 0.1)",
      "--item-bg": "rgba(188, 19, 254, 0.02)",
      "--item-hover-bg": "rgba(188, 19, 254, 0.05)",
      "--bar-bg": "rgba(0, 0, 0, 0.4)",
      "--neon": "#bc13fe",
      "--glass-panel-base": "rgba(20,20,20,0.9)",
      "--glass-panel-highlight": "rgba(188, 19, 254, 0.03)"
    }
  },
  {
    id: "clean-light",
    name: "Clean Light",
    colors: {
      "--bg-main": "#f5f5f7",
      "--text-main": "#1d1d1f",
      "--text-secondary": "#86868b",
      "--panel-bg": "rgba(255, 255, 255, 0.7)",
      "--panel-border": "rgba(0, 0, 0, 0.1)",
      "--item-bg": "rgba(0, 0, 0, 0.03)",
      "--item-hover-bg": "rgba(0, 0, 0, 0.06)",
      "--bar-bg": "rgba(0, 0, 0, 0.1)",
      "--neon": "#007aff",
      "--glass-panel-base": "rgba(255, 255, 255, 0.9)",
      "--glass-panel-highlight": "rgba(0, 122, 255, 0.05)"
    }
  },
  {
    id: "solarized-dark",
    name: "Solarized Dark",
    colors: {
      "--bg-main": "#002b36",
      "--text-main": "#93a1a1",
      "--text-secondary": "#586e75",
      "--panel-bg": "rgba(7, 54, 66, 0.8)",
      "--panel-border": "rgba(147, 161, 161, 0.1)",
      "--item-bg": "rgba(147, 161, 161, 0.02)",
      "--item-hover-bg": "rgba(147, 161, 161, 0.05)",
      "--bar-bg": "rgba(0, 0, 0, 0.2)",
      "--neon": "#2aa198",
      "--glass-panel-base": "rgba(7, 54, 66, 0.95)",
      "--glass-panel-highlight": "rgba(42, 161, 152, 0.05)"
    }
  },
  {
    id: "dracula",
    name: "Dracula",
    colors: {
      "--bg-main": "#282a36",
      "--text-main": "#f8f8f2",
      "--text-secondary": "#6272a4",
      "--panel-bg": "rgba(68, 71, 90, 0.8)",
      "--panel-border": "rgba(189, 147, 249, 0.2)",
      "--item-bg": "rgba(189, 147, 249, 0.05)",
      "--item-hover-bg": "rgba(189, 147, 249, 0.1)",
      "--bar-bg": "rgba(40, 42, 54, 0.4)",
      "--neon": "#bd93f9",
      "--glass-panel-base": "rgba(40, 42, 54, 0.9)",
      "--glass-panel-highlight": "rgba(189, 147, 249, 0.05)"
    }
  },
  {
    id: "retro-gruv",
    name: "Retro Gruv",
    colors: {
      "--bg-main": "#282828",
      "--text-main": "#ebdbb2",
      "--text-secondary": "#a89984",
      "--panel-bg": "rgba(50, 48, 47, 0.8)",
      "--panel-border": "rgba(215, 153, 33, 0.2)",
      "--item-bg": "rgba(215, 153, 33, 0.05)",
      "--item-hover-bg": "rgba(215, 153, 33, 0.1)",
      "--bar-bg": "rgba(0, 0, 0, 0.3)",
      "--neon": "#fabd2f",
      "--glass-panel-base": "rgba(40, 40, 40, 0.9)",
      "--glass-panel-highlight": "rgba(250, 189, 47, 0.05)"
    }
  },
  {
    id: "sky-blue",
    name: "Sky Blue",
    colors: {
      "--bg-main": "#e0f7fa",
      "--text-main": "#006064",
      "--text-secondary": "#0097a7",
      "--panel-bg": "rgba(255, 255, 255, 0.7)",
      "--panel-border": "rgba(0, 188, 212, 0.2)",
      "--item-bg": "rgba(0, 188, 212, 0.05)",
      "--item-hover-bg": "rgba(0, 188, 212, 0.1)",
      "--bar-bg": "rgba(0, 96, 100, 0.1)",
      "--neon": "#00acc1",
      "--glass-panel-base": "rgba(255, 255, 255, 0.8)",
      "--glass-panel-highlight": "rgba(0, 188, 212, 0.1)"
    }
  }
];

const currentTheme = ref(themes[0]);
const currentThemeColor = computed(() => currentTheme.value.colors["--neon"]);

// Helper to apply theme variables
function applyTheme(theme) {
  for (const [key, value] of Object.entries(theme.colors)) {
    if (key === "--glass-panel-base" || key === "--glass-panel-highlight") continue;
    document.documentElement.style.setProperty(key, value);
  }
  // Construct glass-panel gradient
  const glassBase = theme.colors["--glass-panel-base"];
  const glassHighlight = theme.colors["--glass-panel-highlight"];
  document.documentElement.style.setProperty(
    "--glass-panel",
    `linear-gradient(145deg, ${glassBase}, ${glassHighlight})`
  );

  // Persist
  localStorage.setItem('user-theme', theme.id);
  currentTheme.value = theme;
}

function initTheme() {
  const savedId = localStorage.getItem('user-theme');
  if (savedId) {
    const found = themes.find(t => t.id === savedId);
    if (found) applyTheme(found);
    else applyTheme(themes[0]);
  } else {
    applyTheme(themes[0]);
  }
}

// Initial call (side effect on import, ensuring theme loads immediately)
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

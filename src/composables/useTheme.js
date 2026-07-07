import { ref, computed } from 'vue';

const THEME_STORAGE_KEY = 'user-theme-v3';

const themes = [
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
  },
  // --- Matrix Variants ---
  {
    id: "matrix-green",
    name: "Matrix Green",
    colors: {
      "--bg-main": "#050505",
      "--text-main": "#ffffff",
      "--text-secondary": "#9ca3af",
      "--text-soft": "#4b5563",
      "--panel-bg": "rgba(20, 20, 20, 0.6)",
      "--panel-border": "rgba(255, 255, 255, 0.1)",
      "--item-bg": "rgba(255, 255, 255, 0.02)",
      "--item-hover-bg": "rgba(255, 255, 255, 0.05)",
      "--bar-bg": "rgba(0, 0, 0, 0.4)",
      "--neon": "#67FF64",
      "--accent-strong": "#67FF64",
      "--glass-panel-base": "rgba(20,20,20,0.9)",
      "--glass-panel-highlight": "rgba(103, 255, 100, 0.03)"
    }
  },
  {
    id: "matrix-red",
    name: "Matrix Red",
    colors: {
      "--bg-main": "#050000",
      "--text-main": "#ffb3b3",
      "--text-secondary": "#ff6666",
      "--text-soft": "#aa4444",
      "--panel-bg": "rgba(30, 0, 0, 0.6)",
      "--panel-border": "rgba(255, 0, 0, 0.2)",
      "--item-bg": "rgba(255, 0, 0, 0.05)",
      "--item-hover-bg": "rgba(255, 0, 0, 0.1)",
      "--bar-bg": "rgba(20, 0, 0, 0.4)",
      "--neon": "#ff0000",
      "--accent-strong": "#ff0000",
      "--glass-panel-base": "rgba(20,0,0,0.9)",
      "--glass-panel-highlight": "rgba(255, 0, 0, 0.03)"
    }
  },
  {
    id: "matrix-blue",
    name: "Matrix Blue",
    colors: {
      "--bg-main": "#000508",
      "--text-main": "#b3e0ff",
      "--text-secondary": "#66b2ff",
      "--text-soft": "#4ba3ff",
      "--panel-bg": "rgba(0, 10, 30, 0.6)",
      "--panel-border": "rgba(0, 100, 255, 0.2)",
      "--item-bg": "rgba(0, 100, 255, 0.05)",
      "--item-hover-bg": "rgba(0, 100, 255, 0.1)",
      "--bar-bg": "rgba(0, 5, 20, 0.4)",
      "--neon": "#0088ff",
      "--accent-strong": "#0088ff",
      "--glass-panel-base": "rgba(0,10,30,0.9)",
      "--glass-panel-highlight": "rgba(0, 136, 255, 0.03)"
    }
  },

  // --- Cyber / Neon / Special (Dark) ---
  {
    id: "cyber-blue",
    name: "Cyber Blue",
    colors: {
      "--bg-main": "#050505",
      "--text-main": "#ffffff",
      "--text-secondary": "#9ca3af",
      "--text-soft": "#4b5563",
      "--panel-bg": "rgba(20, 20, 20, 0.6)",
      "--panel-border": "rgba(0, 243, 255, 0.1)",
      "--item-bg": "rgba(0, 243, 255, 0.02)",
      "--item-hover-bg": "rgba(0, 243, 255, 0.05)",
      "--bar-bg": "rgba(0, 0, 0, 0.4)",
      "--neon": "#00f3ff",
      "--accent-strong": "#00f3ff",
      "--glass-panel-base": "rgba(20,20,20,0.9)",
      "--glass-panel-highlight": "rgba(0, 243, 255, 0.03)"
    }
  },
  {
    id: "cyberpunk-neon",
    name: "Cyberpunk Neon",
    colors: {
      "--bg-main": "#0b0b0b",
      "--text-main": "#fcee0a",
      "--text-secondary": "#00f0ff",
      "--text-soft": "#ff007f",
      "--panel-bg": "rgba(20, 20, 25, 0.8)",
      "--panel-border": "rgba(252, 238, 10, 0.2)",
      "--item-bg": "rgba(252, 238, 10, 0.05)",
      "--item-hover-bg": "rgba(0, 240, 255, 0.1)",
      "--bar-bg": "rgba(0, 0, 0, 0.5)",
      "--neon": "#fcee0a",
      "--accent-strong": "#00f0ff",
      "--glass-panel-base": "rgba(20, 20, 25, 0.95)",
      "--glass-panel-highlight": "rgba(252, 238, 10, 0.05)"
    }
  },
  {
    id: "synthwave-84",
    name: "Synthwave '84",
    colors: {
      "--bg-main": "#2b213a",
      "--text-main": "#fffb96",
      "--text-secondary": "#ff7edb",
      "--text-soft": "#848bb3",
      "--panel-bg": "rgba(36, 27, 47, 0.8)",
      "--panel-border": "rgba(255, 126, 219, 0.2)",
      "--item-bg": "rgba(255, 126, 219, 0.05)",
      "--item-hover-bg": "rgba(36, 224, 255, 0.1)",
      "--bar-bg": "rgba(43, 33, 58, 0.4)",
      "--neon": "#ff7edb",
      "--accent-strong": "#ff7edb",
      "--glass-panel-base": "rgba(43, 33, 58, 0.9)",
      "--glass-panel-highlight": "rgba(255, 126, 219, 0.05)"
    }
  },
  {
    id: "crimson-red",
    name: "Crimson Red",
    colors: {
      "--bg-main": "#050505",
      "--text-main": "#ffffff",
      "--text-secondary": "#9ca3af",
      "--text-soft": "#9ca3af",
      "--panel-bg": "rgba(20, 20, 20, 0.6)",
      "--panel-border": "rgba(255, 0, 85, 0.1)",
      "--item-bg": "rgba(255, 0, 85, 0.02)",
      "--item-hover-bg": "rgba(255, 0, 85, 0.05)",
      "--bar-bg": "rgba(0, 0, 0, 0.4)",
      "--neon": "#ff0055",
      "--accent-strong": "#ff0055",
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
      "--text-soft": "#9ca3af",
      "--panel-bg": "rgba(20, 20, 20, 0.6)",
      "--panel-border": "rgba(188, 19, 254, 0.1)",
      "--item-bg": "rgba(188, 19, 254, 0.02)",
      "--item-hover-bg": "rgba(188, 19, 254, 0.05)",
      "--bar-bg": "rgba(0, 0, 0, 0.4)",
      "--neon": "#bc13fe",
      "--accent-strong": "#bc13fe",
      "--glass-panel-base": "rgba(20,20,20,0.9)",
      "--glass-panel-highlight": "rgba(188, 19, 254, 0.03)"
    }
  },

  // --- Popular Dark Themes ---
  {
    id: "dracula",
    name: "Dracula",
    colors: {
      "--bg-main": "#282a36",
      "--text-main": "#f8f8f2",
      "--text-secondary": "#6272a4",
      "--text-soft": "#6272a4",
      "--panel-bg": "rgba(68, 71, 90, 0.8)",
      "--panel-border": "rgba(189, 147, 249, 0.2)",
      "--item-bg": "rgba(189, 147, 249, 0.05)",
      "--item-hover-bg": "rgba(189, 147, 249, 0.1)",
      "--bar-bg": "rgba(40, 42, 54, 0.4)",
      "--neon": "#bd93f9",
      "--accent-strong": "#bd93f9",
      "--glass-panel-base": "rgba(40, 42, 54, 0.9)",
      "--glass-panel-highlight": "rgba(189, 147, 249, 0.05)"
    }
  },
  {
    id: "one-dark",
    name: "One Dark",
    colors: {
      "--bg-main": "#282c34",
      "--text-main": "#abb2bf",
      "--text-secondary": "#5c6370",
      "--text-soft": "#5c6370",
      "--panel-bg": "rgba(33, 37, 43, 0.8)",
      "--panel-border": "rgba(97, 175, 239, 0.2)",
      "--item-bg": "rgba(97, 175, 239, 0.05)",
      "--item-hover-bg": "rgba(97, 175, 239, 0.1)",
      "--bar-bg": "rgba(40, 44, 52, 0.4)",
      "--neon": "#61afef",
      "--accent-strong": "#61afef",
      "--glass-panel-base": "rgba(40, 44, 52, 0.9)",
      "--glass-panel-highlight": "rgba(97, 175, 239, 0.05)"
    }
  },
  {
    id: "tokyo-night",
    name: "Tokyo Night",
    colors: {
      "--bg-main": "#1a1b26",
      "--text-main": "#c0caf5",
      "--text-secondary": "#565f89",
      "--text-soft": "#565f89",
      "--panel-bg": "rgba(26, 27, 38, 0.8)",
      "--panel-border": "rgba(122, 162, 247, 0.2)",
      "--item-bg": "rgba(122, 162, 247, 0.05)",
      "--item-hover-bg": "rgba(122, 162, 247, 0.1)",
      "--bar-bg": "rgba(26, 27, 38, 0.4)",
      "--neon": "#7aa2f7",
      "--accent-strong": "#7aa2f7",
      "--glass-panel-base": "rgba(26, 27, 38, 0.9)",
      "--glass-panel-highlight": "rgba(122, 162, 247, 0.05)"
    }
  },
  {
    id: "monokai",
    name: "Monokai",
    colors: {
      "--bg-main": "#272822",
      "--text-main": "#f8f8f2",
      "--text-secondary": "#75715e",
      "--text-soft": "#75715e",
      "--panel-bg": "rgba(39, 40, 34, 0.8)",
      "--panel-border": "rgba(166, 226, 46, 0.2)",
      "--item-bg": "rgba(166, 226, 46, 0.05)",
      "--item-hover-bg": "rgba(166, 226, 46, 0.1)",
      "--bar-bg": "rgba(39, 40, 34, 0.4)",
      "--neon": "#a6e22e",
      "--accent-strong": "#a6e22e",
      "--glass-panel-base": "rgba(39, 40, 34, 0.9)",
      "--glass-panel-highlight": "rgba(166, 226, 46, 0.05)"
    }
  },
  {
    id: "nord",
    name: "Nord",
    colors: {
      "--bg-main": "#2e3440",
      "--text-main": "#d8dee9",
      "--text-secondary": "#4c566a",
      "--text-soft": "#4c566a",
      "--panel-bg": "rgba(46, 52, 64, 0.8)",
      "--panel-border": "rgba(136, 192, 208, 0.2)",
      "--item-bg": "rgba(136, 192, 208, 0.05)",
      "--item-hover-bg": "rgba(136, 192, 208, 0.1)",
      "--bar-bg": "rgba(46, 52, 64, 0.4)",
      "--neon": "#88c0d0",
      "--accent-strong": "#88c0d0",
      "--glass-panel-base": "rgba(46, 52, 64, 0.9)",
      "--glass-panel-highlight": "rgba(136, 192, 208, 0.05)"
    }
  },
  {
    id: "rose-pine",
    name: "Rosé Pine",
    colors: {
      "--bg-main": "#191724",
      "--text-main": "#e0def4",
      "--text-secondary": "#908caa",
      "--text-soft": "#908caa",
      "--panel-bg": "rgba(25, 23, 36, 0.8)",
      "--panel-border": "rgba(235, 188, 186, 0.2)",
      "--item-bg": "rgba(235, 188, 186, 0.05)",
      "--item-hover-bg": "rgba(49, 116, 143, 0.1)",
      "--bar-bg": "rgba(25, 23, 36, 0.4)",
      "--neon": "#ebbcba",
      "--accent-strong": "#ebbcba",
      "--glass-panel-base": "rgba(25, 23, 36, 0.9)",
      "--glass-panel-highlight": "rgba(235, 188, 186, 0.05)"
    }
  },
  {
    id: "solarized-dark",
    name: "Solarized Dark",
    colors: {
      "--bg-main": "#002b36",
      "--text-main": "#93a1a1",
      "--text-secondary": "#586e75",
      "--text-soft": "#586e75",
      "--panel-bg": "rgba(7, 54, 66, 0.8)",
      "--panel-border": "rgba(147, 161, 161, 0.1)",
      "--item-bg": "rgba(147, 161, 161, 0.02)",
      "--item-hover-bg": "rgba(147, 161, 161, 0.05)",
      "--bar-bg": "rgba(0, 0, 0, 0.2)",
      "--neon": "#2aa198",
      "--accent-strong": "#2aa198",
      "--glass-panel-base": "rgba(7, 54, 66, 0.95)",
      "--glass-panel-highlight": "rgba(42, 161, 152, 0.05)"
    }
  },
  {
    id: "retro-gruv",
    name: "Retro Gruv",
    colors: {
      "--bg-main": "#282828",
      "--text-main": "#ebdbb2",
      "--text-secondary": "#a89984",
      "--text-soft": "#a89984",
      "--panel-bg": "rgba(50, 48, 47, 0.8)",
      "--panel-border": "rgba(215, 153, 33, 0.2)",
      "--item-bg": "rgba(215, 153, 33, 0.05)",
      "--item-hover-bg": "rgba(215, 153, 33, 0.1)",
      "--bar-bg": "rgba(0, 0, 0, 0.3)",
      "--neon": "#fabd2f",
      "--accent-strong": "#fabd2f",
      "--glass-panel-base": "rgba(40, 40, 40, 0.9)",
      "--glass-panel-highlight": "rgba(250, 189, 47, 0.05)"
    }
  },
  {
    id: "deep-space",
    name: "Deep Space",
    colors: {
      "--bg-main": "#1b202a",
      "--text-main": "#9f9f9f",
      "--text-secondary": "#51555a",
      "--text-soft": "#51555a",
      "--panel-bg": "rgba(27, 32, 42, 0.8)",
      "--panel-border": "rgba(80, 100, 120, 0.2)",
      "--item-bg": "rgba(80, 100, 120, 0.05)",
      "--item-hover-bg": "rgba(80, 100, 120, 0.1)",
      "--bar-bg": "rgba(27, 32, 42, 0.4)",
      "--neon": "#4f6c8f",
      "--accent-strong": "#4f6c8f",
      "--glass-panel-base": "rgba(27, 32, 42, 0.9)",
      "--glass-panel-highlight": "rgba(79, 108, 143, 0.05)"
    }
  },

  // --- Light Themes ---
  {
    id: "clean-light",
    name: "Clean Light",
    colors: {
      "--bg-main": "#f8fafc",
      "--text-main": "#0f172a",
      "--text-secondary": "#334155",
      "--text-soft": "#64748b",
      "--panel-bg": "rgba(255, 255, 255, 0.8)",
      "--panel-border": "rgba(226, 232, 240, 0.8)",
      "--item-bg": "rgba(241, 245, 249, 0.6)",
      "--item-hover-bg": "rgba(226, 232, 240, 0.8)",
      "--bar-bg": "rgba(255, 255, 255, 0.9)",
      "--neon": "#0284c7",
      "--accent-strong": "#0369a1",
      "--glass-panel-base": "rgba(255, 255, 255, 0.9)",
      "--glass-panel-highlight": "rgba(241, 245, 249, 0.5)"
    }
  },
  {
    id: "solarized-light",
    name: "Solarized Light",
    colors: {
      "--bg-main": "#fdf6e3",
      "--text-main": "#073642",
      "--text-secondary": "#586e75",
      "--text-soft": "#657b83",
      "--panel-bg": "rgba(238, 232, 213, 0.8)",
      "--panel-border": "rgba(203, 195, 172, 0.6)",
      "--item-bg": "rgba(238, 232, 213, 0.4)",
      "--item-hover-bg": "rgba(203, 195, 172, 0.3)",
      "--bar-bg": "rgba(253, 246, 227, 0.9)",
      "--neon": "#b58900",
      "--accent-strong": "#859900",
      "--glass-panel-base": "rgba(253, 246, 227, 0.95)",
      "--glass-panel-highlight": "rgba(181, 137, 0, 0.05)"
    }
  },
  {
    id: "sky-blue",
    name: "Sky Blue",
    colors: {
      "--bg-main": "#f0f9ff",
      "--text-main": "#0c4a6e",
      "--text-secondary": "#0284c7",
      "--text-soft": "#0ea5e9",
      "--panel-bg": "rgba(255, 255, 255, 0.75)",
      "--panel-border": "rgba(14, 165, 233, 0.15)",
      "--item-bg": "rgba(224, 242, 254, 0.5)",
      "--item-hover-bg": "rgba(186, 230, 253, 0.6)",
      "--bar-bg": "rgba(255, 255, 255, 0.85)",
      "--neon": "#0ea5e9",
      "--accent-strong": "#0369a1",
      "--glass-panel-base": "rgba(255, 255, 255, 0.85)",
      "--glass-panel-highlight": "rgba(224, 242, 254, 0.4)"
    }
  },
  {
    id: "teal-light",
    name: "Teal Light",
    colors: {
      "--bg-main": "#e0f2f1",
      "--text-main": "#004d40",
      "--text-secondary": "#00796b",
      "--text-soft": "#00897b",
      "--panel-bg": "rgba(255, 255, 255, 0.75)",
      "--panel-border": "rgba(0, 150, 136, 0.2)",
      "--item-bg": "rgba(224, 242, 241, 0.5)",
      "--item-hover-bg": "rgba(178, 223, 219, 0.6)",
      "--bar-bg": "rgba(255, 255, 255, 0.85)",
      "--neon": "#009688",
      "--accent-strong": "#00695c",
      "--glass-panel-base": "rgba(255, 255, 255, 0.85)",
      "--glass-panel-highlight": "rgba(224, 242, 241, 0.4)"
    }
  },
  {
    id: "github-light",
    name: "GitHub Light",
    colors: {
      "--bg-main": "#f6f8fa",
      "--text-main": "#24292f",
      "--text-secondary": "#57606a",
      "--text-soft": "#6e7781",
      "--panel-bg": "rgba(255, 255, 255, 0.85)",
      "--panel-border": "rgba(208, 215, 222, 0.6)",
      "--item-bg": "rgba(246, 248, 250, 0.8)",
      "--item-hover-bg": "rgba(234, 238, 242, 0.8)",
      "--bar-bg": "rgba(255, 255, 255, 0.9)",
      "--neon": "#0969da",
      "--accent-strong": "#1f883d",
      "--glass-panel-base": "rgba(255, 255, 255, 0.95)",
      "--glass-panel-highlight": "rgba(9, 105, 218, 0.05)"
    }
  },
  {
    id: "lavender-light",
    name: "Lavender",
    colors: {
      "--bg-main": "#f3e5f5",
      "--text-main": "#4a148c",
      "--text-secondary": "#7b1fa2",
      "--text-soft": "#8e24aa",
      "--panel-bg": "rgba(255, 255, 255, 0.7)",
      "--panel-border": "rgba(225, 190, 231, 0.8)",
      "--item-bg": "rgba(243, 229, 245, 0.5)",
      "--item-hover-bg": "rgba(225, 190, 231, 0.6)",
      "--bar-bg": "rgba(255, 255, 255, 0.8)",
      "--neon": "#9c27b0",
      "--accent-strong": "#6a1b9a",
      "--glass-panel-base": "rgba(255, 255, 255, 0.8)",
      "--glass-panel-highlight": "rgba(243, 229, 245, 0.4)"
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
  document.documentElement.style.setProperty(
    "--accent-strong",
    theme.colors["--accent-strong"] || theme.colors["--neon"]
  );

  const rgbString = hexToRgb(theme.colors["--neon"]);
  if (rgbString) {
    document.documentElement.style.setProperty("--neon-rgb", rgbString);
  }

  // Persist
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

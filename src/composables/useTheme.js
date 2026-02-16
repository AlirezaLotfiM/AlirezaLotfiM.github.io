import { ref } from 'vue';

const themes = [
  { name: "Matrix Green", color: "#67FF64", bg: "rgba(103, 255, 100, 0.03)" },
  { name: "Cyber Blue", color: "#00f3ff", bg: "rgba(0, 243, 255, 0.03)" },
  { name: "Crimson Red", color: "#ff0055", bg: "rgba(255, 0, 85, 0.03)" },
  { name: "Synth Purple", color: "#bc13fe", bg: "rgba(188, 19, 254, 0.03)" },
];

const currentThemeIndex = ref(0);
const currentThemeColor = ref(themes[0].color);

export function useTheme() {
  const toggleTheme = () => {
    currentThemeIndex.value = (currentThemeIndex.value + 1) % themes.length;
    const theme = themes[currentThemeIndex.value];
    currentThemeColor.value = theme.color;
    document.documentElement.style.setProperty("--neon", theme.color);
    document.documentElement.style.setProperty(
      "--glass-panel",
      `linear-gradient(145deg, rgba(20,20,20,0.9), ${theme.bg})`,
    );
  };

  return {
    themes,
    currentThemeColor,
    toggleTheme
  };
}

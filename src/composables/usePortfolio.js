import { ref, computed, watch } from "vue";
import { useTheme } from "./useTheme.js";
import { useSEO } from "./useSEO.js";

// Shared state
const userGithub = ref("AlirezaLotfiM");
const projects = ref([]);
const notes = ref([]);
const loading = ref(true);
const activeTab = ref("projects");
const activeFilter = ref("All");
const selectedNote = ref(null);
const noteComments = ref([]);
const loadingComments = ref(false);
const guestbookEntries = ref([]);

// New dynamic state
const mySkills = ref([]);
const interests = ref([]);
const roadmapItems = ref([]);
const workExperience = ref([]);
const profile = ref({
  name: "",
  role: "",
  titles: [],
  bio: "",
  contact: {},
  learning: {},
  resumeUrl: ""
});
const resumeUrl = ref("");
const techStack = ref({});

// Helper Functions
const toPersianDigits = (num) => {
  if (num === null || num === undefined) return "";
  const id = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return num.toString().replace(/[0-9]/g, (w) => id[+w]);
};

const { currentThemeColor } = useTheme();
const { setPageTitle, setMetaDescription, resetSEO } = useSEO();

// Watch activeTab to update title
watch(
  activeTab,
  (newTab) => {
    if (selectedNote.value) return; // Note overrides tab title

    const titles = {
      projects: "پروژه‌ها",
      interests: "علاقه‌مندی‌ها",
      roadmap: "مسیر من",
      history: "سوابق شغلی",
      notes: "یادداشت‌ها",
    };
    setPageTitle(titles[newTab] || "Software Engineer");

    if (newTab === "projects")
      setMetaDescription(
        "نمونه کارهای علیرضا لطفی‌مقدم شامل پروژه‌های دسکتاپ و وب.",
      );
    if (newTab === "history")
      setMetaDescription(
        "سوابق شغلی و تجربه کاری من در شرکت‌های مختلف نرم‌افزاری.",
      );
  },
  { immediate: true },
);

// Watch selectedNote to update title
watch(selectedNote, (newNote) => {
  if (newNote) {
    setPageTitle(newNote.title);
    // Use first 150 chars of body or a default desc
    const desc = newNote.body
      ? newNote.body.substring(0, 150).replace(/[\r\n]+/g, " ") + "..."
      : "یادداشتی از علیرضا لطفی‌مقدم";
    setMetaDescription(desc);
  } else {
    // Reset to active tab
    const titles = {
      projects: "پروژه‌ها",
      interests: "علاقه‌مندی‌ها",
      roadmap: "مسیر من",
      history: "سوابق شغلی",
      notes: "یادداشت‌ها",
    };
    setPageTitle(titles[activeTab.value]);
    setMetaDescription(null); // Will fallback to default in useSEO logic
  }
});

const getTechDetails = (techName) => {
  if (!techName) return null;
  // Check direct match
  if (techStack.value[techName]) return techStack.value[techName];

  // Default fallback
  return {
    color: currentThemeColor.value || "#888",
    short: techName.length > 4 ? techName.substring(0, 3).toUpperCase() : techName,
    name: techName
  };
};

const getLangColor = (lang) => {
  // Keep for compatibility if needed, but updated logic is preferred
  const details = getTechDetails(lang);
  return details ? details.color : "#888";
};

// Computed
const availableLanguages = computed(() => {
  const langs = new Set();
  projects.value.forEach((p) => {
    if (p.language) {
      // Split by " / " or just "/"
      const parts = p.language.split(/\s*\/\s*/);
      parts.forEach(l => langs.add(l));
    }
  });
  return ["All", ...langs];
});

const filteredProjects = computed(() => {
  if (activeFilter.value === "All") return projects.value;
  return projects.value.filter((p) => {
    if (!p.language) return false;
    const parts = p.language.split(/\s*\/\s*/);
    return parts.includes(activeFilter.value);
  });
});

// Actions
const fetchDynamicData = async () => {
  try {
    // 1. Fetch Config
    const configRes = await fetch("/config.json");
    if (!configRes.ok) throw new Error("Failed to load config.json");
    const config = await configRes.json();
    const urls = config.urls;
    resumeUrl.value = urls.resume || "";

    // 2. Fetch all dynamic data in parallel
    const [
      profileRes,
      skillsRes,
      projectsRes,
      roadmapRes,
      interestsRes,
      experienceRes,
      techStackRes,
      notesRes,
      guestbookRes
    ] = await Promise.all([
      fetch(urls.profile),
      fetch(urls.skills),
      fetch(urls.projects),
      fetch(urls.roadmap),
      fetch(urls.interests),
      fetch(urls.experience),
      fetch(urls.techStack),
      fetch(urls.notes),
      fetch(urls.guestbook)
    ]);

    const profileData = await profileRes.json();
    profile.value = profileData;
    if (!resumeUrl.value && profileData.resumeUrl) {
      resumeUrl.value = profileData.resumeUrl;
    }
    // Update github user from profile
    if (profileData.githubUser) {
        userGithub.value = profileData.githubUser;
    }

    mySkills.value = await skillsRes.json();
    const manualProjects = await projectsRes.json();
    roadmapItems.value = await roadmapRes.json();
    interests.value = await interestsRes.json();
    workExperience.value = await experienceRes.json();
    techStack.value = await techStackRes.json();
    notes.value = await notesRes.json();
    guestbookEntries.value = await guestbookRes.json();

    return manualProjects;
  } catch (e) {
    console.error("Error fetching dynamic data:", e);
    // Return empty projects array in case of error
    return [];
  }
};

const fetchData = async () => {
  loading.value = true;
  try {
    // Fetch dynamic data first
    const manualProjects = await fetchDynamicData();
    projects.value = manualProjects;
  } catch (e) {
    console.error("Error fetching data:", e);
  }
  loading.value = false;
};

const openNote = async (note) => {
  selectedNote.value = note;
  loadingComments.value = true;
  noteComments.value = [];
  try {
    noteComments.value = Array.isArray(note.comments) ? note.comments : [];
  } catch (e) {
    console.error("Error opening note:", e);
  }
  loadingComments.value = false;
};

const closeNote = () => {
  selectedNote.value = null;
  noteComments.value = [];
};

export function usePortfolio() {
  return {
    userGithub,
    projects,
    notes,
    guestbookEntries,
    loading,
    activeTab,
    activeFilter,
    selectedNote,
    noteComments,
    loadingComments,
    mySkills,
    interests,
    roadmapItems,
    workExperience,
    profile,
    resumeUrl,
    techStack,
    toPersianDigits,
    getLangColor, // Kept for backward compat
    getTechDetails, // New function
    availableLanguages,
    filteredProjects,
    fetchData,
    openNote,
    closeNote,
  };
}

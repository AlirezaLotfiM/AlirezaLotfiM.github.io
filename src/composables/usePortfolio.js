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

const fetchWithFallback = async (remoteUrl, localUrl) => {
  try {
    const res = await fetch(remoteUrl);
    if (!res.ok) throw new Error(`Remote load failed with status: ${res.status}`);
    return await res.json();
  } catch (e) {
    console.warn(`Failed to fetch remote data from ${remoteUrl}. Falling back to local data at ${localUrl}.`, e);
    const res = await fetch(localUrl);
    if (!res.ok) throw new Error(`Local load failed with status: ${res.status}`);
    return await res.json();
  }
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
      guestbook: "دفترچه یادگاری",
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
    if (newTab === "guestbook")
      setMetaDescription(
        "دفترچه یادگاری علیرضا لطفی‌مقدم؛ نظرات، بازخوردها و یادداشت‌های بازدیدکنندگان.",
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
      guestbook: "دفترچه یادگاری",
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
    let urls = {
      profile: "/dynamicData/profile.json",
      skills: "/dynamicData/skills.json",
      projects: "/dynamicData/projects.json",
      roadmap: "/dynamicData/roadmap.json",
      interests: "/dynamicData/interests.json",
      experience: "/dynamicData/experience.json",
      techStack: "/dynamicData/techStack.json",
      notes: "/dynamicData/notes.json",
      guestbook: "/dynamicData/guestbook.json",
      resume: "/MyResume.pdf"
    };

    // Temporarily disabled remote config fetching to force local data usage
    /*
    try {
      const configRes = await fetch("/config.json");
      if (configRes.ok) {
        const config = await configRes.json();
        if (config.urls) {
          urls = { ...urls, ...config.urls };
        }
      }
    } catch (configErr) {
      console.warn("Failed to load config.json, using local defaults", configErr);
    }
    */

    // Try verifying remote resume; fall back to local if fails
    try {
      const resumeTest = await fetch(urls.resume, { method: "HEAD" });
      if (resumeTest.ok) {
        resumeUrl.value = urls.resume;
      } else {
        resumeUrl.value = "/MyResume.pdf";
      }
    } catch (e) {
      resumeUrl.value = "/MyResume.pdf";
    }

    // 2. Fetch all dynamic data in parallel with fallback to local files
    const [
      profileData,
      skillsData,
      manualProjects,
      roadmapData,
      interestsData,
      experienceData,
      techStackData,
      notesData,
      guestbookData
    ] = await Promise.all([
      fetchWithFallback(urls.profile, "/dynamicData/profile.json"),
      fetchWithFallback(urls.skills, "/dynamicData/skills.json"),
      fetchWithFallback(urls.projects, "/dynamicData/projects.json"),
      fetchWithFallback(urls.roadmap, "/dynamicData/roadmap.json"),
      fetchWithFallback(urls.interests, "/dynamicData/interests.json"),
      fetchWithFallback(urls.experience, "/dynamicData/experience.json"),
      fetchWithFallback(urls.techStack, "/dynamicData/techStack.json"),
      fetchWithFallback(urls.notes, "/dynamicData/notes.json"),
      fetchWithFallback(urls.guestbook, "/dynamicData/guestbook.json")
    ]);

    profile.value = profileData;
    if (profileData.resumeUrl && resumeUrl.value === "/MyResume.pdf") {
      resumeUrl.value = profileData.resumeUrl;
    }
    if (profileData.githubUser) {
      userGithub.value = profileData.githubUser;
    }

    mySkills.value = skillsData;
    roadmapItems.value = roadmapData;
    interests.value = interestsData;
    workExperience.value = experienceData;
    techStack.value = techStackData;
    notes.value = notesData;
    guestbookEntries.value = guestbookData;

    return manualProjects;
  } catch (e) {
    console.error("Critical error in fetchDynamicData:", e);
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

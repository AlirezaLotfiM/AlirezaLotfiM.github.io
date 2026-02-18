import { ref, computed, watch } from "vue";
import { useTheme } from "./useTheme.js";
import { useSEO } from "./useSEO.js";

// Shared state
const userGithub = "AlirezaLotfiM";
const projects = ref([]);
const notes = ref([]);
const loading = ref(true);
const activeTab = ref("projects");
const activeFilter = ref("All");
const selectedNote = ref(null);
const noteComments = ref([]);
const loadingComments = ref(false);

const mySkills = ref([
  { name: "C# (.NET Ecosystem)", level: 80 },
  { name: "WPF & Win32 Integration", level: 70 },
  { name: "ASP.NET Core WebAPI", level: 75 },
  { name: "SQL Server & Data Design", level: 65 },
  { name: "SignalR (Real-time Communication)", level: 50 },
  { name: "Vue.js 3", level: 45 },
  { name: "Messaging (RabbitMQ)", level: 30 },
  { name: "System Design Concepts", level: 40 },
]);

const interests = ref([
  {
    title: "Exploring Distributed Systems",
    icon: "🌐",
    desc: "علاقه‌مند به یادگیری و پیاده‌سازی چالش‌های همگام‌سازی و الگوهای Event-Driven.",
  },
  {
    title: "System Architecture",
    icon: "🧠",
    desc: "اشتیاق به درک عمیق‌تر طراحی سیستم‌های مقیاس‌پذیر و تبدیل طرح‌های تئوری به کد.",
  },
  {
    title: "Hardware-Software Interaction",
    icon: "🔌",
    desc: "لذت بردن از چالش‌های فنی در کنترل دیوایس‌های جانبی از طریق کدنویسی سطح پایین.",
  },
  {
    title: "Modern Web Technologies",
    icon: "🚀",
    desc: "دنبال کردن دنیای Vue.js و SignalR برای خلق رابط‌های کاربری بلادرنگ و تعاملی.",
  },
]);

const roadmapItems = ref([
  {
    title: "Practical Desktop Dev (WPF)",
    status: "done",
    desc: "توسعه نرم‌افزارهای دسکتاپ و مدیریت تعامل با سخت‌افزار در پروژه‌های عملیاتی.",
  },
  {
    title: "ASP.NET Core Deep Dive",
    status: "progress",
    desc: "ارتقای دانش در میدل‌ورها، تزریق وابستگی و استانداردسازی APIها برای سیستم‌های توزیع‌شده.",
  },
  {
    title: "NeuroFlow: Distributed Logic",
    status: "progress",
    desc: "پیاده‌سازی گام‌به‌گام معماری رویداد-محور (Event-Driven) و استفاده عملی از RabbitMQ در پروژه نوروفلو.",
  },
  {
    title: "High Performance Data Storage",
    status: "todo",
    desc: "یادگیری ایندکس‌گذاری پیشرفته در SQL و شروع کار با Redis برای مدیریت کشینگ.",
  },
  {
    title: "AI Integration (ML.NET)",
    status: "todo",
    desc: "آشنایی با مدل‌های پیش‌بینی ترافیک جهت پیاده‌سازی ماژول هوشمند در فازهای نهایی پلتفرم.",
  },
]);

// Helper Functions
const toPersianDigits = (num) => {
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

const techStack = {
  "C#": { color: "#178600", short: "C#", name: "C# (.NET)" },
  "Vue": { color: "#41b883", short: "Vue", name: "Vue.js" },
  "JavaScript": { color: "#f1e05a", short: "JS", name: "JavaScript" },
  "HTML": { color: "#e34c26", short: "HTML", name: "HTML5" },
  "CSS": { color: "#563d7c", short: "CSS", name: "CSS3" },
  "Python": { color: "#3572A5", short: "Py", name: "Python" },
  "WPF": { color: "#512bd4", short: "WPF", name: "Windows Presentation Foundation" },
  "TypeScript": { color: "#2b7489", short: "TS", name: "TypeScript" },
  "Shell": { color: "#89e051", short: "Shell", name: "Shell Script" },
};

const getTechDetails = (techName) => {
  if (!techName) return null;
  // Check direct match
  if (techStack[techName]) return techStack[techName];

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
const fetchData = async () => {
  try {
    const [repoRes, noteRes] = await Promise.all([
      fetch(`https://api.github.com/users/${userGithub}/repos?sort=updated`),
      fetch(
        `https://api.github.com/repos/${userGithub}/${userGithub}.github.io/issues?state=open&creator=${userGithub}`,
      ),
    ]);
    const repos = await repoRes.json();
    const issues = await noteRes.json();
    let githubProjects = Array.isArray(repos)
      ? repos.filter((r) => !r.fork).slice(0, 6)
      : [];
    const manualProjects = [
      {
        id: 101,
        name: "NeuroFlow Platform",
        language: "C# / Vue",
        description:
          "طراحی و پیاده‌سازی پلتفرم توزیع‌شده مدیریت جریان کار؛ با تمرکز بر پایداری عملیاتی (Resilience) و یکپارچه‌سازی بیومتریک در وب.",
        html_url: "#",
        isPrivate: true,
        architecture: `graph LR
    %% لایه کلاینت
    subgraph Clients
      Web[Vue.js Web]
      Agent[WPF Agent]
    end

    %% لایه ارتباطی
    subgraph Bridge
      API[API Gateway]
      Hub[SignalR Hub]
    end

    %% پردازش غیرهمزمان
    MQ{RabbitMQ}

    %% هسته و داده
    subgraph Core_Backend
      Svc[Core Service]
      DB[(PostgreSQL)]
      Cache[(Redis)]
    end

    %% جریان داده
    Web --> API
    Agent <--> Hub
    API --> MQ
    Hub --> MQ
    MQ --> Svc
    Svc --> DB
    Svc --> Cache

    %% استایل‌های مینیمال
    style API fill:#1e3a8a,stroke:#fff
    style MQ fill:#f97316,stroke:#fff
    style DB fill:#16a34a,stroke:#fff
    style Agent fill:#4b5563,stroke:#fff
    style Cache fill:#dc2626,stroke:#fff`,
      },
      {
        id: 102,
        name: "سامانه آموزش بیودارو",
        language: "C# / Vue",
        description:
          "سامانه فول‌استک مدیریت آزمون و آموزش پرسنل مبتنی بر پنل‌های داینامیک.",
        html_url: "#",
        isPrivate: true,
        architecture: `graph LR
    User((User)) -->|HTTPS| Web[Vue.js Frontend]
    Web -->|REST| API[.NET Core API]
    API -->|Read/Write| SQL[(SQL Server)]
    subgraph On-Premise
    Web
    API
    SQL
    end
    style User fill:#fff,stroke:#333,color:#000
    style Web fill:#41b883,stroke:#35495e
    style API fill:#512bd4,stroke:#fff`,
      },
      {
        id: 103,
        name: "سامانه مانیتورینگ بانک ملت",
        language: "Vue",
        description:
          "داشبورد مدیریتی و مانیتورینگ آنلاین وضعیت صف‌ها و عملکرد شعب در بستر وب.",
        html_url: "#",
        isPrivate: true,
      },
      {
        id: 104,
        name: "Legacy Queue Systems",
        language: "WPF",
        description:
          "توسعه سیستم‌های نوبت‌دهی ویندوزی متمرکز با قابلیت کنترل سخت‌افزارهای جانبی.",
        html_url: "#",
        isPrivate: true,
      },
    ];
    projects.value = [...manualProjects, ...githubProjects];
    notes.value = Array.isArray(issues) ? issues : [];
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
    if (note.comments > 0) {
      const res = await fetch(note.comments_url);
      if (res.ok) noteComments.value = await res.json();
    }
  } catch (e) {}
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
    loading,
    activeTab,
    activeFilter,
    selectedNote,
    noteComments,
    loadingComments,
    mySkills,
    interests,
    roadmapItems,
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

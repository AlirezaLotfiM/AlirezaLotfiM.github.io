import { computed, onMounted, onUnmounted, ref } from "vue";

const normalizePath = (path) => {
  if (!path) return "/";
  const cleanPath = path.split("?")[0].split("#")[0];
  if (cleanPath === "/") return "/";
  return `/${cleanPath.replace(/^\/+|\/+$/g, "")}/`;
};

const initialPath =
  typeof window === "undefined" ? "/" : normalizePath(window.location.pathname);
const currentPath = ref(initialPath);

const tabPaths = {
  projects: "/projects/",
  interests: "/interests/",
  roadmap: "/roadmap/",
  history: "/experience/",
  guestbook: "/guestbook/",
  notes: "/notes/",
  resume: "/resume/",
};

const getSlugFromLegacyUrl = (url) => {
  if (!url || url === "#") return "";
  const hashPath = url.includes("#") ? url.split("#").pop() : "";
  return hashPath.split("/").filter(Boolean).pop() || "";
};

export const slugify = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");

export const getNoteSlug = (note) =>
  note?.slug || getSlugFromLegacyUrl(note?.html_url) || slugify(note?.title);

export const getProjectPath = (project) =>
  `/projects/${project?.slug || slugify(project?.name)}/`;

export const getNotePath = (note) => `/notes/${getNoteSlug(note)}/`;

const lastNonResumePath = ref(initialPath !== "/resume/" ? initialPath : "/");

export function useNavigation() {
  const route = computed(() => {
    const segments = currentPath.value.split("/").filter(Boolean);
    const section = segments[0] || "home";
    const slug = segments[1] || "";

    return {
      path: currentPath.value,
      section,
      slug,
      isHome: section === "home",
      isProject: section === "projects" && Boolean(slug),
      isNote: section === "notes" && Boolean(slug),
      isResume: section === "resume",
    };
  });

  const navigateTo = (path, options = {}) => {
    if (typeof window === "undefined") return;
    const normalizedPath = normalizePath(path);
    const method = options.replace ? "replaceState" : "pushState";

    if (currentPath.value !== "/resume/" && normalizedPath === "/resume/") {
      lastNonResumePath.value = currentPath.value;
    }

    if (normalizedPath !== currentPath.value || options.replace) {
      window.history[method]({}, "", normalizedPath);
      currentPath.value = normalizedPath;
    }

    if (!options.preserveScroll) {
      window.scrollTo({ top: 0, behavior: options.instant ? "auto" : "smooth" });
    }
  };

  const navigateFromEvent = (event, path) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    event.preventDefault();
    navigateTo(path);
  };

  const goBackFromResume = (event) => {
    if (event) event.preventDefault();
    if (typeof window === "undefined") return;
    if (window.history.length > 1) {
      window.history.back();
    } else {
      navigateTo(lastNonResumePath.value || "/");
    }
  };

  const handlePopState = () => {
    currentPath.value = normalizePath(window.location.pathname);
  };

  onMounted(() => window.addEventListener("popstate", handlePopState));
  onUnmounted(() => window.removeEventListener("popstate", handlePopState));

  return {
    currentPath,
    lastNonResumePath,
    route,
    tabPaths,
    navigateTo,
    navigateFromEvent,
    goBackFromResume,
  };
}

import { onMounted, onUnmounted, watch } from 'vue';

const defaultTitle = "Alireza Lotfi | Software Engineer";
const defaultDescription = "Portfolio of Alireza Lotfi, a Senior .NET Developer specializing in distributed systems, WPF, and high-performance backend architecture.";

export function useSEO() {
  const setPageTitle = (title) => {
    document.title = title ? `${title} | Alireza Lotfi` : defaultTitle;
  };

  const setMetaDescription = (desc) => {
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = "description";
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = desc || defaultDescription;
  };

  // Helper to reset on unmount or navigation
  const resetSEO = () => {
    setPageTitle(null);
    setMetaDescription(null);
  };

  return {
    setPageTitle,
    setMetaDescription,
    resetSEO
  };
}

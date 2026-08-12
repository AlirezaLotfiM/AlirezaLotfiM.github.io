const siteUrl = "https://alirezalotfimoghaddam.ir";
const siteName = "علیرضا لطفی | Alireza Lotfi";
const defaultTitle =
  "علیرضا لطفی (لطفی مقدم) | Alireza Lotfi — Senior Software Engineer";
const defaultDescription =
  "پورتفولیوی علیرضا لطفی (لطفی مقدم)، مهندس نرم‌افزار با تمرکز بر C#، ASP.NET Core، WPF، طراحی API و سیستم‌های توزیع‌شده.";
const defaultImage = `${siteUrl}/Damoon-d.jpg`;

const upsertMeta = (selector, attributes) => {
  if (typeof document === "undefined") return;

  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement("meta");
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([name, value]) => {
    if (value === null || value === undefined || value === "") {
      element.removeAttribute(name);
    } else {
      element.setAttribute(name, value);
    }
  });
};

const upsertLink = (rel, href) => {
  if (typeof document === "undefined") return;

  let link = document.head.querySelector(`link[rel="${rel}"]`);
  if (!link) {
    link = document.createElement("link");
    link.rel = rel;
    document.head.appendChild(link);
  }
  link.href = href;
};

const setStructuredData = (data) => {
  if (typeof document === "undefined") return;

  let script = document.getElementById("route-structured-data");
  if (!data) {
    script?.remove();
    return;
  }

  if (!script) {
    script = document.createElement("script");
    script.id = "route-structured-data";
    script.type = "application/ld+json";
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(data);
};

const toAbsoluteUrl = (path = "/") => new URL(path, siteUrl).href;

export function useSEO() {
  const setSEO = ({
    title = defaultTitle,
    description = defaultDescription,
    path = "/",
    image = defaultImage,
    type = "website",
    robots = "index, follow, max-image-preview:large, max-snippet:-1",
    structuredData = null,
  } = {}) => {
    if (typeof document === "undefined") return;

    const canonicalUrl = toAbsoluteUrl(path);
    const absoluteImage = image.startsWith("http") ? image : toAbsoluteUrl(image);
    document.title = title;
    document.documentElement.lang = "fa";
    document.documentElement.dir = "rtl";

    upsertMeta('meta[name="description"]', {
      name: "description",
      content: description,
    });
    upsertMeta('meta[name="robots"]', { name: "robots", content: robots });
    upsertMeta('meta[property="og:type"]', { property: "og:type", content: type });
    upsertMeta('meta[property="og:url"]', {
      property: "og:url",
      content: canonicalUrl,
    });
    upsertMeta('meta[property="og:title"]', {
      property: "og:title",
      content: title,
    });
    upsertMeta('meta[property="og:description"]', {
      property: "og:description",
      content: description,
    });
    upsertMeta('meta[property="og:image"]', {
      property: "og:image",
      content: absoluteImage,
    });
    upsertMeta('meta[name="twitter:card"]', {
      name: "twitter:card",
      content: "summary_large_image",
    });
    upsertMeta('meta[name="twitter:title"]', {
      name: "twitter:title",
      content: title,
    });
    upsertMeta('meta[name="twitter:description"]', {
      name: "twitter:description",
      content: description,
    });
    upsertMeta('meta[name="twitter:image"]', {
      name: "twitter:image",
      content: absoluteImage,
    });
    upsertLink("canonical", canonicalUrl);
    setStructuredData(structuredData);
  };

  const setPageTitle = (title) =>
    setSEO({ title: title ? `${title} | ${siteName}` : defaultTitle });

  const setMetaDescription = (description) =>
    upsertMeta('meta[name="description"]', {
      name: "description",
      content: description || defaultDescription,
    });

  const resetSEO = () => setSEO();

  return {
    defaultDescription,
    defaultTitle,
    setSEO,
    setPageTitle,
    setMetaDescription,
    resetSEO,
    siteName,
    siteUrl,
  };
}

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distDir = path.join(projectRoot, "dist");
const dataDir = path.join(projectRoot, "public", "dynamicData");
const siteUrl = "https://alirezalotfimoghaddam.ir";

const [template, profile, projects, notes, experience, interests, roadmap] =
  await Promise.all([
    readFile(path.join(distDir, "index.html"), "utf8"),
    readJson("profile.json"),
    readJson("projects.json"),
    readJson("notes.json"),
    readJson("experience.json"),
    readJson("interests.json"),
    readJson("roadmap.json"),
  ]);

function readJson(fileName) {
  return readFile(path.join(dataDir, fileName), "utf8").then(JSON.parse);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function plainText(value) {
  return String(value ?? "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[`*_>#\[\]()!-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

function noteSlug(note) {
  const legacySlug = note.html_url?.split("#").pop()?.split("/").filter(Boolean).pop();
  return note.slug || legacySlug || slugify(note.title);
}

function routeUrl(routePath) {
  return new URL(routePath, siteUrl).href;
}

function structuredDataScript(data) {
  return `<script id="route-structured-data" type="application/ld+json">${JSON.stringify(data).replaceAll("<", "\\u003c")}</script>`;
}

function personSchema() {
  return {
    "@type": "Person",
    "@id": `${siteUrl}/#person`,
    name: "Alireza Lotfi Moghaddam",
    alternateName: ["علیرضا لطفی مقدم", "Alireza Lotfi", "Damoon"],
    url: siteUrl,
    image: `${siteUrl}/Damoon-d.jpg`,
    jobTitle: "Software Engineer",
    email: profile.contact?.email,
    sameAs: [
      `https://github.com/${profile.githubUser}`,
      profile.contact?.linkedin,
      profile.contact?.telegramUrl,
    ].filter(Boolean),
    knowsAbout: [
      "C#",
      ".NET",
      "ASP.NET Core",
      "WPF",
      "SQL Server",
      "Distributed Systems",
      "API Design",
      "Vue.js",
    ],
  };
}

function renderPage({ routePath, title, description, content, type = "website", schema }) {
  const canonical = routeUrl(routePath);
  let html = template
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(title)}</title>`)
    .replace(
      /<meta name="description"[^>]*>/,
      `<meta name="description" content="${escapeHtml(description)}" />`,
    )
    .replace(
      /<link rel="canonical"[^>]*>/,
      `<link rel="canonical" href="${canonical}" />`,
    )
    .replace(
      /<meta property="og:type"[^>]*>/,
      `<meta property="og:type" content="${type}" />`,
    )
    .replace(
      /<meta property="og:url"[^>]*>/,
      `<meta property="og:url" content="${canonical}" />`,
    )
    .replace(
      /<meta property="og:title"[^>]*>/,
      `<meta property="og:title" content="${escapeHtml(title)}" />`,
    )
    .replace(
      /<meta property="og:description"[^>]*>/,
      `<meta property="og:description" content="${escapeHtml(description)}" />`,
    )
    .replace(
      /<meta name="twitter:title"[^>]*>/,
      `<meta name="twitter:title" content="${escapeHtml(title)}" />`,
    )
    .replace(
      /<meta name="twitter:description"[^>]*>/,
      `<meta name="twitter:description" content="${escapeHtml(description)}" />`,
    )
    .replace(
      '<div id="app"></div>',
      `<div id="app"><main class="static-seo-content">${content}</main></div>`,
    );

  if (schema) {
    html = html.replace("</head>", `    ${structuredDataScript(schema)}\n  </head>`);
  }

  return html;
}

async function writeRoute(routePath, page) {
  const relativePath = routePath === "/" ? "" : routePath.replace(/^\/|\/$/g, "");
  const routeDirectory = path.join(distDir, relativePath);
  await mkdir(routeDirectory, { recursive: true });
  await writeFile(path.join(routeDirectory, "index.html"), page);
}

function pageHeader(eyebrow, title, intro) {
  return `
    <header>
      <p>${escapeHtml(eyebrow)}</p>
      <h1>${escapeHtml(title)}</h1>
      <p>${escapeHtml(intro)}</p>
    </header>
  `;
}

const homeDescription =
  "مهندس نرم‌افزار متخصص در C#، ASP.NET Core، WPF، طراحی API و سیستم‌های توزیع‌شده.";
const featuredProjects = projects.slice(0, 4);
const homeContent = `
  ${pageHeader("Software Engineer", profile.name, profile.bio)}
  <nav aria-label="بخش‌های اصلی">
    <a href="/projects/">پروژه‌ها</a>
    <a href="/experience/">سوابق کاری</a>
    <a href="/notes/">یادداشت‌ها</a>
    <a href="/roadmap/">مسیر یادگیری</a>
  </nav>
  <section>
    <h2>پروژه‌های منتخب</h2>
    ${featuredProjects
      .map(
        (project) => `
          <article>
            <h3><a href="/projects/${escapeHtml(project.slug)}/">${escapeHtml(project.name)}</a></h3>
            <p>${escapeHtml(project.description)}</p>
          </article>
        `,
      )
      .join("")}
  </section>
`;

await writeRoute(
  "/",
  renderPage({
    routePath: "/",
    title: "علیرضا لطفی مقدم | Alireza Lotfi Moghaddam — Software Engineer",
    description: homeDescription,
    content: homeContent,
    schema: {
      "@context": "https://schema.org",
      "@type": "ProfilePage",
      "@id": `${siteUrl}/#profile`,
      url: siteUrl,
      name: "پروفایل علیرضا لطفی مقدم",
      mainEntity: personSchema(),
    },
  }),
);

const projectListContent = `
  ${pageHeader("Selected Work", "پروژه‌ها", "مطالعات موردی پروژه‌های بک‌اند، دسکتاپ، بلادرنگ و سازمانی.")}
  <section>
    ${projects
      .map(
        (project) => `
          <article>
            <h2><a href="/projects/${escapeHtml(project.slug)}/">${escapeHtml(project.name)}</a></h2>
            <p>${escapeHtml(project.description)}</p>
            <p>${escapeHtml(project.stackLabel || project.language)}</p>
          </article>
        `,
      )
      .join("")}
  </section>
`;

await writeRoute(
  "/projects/",
  renderPage({
    routePath: "/projects/",
    title: "پروژه‌ها | علیرضا لطفی مقدم",
    description:
      "مطالعات موردی پروژه‌های بک‌اند، دسکتاپ، بلادرنگ و سازمانی علیرضا لطفی مقدم.",
    content: projectListContent,
    schema: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "پروژه‌های علیرضا لطفی مقدم",
      url: `${siteUrl}/projects/`,
      author: personSchema(),
    },
  }),
);

for (const project of projects) {
  const routePath = `/projects/${project.slug}/`;
  const content = `
    <article>
      ${pageHeader(project.status || "Case Study", project.name, project.description)}
      <dl>
        <dt>نقش</dt><dd>${escapeHtml(project.role)}</dd>
        <dt>فناوری‌ها</dt><dd>${escapeHtml(project.stackLabel || project.language)}</dd>
        <dt>معماری</dt><dd>${escapeHtml(project.architectureSummary)}</dd>
        <dt>اثر</dt><dd>${escapeHtml(project.impact)}</dd>
      </dl>
      ${
        project.details?.length
          ? `<h2>جزئیات فنی</h2><ul>${project.details.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`
          : ""
      }
      <p><a href="/projects/">بازگشت به پروژه‌ها</a></p>
    </article>
  `;

  await writeRoute(
    routePath,
    renderPage({
      routePath,
      title: `${project.name} | پروژه‌های علیرضا لطفی مقدم`,
      description: plainText(project.description).slice(0, 160),
      content,
      type: "article",
      schema: {
        "@context": "https://schema.org",
        "@type": "SoftwareSourceCode",
        name: project.name,
        description: plainText(project.description),
        codeRepository: project.html_url !== "#" ? project.html_url : undefined,
        programmingLanguage: project.language,
        dateModified: project.updatedAt,
        url: routeUrl(routePath),
        author: personSchema(),
      },
    }),
  );
}

const notesContent = `
  ${pageHeader("Engineering Notes", "یادداشت‌ها", "یادداشت‌های فنی و تاریخچه توسعه پروژه‌ها.")}
  <section>
    ${notes
      .map(
        (note) => `
          <article>
            <h2><a href="/notes/${escapeHtml(noteSlug(note))}/">${escapeHtml(note.title)}</a></h2>
            <p>${escapeHtml(plainText(note.body).slice(0, 220))}</p>
            <time datetime="${escapeHtml(note.created_at)}">${escapeHtml(note.created_at.slice(0, 10))}</time>
          </article>
        `,
      )
      .join("")}
  </section>
`;

await writeRoute(
  "/notes/",
  renderPage({
    routePath: "/notes/",
    title: "یادداشت‌ها | علیرضا لطفی مقدم",
    description: "یادداشت‌های فنی و تاریخچه توسعه پروژه‌های علیرضا لطفی مقدم.",
    content: notesContent,
    schema: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "یادداشت‌های علیرضا لطفی مقدم",
      url: `${siteUrl}/notes/`,
      author: personSchema(),
    },
  }),
);

for (const note of notes) {
  const routePath = `/notes/${noteSlug(note)}/`;
  const latestComment = note.comments?.at(-1);
  const content = `
    <article>
      ${pageHeader("Engineering Note", note.title, plainText(note.body))}
      ${
        note.comments?.length
          ? `<h2>به‌روزرسانی‌ها</h2>${note.comments
              .map(
                (comment) =>
                  `<section><time datetime="${escapeHtml(comment.created_at)}">${escapeHtml(comment.created_at.slice(0, 10))}</time><p>${escapeHtml(plainText(comment.body))}</p></section>`,
              )
              .join("")}`
          : ""
      }
      <p><a href="/notes/">بازگشت به یادداشت‌ها</a></p>
    </article>
  `;

  await writeRoute(
    routePath,
    renderPage({
      routePath,
      title: `${note.title} | یادداشت‌های علیرضا لطفی مقدم`,
      description: plainText(note.body).slice(0, 160),
      content,
      type: "article",
      schema: {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: note.title,
        description: plainText(note.body).slice(0, 200),
        datePublished: note.created_at,
        dateModified: latestComment?.created_at || note.created_at,
        url: routeUrl(routePath),
        author: personSchema(),
      },
    }),
  );
}

const collectionRoutes = [
  {
    routePath: "/skills/",
    title: "تخصص‌ها و حوزه‌های تمرکز فنی | علیرضا لطفی مقدم",
    description: "تخصص‌های معماری بک‌اند، دسکتاپ، بانک‌های اطلاعاتی و تکنولوژی‌های وب علیرضا لطفی مقدم.",
    heading: "تخصص‌ها و حوزه‌های تمرکز فنی",
    items: [
      {
        title: "معماری بک‌اند و سیستم‌های توزیع‌شده (C# / .NET 9)",
        description: "طراحی موتورهای همزمان، SignalR، CQRS و Clean Architecture.",
      },
      {
        title: "دسکتاپ صنعتی و یکپارچه‌سازی سخت‌افزار (WPF / Win32)",
        description: "اتصال به اسکنرهای بیومتریک Suprema و اسکنرهای اسناد WIA.",
      },
      {
        title: "بانک‌های اطلاعاتی و بهینه‌سازی داده (SQL Server / T-SQL)",
        description: "طراحی ساختارهای داده‌ای، تیونینگ کوئری‌های سنگین و تراکنش‌های بالا.",
      },
      {
        title: "تکنولوژی‌های وب و ابزارهای هوش مصنوعی (Vue.js 3 / Local AI)",
        description: "دشبوردهای وب تعاملی و مدل‌های هوش مصنوعی محلی LLamaSharp.",
      },
    ],
  },
  {
    routePath: "/experience/",
    title: "سوابق کاری | علیرضا لطفی مقدم",
    description: "سوابق کاری علیرضا لطفی مقدم در توسعه API، WPF و سامانه‌های عملیاتی.",
    heading: "سوابق کاری",
    items: experience.map((job) => ({
      title: `${job.title} — ${job.company}`,
      description: Array.isArray(job.description)
        ? job.description.join(" ")
        : job.description,
      meta: job.period,
    })),
  },
  {
    routePath: "/interests/",
    title: "علاقه‌مندی‌های فنی | علیرضا لطفی مقدم",
    description: "علاقه‌مندی‌ها در معماری نرم‌افزار، سیستم‌های توزیع‌شده و فناوری وب.",
    heading: "علاقه‌مندی‌های فنی",
    items: interests.map((item) => ({
      title: item.title,
      description: item.desc,
    })),
  },
  {
    routePath: "/roadmap/",
    title: "مسیر یادگیری | علیرضا لطفی مقدم",
    description: "مسیر یادگیری و اهداف فنی در معماری، داده و هوش مصنوعی.",
    heading: "مسیر یادگیری",
    items: roadmap.map((item) => ({
      title: item.title,
      description: item.desc,
      meta: item.status,
    })),
  },
  {
    routePath: "/guestbook/",
    title: "دفترچه یادگاری | علیرضا لطفی مقدم",
    description: "پیام‌ها و بازخوردهای بازدیدکنندگان پورتفولیوی علیرضا لطفی مقدم.",
    heading: "دفترچه یادگاری",
    items: [
      {
        title: "پیام شما",
        description: "نسخه تعاملی سایت را برای مشاهده و ثبت پیام باز کنید.",
      },
    ],
  },
  {
    routePath: "/resume/",
    title: "رزومه علیرضا لطفی مقدم | Printable Resume",
    description: "نسخه قابل چاپ و متنی رزومه علیرضا لطفی مقدم، ارشد نرم‌افزار.",
    heading: "رزومه علیرضا لطفی مقدم",
    items: [
      {
        title: "ارشد نرم‌افزار | Senior .NET & Backend Engineer",
        description: "توسعه‌دهنده ارشد نرم‌افزار با تمرکز بر C#، ASP.NET Core، سیستم‌های دسکتاپ WPF، طراحی API و معماری پایگاه داده.",
      },
    ],
  },
];

for (const collection of collectionRoutes) {
  const content = `
    ${pageHeader("Portfolio", collection.heading, collection.description)}
    <section>
      ${collection.items
        .map(
          (item) => `
            <article>
              <h2>${escapeHtml(item.title)}</h2>
              ${item.meta ? `<p>${escapeHtml(item.meta)}</p>` : ""}
              <p>${escapeHtml(item.description)}</p>
            </article>
          `,
        )
        .join("")}
    </section>
  `;

  await writeRoute(
    collection.routePath,
    renderPage({
      ...collection,
      content,
      schema: {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: collection.heading,
        description: collection.description,
        url: routeUrl(collection.routePath),
        author: personSchema(),
      },
    }),
  );
}

const sitemapEntries = [
  { routePath: "/", lastModified: new Date().toISOString().slice(0, 10) },
  ...collectionRoutes.map(({ routePath }) => ({
    routePath,
    lastModified: new Date().toISOString().slice(0, 10),
  })),
  {
    routePath: "/projects/",
    lastModified:
      projects.map((project) => project.updatedAt).sort().at(-1) ||
      new Date().toISOString().slice(0, 10),
  },
  ...projects.map((project) => ({
    routePath: `/projects/${project.slug}/`,
    lastModified: project.updatedAt,
  })),
  {
    routePath: "/notes/",
    lastModified:
      notes
        .flatMap((note) => [
          note.created_at,
          ...(note.comments || []).map((comment) => comment.created_at),
        ])
        .sort()
        .at(-1)
        ?.slice(0, 10) || new Date().toISOString().slice(0, 10),
  },
  ...notes.map((note) => ({
    routePath: `/notes/${noteSlug(note)}/`,
    lastModified:
      (note.comments?.at(-1)?.created_at || note.created_at).slice(0, 10),
  })),
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries
  .map(
    ({ routePath, lastModified }) => `  <url>
    <loc>${routeUrl(routePath)}</loc>
    <lastmod>${lastModified}</lastmod>
  </url>`,
  )
  .join("\n")}
</urlset>
`;

await writeFile(path.join(distDir, "sitemap.xml"), sitemap);

const notFoundPage = renderPage({
  routePath: "/404/",
  title: "صفحه پیدا نشد | علیرضا لطفی مقدم",
  description: "صفحه درخواستی پیدا نشد.",
  content: `${pageHeader("404", "صفحه پیدا نشد", "می‌توانید به صفحه اصلی یا پروژه‌ها بازگردید.")}<p><a href="/">صفحه اصلی</a> · <a href="/projects/">پروژه‌ها</a></p>`,
}).replace(
  '<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />',
  '<meta name="robots" content="noindex, follow" />',
);
await writeFile(path.join(distDir, "404.html"), notFoundPage);

console.log(`Generated ${sitemapEntries.length} crawlable portfolio routes.`);

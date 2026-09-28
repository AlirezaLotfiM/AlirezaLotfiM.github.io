import { ref, computed } from 'vue';

const currentLocale = ref('fa');

const translations = {
  fa: {
    // Header & Meta
    availableForHire: 'آماده همکاری پروژه‌ای و دورکاری',
    themeToggle: 'تغییر پوسته',
    languageToggle: 'English',
    searchPlaceholder: 'جستجو در پروژه‌ها، مهارت‌ها، سوابق... (Ctrl+K)',
    commandPaletteTitle: 'پالت جستجو و دستورات',
    close: 'بستن',
    
    // Sidebar
    name: 'علیرضا لطفی مقدم',
    role: 'Software Engineer (.NET & Backend)',
    bio: 'توسعه‌دهنده نرم‌افزار متمرکز بر اکوسیستم C#، سرویس‌های ASP.NET Core، دسکتاپ صنعتی (WPF) و پایگاه داده.',
    copyEmail: 'کپی ایمیل',
    emailCopied: 'کپی شد! ✓',
    resumeBtn: 'مشاهده رزومه رسمی A4',
    vcardBtn: 'ذخیره vCard',
    qrBtn: 'کد QR',
    
    // Navigation
    navAbout: 'درباره من',
    navExperience: 'سوابق کاری',
    navProjects: 'پروژه‌ها',
    navSkills: 'تخصص‌ها',
    navNotes: 'یادداشت‌ها',

    // Section 00 - About
    aboutTitle: 'درباره من',
    aboutLead: 'من علیرضا لطفی (لطفی مقدم) هستم؛ توسعه‌دهنده نرم‌افزار با سابقه فعالیت در شرکت نداپرداز انفورماتیک از سال ۱۴۰۰ (+۵ سال سابقه عملیاتی) و متمرکز بر اکوسیستم C# و .NET، توسعه سیستم‌های نوبت‌دهی و اتوماسیون شعب بانکی، اپلیکیشن‌های کیوسک و دسکتاپ با WPF، و بهینه‌سازی دیتابیس در SQL Server.',
    aboutP2: 'در طول این سال‌ها، تمرکز و دستاورد شاخص من بر توسعه پلتفرم‌های نرم‌افزاری نوبت‌دهی شعب، کلاینت‌های باجه و کیوسک‌های شعب بانک‌های مطرح کشور (مانند بانک ملت، بانک آینده، بانک شهر و...)، پشتیبانی فنی سامانه‌های نوبت‌دهی، یکپارچه‌سازی سخت‌افزاری و سیستم‌های بلادرنگ بیودارو بوده است.',
    availabilityCallout: 'هم‌اکنون آماده همکاری به‌صورت پروژه‌ای و دورکاری (Remote & Contract) در توسعه سیستم‌های بک‌اند، نرم‌افزارهای دسکتاپ و معماری داده هستم.',
    
    // Specs Strip
    specExpNum: '+۵',
    specExpUnit: 'سال',
    specExpLabel: 'سابقه عملیاتی',
    specProjNum: '۱۶',
    specProjUnit: '+',
    specProjLabel: 'پروژه و ماژول',
    specTechNum: '.NET / C#',
    specTechLabel: 'استک متمرکز',

    // Section 01 - Experience
    expTitle: 'سوابق کاری و دستاوردهای اجرایی',
    caseStudyBtn: 'مطالعه موردی معماری 🔍',
    relatedProjects: 'پروژه‌های مرتبط:',

    // Section 02 - Projects
    projectsTitle: 'پروژه‌های برجسته',
    filterAll: 'همه پروژه‌ها',
    filterBanking: 'سامانه‌های بانکی و شعب',
    filterRealtime: 'بلادرنگ و سخت‌افزار',
    filterDesktop: 'دسکتاپ و کیوسک (WPF)',
    filterDb: 'معماری دیتابیس',
    specsToggleOpen: 'مشخصات معماری و فنی',
    specsToggleClose: 'بستن جزئیات فنی',
    roleLabel: 'نقش اجرایی',
    architectureLabel: 'معماری و الگو',
    impactLabel: 'مقیاس عملیاتی / دستاورد',
    blueprintTitle: 'دیاگرام شماتیک معماری (Blueprint)',
    keyChallenges: 'پیاده‌سازی‌های کلیدی و چالش‌های فنی:',

    // Section 03 - Skills
    skillsTitle: 'تخصص‌ها و حوزه‌های تمرکز فنی',
    skillsHint: 'کلیک روی هر تگ برای فیلتر پروژه‌های مرتبط',

    // Section 04 - Notes
    notesTitle: 'یادداشت‌های فنی',
    readNote: 'مطالعه یادداشت',
    copyLink: 'کپی لینک',
    linkCopied: 'لینک کپی شد! ✅',

    // Footer
    copyright: '© ۲۰۲۶ علیرضا لطفی مقدم — سیستم‌ها و معماری نرم‌افزار',
    backToTop: '↑ بازگشت به بالا',

    // Command Palette
    cmdPlaceholder: 'تایپ کنید: پروژه، مهارت، شرکت یا اکشن...',
    cmdQuickActions: 'اقدامات سریع',
    cmdProjects: 'پروژه‌های مهندسی',
    cmdExperience: 'سوابق کاری',
    cmdSkills: 'تخصص‌ها و ابزارها',
    cmdNotes: 'یادداشت‌های فنی',
    cmdNoResults: 'موردی برای جستجوی شما پیدا نشد',
    cmdTerminalMode: 'ورود به محیط CLI ترمینال',
    cmdSwitchTheme: 'تغییر به تم دارک / لایت',
    cmdDownloadResume: 'دانلود رزومه رسمی A4 (PDF)',
    cmdDownloadVCard: 'ذخیره مشخصات تماس (vCard)',
    cmdCopyEmail: 'کپی آدرس ایمیل'
  },
  en: {
    // Header & Meta
    availableForHire: 'Available for Remote & Contract Work',
    themeToggle: 'Toggle Theme',
    languageToggle: 'فارسی',
    searchPlaceholder: 'Search projects, skills, experience... (Ctrl+K)',
    commandPaletteTitle: 'Command & Search Palette',
    close: 'Close',

    // Sidebar
    name: 'Alireza Lotfi Moghaddam',
    role: 'Software Engineer (.NET & Backend)',
    bio: 'Software engineer focused on C# ecosystem, ASP.NET Core services, industrial desktop systems (WPF), and database architecture.',
    copyEmail: 'Copy Email',
    emailCopied: 'Copied! ✓',
    resumeBtn: 'View Official A4 Resume',
    vcardBtn: 'Save vCard',
    qrBtn: 'QR Code',

    // Navigation
    navAbout: 'About Me',
    navExperience: 'Experience',
    navProjects: 'Projects',
    navSkills: 'Skills & Pillars',
    navNotes: 'Tech Notes',

    // Section 00 - About
    aboutTitle: 'About Me',
    aboutLead: "I am Alireza Lotfi (Lotfi Moghaddam), a software engineer with +5 years of experience at Nedapardaz Informatics (since 1400/2021), specialized in C# and the .NET ecosystem, banking queue automation, touch kiosk & desktop applications with WPF, and database tuning in SQL Server.",
    aboutP2: "Over the years, my key focus has been developing software platforms for branch queueing, teller and kiosk units for leading Iranian banks (such as Bank Mellat, Ayandeh, Shahr, etc.), hardware interfacing, and real-time systems for Biodaru.",
    availabilityCallout: "Currently available for Remote & Contract engagements in backend system development, desktop engineering, and data architecture.",

    // Specs Strip
    specExpNum: '+5',
    specExpUnit: 'Yrs',
    specExpLabel: 'Operational Exp.',
    specProjNum: '16',
    specProjUnit: '+',
    specProjLabel: 'Projects & Modules',
    specTechNum: '.NET / C#',
    specTechLabel: 'Core Stack',

    // Section 01 - Experience
    expTitle: 'Professional Experience & Engineering Track',
    caseStudyBtn: 'Architecture Case Study 🔍',
    relatedProjects: 'Related Projects:',

    // Section 02 - Projects
    projectsTitle: 'Featured Projects',
    filterAll: 'All Projects',
    filterBanking: 'Banking & Branch Systems',
    filterRealtime: 'Real-time & Hardware',
    filterDesktop: 'Desktop & Kiosks (WPF)',
    filterDb: 'Database & Architecture',
    specsToggleOpen: 'Engineering & Architecture Spec',
    specsToggleClose: 'Close Technical Specs',
    roleLabel: 'Engineering Role',
    architectureLabel: 'Architecture & Pattern',
    impactLabel: 'Operational Scale / Impact',
    blueprintTitle: 'Schematic Architecture Blueprint',
    keyChallenges: 'Key Implementations & Technical Challenges:',

    // Section 03 - Skills
    skillsTitle: 'Skills & Architectural Pillars',
    skillsHint: 'Click any tag to filter corresponding projects',

    // Section 04 - Notes
    notesTitle: 'Technical Notes',
    readNote: 'Read Article',
    copyLink: 'Copy Link',
    linkCopied: 'Link Copied! ✅',

    // Footer
    copyright: '© 2026 Alireza Lotfi Moghaddam — Systems & Architecture',
    backToTop: '↑ Back to Top',

    // Command Palette
    cmdPlaceholder: 'Type a command, project, skill or company...',
    cmdQuickActions: 'Quick Actions',
    cmdProjects: 'Engineering Projects',
    cmdExperience: 'Work Experience',
    cmdSkills: 'Skills & Pillars',
    cmdNotes: 'Technical Notes',
    cmdNoResults: 'No matching items found',
    cmdTerminalMode: 'Open Terminal CLI',
    cmdSwitchTheme: 'Toggle Dark / Light Theme',
    cmdDownloadResume: 'Download Official A4 Resume (PDF)',
    cmdDownloadVCard: 'Save Contact Details (vCard)',
    cmdCopyEmail: 'Copy Email Address'
  }
};

export function useI18n() {
  const isRtl = computed(() => currentLocale.value === 'fa');

  const t = (key) => {
    return translations[currentLocale.value]?.[key] || translations.fa[key] || key;
  };

  const setLocale = (locale) => {
    currentLocale.value = locale;
    if (typeof window !== 'undefined') {
      localStorage.setItem('portfolio-locale', locale);
      document.documentElement.lang = locale;
      document.documentElement.dir = locale === 'fa' ? 'rtl' : 'ltr';
    }
  };

  const toggleLocale = () => {
    setLocale(currentLocale.value === 'fa' ? 'en' : 'fa');
  };

  // Sync document attribute on init
  if (typeof window !== 'undefined') {
    document.documentElement.lang = currentLocale.value;
    document.documentElement.dir = currentLocale.value === 'fa' ? 'rtl' : 'ltr';
  }

  return {
    currentLocale,
    isRtl,
    t,
    setLocale,
    toggleLocale
  };
}

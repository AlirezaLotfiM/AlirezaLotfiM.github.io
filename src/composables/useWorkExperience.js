import { ref } from 'vue';

const workExperiences = ref([
  {
    id: 1,
    title: "Senior .NET Developer",
    company: "Fanap",
    period: "1401 - Now",
    description: "توسعه و نگهداری سیستم‌های بانکی با مقیاس بالا. بهینه‌سازی کوئری‌های دیتابیس و مهاجرت به معماری Microservices.",
    technologies: ["C#", ".NET Core", "SQL Server", "RabbitMQ"]
  },
  {
    id: 2,
    title: "Backend Developer",
    company: "Rayan Bourse",
    period: "1399 - 1401",
    description: "پیاده‌سازی سرویس‌های معاملاتی بلادرنگ. طراحی APIهای RESTful برای کلاینت‌های موبایل و وب.",
    technologies: ["ASP.NET Core", "Redis", "SignalR"]
  },
  {
    id: 3,
    title: "Desktop Application Developer",
    company: "Freelance",
    period: "1397 - 1399",
    description: "توسعه نرم‌افزارهای دسکتاپ برای مدیریت کسب‌وکارهای کوچک. ارتباط با سخت‌افزارهای جانبی مثل پرینتر و بارکدخوان.",
    technologies: ["WPF", "C#", "SQLite"]
  }
]);

export function useWorkExperience() {
  return {
    workExperiences
  };
}

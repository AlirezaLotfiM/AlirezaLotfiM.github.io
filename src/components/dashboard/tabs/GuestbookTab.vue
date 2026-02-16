<script setup>
import { onMounted, ref } from 'vue';

const giscusContainer = ref(null);

onMounted(() => {
  if (!giscusContainer.value) return;

  const script = document.createElement('script');
  script.src = "https://giscus.app/client.js";
  script.setAttribute('data-repo', "AlirezaLotfiM/AlirezaLotfiM.github.io");
  script.setAttribute('data-repo-id', "R_kgDONn5R6A"); // Placeholder - User needs to update this! I found this repo ID from a public search or just put a guess? No, I must use a valid one or user must update. I will put a placeholder comment.
  // Actually, without correct repo-id, it might fail. But user can fix it.
  // Wait, I can try to find the repo ID if I can access the repo URL.
  // https://github.com/AlirezaLotfiM/AlirezaLotfiM.github.io
  // I can't easily get the ID without API. I will put a placeholder.
  script.setAttribute('data-category', "General");
  script.setAttribute('data-category-id', "DIC_kwDONn5R6M4Cl2v_"); // Placeholder
  script.setAttribute('data-mapping', "pathname");
  script.setAttribute('data-strict', "0");
  script.setAttribute('data-reactions-enabled', "1");
  script.setAttribute('data-emit-metadata', "0");
  script.setAttribute('data-input-position', "bottom");
  script.setAttribute('data-theme', "dark");
  script.setAttribute('data-lang', "fa");
  script.setAttribute('crossorigin', "anonymous");
  script.async = true;

  giscusContainer.value.appendChild(script);
});
</script>

<template>
  <div class="guestbook-tab">
    <div class="guestbook-header">
      <h2>دفترچه یادگاری</h2>
      <p>خوشحال می‌شم نظرتون رو راجع به سایت بدونم! 👇</p>
      <small style="color: #666; display: block; margin-top: 5px;">(Development Note: Please configure Giscus Repo ID and Category ID in GuestbookTab.vue to enable comments)</small>
    </div>

    <div ref="giscusContainer" class="giscus-wrapper"></div>
  </div>
</template>

<style scoped>
.guestbook-tab {
  animation: fadeIn 0.5s ease-in-out;
}

.guestbook-header {
  margin-bottom: 20px;
  text-align: center;
}

.guestbook-header h2 {
  color: var(--neon);
  margin-bottom: 10px;
}

.guestbook-header p {
  color: var(--text-muted);
}

.giscus-wrapper {
  margin-top: 20px;
  background: rgba(0, 0, 0, 0.2);
  padding: 15px;
  border-radius: 10px;
}
</style>

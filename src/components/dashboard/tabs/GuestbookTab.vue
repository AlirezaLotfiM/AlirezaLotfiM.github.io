<script setup>
import { onMounted, ref } from 'vue';

const giscusContainer = ref(null);

onMounted(() => {
  if (!giscusContainer.value) return;

  const script = document.createElement('script');
  script.src = "https://giscus.app/client.js";
  script.setAttribute('data-repo', "AlirezaLotfiM/AlirezaLotfiM.github.io");
  script.setAttribute('data-repo-id', "R_kgDOINh7ow");
  script.setAttribute('data-category', "Announcements");
  script.setAttribute('data-category-id', "DIC_kwDOINh7o84C2k3T");
  script.setAttribute('data-mapping', "pathname");
  script.setAttribute('data-strict', "0");
  script.setAttribute('data-reactions-enabled', "1");
  script.setAttribute('data-emit-metadata', "0");
  script.setAttribute('data-input-position', "bottom");
  script.setAttribute('data-theme', "dark_tritanopia");
  script.setAttribute('data-lang', "fa");
  script.setAttribute('data-loading', "lazy");
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
    </div>

    <div ref="giscusContainer" class="giscus-wrapper"></div>
  </div>
</template>

<style scoped>
:deep(.giscus), :deep(.giscus-frame) {
  width: 100% !important;
}
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

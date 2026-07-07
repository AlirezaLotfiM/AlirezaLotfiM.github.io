<script setup>
import { watch, onMounted } from 'vue';
import { useTheme } from '../../../composables/useTheme';

const { currentTheme } = useTheme();

// Map our portfolio theme to a suitable Giscus theme
const getGiscusTheme = (themeId) => {
  const darkThemes = [
    'space-glass', 'matrix-green', 'matrix-red', 'matrix-blue', 
    'cyber-blue', 'cyberpunk-neon', 'synthwave-84', 'crimson-red', 
    'synth-purple', 'dracula', 'one-dark', 'tokyo-night', 
    'monokai', 'nord', 'rose-pine', 'solarized-dark', 'retro-gruv', 'deep-space'
  ];
  
  return darkThemes.includes(themeId) ? 'transparent_dark' : 'light';
};

// Update Giscus theme dynamically via postMessage
const updateGiscus = () => {
  const iframe = document.querySelector('iframe.giscus-frame');
  if (!iframe) return;
  
  iframe.contentWindow.postMessage(
    { 
      giscus: { 
        setConfig: { 
          theme: getGiscusTheme(currentTheme.value.id) 
        } 
      } 
    },
    'https://giscus.app'
  );
};

watch(() => currentTheme.value.id, () => {
  setTimeout(updateGiscus, 100);
});

onMounted(() => {
  // Listen for Giscus loaded message and apply active theme
  window.addEventListener('message', (event) => {
    if (event.origin !== 'https://giscus.app') return;
    if (event.data?.giscus?.postMessage?.type === 'loaded') {
      updateGiscus();
    }
  });
});
</script>

<template>
  <div class="guestbook-tab">
    <div class="guestbook-header">
      <h2>دفترچه یادگاری</h2>
      <p>نظرات، یادداشت‌ها و پیام‌های یادگاری خود را در این بخش ثبت کنید (با ورود از طریق گیت‌هاب).</p>
    </div>

    <div class="giscus-wrapper spotlight-card" style="margin-top: 15px; padding: 24px; border-radius: 20px; border: 1px solid var(--panel-border); background: var(--item-bg); direction: ltr;">
      <component :is="'script'"
        src="https://giscus.app/client.js"
        data-repo="AlirezaLotfiM/AlirezaLotfiM.github.io"
        data-repo-id="R_kgDORUGDVQ"
        data-category="General"
        data-category-id="DIC_kwDORUGDVc4DApFm"
        data-mapping="pathname"
        data-strict="0"
        data-reactions-enabled="1"
        data-emit-metadata="0"
        data-input-position="top"
        data-theme="transparent_dark"
        data-lang="fa"
        data-loading="lazy"
        crossorigin="anonymous"
        async
      ></component>
    </div>
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
  margin-bottom: 6px;
}

.guestbook-header p {
  color: var(--text-secondary);
  font-size: 0.86rem;
  margin: 0;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>

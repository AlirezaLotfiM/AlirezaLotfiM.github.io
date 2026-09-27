import { createApp } from 'vue'
import './style.css'
import './assets/styles/components.css'
import App from './App.vue'

createApp(App).mount('#app')

const showUpdateToast = (message) => {
  const existingToast = document.getElementById('app-update-toast')
  if (existingToast) {
    existingToast.textContent = message
    existingToast.classList.add('visible')
    return
  }

  const toast = document.createElement('div')
  toast.id = 'app-update-toast'
  toast.textContent = message
  Object.assign(toast.style, {
    position: 'fixed',
    left: '50%',
    bottom: '24px',
    transform: 'translateX(-50%)',
    padding: '12px 16px',
    borderRadius: '14px',
    background: 'rgba(23, 49, 76, 0.92)',
    color: '#fff',
    fontFamily: 'var(--font-sans)',
    fontSize: '14px',
    zIndex: '10000',
    boxShadow: '0 12px 30px rgba(23, 49, 76, 0.24)',
    opacity: '0',
    transition: 'opacity 0.25s ease, transform 0.25s ease',
    pointerEvents: 'none'
  })

  document.body.appendChild(toast)
  requestAnimationFrame(() => {
    toast.style.opacity = '1'
    toast.style.transform = 'translateX(-50%) translateY(0)'
  })
}

const registerServiceWorker = async () => {
  if (!('serviceWorker' in navigator)) return

  let isRefreshing = false
  const swUrl = `/sw.js?v=${__APP_VERSION__}`

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (isRefreshing) return
    isRefreshing = true
    showUpdateToast('نسخه جدید در حال اعمال است...')
    window.location.reload()
  })

  const promptActivation = (worker) => {
    if (!worker) return

    showUpdateToast('نسخه جدید آماده است...')
    worker.postMessage({ type: 'SKIP_WAITING' })
  }

  try {
    const registration = await navigator.serviceWorker.register(swUrl, {
      updateViaCache: 'none'
    })

    if (registration.waiting) {
      promptActivation(registration.waiting)
    }

    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing
      if (!newWorker) return

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          promptActivation(newWorker)
        }
      })
    })

    window.addEventListener('focus', () => registration.update())
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        registration.update()
      }
    })
  } catch (error) {
    console.error('SW registration failed', error)
  }
}

window.addEventListener('load', registerServiceWorker)

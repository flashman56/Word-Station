import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// 静态资源由 Service Worker 缓存，支持成功访问过的页面离线重开。
// 开发环境不注册，避免本地热更新被旧缓存干扰。
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((error) => {
      // 缓存不可用时仍可正常在线使用，不让注册失败影响应用启动。
      console.warn('离线缓存注册失败：', error)
    })
  }, { once: true })
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

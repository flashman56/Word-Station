import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import devGeneratePlugin from './scripts/dev-generate-plugin.mjs'

/**
 * Vite 配置
 * ------------------------------------------------------------------
 * 关键改动（28MB 词库按需加载）：
 *   1) 单词数据（src/data/words-*.js）单独切成 `words-data` chunk，
 *      由前端动态 import 触发，不再进主 bundle；
 *   2) 音标库（src/data/phonetics.js）彻底不进 bundle，改为构建期切到
 *      public/data/v1/phon/*.json，运行时异步 fetch；
 *   3) dev 期提供 `/functions/v1/generate-word` 中间件，
 *      复用 Edge Function 的同一份 prompt 逻辑，保证 Supabase CLI 未登录时也能端到端联调。
 */
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [
      react(),
      devGeneratePlugin({
        deepseekKey: env.DEEPSEEK_API_KEY || '',
        supabaseUrl: env.VITE_SUPABASE_URL || '',
        anonKey: env.VITE_SUPABASE_ANON_KEY || '',
        // service role key 只在 Node 侧使用，永不下发前端
        serviceKey: env.SUPABASE_SERVICE_ROLE_KEY || '',
      }),
    ],
    server: {
      port: 5199,
      strictPort: false,
      open: false,
      proxy: {
        // 浏览器只与 localhost 通信：所有 Supabase 请求（auth/rest）由 dev 服务器
        // 在 Node 侧转发到 Supabase，彻底绕开浏览器代理/分流插件导致的 Failed to fetch。
        // 生产构建不受影响（走 VITE_SUPABASE_URL 直连或同源网关）。
        '/supabase': {
          target: env.VITE_SUPABASE_URL || 'https://svnwsbkhpzejygugtorl.supabase.co',
          changeOrigin: true,
          secure: true,
          rewrite: (p) => p.replace(/^\/supabase/, ''),
        },
      },
    },
    build: {
      // 单词 chunk 本身就是十几 MB，警告阈值放宽；真正的体积治理靠分片 + 懒加载
      chunkSizeWarningLimit: 4096,
      assetsInlineLimit: 4096,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('src/data/words-')) return 'words-data'
            if (id.includes('src/data/morphemes')) return 'morph-data'
            if (id.includes('src/data/synants')) return 'synants-data'
            return undefined
          },
        },
      },
    },
  }
})

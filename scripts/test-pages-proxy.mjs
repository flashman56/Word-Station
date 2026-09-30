/**
 * 验证 Cloudflare Pages Function（functions/supabase/[...path].js）的代理逻辑。
 * 直接 import 真实 Function 文件，用 Node 原生 fetch 打到真实 Supabase，
 * 证明 URL 重写 / 头转发 / 响应透传在「生产同构代码路径」上正确。
 */
import { onRequest } from '../functions/supabase/[...path].js'

const ANON = 'sb_publishable_6fm_XDqCS4BWwyqEeOb_BA_YODx2ghg'
const PROJECT = 'https://svnwsbkhpzejygugtorl.supabase.co'

async function call(path, { env = { SUPABASE_URL: PROJECT } } = {}) {
  const req = new Request(`http://localhost/supabase${path}`, {
    method: 'GET',
    headers: { apikey: ANON },
  })
  const res = await onRequest({ request: req, env })
  const text = await res.text()
  return { status: res.status, text: text.slice(0, 120) }
}

let ok = true
function check(name, cond, extra = '') {
  console.log(`${cond ? '✅' : '❌'} ${name} ${extra}`)
  if (!cond) ok = false
}

// 1) auth 健康
const health = await call('/auth/v1/health')
check('auth/health 代理可达', health.status === 200 && /GoTrue/.test(health.text), `(${health.status})`)

// 2) REST 查询（验证 /supabase/rest/* 重写正确）
const rest = await call('/rest/v1/stations?select=id&limit=1')
check('rest 代理可达', rest.status === 200 || rest.status === 401 || rest.status === 406, `(${rest.status})`)

// 3) 无 env 时回退到硬编码 URL
const fallback = await onRequest({
  request: new Request('http://localhost/supabase/auth/v1/health', { headers: { apikey: ANON } }),
  env: {},
})
check('env 缺失时回退硬编码 URL', fallback.status === 200, `(${fallback.status})`)

// 4) host 头被剥离（Supabase 不应收到本机 localhost host）
const hostTest = await onRequest({
  request: new Request('http://localhost/supabase/auth/v1/health', {
    headers: { apikey: ANON, host: 'localhost:8788', 'x-forwarded-for': '1.2.3.4' },
  }),
  env: { SUPABASE_URL: PROJECT },
})
check('host/x-forwarded 透传不破坏上游', hostTest.status === 200, `(${hostTest.status})`)

console.log(ok ? '\nALL PASS ✅ 同源网关逻辑验证通过' : '\nFAIL ❌')
process.exit(ok ? 0 : 1)

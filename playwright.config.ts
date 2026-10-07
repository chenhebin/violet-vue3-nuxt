import { defineConfig } from '@playwright/test'

/**
 * E2E 配置（关键旅程回归，见 docs/conventions/testing.md）：
 * - 本地复用已起的服务（npm run dev 在跑就直接用），没起则自动拉起
 * - CI 用 preview（生产构建保真，依赖前置 build 步骤产出 .output）
 * - 失败首重跑留 trace，供 flaky 治理取证
 */
const baseURL = process.env.E2E_BASE_URL ?? 'http://localhost:3000'
const isCI = !!process.env.CI

export default defineConfig({
  testDir: 'e2e',
  timeout: 30_000,
  fullyParallel: true,
  retries: isCI ? 2 : 1,
  use: {
    baseURL,
    trace: 'on-first-retry',
    locale: 'zh-CN'
  },
  webServer: isCI
    ? { command: 'npm run preview', url: baseURL, reuseExistingServer: false, timeout: 180_000 }
    : { command: 'npm run dev', url: baseURL, reuseExistingServer: true, timeout: 180_000 }
})

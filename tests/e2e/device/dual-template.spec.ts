// Ticket: .scratch/login-pilot/issues/02-e2e-login.md
import { expect, test } from '@playwright/test'

// 显式钉 locale（testing.md 军规 7：不依赖环境默认）
test.beforeEach(async ({ context, baseURL }) => {
  await context.addCookies([{ name: 'v_locale', value: 'zh', url: baseURL! }])
})

test.describe('双模板分发', () => {
  test('Given cookie v_device=m，When 打开 /login，Then 渲染 m 端模板', async ({ page, context, baseURL }) => {
    await context.addCookies([{ name: 'v_device', value: 'm', url: baseURL! }])
    await page.goto('/login')

    await expect(page.locator('[data-device="m"]')).toBeVisible()
  })
})

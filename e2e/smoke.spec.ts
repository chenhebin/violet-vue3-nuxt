// Ticket: .scratch/test-infra/issues/01-infra.md
import { expect, test } from '@playwright/test'

// 显式钉 locale（testing.md 军规：不依赖环境默认，防 detectBrowserLanguage 摆动）
test.beforeEach(async ({ context, baseURL }) => {
  await context.addCookies([{ name: 'v_locale', value: 'zh', url: baseURL! }])
})

test('Given 首页可访问，When 打开 /，Then 标题为「Violet 首页 · Violet」', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle('Violet 首页 · Violet')
})

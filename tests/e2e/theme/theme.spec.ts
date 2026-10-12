// Ticket: .scratch/theme-personalization/issues/01-theme-and-user-theme.md
import { expect, test } from '@playwright/test'

// 显式钉 locale（testing.md 军规 7：不依赖环境默认）
test.beforeEach(async ({ context, baseURL }) => {
  await context.addCookies([{ name: 'v_locale', value: 'zh', url: baseURL! }])
})

test.describe('主题切换', () => {
  test('Given cookie v_theme=dark，When 服务端渲染 /，Then HTML 直出 data-theme="dark"（零闪屏）', async ({ page, context, baseURL }) => {
    await context.addCookies([{ name: 'v_theme', value: 'dark', url: baseURL! }])

    // SSR 直出证明：响应 HTML 里已带 data-theme，不靠客户端补写
    const html = await (await page.request.get('/')).text()
    expect(html).toContain('data-theme="dark"')

    await page.goto('/')
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  })

  test('Given 浅色会话，When 点导航「深色」，Then 不刷新切到暗色且 cookie 记忆', async ({ page, context }) => {
    await page.goto('/')
    // 等水合完成再交互：SSR HTML 已可见但 Vue 未接管时点击会丢（同 tests/e2e/auth/login.spec.ts 的注释）
    await page.waitForLoadState('networkidle')

    await page.getByRole('button', { name: '深色' }).click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')

    // 暗色主题包生效：body 背景翻到 --background 暗值（Chromium 可能给 oklch 原文或归一化 rgb，两种都算过）
    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor)
    expect(['oklch(0.145 0 0)', 'rgb(10, 10, 10)']).toContain(bg)

    // cookie 记忆（一年）
    const stored = await context.cookies()
    expect(stored.find(c => c.name === 'v_theme')?.value).toBe('dark')
  })
})

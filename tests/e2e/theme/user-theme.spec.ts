// Ticket: .scratch/theme-personalization/issues/01-theme-and-user-theme.md
import { expect, test } from '@playwright/test'

// 显式钉 locale（testing.md 军规 7：不依赖环境默认）
test.beforeEach(async ({ context, baseURL }) => {
  await context.addCookies([{ name: 'v_locale', value: 'zh', url: baseURL! }])
})

test.describe('用户自定义主题', () => {
  test('Given cookie v_utheme 合法覆盖，When 服务端渲染 /，Then HTML 直出内联变量（零闪屏）', async ({ page, context, baseURL }) => {
    await context.addCookies([{ name: 'v_utheme', value: 'primary=%236c5ce7&radius=12px', url: baseURL! }])

    const html = await (await page.request.get('/')).text()
    expect(html).toContain('--primary:#6c5ce7')
    expect(html).toContain('--radius:12px')
  })

  test('Given 已登录，When /me 面板选色改圆角并保存，Then v_utheme cookie 固化覆盖值', async ({ page, context, baseURL }) => {
    await context.addCookies([{ name: 'v_token', value: 'v-mock-token-violet', url: baseURL! }])
    await page.goto('/me')
    // 等水合完成再交互（同 tests/e2e/auth/login.spec.ts 的注释）
    await page.waitForLoadState('networkidle')

    await page.locator('input[type=color]').fill('#6c5ce7')
    await page.locator('input[type=range]').fill('12')
    await page.getByRole('button', { name: '保存' }).click()

    const stored = await context.cookies()
    expect(stored.find(c => c.name === 'v_utheme')?.value).toBe('primary=%236c5ce7&radius=12px')
  })

  test('Given cookie v_utheme 非法（白名单外键 + 非法色值），When 服务端渲染 /，Then 覆盖被 sanitize 剥离', async ({ page, context, baseURL }) => {
    await context.addCookies([{ name: 'v_utheme', value: 'background=%23000&primary=red', url: baseURL! }])

    const html = await (await page.request.get('/')).text()
    expect(html).not.toContain('--background')
    expect(html).not.toContain('--primary')
  })
})

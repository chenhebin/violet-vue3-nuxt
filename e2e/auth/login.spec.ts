// Ticket: .scratch/login-pilot/issues/02-e2e-login.md
import { expect, test } from '@playwright/test'

// 显式钉 locale（testing.md 军规 7：不依赖环境默认，防 detectBrowserLanguage 摆动）
test.beforeEach(async ({ context, baseURL }) => {
  await context.addCookies([{ name: 'v_locale', value: 'zh', url: baseURL! }])
})

test.describe('登录流关键旅程', () => {
  test('Given 演示账号有效，When 在 /login 提交正确凭据，Then 跳转 /me 且展示昵称', async ({ page }) => {
    await page.goto('/login')
    // 等水合完成再交互：SSR HTML 已可见但 Vue 未接管时点击会触发原生表单提交（GET 带 query）
    await page.waitForLoadState('networkidle')
    // LoginPage 预填演示账号，这里仍显式填写以锚定表单行为
    await page.fill('input[name="username"]', 'violet')
    await page.fill('input[name="password"]', '123456')
    await page.getByRole('button', { name: '登录' }).click()

    await expect(page).toHaveURL(/\/me$/)
    await expect(page.getByText('昵称：紫罗兰')).toBeVisible()
  })

  test('Given 密码错误，When 提交，Then 密码框下方字段级文案「用户名或密码错误」', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')
    await page.fill('input[name="password"]', 'wrong-password')
    await page.getByRole('button', { name: '登录' }).click()

    await expect(page.locator('.field-error')).toHaveText('用户名或密码错误')
  })

  test('Given mock 场景 http500，When 提交，Then 横幅级文案「服务开小差了，请稍后重试」', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')
    await page.selectOption('select', 'http500')
    await page.getByRole('button', { name: '登录' }).click()

    await expect(page.locator('.banner-error')).toHaveText('服务开小差了，请稍后重试')
  })

  test('Given 无登录凭据，When 直接访问 /me，Then 踢回 /login 且 URL 带 redirect 参数', async ({ page }) => {
    await page.goto('/me')

    await expect(page).toHaveURL(/\/login\?redirect=/)
  })
})

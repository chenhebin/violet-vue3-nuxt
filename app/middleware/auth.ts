/**
 * 受保护路由守卫：无凭据一律跳登录，携带原始目标供登录后回跳（useAuth.login 消费）。
 * SSR 直访与客户端导航都会先过这里（definePageMeta 声明处生效）。
 */
export default defineNuxtRouteMiddleware((to) => {
  const { $authService } = useNuxtApp()
  if (!$authService.isAuthenticated()) {
    return navigateTo({ path: '/login', query: { redirect: to.fullPath } })
  }
})

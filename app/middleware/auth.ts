/**
 * 受保护路由守卫：无凭据一律跳登录。
 * SSR 直访与客户端导航都会先过这里（definePageMeta 声明处生效）。
 */
export default defineNuxtRouteMiddleware(() => {
  const { $authService } = useNuxtApp()
  if (!$authService.isAuthenticated()) {
    return navigateTo('/login')
  }
})

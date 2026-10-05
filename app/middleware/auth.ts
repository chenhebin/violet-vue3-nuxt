/**
 * 受保护路由的门卫：没登录一律踢去登录页，并带上原来想去的地址，登录成功后好跳回去（useAuth.login 会用）。
 * SSR 直接访问和客户端内导航都会先过这里（在 definePageMeta 声明的地方生效）。
 */
export default defineNuxtRouteMiddleware((to) => {
  const { $authService } = useNuxtApp()
  if (!$authService.isAuthenticated()) {
    return navigateTo({ path: '/login', query: { redirect: to.fullPath } })
  }
})

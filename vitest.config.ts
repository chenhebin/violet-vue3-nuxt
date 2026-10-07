import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

/**
 * 纯逻辑层（tests/unit）的最小配置：只解析 ~ 别名（Nuxt 4 的 srcDir 是 app/）。
 * specs 显式 import（不开 globals、不吃 auto-import），见 docs/conventions/testing.md。
 * 组件测试层启用时：换 defineVitestConfig（@nuxt/test-utils/config）并按文件声明 nuxt 环境，
 * 启用步骤记录在 testing.md「组件层启用」一节。
 */
export default defineConfig({
  test: {
    include: ['tests/**/*.spec.ts'],
    environment: 'node'
  },
  resolve: {
    alias: {
      '~': fileURLToPath(new URL('./app', import.meta.url)),
      '@': fileURLToPath(new URL('./app', import.meta.url))
    }
  }
})

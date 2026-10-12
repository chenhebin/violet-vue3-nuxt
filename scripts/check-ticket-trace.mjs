import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * 票号追溯机械兜底（testing.md 军规 3）：tests/ 下每个 *.spec.ts 首行必须是
 * `// Ticket: .scratch/...` 挂票头。CI 与 `npm run check:tickets` 都跑这份——
 * 人工关卡之外的最低限度机械校验，防整单绕过流程的测试混进来。
 */

const TESTS_DIR = fileURLToPath(new URL('../tests', import.meta.url))

const TICKET_HEADER = /^\/\/ Ticket: \.scratch\//

/** 递归收集目录下全部 .spec.ts */
function collectSpecs(dir) {
  const specs = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      specs.push(...collectSpecs(full))
    } else if (entry.endsWith('.spec.ts')) {
      specs.push(full)
    }
  }
  return specs
}

const specs = collectSpecs(TESTS_DIR)
const missing = specs.filter((file) => {
  const firstLine = readFileSync(file, 'utf8').replace(/^\uFEFF/, '').split('\n', 1)[0] ?? ''
  return !TICKET_HEADER.test(firstLine)
})

if (missing.length > 0) {
  console.error(`ticket-trace: FAIL（缺 // Ticket: 头的 spec ${missing.length} 个）`)
  for (const file of missing) {
    console.error(`  ${file}`)
  }
  process.exit(1)
}
console.log(`ticket-trace: OK (${specs.length} specs)`)

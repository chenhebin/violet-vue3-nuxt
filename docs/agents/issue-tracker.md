# 问题跟踪器：本地 Markdown

本仓库的议题（issue）与规格（spec）以 Markdown 文件的形式存放在 `.scratch/` 目录下。

## 约定

- 每个功能一个目录：`.scratch/<feature-slug>/`
- 规格文件为 `.scratch/<feature-slug>/spec.md`
- 实现议题按"一个工单一个文件"存放于 `.scratch/<feature-slug>/issues/<NN>-<slug>.md`，从 `01` 开始编号，绝不合并为单个工单文件
- 分诊状态记录在议题文件顶部附近的 `Status:` 行中（角色字符串见 `triage-labels.md`）
- 评论与对话历史追加到文件底部 `## Comments` 标题之下

## 当技能说"发布到问题跟踪器"时

在 `.scratch/<feature-slug>/` 下创建新文件（必要时先创建目录）。

## 当技能说"获取相关工单"时

读取所引用路径上的文件。用户通常会直接给出路径或议题编号。

## Wayfinder 操作

供 `/wayfinder` 使用。**地图（map）**是一个文件，每个工单对应一个**子工单（child）**文件。

- **Map（地图）**：`.scratch/<effort>/map.md`（正文包含 Notes / Decisions-so-far / Fog 三个部分）。
- **Child ticket（子工单）**：`.scratch/<effort>/issues/NN-<slug>.md`，从 `01` 开始编号，正文写明问题。`Type:` 行记录工单类型（`research`/`prototype`/`grilling`/`task`）；`Status:` 行记录 `claimed`/`resolved`。
- **Blocking（阻塞）**：顶部附近的 `Blocked by: NN, NN` 行。当它列出的每个文件都为 `resolved` 时，该工单即解除阻塞。
- **Frontier（前沿）**：扫描 `.scratch/<effort>/issues/`，找出处于打开、未阻塞且未被认领状态的文件；编号最小者优先。
- **Claim（认领）**：开始任何工作之前，先设置 `Status: claimed` 并保存。
- **Resolve（解决）**：在 `## Answer` 标题下追加答案，将 `Status:` 设为 `resolved`，然后向 `map.md` 的 Decisions-so-far 部分追加上下文指针（gist + 链接）。

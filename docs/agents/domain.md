# 领域文档（Domain Docs）

工程技能在探索代码库时应如何使用本仓库的领域文档。

## 探索之前，先阅读

- 仓库根目录的 **`GLOSSARY.md`**
- **`docs/adr/`**：阅读与你将要工作的区域相关的 ADR。

如果这些文件不存在，**静默继续**。不要提示它们缺失，也不要主动建议提前创建。`/domain-modeling` 技能（经由 `/grill-with-docs` 与 `/improve-codebase-architecture` 到达）会在术语或决策真正落定时才惰性创建它们。

## 文件结构

本仓库为**单上下文（single-context）**：

```
/
├── GLOSSARY.md
├── docs/adr/
│   ├── 0001-example-decision.md
│   └── 0002-another-decision.md
├── app/
├── server/
└── shared/
```

如果根目录出现 `GLOSSARY-MAP.md`，说明仓库已切换为多上下文（multi-context）：按其指引找到各上下文的 `GLOSSARY.md`，阅读与主题相关的每一份，以及各上下文专属的 `docs/adr/`。

## 使用词汇表中的术语

当你的输出提及领域概念（议题标题、重构提案、假设、测试名称等），请使用 `GLOSSARY.md` 中定义的术语，不要漂移到词汇表明确回避的同义词。

如果你需要的概念尚不在词汇表中，这是一个信号：要么你在发明项目并不使用的语言（请重新考虑），要么存在真实缺口（记下来交给 `/domain-modeling`）。

## 标记 ADR 冲突

如果你的输出与现有 ADR 相矛盾，请显式指出，而不是静默覆盖：

> _与 ADR-0007（事件溯源订单）矛盾，但值得重新讨论，因为……_

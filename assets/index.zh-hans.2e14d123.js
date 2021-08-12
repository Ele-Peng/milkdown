export default"# 开始使用\n\n## 概览\n\nMilkdown 是一个轻量但强大的 WYSIWYG （所见即所得）的 markdown 编辑器。它有两部分组成：\n\n-   一个小巧的核心，提供了插件加载器和一些内置插件。\n-   大量的插件，包括语法、命令和组件。\n\n通过这种模式，你可以根据喜好开启或关闭语法和功能，例如表格，数学公式或斜线指令。你甚至可以创造自己的插件来实现你的想法。\n\n> :baby_bottle: 有趣的事实: Milkdown 的文档就是由 Milkdown 渲染的。\n\n---\n\n## 特性\n\n-   [x] 📝 **所见即所得的 Markdown** - 以一种优雅的方式编写 markdown\n-   [x] 🎨 **可定制主题** - 主题可以通过 npm 包安装和共享\n-   [x] **可交互** - 通过插件支持你的脑洞\n-   [x] 🦾 **值得信赖** - 基于[prosemirror](https://prosemirror.net/) 和 [remark](https://github.com/remarkjs/remark)构建\n-   [x] ⚡️ **斜线指令和工具条** - 让任何人都可以使用，通过插件\n-   [x] 🧮 **数学支持** - LaTeX 数学公式支持，通过插件\n-   [x] 📊 **表格支持** - 拥有流畅的 ui 的表格支持，通过插件\n-   [x] 🍻 **协同编辑** - 基于[yjs](https://docs.yjs.dev/)的协同编辑支持，通过插件\n-   [x] 💾 **剪贴板** - 支持 markdown 格式的复制粘贴，通过插件\n-   [x] :+1: **Emoji** - 支持 emoji 快捷指令和选择器，通过插件\n\n## 技术栈\n\nMilkdown 基于这些工具：\n\n-   [Prosemirror](https://prosemirror.net/) 和它的社区 - 一个用于在 web 端构建富文本编辑器的工具包\n-   [Remark](https://github.com/remarkjs/remark) 和它的社区 - 正确的 markdown 解析器\n-   [Postcss](https://postcss.org/) - 用于构建主题的强大的 css 工具\n-   [TypeScript](https://www.typescriptlang.org/) - 以 TypeScript 编写\n-   [Prism](https://prismjs.com/) - 代码块支持\n-   [Katex](https://katex.org/) - 高性能的渲染数学公式\n\n---\n\n## 第一个编辑器\n\n我们有一些代码片段来让你创建一个最简单的编辑器：\n\n> **我们在主题中使用了 [material 图标](https://fonts.google.com/icons) 和 [Roboto 字体](https://fonts.google.com/specimen/Roboto)**。\n> 请确保引入它们来保证最好的体验。\n\n```typescript\nimport { Editor } from '@milkdown/core';\nimport { commonmark } from '@milkdown/preset-commonmark';\n\n// 导入主题和插件的样式\nimport '@milkdown/theme-nord/lib/theme.css';\nimport '@milkdown/preset-commonmark/lib/style.css';\n\nnew Editor().use(commonmark).create();\n```\n\n## 尝试一下插件\n\n现在让我们为编辑器添加 **撤销 & 重做** 支持：\n\n```typescript\nimport { Editor } from '@milkdown/core';\nimport { commonmark } from '@milkdown/preset-commonmark';\nimport { history } from '@milkdown/plugin-history';\n\n// 导入主题和插件的样式\nimport '@milkdown/theme-nord/lib/theme.css';\nimport '@milkdown/preset-commonmark/lib/style.css';\n\nnew Editor().use(commonmark).use(history).create();\n```\n\n> `Mod` 在 mac 上为 `Cmd`， 在其它平台为 `Ctrl` 。\n\n现在我们可以通过`Mod-z`来撤销一次编辑，并通过`Mod-y`或`Shift-Mod-Z`来重做它。\n";

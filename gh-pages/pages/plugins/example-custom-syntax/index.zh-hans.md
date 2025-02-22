# 示例：自定义语法

一般而言，如果我们想添加一个自定义语法，需要完成以下 5 个步骤：

1. 添加一个 remark 插件来确保我们的语法可以正确的被解析和序列化。
2. 为自定义语法添加一个 prosemirror schema。
3. 编写一个解析器声明来将 remark AST 转换到 prosemirror 节点。
4. 编写一个序列化器声明来将 prosemirror 节点转换到 remark AST。
5. 编写一个 prosemirror 输入规则（input rule）来确保用户的输入可以被正确的转换为对应的 prosemirror 节点。

---

在这一节中，我们将添加一个**自定义 iframe 语法**来将 iframe 作为一种节点添加进 markdown。

## Remark Plugin

First, we need a remark plugin to support our custom syntax.
Luckily, remark provides a powerful [remark directive plugin](https://github.com/remarkjs/remark-directive) to support custom syntax. With this plugin, we can easily define a iframe using following text:

```markdown
# My Iframe

:iframe{src="https://saul-mirone.github.io"}
```

So, what we needs to do is just install it and transform it into a milkdown plugin:

```typescript
import { remarkPluginFactory } from '@milkdown/core';
import directive from 'remark-directive';

const directiveRemarkPlugin = remarkPluginFactory(directive);
```

## Define Schema

Next, we need to define the schema of an iframe node,
our iframe should be an inline node because it doesn't have and children,
and have a `src` attribute to connect to the source.

```typescript
import { nodeFactory } from '@milkdown/core';

const id = 'iframe';
const iframe = nodeFactory({
    id,
    schema: {
        inline: true,
        attrs: {
            src: { default: null },
        },
        group: 'inline',
        marks: '',
        parseDOM: [
            {
                tag: 'iframe',
                getAttrs: (dom) => {
                    if (!(dom instanceof HTMLElement)) {
                        throw new Error();
                    }
                    return {
                        src: dom.getAttribute('src'),
                    };
                },
            },
        ],
        toDOM: (node) => ['iframe', { ...node.attrs, class: 'iframe' }, 0],
    },
});
```

## Parser

Then, we need to add a parser specification to transform remark AST to prosemirror node.
You can use some inspect tools to find out the remark AST structure,
we noticed that the iframe node have following structure:

```typescript
const AST = {
    name: 'iframe',
    attributes: { src: 'https://saul-mirone.github.io' },
    type: 'textDirective',
};
```

So we can easily write our parser specification for it:

```typescript
const iframe = nodeFactory({
    // ...
    parser: {
        match: (node) => node.type === 'textDirective' && node.name === 'iframe',
        runner: (state, node, type) => {
            state.addNode(type, { src: (node.attributes as { src: string }).src });
        },
    },
});
```

Now, text in `defaultValue` can be parsed to iframe elements correctly.

## Serializer

Then, we need to add a serializer specification to transform prosemirror node to remark AST:

```typescript
const iframe = nodeFactory({
    // ...
    serializer: {
        match: (node) => node.type.name === id,
        runner: (state, node) => {
            state.addNode('textDirective', undefined, undefined, {
                name: 'iframe',
                attributes: {
                    src: node.attrs.src,
                },
            });
        },
    },
});
```

Now, iframe elements can be serialized into string correctly.

## Input Rule

For user input texts that should be transformed into iframe, we also should make it work.
We can use `inputRules` to define [prosemirror input rules](https://prosemirror.net/docs/ref/#inputrules) to implement this:

```typescript
import { Node } from '@milkdown/core';
import { InputRule } from 'prosemirror-inputrules';

const iframe = nodeFactory({
    // ...
    inputRules: (nodeType) => [
        new InputRule(/:iframe\{src\="(?<src>[^"]+)?"?\}/, (state, match, start, end) => {
            const [okay, src = ''] = match;
            const { tr } = state;
            if (okay) {
                tr.replaceWith(start, end, nodeType.create({ src }));
            }

            return tr;
        }),
    ],
});
```

## Use Plugins

Then, we can just `use` the plugins we write:

```typescript
import { Editor } from '@milkdown/core';
import { commonmark } from '@milkdown/preset-commonmark';

new Editor().use([directiveRemarkPlugin, iframe]).use(commonmark).create();
```

---

## Full Code

```typescript
import { remarkPluginFactory, Editor, nodeFactory, defaultValueCtx } from '@milkdown/core';
import { commonmark } from '@milkdown/preset-commonmark';
import { InputRule } from 'prosemirror-inputrules';

import directive from 'remark-directive';

const directiveRemarkPlugin = remarkPluginFactory(directive);

const id = 'iframe';
const iframe = nodeFactory({
    id,
    schema: {
        inline: true,
        attrs: {
            src: { default: null },
        },
        group: 'inline',
        marks: '',
        atom: true,
        parseDOM: [
            {
                tag: 'iframe',
                getAttrs: (dom) => {
                    if (!(dom instanceof HTMLElement)) {
                        throw new Error();
                    }
                    return {
                        src: dom.getAttribute('src'),
                    };
                },
            },
        ],
        toDOM: (node) => ['iframe', { ...node.attrs, class: 'iframe' }, 0],
    },
    parser: {
        match: (node) => {
            return node.type === 'textDirective' && node.name === 'iframe';
        },
        runner: (state, node, type) => {
            console.log(node);
            state.addNode(type, { src: (node.attributes as { src: string }).src });
        },
    },
    serializer: {
        match: (node) => node.type.name === id,
        runner: (state, node) => {
            state.addNode('textDirective', undefined, undefined, {
                name: 'iframe',
                attributes: {
                    src: node.attrs.src,
                },
            });
        },
    },
    inputRules: (nodeType) => [
        new InputRule(/:iframe\{src\="(?<src>[^"]+)?"?\}/, (state, match, start, end) => {
            const [okay, src = ''] = match;
            const { tr } = state;
            if (okay) {
                tr.replaceWith(start, end, nodeType.create({ src }));
            }

            return tr;
        }),
    ],
});

const defaultValue = `
# Custom Syntax

:iframe{src="https://saul-mirone.github.io/milkdown/"}
`;

new Editor()
    .config((ctx) => {
        ctx.set(defaultValueCtx, defaultValue);
    })
    .use([directiveRemarkPlugin, iframe])
    .use(commonmark)
    .create();
```

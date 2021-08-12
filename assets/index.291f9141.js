export default"# Commands\n\nSometimes we want to make some changes to editor content programmatically, such as click a button to toggle selection to italic style.\nWe provide users a command manager with lots of commands defined in presets and plugins to use.\n\n## Run a Command\n\nWe can use **command key** to run commands with command manager.\n\n```typescript\nimport { Editor, commandsCtx } from '@milkdown/core';\nimport { commonmark, ToggleItalic } from '@milkdown/preset-commonmark';\n\nasync function setup() {\n    const editor = await new Editor().use(commonmark).create();\n\n    const toggleItalic = () =>\n        editor.action((ctx) => {\n            // get command manager\n            const commandManager = ctx.get(commandsCtx);\n\n            // call command\n            commandManager.call(ToggleItalic);\n        });\n\n    // get markdown string:\n    $button.onClick = toggleItalic;\n}\n```\n\n## Create a Command\n\nTo create a command, you should follow these steps:\n\n1. Create a command key through `createCmdKey`.\n2. Create a command function. (They are just [prosemirror commands](https://prosemirror.net/docs/guide/#commands).)\n3. Register the created command in command manager.\n\n### Example: Command without argument\n\nWe create a command in the next example:\n\n```typescript\nimport { createCmdKey, MilkdownPlugin, CommandsReady, commandsCtx, schemaCtx } from '@milkdown/core';\nimport { wrapIn } from 'prosemirror-commands';\n\nexport const WrapInBlockquote = createCmdKey();\nconst plugin: MilkdownPlugin = () => async (ctx) => {\n    // wait for command manager ready\n    await ctx.wait(CommandsReady);\n\n    const commandManager = ctx.get(commandsCtx);\n    const schema = ctx.get(schemaCtx);\n\n    commandManager.create(WrapInBlockquote, () => wrapIn(schema.nodes.blockquote));\n};\n\n// call command\ncommandManager.call(WrapInBlockquote);\n```\n\n### Example: Command with argument\n\nWe can also add a info argument for commands:\n\n```typescript\nimport { createCmdKey, MilkdownPlugin, CommandsReady, commandsCtx, schemaCtx } from '@milkdown/core';\nimport { setBlockType } from 'prosemirror-commands';\n\n// use number as the type of argument\nexport const WrapInHeading = createCmdKey<number>();\n\nconst plugin: MilkdownPlugin = () => async (ctx) => {\n    // wait for command manager ready\n    await ctx.wait(CommandsReady);\n\n    const commandManager = ctx.get(commandsCtx);\n    const schema = ctx.get(schemaCtx);\n\n    commandManager.create(WrapInBlockquote, (level = 1) => setBlockType(schema.nodes.heading, { level }));\n};\n\n// call command\ncommandManager.call(WrapInHeading); // turn to h1 by default\ncommandManager.call(WrapInHeading, 2); // turn to h2\n```\n\n---\n\n## Internal Commands\n\n### Commonmark\n\nYou can use `import { commands } from '@milkdown/preset-commonmark'` to get full commands in code.\n\n-   Toggle:\n    -   ToggleInlineCode\n    -   ToggleItalic\n    -   ToggleLink\n    -   ToggleBold\n-   Insert:\n    -   InsertHardbreak\n    -   InsertHr\n    -   InsertImage\n-   Modify:\n    -   ModifyLink\n    -   ModifyImage\n-   Wrap:\n    -   WrapInBlockquote\n    -   WrapInBulletList\n    -   WrapInOrderedList\n-   Turn Into:\n    -   TurnIntoCodeFence\n    -   TurnIntoHeading\n    -   TurnIntoText\n-   List Operation:\n    -   SplitListItem\n    -   SinkListItem\n    -   LiftListItem\n\n### GFM\n\nYou can use `import { commands } from '@milkdown/preset-gfm'` to get full commands in code.\n\n**GFM commands include all commands from commonmark preset** with following additional:\n\n-   Toggle:\n    -   ToggleStrikeThrough\n-   Turn Into:\n    -   TurnIntoTaskList\n-   Task List Operation:\n    -   SplitTaskListItem\n    -   SinkTaskListItem\n    -   LiftTaskListItem\n";

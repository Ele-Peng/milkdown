import { createCmdKey, createCmd } from '@milkdown/core';
import { AtomList, createNode, createShortcut } from '@milkdown/utils';
import { InputRule } from 'prosemirror-inputrules';
import { TextSelection, Selection } from 'prosemirror-state';
import { goToNextCell, tableNodes as tableNodesSpecCreator } from 'prosemirror-tables';
import { Node as MarkdownNode } from 'unist';
import { exitTable } from './command';
import { createTable } from './utils';

const tableNodesSpec = tableNodesSpecCreator({
    tableGroup: 'block',
    cellContent: 'paragraph',
    cellAttributes: {
        alignment: {
            default: 'left',
            getFromDOM: (dom) => (dom as HTMLElement).style.textAlign || 'left',
            setDOMAttr: (value, attrs) => {
                attrs.style = `text-align: ${value || 'left'}`;
            },
        },
    },
});

export const SupportedKeys = {
    NextCell: 'NextCell',
    PrevCell: 'PrevCell',
    ExitTable: 'ExitTable',
} as const;
export type SupportedKeys = typeof SupportedKeys;

type Keys = keyof SupportedKeys;

export const PrevCell = createCmdKey();
export const NextCell = createCmdKey();
export const BreakTable = createCmdKey();
export const InsertTable = createCmdKey();

export const table = createNode<Keys>(() => {
    const id = 'table';
    return {
        id,
        schema: tableNodesSpec.table,
        parser: {
            match: (node) => node.type === 'table',
            runner: (state, node, type) => {
                const align = node.align as (string | null)[];
                const children = (node.children as MarkdownNode[]).map((x, i) => ({
                    ...x,
                    align,
                    isHeader: i === 0,
                }));
                state.openNode(type);
                state.next(children);
                state.closeNode();
            },
        },
        serializer: {
            match: (node) => node.type.name === id,
            runner: (state, node) => {
                const firstLine = node.content.firstChild?.content;
                if (!firstLine) return;

                const align: (string | null)[] = [];
                firstLine.forEach((cell) => {
                    align.push(cell.attrs.alignment);
                });
                state.openNode('table', undefined, { align });
                state.next(node.content);
                state.closeNode();
            },
        },
        inputRules: (nodeType, schema) => [
            new InputRule(/^\|\|\s$/, (state, _match, start, end) => {
                const $start = state.doc.resolve(start);
                if (!$start.node(-1).canReplaceWith($start.index(-1), $start.indexAfter(-1), nodeType)) return null;

                const tableNode = createTable(schema);
                const tr = state.tr.replaceRangeWith(start, end, tableNode).scrollIntoView();
                return tr.setSelection(TextSelection.create(tr.doc, start + 3));
            }),
        ],
        commands: (_, schema) => [
            createCmd(PrevCell, () => goToNextCell(-1)),
            createCmd(NextCell, () => goToNextCell(1)),
            createCmd(BreakTable, () => exitTable(schema.nodes.paragraph)),
            createCmd(InsertTable, () => (state, dispatch) => {
                const { selection, tr } = state;
                const { from } = selection;
                const table = createTable(schema);
                const _tr = tr.replaceSelectionWith(table);
                const sel = Selection.findFrom(_tr.doc.resolve(from), 1, true);
                if (sel) {
                    dispatch?.(_tr.setSelection(sel));
                }
                return true;
            }),
        ],
        shortcuts: {
            [SupportedKeys.NextCell]: createShortcut(NextCell, 'Mod-]'),
            [SupportedKeys.PrevCell]: createShortcut(PrevCell, 'Mod-['),
            [SupportedKeys.ExitTable]: createShortcut(BreakTable, 'Mod-Enter'),
        },
    };
});

export const tableRow = createNode(() => {
    const id = 'table_row';
    return {
        id,
        schema: tableNodesSpec.table_row,
        parser: {
            match: (node) => node.type === 'tableRow',
            runner: (state, node, type) => {
                const align = node.align as (string | null)[];
                const children = (node.children as MarkdownNode[]).map((x, i) => ({
                    ...x,
                    align: align[i],
                    isHeader: node.isHeader,
                }));
                state.openNode(type);
                state.next(children);
                state.closeNode();
            },
        },
        serializer: {
            match: (node) => node.type.name === id,
            runner: (state, node) => {
                state.openNode('tableRow');
                state.next(node.content);
                state.closeNode();
            },
        },
    };
});

export const tableCell = createNode(() => {
    const id = 'table_cell';
    return {
        id,
        schema: tableNodesSpec.table_cell,
        parser: {
            match: (node) => node.type === 'tableCell' && !node.isHeader,
            runner: (state, node, type) => {
                const align = node.align as string;
                state
                    .openNode(type, { alignment: align })
                    .openNode(state.schema.nodes.paragraph)
                    .next(node.children)
                    .closeNode()
                    .closeNode();
            },
        },
        serializer: {
            match: (node) => node.type.name === id,
            runner: (state, node) => {
                state.openNode('tableCell').next(node.content).closeNode();
            },
        },
    };
});

export const tableHeader = createNode(() => {
    const id = 'table_header';
    return {
        id,
        schema: tableNodesSpec.table_header,
        parser: {
            match: (node) => node.type === 'tableCell' && !!node.isHeader,
            runner: (state, node, type) => {
                const align = node.align as string;
                state.openNode(type, { alignment: align });
                state.openNode(state.schema.nodes.paragraph);
                state.next(node.children);
                state.closeNode();
                state.closeNode();
            },
        },
        serializer: {
            match: (node) => node.type.name === id,
            runner: (state, node) => {
                state.openNode('tableCell');
                state.next(node.content);
                state.closeNode();
            },
        },
    };
});

export const tableNodes = AtomList.create([table(), tableRow(), tableCell(), tableHeader()]);

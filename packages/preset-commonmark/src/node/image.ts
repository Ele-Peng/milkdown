import { createCmd, createCmdKey } from '@milkdown/core';
import { createNode, findSelectedNodeOfType } from '@milkdown/utils';
import { InputRule } from 'prosemirror-inputrules';
import { NodeSelection } from 'prosemirror-state';

export const ModifyImage = createCmdKey<string>();
export const InsertImage = createCmdKey<string>();
const id = 'image';
export const image = createNode((_, utils) => ({
    id,
    schema: {
        inline: true,
        group: 'inline',
        draggable: true,
        selectable: true,
        marks: '',
        attrs: {
            src: { default: '' },
            alt: { default: null },
            title: { default: null },
        },
        parseDOM: [
            {
                tag: 'img[src]',
                getAttrs: (dom) => {
                    if (!(dom instanceof HTMLElement)) {
                        throw new Error();
                    }
                    return {
                        src: dom.getAttribute('src') || '',
                        alt: dom.getAttribute('alt'),
                        title: dom.getAttribute('title'),
                    };
                },
            },
        ],
        toDOM: (node) => {
            if (node.attrs.src?.length > 0) {
                return ['img', { ...node.attrs, class: utils.getClassName(node.attrs, id) }];
            }
            return [
                'div',
                { ...node.attrs, class: utils.getClassName(node.attrs, 'image empty') },
                ['span', { contentEditable: 'false', class: 'icon' }],
                ['span', { contentEditable: 'false', class: 'placeholder' }],
            ];
        },
    },
    parser: {
        match: ({ type }) => type === id,
        runner: (state, node, type) => {
            const url = node.url as string;
            const alt = node.alt as string;
            const title = node.title as string;
            state.addNode(type, {
                src: url,
                alt,
                title,
            });
        },
    },
    serializer: {
        match: (node) => node.type.name === id,
        runner: (state, node) => {
            state.addNode('image', undefined, undefined, {
                title: node.attrs.title,
                url: node.attrs.src,
                alt: node.attrs.alt,
            });
        },
    },
    commands: (nodeType, schema) => [
        createCmd(InsertImage, (src = '') => (state, dispatch) => {
            if (!dispatch) return true;
            const { tr } = state;
            const node = nodeType.create({ src });
            if (!node) {
                return true;
            }
            const _tr = tr.replaceSelectionWith(node);
            const { $from } = _tr.selection;
            const start = $from.start();
            const __tr = _tr.replaceSelectionWith(schema.node('paragraph'));
            const sel = NodeSelection.create(__tr.doc, start);
            dispatch(__tr.setSelection(sel));
            return true;
        }),
        createCmd(ModifyImage, (src = '') => (state, dispatch) => {
            const node = findSelectedNodeOfType(state.selection, nodeType);
            if (!node) return false;

            const { tr } = state;
            dispatch?.(tr.setNodeMarkup(node.pos, undefined, { ...node.node.attrs, src }).scrollIntoView());

            return true;
        }),
    ],
    inputRules: (nodeType) => [
        new InputRule(/!\[(?<alt>.*?)]\((?<filename>.*?)(?=“|\))"?(?<title>[^"]+)?"?\)/, (state, match, start, end) => {
            const [okay, alt, src = '', title] = match;
            const { tr } = state;
            if (okay) {
                tr.replaceWith(start, end, nodeType.create({ src, alt, title }));
            }

            return tr;
        }),
    ],
}));

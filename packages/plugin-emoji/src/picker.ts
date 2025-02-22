import { EmojiButton } from '@joeattardi/emoji-button';
import { prosePluginFactory } from '@milkdown/core';
import { Plugin } from 'prosemirror-state';
import { Decoration, DecorationSet, EditorView } from 'prosemirror-view';
import { parse } from './parse';

const keyword = ':emoji:';

const checkTrigger = (
    view: EditorView,
    from: number,
    to: number,
    text: string,
    setRange: (from: number, to: number) => void,
) => {
    if (view.composing) return false;
    const { state } = view;
    const $from = state.doc.resolve(from);
    if ($from.parent.type.spec.code) return false;
    const textBefore =
        $from.parent.textBetween($from.parentOffset - keyword.length + 1, $from.parentOffset, undefined, '\ufffc') +
        text;
    if (textBefore === keyword) {
        setRange(from - keyword.length + 1, to + 1);
        return true;
    }
    return false;
};

const pickerPlugin = () => {
    let trigger = false;
    const holder = document.createElement('span');
    let _from = 0;
    let _to = 0;
    const off = () => {
        trigger = false;
        _from = 0;
        _to = 0;
    };

    const plugin = new Plugin({
        props: {
            handleKeyDown() {
                off();
                return false;
            },
            handleClick() {
                off();
                return false;
            },
            handleTextInput(view, from, to, text) {
                trigger = checkTrigger(view, from, to, text, (from, to) => {
                    _from = from;
                    _to = to;
                });

                if (!trigger) {
                    off();
                }
                return false;
            },
            decorations(state) {
                if (!trigger) return null;

                return DecorationSet.create(state.doc, [Decoration.widget(state.selection.to, holder)]);
            },
        },
        view: (editorView) => {
            const { parentNode } = editorView.dom;
            if (!parentNode) {
                throw new Error();
            }
            const emojiPicker = new EmojiButton({
                autoFocusSearch: false,
                style: 'twemoji',
                theme: 'dark',
                zIndex: 99,
            });
            emojiPicker.on('emoji', (selection) => {
                const start = _from;
                const end = _to;
                off();
                const html = parse(selection.emoji);
                const node = editorView.state.schema.node('emoji', { html });
                const { tr } = editorView.state;

                editorView.dispatch(tr.replaceRangeWith(start, end, node));
            });
            return {
                update: () => {
                    if (!trigger) {
                        emojiPicker.hidePicker();
                        return null;
                    }
                    emojiPicker.showPicker(holder);
                    return null;
                },
                destroy: () => {
                    emojiPicker.destroyPicker();
                },
            };
        },
    });

    return plugin;
};

export const picker = prosePluginFactory(pickerPlugin());

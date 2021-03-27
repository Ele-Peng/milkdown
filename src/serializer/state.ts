import type { Mark, Node } from 'prosemirror-model';
import { hasText } from '../utility/prosemirror';
import type { MarkMap, NodeMap } from './types';

import { Utility } from './utility';

export class State {
    private out = '';
    private delimitation = '';
    private closed: false | Node = false;
    public utils = Utility;

    constructor(private nodes: NodeMap, private marks: MarkMap) {
        this.nodes = nodes;
        this.marks = marks;
    }

    get output() {
        return this.out;
    }

    /**
     * Check whether the output string is at blank.
     */
    get atBlank() {
        const emptyOrNewline = /(^|\n)$/;
        return emptyOrNewline.test(this.out);
    }

    /**
     * Render the contents of a given node.
     *
     * @param parent The parent of the contents to be rendered.
     * @returns State instance.
     */
    renderContent(parent: Node) {
        parent.forEach((node: Node, _: unknown, i: number) => this.render(node, parent, i));

        return this;
    }

    /**
     * Render a node.
     *
     * @param node The node to be rendered.
     * @param parent The parent of the node.
     * @param index The index of the node in the contents of it's parent.
     * @returns State instance.
     */
    render(node: Node, parent: Node, index: number) {
        const renderer = this.nodes[node.type.name];
        if (!renderer) throw new Error();
        renderer(this, node, parent, index);

        return this;
    }

    /**
     * Ensure the end of the output is blank.
     *
     * @returns State instance.
     */
    ensureNewLine() {
        if (!this.atBlank) this.out += '\n';

        return this;
    }

    /**
     * Set a given node to be closed.
     *
     * @param node A given node.
     * @returns State instance.
     */
    closeBlock(node: Node) {
        this.closed = node;

        return this;
    }

    /**
     * Close the node to be closed.
     * Add some newline.
     * Respect delimitation.
     *
     * @param size Size of newline to be added after.
     * @returns State instance.
     */
    flushClose(size = 1) {
        if (!this.closed) return this;

        if (!this.atBlank) this.out += '\n';

        if (size >= 1) {
            const prefix = this.utils.removeWhiteSpaceAfter(this.delimitation);
            const delimitations = this.utils.repeat(prefix + '\n', size);
            this.out += delimitations;
        }
        this.closed = false;

        return this;
    }

    /**
     * Write the given content to the output.
     * Close node if have unclosed node.
     * Respect delimitation if output is at blank.
     *
     * @param content
     * @returns State instance.
     */
    write(content?: string) {
        this.flushClose();
        if (!content) return this;

        if (this.delimitation && this.atBlank) this.out += this.delimitation;
        this.out += content;

        return this;
    }

    /**
     * Add a text line by line use `write` method.
     *
     * @param text Text need to be added.
     * @param escape Whether to escaped the special chars.
     * @returns State instance.
     */
    text(text: string, escape = false) {
        const lines = text.split('\n');
        lines.forEach((line, i) => {
            const nextLine = escape ? this.utils.escape(line, Boolean(this.atBlank || this.closed)) : line;
            this.write(nextLine);

            const isLastLine = i === lines.length - 1;
            if (!isLastLine) this.out += '\n';
        });

        return this;
    }

    wrapBlock(delimitation: string, node: Node, f: () => void, firstDelimitation = delimitation) {
        this.write(firstDelimitation);

        const old = this.delimitation;
        this.delimitation += delimitation;
        f();
        this.delimitation = old;

        this.closeBlock(node);

        return this;
    }

    /**
     *  Get the markdown string for a given opening or closing mark.
     *
     * @param mark Mark type.
     * @param isOpen Mark is open or close.
     * @param parent Parent node.
     * @param index The index of current node.
     * @returns result string.
     */
    markString(mark: Mark, isOpen: boolean, parent: Node, index: number) {
        const markInfo = this.marks[mark.type.name];
        if (!markInfo) throw new Error();
        const value = isOpen ? markInfo.open : markInfo.close;
        return typeof value === 'string' ? value : value(this, mark, parent, index);
    }

    wrapWithMark(mark: Mark, parent: Node, index: number, text: string) {
        const left = this.markString(mark, true, parent, index);
        const right = this.markString(mark, false, parent, index + 1);
        this.text(left + text + right);

        return this;
    }

    serializeMarks(marks: Mark[], parent: Node, index: number, isOpen = false) {
        return marks.map((mark) => this.markString(mark, isOpen, parent, index)).join('');
    }

    renderInline(parent: Node) {
        let marksNotClosed: Mark[] = [];

        const cleanUp = () => {
            const clearMarks = this.serializeMarks(marksNotClosed, parent, parent.childCount + 1);

            this.write(clearMarks);
        };

        parent.forEach((node, _, index) => {
            if (!hasText(node)) {
                this.render(node, parent, index);
                return;
            }

            const marks: Mark[] = node.marks || [];
            // Find marks not closed and not exists in current node
            const marksToBeClosed = marksNotClosed.filter((mark) => !marks.includes(mark));
            // Find new added marks
            const marksToBeOpened = marks.filter((mark) => !marksNotClosed.includes(mark));

            marksToBeOpened.forEach((mark) => marksNotClosed.push(mark));
            marksNotClosed = marksNotClosed.filter((mark) => !marksToBeClosed.includes(mark));

            const openMark = this.serializeMarks(marksToBeOpened, parent, index, true);

            const closePreviousNodeMark = this.serializeMarks(marksToBeClosed, parent, index + 1);

            this.write(closePreviousNodeMark + openMark + node.text);
        });

        cleanUp();

        return this;
    }

    renderList(node: Node, delimitation: string, getFirstDelimitation: (index: number) => string) {
        if (this.closed && this.closed.type === node.type) {
            this.flushClose(2);
        }

        node.forEach((child, _, i) => {
            this.wrapBlock(delimitation, node, () => this.render(child, node, i), getFirstDelimitation(i));
        });
    }
}

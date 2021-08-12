import { test, expect } from '@playwright/test';

test('has editor', async ({ page }) => {
    await page.goto('/#/preset-commonmark');
    const milkdown = await page.waitForSelector('.milkdown');
    const editor = await milkdown.waitForSelector('.editor');
    expect(await editor.getAttribute('contenteditable')).toBe('true');
});

test.describe('input', () => {
    test.describe('node', () => {
        test('input heading', async ({ page }) => {
            await page.goto('/#/preset-commonmark');
            const editor = await page.waitForSelector('.editor');

            await editor.type('# Heading1');
            expect(await editor.waitForSelector('.h1 >> text=Heading1')).toBeTruthy();

            await editor.type('\n');

            await editor.type('## Heading2');
            expect(await editor.waitForSelector('.h2 >> text=Heading2')).toBeTruthy();
        });

        test('input blockquote ', async ({ page }) => {
            await page.goto('/#/preset-commonmark');
            const editor = await page.waitForSelector('.editor');

            await editor.type('> Blockquote');
            const blockquote = await page.waitForSelector('.blockquote');

            expect(await blockquote.$$('p')).toHaveLength(1);
            expect(await blockquote.waitForSelector('p >> text=Blockquote')).toBeTruthy();

            await editor.type('\n');

            await editor.type('Next line.');

            expect(await blockquote.$$('p')).toHaveLength(2);
            expect(await blockquote.waitForSelector('p:last-child >> text=Next line.')).toBeTruthy();
        });

        test('input bullet list ', async ({ page }) => {
            await page.goto('/#/preset-commonmark');
            const editor = await page.waitForSelector('.editor');

            await editor.type('* list item 1');
            const list = await page.waitForSelector('.bullet-list');

            expect(await list.$$('.list-item')).toHaveLength(1);
            expect(await list.waitForSelector('.list-item >> text=list item 1')).toBeTruthy();

            await editor.type('\n');

            await editor.type('list item 2');

            expect(await list.$$('.list-item')).toHaveLength(2);
            expect(await list.waitForSelector('.list-item:last-child >> text=list item 2')).toBeTruthy();
        });

        test('input ordered list ', async ({ page }) => {
            await page.goto('/#/preset-commonmark');
            const editor = await page.waitForSelector('.editor');

            await editor.type('1. list item 1');
            const list = await page.waitForSelector('.ordered-list');

            expect(await list.$$('.list-item')).toHaveLength(1);
            expect(await list.waitForSelector('.list-item >> text=list item 1')).toBeTruthy();

            await editor.type('\n');

            await editor.type('list item 2');

            expect(await list.$$('.list-item')).toHaveLength(2);
            expect(await list.waitForSelector('.list-item:last-child >> text=list item 2')).toBeTruthy();
        });

        test('input hr', async ({ page }) => {
            await page.goto('/#/preset-commonmark');
            const editor = await page.waitForSelector('.editor');

            await editor.type('---');
            expect(await editor.waitForSelector('.hr')).toBeDefined();
        });

        test('input image', async ({ page }) => {
            await page.goto('/#/preset-commonmark');
            const editor = await page.waitForSelector('.editor');

            await editor.type('![image](url)');
            const image = await editor.waitForSelector('.image');
            expect(image).toBeDefined();
            expect(await image.getAttribute('src')).toBe('url');
        });

        test('input code block', async ({ page }) => {
            await page.goto('/#/preset-commonmark');
            const editor = await page.waitForSelector('.editor');

            await editor.type('```markdown ');
            const fence = await editor.waitForSelector('.code-fence');
            expect(fence).toBeDefined();
            expect(await fence.getAttribute('data-language')).toBe('markdown');
        });
    });

    test.describe('mark', () => {
        test('input bold', async ({ page }) => {
            await page.goto('/#/preset-commonmark');
            const editor = await page.waitForSelector('.editor');

            await editor.type('here is **bold test**!');
            expect(await editor.waitForSelector('.strong >> text=bold test')).toBeTruthy();
        });

        test('input em', async ({ page }) => {
            await page.goto('/#/preset-commonmark');
            const editor = await page.waitForSelector('.editor');

            await editor.type('here is *em test*!');
            expect(await editor.waitForSelector('.em >> text=em test')).toBeTruthy();
        });

        test('input inline code', async ({ page }) => {
            await page.goto('/#/preset-commonmark');
            const editor = await page.waitForSelector('.editor');

            await editor.type('here is `code test`!');
            expect(await editor.waitForSelector('.code-inline >> text=code test')).toBeTruthy();
        });

        test('input link', async ({ page }) => {
            await page.goto('/#/preset-commonmark');
            const editor = await page.waitForSelector('.editor');

            await editor.type('here is [link test](url)!');
            expect(await editor.waitForSelector('.link >> text=link test')).toBeTruthy();

            const link = await editor.waitForSelector('.link');
            expect(await link.getAttribute('href')).toBe('url');
        });
    });
});

test('press hard break', async ({ page }) => {
    await page.goto('/#/preset-commonmark');
    const editor = await page.waitForSelector('.editor');
    await editor.type('something');
    await editor.press('Shift+Enter');
    await editor.type('new line');
    await editor.press('Shift+Enter');
    expect(await editor.$$('.hardbreak')).toHaveLength(2);
});

test.describe('board Shortcuts', () => {
    test('code-inline Mod-e', async ({ page }) => {
        await page.goto('/#/preset-commonmark');
        const editor = await page.waitForSelector('.editor');
        await editor.type('something');
        await editor.press('Shift');
        await editor.press('ArrowLeft+ArrowLeft+ArrowLeft');
        await editor.press('Mod+E');
        const element = await editor.waitForSelector('p .code-inline');
        expect(element).toBeTruthy();
        expect(element.textContent).toEqual('ing');

        // undo
        await editor.press('Shift');
        await editor.press('ArrowLeft+ArrowLeft+ArrowLeft');
        await editor.press('Mod+E');
        const undoEelement = await editor.waitForSelector('p .code-inline');
        expect(undoEelement).toBeFalsy();
    })

    test('em Mod-i', async ({ page }) => {
        await page.goto('/#/preset-commonmark');
        const editor = await page.waitForSelector('.editor');
        await editor.type('something');
        await editor.press('Shift');
        await editor.press('ArrowLeft+ArrowLeft+ArrowLeft');
        await editor.press('Mod+I');
        const element = await editor.waitForSelector('p em.em');
        expect(element).toBeTruthy();
        expect(element.textContent).toEqual('ing');

        // undo
        await editor.press('Shift');
        await editor.press('ArrowLeft+ArrowLeft+ArrowLeft');
        await editor.press('Mod+I');
        const undoEelement = await editor.waitForSelector('p em.em');
        expect(undoEelement).toBeFalsy();
    })

    test('strong Mod-i', async ({ page }) => {
        await page.goto('/#/preset-commonmark');
        const editor = await page.waitForSelector('.editor');
        await editor.type('something');
        await editor.press('Shift');
        await editor.press('ArrowLeft+ArrowLeft+ArrowLeft');
        await editor.press('Mod+B');
        const element = await editor.waitForSelector('p strong.strong');
        expect(element).toBeTruthy();
        expect(element.textContent).toEqual('ing');

        // undo
        await editor.press('Shift');
        await editor.press('ArrowLeft+ArrowLeft+ArrowLeft');
        await editor.press('Mod+B');
        const undoEelement = await editor.waitForSelector('p strong.strong');
        expect(undoEelement).toBeFalsy();
    })

    test('strong Mod-Shift-b', async ({ page }) => {
        await page.goto('/#/preset-commonmark');
        const editor = await page.waitForSelector('.editor');
        await editor.press('Mod+Shift+B');
        await editor.type('// write');
        await editor.press('Shift');
        await editor.type('// something');
        await editor.press('Shift');
        await editor.type('// here');
        const paragraphList = await editor.$$('p blockquote.blockquote .paragraph');
        const firstElement = await editor.waitForSelector('p blockquote.blockquote:nth-child(1)');
        expect(paragraphList).toHaveLength(3);
        expect(firstElement.textContent).toEqual('// write');
    })
})

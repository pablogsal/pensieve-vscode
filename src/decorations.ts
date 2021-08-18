import * as vscode from 'vscode';

let decorators: vscode.TextEditorDecorationType[] = [];


export function clearDecorations() {
    decorators.forEach((ld) => ld.dispose());
    decorators = [];
}

export function setLineHeat(line: number, size: number, total: number) {
    const editor = vscode.window.activeTextEditor;
    if (editor === undefined) {
        return;
    }
    const color: string = `rgba(192, 64, 64, ${size / total})`;
    const lineDecorator = vscode.window.createTextEditorDecorationType({
        backgroundColor: color,
        after: {
            contentText: `    size: ${(size * 100 / total).toFixed(2)}%`,
            color: "rgba(128,128,128,0.7)",
            margin: "8px"
        },
        overviewRulerColor: color,
        overviewRulerLane: 1,
        isWholeLine: true,
    });
    editor.setDecorations(lineDecorator, [new vscode.Range(
        editor.document.lineAt(line - 1).range.start,
        editor.document.lineAt(line - 1).range.end
    )]);
    decorators.push(lineDecorator);
}

export function setLinesHeat(lines: Map<number, number>, total: number) {
    lines.forEach((v, k) => {
        console.log(`Highlighting line ${k}`);
        setLineHeat(k, v, total);
    });
}
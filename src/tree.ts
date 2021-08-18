import * as vscode from 'vscode';
import { StatElement, PensieveStats } from './data';

export class StackItem extends vscode.TreeItem {

    constructor(
        public readonly element: StatElement,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    ) {
        super(element.name, collapsibleState);

        this.tooltip = element.location[1] ? `in ${element.location[1]}` : undefined;
        this.command = {
            command: 'pensieve-vscode.openSourceAtLine',
            title: "open source at line",
            arguments: [element.location[1], element.location[2]]
        };
    }

}

export class CallStackDataProvider implements vscode.TreeDataProvider<StatElement> {

    public static readonly viewType = 'pensieve-vscode.callStacks';

    private _onDidChangeTreeData: vscode.EventEmitter<StatElement | undefined | void> = new vscode.EventEmitter<StatElement | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<StatElement | undefined | void> = this._onDidChangeTreeData.event;
    private stats: PensieveStats | null = null;

    refresh(stats: PensieveStats) {
        this.stats = stats;
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(v: StatElement): vscode.TreeItem {
        return new StackItem(v, v.children.length > 0 ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None);
    }

    getChildren(element?: StatElement): Thenable<StatElement[]> {
        if (!this.stats || this.stats.tree === undefined) {
            return Promise.resolve([]);
        }

        if (!element) {
            let callStack = [...this.stats?.tree.children];
            return Promise.resolve(callStack);
        } else {
            return Promise.resolve(element.children);
        }
    }
}

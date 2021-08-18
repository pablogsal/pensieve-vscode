import * as vscode from 'vscode';
import { StatElement, PensieveStats } from './data';

export class TopItem extends vscode.TreeItem {

    constructor(
        public readonly element: StatElement,
        public readonly total: number,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    ) {

        super(`${element.name}  (${(element.value / total * 100).toFixed(2)}%)`
            , collapsibleState);

        this.tooltip = element.location[1] ? `in ${element.location[1]}` : undefined;
        this.command = {
            command: 'pensieve-vscode.openSourceAtLine',
            title: "open source at line",
            arguments: [element.location[1], element.location[2]]
        };
    }

}

export class TopDataProvider implements vscode.TreeDataProvider<StatElement> {

    public static readonly viewType = 'pensieve-vscode.top';

    private _onDidChangeTreeData: vscode.EventEmitter<StatElement | undefined | void> = new vscode.EventEmitter<StatElement | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<StatElement | undefined | void> = this._onDidChangeTreeData.event;
    private stats: PensieveStats | null = null;

    refresh(stats: PensieveStats) {
        this.stats = stats;
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(v: StatElement): vscode.TreeItem {
        return new TopItem(v, this.stats?.tree?.value ?? 0, v.children.length > 0 ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None);
    }

    getChildren(element?: StatElement): Thenable<StatElement[]> {
        if (!this.stats) {
            return Promise.resolve([]);
        }

        if (!element) {
            let top = this.stats.topAllocations;
            return Promise.resolve(top);
        } else {
            return Promise.resolve(element.children);
        }
    }
}
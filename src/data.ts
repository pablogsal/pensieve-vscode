import * as vscode from 'vscode';
import {readFileSync} from 'fs';
import internal = require('stream');

export interface StatElement {
    name: string;
    location: [string, string, number];
    value: number;
    children: Array<StatElement>;
    n_allocations: number;
    interesting: boolean;
  }

interface FrameObject {
    scope: string;
    lineNumber: number;
    module: string;
};

export interface PensieveStats {
    tree?: StatElement;
    lineMap: Map<string, Map<number, number>>;
    topAllocations: Array<StatElement>;
}

export class PensieveStats implements PensieveStats {
    private _beforeCbs: (() => void)[];
    private _afterCbs: ((stats: PensieveStats) => void)[];


    public constructor() {
        this.tree = undefined;
        this.lineMap = new Map();
        this.topAllocations = new Array<StatElement>();
        this._beforeCbs = [];
        this._afterCbs = [];
    }

    clear() {
        this.tree = undefined;
        this.lineMap.clear();
        this.topAllocations = new Array<StatElement>();
    }

    public registerBeforeCallback(cb: () => void) {
        this._beforeCbs.push(cb);
    }

    public registerAfterCallback(cb: (stats: PensieveStats) => void) {
        this._afterCbs.push(cb);
    }

    private* iterNodes(element: StatElement): Generator<StatElement> {
        yield element;
        for (const child of element.children) {
            for (const other of this.iterNodes(child)) {
                yield other;
            }
        }
    }

    private updateLineMap(root: StatElement){

        for (const element of this.iterNodes(root)) {
            let module = element.location[1];
            let lineNumber = element.location[2];
            if (!(this.lineMap.has(module))) {
                this.lineMap.set(module, new Map<number, number>());
            }
            let moduleEntry = this.lineMap.get(module);
            if (!(moduleEntry?.has(lineNumber))) {
                moduleEntry?.set(lineNumber, 0);
            }
            let currSize = moduleEntry?.get(lineNumber)!;
            moduleEntry?.set(lineNumber, currSize + element.value);
        }
    }


    private updateTopAllocations(root: StatElement){
        let topAllocations = new Map<string, StatElement>();
        for (const element of this.iterNodes(root)) {
            if (!element.interesting || element.children.length !== 0) {
                continue;
            }
            let location = element.location.join(',');
            if (!(topAllocations?.has(location))) {
                topAllocations?.set(location, element);
            } else {
                let allocation = topAllocations?.get(location)!;
                allocation.value += element.value;
            }
        }
        this.topAllocations = [...topAllocations.values()].sort((a, b) => b.value - a.value).slice(0, 10);
    }

    public readSampleFile(file: string) {
        this._beforeCbs.forEach(cb => cb());

        let rawdata = readFileSync(file, 'utf8');
        let tree = JSON.parse(rawdata);
        this.tree = tree;
        this.updateLineMap(tree);
        this.updateTopAllocations(tree);
        this._afterCbs.forEach(cb => cb(this));
    }
}
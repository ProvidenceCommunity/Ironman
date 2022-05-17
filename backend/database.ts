import {IronmanMatch} from "./model";

interface MatchList {
    [id: string]: IronmanMatch;
}

let matches: MatchList = {}

export async function loadDatabase(): Promise<void> {
    //TODO SQLite?
}

export async function writeDatabase(): Promise<void> {
    //TODO SQLite?
}

export function getMatch(id: string): IronmanMatch {
    return matches[id];
}

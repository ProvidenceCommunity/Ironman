import {IronmanMatch} from "./model";
import session from 'express-session';

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

export const sessionStore = session({ secret: "TODO FIX ME" });

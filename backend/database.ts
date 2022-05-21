import {IronmanMatch, IronmanScoringType} from "./model";
import session from 'express-session';
import { randomUUID } from 'crypto';

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

export function createMatch(players: string[], scoringType: IronmanScoringType): string {
    let uuid = randomUUID();
    while (matches[uuid] !== undefined) {
        uuid = randomUUID();
    }
    matches[uuid] = {
        id: uuid,
        players,
        scoringType,
        scores: players.map((e) => { return 0 }),
        rounds: []
    };
    return uuid;
}

export const sessionStore = session({ secret: "TODO FIX ME" });

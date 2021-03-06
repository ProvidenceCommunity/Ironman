import {IronmanMatch, IronmanScoringType, SimplifiedIronmanMatch} from "./model";
import session from 'express-session';
import { randomUUID } from 'crypto';
import { readFile, writeFile } from 'fs/promises';
import debug from "debug";

interface MatchList {
    [id: string]: IronmanMatch;
}

const dbg = debug("ironman:database");
let matches: MatchList = {}

export async function loadDatabase(): Promise<void> {
    try {
        const file = await readFile("./database.json", 'utf8');
        matches = JSON.parse(file);
        dbg("Loaded %d matches", Object.keys(matches).length);
    } catch {
        dbg("Failed to load database, assuming empty");
        matches = {};
    }
}

export async function writeDatabase(): Promise<void> {
    await writeFile('./database.json', JSON.stringify(matches), 'utf8');
    dbg("Wrote %d matches to disk", Object.keys(matches).length);
}

export function getMatch(id: string): IronmanMatch {
    return matches[id];
}

export function setMatch(id: string, match: IronmanMatch): void {
    matches[id] = match;
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

export function getMatches(): SimplifiedIronmanMatch[] {
    return Object.values(matches).map(e => {
        return {
            id: e.id,
            players: e.players,
            finished: e.finished
        }
    });
}

export const sessionStore = session({ secret: randomUUID(), cookie: { maxAge: 1800000 }, rolling: true });

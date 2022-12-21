import {IronmanMatch, MatchField, SimplifiedIronmanMatch} from "./model";
import session from 'express-session';
import { randomUUID } from 'crypto';
import { readFile, writeFile } from 'fs/promises';
import debug from "debug";
import createMemoryStore from 'memorystore';

const MemoryStore = createMemoryStore(session);

interface MatchList {
    [id: string]: IronmanMatch;
}

interface GlobalConfig {
    tournamentName: string;
    matchSchema: MatchField[];
    discord: {
        enableMatchupChannel: boolean;
        enableMatchesCommand: boolean;
        guildId: string;
        channelId: string;
        botToken: string;
    }
}

const dbg = debug("ironman:database");
let matches: MatchList = {}
let config: GlobalConfig;

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

export async function loadConfig(): Promise<void> {
    try {
        const file = await readFile("./config.json", "utf8");
        config = JSON.parse(file);
        dbg("Loaded global config.");
    } catch {
        dbg("Failed to load global config, reverting to default");
        config = {
            tournamentName: "Untitled tournament",
            matchSchema: [],
            discord: {
                enableMatchupChannel: false,
                enableMatchesCommand: false,
                botToken: "",
                channelId: "",
                guildId: ""
            }
        }
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
    // Because players may change, we need to make the scores array longer
    // It's jank that that's done here, but everything is jank, really
    while (match.players.length > match.scores.length) {
        match.scores.push(0);
    }
    while (match.players.length < match.scores.length) {
        match.scores.pop();
    }
    matches[id] = match;
}

export function createMatch(players: string[]): string {
    let uuid = randomUUID();
    while (matches[uuid] !== undefined) {
        uuid = randomUUID();
    }
    matches[uuid] = {
        id: uuid,
        players,
        scores: players.map((e) => { return 0 }),
        rounds: [],
        schedulingData: {},
        timestamp: -1
    };
    return uuid;
}

export function getMatches(): SimplifiedIronmanMatch[] {
    return Object.values(matches).map(e => {
        return {
            id: e.id,
            players: e.players,
            finished: e.finished,
            schedulingData: e.schedulingData,
            timestamp: e.timestamp
        }
    });
}

export function getConfig(): GlobalConfig {
    return config;
}

export const sessions = new MemoryStore({ checkPeriod: 1800000 });
export const sessionStore = session({ secret: randomUUID(), cookie: { maxAge: 1800000 }, rolling: true, store: sessions, name: "providence-ironman" });

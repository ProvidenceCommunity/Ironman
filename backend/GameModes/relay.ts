import {GameMode, GameModeDetails, GeneratorOption, GeneratorOptions} from "../model";
import axios from "axios";

interface SpinGeneratorOptions {
    missionPool: string[];
    criteriaFilters: {
        specificDisguise: boolean;
        specificMelee: boolean;
        specificFirearms: boolean;
        specificAccidents: boolean;
        uniqueTargetKills: boolean;
        genericKills: boolean;
        rrBannedKills: boolean;
    }
}

interface Spin {
    mission: {
        slug: string;
        name: string;
        locationTileUrl: string;
    },
    targetConditions: {
        target: {
            name: string;
            tileUrl: string;
        },
        killMethod: {
            name: string;
            tileUrl: string;
            selectedVariant: string;
        },
        disguise: {
            name: string;
            tileUrl: string;
        }
    }[]
}

interface AdminEventPayload {
    playerIndex?: number;
    mapIndex?: number;
}

const FORFEIT_TIME = 1800000;

const missionIdToSlug: {[key: string]: string} = {
    "Freeform Training (ICA Facility)": "hitman|ica-facility|freeform-training|professional",
    "The Final Test (ICA Facility)": "hitman|ica-facility|the-final-test|professional",
    "The Showstopper (Paris)": "hitman|paris|the-showstopper|professional",
    "World of Tomorrow (Sapienza)": "hitman|sapienza|world-of-tomorrow|professional",
    "The Icon (Sapienza)": "hitman|sapienza|the-icon|professional",
    "Landslide (Sapienza)": "hitman|sapienza|landslide|professional",
    "The Author (Sapienza)": "hitman|sapienza|the-author|professional",
    "A Gilded Cage (Marrakesh)": "hitman|marrakesh|a-gilded-cage|professional",
    "A House Built on Sand (Marrakesh)": "hitman|marrakesh|a-house-built-on-sand|professional",
    "Club 27 (Bangkok)": "hitman|bangkok|club-27|professional",
    "The Source (Bangkok)": "hitman|bangkok|the-source|professional",
    "Freedom Fighters (Colorado)": "hitman|colorado|freedom-fighters|professional",
    "Situs Inversus (Hokkaido)": "hitman|hokkaido|situs-inversus|professional",
    "Hokkaido Snow Festival (Hokkaido)": "hitman|hokkaido|hokkaido-snow-festival|professional",
    "Patient Zero (Hokkaido)": "hitman|hokkaido|patient-zero|professional",
    "Nightcall (Hawke's Bay)": "hitman2|hawkes-bay|nightcall|professional",
    "The Finish Line (Miami)": "hitman2|miami|finish-line|professional",
    "A Silver Tongue (Miami)": "hitman2|miami|a-silver-tongue|professional",
    "Three-Headed Serpent (Santa Fortuna)": "hitman2|santa-fortuna|three-headed-serpent|professional",
    "Embrace of the Serpent (Santa Fortuna)": "hitman2|santa-fortuna|embrace-of-the-serpent|professional",
    "Chasing a Ghost (Mumbai)": "hitman2|mumbai|chasing-a-ghost|professional",
    "Illusions of Grandeur (Mumbai)": "hitman2|mumbai|illusions-of-grandeur|professional",
    "Another Life (Whittleton Creek)": "hitman2|whittleton-creek|another-life|professional",
    "A Bitter Pill (Whittleton Creek)": "hitman2|whittleton-creek|a-bitter-pill|professional",
    "The Ark Society (Isle of Sgàil)": "hitman2|isle-of-sgail|ark-society|professional",
    "Golden Handshake (New York)": "hitman2|new-york|golden-handshake|professional",
    "The Last Resort (Haven Island)": "hitman2|haven-island|the-last-resort|professional",
    "On Top Of The World (Dubai)": "hitman3|dubai|on-top-of-the-world|professional",
    "Death In The Family (Dartmoor)": "hitman3|dartmoor|death-in-the-family|professional",
    "Apex Predator (Berlin)": "hitman3|berlin|apex-predator|professional",
    "End Of An Era (Chongqing)": "hitman3|chongqing|end-of-an-era|professional",
    "The Farewell (Mendoza)": "hitman3|mendoza|the-farewell|professional",
    "Untouchable (Carpathian Mountains)": "hitman3|carpathian-mountains|untouchable|professional"
}

export class RelayGameMode implements GameMode {
    getGeneratorOptions(): GeneratorOption[] {
        return [
            {
                id: "timelimit",
                type: "number",
                caption: "Timelimit per map (in minutes)"
            },
            {
                id: "maps",
                type: "list",
                caption: "Maps",
                options: {
                    id: "map_list_item",
                    type: "select",
                    caption: "Map",
                    options: Object.keys(missionIdToSlug)
                }
            }
        ];
    }

    async generate(options: GeneratorOptions, players: string[]): Promise<GameModeDetails> {
        const spinGenOptions: SpinGeneratorOptions[] = [];
        const spins: Spin[] = [];

        for (const map of options['maps'] as string[]) {
            const options: SpinGeneratorOptions = {
                missionPool: [missionIdToSlug[map]],
                criteriaFilters: {
                    specificDisguise: true,
                    specificMelee: true,
                    specificAccidents: true,
                    specificFirearms: true,
                    uniqueTargetKills: false,
                    genericKills: false,
                    rrBannedKills: false
                }
            }
            spinGenOptions.push(options);
            spins.push(await this.generateSpin(options))
        }

        return {
            timelimit: options['timelimit'],
            doneStatus: players.map(() => { return 0 }),
            lastDone: players.map(() => { return -1 }),
            currentSpin: players.map(() => { return 0 }),
            rta: players.map(() => { return (options['maps'] as string[]).map(() => { return 0 }) }),
            currentSpinStart: players.map(() => { return -1 }),
            maps: spins,
            spinGenOptions: spinGenOptions,
        };
    }

    async handleAdminEvent(event: string, payload: AdminEventPayload, currentState: GameModeDetails, roundStartingTimestamp: number): Promise<GameModeDetails> {
        if (event === "acceptDone") {
            if ((currentState['currentSpinStart'] as number[])[payload.playerIndex as number] === -1) {
                (currentState['rta'] as number[][])[payload.playerIndex as number][(currentState['currentSpin'] as number[])[payload.playerIndex as number]] = (currentState['lastDone'] as number[])[payload.playerIndex as number] - roundStartingTimestamp;
            } else {
                (currentState['rta'] as number[][])[payload.playerIndex as number][(currentState['currentSpin'] as number[])[payload.playerIndex as number]] = (currentState['lastDone'] as number[])[payload.playerIndex as number] - (currentState['currentSpinStart'] as number[])[payload.playerIndex as number];
            }
            (currentState['currentSpin'] as number[])[payload.playerIndex as number] += 1
            if ((currentState['currentSpin'] as number[])[payload.playerIndex as number] == (currentState['maps'] as string[]).length) {
                (currentState['doneStatus'] as number[])[payload.playerIndex as number] = 2;
            } else {
                (currentState['currentSpinStart'] as number[])[payload.playerIndex as number] = Date.now();
                (currentState['doneStatus'] as number[])[payload.playerIndex as number] = 0;
                (currentState['lastDone'] as number[])[payload.playerIndex as number] = -1;
            }
        }
        if (event === "rejectDone" || event === "rejectForfeit") {
            (currentState['doneStatus'] as number[])[payload.playerIndex as number] = 0;
            (currentState['lastDone'] as number[])[payload.playerIndex as number] = -1;
        }
        if (event === "acceptForfeit") {
            (currentState['rta'] as number[][])[payload.playerIndex as number][(currentState['currentSpin'] as number[])[payload.playerIndex as number]] = FORFEIT_TIME;
            (currentState['currentSpin'] as number[])[payload.playerIndex as number] += 1
            if ((currentState['currentSpin'] as number[])[payload.playerIndex as number] == (currentState['maps'] as string[]).length) {
                (currentState['doneStatus'] as number[])[payload.playerIndex as number] = 4;
            } else {
                (currentState['currentSpinStart'] as number[])[payload.playerIndex as number] = Date.now();
                (currentState['doneStatus'] as number[])[payload.playerIndex as number] = 0;
                (currentState['lastDone'] as number[])[payload.playerIndex as number] = -1;
            }
        }
        if (event === "respin") {
            (currentState['maps'] as Spin[])[payload.mapIndex as number] = await this.generateSpin((currentState['spinGenOptions'] as SpinGeneratorOptions[])[payload.mapIndex as number]);
        }
        return currentState;
    }

    handleUserEvent(event: string, player: number, payload: unknown, currentState: GameModeDetails): GameModeDetails {
        if (event === "done") {
            (currentState['doneStatus'] as number[])[player] = 1;
            (currentState['lastDone'] as number[])[player] = Date.now();
        } if (event === "forfeit") {
            (currentState['doneStatus'] as number[])[player] = 3;
            (currentState['lastDone'] as number[])[player] = Date.now();
        }
        return currentState;
    }

    getPlayerDetails(player: number, currentState: GameModeDetails, roundStartingTimestamp: number): GameModeDetails {
        let countdown = 0;
        if ((currentState['currentSpinStart'] as number[])[player] === -1) {
            countdown = Date.now() - roundStartingTimestamp;
        } else {
            countdown = Date.now() - (currentState['currentSpinStart'] as number[])[player];
        }

        // TODO: Next spin automatically, somehow?

        return {
            doneStatus: (currentState['doneStatus'] as number[])[player],
            lastDone: (currentState['lastDone'] as number[])[player],
            map: (currentState['maps'] as string[])[(currentState['currentSpin'] as number[])[player]],
            currentMapIndex: (currentState['currentSpin'] as number[])[player],
            totalMaps: (currentState['maps'] as string[]).length,
            countdown
        };
    }

    async generateSpin(options: SpinGeneratorOptions): Promise<Spin> {
        try {
            const spin = await axios.post('https://roulette.hitmaps.com/api/spins', options, { validateStatus: () => { return true } });
            return spin.data;
        } catch(e) {
            return {
                mission: {
                    slug: "error",
                    name: "Error in spin generation.",
                    locationTileUrl: "",
                },
                targetConditions: [{
                    target: {
                        name: (e as Error).name,
                        tileUrl: ""
                    },
                    killMethod: {
                        name: (e as Error).message,
                        selectedVariant: "",
                        tileUrl: ""
                    },
                    disguise: {
                        name: "",
                        tileUrl: ""
                    }
                }]
            }
        }
    }

}

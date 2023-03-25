import {GameMode, GameModeDetails, GeneratorOption, GeneratorOptions, IronmanMatch} from "../model";
import axios from "axios";
import {setMatch} from "../database";

interface SpinGeneratorOptions {
    missionPool: string[];
    criteriaFilters: {
        specificDisguises: boolean;
        specificMelee: boolean;
        specificFirearms: boolean;
        specificAccidents: boolean;
        uniqueTargetKills: boolean;
        genericKills: boolean;
        impossibleOrDifficultKills: boolean;
    }
}

interface Spin {
    mission: {
        slug: string;
        publicIdPrefix: number;
        targets: {
            name: string;
            tileUrl: string;
        }[];
        name: string;
        backgroundTile: string;
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
    "Freeform Training (ICA Facility)": "hitman|ica-facility|freeform-training",
    "The Final Test (ICA Facility)": "hitman|ica-facility|the-final-test",
    "The Showstopper (Paris)": "hitman|paris|the-showstopper",
    "World of Tomorrow (Sapienza)": "hitman|sapienza|world-of-tomorrow",
    "The Icon (Sapienza)": "hitman|sapienza|the-icon",
    "Landslide (Sapienza)": "hitman|sapienza|landslide",
    "The Author (Sapienza)": "hitman|sapienza|the-author",
    "A Gilded Cage (Marrakesh)": "hitman|marrakesh|a-gilded-cage",
    "A House Built on Sand (Marrakesh)": "hitman|marrakesh|a-house-built-on-sand",
    "Club 27 (Bangkok)": "hitman|bangkok|club-27",
    "The Source (Bangkok)": "hitman|bangkok|the-source",
    "Freedom Fighters (Colorado)": "hitman|colorado|freedom-fighters",
    "Situs Inversus (Hokkaido)": "hitman|hokkaido|situs-inversus",
    "Hokkaido Snow Festival (Hokkaido)": "hitman|hokkaido|hokkaido-snow-festival",
    "Patient Zero (Hokkaido)": "hitman|hokkaido|patient-zero",
    "Nightcall (Hawke's Bay)": "hitman2|hawkes-bay|nightcall",
    "The Finish Line (Miami)": "hitman2|miami|finish-line",
    "A Silver Tongue (Miami)": "hitman2|miami|a-silver-tongue",
    "Three-Headed Serpent (Santa Fortuna)": "hitman2|santa-fortuna|three-headed-serpent",
    "Embrace of the Serpent (Santa Fortuna)": "hitman2|santa-fortuna|embrace-of-the-serpent",
    "Chasing a Ghost (Mumbai)": "hitman2|mumbai|chasing-a-ghost",
    "Illusions of Grandeur (Mumbai)": "hitman2|mumbai|illusions-of-grandeur",
    "Another Life (Whittleton Creek)": "hitman2|whittleton-creek|another-life",
    "A Bitter Pill (Whittleton Creek)": "hitman2|whittleton-creek|a-bitter-pill",
    "The Ark Society (Isle of Sgàil)": "hitman2|isle-of-sgail|ark-society",
    "Golden Handshake (New York)": "hitman2|new-york|golden-handshake",
    "The Last Resort (Haven Island)": "hitman2|haven-island|the-last-resort",
    "On Top Of The World (Dubai)": "hitman3|dubai|on-top-of-the-world",
    "Death In The Family (Dartmoor)": "hitman3|dartmoor|death-in-the-family",
    "Apex Predator (Berlin)": "hitman3|berlin|apex-predator",
    "End Of An Era (Chongqing)": "hitman3|chongqing|end-of-an-era",
    "The Farewell (Mendoza)": "hitman3|mendoza|the-farewell",
    "Untouchable (Carpathian Mountains)": "hitman3|carpathian-mountains|untouchable",
    "Shadows in the Water (Ambrose Island)": "hitman3|ambrose-island|shadows-in-the-water"
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
            },
            {
                id: "team1Players",
                type: "list",
                caption: "Team 1 - Players",
                options: {
                    id: "team1_player_select",
                    type: "select",
                    caption: "Player",
                    options: ["Player 1", "Player 2", "Player 3"]
                }
            },
            {
                id: "team2Players",
                type: "list",
                caption: "Team 2 - Players",
                options: {
                    id: "team2_player_select",
                    type: "select",
                    caption: "Player",
                    options: ["Player 1", "Player 2", "Player 3"]
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
                    specificDisguises: true,
                    specificMelee: true,
                    specificAccidents: true,
                    specificFirearms: true,
                    uniqueTargetKills: false,
                    genericKills: false,
                    impossibleOrDifficultKills: false
                }
            }
            spinGenOptions.push(options);
            spins.push(await this.generateSpin(options))
        }

        return {
            timelimit: (options['timelimit'] as number) * 60 * 1000,
            doneStatus: players.map(() => { return 0 }),
            lastDone: players.map(() => { return -1 }),
            currentSpin: players.map(() => { return 0 }),
            rta: players.map(() => { return (options['maps'] as string[]).map(() => { return 0 }) }),
            currentSpinStart: players.map(() => { return -1 }),
            activePlayers: [options['team1Players'], options['team2Players']],
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

    getPlayerDetails(player: number, currentState: GameModeDetails, match: IronmanMatch): GameModeDetails {
        let countdown = 0;

        if ((currentState['currentSpin'] as number[])[player]+1 === (currentState['maps'] as string[]).length) {
            countdown = -1;
        } else if ((currentState['currentSpinStart'] as number[])[player] === -1) {
            countdown = (match.rounds[match.rounds.length - 1].arrivingTimestamp + (currentState['timelimit'] as number)) - Date.now();
        } else {
            countdown = ((currentState['currentSpinStart'] as number[])[player] + (currentState['timelimit'] as number)) - Date.now();
        }

        if (countdown <= 0 && (currentState['doneStatus'] as number[])[player] === 0 && (currentState['currentSpin'] as number[])[player]+1 !== (currentState['maps'] as string[]).length) {
            (currentState['rta'] as number[][])[player][(currentState['currentSpin'] as number[])[player]] = FORFEIT_TIME;
            (currentState['currentSpin'] as number[])[player] += 1;
            (currentState['currentSpinStart'] as number[])[player] = Date.now();

            match.rounds[match.rounds.length - 1].additionalDetails = currentState;
            setMatch(match.id, match);
        }

        return {
            doneStatus: (currentState['doneStatus'] as number[])[player],
            lastDone: (currentState['lastDone'] as number[])[player],
            map: (currentState['maps'] as string[])[(currentState['currentSpin'] as number[])[player]],
            currentMapIndex: (currentState['currentSpin'] as number[])[player],
            totalMaps: (currentState['maps'] as string[]).length,
            countdown,
            timelimit: currentState['timelimit']
        };
    }

    async generateSpin(options: SpinGeneratorOptions): Promise<Spin> {
        try {
            const spin = await axios.post('https://rouletteapi.hitmaps.com/api/spins', options, { validateStatus: () => { return true } });
            const result = spin.data;

            const splittedSlug = options.missionPool[0].split("|");
            const missionInfo = await axios.get(`https://www.hitmaps.com/api/v1/games/${splittedSlug[0]}/locations/${splittedSlug[1]}/missions/${splittedSlug[2]}`);

            return Object.assign(result, { mission: { name: missionInfo.data[0].name, backgroundTile: missionInfo.data[0].backgroundUrl } });

            // return result;
        } catch(e) {
            return {
                mission: {
                    slug: "error",
                    publicIdPrefix: -1,
                    targets: [],
                    name: "Error in spin generation.",
                    backgroundTile: "",
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
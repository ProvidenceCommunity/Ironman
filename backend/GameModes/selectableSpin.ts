import { GameMode, GameModeDetails, GeneratorOption, GeneratorOptions, IronmanMatch } from "../model";
import axios from 'axios';

interface AdminEventPayload {
    spin: any;
    playerIndex: number;
}

interface RawItem {
    name: string;
    tileUrl: string;
    variants: { name: string, largeWeapon: boolean }[];
}

interface MapInfo {
    game: string;
    location: string;
    mission: string;
    amountTargets: number;
    target: string;
}

interface KillMethod {
    name: string;
    tileUrl: string;
    variants: string[];
}

interface TargetCondition {
    killMethod: {
        name: string;
        variant: string;
        tileUrl: string;
        selectedBy: number;
    }
    disguise: {
        name: string;
        tileUrl: string;
        selectedBy: number;
    }
}

interface Spin {
    mission: {
        name: string;
        backgroundTile: string;
    },
    targetConditions: TargetCondition[]
}

const missionIdToSlug: {[key: string]: MapInfo} = {
    "Freeform Training (ICA Facility)": { game: "hitman", location: "ica-facility", mission: "freeform-training", amountTargets: 1, target: "Kalvin Ritter" },
    "The Final Test (ICA Facility)": { game: "hitman", location: "ica-facility", mission: "the-final-test", amountTargets: 1, target: "Kalvin Ritter" },
    "The Showstopper (Paris)": { game: "hitman", location: "paris", mission: "the-showstopper", amountTargets: 2, target: "Viktor Novikov" },
    "World of Tomorrow (Sapienza)": { game: "hitman", location: "sapienza", mission: "world-of-tomorrow", amountTargets: 2, target: "Silvio Caruso" },
    
    "Freedom Fighters (Colorado)": { game: "hitman", location: "colorado", mission: "freedom-fighters", amountTargets: 4, target: "Ezra Berg" },

    "Apex Predator (Berlin)": { game: "hitman3", location: "berlin", mission: "apex-predator", amountTargets: 5, target: "ICA Agent %231" },
}
const tmp = {
    "The Icon (Sapienza)": "hitman|sapienza|the-icon",
    "Landslide (Sapienza)": "hitman|sapienza|landslide",
    "The Author (Sapienza)": "hitman|sapienza|the-author",
    "A Gilded Cage (Marrakesh)": "hitman|marrakesh|a-gilded-cage",
    "A House Built on Sand (Marrakesh)": "hitman|marrakesh|a-house-built-on-sand",
    "Club 27 (Bangkok)": "hitman|bangkok|club-27",
    "The Source (Bangkok)": "hitman|bangkok|the-source",
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
    "End Of An Era (Chongqing)": "hitman3|chongqing|end-of-an-era",
    "The Farewell (Mendoza)": "hitman3|mendoza|the-farewell",
    "Untouchable (Carpathian Mountains)": "hitman3|carpathian-mountains|untouchable",
    "Shadows in the Water (Ambrose Island)": "hitman3|ambrose-island|shadows-in-the-water"
}

export class SelectableSpinGameMode implements GameMode {
    getGeneratorOptions(): GeneratorOption[] {
        return [
            {
                id: "mission",
                caption: "Mission",
                type: "select",
                options: Object.keys(missionIdToSlug)
            }
        ]
    }

    async generate(options: GeneratorOptions, players: string[]): Promise<GameModeDetails> {
        const selectedMap = missionIdToSlug[options['mission'] as string];

        const conditions = [] as TargetCondition[];
        for (let i = 0; i < selectedMap.amountTargets; i++) {
            conditions.push({
                disguise: {
                    name: "",
                    tileUrl: "",
                    selectedBy: 0
                },
                killMethod: {
                    name: "",
                    variant: "",
                    tileUrl: "",
                    selectedBy: 0
                }
            });
        }

        const missionInfo = await axios.get(`https://www.hitmaps.com/api/v1/games/${selectedMap.game}/locations/${selectedMap.location}/missions/${selectedMap.mission}`);
        const disguises = await axios.get(`https://www.hitmaps.com/api/v2/games/${selectedMap.game}/locations/${selectedMap.location}/missions/${selectedMap.mission}/disguises`);
        const melees = await axios.get(`https://rouletteapi.hitmaps.com/api/spins/kill-conditions?missionGame=${selectedMap.game}&missionLocation=${selectedMap.location}&missionSlug=${selectedMap.mission}&specificDisguises=true&impossivleOrDifficultKills=true&specificMelee=true&targetName=${selectedMap.target}`);
        const otherKMs = await axios.get(`https://rouletteapi.hitmaps.com/api/spins/kill-conditions?missionGame=${selectedMap.game}&missionLocation=${selectedMap.location}&missionSlug=${selectedMap.mission}&specificDisguises=true&impossivleOrDifficultKills=true&specificFirearms=true&specificAccidents=true&targetName=${selectedMap.target}`);

        const methodOptions = [] as KillMethod[];

        (melees.data as RawItem[]).forEach(e => {
            methodOptions.push({
                name: e.name,
                variants: ["Fiber Wire", "Neck Snap"].includes(e.name) ? [] : ["Thrown", "Melee"],
                tileUrl: e.tileUrl
            });
        });

        (otherKMs.data as RawItem[]).forEach(e => {
            methodOptions.push({
                name: e.name,
                variants: e.variants.map(v => v.name),
                tileUrl: e.tileUrl
            });
        });

        methodOptions.push({
            name: "Pistol Elimination", 
            tileUrl: "https://media.hitmaps.com/img/hitman3/contractconditions/condition_killmethod_pistol.jpg",
            variants: ["Silenced", "Loud"]
        });
        methodOptions.push({
            name: "SMG Elimination",
            tileUrl: "https://media.hitmaps.com/img/hitman3/contractconditions/condition_killmethod_smg.jpg",
            variants: ["Silenced", "Loud"]
        });

        const spin = {
            mission: {
                name: missionInfo.data[0].name,
                backgroundTile: missionInfo.data[0].backgroundUrl
            },  
            targetConditions: conditions
        } as Spin;

        return {
            currentSpin: spin,
            disguiseOptions: disguises.data.disguises,
            methodOptions: methodOptions,
            doneStatus: players.map(() => { return 0 }),
            lastDone: players.map(() => { return -1 })
        };
    }

    handleUserEvent(event: string, player: number, payload: unknown, currentState: GameModeDetails): GameModeDetails {
        if (event === "done") {
            (currentState['doneStatus'] as number[])[player] = 1;
            (currentState['lastDone'] as number[])[player] = Date.now();
        }
        return currentState;
    }

    handleAdminEvent(event: string, payload: AdminEventPayload, currentState: GameModeDetails): GameModeDetails | Promise<GameModeDetails> {
        if (event === "acceptDone") {
            (currentState['doneStatus'] as number[])[payload.playerIndex] = 2;
        }
        if (event === "rejectDone") {
            (currentState['doneStatus'] as number[])[payload.playerIndex] = 0;
            (currentState['lastDone'] as number[])[payload.playerIndex] = -1;
        }
        if (event === "updateSpin") {
            currentState.currentSpin = payload.spin;
        }
        return currentState;
    }

    getPlayerDetails(player: number, currentState: GameModeDetails): GameModeDetails {
        return {
            currentSpin: currentState['currentSpin'],
            doneStatus: (currentState['doneStatus'] as number[])[player],
            lastDone: (currentState['lastDone'] as number[])[player],
        };
    }
    
}
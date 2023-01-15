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
    "The Icon (Sapienza)": { game: "hitman", location: "sapienza", mission: "the-icon", amountTargets: 1, target: "Dino Bosco" },
    "Landslide (Sapienza)": { game: "hitman", location: "sapienza", mission: "landslide", amountTargets: 1, target: "Marco Abiatti" },
    "The Author (Sapienza)": { game: "hitman", location: "sapienza", mission: "the-author", amountTargets: 2, target: "Craig Black" },
    "A Gilded Cage (Marrakesh)": { game: "hitman", location: "marrakesh", mission: "a-gilded-cage", amountTargets: 2, target: "Reza Zaydan" },
    "A House Built on Sand (Marrakesh)": { game: "hitman", location: "marrakesh", mission: "a-house-built-on-sand", amountTargets: 2, target: "Kong Tuo-Kwang" },
    "Club 27 (Bangkok)": { game: "hitman", location: "bangkok", mission: "club-27", amountTargets: 2, target: "Jordan Cross" },
    "The Source (Bangkok)": { game: "hitman", location: "bangkok", mission: "the-source", amountTargets: 2, target: "Oybek Nabazov" },
    "Freedom Fighters (Colorado)": { game: "hitman", location: "colorado", mission: "freedom-fighters", amountTargets: 4, target: "Ezra Berg" },
    "Situs Inversus (Hokkaido)": { game: "hitman", location: "hokkaido", mission: "situs-inversus", amountTargets: 1, target: "Yuki Yamazaki" },
    "Hokkaido Snow Festival (Hokkaido)": { game: "hitman", location: "hokkaido", mission: "hokkaido-snow-festival", amountTargets: 1, target: "Dmitri Fedorov" },
    "Patient Zero (Hokkaido)": { game: "hitman", location: "hokkaido", mission: "patient-zero", amountTargets: 2, target: "Owen Cage" },
    "Nightcall (Hawke's Bay)": { game: "hitman2", location: "hawkes-bay", mission: "nightcall", amountTargets: 1, target: "Alma Reynard" },
    "The Finish Line (Miami)": { game: "hitman2", location: "miami", mission: "finish-line", amountTargets: 2, target: "Sierra Knox" },
    "A Silver Tongue (Miami)": { game: "hitman2", location: "miami", mission: "a-silver-tongue", amountTargets: 1, target: "Ajit Krish" },
    "Three-Headed Serpent (Santa Fortuna)": { game: "hitman2", location: "santa-fortuna", mission: "three-headed-serpent", amountTargets: 3, target: "Rico Delgado" },
    "Embrace of the Serpent (Santa Fortuna)": { game: "hitman2", location: "santa-fortuna", mission: "embrace-of-the-serpent", amountTargets: 1, target: "Blair Reddington" },
    "Chasing a Ghost (Mumbai)": { game: "hitman2", location: "mumbai", mission: "chasing-a-ghost", amountTargets: 3, target: "Dawood Rangan" },
    "Illusions of Grandeur (Mumbai)": { game: "hitman2", location: "mumbai", mission: "illusions-of-grandeur", amountTargets: 1, target: "Basil Carnaby" },
    "Another Life (Whittleton Creek)": { game: "hitman2", location: "whittleton-creek", mission: "another-life", amountTargets: 2, target: "Janus" },
    "A Bitter Pill (Whittleton Creek)": { game: "hitman2", location: "whittleton-creek", mission: "a-bitter-pill", amountTargets: 1, target: "Galen Vholes" },
    "The Ark Society (Isle of Sgàil)": { game: "hitman2", location: "isle-of-sgail", mission: "ark-society", amountTargets: 2, target: "Zoe Washington" },
    "Golden Handshake (New York)": { game: "hitman2", location: "new-york", mission: "golden-handshake", amountTargets: 1, target: "Athena Savalas" },
    "The Last Resort (Haven Island)": { game: "hitman2", location: "haven-island", mission: "the-last-resort", amountTargets: 3, target: "Steven Bradley" },
    "On Top Of The World (Dubai)": { game: "hitman3", location: "dubai", mission: "on-top-of-the-world", amountTargets: 2, target: "Carl Ingram" },
    "Death In The Family (Dartmoor)": { game: "hitman3", location: "dartmoor", mission: "death-in-the-family", amountTargets: 1, target: "Alexa Carlisle" },
    "Apex Predator (Berlin)": { game: "hitman3", location: "berlin", mission: "apex-predator", amountTargets: 5, target: "ICA Agent %231" },
    "End Of An Era (Chongqing)": { game: "hitman3", location: "chongqing", mission: "end-of-an-era", amountTargets: 2, target: "Imogen Royce" },
    "The Farewell (Mendoza)": { game: "hitman3", location: "mendoza", mission: "the-farewell", amountTargets: 2, target: "Tamara Vidal"},
    "Untouchable (Carpathian Mountains)": { game: "hitman3", location: "carpathian-mountains", mission: "untouchable", amountTargets: 1, target: "Arthur Edwards" },
    "Shadows in the Water (Ambrose Island)": { game: "hitman3", location: "ambrose-island", mission: "shadows-in-the-water", amountTargets: 2, target: "Noel Crest" }
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

        const fixedDisguises = disguises.data.disguises.map((e: any) => {
            if (e.suit) {
                e.name = "Suit";
            }
            return e;
        });

        return {
            currentSpin: spin,
            disguiseOptions: fixedDisguises,
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
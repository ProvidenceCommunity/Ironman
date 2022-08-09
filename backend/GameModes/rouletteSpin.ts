import {GameMode, GameModeDetails, GeneratorOption, GeneratorOptions} from "../model";
import axios from 'axios';

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
    playerIndex: number;
}

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

export class RouletteSpinGameMode implements GameMode {
    getGeneratorOptions(): GeneratorOption[] {
        return [
            {
                id: "mission",
                caption: "Mission",
                type: "select",
                options: Object.keys(missionIdToSlug)
            },
            {
                id: "noTargets",
                caption: "No Targets (Freestyle Mode)",
                type: "boolean"
            },
            {
                id: "noDisguise",
                caption: "No Disguise",
                type: "boolean"
            },
            {
                id: "noMelee",
                caption: "No Melee",
                type: "boolean"
            },
            {
                id: "noFirearms",
                caption: "No Firearms",
                type: "boolean"
            },
            {
                id: "noAccidents",
                caption: "No Accidents",
                type: "boolean"
            },
            {
                id: "uniqueTargetKills",
                caption: "Allow unique target kills",
                type: "boolean"
            },
            {
                id: "genericKills",
                caption: "Allow generic kills",
                type: "boolean"
            }
        ];
    }

    async generate(options: GeneratorOptions, players: string[]): Promise<GameModeDetails> {
        const spinGenOptions: SpinGeneratorOptions = {
            missionPool: [missionIdToSlug[options['mission'] as string]],
            criteriaFilters: {
                specificDisguises: !options['noDisguise'] as boolean,
                specificMelee: !options['noMelee'] as boolean,
                specificFirearms: !options['noFirearms'] as boolean,
                specificAccidents: !options['noAccidents'] as boolean,
                uniqueTargetKills: options['uniqueTargetKills'] as boolean,
                genericKills: options['genericKills'] as boolean,
                impossibleOrDifficultKills: false
            }
        }

        const spin = await this.generateSpin(spinGenOptions, options['noTargets'] as boolean);

        return {
            currentSpin: spin,
            generatorOptions: spinGenOptions,
            noTargets: options['noTargets'],
            doneStatus: players.map(() => { return 0 }),
            lastDone: players.map(() => { return -1 })
        };
    }

    async handleAdminEvent(event: string, payload: AdminEventPayload, currentState: GameModeDetails): Promise<GameModeDetails> {
        if (event === "acceptDone") {
            (currentState['doneStatus'] as number[])[payload.playerIndex] = 2;
        }
        if (event === "rejectDone") {
            (currentState['doneStatus'] as number[])[payload.playerIndex] = 0;
            (currentState['lastDone'] as number[])[payload.playerIndex] = -1;
        }
        if (event === "respin") {
            currentState['currentSpin'] = await this.generateSpin(currentState['generatorOptions'] as SpinGeneratorOptions, currentState['noTargets'] as boolean);
        }
        return currentState;
    }

    handleUserEvent(event: string, player: number, payload: unknown, currentState: GameModeDetails): GameModeDetails {
        if (event === "done") {
            (currentState['doneStatus'] as number[])[player] = 1;
            (currentState['lastDone'] as number[])[player] = Date.now();
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

    async generateSpin(options: SpinGeneratorOptions, freestyleMode: boolean): Promise<Spin> {
        try {
            const spin = await axios.post('https://rouletteapi.hitmaps.com/api/spins', options, { validateStatus: () => { return true } });
            const result = spin.data;
            if (freestyleMode) {
                (result.targetConditions as {target: {name: string;tileUrl: string}}[]).forEach((e, index) => {
                    e.target.name = "Target #" + (index+1);
                    e.target.tileUrl = "https://media.hitmaps.com/img/hitmaps-roulette/berlin-target.png";
                });
            }
            // if (!options.criteriaFilters.specificDisguises) {
            //     (result.targetConditions as {disguise: {name: string;tileUrl: string}}[]).forEach((e, index) => {
            //         e.disguise.name = "Any disguise";
            //         e.disguise.tileUrl = "";
            //     });
            // }

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

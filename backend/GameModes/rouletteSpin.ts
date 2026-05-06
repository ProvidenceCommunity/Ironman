import { GameModeDetails } from "@shared-types/RoundInfo";
import {GameMode, GeneratorOption, GeneratorOptions} from "../model";
import axios from 'axios';

export interface SpinGeneratorOptions {
    missionPool: string[];
    criteriaFilters: {
        specificDisguises: boolean;
        specificMelee: boolean;
        specificFirearms: boolean;
        specificAccidents: boolean;
        uniqueTargetKills: boolean;
        genericKills: boolean;
        impossibleOrDifficultKills: boolean;
        additionalObjectives: boolean;
        additionalObjectiveDisguises: boolean;
        potentialComplications: {complicationType: string, oddsOfReceivingComplication: number}[];
    }
}

export interface Spin {
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
        },
        complications: {
            name: string;
            tileUrl: string;
        }[]
    }[]
}

interface AdminEventPayload {
    playerIndex: number;
    spin: Spin;
}

export interface RawOptions {
    mission: string;
    noDisguise: boolean;
    noMelee: boolean;
    noFirearms: boolean;
    noAccidents: boolean;
    noUniqueTargetKills: boolean;
    genericKills: boolean;
    hardOrImpossible: boolean;
    secondaries: string;
    noNtko: boolean;
}

export const missionIdToSlug: {[key: string]: string} = {
    "Freeform Training (ICA Facility)": "hitman|ica-facility|freeform-training",
    "The Final Test (ICA Facility)": "hitman|ica-facility|the-final-test",
    "The Showstopper (Paris)": "hitman|paris|the-showstopper",
    "Holiday Hoarders (Paris)": "hitman|paris|holiday-hoarders",
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
    "Shadows in the Water (Ambrose Island)": "hitman2|ambrose-island|shadows-in-the-water",
    "The Ark Society (Isle of Sgàil)": "hitman2|isle-of-sgail|ark-society",
    "Golden Handshake (New York)": "hitman2|new-york|golden-handshake",
    "The Last Resort (Haven Island)": "hitman2|haven-island|the-last-resort",
    "On Top Of The World (Dubai)": "hitman3|dubai|on-top-of-the-world",
    "Death In The Family (Dartmoor)": "hitman3|dartmoor|death-in-the-family",
    "Apex Predator (Berlin)": "hitman3|berlin|apex-predator",
    "End Of An Era (Chongqing)": "hitman3|chongqing|end-of-an-era",
    "The Farewell (Mendoza)": "hitman3|mendoza|the-farewell",
    "Untouchable (Carpathian Mountains)": "hitman3|carpathian-mountains|untouchable"
}

export interface RouletteGameModeDetails extends GameModeDetails {
    currentSpin: Spin;
    generatorOptions: SpinGeneratorOptions;
    noTargets: boolean;
    doneStatus: number[];
    lastDone: number[];
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
                id: "noUniqueTargetKills",
                caption: "No unique target kills",
                type: "boolean"
            },
            {
                id: "genericKills",
                caption: "Allow generic kills",
                type: "boolean"
            },
            {
                id: "noNtko",
                caption: "Disable No Target Pacification",
                type: "boolean"
            },
            {
                id: "secondaries",
                caption: "Enable secondary objectives",
                type: "select",
                options: ["No", "Method only", "Method and disguise"]
            },
            {
                id: "hardOrImpossible",
                caption: "Allow hard or impossible conditions",
                type: "boolean"
            }
        ];
    }

    async generate(options: GeneratorOptions, players: string[]): Promise<RouletteGameModeDetails> {
        const spinGenOptions = RouletteSpinGameMode.buildGeneratorOptions(options as unknown as RawOptions);

        const spin = await RouletteSpinGameMode.generateSpin(spinGenOptions, options['noTargets'] as boolean);

        return {
            currentSpin: spin,
            generatorOptions: spinGenOptions,
            noTargets: options['noTargets'] as boolean,
            doneStatus: players.map(() => { return 0 }),
            lastDone: players.map(() => { return -1 })
        };
    }

    async handleAdminEvent(event: string, payload: AdminEventPayload, currentState: RouletteGameModeDetails): Promise<RouletteGameModeDetails> {
        if (event === "acceptDone") {
            currentState.doneStatus[payload.playerIndex] = 2;
        }
        if (event === "rejectDone") {
            currentState.doneStatus[payload.playerIndex] = 0;
            currentState.lastDone[payload.playerIndex] = -1;
        }
        if (event === "respin") {
            currentState.currentSpin = await RouletteSpinGameMode.generateSpin(currentState.generatorOptions, currentState.noTargets);
        }
        if (event === "updateSpin") {
            currentState.currentSpin = payload.spin;
        }
        return currentState;
    }

    handleUserEvent(event: string, player: number, payload: unknown, currentState: RouletteGameModeDetails): RouletteGameModeDetails {
        if (event === "done") {
            currentState.doneStatus[player] = 1;
            currentState.lastDone[player] = Date.now();
        }
        return currentState;
    }

    getPlayerDetails(player: number, currentState: RouletteGameModeDetails): GameModeDetails {
        return {
            currentSpin: currentState.currentSpin,
            doneStatus: currentState.doneStatus[player],
            lastDone: currentState.lastDone[player],
        };
    }

    static buildGeneratorOptions(options: RawOptions): SpinGeneratorOptions {
        const spinOptions = {
            missionPool: [missionIdToSlug[options.mission]],
            criteriaFilters: {
                specificDisguises: !options.noDisguise,
                specificMelee: !options.noMelee,
                specificFirearms: !options.noFirearms,
                specificAccidents: !options.noAccidents,
                uniqueTargetKills: !options.noUniqueTargetKills,
                genericKills: options.genericKills,
                impossibleOrDifficultKills: options.hardOrImpossible,
                additionalObjectives: options.secondaries === "Method only" || options.secondaries === "Method and disguise",
                additionalObjectiveDisguises: options.secondaries === "Method and disguise",
                potentialComplications: []
            }
        } as SpinGeneratorOptions;

        if (!options.noNtko) {
            spinOptions.criteriaFilters.potentialComplications.push({
                complicationType: "No Target Pacification",
                oddsOfReceivingComplication: 0.25
            });
        }

        return spinOptions;
    }

    static async generateSpin(options: SpinGeneratorOptions, freestyleMode: boolean): Promise<Spin> {
        try {
            const spin = await axios.post('https://rouletteapi.hitmaps.com/api/spins', options, { validateStatus: () => { return true } });
            const result = spin.data;
            if (freestyleMode) {
                (result.targetConditions as {target: {name: string;tileUrl: string}}[]).forEach((e, index) => {
                    e.target.name = "Target #" + (index+1);
                    e.target.tileUrl = "https://media.hitmaps.com/img/hitmaps-roulette/berlin-target.png";
                });
            }

            const splittedSlug = options.missionPool[0].split("|");
            const missionInfo = await axios.get(`https://api.hitmaps.com/api/games/${splittedSlug[0]}/locations/${splittedSlug[1]}/missions/${splittedSlug[2]}`);

            return Object.assign(result, { mission: { name: missionInfo.data.name, backgroundTile: missionInfo.data.backgroundUrl } });
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
                    },
                    complications: []
                }]
            }
        }
    }

}

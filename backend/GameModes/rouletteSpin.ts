import {GameMode, GameModeDetails, GeneratorOption, GeneratorOptions} from "../model";
import axios from 'axios';

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
    playerIndex: number;
}

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
                specificDisguise: !options['noDisguise'] as boolean,
                specificMelee: !options['noMelee'] as boolean,
                specificFirearms: !options['noFirearms'] as boolean,
                specificAccidents: !options['noAccidents'] as boolean,
                uniqueTargetKills: options['uniqueTargetKills'] as boolean,
                genericKills: options['genericKills'] as boolean,
                rrBannedKills: false
            }
        }

        const spin = await this.generateSpin(spinGenOptions);

        return {
            currentSpin: spin,
            generatorOptions: spinGenOptions,
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
            currentState['currentSpin'] = await this.generateSpin(currentState['generatorOptions'] as SpinGeneratorOptions);
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

    async generateSpin(options: SpinGeneratorOptions): Promise<Spin> {
        const spin = await axios.post('https://roulette.hitmaps.com/api/spins', options, { validateStatus: () => { return true } });
        return spin.data;
    }

}

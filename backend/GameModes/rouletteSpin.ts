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
    "The Showstopper (Paris)": "hitman|paris|the-showstopper|professional",
    "World of Tomorrow (Sapienza)": "hitman|sapienza|world-of-tomorrow|professional"
}

export class RouletteSpinGameMode implements GameMode {
    getGeneratorOptions(): GeneratorOption[] {
        return [
            {
                id: "mission",
                caption: "Mission",
                type: "select",
                options: ["The Showstopper (Paris)", "World of Tomorrow (Sapienza)"]
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
            title: currentState['title'],
            additionalInfo: currentState['additionalInfo'],
            doneStatus: (currentState['doneStatus'] as number[])[player],
            lastDone: (currentState['lastDone'] as number[])[player],
        };
    }

    async generateSpin(options: SpinGeneratorOptions): Promise<Spin> {
        const spin = await axios.post('https://roulette.hitmaps.com/api/spins', options, { validateStatus: () => { return true } });
        return spin.data;
    }

}

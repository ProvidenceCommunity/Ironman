import {GameMode, GameModeDetails, GeneratorOption, GeneratorOptions} from "../model";
import {RouletteSpinGameMode, SpinGeneratorOptions, Spin, missionIdToSlug} from "./rouletteSpin";

interface AdminEventPayload {
    playerIndex: number;
    map: number;
}

export class TwoSpinsGameMode implements GameMode {
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
            },
            {
                id: "noNtko",
                caption: "Disable No Target Pacification",
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
                impossibleOrDifficultKills: false,
                additionalObjectiveDisguises: false,
                additionalObjectives: false,
                potentialComplications: []
            }
        }

        if (!options['noNtko']) {
            spinGenOptions.criteriaFilters.potentialComplications.push({
                complicationType: "No Target Pacification",
                oddsOfReceivingComplication: 0.2
            });
        }

        const spin = await RouletteSpinGameMode.generateSpin(spinGenOptions, options['noTargets'] as boolean);
        const spin2 = await RouletteSpinGameMode.generateSpin(spinGenOptions, options['noTargets'] as boolean);

        return {
            currentSpins: [spin, spin2],
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
            (currentState['currentSpins'] as Spin[])[payload.map] = await RouletteSpinGameMode.generateSpin(currentState['generatorOptions'] as SpinGeneratorOptions, currentState['noTargets'] as boolean);
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
            currentSpins: currentState['currentSpins'],
            doneStatus: (currentState['doneStatus'] as number[])[player],
            lastDone: (currentState['lastDone'] as number[])[player],
        };
    }

}

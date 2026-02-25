import { GameMode, GeneratorOption, GeneratorOptions } from "backend/model";
import { missionIdToSlug, RawOptions, RouletteSpinGameMode, Spin, SpinGeneratorOptions } from "./rouletteSpin";
import { GameModeDetails } from "@shared-types/RoundInfo";

export interface NSpinsGameModeDetails extends GameModeDetails {
    currentSpins: Spin[];
    allGeneratorOptions: SpinGeneratorOptions[];
    noTargets: boolean;
    doneStatus: number[];
    lastDone: number[];
}

interface AdminEventPayload {
    playerIndex: number;
    mapIndex: number;
    spin: Spin;
}

export class NSpinsGameMode implements GameMode {
    getGeneratorOptions(): GeneratorOption[] {
        return [
            {
                id: "missions",
                caption: "Mission",
                type: "list",
                options: {
                    id: "mission",
                    caption: "Mission",
                    type: "select",
                    options: Object.keys(missionIdToSlug)
                }
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

    async generate(options: GeneratorOptions, players: string[]): Promise<NSpinsGameModeDetails> {
        const spinGenOptions = (options['missions'] as string[])
            .map((map) => {
                return RouletteSpinGameMode.buildGeneratorOptions({
                    mission: map,
                    ...options
                } as RawOptions);
            });
        
        const spins: Spin[] = [];
        for (const option of spinGenOptions) {
            spins.push(
                await RouletteSpinGameMode.generateSpin(option, options['noTargets'] as boolean)
            )
        }

        return {
            currentSpins: spins,
            allGeneratorOptions: spinGenOptions,
            noTargets: options['noTargets'] as boolean,
            doneStatus: players.map(() => 0),
            lastDone: players.map(() => -1),
        } as NSpinsGameModeDetails;
    }

    async handleAdminEvent(event: string, payload: AdminEventPayload, currentState: NSpinsGameModeDetails): Promise<NSpinsGameModeDetails> {
            if (event === "acceptDone") {
                currentState.doneStatus[payload.playerIndex] = 2;
            }
            if (event === "rejectDone") {
                currentState.doneStatus[payload.playerIndex] = 0;
                currentState.lastDone[payload.playerIndex] = -1;
            }
            if (event === "respin") {
                currentState.currentSpins[payload.mapIndex] = await RouletteSpinGameMode.generateSpin(currentState.allGeneratorOptions[payload.mapIndex], currentState.noTargets);
            }
            if (event === "updateSpin") {
                currentState.currentSpins[payload.mapIndex] = payload.spin;
            }
            return currentState;
        }
    
        handleUserEvent(event: string, player: number, payload: unknown, currentState: NSpinsGameModeDetails): NSpinsGameModeDetails {
            if (event === "done") {
                currentState.doneStatus[player] = 1;
                currentState.lastDone[player] = Date.now();
            }
            return currentState;
        }
    
        getPlayerDetails(player: number, currentState: NSpinsGameModeDetails): GameModeDetails {
            return {
                currentSpins: currentState.currentSpins,
                doneStatus: currentState.doneStatus[player],
                lastDone: currentState.lastDone[player],
            };
        }
}
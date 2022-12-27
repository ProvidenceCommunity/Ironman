import { GameMode, GameModeDetails, GeneratorOption, GeneratorOptions } from "../model/GameMode";

type DoneButtonStatus = {
    additionalInfo: string;
    doneStatus: number[];
    lastDone: number[];
    finishingOrder: number[];
    displayFinish: boolean;
    nextFinish: number;
}

interface AdminEventPayload {
    playerIndex: number;
}

export class DoneButtonGameMode implements GameMode {
    getName(): string {
        return "Simple Done Button";
    }

    getGeneratorOptions(): GeneratorOption[] {
        return [
            {
                id: "additional_info",
                type: "string",
                caption: "Additional info for the players"
            },
            {
                id: "display_done_order",
                type: "boolean",
                caption: "Display to players in which position they finished after admin verification"
            }
        ];
    }

    generate(options: GeneratorOptions, players: string[]): GameModeDetails {
        return {
            additionalInfo: options['additional_info'],
            doneStatus: players.map(() => { return 0 }),
            lastDone: players.map(() => { return -1 }),
            finishingOrder: players.map(() => { return -1 }),
            displayFinish: options['display_done_order'],
            nextFinish: 1,
        };
    }

    handleUserEvent(event: string, player: number, payload: unknown, currentState: DoneButtonStatus): GameModeDetails {
        if (event === "done") {
            currentState.doneStatus[player] = 1;
            currentState.lastDone[player] = Date.now();
        }
        return currentState;
    }
    
    handleAdminEvent(event: string, payload: AdminEventPayload, currentState: DoneButtonStatus): GameModeDetails {
        if (event == "acceptDone") {
            currentState.doneStatus[payload.playerIndex] = 2;
            currentState.finishingOrder[payload.playerIndex] = currentState.nextFinish;
            currentState.nextFinish += 1;
        }
        if (event == "rejectDone") {
            currentState.doneStatus[payload.playerIndex] = 0;
            currentState.lastDone[payload.playerIndex] = -1;
        }
        return currentState;
    }

    getPlayerDetails(player: number, currentState: DoneButtonStatus): GameModeDetails {
        return {
            additionalInfo: currentState.additionalInfo,
            doneStatus: currentState.doneStatus,
            lastDone: currentState.lastDone[player],
            donePosition: currentState.displayFinish ? currentState.finishingOrder[player] : -1
        }
    }
}
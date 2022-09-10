import {GameMode, GameModeDetails, GeneratorOption, GeneratorOptions} from "../model";

interface AdminEventPayload {
    playerIndex: number;
}

export class DoneButtonGameMode implements GameMode {
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

    handleAdminEvent(event: string, payload: AdminEventPayload, currentState: GameModeDetails): GameModeDetails {
        if (event === "acceptDone") {
            (currentState['doneStatus'] as number[])[payload.playerIndex] = 2;
            (currentState['finishingOrder'] as number[])[payload.playerIndex] = currentState['nextFinish'] as number;
            (currentState['nextFinish'] as number) += 1
        }
        if (event === "rejectDone") {
            (currentState['doneStatus'] as number[])[payload.playerIndex] = 0;
            (currentState['lastDone'] as number[])[payload.playerIndex] = -1;
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
            additionalInfo: currentState['additionalInfo'],
            doneStatus: (currentState['doneStatus'] as number[])[player],
            lastDone: (currentState['lastDone'] as number[])[player],
            donePosition: currentState['displayFinish'] ? (currentState['finishingOrder'] as number[])[player] : -1,
        };
    }

}

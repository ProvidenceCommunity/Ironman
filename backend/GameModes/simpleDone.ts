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
            }
        ];
    }

    generate(options: GeneratorOptions, players: string[]): GameModeDetails {
        return {
            additionalInfo: options['additional_info'],
            doneStatus: players.map(() => { return 0 }),
            lastDone: players.map(() => { return -1 })
        };
    }

    handleAdminEvent(event: string, payload: AdminEventPayload, currentState: GameModeDetails): GameModeDetails {
        if (event === "acceptDone") {
            (currentState['doneStatus'] as number[])[payload.playerIndex] = 2;
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
        };
    }

}

import {GameMode, GameModeDetails, GeneratorOption, GeneratorOptions} from "../model";

export class TimerGameMode implements GameMode {
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
            additionalInfo: options['additional_info']
        };
    }

    handleAdminEvent(event: string, payload: unknown, currentState: GameModeDetails): GameModeDetails {
        return currentState;
    }

    handleUserEvent(event: string, player: number, payload: unknown, currentState: GameModeDetails): GameModeDetails {
        return currentState;
    }

    getPlayerDetails(player: number, currentState: GameModeDetails): GameModeDetails {
        return {
            additionalInfo: currentState['additionalInfo']
        };
    }

}

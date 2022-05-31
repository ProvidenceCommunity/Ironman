import {GameMode, GameModeDetails, GeneratorOption, GeneratorOptions} from "../model";

interface TestEventPayload {
    value: number;
}

export class TestGameMode implements GameMode {

    getGeneratorOptions(): GeneratorOption[] {
        return [
            {
                id: "one",
                type: "string",
                caption: "Freeform text"
            },
            {
                id: "two",
                type: "number",
                caption: "Some number please"
            },
            {
                id: "three",
                type: "boolean",
                caption: "To check or not to check"
            },
            {
                id: "four",
                type: "select",
                caption: "Is this working?",
                options: ["yes", "no"]
            }
        ];
    }

    generate(options: GeneratorOptions, players: string[]): GameModeDetails {
        return {
            title: options['one'],
            number: options['two'],
            isWorking: options['four'],
            checked: options['three'],
            counter: 0
        };
    }

    handleUserEvent(event: string, user: number, payload: TestEventPayload, currentState: GameModeDetails): GameModeDetails {
        if (event === "updateCounter") {
            (currentState['counter'] as number) += payload.value;
        }
        return currentState;
    }

    handleAdminEvent(event: string, payload: unknown, currentState: GameModeDetails): GameModeDetails {
        if (event === "resetCounter") {
            currentState['counter'] = 0;
        }
        return currentState;
    }

    getPlayerDetails(player: number, currentState: GameModeDetails): GameModeDetails {
        return currentState;
    }
}

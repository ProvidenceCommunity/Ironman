import { TestGameMode } from "./GameModes/test";

export interface IronmanMatch {
    id: string;
    players: string[];
    scores: number[];
    finished?: boolean;
    rounds: IronmanRound[];
}

export interface IronmanRound {
    mode: string;
    additionalDetails: GameModeDetails;
    arrivingTimestamp: number;
    leavingTimestamp: number;
    playersDone: number[];
    scoreUpdates: number[];
}

export interface GameModeDetails {
    [key: string]: string | number | boolean;
}

export interface GeneratorOption {
    type: "string" | "number" | "select" | "boolean";
    id: string;
    caption: string;
    options?: string[] | number[];
}

export interface GeneratorOptions {
    [id: string]: string | number | boolean;
}

export interface GameMode {
    getGeneratorOptions(): GeneratorOption[];
    generate(options: GeneratorOptions): GameModeDetails;
    handleUserEvent(event: string, payload: unknown, currentState: GameModeDetails): GameModeDetails;
    handleAdminEvent(event: string, payload: unknown, currentState: GameModeDetails): GameModeDetails;
}

export const GameModes = {
    "test": new TestGameMode()
}

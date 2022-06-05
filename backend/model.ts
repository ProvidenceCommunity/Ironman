import { DoneButtonGameMode } from "./GameModes/simpleDone";
import { RouletteSpinGameMode } from "./GameModes/rouletteSpin";
import { BingoGameMode } from "./GameModes/bingo";

export interface IronmanMatch {
    id: string;
    players: string[];
    scoringType: IronmanScoringType;
    scores: number[];
    finished?: boolean;
    rounds: IronmanRound[];
}

export interface SimplifiedIronmanMatch {
    id: string;
    players: string[];
    finished?: boolean;
}

export enum IronmanScoringType {
    PLAYER,
    TEAMS
}

export interface IronmanRound {
    mode: string;
    additionalDetails: GameModeDetails;
    arrivingTimestamp: number;
    leavingTimestamp: number;
}

export interface GameModeDetails {
    [key: string]: unknown;
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
    generate(options: GeneratorOptions, players: string[]): Promise<GameModeDetails> | GameModeDetails;
    handleUserEvent(event: string, player: number, payload: unknown, currentState: GameModeDetails): GameModeDetails;
    handleAdminEvent(event: string, payload: unknown, currentState: GameModeDetails): Promise<GameModeDetails> | GameModeDetails;
    getPlayerDetails(player: number, currentState: GameModeDetails): GameModeDetails;
}

export const GameModes: { [key: string]: GameMode } = {
    "simpleDoneButton": new DoneButtonGameMode(),
    "rouletteSpin": new RouletteSpinGameMode(),
    "bingo": new BingoGameMode(),
}

declare module 'express-session' {
    interface SessionData {
        isAdmin: boolean;
        username: string;
        avatarURI: string;
    }
}

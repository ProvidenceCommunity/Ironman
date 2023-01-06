import { DoneButtonGameMode } from "./GameModes/simpleDone";
import { RouletteSpinGameMode } from "./GameModes/rouletteSpin";
import { BingoGameMode } from "./GameModes/bingo";
import {TimerGameMode} from "./GameModes/timer";
import { TwoSpinsGameMode } from "./GameModes/twoSpins";
import { SelectableSpinGameMode } from "./GameModes/selectableSpin";

export interface MatchField {
    type: "string" | "select" | "list";
    name: string;
    title: string;
    displayInOverview?: boolean;
    announceInDiscord?: boolean;
    displayInMatchesCommand?: boolean;
    options?: string[] | MatchField;
}

export interface IronmanMatch {
    id: string;
    players: string[];
    scores: number[];
    finished?: boolean;
    rounds: IronmanRound[];
    schedulingData: { [key: string]: string | string[] };
    timestamp: number;
}

export interface SimplifiedIronmanMatch {
    id: string;
    players: string[];
    finished?: boolean;
    schedulingData: { [key: string]: string | string[] };
    timestamp: number;
}

export interface IronmanRound {
    mode: string;
    title: string;
    additionalDetails: GameModeDetails;
    arrivingTimestamp: number;
    leavingTimestamp: number;
}

export interface GameModeDetails {
    [key: string]: unknown;
}

export interface GeneratorOption {
    type: "string" | "number" | "select" | "boolean" | "list";
    id: string;
    caption: string;
    options?: string[] | number[] | GeneratorOption;
}

export interface GeneratorOptions {
    [id: string]: string | number | boolean | string[] | number[] | boolean[];
}

export interface GameMode {
    getGeneratorOptions(): GeneratorOption[];
    generate(options: GeneratorOptions, players: string[]): Promise<GameModeDetails> | GameModeDetails;
    handleUserEvent(event: string, player: number, payload: unknown, currentState: GameModeDetails): GameModeDetails;
    handleAdminEvent(event: string, payload: unknown, currentState: GameModeDetails, roundStartingTimestamp: number): Promise<GameModeDetails> | GameModeDetails;
    getPlayerDetails(player: number, currentState: GameModeDetails, match: IronmanMatch): GameModeDetails;
}

export const GameModes: { [key: string]: GameMode } = {
    "simpleDoneButton": new DoneButtonGameMode(),
    "rouletteSpin": new RouletteSpinGameMode(),
    "bingo": new BingoGameMode(),
    "timer": new TimerGameMode(),
    "twoSpins": new TwoSpinsGameMode(),
    "selectableSpin": new SelectableSpinGameMode(),
}

declare module 'express-session' {
    interface SessionData {
        isAdmin: boolean;
        username: string;
        avatarURI: string;
    }
}

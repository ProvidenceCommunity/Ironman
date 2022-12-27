import { DoneButtonGameMode } from "../gameModes/DoneButton";
import { IronmanMatch } from "./Match";

export type GeneratorOptions = Record<string, string|number|boolean|string[]|number[]|boolean[]>;
export type GameModeDetails = Record<string, unknown>;

export interface GeneratorOption {
    type: "string" | "number" | "select" | "boolean" | "list";
    id: string;
    caption: string;
    options?: string[] | number[] | GeneratorOption;
}

export interface GameMode {
    getName(): string;
    getGeneratorOptions(): GeneratorOption[];
    generate(options: GeneratorOptions, players: string[]): Promise<GameModeDetails> | GameModeDetails;
    handleUserEvent(event: string, player: number, payload: unknown, currentState: GameModeDetails): GameModeDetails;
    handleAdminEvent(event: string, payload: unknown, currentState: GameModeDetails): GameModeDetails;
    getPlayerDetails(player: number, currentState: GameModeDetails, match: IronmanMatch): GameModeDetails;
}

export const GameModes: Record<string, GameMode> = {
    "simpleDoneButton": new DoneButtonGameMode()
}
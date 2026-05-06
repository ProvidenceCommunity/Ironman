import { GameModeDetails } from "./RoundInfo";

export interface MatchInfo {
    players: string[];
    scores: number[];
    index: number;
    roundLive: boolean;
    countdown?: number;
    round?: GameModeDetails;
    currentGameMode?: string;
    totalMatchTime?: number;
    roundTitle?: string; 
}
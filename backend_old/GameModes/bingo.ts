import {GameMode, GameModeDetails, GeneratorOption, GeneratorOptions} from "../model";

interface AdminEventPayload {
    playerIndex?: number;
    card?: string;
}

interface PlayerEventPayload {
    tile: number;
}

enum ClaimStatus {
    UNCLAIMED,
    CLAIMED,
    HALF_CLAIMED,
}

export class BingoGameMode implements GameMode {
    getGeneratorOptions(): GeneratorOption[] {
        return [
            {
                id: "mode",
                type: "select",
                caption: "Mode",
                options: ["Lockout", "Non-Lockout"]
            },
            {
                id: "card",
                type: "string",
                caption: "Bingo card"
            },
            {
                id: "halfClaim",
                type: "boolean",
                caption: "Enable half-claimed tiles"
            },
            {
                id: "hideClaims",
                type: "boolean",
                caption: "Hide claimed tiles (recommended for 3+ Players)"
            }
        ];
    }

    generate(options: GeneratorOptions, players: string[]): GameModeDetails {
        const claimedTiles = [] as ClaimStatus[][];

        for (let i = 0; i < 25; i++) {
            claimedTiles.push(players.map(() => { return ClaimStatus.UNCLAIMED }));
        }

        return {
            card: this.parseCard(options['card'] as string),
            mode: options['mode'],
            claimedTiles,
            doneStatus: players.map(() => { return 0 }),
            lastDone: players.map(() => { return -1 }),
            halfClaimEnabled: options['halfClaim'] as boolean,
            hideClaims: options['hideClaims'] as boolean
        };
    }

    handleAdminEvent(event: string, payload: AdminEventPayload, currentState: GameModeDetails): GameModeDetails {
        if (event === "acceptDone") {
            (currentState['doneStatus'] as number[])[payload.playerIndex as number] = 2;
        }
        if (event === "rejectDone") {
            (currentState['doneStatus'] as number[])[payload.playerIndex as number] = 0;
            (currentState['lastDone'] as number[])[payload.playerIndex as number] = -1;
        }
        if (event === "newCard") {
            currentState['card'] = this.parseCard(payload.card as string);
            const claimedTiles = [] as ClaimStatus[][];
            for (let i = 0; i < 25; i++) {
                claimedTiles.push((currentState['claimedTiles'] as ClaimStatus[][])[i].map(() => { return ClaimStatus.UNCLAIMED }));
            }
            currentState['claimedTiles'] = claimedTiles;
        }
        return currentState;
    }

    handleUserEvent(event: string, player: number, payload: PlayerEventPayload, currentState: GameModeDetails): GameModeDetails {
        if (event === "done") {
            (currentState['doneStatus'] as number[])[player] = 1;
            (currentState['lastDone'] as number[])[player] = Date.now();
        }
        if (event === "tile") {
            if (currentState['mode'] === "Lockout") {
                // Check if another player has already claimed the time
                let canClaim = true;
                (currentState['claimedTiles'] as ClaimStatus[][])[payload.tile].forEach((status, idx) => {
                    if (status !== ClaimStatus.UNCLAIMED && idx != player) {
                        canClaim = false;
                    }
                });
                if (!canClaim) {
                    return currentState;
                }
            }
            if ((currentState['claimedTiles'] as ClaimStatus[][])[payload.tile][player] == ClaimStatus.UNCLAIMED || (currentState['claimedTiles'] as ClaimStatus[][])[payload.tile][player] == ClaimStatus.HALF_CLAIMED) {
                (currentState['claimedTiles'] as ClaimStatus[][])[payload.tile][player] = ClaimStatus.CLAIMED;
            } else if ((currentState['claimedTiles'] as ClaimStatus[][])[payload.tile][player] == ClaimStatus.CLAIMED) {
                (currentState['claimedTiles'] as ClaimStatus[][])[payload.tile][player] = ClaimStatus.UNCLAIMED;
            }
        }
        if (event === "fullReset") {
            (currentState['claimedTiles'] as ClaimStatus[][]).map((e) => {
                e[player] = ClaimStatus.UNCLAIMED
            });
        }
        if (event === "halfReset" && currentState['halfClaimEnabled']) {
            (currentState['claimedTiles'] as ClaimStatus[][]).map((e) => {
                if (e[player] === ClaimStatus.CLAIMED) {
                    e[player] = ClaimStatus.HALF_CLAIMED;
                }
            });
        }
        return currentState;
    }

    getPlayerDetails(player: number, currentState: GameModeDetails): GameModeDetails {
        const data = {
            card: currentState['card'],
            mode: currentState['mode'],
            claimedTiles: currentState['claimedTiles'] as number[][],
            doneStatus: (currentState['doneStatus'] as number[])[player],
            lastDone: (currentState['lastDone'] as number[])[player],
            halfClaimEnabled: currentState['halfClaimEnabled'],
            hideClaims: currentState['hideClaims']
        };

        if (currentState['hideClaims']) {
            data.mode = "Lockout";
            data.claimedTiles = data.claimedTiles.map(e => { return [e[player]] });
        }

        return data;
    }

    parseCard(card: string): string[] {
        const jsonCard = JSON.parse(card);
        return jsonCard.map((e: {name: string}) => { return e.name });
    }

}

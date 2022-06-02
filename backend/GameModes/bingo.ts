import {GameMode, GameModeDetails, GeneratorOption, GeneratorOptions} from "../model";

interface AdminEventPayload {
    playerIndex?: number;
    card?: string;
}

interface PlayerEventPayload {
    tile: number;
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
            }
        ];
    }

    generate(options: GeneratorOptions, players: string[]): GameModeDetails {
        const claimedTiles = [];

        for (let i = 0; i < 25; i++) {
            claimedTiles.push(players.map(() => { return false }));
        }

        return {
            card: this.parseCard(options['card'] as string),
            mode: options['mode'],
            claimedTiles,
            doneStatus: players.map(() => { return 0 }),
            lastDone: players.map(() => { return -1 })
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
            const claimedTiles = [];
            for (let i = 0; i < 25; i++) {
                claimedTiles.push((currentState['claimedTiles'] as boolean[][])[0].map(() => { return false }));
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
                if ((currentState['claimedTiles'] as boolean[][])[payload.tile].reduce((prev, curr) => { return prev || curr})) {
                    if (!(currentState['claimedTiles'] as boolean[][])[payload.tile][player]) {
                        return currentState;
                    }
                }
            }
            (currentState['claimedTiles'] as boolean[][])[payload.tile][player] = !(currentState['claimedTiles'] as boolean[][])[payload.tile][player];
        }
        return currentState;
    }

    getPlayerDetails(player: number, currentState: GameModeDetails): GameModeDetails {
        return {
            card: currentState['card'],
            mode: currentState['mode'],
            claimedTiles: currentState['claimedTiles'],
            doneStatus: (currentState['doneStatus'] as number[])[player],
            lastDone: (currentState['lastDone'] as number[])[player],
        };
    }

    parseCard(card: string): string[] {
        const jsonCard = JSON.parse(card);
        return jsonCard.map((e: {name: string}) => { return e.name });
    }

}

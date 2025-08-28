import {GameMode, GeneratorOption, GeneratorOptions, IronmanMatch} from "../model";
import {setMatch} from "../database";
import { missionIdToSlug, RouletteSpinGameMode, Spin, SpinGeneratorOptions } from "./rouletteSpin";
import { GameModeDetails } from "@shared-types/RoundInfo";

interface AdminEventPayload {
    playerIndex?: number;
    mapIndex?: number;
}

interface RelayDetails extends GameModeDetails {
    timelimit: number;
    doneStatus: number[];
    lastDone: number[];
    currentSpin: number[];
    rta: number[][];
    currentSpinStart: number[];
    maps: Spin[];
    spinGenOptions: SpinGeneratorOptions[];
    autoAccept: boolean;
    allowForfeits: boolean;
}

export class RelayGameMode implements GameMode {
    getGeneratorOptions(): GeneratorOption[] {
        return [
            {
                id: "timelimit",
                type: "number",
                caption: "Timelimit per map (in minutes)"
            },
            {
                id: "autoaccept",
                type: "boolean",
                caption: "Automatically accept any done/forfeit presses"
            },
            {
                id: "allowforfeits",
                type: "boolean",
                caption: "Allow forfeits",
            },
            {
                id: "trilogy",
                type: "boolean",
                caption: "Use all 19 trilogy maps"
            },
            {
                id: "maps",
                type: "list",
                caption: "Maps",
                options: {
                    id: "map_list_item",
                    type: "select",
                    caption: "Map",
                    options: Object.keys(missionIdToSlug)
                }
            }
        ];
    }

    async generate(options: GeneratorOptions, players: string[]): Promise<RelayDetails> {
        const spinGenOptions: SpinGeneratorOptions[] = [];
        const spins: Spin[] = [];

        const maps = [] as string[];

        if (options['trilogy'] === true) {
            maps.push(
                "The Showstopper (Paris)",
                "World of Tomorrow (Sapienza)",
                "A Gilded Cage (Marrakesh)",
                "Club 27 (Bangkok)",
                "Freedom Fighters (Colorado)",
                "Situs Inversus (Hokkaido)",
                "The Finish Line (Miami)",
                "Three-Headed Serpent (Santa Fortuna)",
                "Chasing a Ghost (Mumbai)",
                "Another Life (Whittleton Creek)",
                "The Ark Society (Isle of Sgàil)",
                "Golden Handshake (New York)",
                "The Last Resort (Haven Island)",
                "On Top Of The World (Dubai)",
                "Death In The Family (Dartmoor)",
                "Apex Predator (Berlin)",
                "End Of An Era (Chongqing)",
                "The Farewell (Mendoza)",
                "Shadows in the Water (Ambrose Island)"
            )
        } else {
            maps.push(...(options['maps'] as string[]));
        }

        for (const map of maps) {
            const options: SpinGeneratorOptions = {
                missionPool: [missionIdToSlug[map]],
                criteriaFilters: {
                    specificDisguises: true,
                    specificMelee: true,
                    specificAccidents: true,
                    specificFirearms: true,
                    uniqueTargetKills: false,
                    genericKills: false,
                    impossibleOrDifficultKills: false,
                    additionalObjectives: false,
                    additionalObjectiveDisguises: false,
                    potentialComplications: [{
                        complicationType: "No Target Pacification",
                        oddsOfReceivingComplication: 0.2
                    }]
                }
            }
            spinGenOptions.push(options);
            spins.push(await RouletteSpinGameMode.generateSpin(options, false))
        }

        return {
            timelimit: (options['timelimit'] as number) * 60 * 1000,
            doneStatus: players.map(() => { return 0 }),
            lastDone: players.map(() => { return -1 }),
            currentSpin: players.map(() => { return 0 }),
            rta: players.map(() => { return maps.map(() => { return 0 }) }),
            currentSpinStart: players.map(() => { return -1 }),
            maps: spins,
            spinGenOptions: spinGenOptions,
            autoAccept: options['autoaccept'] as boolean,
            allowForfeits: options['allowforfeits'] as boolean
        };
    }

    async handleAdminEvent(event: string, payload: AdminEventPayload, currentState: RelayDetails, roundStartingTimestamp: number): Promise<RelayDetails> {
        if (event === "acceptDone") {
            currentState = this.handleDone(payload.playerIndex as number, currentState, roundStartingTimestamp);
        }
        if (event === "rejectDone" || event === "rejectForfeit") {
            currentState.doneStatus[payload.playerIndex as number] = 0;
            currentState.lastDone[payload.playerIndex as number] = -1;
        }
        if (event === "acceptForfeit") {
            currentState = this.handleForfeit(payload.playerIndex as number, currentState);
        }
        if (event === "respin") {
            currentState.maps[payload.mapIndex as number] = await RouletteSpinGameMode.generateSpin(currentState.spinGenOptions[payload.mapIndex as number], false);
        }
        if (event === "undo") {
            currentState = this.undoLastSpin(payload.playerIndex as number, currentState);
        }
        return currentState;
    }

    handleUserEvent(event: string, player: number, payload: unknown, currentState: RelayDetails, roundStartingTimestamp: number): RelayDetails {
        if (event === "done") {
            currentState.lastDone[player] = Date.now();
            if (currentState.autoAccept) {
                currentState = this.handleDone(player, currentState, roundStartingTimestamp);
            } else {
                currentState.doneStatus[player] = 1;
            }
        }
        if (event === "forfeit") {
            currentState.lastDone[player] = Date.now();
            if (currentState.autoAccept) {
                currentState = this.handleForfeit(player, currentState);
            } else {
                currentState.doneStatus[player] = 3;
            }
        }
        return currentState;
    }

    getPlayerDetails(player: number, currentState: RelayDetails, match: IronmanMatch): GameModeDetails {
        let countdown = 0;

        if (currentState.timelimit <= 0) {
            countdown = -1;
        } else if (currentState.currentSpin[player]+1 === currentState.maps.length) {
            countdown = -1;
        } else if (currentState.currentSpinStart[player] === -1) {
            countdown = (match.rounds[match.rounds.length - 1].arrivingTimestamp + currentState.timelimit) - Date.now();
        } else {
            countdown = (currentState.currentSpinStart[player] + currentState.timelimit) - Date.now();
        }

        if (countdown <= 0 && countdown !== -1 && currentState.doneStatus[player] === 0 && currentState.currentSpin[player]+1 !== currentState.maps.length) {
            currentState.rta[player][currentState.currentSpin[player]] = currentState.timelimit;
            currentState.currentSpin[player] += 1;
            currentState.currentSpinStart[player] = Date.now();

            match.rounds[match.rounds.length - 1].additionalDetails = currentState;
            setMatch(match.id, match);
        }

        return {
            doneStatus: currentState.doneStatus[player],
            lastDone: currentState.lastDone[player],
            map: currentState.maps[currentState.currentSpin[player]],
            currentMapIndex: currentState.currentSpin[player],
            totalMaps: currentState.maps.length,
            countdown,
            timelimit: currentState.timelimit,
            allowForfeits: currentState.allowForfeits
        };
    }

    private handleDone(player: number, currentState: RelayDetails, roundStartingTimestamp: number): RelayDetails {
        if (currentState.currentSpinStart[player] === -1) {
            currentState.rta[player][currentState.currentSpin[player]] = currentState.lastDone[player] - roundStartingTimestamp;
        } else {
            currentState.rta[player][currentState.currentSpin[player]] = currentState.lastDone[player] - currentState.currentSpinStart[player];
        }
        currentState.currentSpin[player] += 1
        if (currentState.currentSpin[player] === currentState.maps.length) {
            currentState.doneStatus[player] = 2;
        } else {
            currentState.currentSpinStart[player] = Date.now();
            currentState.doneStatus[player] = 0;
            currentState.lastDone[player] = -1;
        }
        return currentState;
    }

    private handleForfeit(player: number, currentState: RelayDetails): RelayDetails {
        currentState.rta[player][currentState.currentSpin[player]] = currentState.timelimit;
        currentState.currentSpin[player] += 1
        if (currentState.currentSpin[player] === currentState.maps.length) {
            currentState.doneStatus[player] = 4;
        } else {
            currentState.currentSpinStart[player] = Date.now();
            currentState.doneStatus[player] = 0;
            currentState.lastDone[player] = -1;
        }
        return currentState;
    }

    private undoLastSpin(player: number, currentState: RelayDetails): RelayDetails {
        if (currentState.currentSpin[player] === 0) {
            return currentState;
        }

        currentState.currentSpin[player] -= 1;
        if (currentState.rta[player][currentState.currentSpin[player]] === currentState.timelimit) {
            currentState.currentSpinStart[player] = Date.now();
        } else {
            currentState.currentSpinStart[player] = Date.now() - currentState.rta[player][currentState.currentSpin[player]];
        }
        currentState.rta[player][currentState.currentSpin[player]] = 0;
        currentState.doneStatus[player] = 0;
        currentState.lastDone[player] = -1;

        return currentState;
    }

}
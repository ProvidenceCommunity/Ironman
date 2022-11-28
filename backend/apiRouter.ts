import { Router } from 'express';
import {createMatch, getMatch, sessionStore, setMatch} from "./database";
import {GameModeDetails, GameModes, IronmanRound} from "./model";
import debug from 'debug';
import DiscordConnector from './discordConnector';

const dbg = debug("ironman:api");

export const apiRouter = Router();
apiRouter.use(sessionStore);

apiRouter.post('/match/create', (req, res) => {
    if (!req.session.isAdmin) {
        res.sendStatus(403);
        return;
    }
    const uuid = createMatch(req.body.players);
    dbg("Creating match %s", uuid);
    res.send(uuid);
});

apiRouter.post('/match/update/:mID', (req, res) => {
    if (!req.session.isAdmin) {
        res.sendStatus(403);
        return;
    }
    const match = getMatch(req.params.mID);
    Object.assign(match, req.body);
    setMatch(req.params.mID as string, match);
    res.sendStatus(204);
});

apiRouter.post('/match/schedule/:mID', (req, res) => {
    if (!req.session.isAdmin) {
        res.sendStatus(403);
        return;
    }
    const match = getMatch(req.params.mID);
    Object.assign(match, req.body);
    setMatch(req.params.mID as string, match);
    // Discord scheduling dispatch
    res.sendStatus(204);
});

apiRouter.get('/match/admin/:mID', async (req, res) => {
    if (!req.session.isAdmin) {
        res.sendStatus(403);
        return;
    }
    const match = getMatch(req.params.mID as string);
    if (!match) {
        res.sendStatus(404);
        return;
    }
    res.json(match);
});

apiRouter.post('/match/admin/:mID/addRound', async (req, res) => {
    if (!req.session.isAdmin) {
        res.sendStatus(403);
        return;
    }
    const match = getMatch(req.params.mID as string);
    if (!match) {
        res.sendStatus(404);
        return;
    }
    try {
        const details = await GameModes[req.body.game_mode].generate(req.body.generatorOptions, match.players);
        match.rounds.push({
            title: req.body.title,
            mode: req.body.game_mode,
            additionalDetails: details,
            arrivingTimestamp: -1,
            leavingTimestamp: -1
        });
        dbg("(%s) Added round %s [%s]: %o", match.id, req.body.title, req.body.game_mode, details);
        setMatch(req.params.mID as string, match);
        res.sendStatus(204);
    } catch {
        dbg("(%s) Error while adding round %s [%s]: %o", match.id, req.body.title, req.body.game_mode, req.body.generatorOptions);
        res.sendStatus(500);
    }
});

apiRouter.post('/match/admin/:mID/:event', async (req, res) => {
    if (!req.session.isAdmin) {
        res.sendStatus(403);
        return;
    }
    const match = getMatch(req.params.mID as string);
    if (!match) {
        res.sendStatus(404);
        return;
    }
    const round = match.rounds[match.rounds.length - 1];
    try {
        round.additionalDetails = await GameModes[round.mode].handleAdminEvent(req.params['event'] as string, req.body, round.additionalDetails, round.arrivingTimestamp);
        dbg("(%s)[%s] Admin event %s: %o", match.id, round.mode, req.params['event'], req.body);
        res.sendStatus(204);
    } catch {
        dbg("(%s)[%s] Error while processing admin event %s: %o", match.id, round.mode, req.params['event'], req.body);
        res.sendStatus(500);
    }
});

apiRouter.get('/match/player/:mID/:player', async (req, res) => {
    const match = getMatch(req.params.mID as string);
    if (!match) {
        res.sendStatus(404);
        return;
    }
    const playerIndex = match.players.findIndex((e) => { return e === req.params.player as string });
    if (playerIndex < 0) {
        res.sendStatus(404);
        return;
    }
    const roundIndex = match.rounds.length - 1;
    const players = [] as string[];
    for (const player of match.players) {
        players.push(await DiscordConnector.getInstance().resolvePlayer(player));
    }
    const result: {players:string[];scores:number[];round?:GameModeDetails;currentGameMode?:string;countdown?:number;totalMatchTime?:number;roundLive:boolean;roundTitle?:string} = {
        players,
        scores: match.scores,
        roundLive: false
    };
    if (roundIndex >= 0) {
        const round = match.rounds[roundIndex];
        result.currentGameMode = round.mode;
        result.roundTitle = round.title;
        if (Date.now() < round.arrivingTimestamp) {
            result.countdown = Math.floor((round.arrivingTimestamp - Date.now()) / 1000 );
        } else if ((Date.now() < round.leavingTimestamp || round.leavingTimestamp < 0) && round.arrivingTimestamp > 0) {
            result.totalMatchTime = Math.floor((round.leavingTimestamp - round.arrivingTimestamp) / 1000);
            result.countdown = Math.floor((round.leavingTimestamp - Date.now()) / 1000);
            result.round = GameModes[round.mode].getPlayerDetails(playerIndex, round.additionalDetails, match);
            result.roundLive = true;
        }
    }
    res.json(result);
});

apiRouter.post('/match/player/:mID/:player/:event', (req, res) => {
    const match = getMatch(req.params.mID as string);
    if (!match) {
        res.sendStatus(404);
        return;
    }
    const playerIndex = match.players.findIndex((pl) => { return pl === req.params.player as string });
    if (playerIndex < 0) {
        res.sendStatus(404);
        return;
    }
    const round = match.rounds[match.rounds.length - 1];
    try {
        dbg("(%s)[%s] Player(%s) event %s: %o", match.id, round.mode, req.params.player, req.params['event'], req.body);
        round.additionalDetails = GameModes[round.mode].handleUserEvent(req.params.event as string, playerIndex, req.body, round.additionalDetails);
        res.sendStatus(204);
    } catch {
        dbg("(%s) Error while Player(%s) event %s: %o", match.id, round.mode, req.params.player, req.params['event'], req.body);
        res.sendStatus(500);
    }
});

apiRouter.get('/match/overlay/:mID', (req, res) => {
    const match = getMatch(req.params.mID as string);
    if (!match) {
        res.sendStatus(404);
        return;
    }
    const roundIndex = match.rounds.length - 1;
    const result: {players:string[];scores:number[];round?:IronmanRound;countdown?:number;totalMatchTime?:number;roundLive:boolean} = {
        players: match.players,
        scores: match.scores,
        roundLive: false
    };
    if (roundIndex >= 0) {
        const round = match.rounds[roundIndex];
        result.round = round;
        if (Date.now() < round.arrivingTimestamp) {
            result.countdown = Math.floor((round.arrivingTimestamp - Date.now()) / 1000 );
        } else if ((Date.now() < round.leavingTimestamp || round.leavingTimestamp < 0) && round.arrivingTimestamp > 0) {
            result.totalMatchTime = Math.floor((round.leavingTimestamp - round.arrivingTimestamp) / 1000);
            result.countdown = Math.floor((round.leavingTimestamp - Date.now()) / 1000);
            result.roundLive = true;
        }
    }
    res.json(result);
});

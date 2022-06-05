import { Router } from 'express';
import {createMatch, getMatch, sessionStore, setMatch} from "./database";
import {GameModeDetails, GameModes, IronmanRound, IronmanScoringType} from "./model";

export const apiRouter = Router();
apiRouter.use(sessionStore);

apiRouter.post('/match/create', (req, res) => {
    if (!req.session.isAdmin) {
        res.sendStatus(403);
        return;
    }
    const uuid = createMatch(req.body.players, req.body.scoringType);
    res.send(uuid);
});

apiRouter.post('/match/update/:mID', (req, res) => {
    if (!req.session.isAdmin) {
        res.sendStatus(403);
        return;
    }
    setMatch(req.params.mID as string, req.body);
    res.sendStatus(204);
});

apiRouter.get('/match/admin/:mID', (req, res) => {
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
    match.rounds.push({
        mode: req.body.game_mode,
        additionalDetails: await GameModes[req.body.game_mode].generate(req.body.generatorOptions, match.players),
        arrivingTimestamp: -1,
        leavingTimestamp: -1
    });
    setMatch(req.params.mID as string, match);
    res.sendStatus(204);
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
    round.additionalDetails = await GameModes[round.mode].handleAdminEvent(req.params['event'] as string, req.body, round.additionalDetails);
    res.sendStatus(204);
});

apiRouter.get('/match/player/:mID/:player', (req, res) => {
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
    const result: {players:string[];scores:number[];scoringType:IronmanScoringType;round?:GameModeDetails;currentGameMode?:string;countdown?:number;totalMatchTime?:number;roundLive:boolean} = {
        players: match.players,
        scores: match.scores,
        scoringType: match.scoringType,
        roundLive: false
    };
    if (roundIndex >= 0) {
        const round = match.rounds[roundIndex];
        result.currentGameMode = round.mode;
        if (Date.now() < round.arrivingTimestamp) {
            result.countdown = Math.floor((round.arrivingTimestamp - Date.now()) / 1000 );
        } else if (Date.now() < round.leavingTimestamp || round.leavingTimestamp < 0) {
            result.totalMatchTime = Math.floor((round.leavingTimestamp - round.arrivingTimestamp) / 1000);
            result.countdown = Math.floor((round.leavingTimestamp - Date.now()) / 1000);
            result.round = GameModes[round.mode].getPlayerDetails(playerIndex, round.additionalDetails);
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
    round.additionalDetails = GameModes[round.mode].handleUserEvent(req.params.event as string, playerIndex, req.body, round.additionalDetails);
    res.sendStatus(204);
});

apiRouter.get('/match/overlay/:mID', (req, res) => {
    const match = getMatch(req.params.mID as string);
    if (!match) {
        res.sendStatus(404);
        return;
    }
    const roundIndex = match.rounds.length - 1;
    const result: {players:string[];scores:number[];scoringType:IronmanScoringType;round?:IronmanRound;countdown?:number;totalMatchTime?:number;roundLive:boolean} = {
        players: match.players,
        scores: match.scores,
        scoringType: match.scoringType,
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

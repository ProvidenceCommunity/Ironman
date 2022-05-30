import { Router } from 'express';
import {createMatch, getMatch, sessionStore} from "./database";
import {GameModes} from "./model";

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

apiRouter.post('/match/admin/:mID/:event', (req, res) => {
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
    round.additionalDetails = GameModes[round.mode].handleAdminEvent(req.params['event'] as string, req.body, round.additionalDetails);
    res.sendStatus(204);
});

apiRouter.get('/match/player/:mID/:player', (req, res) => {
    //TODO: Countdown?
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
    res.json({
        scores: match.scores,
        scoringType: match.scoringType,
        rounds: match.rounds.map((e) => { return GameModes[e.mode].getPlayerDetails(playerIndex, e.additionalDetails) })
    });
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

});

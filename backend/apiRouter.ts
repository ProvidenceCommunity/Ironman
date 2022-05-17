import { Router } from 'express';
import { getMatch, sessionStore } from "./database";
import {GameModes} from "./model";

export const apiRouter = Router();
apiRouter.use(sessionStore);

// TODO: Use negations & "return"

apiRouter.get('/', (req, res) => {

});

apiRouter.post('/match/create', (req, res) => {

});

apiRouter.post('/match/update/:mID', (req, res) => {

});

apiRouter.get('/match/admin/:mID', (req, res) => {
    if (req.session.isAdmin) {
        const match = getMatch(req.params.mID as string);
        if (match) {
            res.json(match);
        } else {
            res.sendStatus(404);
        }
    } else {
        res.sendStatus(403);
    }
});

apiRouter.post('/match/admin/:mID/:event', (req, res) => {
    if (req.session.isAdmin) {
        const match = getMatch(req.params.mID as string);
        if (match) {
            // TODO: This is ugly, move to own file
            const round = match.rounds[match.rounds.length - 1];
            round.additionalDetails = GameModes[round.mode].handleAdminEvent(req.params.event as string, req.body, round.additionalDetails);
        } else {
            res.sendStatus(404);
        }
    } else {
        res.sendStatus(403);
    }
});

apiRouter.get('/match/player/:mID/:player', (req, res) => {
    const match = getMatch(req.params.mID as string);
    if (match) {
        const playerIndex = match.players.findIndex((e) => { return e === req.params.player as string });
        if (playerIndex < 0) {
            res.sendStatus(404);
        } else {
            const round = match.rounds[match.rounds.length - 1];
            res.json(GameModes[round.mode].getPlayerDetails(playerIndex, round.additionalDetails));
        }
    } else {
        res.sendStatus(404);
    }
});

apiRouter.post('/match/player/:mID/:player/:event', (req, res) => {

});

apiRouter.get('/match/overlay/:mID', (req, res) => {

});

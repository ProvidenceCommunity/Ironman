import debug from 'debug';
import { Router } from 'express';
import { MatchController } from '../controllers/MatchController';

const dbg = debug("ironman:api");

export const apiRouter = Router();
// TODO: apiRouter.use(sessionStore)

apiRouter.put("/match", async (req, res) => {
    const uuid = await MatchController.createMatch(req.body.players);
    dbg("Creating match %s", uuid);
    res.send(uuid);
});

apiRouter.post("/match/:mID", async (req, res) => {
    const match = await MatchController.getMatchById(req.params.mID);
    if (!match) {
        res.sendStatus(404);
        return;
    }

    let shouldAnnounce = false;
    if (req.query.schedule !== undefined) {
        shouldAnnounce = await MatchController.shouldAnnounceSchedule(match, req.body);
    }
    Object.assign(match, req.body);
    await MatchController.updateMatch(match);
    if (shouldAnnounce) {
        // Send scheduling message
    }
    res.sendStatus(204);
});
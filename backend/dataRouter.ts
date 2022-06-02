import { Router } from 'express';
import {getMatches, sessionStore} from "./database";
import {GameModes} from "./model";

export const dataRouter = Router();
dataRouter.use(sessionStore);

dataRouter.get('/me', (req, res) => {
    if (!req.session.isAdmin) {
        res.sendStatus(403);
        return;
    }
    res.json({
        username: req.session.username,
        avatar: req.session.avatarURI
    })
})

dataRouter.get('/game_modes', (req, res) => {
    res.json({
       game_modes: Object.keys(GameModes)
    });
});

dataRouter.get('/game_modes/:game_mode', (req, res) => {
    if (GameModes[req.params.game_mode as string] === undefined) {
        res.sendStatus(404);
        return;
    }
    res.json({
        generatorOptions: GameModes[req.params.game_mode as string].getGeneratorOptions()
    });
});

dataRouter.get('/matches', (req, res) => {
    if (!req.session.isAdmin) {
        res.sendStatus(403);
        return;
    }
    res.json({
        matches: getMatches()
    });
});

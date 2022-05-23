import { Router } from 'express';
import {sessionStore} from "./database";

export const dataRouter = Router();
dataRouter.use(sessionStore);

dataRouter.get('/me', (req, res) => {
    //TODO: Test code, to be removed
    res.json({
        username: 'test_root',
        avatar: '<none>'
    });
    return;
    if (!req.session.isAdmin) {
        res.sendStatus(403);
        return;
    }
    res.json({
        username: req.session.username,
        avatar: req.session.avatarURI
    })
})

import { Router } from 'express';
import {sessionStore} from "./database";

export const dataRouter = Router();
dataRouter.use(sessionStore);

dataRouter.get('/me', (req, res) => {
    //TODO: Test code, to be removed
    res.json({
        username: 'test_root',
        avatar: 'https://static-cdn.jtvnw.net/jtv_user_pictures/6c800651-6037-492a-9bbb-4a70e39e89d1-profile_image-70x70.png'
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

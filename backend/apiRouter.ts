import { Router } from 'express';
import {getMatch} from "./database";

export const apiRouter = Router();

apiRouter.get('/', (req, res) => {

});

apiRouter.post('/match/create', (req, res) => {

});

apiRouter.post('/match/update/{mID}', (req, res) => {

});

apiRouter.get('/match/admin/{mID}', (req, res) => {
    if (req.session['isAdmin']) {
        res.json(getMatch(req.query.mID as string));
    }
});

apiRouter.post('/match/admin/{mID}/{event}', (req, res) => {

});

apiRouter.get('/match/player/{mID}/{player}', (req, res) => {

});

apiRouter.post('/match/player/{mID}/{player}/{event}', (req, res) => {

});

apiRouter.get('/match/overlay/{mID}', (req, res) => {

});

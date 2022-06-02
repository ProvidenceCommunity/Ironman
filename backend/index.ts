import express from 'express';
import {loadDatabase, writeDatabase} from "./database";
import {apiRouter} from "./apiRouter";
import {authRouter} from "./authenticator";
import {dataRouter} from "./dataRouter";
import * as bodyParser from "body-parser";
import cors from 'cors';
import history from 'connect-history-api-fallback';

const urlPrefix = "/match";

async function main() {
    const app = express();

    await loadDatabase();

    app.use(bodyParser.json());
    app.use(cors({
        // TODO: Not static?
        origin: 'http://localhost:8080',
        credentials: true
    }));

    app.use(urlPrefix + '/api/', apiRouter);
    app.use(urlPrefix + '/auth/', authRouter);
    app.use(urlPrefix + '/data/', dataRouter);
    app.use(history());

    app.use(urlPrefix + "/", express.static('dist'));

    app.listen(5002, 'localhost', () => {
        console.log(`Server listening on localhost:5002`);
    })
}

process.on('SIGINT', async () => {
   await writeDatabase();
   process.exit(0);
});

void main();

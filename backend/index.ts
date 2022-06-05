import express from 'express';
import {loadDatabase, writeDatabase} from "./database";
import {apiRouter} from "./apiRouter";
import {authRouter} from "./authenticator";
import {dataRouter} from "./dataRouter";
import * as bodyParser from "body-parser";
import cors from 'cors';
import history from 'connect-history-api-fallback';
import 'dotenv/config';

async function main() {
    const app = express();

    await loadDatabase();

    app.use(bodyParser.json());
    app.use(cors({
        origin: 'http://localhost:8080',
        credentials: true
    }));

    app.use('/api/', apiRouter);
    app.use('/auth/', authRouter);
    app.use('/data/', dataRouter);
    app.use(history());

    app.use(express.static('dist'));

    app.listen(parseInt(process.env.PORT as string), process.env.HOSTNAME as string, () => {
        console.log(`Server listening on ${process.env.HOSTNAME}:${process.env.PORT}`);
    })
}

process.on('SIGINT', async () => {
   await writeDatabase();
   process.exit(0);
});

void main();

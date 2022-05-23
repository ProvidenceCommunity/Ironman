import express from 'express';
import {loadDatabase, writeDatabase} from "./database";
import {apiRouter} from "./apiRouter";
import {authRouter} from "./authenticator";
import {dataRouter} from "./dataRouter";
import * as bodyParser from "body-parser";
import cors from 'cors';

async function main() {
    const app = express();

    await loadDatabase();

    app.use(bodyParser.json());
    app.use(cors({
        origin: 'http://localhost:8080'
    }))

    app.use('/api/', apiRouter);
    app.use('/auth/', authRouter);
    app.use('/data/', dataRouter);

    app.listen(5002, 'localhost', () => {
        console.log(`Server listening on localhost:5002`);
    })
}

process.on('SIGINT', async () => {
   await writeDatabase();
   process.exit(0);
});

void main();

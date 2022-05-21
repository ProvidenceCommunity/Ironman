import express from 'express';
import {loadDatabase, writeDatabase} from "./database";
import {apiRouter} from "./apiRouter";
import {authRouter} from "./authenticator";
import * as bodyParser from "body-parser";

async function main() {
    const app = express();

    await loadDatabase();

    app.use(bodyParser.json());

    app.use('/api/', apiRouter);
    app.use('/auth/', authRouter);

    app.listen(3000, 'localhost', () => {
        console.log(`Server listening on localhost:3000`);
    })
}

process.on('SIGINT', async () => {
   await writeDatabase();
   process.exit(0);
});

void main();

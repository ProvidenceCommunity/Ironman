import express from 'express';
import {getConfig, loadConfig, loadDatabase, writeDatabase} from "./database";
import {apiRouter} from "./apiRouter";
import {authRouter} from "./authenticator";
import {dataRouter} from "./dataRouter";
import * as bodyParser from "body-parser";
import cors from 'cors';
import history from 'connect-history-api-fallback';
import 'dotenv/config';
import DiscordConnector from './discordConnector';

async function main() {
    const app = express();

    await loadDatabase();
    await loadConfig();
    await DiscordConnector.getInstance().initialize(getConfig().discord.botToken, getConfig().discord.guildId, getConfig().discord.channelId);

    setInterval(() => {
        void writeDatabase();
        void loadConfig();
    }, 1000 * 60 * 15); // 15 minute interval to save db

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
    });
}

process.on('SIGINT', async () => {
   await writeDatabase();
   process.exit(0);
});

void main();

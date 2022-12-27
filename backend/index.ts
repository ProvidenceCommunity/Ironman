import express from 'express';
import debug from 'debug';
import IronmanDatabase from './Database';

async function main() {
    const app = express();
    const dbg = debug("ironman:main");

    await IronmanDatabase.connect();

    app.listen(() => {
        dbg("Server listening.");
    })
}

void main();
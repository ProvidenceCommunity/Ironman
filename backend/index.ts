import express from 'express';
import session from 'express-session';
import {loadDatabase, writeDatabase} from "./database";
import {apiRouter} from "./apiRouter";

async function main() {
    const app = express();

    await loadDatabase();

    app.use(session({ secret: 'TODO FIX THIS' }));
    app.use('/api/', apiRouter);

    app.listen(3000, 'localhost', () => {
        console.log(`Server listening on localhost:3000`);
    })
}

process.on('SIGINT', async () => {
   await writeDatabase();
   process.exit(0);
});

void main();

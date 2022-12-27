import debug from "debug";
import "reflect-metadata";
import { DataSource } from "typeorm";
import { IronmanMatch } from "./model/Match";
import { IronmanTournament } from "./model/Tournament";

export default class IronmanDatabase {
    static instance: DataSource | null = null;
    private static dbg = debug("ironman:database");

    public static getInstance(): DataSource {
        if (IronmanDatabase.instance === null) {
            IronmanDatabase.instance = new DataSource({
                type: 'sqlite',
                database: process.env.DATABASE_FILE as string,
                entities: [ IronmanMatch, IronmanTournament ]
            })
        }
        return IronmanDatabase.instance;
    }

    static async connect(): Promise<void> {
        const db = this.getInstance();
        if (db.isInitialized) {
            this.dbg("Tried to connect an already connected database!")
            return;
        }
        this.dbg("Connecting to database")
        await db.initialize();
        this.dbg("Database connection initialized.");
        await db.synchronize();
        this.dbg("Database synchronized.");
    }

    static disconnect(): void {
        if (!this.instance) {
            this.dbg("Tried to disconnect an already disconnected database!");
            return;
        }
        void this.instance.destroy();
        this.instance = null;
    }
}
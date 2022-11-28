import debug from "debug";
import { Client, IntentsBitField } from "discord.js";

const CACHE_LIFETIME = 5 * 60 * 1000;

export interface PlayerMap {
    [id: string]: string;
}

export default class DiscordConnector {
    private static instance: DiscordConnector | null = null;

    private discord: Client<boolean>;
    private dbg: debug.Debugger;
    private guildId: string;
    private channelId: string;
    private playerMapCache: PlayerMap;
    private playerMapCacheTimer: number;

    private constructor() {
        this.discord = new Client({ intents: [ IntentsBitField.Flags.Guilds, IntentsBitField.Flags.GuildMembers ] });
        this.dbg = debug("ironman:discord");
        this.guildId = "";
        this.channelId = "";
        this.playerMapCache = { };
        this.playerMapCacheTimer = -1;

        this.discord.on('ready', () => {
            this.dbg("Bot logged in as %s", this.discord.user?.tag);
        })
    }

    static getInstance(): DiscordConnector {
        if (DiscordConnector.instance === null) {
            DiscordConnector.instance = new DiscordConnector();
        }
        return DiscordConnector.instance;
    }

    async initialize(token: string, guildId: string, channelId: string): Promise<void> {
        if (this.discord.isReady()) {
            this.dbg("WARN: initialize called even though bot is ready");
            return;
        } else {
            this.guildId = guildId;
            this.channelId = channelId;
            await (this.discord as Client<false>).login(token);
        }
    }

    async getAvailableUsers(): Promise<PlayerMap> {
        if (!this.discord.isReady()) {
            return { };
        }

        if (this.playerMapCacheTimer >= Date.now() - CACHE_LIFETIME) {
            return this.playerMapCache;
        }

        const guild = await this.discord.guilds.fetch(this.guildId);
        if (!guild.available) {
            this.dbg("WARN: Guild %s is not available", this.guildId);
        }
        const roles = await guild.roles.fetch();
        const users = await guild.members.fetch();

        const result = {} as PlayerMap;
        roles.forEach(role => {
            if (!role.managed && role.name !== "@everyone") {
                result[role.id] = role.name;
            }
        });
        users.forEach(user => {
            result[user.id] = user.user.tag;
        })
        this.playerMapCache = result;
        this.playerMapCacheTimer = Date.now();
        return result;
    }

    async resolvePlayer(player: string): Promise<string> {
        const map = await this.getAvailableUsers();
        return map[player] || player;
    }

    sendSchedulingMessage(): void {
        // TODO
    }
}
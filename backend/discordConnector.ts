import debug from "debug";
import { Client, EmbedBuilder, IntentsBitField, TextChannel } from "discord.js";
import { getConfig } from "./database";
import { IronmanMatch } from "./model";

const CACHE_LIFETIME = 5 * 60 * 1000;

export interface PlayerMap {
    roles: { [id: string]: string; };
    members: { [id: string]: string; };
}

export interface UnifiedPlayerMap {
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
        this.playerMapCache = { roles: {}, members: {} };
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

    async getAvailableUsersSeperated(): Promise<PlayerMap> {
        if (!this.discord.isReady()) {
            return { members: {}, roles: {} };
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

        const result = { roles: {}, members: {} } as PlayerMap;
        roles.forEach(role => {
            if (!role.managed && role.name !== "@everyone") {
                result.roles[role.id] = role.name;
            }
        });
        users.forEach(user => {
            result.members[user.id] = user.user.tag;
        })
        this.playerMapCache = result;
        this.playerMapCacheTimer = Date.now();
        return result;
    }

    async getAvailableUsers(): Promise<UnifiedPlayerMap> {
        const map = await this.getAvailableUsersSeperated();
        return Object.assign({}, map.members, map.roles);
    }

    async resolvePlayer(player: string): Promise<string> {
        const map = await this.getAvailableUsers();
        return map[player] || player;
    }

    async getPing(player: string): Promise<string> {
        const map = await this.getAvailableUsersSeperated();
        if (map.members[player]) {
            return `<@${player}>`;
        }
        if (map.roles[player]) {
            return `<@&${player}>`;
        }
        return player;
    }

    async sendSchedulingMessage(match: IronmanMatch): Promise<void> {
        if (!this.discord.isReady()) {
            return;
        }
        if (!getConfig().discord.enableMatchupChannel) {
            return;
        }

        const channel = await this.discord.channels.fetch(this.channelId) as TextChannel;
        const embed = new EmbedBuilder();
        const players = [] as string[];
        const timestamp = match.timestamp > 0 ? `<t:${match.timestamp / 1000}:F>\n<t:${match.timestamp / 1000}:R>` : "to be scheduled";
        for (const player of match.players) {
            players.push(await this.getPing(player));
        }
        embed.setTitle(`A ${getConfig().tournamentName} match has been scheduled!`);
        embed.addFields(
            { name: "Players", value: players.join("\n") },
            { name: "Time", value: timestamp }
        );
        for (const key in match.schedulingData) {
            const configField = getConfig().matchSchema.filter(e => {return e.name === key})[0];
            if (!configField) {
                continue;
            }
            if (configField.announceInDiscord) {
                if (typeof match.schedulingData[key] === "object") {
                    embed.addFields({ name: configField.title, value: (match.schedulingData[key] as string[]).join("\n") });
                } else {
                    embed.addFields({ name: configField.title, value: match.schedulingData[key] as string });
                }
            }
        }

        await channel.send({ embeds: [embed] });
    }

    static shouldAnnounceSchedule(matchOne: IronmanMatch, matchTwo: IronmanMatch): boolean {
        if (matchOne.players !== matchTwo.players) return true;
        if (matchOne.timestamp !== matchTwo.timestamp) return true;
        for (const field of getConfig().matchSchema) {
            if (!field.announceInDiscord) continue;

            if (JSON.stringify(matchOne.schedulingData[field.name]) !== JSON.stringify(matchTwo.schedulingData[field.name])) return true;
        }
        return false;
    }
}
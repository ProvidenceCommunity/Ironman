import debug from "debug";
import { APIEmbedField, Client, CommandInteraction, EmbedBuilder, IntentsBitField, Interaction, TextChannel } from "discord.js";
import { DateTime } from "luxon";
import { getConfig, getMatches } from "./database";
import { IronmanMatch } from "./model";

const CACHE_LIFETIME = 5 * 60 * 1000;

export interface PlayerMap {
    roles: { [id: string]: string; };
    members: { [id: string]: string; };
}

export interface UnifiedPlayerMap {
    [id: string]: string;
}

interface AvatarCache {
    [id: string]: {
        requestDate: DateTime;
        result: string;
    }
}

export default class DiscordConnector {
    private static instance: DiscordConnector | null = null;

    private discord: Client<boolean>;
    private dbg: debug.Debugger;
    private guildId: string;
    private channelId: string;
    private playerMapCache: PlayerMap;
    private playerMapCacheTimer: number;
    private avatarCache: AvatarCache;

    private constructor() {
        this.discord = new Client({ intents: [ IntentsBitField.Flags.Guilds, IntentsBitField.Flags.GuildMembers ] });
        this.dbg = debug("ironman:discord");
        this.guildId = "";
        this.channelId = "";
        this.playerMapCache = { roles: {}, members: {} };
        this.playerMapCacheTimer = -1;
        this.avatarCache = {};

        this.discord.once('ready', async () => {
            this.dbg("Bot logged in as %s", this.discord.user?.tag);

            if (getConfig().discord.enableMatchesCommand) {
                const guild = getConfig().discord.guildId;
                if (guild === "") {
                    this.dbg("Couldn't register /matches command - No guild given!");
                    return;
                }

                await this.discord.application?.commands.set([{
                    name: "matches",
                    description: "Displays upcoming tournament matches."
                }], guild);
                this.dbg("Successfully registered /matches command.");
            }
        });

        this.discord.on('interactionCreate', this.handleMatchesCommand);
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

    async handleMatchesCommand(interaction: Interaction): Promise<void> {
        if (!interaction.isCommand()) return;
        const commandInteraction = interaction as CommandInteraction;
        if (commandInteraction.commandName !== "matches") return;

        await commandInteraction.deferReply();
        const matchList = getMatches().filter((e) => {
            return !e.finished && e.timestamp > 0;
        }).sort((a, b) => {
            return a.timestamp - b.timestamp;
        }).slice(0, 10);

        if (matchList.length <= 0) {
            await commandInteraction.followUp("No scheduled matches anytime soon!");
            return;
        }

        const embedFields = [] as APIEmbedField[];
        for (const match of matchList) {
            const sanetizedPlayers = [] as string[];
            for (const e of match.players) {
                sanetizedPlayers.push(await DiscordConnector.getInstance().resolvePlayer(e));
            }
            const timestamp = match.timestamp > 0 ? `<t:${match.timestamp / 1000}:F> - <t:${match.timestamp / 1000}:R>` : "to be scheduled";
            let details = `:watch:${timestamp}`;
            for (const key in match.schedulingData) {
                const configField = getConfig().matchSchema.filter(e => { return e.name === key })[0];
                if (!configField) {
                    continue;
                }
                if (configField.displayInMatchesCommand) {
                    if (typeof match.schedulingData[key] === "object") {
                        details += `\n:small_orange_diamond:**${configField.title}**: ${(match.schedulingData[key] as string[]).join(" - ")}`;
                    } else {
                        details += `\n:small_orange_diamond:**${configField.title}**: ${match.schedulingData[key]}`;
                    }
                }
            }

            embedFields.push({
                name: sanetizedPlayers.join(" vs "),
                value: details + "\n"
            });
        }

        const embed = new EmbedBuilder();
        embed.setTitle("Upcoming Matches:");
        embed.setTimestamp(new Date());
        embed.addFields(embedFields);
        await commandInteraction.followUp({ embeds: [embed] });
    }

    async getAvatar(playerId: string): Promise<string> {
        if (this.avatarCache[playerId] == undefined || this.avatarCache[playerId].requestDate.diff(DateTime.now()).as('hours') > 1) {
            this.avatarCache[playerId] = {
               result: await this.fetchAvatar(playerId),
               requestDate: DateTime.now() 
            }
        }
        return this.avatarCache[playerId].result;
    }

    private async fetchAvatar(playerId: string): Promise<string> {
        try {
            const guild = await this.discord.guilds.fetch(this.guildId);
            const user = await guild.members.fetch(playerId);
            return user.displayAvatarURL();
        } catch {
            return "";
        }
    }

    static shouldAnnounceSchedule(matchOne: IronmanMatch, matchTwo: IronmanMatch): boolean {
        if (JSON.stringify(matchOne.players) !== JSON.stringify(matchTwo.players)) {
            return true;
        }
        if (matchOne.timestamp !== matchTwo.timestamp) {
            return true;   
        }
        for (const field of getConfig().matchSchema) {
            if (!field.announceInDiscord) continue;

            if (JSON.stringify(matchOne.schedulingData[field.name]) !== JSON.stringify(matchTwo.schedulingData[field.name])) {
                return true;
            }
        }
        return false;
    }
}
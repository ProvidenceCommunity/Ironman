import IronmanDatabase from "../Database";
import { IronmanMatch } from "../model/Match";

export class MatchController {

    public static async getMatchById(uuid: string): Promise<IronmanMatch | null> {
        return await IronmanDatabase.getInstance().getRepository(IronmanMatch).findOneBy({ uuid: uuid });
    }

    public static async updateMatch(match: IronmanMatch): Promise<void> {
        await IronmanDatabase.getInstance().getRepository(IronmanMatch).save(match);
    }

    public static async createMatch(players: string[]): Promise<string> {
        const match = new IronmanMatch(players);    // TODO: Check if this works!
        await IronmanDatabase.getInstance().getRepository(IronmanMatch).save(match);
        return match.uuid;
    }

    public static shouldAnnounceSchedule(matchOne: IronmanMatch, matchTwo: IronmanMatch): Promise<boolean> {
        return new Promise(resolve => { resolve(false) });
    }

}
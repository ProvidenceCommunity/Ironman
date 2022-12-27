import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

export interface IronmanMatchPlayer {
    name: string;
    score: number;
}

export interface IronmanRound {
    mode: string;
    title: string;
    additionalDetails: Record<string, unknown>;
    arrivingTimestamp: number;
    leavingTimestamp: number;
}

@Entity()
export class IronmanMatch {
    @PrimaryGeneratedColumn("uuid")
        uuid: string;
    @Column({ type: "simple-json" })
        players: IronmanMatchPlayer[];
    @Column({ type: "simple-json" })
        rounds: IronmanRound[];
    @Column()
        timestamp: number;
    @Column()
        schedulingData: Record<string, string | string[]>;
    @Column({ nullable: true })
        finished?: boolean;
}
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

export interface SchedulingField {
    type: "string" | "select" | "list"; //TODO: Picks & Bans
    name: string;
    title: string;
    displayInOverview?: boolean;
    announceInDiscord?: boolean;
    displayInMatchesCommand?: boolean;
    options?: string[] | SchedulingField;
}

@Entity()
export class IronmanTournament {
    @PrimaryGeneratedColumn("uuid")
        uuid: string;
    @Column()
        name: string;
    @Column({ type: 'simple-json' })
        schedulingSchema: SchedulingField[];
}
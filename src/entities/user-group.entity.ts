import { Column, Entity } from "typeorm";
import { DatetimeBasedEntity } from '@entities';

@Entity('group')
export class GroupEntity extends DatetimeBasedEntity {
    @Column()
    name!: string;
}
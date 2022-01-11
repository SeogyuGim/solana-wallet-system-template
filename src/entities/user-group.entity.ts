import { Column, Entity } from 'typeorm';
import { DatetimeBasedEntity } from '@entities';

@Entity('userGroups')
export class GroupEntity extends DatetimeBasedEntity {
	@Column()
	name!: string;
}

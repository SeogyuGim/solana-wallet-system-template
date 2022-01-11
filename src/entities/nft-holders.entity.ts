import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { DatetimeBasedEntity, UserEntity } from '@entities';

@Entity({ name: 'nftHolders' })
export class NftHoldersEntity extends DatetimeBasedEntity {
	@Column()
	nft_address!: string;

	@OneToOne(() => UserEntity)
	@JoinColumn({ name: 'userId', referencedColumnName: 'id' })
	user?: UserEntity;

	@Column({
		default: false,
	})
	onOrderbook!: boolean;
}

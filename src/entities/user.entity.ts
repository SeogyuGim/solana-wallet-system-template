import { BeforeInsert, Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { CryptoWalletEntity, CryptoWithdrawalEntity, DatetimeBasedEntity, GroupEntity } from '@entities';
import { hash } from '@utils';

@Entity({ name: 'users' })
export class UserEntity extends DatetimeBasedEntity {
	@Column('uuid')
	uuid!: string;

	@ManyToOne(() => GroupEntity)
	@JoinColumn({ name: 'groupId', referencedColumnName: 'id' })
	group!: GroupEntity;

	@OneToOne(() => CryptoWalletEntity)
	@JoinColumn({ name: 'walletId', referencedColumnName: 'id' })
	wallet: CryptoWalletEntity;

	@OneToMany(() => CryptoWithdrawalEntity, (cryptoWithdrawal) => cryptoWithdrawal.user)
	withdrawals: CryptoWithdrawalEntity[];

	@Column()
	email!: string;

	@Column()
	password!: string;

	@Column()
	countryId?: number;

	@Column({ nullable: true })
	invitedUserId?: number;

	@Column({ default: true })
	isActive!: boolean;

	@Column({ default: false })
	isBlocked!: boolean;

	@BeforeInsert()
	async hashPassword() {
		this.password = hash.encrypt(this.password);
	}

	@BeforeInsert()
	async setUuid() {
		this.uuid = uuidv4();
	}
}

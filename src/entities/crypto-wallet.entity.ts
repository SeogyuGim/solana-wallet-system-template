import { BeforeInsert, Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';

import { DatetimeBasedEntity } from './datetime-based.entity';
import { TransactionHistoryEntity } from './transactionHistory.entity';
import { CryptoWithdrawalEntity } from './crypto-withdrawal.entity';
import { UserEntity } from './user.entity';

@Entity('cryptoWallet')
export class CryptoWalletEntity extends DatetimeBasedEntity {
	@Column({ nullable: false })
	publicKey!: string;

	@Column({ nullable: false })
	secretKey!: string;

	@Column({ type: 'bigint', default: 0 })
	tokenBalance!: string;

	@Column({ type: 'bigint', default: 0 })
	pendingAmount!: string;

	@Column()
	tokenAddress!: string;

	@OneToOne(() => UserEntity)
	@JoinColumn({ name: 'userId', referencedColumnName: 'id' })
	user: UserEntity;

	@OneToMany(() => TransactionHistoryEntity, (txHistory) => txHistory.wallet)
	histories?: TransactionHistoryEntity[];

	@OneToMany(() => CryptoWithdrawalEntity, (CryptoWithdrawalEntity) => CryptoWithdrawalEntity.wallet)
	withdrawals?: CryptoWithdrawalEntity[];

	@BeforeInsert()
	async encryptSecretKey() {}
}

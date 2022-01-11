import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { WALLET_WITHDRAWAL_STATUS } from '@common/constants';
import { DatetimeBasedEntity } from './datetime-based.entity';
import { CryptoWalletEntity } from './crypto-wallet.entity';
import { UserEntity } from './user.entity';

@Entity({ name: 'cryptoWithdrawal' })
export class CryptoWithdrawalEntity extends DatetimeBasedEntity {
	@ManyToOne(() => CryptoWalletEntity, (wallet) => wallet.withdrawals)
	@JoinColumn({ name: 'walletId', referencedColumnName: 'id' })
	wallet!: CryptoWalletEntity;

	@ManyToOne(() => UserEntity, (user) => user.withdrawals)
	@Column({ type: 'bigint' })
	user: UserEntity;

	@Column({ nullable: false, type: 'bigint' })
	amount!: string;

	@Column({ nullable: false })
	to!: string;

	@Column({ nullable: false, default: 'MTK' })
	symbol!: string;

	@Column({
		comment: `0: created, 1: pending,	2: success,	3: fail`,
		default: WALLET_WITHDRAWAL_STATUS.CREATED,
	})
	status: number;

	@Column({ default: null })
	error: string;
}

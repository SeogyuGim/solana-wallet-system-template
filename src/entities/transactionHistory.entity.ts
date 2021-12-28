import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { DatetimeBasedEntity ,CryptoWalletEntity } from '@entities';

@Entity({ name: 'tx_history' })
export class TransactionHistoryEntity extends DatetimeBasedEntity {
  @ManyToOne(() => CryptoWalletEntity, (wallet) => wallet.histories)
  @JoinColumn({ name: 'walletId', referencedColumnName: 'id' })
  wallet!: CryptoWalletEntity;

  @Column({ nullable: false })
  isDeposit!: boolean;

  @Column({ type: 'bigint' })
  amount!: string;

  @Column({ type: 'bigint' })
  fee!: string;

  @Column({ type: 'bigint' })
  preBalance!: string;

  @Column({ type: 'bigint' })
  postBalance!: string;

  @Column()
  symbol!: string;

  @Column()
  from!: string;

  @Column()
  to!: string;

  @Column({ unique: true })
  signature!: string;

  @Column({ type: 'bigint' })
  blockTime!: string;

  @Column()
  status!: boolean;
}

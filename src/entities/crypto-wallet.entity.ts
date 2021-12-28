import { BeforeInsert, Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { DatetimeBasedEntity, UserEntity, TransactionHistoryEntity  } from '@entities';
// import { encrypt } from '@modules/common/crypto';

@Entity({ name: 'crypto_wallet' })
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

  @OneToOne(() => UserEntity, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  })
  @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
  user!: UserEntity;

  @OneToMany(() => TransactionHistoryEntity, (txHistory) => txHistory.wallet)
  histories?: TransactionHistoryEntity[];

  @BeforeInsert()
  async encryptSecretKey() {
    // const [encrypted, iv, authTag] = encrypt(this.secretKey);
    // this.secretKey = encrypted.toString();
  }
}

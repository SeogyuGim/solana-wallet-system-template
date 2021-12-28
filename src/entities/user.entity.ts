import { BeforeInsert, Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { DatetimeBasedEntity, GroupEntity } from '@entities';
import { hash } from '@utils';

@Entity({ name: 'user' })
export class UserEntity extends DatetimeBasedEntity {
  @Column('uuid')
  uuid!: string;

  @ManyToOne(() => GroupEntity)
  @JoinColumn({name: 'groupId', referencedColumnName: 'id'})
  group!: GroupEntity;

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

import { Module } from '@nestjs/common';
import { TaskService } from '@modules/task/task.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CryptoWalletEntity } from '@entities';
import { TransactionHistoryEntity } from '../../entities/transactionHistory.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CryptoWalletEntity, TransactionHistoryEntity])],
  providers: [TaskService],
})
export class TaskModule {}

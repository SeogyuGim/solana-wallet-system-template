import { Module } from '@nestjs/common';
import { TaskService } from '@modules/task/task.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CryptoWalletEntity, CryptoWithdrawalEntity, TransactionHistoryEntity } from '@entities';

@Module({
	imports: [TypeOrmModule.forFeature([CryptoWalletEntity, TransactionHistoryEntity, CryptoWithdrawalEntity])],
	providers: [TaskService],
})
export class TaskModule {}

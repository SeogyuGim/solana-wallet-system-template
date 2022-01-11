import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CryptoWalletEntity, CryptoWithdrawalEntity, UserEntity } from '@entities';
import { CryptoWalletController } from './crypto-wallet.controller';
import { CryptoWalletService } from './crypto-wallet.service';

@Module({
	imports: [TypeOrmModule.forFeature([UserEntity, CryptoWalletEntity, CryptoWithdrawalEntity])],
	controllers: [CryptoWalletController],
	providers: [CryptoWalletService],
})
export class CryptoWalletModule {}

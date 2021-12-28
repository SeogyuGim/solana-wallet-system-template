import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CryptoWalletEntity, UserEntity } from '@entities';
import { CryptoWalletController } from './crypto-wallet.controller';
import { CryptoWalletService } from './crypto-wallet.service';


@Module({
  imports: [TypeOrmModule.forFeature([CryptoWalletEntity, UserEntity])],
  controllers: [CryptoWalletController],
  providers: [CryptoWalletService],
})
export class CryptoWalletModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

import { CryptoWalletModule } from '@modules/crypto-wallet/crypto-wallet.module';
import { TaskModule } from '@modules/task/task.module';

import { RdbConfigServiceConfigService } from './config/rdb-config.service';
import configuration from './config';
import { AppController } from './app.controller';

@Module({
	imports: [
		TypeOrmModule.forRootAsync({
			useClass: RdbConfigServiceConfigService,
		}),
		ConfigModule.forRoot({
			load: [configuration],
			isGlobal: true,
			cache: true,
		}),
		ScheduleModule.forRoot(),
		CryptoWalletModule,
		TaskModule,
	],
	controllers: [AppController],
})
export class AppModule {}

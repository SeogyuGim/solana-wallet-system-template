import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';

import config from '@config';
import { CryptoWalletModule } from '@modules/crypto-wallet/crypto-wallet.module';
import { AppController } from './app.controller';
import { TaskModule } from '@modules/task/task.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: config.database.write_host,
      port: 5432,
      username: config.database.username,
      password: config.database.password,
      database: config.database.database,
      replication: {
        master: {
          host: config.database.write_host,
          port: 5432,
          username: config.database.username,
          password: config.database.password,
          database: config.database.database,
        },
        slaves: [
          {
            host: config.database.read_host,
            port: 5432,
            username: config.database.username,
            password: config.database.password,
            database: config.database.database,
          },
        ],
      },
      entities: ['dist/**/*.entity.{ts,js}'],
      synchronize: config.DEBUG,
    }),
    ScheduleModule.forRoot(),
    CryptoWalletModule,
    TaskModule,
  ],
  controllers: [AppController],
})
export class AppModule {}

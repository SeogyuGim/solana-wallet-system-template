import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RdbConfigServiceConfigService implements TypeOrmOptionsFactory {
	constructor(private readonly configService: ConfigService) {}

	createTypeOrmOptions(connectionName?: string): Promise<TypeOrmModuleOptions> | TypeOrmModuleOptions {
		if (process.env.NODE_ENV !== 'production') {
			return {
				type: 'postgres',
				port: 5432,
				database: this.configService.get<string>('RDB_NAME'),
				username: this.configService.get<string>('RDB_USER'),
				password: this.configService.get<string>('RDB_PASS'),
				host: this.configService.get<string>('RDB_HOST'),
				entities: ['dist/entities/*.entity.{ts,js}'],
				synchronize: true,
			};
		}
		return {
			type: 'postgres',
			port: 5432,
			database: this.configService.get<string>('RDS_NAME'),
			username: this.configService.get<string>('RDB_USER'),
			password: this.configService.get<string>('RDB_PASS'),
			replication: {
				master: {
					host: this.configService.get<string>('RDB_WRITE_HOST'),
				},
				slaves: [
					{
						host: this.configService.get<string>('RDB_READ_HOST'),
					},
				],
			},
			entities: ['dist/entities/*.entity.{ts,js}'],
			synchronize: this.configService.get<string>('NODE_ENV') === 'production',
		};
	}
}

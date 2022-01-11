import { ApiProperty } from '@nestjs/swagger';
import { IsAlpha, IsNumberString } from 'class-validator';

export class CreateWalletDto {
	@ApiProperty({ description: 'user pk' })
	@IsNumberString()
	userId: string;

	@ApiProperty({ description: 'coin symbol' })
	@IsAlpha()
	symbol: string;
}

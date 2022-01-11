import { IsAlpha, IsAlphanumeric, IsNumberString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWithdrawalDto {
	@ApiProperty({ description: 'wallet pk' })
	@IsNumberString()
	walletId: string;

	@ApiProperty({ description: 'withdrawal amount' })
	@IsNumberString()
	amount: string;

	@ApiProperty({ description: 'coin symbol' })
	@IsAlpha()
	symbol: string;

	@ApiProperty({ description: 'receiver address' })
	@IsAlphanumeric()
	to: string;

	@ApiProperty({ description: 'withdrawal application status', default: 0 })
	@IsNumberString()
	@IsOptional()
	status?: number;
}

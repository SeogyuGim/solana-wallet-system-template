import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';

import { CryptoWalletService } from '@modules/crypto-wallet/crypto-wallet.service';
import { CreateWithdrawalDto } from './dto/create-withdrawal.dto';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { UpdateWithdrawDto } from './dto/update-withdrawal.dto';

@Controller('wallet')
export class CryptoWalletController {
	constructor(private readonly walletService: CryptoWalletService) {}

	@Get('')
	async findAllWallet() {
		return this.walletService.findAllWallets();
	}

	/**
	 * @param dto
	 */
	@Post('')
	async createWallet(@Body() dto: CreateWalletDto) {
		if (!dto.userId) {
			throw new BadRequestException({
				message: 'userId must be defined',
			});
		}
		return this.walletService.createWallet(dto.userId);
	}

	/**
	 * @param id
	 */
	@Get(':id')
	async findOneWallet(@Param('id') id: string) {
		return this.walletService.findOneWallet(+id);
	}

	/**
	 * @param id
	 */
	@Delete(':id')
	async deleteWallet(@Param('id') id: string) {
		const result = this.walletService.deleteWallet(+id);
		if (result) {
			return { success: true };
		} else {
			return { success: false };
		}
	}

	/**
	 * @param userId
	 * @param dto
	 */
	@Post(':id')
	async withdraw(@Param('id') userId: string, @Body() dto: CreateWithdrawalDto) {
		const { amount, to } = dto;
		if (!userId) {
			throw new BadRequestException({ message: 'userId must be defined' });
		}
		if (!amount) {
			throw new BadRequestException({ message: 'amount must be defined' });
		}
		if (!to) {
			throw new BadRequestException({ message: 'to-address must be defined' });
		}

		return await this.walletService.withdrawCrypto({ walletId: userId, ...dto });
	}

	@Patch(':id')
	async updateCryptoWithdrawal(@Param('id') userId: string, @Body() dto: UpdateWithdrawDto) {
		return this.walletService.update(+userId, dto.status);
	}
}

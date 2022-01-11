import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PublicKey } from '@solana/web3.js';
import { Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { web3 } from '@project-serum/anchor';

import { CryptoWalletEntity, CryptoWithdrawalEntity, UserEntity } from '@entities';
import { CreateWithdrawalDto } from './dto/create-withdrawal.dto';

@Injectable()
export class CryptoWalletService {
	private readonly connection = new web3.Connection(web3.clusterApiUrl('mainnet-beta'));
	private readonly mintPublicKey = new PublicKey('ANXqXpSkTEuCnR27YK2AoHNH2CCbiSaKYAKcDQVMi6ar');

	constructor(
		@InjectRepository(UserEntity)
		private readonly userRepository: Repository<UserEntity>,
		@InjectRepository(CryptoWalletEntity)
		private readonly walletRepository: Repository<CryptoWalletEntity>,
		@InjectRepository(CryptoWithdrawalEntity)
		private readonly withdrawalRepository: Repository<CryptoWithdrawalEntity>,
	) {}

	findAllWallets = async () => (await this.walletRepository.find()).map(({ secretKey, ...data }) => data);

	/**
	 * @param userId
	 */
	findOneWallet = async (userId: number) => {
		const wallet = await this.walletRepository.findOne({
			where: { userId },
		});
		if (wallet) {
			const { secretKey, ...data } = wallet;
			return data;
		}

		throw new NotFoundException('Wallet not found');
	};

	/**
	 * @param userId
	 */
	createWallet = async (userId: string) => {
		const user = await this.userRepository.findOne(userId);
		if (!user) {
			throw new NotFoundException({ message: 'User not found' });
		}
		const keypair = web3.Keypair.generate();
		const mintToken = new Token(this.connection, this.mintPublicKey, TOKEN_PROGRAM_ID, keypair);
		const userTokenAccount = await mintToken.getOrCreateAssociatedAccountInfo(keypair.publicKey);
		const walletSchema = this.walletRepository.create({
			user: user,
			publicKey: keypair.publicKey.toString(),
			secretKey: keypair.secretKey.toString(),
			tokenAddress: userTokenAccount.address.toString(),
		});

		const { secretKey, ...data } = await walletSchema.save();

		return data;
	};

	/**
	 * @param id
	 */
	deleteWallet = async (id: number) => {
		const wallet = await this.walletRepository.findOne({ where: { userId: id } });
		if (wallet) {
			await wallet.softRemove();
			return { success: true };
		}
		throw new NotFoundException({ message: 'User has no wallet' });
	};

	withdrawCrypto = async (data: CreateWithdrawalDto) => await this.withdrawalRepository.create(data).save();

	update = async (userId: number, status: number) => {
		const w = await this.withdrawalRepository.findOne({ where: { userId } });
		w.status = status;
		await w.save();
		return { success: true };
	};
}

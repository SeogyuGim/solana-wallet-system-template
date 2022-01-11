import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import axios from 'axios';

import * as web3 from '@solana/web3.js';
import { PublicKey, sendAndConfirmTransaction, Signer, Transaction } from '@solana/web3.js';

import { CryptoWalletEntity, CryptoWithdrawalEntity, TransactionHistoryEntity } from '@entities';
import { LifeCycleInterface } from '@interfaces/life-cycle.interface';
import { Cron, CronExpression } from '@nestjs/schedule';
import { WALLET_WITHDRAWAL_STATUS } from '@common/constants';
import { AccountInfo, Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';

@Injectable()
export class TaskService implements LifeCycleInterface {
	private readonly solScanApiUri = 'https://api.solscan.io/transaction?tx=';
	private readonly connection = new web3.Connection(web3.clusterApiUrl('mainnet-beta'));
	private readonly logger = new Logger(TaskService.name);
	private signatureList: string[];
	private accountChangeListeners: number[];
	private readonly mintPublicKey = new PublicKey('ANXqXpSkTEuCnR27YK2AoHNH2CCbiSaKYAKcDQVMi6ar');

	constructor(
		@InjectRepository(CryptoWalletEntity)
		private readonly walletRepository: Repository<CryptoWalletEntity>,
		@InjectRepository(TransactionHistoryEntity)
		private readonly txRepository: Repository<TransactionHistoryEntity>,
		@InjectRepository(CryptoWithdrawalEntity)
		private readonly withdrawRepository: Repository<CryptoWithdrawalEntity>,
	) {}

	onApplicationBootstrap = async () => {
		this.logger.verbose('onApplicationBootstrap: subscribeToAccount & setTransactionList');
		await this.subscribeToAccount();
		await this.setTransactionList();
	};

	onModuleDestroy = async () => {
		this.logger.verbose('onModuleDestroy: unSubscribeToAccount');
		await this.unSubscribeToAccount();
	};

	@Cron(CronExpression.EVERY_5_SECONDS)
	async cryptoWithdrawJob() {
		const withdrawals = await this.withdrawRepository.find({ where: { status: WALLET_WITHDRAWAL_STATUS.PENDING } });
		this.logger.log(`cryptoWithdrawJob start ... ${withdrawals.length} withdrawals found`);
		for (const withdrawal of withdrawals) {
			const { to, amount, wallet } = withdrawal;
			const userWallet = await this.walletRepository.findOne({ where: { id: wallet } });
			const from: Signer = {
				publicKey: new PublicKey(userWallet.publicKey),
				secretKey: Uint8Array.from(userWallet.secretKey.split(',').map((a) => Number(a))),
			};
			const mintToken = new Token(this.connection, this.mintPublicKey, TOKEN_PROGRAM_ID, from);
			const fromTokenAccount = await mintToken.getAccountInfo(from.publicKey);
			const destPublicKey = new PublicKey(to);

			const associatedDestinationTokenAddress = await Token.getAssociatedTokenAddress(
				mintToken.associatedProgramId,
				mintToken.programId,
				this.mintPublicKey,
				destPublicKey,
			);

			const receiverAccount = await this.connection.getAccountInfo(associatedDestinationTokenAddress);

			if (receiverAccount) {
				const tx = await this.createTx(fromTokenAccount, associatedDestinationTokenAddress, from, amount);
				tx.feePayer = from.publicKey;
				tx.recentBlockhash = (await this.connection.getRecentBlockhash()).blockhash;
				try {
					await sendAndConfirmTransaction(this.connection, tx, [from]);
					withdrawal.status = WALLET_WITHDRAWAL_STATUS.SUCCESS;
					await withdrawal.save();
				} catch (e) {
					withdrawal.status = WALLET_WITHDRAWAL_STATUS.FAILED;
					withdrawal.error = e.message;
					await withdrawal.save();
				}
			}
		}
	}

	// Subscribe all wallets existing on database
	private subscribeToAccount = async () => {
		const wallets = await this.walletRepository.find();
		this.accountChangeListeners = await Promise.all(
			wallets.map(async (wallet) => {
				return this.connection.onAccountChange(new web3.PublicKey(wallet.tokenAddress.trim()), (accountInfo) => {
					this.onUpdateWallet(accountInfo.owner.toString());
				});
			}),
		);
	};

	// Unsubscribe what are subscribed
	private unSubscribeToAccount = async () => {
		await Promise.all(
			this.accountChangeListeners.map(async (id) => {
				return this.connection.removeAccountChangeListener(id);
			}),
		);
	};

	// Init signature array from those existing on database
	private setTransactionList = async () => {
		this.signatureList = await this.getTxsInDatabase();
	};

	/**
	 * @param publicKey: user wallet public key
	 */
	private onUpdateWallet = async (publicKey: string) => {
		this.logger.log(`PublicKey:${publicKey} update event`);
		const wallet = await this.walletRepository
			.createQueryBuilder('w')
			.select(['id', 'publicKey', 'tokenAddress'])
			.where(`publicKey = ${publicKey}`)
			.getOne();

		const filteredTransactions = await this.getFilteredTxs(
			await this.connection.getConfirmedSignaturesForAddress2(new web3.PublicKey(publicKey)),
		);

		const newTxs = await Promise.all(this.createNewTxs(filteredTransactions, wallet));
		if (newTxs.length > 0) {
			const txSavePromises = newTxs
				.filter((tx) => tx !== undefined)
				.map(async (tx: TransactionHistoryEntity) => await tx.save());
			const result = await this.sortByBlockTime(await Promise.all(txSavePromises));
			wallet.tokenBalance = result[0].postBalance;
			await wallet.save();
		}
	};

	private createTx = async (
		fromTokenAccount: AccountInfo,
		associatedDestinationTokenAddress: PublicKey,
		from: Signer,
		amount: string,
	) =>
		new Transaction().add(
			Token.createTransferInstruction(
				TOKEN_PROGRAM_ID,
				fromTokenAccount.address,
				associatedDestinationTokenAddress,
				from.publicKey,
				[],
				Number(amount),
			),
		);

	/**
	 * @param filteredTxs: signature[]
	 * @param wallet: CryptoWalletEntity
	 */
	private createNewTxs = (filteredTxs: string[], wallet: CryptoWalletEntity) =>
		filteredTxs.map(async (signature) => {
			const res = await axios.get(this.solScanApiUri + signature);
			const { blockTime, fee, status, tokens_transfer_txs, tokenBalanes: tokenBalances } = res.data;
			const { amount, destination, source, type, token } = tokens_transfer_txs;
			const { preAmount, postAmount } = await this.getBalancesInTx(tokenBalances, wallet.tokenAddress);
			if (type === 'spl-transfer' && token.symbol === 'MTK') {
				return this.txRepository.create({
					wallet,
					isDeposit: destination === wallet.tokenAddress,
					amount,
					fee,
					status: status === 'Success',
					preBalance: preAmount,
					postBalance: postAmount,
					from: source,
					to: destination,
					symbol: token.symbol,
					blockTime,
				});
			}
			return undefined;
		});

	/**
	 * @param arr: TransactionHistoryEntity[]
	 */
	private sortByBlockTime = async (arr: TransactionHistoryEntity[]) =>
		arr.sort((a: TransactionHistoryEntity, b: TransactionHistoryEntity) => Number(b.blockTime) - Number(a.blockTime));

	/**
	 * @param tokenBalances: current balance of user's token address
	 * @param tokenAddress: user's token address
	 */
	private getBalancesInTx = async (tokenBalances, tokenAddress) =>
		tokenBalances.filter((acc) => acc.account === tokenAddress)[0].amount;

	/**
	 * @param signatures: signature[]
	 */
	private getFilteredTxs = async (signatures: web3.ConfirmedSignatureInfo[]) =>
		signatures.filter((sig) => !this.signatureList.includes(sig.signature)).map((sig) => sig.signature);

	/**
	 * @return signature[]
	 */
	private getTxsInDatabase = async () =>
		(await this.txRepository.createQueryBuilder('tx').select(['tx.signature']).getRawMany()).map(
			(tx) => tx.tx_signature,
		);
}

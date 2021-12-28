import { Injectable, Logger } from '@nestjs/common';
import { Timeout } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { CryptoWalletEntity } from '@entities';
import { Repository } from 'typeorm';
import { TransactionHistoryEntity } from '../../entities/transactionHistory.entity';
import * as web3 from '@solana/web3.js';
import axios from 'axios';

@Injectable()
export class TaskService {
  private readonly solScanApiUri = 'https://api.solscan.io/transaction?tx=';
  private readonly connection = new web3.Connection(web3.clusterApiUrl('mainnet-beta'));
  private signatureList: string[] = [];
  private readonly logger = new Logger(TaskService.name);

  constructor(
    @InjectRepository(CryptoWalletEntity)
    private readonly walletRepository: Repository<CryptoWalletEntity>,
    @InjectRepository(TransactionHistoryEntity)
    private readonly txRepository: Repository<TransactionHistoryEntity>,
  ) {}

  /**
   * 프로그램이 시작하면 DB 상 모든 지갑에 구독한다
   */
  @Timeout(0)
  async subscribeWallets() {
    this.logger.log('subscribeWallets');
    const wallets = await this.walletRepository.find();
    await Promise.all(
      wallets.map(async (wallet) => {
        this.connection.onAccountChange(new web3.PublicKey(wallet.tokenAddress.trim()), (accountInfo) => {
          this.onUpdateWallet(accountInfo.owner.toString());
        });
      }),
    );
  }

  /**
   * 프로그램이 시작하면 현재 DB에 있는 signature 배열을 초기화한다
   */
  @Timeout(0)
  async setTransactionList() {
    this.logger.log('setTransactionList');
    this.signatureList = await this.getAlreadyReadList();
  }

  async onUpdateWallet(publicKey: string) {
    this.logger.log(`PublicKey:${publicKey} update event`);
    const wallet = await this.walletRepository
      .createQueryBuilder('w')
      .select(['id', 'publicKey', 'tokenAddress'])
      .where(`publicKey = ${publicKey}`)
      .getOne();

    const filteredTransactions = await this.getFilteredTransactions(
      await this.connection.getConfirmedSignaturesForAddress2(new web3.PublicKey(publicKey)),
    );

    const newTxs = await Promise.all(
      filteredTransactions.map(async (signature) => {
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
      }),
    );
    if (newTxs.length > 0) {
      const balances = [];
      for (const tx of newTxs.filter((t) => t instanceof TransactionHistoryEntity)) {
        await tx.save();
        balances.push({ blockTime: tx.blockTime, balance: tx.postBalance });
      }

      const updatedBalance = balances.slice().sort((a, b) => b.blockTime - a.blockTime).shift();
      wallet.tokenBalance = updatedBalance.balance;
      await wallet.save();
    }
  }

  async getBalancesInTx(tokenBalances, tokenAddress) {
    return tokenBalances.filter((acc) => acc.account === tokenAddress)[0].amount;
  }

  async getFilteredTransactions(signatures: web3.ConfirmedSignatureInfo[]) {
    return signatures.filter((sig) => !this.signatureList.includes(sig.signature)).map((sig) => sig.signature);
  }

  async getAlreadyReadList() {
    const allTxs = await this.txRepository.createQueryBuilder('tx')
      .select(['tx.signature'])
      .getRawMany();
    return allTxs.map((tx) => tx.tx_signature);
  }
}

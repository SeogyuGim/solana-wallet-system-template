import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CryptoWalletEntity, UserEntity } from '@entities';
import { PublicKey } from '@solana/web3.js';
import { Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { web3 } from '@project-serum/anchor';

@Injectable()
export class CryptoWalletService {
  private readonly connection = new web3.Connection(web3.clusterApiUrl('mainnet-beta'));
  private readonly mintPublicKey = new PublicKey('ANXqXpSkTEuCnR27YK2AoHNH2CCbiSaKYAKcDQVMi6ar');

  constructor(
    @InjectRepository(CryptoWalletEntity)
    private readonly walletRepository: Repository<CryptoWalletEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async findAllWallets() {
    return (await this.walletRepository.find()).map(({ secretKey, ...data }) => data);
  }

  async findOneWallet(userId: number) {
    const wallet = await this.walletRepository.findOne({
      where: { userId },
    });
    if (wallet) {
      const { secretKey, ...data } = wallet;
      return data;
    }

    throw new NotFoundException('존재하지 않는 지갑입니다')
  }

  // TODO: 지갑 생성 후에 솔라나를 보내줘야 하는가?
  async createWallet(userId: string) {
    const user = await this.userRepository.findOne(userId);
    if (!user) {
      throw new BadRequestException('invalid user id');
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
  }

  async deleteWallet(id: number) {
    const wallet = await this.walletRepository.findOne({ where: { id } });
    if (wallet) {
      await wallet.softRemove();
    }
  }
}

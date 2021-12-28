import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';

import { CryptoWalletService } from '../src/modules/crypto-wallet/crypto-wallet.service';
import { CryptoWalletEntity } from '../src/entities';

describe('지갑 모듈 테스트', () => {
  let walletService: CryptoWalletService;
  let walletRepository: Repository<CryptoWalletEntity>;

  beforeEach(async () => {})

  it('findOne TEST', async function() {});

  it('findAll TEST', async function() {});

});
import { BadRequestException, Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { CryptoWalletService } from './crypto-wallet.service';

@Controller('crypto-wallet')
export class CryptoWalletController {
  constructor(private readonly walletService: CryptoWalletService) {
  }

  @Get('')
  async findAllWallet() {
    return this.walletService.findAllWallets();
  }

  @Get('id')
  async findOneWallet(@Param('id') id: string) {
    return this.walletService.findOneWallet(+id);
  }

  @Post('')
  async createWallet(@Body('userId') userId: string) {
    if (!userId) {
      throw new BadRequestException({
        error_message: 'userId must be defined',
      });
    }
    return this.walletService.createWallet(userId);
  }

  @Delete('id')
  async deleteWallet(@Param('id') id: string) {
    const result = this.walletService.deleteWallet(+id);
    if (result) {
      return {
        success: true,
      };
    } else {
      return {
        success: false,
      };
    }
  }
}

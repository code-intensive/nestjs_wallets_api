import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { WalletService } from './wallet.service';
import { GetUser } from '../auth/decorator';
import { Wallet } from 'knex/types/tables';
import { JwtGuard } from '../auth/guard';
import { AmountDTO } from './dto/dto.amount';
import { TransferDTO } from './dto/dto.transfer';

@UseGuards(JwtGuard)
@Controller('api/v1/wallets')
export class WalletController {
  constructor(private walletService: WalletService) {}

  @Post()
  async create(@GetUser('id') user_id: number): Promise<Wallet> {
    return await this.walletService.create(user_id);
  }

  @Get('me')
  async findByUserId(@GetUser('id') user_id: number): Promise<Wallet[]> {
    return await this.walletService.findByUserId(user_id);
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number): Promise<Wallet> {
    return await this.walletService.findById(id);
  }

  @Get()
  async findAll(): Promise<Wallet[]> {
    return await this.walletService.findAll();
  }

  @Post(':id/deposit')
  async deposit(
    @Param('id', ParseIntPipe) id: number,
    @Body() amount: AmountDTO,
  ): Promise<Wallet> {
    return await this.walletService.deposit(+id, amount.amount);
  }

  @Post(':id/transfer')
  async transfer(
    @GetUser('id') user_id: number,
    @Param('id', ParseIntPipe) from: number,
    @Body() transferDto: TransferDTO,
  ): Promise<Wallet> {
    return await this.walletService.transfer(
      user_id,
      +from,
      transferDto.recipient,
      transferDto.amount,
    );
  }

  @Post(':id/withdraw')
  async withdraw(
    @Body() amount: AmountDTO,
    @GetUser('id') user_id: number,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Wallet> {
    return await this.walletService.withdraw(user_id, id, amount.amount);
  }
}

import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Tables } from '../../database/enums';
import { Knex } from 'knex';
import { Wallet } from 'knex/types/tables';
import { InjectModel } from 'nest-knexjs';

@Injectable()
export class WalletService {
  private static readonly MAX_DEPOSIT = 5_000_000;
  private static readonly MAX_TRANSFER = 1_000_000;
  private static readonly MAX_WITHDRAWAL = 2_000_000;

  constructor(@InjectModel() readonly knex: Knex) {}

  async create(user_id: number): Promise<Wallet> {
    const id = (await this.knex.table(Tables.WALLET).insert({ user_id }))[0];
    return this.findById(id);
  }

  async findByUserId(user_id: number): Promise<Wallet[]> {
    const wallet = await this.knex
      .table<Wallet>(Tables.WALLET)
      .where('user_id', user_id);
    if (wallet === undefined) throw new NotFoundException('Wallet not found');
    return wallet;
  }

  async findById(id: number, raiseException = true): Promise<Wallet> {
    const wallet = await this.knex
      .table<Wallet>(Tables.WALLET)
      .where('id', id)
      .first();
    if (wallet === undefined && raiseException) {
      throw new NotFoundException('Wallet not found');
    }
    return wallet;
  }

  async findAll(): Promise<Wallet[]> {
    return this.knex.table<Wallet>(Tables.WALLET);
  }

  async deposit(id: number, amount: number): Promise<Wallet> {
    if (amount > WalletService.MAX_DEPOSIT) {
      throw new BadRequestException(
        `Individual deposits must not exceed ${WalletService.MAX_DEPOSIT}`,
      );
    }

    await this.knex
      .transaction(async (trx) => this._deposit(trx, id, amount))
      .catch((reason) => {
        throw new InternalServerErrorException(
          `Transaction unsuccessful due to ${reason}`,
        );
      });

    return await this.findById(id);
  }

  private async _deposit(
    trx: Knex.Transaction,
    id: number,
    amount: number,
  ): Promise<number> {
    return trx
      .table<Wallet>(Tables.WALLET)
      .where({ id })
      .increment('balance', +amount.toExponential(2));
  }

  async withdraw(user_id: number, id: number, amount: number): Promise<Wallet> {
    const wallet = await this.findById(id);
    this.checkPermission(user_id, wallet);
    if (wallet.balance < amount) {
      throw new BadRequestException('Insufficient funds');
    }

    if (amount > WalletService.MAX_WITHDRAWAL) {
      throw new BadRequestException(
        `Individual withrawals must not exceed ${WalletService.MAX_DEPOSIT}`,
      );
    }

    await this.knex
      .transaction(async (trx) => this._withdraw(trx, id, amount))
      .catch((reason) => {
        throw new InternalServerErrorException(
          `Transaction unsuccessful due to ${reason}`,
        );
      });

    return await this.findById(id);
  }

  private async _withdraw(
    trx: Knex.Transaction,
    id: number,
    amount: number,
  ): Promise<number> {
    return trx
      .table<Wallet>(Tables.WALLET)
      .where({ id })
      .decrement('balance', +amount.toExponential(2));
  }

  async transfer(
    user_id: number,
    from: number,
    to: number,
    amount: number,
  ): Promise<Wallet> {
    const sending_wallet = await this.findById(from);
    this.checkPermission(user_id, sending_wallet);

    if (sending_wallet.balance < amount) {
      throw new BadRequestException('Insufficient funds');
    }

    if (amount > WalletService.MAX_TRANSFER) {
      throw new BadRequestException(
        `Individual transfers must not exceed ${WalletService.MAX_TRANSFER}`,
      );
    }

    const receiving_wallet = await this.findById(to, false);
    if (receiving_wallet === undefined) {
      throw new BadRequestException(
        'Recieving wallet does not exist or is inactive, kindly confirm provided details',
      );
    }

    await this.knex
      .transaction(async (trx) => {
        return await Promise.all([
          this._withdraw(trx, from, amount),
          this._deposit(trx, to, amount),
        ]);
      })
      .catch((reason) => {
        throw new InternalServerErrorException(
          `Transaction unsuccessful due to ${reason}`,
        );
      });
    return this.findById(from);
  }

  checkPermission(user_id: number, wallet: Wallet): void {
    if (user_id !== wallet.user_id) {
      throw new ForbiddenException(
        'You do not have permission to make this deposit',
      );
    }
  }
}

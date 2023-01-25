import { Injectable, NotFoundException } from '@nestjs/common';
import { Tables } from '../../database/enums';
import { Knex } from 'knex';
import { User } from 'knex/types/tables';
import { InjectModel } from 'nest-knexjs';
import { USER_SELECTED_FIELDS } from '../knex';

@Injectable()
export class UserService {
  constructor(@InjectModel() readonly knex: Knex) {}

  async createUser(user: any): Promise<User> {
    const id = (await this.knex.table(Tables.USER).insert(user))[0];
    return this.getById(id);
  }

  async getById(id: number): Promise<User> {
    const user = await this.knex
      .table(Tables.USER)
      .where('id', id)
      .first()
      .select(USER_SELECTED_FIELDS);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async getByEmail(email: string, raiseException = true): Promise<User> {
    const user = await this.knex
      .table(Tables.USER)
      .where('email', email)
      .first()
      .select(USER_SELECTED_FIELDS.concat(['password']));
    if (!user && raiseException) throw new NotFoundException('User not found');
    return user;
  }

  async getAll(): Promise<User[]> {
    return this.knex.table(Tables.USER).select(USER_SELECTED_FIELDS);
  }
}

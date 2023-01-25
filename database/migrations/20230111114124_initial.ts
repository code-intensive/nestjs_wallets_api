import { Tables } from '../../database/enums';
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<Knex.SchemaBuilder> {
  return knex.schema
    .createTable(Tables.USER, (table) => {
      table.bigIncrements('id', { primaryKey: true });
      table.string('first_name', 25).nullable();
      table.string('last_name', 25).nullable();
      table.string('password', 255).notNullable();
      table.string('email', 50).unique().notNullable();
      table.timestamps({
        useTimestamps: true,
        useCamelCase: false,
        defaultToNow: true,
      });
    })
    .createTable(Tables.WALLET, (table) => {
      table.bigIncrements('id', { primaryKey: true });
      table.decimal('balance', 9, 2).notNullable().defaultTo(0);
      table
        .bigInteger('user_id')
        .unsigned()
        .notNullable()
        .references('users.id')
        .onDelete('CASCADE');
      table.timestamps({
        useTimestamps: true,
        useCamelCase: false,
        defaultToNow: true,
      });
    });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(Tables.WALLET).dropTable(Tables.USER);
}

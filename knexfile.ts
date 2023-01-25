import type { Knex } from 'knex';

const migrations = {
  directory: __dirname.concat('/', 'database', '/', 'migrations'),
  tableName: 'knex_migrations',
};
const seeds = { directory: __dirname.concat('/', 'database', '/', 'seeds') };

export const config: { [key: string]: Knex.Config } = {
  development: {
    client: 'mysql2',
    useNullAsDefault: true,
    connection: {
      host: '127.0.0.1',
      user: 'root',
      password: '',
      database: 'wallets',
    },
    seeds,
    migrations,
  },

  staging: {
    client: 'postgresql',
    connection: {
      database: 'my_db',
      user: 'username',
      password: 'password',
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: 'knex_migrations',
    },
  },

  production: {
    client: 'postgresql',
    connection: {
      database: 'my_db',
      user: 'username',
      password: 'password',
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: 'knex_migrations',
    },
  },
};

module.exports = config;

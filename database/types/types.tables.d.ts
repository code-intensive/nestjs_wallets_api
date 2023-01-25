import { Knex } from 'knex';

declare module 'knex/types/tables' {
  interface User {
    id: number;
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    created_at: string;
    updated_at: string;
  }

  interface Wallet {
    id: number;
    user_id: number;
    balance: number;
    created_at: string;
    updated_at: string;
  }

  interface Tables {
    users: User;
    users_composite: Knex.CompositeTableType<
      User,
      Pick<User, 'first_name', 'last_name'> &
        Partial<Pick<User, 'created_at' | 'updated_at'>>,
      Partial<Omit<User, 'id'>>
    >;

    wallets: Wallet;
    wallets_composite: Knex.CompositeTableType<
      Wallet,
      Pick<Wallet, 'id', 'balance'> &
        Partial<Pick<Wallet, 'created_at' | 'updated_at'>>,
      Partial<Omit<Wallet, 'id', 'user_id'>>
    >;
  }
}

import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { WalletModule } from './wallet/wallet.module';
import { UserModule } from './user/user.module';
import { KnexModule } from 'nest-knexjs';

@Module({
  imports: [
    AuthModule,
    UserModule,
    WalletModule,
    ConfigModule.forRoot({ isGlobal: true }),
    KnexModule.forRoot({
      config: {
        client: 'mysql2',
        useNullAsDefault: true,
        connection: {
          host: '127.0.0.1',
          user: 'root',
          password: '',
          database: 'wallets',
        },
      },
    }),
  ],
})
export class AppModule {}

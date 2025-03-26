import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { softDeletePlugin } from 'soft-delete-plugin-mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { RolesModule } from './roles/roles.module';
import { PasswordResetsModule } from './password_resets/password_resets.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([
      // rate limit: cái hiện tại có nghĩa là trong 60s chỉ gọi được 10 request nếu quá sẽ báo lỗi 429
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    MongooseModule.forRootAsync({
      imports: [ConfigModule] as const, // Ép kiểu tránh lỗi
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URL'), // Lấy từ .env
        connectionFactory: (connection) => {
          // Global soft-delete plugin
          connection.plugin(softDeletePlugin);
          return connection;
        },
      }),
      inject: [ConfigService] as const, // Ép kiểu tránh lỗi
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UsersModule,
    AuthModule,
    RolesModule,
    MailModule,
    PasswordResetsModule,
  ] as const, // Ép kiểu tránh lỗi
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

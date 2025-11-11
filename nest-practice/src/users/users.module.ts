import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User, UserSchema } from './schemas/user.schema';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    EventEmitterModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService): JwtModuleOptions => {
        const expiresInSetting = configService.get<string>('JWT_EXPIRES_IN');
        const expiresIn =
          expiresInSetting !== undefined && !Number.isNaN(Number(expiresInSetting))
            ? Number(expiresInSetting)
            : 3600;

        return {
          secret: configService.get<string>('JWT_SECRET') ?? 'secret',
          signOptions: {
            expiresIn,
          },
        };
      },
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService, JwtAuthGuard],
  exports: [JwtModule],
})
export class UsersModule {}

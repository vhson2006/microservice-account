import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import jwtConfig from './config/jwt.config';
import { HashingService } from './hashing/hashing.service';
import { BcryptService } from './hashing/bcrypt.service';
import { AccessTokenGuard } from './authentication/guards/access-token/access-token.guard';
import { AuthenticationGuard } from './authentication/guards/authentication/authentication.guard';
import { RefreshTokenIdsStorage } from './authentication/refresh-token-ids.storage/refresh-token-ids.storage';
import { PermissionsGuard } from './authorization/guards/permission.guard';
import { I18nService } from 'src/globals/i18n/i18n.service';
import { AuthenticationService } from './authentication/authentication.service';
import { AuthenticationController } from './authentication/authentication.controller';
import { BullModule } from '@nestjs/bull';
import { ACCOUNT_SERVICE, ORGANISATION_SERVICE, QUEUE } from 'src/assets/configs/app.constant';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerType } from 'src/entities/customer-type.entity';
import { Customer } from 'src/entities/customer.entity';
import { ValidateTokenType } from 'src/entities/validate-token-type.entity';
import { ValidateToken } from 'src/entities/validate-token.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Customer, CustomerType, ValidateToken, ValidateTokenType]),
    BullModule.registerQueue({
      name: QUEUE.SEND_EMAIL,
    }),
    JwtModule.registerAsync(jwtConfig.asProvider()),
    ConfigModule.forFeature(jwtConfig),
    ClientsModule.register([
      {
        name: ACCOUNT_SERVICE,
        transport: Transport.NATS,
        options: {
          servers: process.env.NATS_URL,
        },
      },
      {
        name: ORGANISATION_SERVICE,
        transport: Transport.NATS,
        options: {
          servers: process.env.NATS_URL,
        },
      },
    ]),
  ],
  providers: [ 
    {
      provide: HashingService,
      useClass: BcryptService,
    },
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
    RefreshTokenIdsStorage,
    AccessTokenGuard,
    AuthenticationService,
    I18nService,
  ],
  controllers: [AuthenticationController],
})
export class IamModule {}

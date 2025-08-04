import { Module } from '@nestjs/common';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerType } from 'src/entities/customer-type.entity';
import { Customer } from 'src/entities/customer.entity';
import { ValidateTokenType } from 'src/entities/validate-token-type.entity';
import { ValidateToken } from 'src/entities/validate-token.entity';
import { NOTIFICATION_SERVICE } from 'src/assets/configs/app.constant';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { I18nService } from 'src/middlewares/globals/i18n/i18n.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Customer, CustomerType, ValidateToken, ValidateTokenType]),
    ClientsModule.register([
      {
        name: NOTIFICATION_SERVICE,
        transport: Transport.NATS,
        options: {
          servers: process.env.NATS_URL,
        },
      },
    ]),
  ],
  controllers: [CustomerController],
  providers: [
    CustomerService, 
    I18nService
  ],
})
export class CustomerModule {}

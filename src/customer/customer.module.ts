import { Module } from '@nestjs/common';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerType } from 'src/entities/customer-type.entity';
import { Customer } from 'src/entities/customer.entity';
import { I18nService } from 'src/globals/i18n/i18n.service';
import { ValidateTokenType } from 'src/entities/validate-token-type.entity';
import { ValidateToken } from 'src/entities/validate-token.entity';
import { NOTIFICATION_SERVICE } from 'src/assets/configs/app.constant';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PublicCustomerController } from './public-customer.controller';
import { PublicCustomerService } from './public-customer.service';

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
  controllers: [CustomerController, PublicCustomerController],
  providers: [
    PublicCustomerService,
    CustomerService, 
    I18nService
  ],
})
export class CustomerModule {}

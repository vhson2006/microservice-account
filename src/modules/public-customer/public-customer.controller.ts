import { Controller, Get, Body, Patch } from '@nestjs/common';
import { UpdateCustomerDto } from 'src/modules/customer/dto/update-customer.dto';
import { PublicCustomerService } from './public-customer.service';
import { ActiveUser } from 'src/middlewares/iam/authentication/decorators/active-user.decorator';
import { Auth } from 'src/middlewares/iam/authentication/decorators/auth.decorator';
import { AuthType } from 'src/middlewares/iam/authentication/enums/auth-type.enum';
import { CUSTOMER_TYPE } from 'src/assets/configs/app.common';
import { Permissions } from 'src/middlewares/iam/authorization/decorators/permission.decoration';

Auth(AuthType.Bearer)
@Controller('public-customer')
export class PublicCustomerController {
  constructor(private readonly publicCustomerService: PublicCustomerService) {}

  @Permissions(CUSTOMER_TYPE.ACTIVED)
  @Get()
  async findOne(@ActiveUser() customer: any) {
    return await this.publicCustomerService.findOne(customer);
  }

  @Permissions(CUSTOMER_TYPE.ACTIVED)
  @Patch()
  async update(
    @ActiveUser() customer: any, 
    @Body() updateCustomerDto: UpdateCustomerDto
  ) {
    const { name, address } = updateCustomerDto
    return await this.publicCustomerService.update({ id: customer.sub, name, address });
  }
}

import { Controller, Get, Body, Patch } from '@nestjs/common';
import { UpdateCustomerDto } from 'src/customer/dto/update-customer.dto';
import { PublicCustomerService } from 'src/customer/public-customer.service';
import { ActiveUser } from 'src/iam/authentication/decorators/active-user.decorator';

@Controller('public-customer')
export class PublicCustomerController {
  constructor(private readonly publicCustomerService: PublicCustomerService) {}

  @Get()
  async findOne(@ActiveUser() customer: any) {
    return await this.publicCustomerService.findOne(customer.sub);
  }

  @Patch()
  async update(
    @ActiveUser() customer: any, 
    @Body() updateCustomerDto: UpdateCustomerDto
  ) {
    const { name, address } = updateCustomerDto
    return await this.publicCustomerService.update({ id: customer.sub, name, address });
  }
}

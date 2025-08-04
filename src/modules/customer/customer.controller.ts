import { Controller, Delete, Get, Patch, Post } from '@nestjs/common';
import { Payload } from '@nestjs/microservices';
import { CreateCustomerDto } from 'src/modules/customer/dto/create-customer.dto';
import { UpdateCustomerDto } from 'src/modules/customer/dto/update-customer.dto';
import { CustomerQueryDto } from 'src/modules/customer/dto/query-customer.dto';
import { CustomerService } from 'src/modules/customer/customer.service';
import { Customer } from 'src/entities/customer.entity';
import { CORRECT } from 'src/assets/configs/app.constant';
import { EntityExistsPipe } from 'src/middlewares/globals/entity-exists.pipe';
import { Auth } from 'src/middlewares/iam/authentication/decorators/auth.decorator';
import { AuthType } from 'src/middlewares/iam/authentication/enums/auth-type.enum';
import { Permissions } from 'src/middlewares/iam/authorization/decorators/permission.decoration';
import { CREATE, DELETE, UPDATE, VIEW } from 'src/assets/configs/app.permission';

Auth(AuthType.Bearer)
@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}
  
  @Permissions(`${CREATE.GROUP}.${VIEW.CUSTOMER}`)
  @Post()
  async create(@Payload() createCustomerDto: CreateCustomerDto) {
    return await this.customerService.create(createCustomerDto);
  }
  
  @Permissions(`${VIEW.GROUP}.${VIEW.CUSTOMER}`)
  @Get()
  async findAll(@Payload() query: CustomerQueryDto) {
    return await this.customerService.findAll(query);
  }

  @Permissions(`${VIEW.GROUP}.${VIEW.CUSTOMER}`)
  @Get(':id')
  async findOne(@Payload('id', EntityExistsPipe(Customer)) customer: Customer) {
    return { 
      status: CORRECT, 
      data: customer
    };
  }
 
  @Permissions(`${UPDATE.GROUP}.${UPDATE.CUSTOMER}`)
  @Patch(':id')
  async update(
    @Payload('id', EntityExistsPipe(Customer)) customer: Customer, 
    @Payload() updateCustomerDto: UpdateCustomerDto
  ) {
    const { id, ...data } = updateCustomerDto
    return await this.customerService.update(customer, data);
  }

  @Permissions(`${DELETE.GROUP}.${DELETE.CUSTOMER}`)
  @Delete(':id')
  async remove(@Payload('id', EntityExistsPipe(Customer)) customer: Customer) {
    return await this.customerService.remove(customer);
  }
}

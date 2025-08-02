import { Controller, Delete, Get, Patch, Post } from '@nestjs/common';
import { Payload } from '@nestjs/microservices';
import { CreateCustomerDto } from 'src/customer/dto/create-customer.dto';
import { UpdateCustomerDto } from 'src/customer/dto/update-customer.dto';
import { CustomerQueryDto } from 'src/customer/dto/query-customer.dto';
import { EntityExistsPipe } from 'src/globals/entity-exists.pipe';
import { CustomerService } from 'src/customer/customer.service';
import { Customer } from 'src/entities/customer.entity';
import { CORRECT } from 'src/assets/configs/app.constant';

@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  async create(@Payload() createCustomerDto: CreateCustomerDto) {
    return await this.customerService.create(createCustomerDto);
  }

  @Get()
  async findAll(@Payload() query: CustomerQueryDto) {
    return {a: 1}
    return await this.customerService.findAll(query);
  }
  
  @Get(':id')
  async findOne(@Payload('id', EntityExistsPipe(Customer)) customer: Customer) {
    return { 
      status: CORRECT, 
      data: customer
    };
  }

  @Patch(':id')
  async update(
    @Payload('id', EntityExistsPipe(Customer)) customer: Customer, 
    @Payload() updateCustomerDto: UpdateCustomerDto
  ) {
    const { id, ...data } = updateCustomerDto
    return await this.customerService.update(customer, data);
  }

  @Delete(':id')
  async remove(@Payload('id', EntityExistsPipe(Customer)) customer: Customer) {
    return await this.customerService.remove(customer);
  }
}

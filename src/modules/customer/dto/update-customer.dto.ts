import { PartialType } from '@nestjs/swagger';
import { CreateCustomerDto } from './create-customer.dto';
import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class UpdateCustomerDto extends PartialType(CreateCustomerDto) {
  @Type(() => String)
  @IsOptional()
  id?: string;
}

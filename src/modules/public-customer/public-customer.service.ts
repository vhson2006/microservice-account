import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { INCORRECT, CORRECT } from 'src/assets/configs/app.constant';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { InjectRepository } from '@nestjs/typeorm';
import { Customer } from 'src/entities/customer.entity';
import { Repository, Not } from 'typeorm';
import { Transactional } from 'typeorm-transactional';
import { UpdateCustomerDto } from 'src/modules/customer/dto/update-customer.dto';
import { I18nService } from 'src/middlewares/globals/i18n/i18n.service';

@Injectable()
export class PublicCustomerService {
  constructor(
    private readonly i18nService: I18nService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: LoggerService,
    @InjectRepository(Customer) private readonly customerRepository: Repository<Customer>,
  ) {}

  async findOne(id: string) {
    try {
      const customer = await this.customerRepository.findOne({
        where: {
          id
        }
      })
      if (customer) {
        return {
          status: CORRECT,
          data: customer
        }
      }
      return {
        status: INCORRECT,
        message: this.i18nService.translate('ERRORS.BAD_REQUEST')
      }
    } catch(e) {
      this.logger.error(`${JSON.stringify(e)}`)
      return {
        status: INCORRECT,
        message: this.i18nService.translate('ERRORS.BAD_REQUEST')
      }
    }
  }
  
  @Transactional()
  async update(params: UpdateCustomerDto) {
    try {
      const { id, phone, ...others } = params
      if (phone) {
        const uniqueCheck = await this.customerRepository.findOne({
          where: {
            phone: phone,
            id: Not(id)
          }
        })
        if (uniqueCheck) {
          return { 
            status: INCORRECT, 
            message: this.i18nService.translate('ERRORS.DUPLICATE')
          };
        }
      }
      
      const response = await this.customerRepository.update(
        id, 
        { ...others, phone }
      );
      if (response.affected > 0) {
        return { status: CORRECT };
      }
      return { 
        status: INCORRECT, 
        message: this.i18nService.translate('ERRORS.UNSUCCESS')
      };
    } catch (e) {
      this.logger.error(`${JSON.stringify(e)}`);
      return {
        status: INCORRECT,
        message: this.i18nService.translate('ERRORS.BAD_REQUEST')
      }
    }
  }
}

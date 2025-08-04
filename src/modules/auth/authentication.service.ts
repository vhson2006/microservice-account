import { 
  BadRequestException, Inject, Injectable, LoggerService, UnauthorizedException 
} from '@nestjs/common';
import { 
  CUSTOMER_TYPE, EMAIL_TYPE, VALIDATION_TOKEN_TYPE 
} from 'src/assets/configs/app.common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { NOTIFICATION_SERVICE, CORRECT, INCORRECT } from 'src/assets/configs/app.constant';
import { ClientProxy } from '@nestjs/microservices';
import { natsRecord } from 'src/assets/utils/nats';
import { InjectRepository } from '@nestjs/typeorm';
import { Customer } from 'src/entities/customer.entity';
import { Repository } from 'typeorm';
import { CustomerType } from 'src/entities/customer-type.entity';
import { ValidateToken } from 'src/entities/validate-token.entity';
import { generateNumber, generateUniqueCode } from 'src/assets/utils/code';
import { ValidateTokenType } from 'src/entities/validate-token-type.entity';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { I18nService } from 'src/middlewares/globals/i18n/i18n.service';
import { HashingService } from 'src/middlewares/iam/hashing/hashing.service';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly i18nService: I18nService,
    @InjectRepository(Customer) private readonly customerRepository: Repository<Customer>,
    @InjectRepository(CustomerType) private readonly customerTypeRepository: Repository<CustomerType>,
    @InjectRepository(ValidateToken) private readonly validateTokenRepository: Repository<ValidateToken>,
    @InjectRepository(ValidateTokenType) private readonly validateTokenTypeRepository: Repository<ValidateTokenType>,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: LoggerService,
    @Inject(NOTIFICATION_SERVICE) private readonly natsMessageBroker: ClientProxy,
    private readonly hashingService: HashingService,
  ) {}

  async signUp(signUpDto: SignUpDto) {
    try {
      const { email, password, ...params } = signUpDto;
      const uniqueCheck = await this.customerRepository.findOne({
        where: { email }
      })
      if (uniqueCheck) {
        return { 
          status: INCORRECT, 
          message: this.i18nService.translate('ERRORS.DUPLICATE')
        };
      }

      const { id: typeId } = await this.customerTypeRepository.findOneBy({ 
        type: CUSTOMER_TYPE.NEW,
        group: CUSTOMER_TYPE.GROUP
      });
      
      const { identifiers } = await this.customerRepository.insert({
        ...params,
        email,
        password: await this.hashingService.hash(password),
        typeId,
      });

      if (Array.isArray(identifiers) && identifiers.length > 0) {
        const { id: validateTokenTypeId } = await this.validateTokenTypeRepository.findOneBy({ 
          type: VALIDATION_TOKEN_TYPE.SECRET_URL,
          group: VALIDATION_TOKEN_TYPE.GROUP
        });
        const code = generateUniqueCode();
        await this.validateTokenRepository.insert({
          identify: email,
          pin: code,
          typeId: validateTokenTypeId
        });
        this.natsMessageBroker.emit(EMAIL_TYPE.ACTIVATION, natsRecord({code, email}));
        return {
          status: CORRECT,
        }
      }

      return {
        status: INCORRECT,
        message: this.i18nService.translate('ERRORS.BAD_REQUEST')
      }
    } catch(e) {
      this.logger.error(`${JSON.stringify(e)}`);
      return {
        status: INCORRECT,
        message: this.i18nService.translate('ERRORS.BAD_REQUEST')
      }
    }
  }

  async signIn(signInDto: SignInDto) {
    try {
      const { id: typeId } = await this.customerTypeRepository.findOneBy({ 
        type: CUSTOMER_TYPE.ACTIVED,
        group: CUSTOMER_TYPE.GROUP
      });
      const customer = await this.customerRepository.findOneBy({
        email: signInDto.email,
        typeId
      });
      if (!customer) {
        return {
          status: INCORRECT,
          message: this.i18nService.translate('ERRORS.USER_NOT_FOUND')
        }
      }
      const isEqual = await this.hashingService.compare(
        signInDto.password,
        customer.password,
      );
      if (!isEqual) {
        return {
          status: INCORRECT,
          message: this.i18nService.translate('ERRORS.PASSWORD_INCORRECT')
        }
      }
      return {
        status: CORRECT,
        data: customer
      }
    } catch(e) {
      this.logger.error(`${JSON.stringify(e)}`);
      return {
        status: INCORRECT,
        message: this.i18nService.translate('ERRORS.BAD_REQUEST')
      }
    }
  }

  async refreshTokens(id: string) {
    try {
      const customer = await this.customerRepository.findOneOrFail({
        relations: { type: true },
        where: {
          type: { type: CUSTOMER_TYPE.ACTIVED },
          id,
        }
      });
      return {
        status: CORRECT,
        data: customer
      }
    } catch (e) {
      this.logger.error(`${JSON.stringify(e)}`);
      return {
        status: INCORRECT,
        message: this.i18nService.translate('ERRORS.BAD_REQUEST')
      }
    }
  }

  async activate(email: string, token: string) {
    try {
      const { id: typeId } = await this.validateTokenTypeRepository.findOneBy({ 
        type: VALIDATION_TOKEN_TYPE.SECRET_URL,
        group: VALIDATION_TOKEN_TYPE.GROUP
      });

      const criteria = {
        identify: email,
        pin: token,
        typeId
      }
      const validate = await this.validateTokenRepository.findOneBy(criteria);
      if (validate) {
        const { id: customerTypeId } = await this.customerTypeRepository.findOneBy({ 
          type: CUSTOMER_TYPE.ACTIVED,
          group: CUSTOMER_TYPE.GROUP
        });
        await this.validateTokenRepository.softDelete(criteria);
        await this.customerRepository.update({ email }, { typeId: customerTypeId });

        return { status: CORRECT }
      }
    } catch(e) {
      this.logger.error(`${JSON.stringify(e)}`);
      return {
        status: INCORRECT,
        message: this.i18nService.translate('ERRORS.BAD_REQUEST')
      }
    }
  }

  async sendOtp(email: string) {
    try {
      const existCheck = await this.customerRepository.findOne({
        where: { email }
      })
      if (existCheck) {
        const { id: validateTokenTypeId } = await this.validateTokenTypeRepository.findOneBy({ 
          type: VALIDATION_TOKEN_TYPE.PIN_OTP,
          group: VALIDATION_TOKEN_TYPE.GROUP
        });
    
        const code = generateNumber();
        const { identifiers } = await this.validateTokenRepository.insert({
          identify: email,
          pin: code,
          typeId: validateTokenTypeId
        });
        if (Array.isArray(identifiers) && identifiers.length > 0) {
          this.natsMessageBroker.emit(EMAIL_TYPE.OTP, natsRecord({ code, email }));
        }
      }
      return { status: CORRECT }
    } catch(e) {
      this.logger.error(`${JSON.stringify(e)}`);
      return {
        status: INCORRECT,
        message: this.i18nService.translate('ERRORS.BAD_REQUEST')
      }
    }
  }

  async resetPassword(pin: string, email: string, password: string) {
     try {
      const { id: validateTokenTypeId } = await this.validateTokenTypeRepository.findOneBy({ 
        type: VALIDATION_TOKEN_TYPE.PIN_OTP,
        group: VALIDATION_TOKEN_TYPE.GROUP
      });

      const criteria = {
        identify: email,
        pin,
        typeId: validateTokenTypeId
      }
      const validate = await this.validateTokenRepository.findOneBy(criteria);
      if (validate) {
        await this.validateTokenRepository.softDelete(criteria);
        const response = await this.customerRepository.update({ email }, { password: await this.hashingService.hash(password) });
        if (response.affected > 0) {
          return { status: CORRECT }; 
        }
      }

      const guardCheck = await this.validateTokenRepository.findOneBy({ identify: email, typeId: validateTokenTypeId });
      if (guardCheck) {
        await this.validateTokenRepository.softDelete({ identify: email, typeId: validateTokenTypeId });
      }

      return { status: INCORRECT }
    } catch(e) {
      this.logger.error(`${JSON.stringify(e)}`);
      return {
        status: INCORRECT,
        message: this.i18nService.translate('ERRORS.BAD_REQUEST')
      }
    }
  }
}
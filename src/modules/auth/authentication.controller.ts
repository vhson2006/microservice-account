import { Controller } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { ActivateAccountDto } from './dto/activate.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Auth } from 'src/middlewares/iam/authentication/decorators/auth.decorator';
import { AuthType } from 'src/middlewares/iam/authentication/enums/auth-type.enum';

Auth(AuthType.None)
@Controller()
export class AuthenticationController {
  constructor(
    private readonly customerAuthService: AuthenticationService
  ) {}

  @MessagePattern('customerSignUp')
  async signUp(@Payload() SignUpDto: SignUpDto) {
    return await this.customerAuthService.signUp(SignUpDto)
  }

  @MessagePattern('customerSignIn')
  async logIn(@Payload() signInDto: SignInDto) {
    return await this.customerAuthService.signIn(signInDto)
  }
  
  @MessagePattern('customerActivate')
  async activateAccount(@Payload() query: ActivateAccountDto) {
    const { token, email } = query;
    return await this.customerAuthService.activate(email, token)
  }

  @MessagePattern('customerForgotPassword')
  async forgotPassword(@Payload() forgotPassword: ForgotPasswordDto) {
    const { email } = forgotPassword
    return this.customerAuthService.sendOtp(email)
  }

  @MessagePattern('customerResetPassword')
  async resetPassword(@Payload() forgotPassword: ResetPasswordDto) {
    const { pin, email, password } = forgotPassword
    return await this.customerAuthService.resetPassword(pin, email, password)
  }

  @MessagePattern('customerRefreshToken')
  refresh(@Payload() refreshTokenDto: string) {
    return this.customerAuthService.refreshTokens(refreshTokenDto);
  }

}
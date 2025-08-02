import { Body, Controller, HttpCode, HttpStatus, Post, Req, Put, Get, Query } from '@nestjs/common';
import { SignInDto } from './dto/sign-in.dto';
import { Request } from 'express';
import { Auth } from './decorators/auth.decorator';
import { AuthType } from './enums/auth-type.enum';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AuthenticationService } from './authentication.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { ActivateAccountDto } from './dto/activate.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Auth(AuthType.None)
@Controller('auth')
export class AuthenticationController {
  constructor(
    private readonly customerAuthService: AuthenticationService
  ) {}

  @HttpCode(HttpStatus.OK)
  @Post('sign-up')
  async signUp(@Req() request: Request, @Body() SignUpDto: SignUpDto) {
    return await this.customerAuthService.signUp(SignUpDto)
  }

  @HttpCode(HttpStatus.OK)
  @Post('sign-in')
  async logIn(@Req() request: Request, @Body() signInDto: SignInDto) {
    return await this.customerAuthService.signIn(signInDto)
  }
  
  @HttpCode(HttpStatus.OK)
  @Get('activate')
  async activateAccount(@Query() query: ActivateAccountDto) {
    const { token, email } = query;
    return await this.customerAuthService.activate(email, token)
  }

  @HttpCode(HttpStatus.OK)
  @Post('forgot-password')
  async forgotPassword(@Req() request: Request, @Body() forgotPassword: ForgotPasswordDto) {
    const { email } = forgotPassword
    return this.customerAuthService.sendOtp(email)
  }

  @HttpCode(HttpStatus.OK)
  @Post('reset-password')
  async resetPassword(@Req() request: Request, @Body() forgotPassword: ResetPasswordDto) {
    const { pin, email, password } = forgotPassword
    return await this.customerAuthService.resetPassword(pin, email, password)
  }

  @HttpCode(HttpStatus.OK) 
  @Put('refresh-tokens')
  refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.customerAuthService.refreshTokens(refreshTokenDto);
  }

}
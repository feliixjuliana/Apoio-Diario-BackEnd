import {Controller,Post,Get,Body,Param, HttpCode, HttpStatus, UseGuards, Request} from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('auth/register')
  register(@Body() body: any) {
    return this.usersService.registerUser(body);
  }

  @Post('auth/login')
  @HttpCode(HttpStatus.OK)
  login(@Body() body: any) {
    return this.usersService.validateUserLogin(body.email, body.password);
  }

  @Post('auth/google')
  @HttpCode(HttpStatus.OK)
  googleLogin(@Body() body: any) {
    return this.usersService.loginWithGoogle(body.googleToken);
  }

  @Post('auth/forgot-password')
  @HttpCode(HttpStatus.OK)
  forgotPassword(@Body() body: any) {
    return this.usersService.sendForgotPasswordEmail(body.email);
  }

  @Post('auth/reset-password')
  @HttpCode(HttpStatus.OK)
  resetPassword(@Body() body: any) {
    return this.usersService.resetPassword(body.email, body.password);
  }

  @Post('auth/validate-reset-token')
  async validateResetToken(
    @Body('email') email: string,
    @Body('code') code: string,
  ) {
    return this.usersService.validateResetToken(email, code);
  }

  @UseGuards(AuthGuard)
  @Post('auth/validate-pin')
  @HttpCode(HttpStatus.OK)
  async validatePin(@Request() req, @Body('pin') pin: number) {
    return this.usersService.validatePin(req.user.id, pin);
  }

  @UseGuards(AuthGuard)
  @Get('users')
  findAll() {
    return this.usersService.getAllUsers();
  }

  @UseGuards(AuthGuard)
  @Get('users/:id')
  findOne(@Param('id') id: string) {
    return this.usersService.getUserById(id);
  }
}

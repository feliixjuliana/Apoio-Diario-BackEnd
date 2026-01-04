import { Controller, Post, Get, Body, Param, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
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
    return this.usersService.resetPassword(body.email, body.code, body.password);
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
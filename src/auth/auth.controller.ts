import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { AuthGuard } from './guards/auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('login')
  async login(@Body() loginFields: LoginDto) {
    return this.authService.login(loginFields)
  }

  @Post('register')
  async register(@Body() registerFields: CreateUserDto) {
    return this.authService.register(registerFields)
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('profile')
  async profile(@Request() req: any) {
    return this.authService.profile(req.user.id)
  }

}

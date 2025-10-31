import { Body, Controller, Post } from '@nestjs/common';
import {
  LoginDto,
  RegisterUserDto,
  AuthResponseDto,
} from 'src/common/dtos/auth';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  @Post('register')
  async register(
    @Body() registerDto: RegisterUserDto,
  ): Promise<AuthResponseDto> {
    return this.authService.register(registerDto);
  }
}

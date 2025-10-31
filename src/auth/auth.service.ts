import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { plainToClass } from 'class-transformer';
import { LoginDto, RegisterUserDto } from 'src/common/dtos/auth';
import { AuthResponseDto } from 'src/common/dtos/auth/auth-response.dto';
import { UsersService } from 'src/users/users.service';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class AuthService {
  private readonly logger = new Logger('AuthService');

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Authenticates a user with email and password
   * @param loginDto - Login credentials
   * @returns JWT token and user information
   */
  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    try {
      const { email, password } = loginDto;

      const isValidPassword = await this.usersService.validateUserPassword(
        email,
        password,
      );

      if (!isValidPassword) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const user = await this.usersService.findOneByEmail(email);

      const payload = { sub: user!.id, email: user!.email };
      const access_token = this.getJwtToken(payload);

      return plainToClass(AuthResponseDto, {
        ...user,
        access_token,
      });
    } catch (error) {
      this.logger.error(error);
      if (error instanceof ConflictException) throw error;
      throw new InternalServerErrorException('Invalid credentials');
    }
  }

  /**
   * Registers a new user
   * @param registerDto - User registration data
   * @returns JWT token and user information
   */
  async register(registerDto: RegisterUserDto): Promise<AuthResponseDto> {
    try {
      const user = await this.usersService.create(registerDto);

      const payload = { sub: user!.id, email: user!.email };

      const access_token = this.getJwtToken(payload);

      return plainToClass(AuthResponseDto, {
        ...user,
        access_token,
      });
    } catch (error) {
      this.logger.error(error);
      if (error instanceof ConflictException) throw error;
      throw new ConflictException('Register failed');
    }
  }

  /**
   * Get the JWT token
   * @param payload - The payload to sign
   * @returns The JWT token
   */
  private getJwtToken(payload: JwtPayload) {
    return this.jwtService.sign(payload);
  }
}

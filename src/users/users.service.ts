import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { RegisterUserDto } from 'src/common/dtos/auth/register.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  private defaultLimit: number;
  private offset: number;

  private readonly logger = new Logger('UserService');

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    private readonly configService: ConfigService,
  ) {
    this.defaultLimit = configService.get<number>('DEFAULT_LIMIT')!;
    this.offset = configService.get<number>('OFFSET')!;
  }

  async create(registerUserDto: RegisterUserDto) {
    const { email, username } = registerUserDto;

    const existEmail = await this.userRepo.findOneBy({
      email: email,
    });

    if (existEmail) throw new ConflictException(`Email already in use`);

    const existUsername = await this.userRepo.findOneBy({
      username: username,
    });

    if (existUsername) throw new ConflictException(`Username already in use`);

    try {
      const user = this.userRepo.create(registerUserDto);
      await this.userRepo.save(user);
      return user;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('Check server logs');
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = this.defaultLimit, offset = this.offset } = paginationDto;

    return this.userRepo.find({
      where: { isActive: true },
      take: limit,
      skip: offset,
    });
  }

  async findOne(id: string) {
    const user = await this.validateUser(id);
    return user;
  }

  async findOneByEmail(email: string) {
    const user = await this.userRepo.findOneBy({ email, isActive: true });

    if (!user) throw new ConflictException(`User not found`);

    return user;
  }

  async findOneByUsername(username: string) {
    const user = await this.userRepo.findOneBy({ username, isActive: true });
    if (!user) throw new ConflictException(`User not found`);

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    if (!Object.keys(updateUserDto).length)
      throw new BadRequestException('No fields provided for update');

    const user = await this.validateUser(id);

    delete updateUserDto.email;
    delete updateUserDto.username;
    delete updateUserDto.password; // handle this separately

    Object.assign(user, updateUserDto);

    const updatedUser = await this.userRepo.preload({
      id,
      ...updateUserDto,
    });

    try {
      await this.userRepo.save(updatedUser!);

      return updatedUser;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('Check server logs');
    }
  }

  async remove(id: string) {
    const user = await this.validateUser(id);

    user.isActive = false;

    try {
      await this.userRepo.save(user);
      return { message: `User successfully deactivated` };
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('Check server logs');
    }
  }

  async validateUserPassword(email: string, password: string) {
    const user = await this.userRepo.findOneBy({
      email,
      isActive: true,
    });

    // We validate the user password with the user entity method
    if (user && (await user.validatePassword(password))) return true;

    return null;
  }

  /**
   * Validates if a user exists and returns it
   * @param userId - The user ID to validate
   * @returns The user entity
   * @throws NotFoundException if user doesn't exist
   */
  private async validateUser(userId: string): Promise<User> {
    const user = await this.userRepo.findOneBy({ id: userId, isActive: true });

    if (!user) {
      throw new NotFoundException(`User not found or is not active`);
    }

    return user;
  }
}

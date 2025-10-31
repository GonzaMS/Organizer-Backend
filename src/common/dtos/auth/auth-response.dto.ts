import { Exclude, Expose } from 'class-transformer';

export class AuthResponseDto {
  @Expose()
  id: string;

  @Expose()
  email: string;

  @Expose()
  username: string;

  @Expose()
  firstName?: string;

  @Expose()
  lastName?: string;

  @Expose()
  isActive: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  access_token: string;

  @Exclude()
  password?: string;
}

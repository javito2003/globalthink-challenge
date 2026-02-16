import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { IsEmail, IsString, Length } from 'class-validator';
import {
  MAX_USER_PASSWORD_LENGTH,
  MIN_USER_PASSWORD_LENGTH,
} from 'src/modules/users/domain/entities/user.entity';
import { UserProfileDto } from 'src/modules/users/presentation/dtos/data/user-profile.dto';

class RegisterData {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: `User password (${MIN_USER_PASSWORD_LENGTH}-${MAX_USER_PASSWORD_LENGTH} characters)`,
    example: 'SecurePass123',
    minLength: MIN_USER_PASSWORD_LENGTH,
    maxLength: MAX_USER_PASSWORD_LENGTH,
  })
  @IsString()
  @Length(MIN_USER_PASSWORD_LENGTH, MAX_USER_PASSWORD_LENGTH)
  password: string;
}

export class RegisterDto extends IntersectionType(
  RegisterData,
  UserProfileDto,
) {}

import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'User password (6-20 characters)',
    example: 'SecurePass123',
    minLength: 6,
    maxLength: 20,
  })
  @IsString()
  @Length(6, 20)
  password: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class UserProfileResponseDto {
  @Expose()
  @ApiProperty({
    description: 'User first name',
    example: 'John',
  })
  firstName: string;

  @Expose()
  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
  })
  lastName: string;

  @Expose()
  @ApiProperty({
    description: 'User birth date ISO string',
    example: '1990-01-01T00:00:00.000Z',
  })
  birthDate: Date;

  @Expose()
  @ApiProperty({
    description: 'User biography',
    example: 'Software developer with 10 years of experience.',
    required: false,
  })
  bio?: string;

  constructor(partial: Partial<UserProfileResponseDto>) {
    Object.assign(this, partial);
  }
}

@Exclude()
export class UserResponseDto {
  @Expose()
  @ApiProperty({
    description: 'User ID',
    example: '507f1f77bcf86cd799439011',
  })
  id: string;

  @Expose()
  @ApiProperty({
    description: 'User profile data',
    type: UserProfileResponseDto,
  })
  profile: UserProfileResponseDto | null;

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}

import { ApiProperty, IntersectionType, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { UserProfileDto } from './data/user-profile.dto';

class UpdateUserProfile {
  @ApiProperty({
    description: 'User bio',
    example: 'Software developer with a passion for open source.',
    required: false,
  })
  @IsOptional()
  @IsString()
  bio?: string;
}

export class UpdateUserProfileDto extends IntersectionType(
  UpdateUserProfile,
  PartialType(UserProfileDto),
) {}

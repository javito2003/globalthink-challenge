import { IsMongoId, IsString } from 'class-validator';

export class UserIdDto {
  @IsString()
  @IsMongoId()
  userId: string;
}

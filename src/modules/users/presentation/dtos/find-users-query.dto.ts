import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from 'src/modules/shared/infrastructure/dtos/pagination-query.dto';

export class FindUsersQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Search by first name or last name (case-insensitive)',
    example: 'john',
  })
  @IsOptional()
  @IsString()
  search?: string;
}

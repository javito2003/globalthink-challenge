import { applyDecorators, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { AUTH_EXCEPTIONS } from '../../../auth/domain/exceptions';
import { buildErrorDomainResponse } from '../../presentation/api/build-error-response.properties';

export function Auth() {
  return applyDecorators(
    UseGuards(JwtAuthGuard),
    ApiBearerAuth('JWT-auth'),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Unauthorized - invalid or missing token',
      schema: {
        example: buildErrorDomainResponse(AUTH_EXCEPTIONS.INVALID_ACCESS_TOKEN),
      },
    }),
  );
}

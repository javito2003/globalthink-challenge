import { HttpStatus } from '@nestjs/common';
import { ApiResponseOptions } from '@nestjs/swagger';
import {
  buildErrorDomainResponse,
  buildErrorValidationResponseProperties,
} from 'src/modules/shared/presentation/api/build-error-response.properties';
import { TokenPairDto, LogoutResponseDto } from '../dto/auth-response.dto';
import { AUTH_EXCEPTIONS } from '../../domain/exceptions/auth.exceptions';

// ==================== Login Responses ====================
export const LoginSuccessResponse: ApiResponseOptions = {
  status: HttpStatus.OK,
  description: 'Successfully authenticated',
  type: TokenPairDto,
};

export const LoginInvalidCredentialsResponse: ApiResponseOptions = {
  status: HttpStatus.UNAUTHORIZED,
  description: 'Invalid credentials',
  schema: {
    example: buildErrorDomainResponse(AUTH_EXCEPTIONS.INVALID_CREDENTIALS),
  },
};

export const LoginInvalidEmailResponse: ApiResponseOptions = {
  status: HttpStatus.BAD_REQUEST,
  description: 'Invalid email address',
  schema: {
    example: buildErrorValidationResponseProperties([
      {
        message: 'email must be an email',
        field: 'email',
      },
    ]),
  },
};

export const LoginInvalidPasswordResponse: ApiResponseOptions = {
  status: HttpStatus.BAD_REQUEST,
  description: 'Invalid password',
  schema: {
    example: buildErrorValidationResponseProperties([
      {
        message: 'password must be between 6 and 20 characters',
        field: 'password',
      },
    ]),
  },
};

// ==================== Refresh Responses ====================
export const RefreshSuccessResponse: ApiResponseOptions = {
  status: HttpStatus.OK,
  description: 'Tokens refreshed successfully',
  type: TokenPairDto,
};

export const RefreshInvalidTokenResponse: ApiResponseOptions = {
  status: HttpStatus.UNAUTHORIZED,
  description: 'Invalid or expired refresh token',
  schema: {
    example: buildErrorDomainResponse(AUTH_EXCEPTIONS.INVALID_REFRESH_TOKEN),
  },
};

// ==================== Logout Responses ====================
export const LogoutSuccessResponse: ApiResponseOptions = {
  status: HttpStatus.OK,
  description: 'Successfully logged out',
  type: LogoutResponseDto,
};

// ==================== Register Responses ====================
export const RegisterSuccessResponse: ApiResponseOptions = {
  status: HttpStatus.CREATED,
  description: 'User registered successfully',
  type: TokenPairDto,
};

export const RegisterValidationErrorResponse: ApiResponseOptions = {
  status: HttpStatus.BAD_REQUEST,
  description: 'Bad request - validation error',
  schema: {
    example: buildErrorValidationResponseProperties([
      {
        message: 'email must be an email',
        field: 'email',
      },
      {
        message: 'firstName must be at least 2 characters',
        field: 'firstName',
      },
    ]),
  },
};

export const RegisterEmailInUseResponse: ApiResponseOptions = {
  status: HttpStatus.CONFLICT,
  description: 'Email already in use',
  schema: {
    example: buildErrorDomainResponse(AUTH_EXCEPTIONS.EMAIL_ALREADY_IN_USE),
  },
};

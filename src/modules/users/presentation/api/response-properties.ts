import { HttpStatus } from '@nestjs/common';
import { ApiResponseOptions } from '@nestjs/swagger';
import { buildErrorDomainResponse } from 'src/modules/shared/presentation/api/build-error-response.properties';
import { USER_EXCEPTIONS } from '../../domain/exceptions/user.exceptions';
import { PROFILE_EXCEPTIONS } from '../../domain/exceptions/profile.exceptions';

export const UserNotFoundResponse: ApiResponseOptions = {
  status: HttpStatus.NOT_FOUND,
  description: 'User not found',
  schema: {
    example: buildErrorDomainResponse(USER_EXCEPTIONS.USER_NOT_FOUND),
  },
};

export const UserNotAllowedToEditResponse: ApiResponseOptions = {
  status: HttpStatus.FORBIDDEN,
  description:
    'Forbidden - user does not have permission to perform this action',
  schema: {
    example: buildErrorDomainResponse(
      PROFILE_EXCEPTIONS.USER_NOT_ALLOWED_TO_EDIT_PROFILE,
    ),
  },
};

export const UserProfileNotFoundResponse: ApiResponseOptions = {
  status: HttpStatus.NOT_FOUND,
  description: 'User profile not found',
  schema: {
    example: buildErrorDomainResponse(PROFILE_EXCEPTIONS.PROFILE_NOT_FOUND),
  },
};

export const UserNotAllowedToDeleteResponse: ApiResponseOptions = {
  status: HttpStatus.FORBIDDEN,
  description:
    'Forbidden - user does not have permission to perform this action',
  schema: {
    example: buildErrorDomainResponse(
      USER_EXCEPTIONS.USER_NOT_ALLOWED_TO_DELETE,
    ),
  },
};

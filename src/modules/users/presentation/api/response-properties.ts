import { HttpStatus } from '@nestjs/common';
import { ApiResponseOptions } from '@nestjs/swagger';

export const UserNotFoundResponse: ApiResponseOptions = {
  status: HttpStatus.NOT_FOUND,
  description: 'User not found',
};

export const UserNotAllowedResponse: ApiResponseOptions = {
  status: HttpStatus.FORBIDDEN,
  description:
    'Forbidden - user does not have permission to perform this action',
};

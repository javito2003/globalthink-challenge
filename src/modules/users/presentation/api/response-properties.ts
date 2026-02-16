import { HttpStatus } from '@nestjs/common';
import { ApiResponseOptions } from '@nestjs/swagger';
import { buildErrorDomainResponse } from 'src/modules/shared/presentation/api/build-error-response.properties';
import { USER_EXCEPTIONS } from '../../domain/exceptions/user.exceptions';
import { UserResponseDto } from '../dtos/user-response.dto';

// Get Users
export const GetUsersResponse: ApiResponseOptions = {
  status: HttpStatus.OK,
  description: 'List of users retrieved successfully',
  type: [UserResponseDto],
};

// Get user by ID
export const GetUserByIdResponse: ApiResponseOptions = {
  status: HttpStatus.OK,
  description: 'User found successfully',
  type: UserResponseDto,
};

// Edit User by ID
export const EditUserByIdResponse: ApiResponseOptions = {
  status: HttpStatus.OK,
  description: 'User updated successfully',
  type: UserResponseDto,
};

export const UserNotAllowedToEditResponse: ApiResponseOptions = {
  status: HttpStatus.FORBIDDEN,
  description:
    'Forbidden - user does not have permission to perform this action',
  schema: {
    example: buildErrorDomainResponse(
      USER_EXCEPTIONS.USER_NOT_ALLOWED_TO_EDIT_PROFILE,
    ),
  },
};

// Delete User by ID
export const DeleteUserByIdResponse: ApiResponseOptions = {
  status: HttpStatus.OK,
  description: 'User deleted successfully',
  schema: {
    example: { message: 'User deleted successfully' },
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

// COMMON
export const UserNotFoundResponse: ApiResponseOptions = {
  status: HttpStatus.NOT_FOUND,
  description: 'User not found',
  schema: {
    example: buildErrorDomainResponse(USER_EXCEPTIONS.USER_NOT_FOUND),
  },
};

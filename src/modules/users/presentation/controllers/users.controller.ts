import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { FindUserByIdUseCase } from '../../application/use-cases/find-user-by-id.use-case';
import { UpdateUserProfileByIdUseCase } from '../../application/use-cases/update-user-profile-by-id.use-case';
import { UserIdDto } from '../dtos/data/user-id.dto';
import { FindUsersUseCase } from '../../application/use-cases/find-users.use-case';
import { UserResponseDto } from '../dtos/user-response.dto';
import {
  EditUserByIdResponse,
  GetUserByIdResponse,
  GetUsersResponse,
  UserNotAllowedToDeleteResponse,
  UserNotAllowedToEditResponse,
  UserNotFoundResponse,
} from '../api/response-properties';
import { UpdateUserProfileDto } from '../dtos/update-user-profile.dto';
import { UserId } from 'src/modules/shared/infrastructure/decorators/user-id.decorator';
import { Auth } from 'src/modules/shared/infrastructure/decorators/auth.decorator';
import { UserIdProperty } from '../api/request-properties';
import { DeleteUserByIdUseCase } from '../../application/use-cases/delete-user-by-id.use-case';

@ApiTags('users')
@Controller('users')
@Auth()
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  constructor(
    private readonly findUserByIdUseCase: FindUserByIdUseCase,
    private readonly findUsersUseCase: FindUsersUseCase,
    private readonly updateUserProfileByIdUseCase: UpdateUserProfileByIdUseCase,
    private readonly deleteUserByIdUseCase: DeleteUserByIdUseCase,
  ) {}

  @Get('')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all users',
    description: 'Retrieve a list of all users with their profiles',
  })
  @ApiResponse(GetUsersResponse)
  async getAllUsers() {
    const { users, count } = await this.findUsersUseCase.execute();
    return { users: users.map((user) => new UserResponseDto(user)), count };
  }

  @Get(':userId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get user by ID',
    description: 'Retrieve a specific user by their ID',
  })
  @ApiParam(UserIdProperty)
  @ApiResponse(GetUserByIdResponse)
  @ApiResponse(UserNotFoundResponse)
  async getUserById(@Param() param: UserIdDto) {
    const userFound = await this.findUserByIdUseCase.execute(param.userId);

    return new UserResponseDto(userFound);
  }

  @Put(':userId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update user',
    description: 'Update user information and profile',
  })
  @ApiParam(UserIdProperty)
  @ApiBody({ type: UpdateUserProfileDto })
  @ApiResponse(EditUserByIdResponse)
  @ApiResponse(UserNotFoundResponse)
  @ApiResponse(UserNotAllowedToEditResponse)
  updateUser(
    @Param() param: UserIdDto,
    @Body() updateData: UpdateUserProfileDto,
    @UserId() authenticatedUserId: string,
  ) {
    return this.updateUserProfileByIdUseCase.execute(
      param.userId,
      authenticatedUserId,
      {
        bio: updateData.bio,
        firstName: updateData.firstName,
        lastName: updateData.lastName,
        ...(updateData.birthDate && {
          birthDate: new Date(updateData.birthDate),
        }),
      },
    );
  }

  @Delete(':userId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete user',
    description: 'Delete a user account',
  })
  @ApiParam(UserIdProperty)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User deleted successfully',
  })
  @ApiResponse(UserNotFoundResponse)
  @ApiResponse(UserNotAllowedToDeleteResponse)
  async deleteUser(
    @Param() param: UserIdDto,
    @UserId() authenticatedUserId: string,
  ) {
    await this.deleteUserByIdUseCase.execute(param.userId, authenticatedUserId);
  }
}

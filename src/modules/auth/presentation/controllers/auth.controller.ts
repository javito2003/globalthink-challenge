import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { RefreshTokenUseCase } from '../../application/use-cases/refresh-token.use-case';
import { LogoutUseCase } from '../../application/use-cases/logout.use-case';
import { JwtRefreshGuard } from '../../infrastructure/guards/jwt-refresh.guard';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { RegisterUseCase } from '../../application/use-cases/register.use-case';
import { UserId } from 'src/modules/shared/infrastructure/decorators/user-id.decorator';
import { Auth } from 'src/modules/shared/infrastructure/decorators/auth.decorator';
import {
  LoginSuccessResponse,
  LoginInvalidCredentialsResponse,
  LoginInvalidEmailResponse,
  LoginInvalidPasswordResponse,
  RefreshSuccessResponse,
  RefreshInvalidTokenResponse,
  LogoutSuccessResponse,
  RegisterSuccessResponse,
  RegisterValidationErrorResponse,
  RegisterEmailInUseResponse,
} from '../api/response-properties';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly registerUseCase: RegisterUseCase,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'User login',
    description:
      'Authenticate user with email and password, returns access and refresh tokens',
  })
  @ApiResponse(LoginSuccessResponse)
  @ApiResponse(LoginInvalidCredentialsResponse)
  @ApiResponse(LoginInvalidEmailResponse)
  @ApiResponse(LoginInvalidPasswordResponse)
  async login(@Body() loginDto: LoginDto) {
    return this.loginUseCase.execute(loginDto.email, loginDto.password);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtRefreshGuard)
  @ApiBearerAuth('JWT-refresh')
  @ApiOperation({
    summary: 'Refresh access token',
    description:
      'Get new access and refresh tokens using a valid refresh token',
  })
  @ApiResponse(RefreshSuccessResponse)
  @ApiResponse(RefreshInvalidTokenResponse)
  async refresh(@Request() req: any) {
    const { sub, refreshToken } = (req as { user: any }).user as {
      sub: string;
      refreshToken: string;
    };
    return this.refreshTokenUseCase.execute(sub, refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @Auth()
  @ApiOperation({
    summary: 'User logout',
    description: 'Invalidate refresh token and logout user',
  })
  @ApiResponse(LogoutSuccessResponse)
  async logout(@UserId() userId: string) {
    await this.logoutUseCase.execute(userId);
    return { message: 'Logged out successfully' };
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register new user',
    description: 'Create a new user account',
  })
  @ApiResponse(RegisterSuccessResponse)
  @ApiResponse(RegisterValidationErrorResponse)
  @ApiResponse(RegisterEmailInUseResponse)
  register(@Body() registerDto: RegisterDto) {
    return this.registerUseCase.execute({
      birthDate: new Date(registerDto.birthDate),
      email: registerDto.email,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      password: registerDto.password,
    });
  }
}

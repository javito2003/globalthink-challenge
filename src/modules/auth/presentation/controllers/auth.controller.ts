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
import { JwtAuthGuard } from '../../infrastructure/guards/jwt-auth.guard';
import { JwtRefreshGuard } from '../../infrastructure/guards/jwt-refresh.guard';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { TokenPairDto, LogoutResponseDto } from '../dto/auth-response.dto';
import { RegisterUseCase } from '../../application/use-cases/register.use-case';

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
  @ApiResponse({
    status: 200,
    description: 'Successfully authenticated',
    type: TokenPairDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation error',
  })
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
  @ApiResponse({
    status: 200,
    description: 'Tokens refreshed successfully',
    type: TokenPairDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or expired refresh token',
  })
  async refresh(@Request() req: any) {
    const { sub, refreshToken } = req.user as {
      sub: string;
      refreshToken: string;
    };
    return this.refreshTokenUseCase.execute(sub, refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'User logout',
    description: 'Invalidate refresh token and logout user',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully logged out',
    type: LogoutResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
  })
  async logout(@Request() req: any) {
    await this.logoutUseCase.execute(req.user.sub as string);
    return { message: 'Logged out successfully' };
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register new user',
    description: 'Create a new user account',
  })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
    type: TokenPairDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation error',
  })
  @ApiResponse({
    status: 409,
    description: 'Email already in use',
  })
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

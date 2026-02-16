import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { RefreshTokenUseCase } from '../../application/use-cases/refresh-token.use-case';
import { LogoutUseCase } from '../../application/use-cases/logout.use-case';
import { JwtAuthGuard } from '../../infrastructure/guards/jwt-auth.guard';
import { JwtRefreshGuard } from '../../infrastructure/guards/jwt-refresh.guard';

class LoginDto {
  email: string;
  password: string;
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly logoutUseCase: LogoutUseCase,
  ) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.loginUseCase.execute(loginDto.email, loginDto.password);
  }

  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  async refresh(@Request() req) {
    const { sub, refreshToken } = req.user;
    return this.refreshTokenUseCase.execute(sub, refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Request() req) {
    await this.logoutUseCase.execute(req.user.sub);
    return { message: 'Logged out successfully' };
  }

  @Post('register')
  async register() {
    // Implement registration logic here
  }
}

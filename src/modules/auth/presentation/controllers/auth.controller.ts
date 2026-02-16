import { Controller, Post } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  @Post('login')
  async login() {
    // Implement login logic here
  }

  @Post('register')
  async register() {
    // Implement registration logic here
  }
}

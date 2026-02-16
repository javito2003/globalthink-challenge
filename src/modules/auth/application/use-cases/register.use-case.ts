import { Inject, Injectable } from '@nestjs/common';
import { UserRepository } from 'src/modules/users/infrastructure/persistence/repositories/user.repository';
import { BCRYPT_SERVICE_NAME } from '../../infrastructure/services/bcrypt-hasher.service';
import type { IPasswordHasherService } from '../../domain/services/password-hasher.service.interface';
import { TOKEN_SERVICE_NAME } from '../../infrastructure/services/jwt-token.service';
import type { ITokenService } from '../../domain/services/token.service.inteface';
import type { IProfileRepository } from 'src/modules/users/domain/repositories/profile.repository.interface';
import { ITokenPair } from '../../domain/services/token.service.interface';
import { EmailAlreadyInUseException } from '../../domain/exceptions/email-already-in-use.exception';

export interface RegisterUseCaseInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  birthDate: Date;
}

@Injectable()
export class RegisterUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly profileRepository: IProfileRepository,
    @Inject(BCRYPT_SERVICE_NAME)
    private readonly passwordHasherService: IPasswordHasherService,
    @Inject(TOKEN_SERVICE_NAME)
    private readonly tokenService: ITokenService,
  ) {}

  async execute(input: RegisterUseCaseInput): Promise<ITokenPair> {
    const existentUser = await this.userRepository.findByEmail(input.email);
    if (existentUser) {
      throw new EmailAlreadyInUseException();
    }

    const hashedPassword = await this.passwordHasherService.hash(
      input.password,
    );

    const createdUser = await this.userRepository.create({
      email: input.email,
      password: hashedPassword,
    });

    await this.profileRepository.create({
      userId: createdUser.id,
      firstName: input.firstName,
      lastName: input.lastName,
      birthDate: input.birthDate,
    });

    const { accessToken, refreshToken } =
      await this.tokenService.generateTokenPair({
        sub: createdUser.id,
        email: createdUser.email,
      });

    return {
      accessToken,
      refreshToken,
    };
  }
}

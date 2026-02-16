import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DomainExceptionFilter } from './modules/shared/infrastructure/filters/domain-exception.filter';
import { ValidationExceptionFilter } from './modules/shared/infrastructure/filters/validation-exception.filter';

export function setupApp(app: INestApplication): INestApplication {
  app.enableCors();

  app.useGlobalFilters(
    new DomainExceptionFilter(),
    new ValidationExceptionFilter(),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  return app;
}

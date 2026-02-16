import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const exceptionResponse: any = exception.getResponse();

    // Extract validation errors from NestJS format
    const errors = Array.isArray(exceptionResponse.message)
      ? exceptionResponse.message.map((msg: string) => {
          // Parse field from message like "email must be an email"
          const field = msg.split(' ')[0];
          return {
            message: msg,
            code: 'VALIDATION_ERROR',
            field,
          };
        })
      : [
          {
            message: exceptionResponse.message || 'Validation failed',
            code: 'VALIDATION_ERROR',
          },
        ];

    response.status(400).json({
      statusCode: 400,
      message: 'Validation failed',
      errors,
    });
  }
}

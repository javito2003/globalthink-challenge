import { createParamDecorator } from '@nestjs/common';
import { Request } from 'express';

export const UserId = createParamDecorator(
  (data: unknown, ctx): string | undefined => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request.user?.['sub'];
  },
);

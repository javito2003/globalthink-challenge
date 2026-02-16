export class ErrorDetail {
  message: string;
  code: string;
  field?: string;
}

export class ErrorResponseDto {
  statusCode: number;
  message: string;
  errors: ErrorDetail[];
}

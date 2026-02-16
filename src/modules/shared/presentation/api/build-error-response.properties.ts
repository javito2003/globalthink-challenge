export interface ErrorResponseProperties {
  message: string;
  errors: ErrorResponse[];
}

interface ErrorResponse {
  message: string;
  code?: string;
  field?: string;
}

type ErrorValidation = Pick<ErrorResponse, 'message' | 'field'>;

const buildErrorResponseProperties = (
  errorMessage: string,
  errors: ErrorResponse[],
) => {
  return {
    message: errorMessage,
    errors: errors.map((error) => ({
      message: error.message,
      field: error.field,
      code: error.code,
    })),
  };
};

export const buildErrorValidationResponseProperties = (
  errors: ErrorValidation[],
) => {
  return buildErrorResponseProperties(
    'Validation failed',
    errors.map((error) => ({
      message: error.message,
      field: error.field,
      code: 'VALIDATION_ERROR',
    })),
  );
};

export const buildErrorDomainResponse = (errorDomain: ErrorResponse) =>
  buildErrorResponseProperties(errorDomain.message, [errorDomain]);

interface ErrorResponseProperties {
  message: string;
  code?: string;
  field?: string;
}

type ErrorValidation = Pick<ErrorResponseProperties, 'message' | 'field'>;

const buildErrorResponseProperties = (
  errorMessage: string,
  errors: ErrorResponseProperties[],
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

export const buildErrorDomainResponse = (
  errorDomain: ErrorResponseProperties,
) => buildErrorResponseProperties(errorDomain.message, [errorDomain]);

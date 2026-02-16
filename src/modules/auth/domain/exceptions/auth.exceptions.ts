export const AUTH_EXCEPTIONS = {
  INVALID_CREDENTIALS: {
    message: 'Invalid credentials',
    statusCode: 401,
    code: 'INVALID_CREDENTIALS',
  },
  INVALID_REFRESH_TOKEN: {
    message: 'Invalid refresh token',
    statusCode: 401,
    code: 'INVALID_REFRESH_TOKEN',
  },
  INVALID_ACCESS_TOKEN: {
    message: 'Invalid or expired access token',
    statusCode: 401,
    code: 'INVALID_ACCESS_TOKEN',
  },
  EMAIL_ALREADY_IN_USE: {
    message: 'Email is already in use',
    statusCode: 409,
    code: 'EMAIL_ALREADY_IN_USE',
  },
};

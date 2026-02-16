export const USER_EXCEPTIONS = {
  USER_NOT_FOUND: {
    message: 'User not found',
    statusCode: 404,
    code: 'USER_NOT_FOUND',
  },
  USER_NOT_ALLOWED_TO_DELETE: {
    message: 'User is not allowed to delete this resource',
    statusCode: 403,
    code: 'USER_NOT_ALLOWED_TO_DELETE',
  },
  USER_NOT_ALLOWED_TO_EDIT_PROFILE: {
    message: 'User is not allowed to edit this profile',
    statusCode: 403,
    code: 'USER_NOT_ALLOWED_TO_EDIT_PROFILE',
  },
};

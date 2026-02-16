export interface IUserValidatorService {
  /**
   * Validates if a user exists in the system
   * @param userId - The ID of the user to validate
   * @returns true if the user exists, false otherwise
   */
  userExists(userId: string): Promise<boolean>;

  /**
   * Validates if a user exists and has the specified refresh token
   * @param userId - The ID of the user to validate
   * @param refreshToken - The refresh token to validate
   * @returns true if the user exists and has the token, false otherwise
   */
  validateUserRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<boolean>;
}

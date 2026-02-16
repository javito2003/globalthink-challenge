export interface ITokenPayload {
  sub: string;
  email: string;
}

export interface ITokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface ITokenService {
  generateTokenPair(payload: ITokenPayload): Promise<ITokenPair>;
  verifyAccessToken(token: string): Promise<ITokenPayload>;
  verifyRefreshToken(token: string): Promise<ITokenPayload>;
}

export type AuthTokens = { accessToken: string; refreshToken: string };

export type LoginReq = { email: string; password: string };

// Register chuẩn
export type RegisterReq = {
  fullName: string;
  email: string;
  password: string;
};

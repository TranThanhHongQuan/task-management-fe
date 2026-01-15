import { http } from "../core/http";
import type { AuthTokens, LoginReq, RegisterReq } from "./types";

export async function loginApi(payload: LoginReq): Promise<AuthTokens> {
  const { data } = await http.post<AuthTokens>("/api/v1/auth/login", payload);
  return data;
}

export async function registerApi(payload: RegisterReq): Promise<AuthTokens> {
  const { data } = await http.post<AuthTokens>("/api/v1/auth/register", payload);
  return data;
}

export async function logoutApi(refreshToken: string): Promise<void> {
  await http.post("/api/v1/auth/logout", { refreshToken });
}

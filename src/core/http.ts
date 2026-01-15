import axios from "axios";
import type { AxiosError, InternalAxiosRequestConfig } from "axios";
import { storage } from "./storage";

const baseURL = import.meta.env.VITE_API_BASE_URL;

export const http = axios.create({
  baseURL,
  timeout: 20000,
});

let refreshing = false;
let queue: Array<(token: string | null) => void> = [];

function enqueue(cb: (token: string | null) => void) {
  queue.push(cb);
}
function flush(token: string | null) {
  queue.forEach((cb) => cb(token));
  queue = [];
}

http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const t = storage.get();
  if (t?.accessToken) config.headers.Authorization = `Bearer ${t.accessToken}`;
  return config;
});

http.interceptors.response.use(
  (res) => res,
  async (err: AxiosError) => {
    const original = err.config as any;
    const status = err.response?.status;

    const url = String(original?.url ?? "");
    const isAuthEndpoint =
      url.includes("/api/v1/auth/login") ||
      url.includes("/api/v1/auth/register") ||
      url.includes("/api/v1/auth/refresh") ||
      url.includes("/api/v1/auth/logout");

    if (status !== 401 || original?._retry || isAuthEndpoint) {
      return Promise.reject(err);
    }

    const tokens = storage.get();
    if (!tokens?.refreshToken) {
      storage.clear();
      window.location.href = "/login";
      return Promise.reject(err);
    }

    original._retry = true;

    if (refreshing) {
      return new Promise((resolve, reject) => {
        enqueue((newAccess) => {
          if (!newAccess) return reject(err);
          original.headers.Authorization = `Bearer ${newAccess}`;
          resolve(http(original));
        });
      });
    }

    refreshing = true;

    try {
      const refreshRes = await axios.post(
        `${baseURL}/api/v1/auth/refresh`,
        { refreshToken: tokens.refreshToken },
        { timeout: 20000 }
      );

      const newTokens = {
        accessToken: (refreshRes.data as any).accessToken,
        refreshToken: (refreshRes.data as any).refreshToken,
      };

      storage.set(newTokens);
      flush(newTokens.accessToken);

      original.headers.Authorization = `Bearer ${newTokens.accessToken}`;
      return http(original);
    } catch (e) {
      flush(null);
      storage.clear();
      window.location.href = "/login";
      return Promise.reject(e);
    } finally {
      refreshing = false;
    }
  }
);

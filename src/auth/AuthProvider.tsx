import React, { createContext, useEffect, useMemo, useState } from "react";
import { parseJwt } from "../core/jwt";
import { storage } from "../core/storage";
import { loginApi, logoutApi, registerApi } from "./authApi";
import { getMeProfile } from "./meApi";

export type AuthUser = {
  id: number;
  email: string;
  perms: string[];
  fullName?: string;
  phone?: string | null;
  avatarUrl?: string | null;
  status?: string;
};

type AuthCtx = {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  has: (perm: string) => boolean;
  refreshMe: () => Promise<void>;
};

export const AuthContext = createContext<AuthCtx | null>(null);

function buildUserFromAccessToken(accessToken: string, fallbackEmail: string): AuthUser {
  const p = parseJwt(accessToken);
  return {
    id: Number(p?.sub ?? 0),
    email: p?.email ?? fallbackEmail,
    perms: Array.isArray(p?.perms) ? (p!.perms as string[]) : [],
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const t = storage.get();
    if (!t?.accessToken) return null;
    const u = buildUserFromAccessToken(t.accessToken, "");
    return u.id ? u : null;
  });

  async function refreshMe() {
    const t = storage.get();
    if (!t?.accessToken) return;

    const profile = await getMeProfile(t.accessToken);

    setUser((prev) => {
      const base = prev ?? buildUserFromAccessToken(t.accessToken!, profile.email ?? "");
      return { ...base, ...profile }; // ✅ giữ perms, thêm profile
    });
  }

  // ✅ reload app: có token thì load profile
  useEffect(() => {
    const t = storage.get();
    if (!t?.accessToken) return;
    refreshMe().catch(() => {
      storage.clear();
      setUser(null);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function login(email: string, password: string) {
    const tokens = await loginApi({ email, password });
    storage.set(tokens);

    setUser(buildUserFromAccessToken(tokens.accessToken, email));
    await refreshMe();
  }

  async function register(fullName: string, email: string, password: string) {
    const tokens = await registerApi({ fullName, email, password });
    storage.set(tokens);

    setUser(buildUserFromAccessToken(tokens.accessToken, email));
    await refreshMe();
  }

  async function logout() {
    const t = storage.get();
    try {
      if (t?.refreshToken) await logoutApi(t.refreshToken);
    } finally {
      storage.clear();
      setUser(null);
      window.location.href = "/login";
    }
  }

  const has = (perm: string) => !!user?.perms.includes(perm);

  const value = useMemo(() => ({ user, login, register, logout, has, refreshMe }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

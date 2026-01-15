export type JwtPayload = {
  sub?: string;        // userId
  email?: string;
  perms?: string[];    // permissions
  exp?: number;
};

function b64UrlDecode(s: string) {
  const pad = s.length % 4 ? "=".repeat(4 - (s.length % 4)) : "";
  const base = (s + pad).replace(/-/g, "+").replace(/_/g, "/");
  return decodeURIComponent(
    atob(base)
      .split("")
      .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join("")
  );
}

export function parseJwt(token: string): JwtPayload | null {
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;
    return JSON.parse(b64UrlDecode(payload));
  } catch {
    return null;
  }
}

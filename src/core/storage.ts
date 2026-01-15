export type Tokens = { accessToken: string; refreshToken: string };
const KEY = "tm_tokens";

export const storage = {
  get(): Tokens | null {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  },
  set(tokens: Tokens) {
    localStorage.setItem(KEY, JSON.stringify(tokens));
  },
  clear() {
    localStorage.removeItem(KEY);
  },
};

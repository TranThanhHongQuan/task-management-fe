export type MeProfile = {
  id: number;
  email: string;
  fullName: string;
  phone?: string | null;
  avatarUrl?: string | null;
  status?: string;
};

export async function getMeProfile(accessToken: string): Promise<MeProfile> {
  const res = await fetch("/api/v1/me/profile", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error("GET_ME_PROFILE_FAILED");
  return res.json();
}

export async function updateMeProfile(
  accessToken: string,
  body: { fullName: string; phone?: string | null; avatarUrl?: string | null }
): Promise<MeProfile> {
  const res = await fetch("/api/v1/me/profile", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("UPDATE_ME_PROFILE_FAILED");
  return res.json();
}

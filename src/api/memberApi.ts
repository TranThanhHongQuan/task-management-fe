import { http } from "../core/http";

export type ProjectMember = { userId: number; email: string; projectRole: string };

export async function listMembers(projectId: number) {
  const { data } = await http.get<ProjectMember[]>(`/api/v1/projects/${projectId}/members`);
  return data;
}

export async function addMemberByEmail(projectId: number, payload: { email: string; projectRole?: string }) {
  await http.post(`/api/v1/projects/${projectId}/members/by-email`, payload);
}

export async function removeMember(projectId: number, userId: number) {
  await http.delete(`/api/v1/projects/${projectId}/members/${userId}`);
}
import { http } from "../core/http";
import type { PageResponse } from "../types/common";
import type { Project } from "../types/project";

export async function listProjects(params: { page?: number; size?: number; keyword?: string; status?: string }) {
  const { data } = await http.get<PageResponse<Project>>("/api/v1/projects", { params });
  return data;
}

export async function createProject(payload: {
  name: string;
  code: string;
  description?: string;
  status?: string; // ACTIVE/DONE/ARCHIVED
}) {
  const { data } = await http.post<Project>("/api/v1/projects", payload);
  return data;
}
export async function deleteProject(projectId: number) {
  await http.delete(`/api/v1/projects/${projectId}`);
}
export async function updateProjectStatus(projectId: number, status: string) {
  const { data } = await http.put<Project>(`/api/v1/projects/${projectId}/status`, { status });
  return data;
}
export async function listProjectMembers(projectId: number) {
  const { data } = await http.get(`/api/v1/projects/${projectId}/members`);
  return data;
}
import { http } from "../core/http";
import type { PageResponse } from "../types/common";
import type { Task } from "../types/task";
import type { CreateTaskRequest } from "../types/task";
export async function listTasks(params: {
  projectId: number;
  page?: number;
  size?: number;
  status?: string;
  priority?: string;
  assigneeId?: number;
  keyword?: string;
}) {
  const { data } = await http.get<PageResponse<Task>>("/api/v1/tasks", { params });
  return data;
}

export async function createTask(payload: CreateTaskRequest) {
  const { data } = await http.post<Task>("/api/v1/tasks", payload);
  return data;
}

export async function myTasks(params: { page?: number; size?: number; status?: string; priority?: string; keyword?: string }) {
  const { data } = await http.get<PageResponse<Task>>("/api/v1/me/tasks", { params });
  return data;
}
export async function updateTaskStatus(taskId: number, status: string) {
  const { data } = await http.put<Task>(`/api/v1/tasks/${taskId}/status`, { status });
  return data;
}
export async function updateTaskAssignee(taskId: number, userId: number) {
  const { data } = await http.put<Task>(`/api/v1/tasks/${taskId}/assignee`, { userId });
  return data;
}
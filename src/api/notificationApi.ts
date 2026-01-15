import { http } from "../core/http";
import type { PageResponse } from "../types/common";
import type { Notification } from "../types/notification";

export async function listNotifications(params: {
  page?: number;
  size?: number;
  isRead?: boolean;
  type?: string;
  keyword?: string;
}) {
  const { data } = await http.get<PageResponse<Notification>>("/api/v1/notifications", { params });
  return data;
}

export async function unreadCount() {
  const { data } = await http.get<number>("/api/v1/notifications/unread-count");
  return data;
}

export async function markRead(id: number) {
  await http.put(`/api/v1/notifications/${id}/read`);
}

export async function markReadAll() {
  await http.put("/api/v1/notifications/read-all");
}

export type Notification = {
  id: number;
  type: string;
  title: string;
  content: string;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
  refType: string | null;
  refId: number | null;
};

export type Task = {
  id: number;
  projectId: number;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  deadline: string | null;
  assigneeId: number | null;
  assigneeEmail: string | null;
  createdById: number;
  createdByEmail: string;
};

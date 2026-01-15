export type Project = {
  id: number;
  name: string;
  code: string;
  description: string | null;
  status: string;
  ownerId: number;
  ownerEmail: string;
};

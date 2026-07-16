export type WorkspaceType = 'WEBSITE' | 'GITHUB' | 'COMBINED';

export class WorkspaceEntity {
  id!: string;
  name!: string;
  description?: string | null;
  tags!: string[];
  type!: WorkspaceType;
  targetUrl?: string | null;
  repoUrl?: string | null;
  userId!: string;
  createdAt!: Date;
  updatedAt!: Date;
}

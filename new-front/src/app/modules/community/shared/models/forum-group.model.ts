export interface ForumGroup {
  id: string;
  name: string;
  sector: string;
  description: string;
  visibility: 'PUBLIC' | 'PRIVATE' | 'INVITATION_ONLY';
  createdBy: string;
  adminIds: string[];
  memberIds: string[];
  memberCount: number;
  status: 'ACTIVE' | 'ARCHIVED' | 'SUSPENDED';
  createdAt: string;
}

export interface CreateGroupDTO {
  name: string;
  sector: string;
  description: string;
  createdBy: string;
  visibility: string;
}
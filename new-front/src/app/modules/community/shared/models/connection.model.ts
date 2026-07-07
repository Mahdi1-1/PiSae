export type ConnectionStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'BLOCKED';

export interface MemberConnection {
  id: string;
  requesterId: string;
  targetId: string;
  status: ConnectionStatus;
  message?: string;
  aiSuggested: boolean;
  matchScore: number;
  createdAt: string;
  acceptedAt?: string;
  respondedAt?: string;
}
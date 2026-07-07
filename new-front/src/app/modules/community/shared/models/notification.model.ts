export enum NotificationType {
  CONNECTION_REQUEST = 'CONNECTION_REQUEST',
  CONNECTION_ACCEPTED = 'CONNECTION_ACCEPTED',
  NEW_POST = 'NEW_POST',
  NEW_COMMENT = 'NEW_COMMENT',
  APPLICATION_RECEIVED = 'APPLICATION_RECEIVED',
  REPUTATION_GAINED = 'REPUTATION_GAINED'
}

export interface CommunityNotification {
  id?: string;
  userId: string;
  type: NotificationType;
  message: string;
  metadata?: { [key: string]: string };
  read: boolean;
  createdAt: Date;
}

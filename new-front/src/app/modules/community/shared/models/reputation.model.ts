export type MemberLevel = 'EXPLORATEUR' | 'CONTRIBUTEUR' | 'EXPERT' | 'LEADER' | 'AMBASSADEUR';

export type ReputationAction =
  'POST_CREATED' | 'COMMENT_ADDED' | 'POST_LIKED' |
  'RESOURCE_PUBLISHED' | 'RECOMMENDATION_RECEIVED' |
  'APPLICATION_ACCEPTED' | 'GROUP_CREATED' | 'EVENT_ATTENDED';

export interface MemberReputation {
  id: string;
  memberId: string;
  points: number;
  level: MemberLevel;
  globalScore: number;
  expertiseScore: number;
  reactivityScore: number;
  valueScore: number;
  badges: string[];
  recommendationsReceived: number;
  resourcesPublished: number;
  postsCount: number;
  commentsCount: number;
  lastUpdated: string;
}
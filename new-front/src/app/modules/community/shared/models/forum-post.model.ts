export interface Comment {
  authorId: string;
  authorName?: string;
  content: string;
  createdAt: string;
  replies?: Comment[];
}

export interface ForumPost {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName?: string;
  groupId?: string;
  groupName?: string;
  sector?: string;
  tags?: string[];
  status: 'OPEN' | 'RESOLVED' | 'ARCHIVED' | 'PINNED';
  likesCount: number;
  likedBy: string[];
  viewsCount: number;
  comments: Comment[];
  mediaUrls?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostDTO {
  title: string;
  content: string;
  tags?: string[];
  sector?: string;
  authorId: string;
  groupId?: string;
  mediaUrls?: string[];
  status?: string;
}
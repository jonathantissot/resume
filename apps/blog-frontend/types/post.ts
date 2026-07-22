export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string; // ISO 8601
  reactionCount: number;
  tags?: string[];
}

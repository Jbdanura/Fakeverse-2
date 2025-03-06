export interface User {
  id: number;
  username: string;
  name?: string;
  profile_pic?: string;
  bio?: string;
  is_following?: boolean;
}

export interface Comment {
  id: number;
  content: string;
  post_id: number;
  user_id: number;
  created_at: string;
  username: string;
  profile_pic?: string;
  is_own_comment: boolean;
}

export interface Post {
  id: number;
  content: string;
  image_url?: string;
  user_id: number;
  created_at: string;
  username: string;
  profile_pic?: string;
  like_count: number;
  comment_count: number;
  is_liked?: boolean;
} 
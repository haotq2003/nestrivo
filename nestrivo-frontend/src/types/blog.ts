export interface BlogAuthor {
  id: string;
  fullName: string;
  avatarUrl?: string | null;
  email?: string;
}

export interface BlogPost {
  id: string;
  authorId: string;
  author?: BlogAuthor;
  title: string;
  slug: string;
  summary: string;
  content: string;
  coverImage?: string | null;
  category: string;
  tags: string[];
  isPublished: boolean;
  views: number;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BlogCategoryStat {
  name: string;
  count: number;
}

export interface BlogPagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface PublicBlogListResponse {
  success: boolean;
  data: BlogPost[];
  categories: BlogCategoryStat[];
  pagination: BlogPagination;
  message?: string;
}

export interface BlogDetailResponse {
  success: boolean;
  data: BlogPost;
  relatedPosts: Partial<BlogPost>[];
  message?: string;
}

export interface AdminBlogListResponse {
  success: boolean;
  data: BlogPost[];
  pagination: BlogPagination;
  message?: string;
}

export interface CreateBlogPostInput {
  title: string;
  slug?: string;
  summary: string;
  content: string;
  coverImage?: string;
  category?: string;
  tags?: string[];
  isPublished?: boolean;
}

export interface UpdateBlogPostInput {
  title?: string;
  slug?: string;
  summary?: string;
  content?: string;
  coverImage?: string;
  category?: string;
  tags?: string[];
  isPublished?: boolean;
}

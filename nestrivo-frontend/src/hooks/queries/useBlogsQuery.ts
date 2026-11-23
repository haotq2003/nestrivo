import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";
import { PublicBlogListResponse, BlogDetailResponse } from "@/types/blog";

export interface BlogListParams {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
}

export const BLOG_QUERY_KEYS = {
  all: ["blogs"] as const,
  lists: () => [...BLOG_QUERY_KEYS.all, "list"] as const,
  list: (params?: BlogListParams) => [...BLOG_QUERY_KEYS.lists(), params] as const,
  details: () => [...BLOG_QUERY_KEYS.all, "detail"] as const,
  detail: (slugOrId: string) => [...BLOG_QUERY_KEYS.details(), slugOrId] as const,
};

/**
 * Hook fetch danh sách bài viết blog công khai (có phân trang, lọc danh mục, tìm kiếm)
 */
export function useBlogsQuery(params?: BlogListParams) {
  return useQuery({
    queryKey: BLOG_QUERY_KEYS.list(params),
    queryFn: async (): Promise<PublicBlogListResponse> => {
      const response = await apiClient.get<PublicBlogListResponse>("/blog", {
        params,
      });
      return response.data;
    },
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 10, // Blog ít thay đổi, cache 10 phút
  });
}

/**
 * Hook fetch chi tiết bài viết theo slug hoặc ID
 */
export function useBlogDetailQuery(slugOrId: string) {
  return useQuery({
    queryKey: BLOG_QUERY_KEYS.detail(slugOrId),
    queryFn: async (): Promise<BlogDetailResponse> => {
      const response = await apiClient.get<BlogDetailResponse>(
        `/blog/${encodeURIComponent(slugOrId)}`
      );
      return response.data;
    },
    enabled: Boolean(slugOrId),
    staleTime: 1000 * 60 * 10, // Cache chi tiết bài viết 10 phút
  });
}

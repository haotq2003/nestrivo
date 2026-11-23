import { httpClient } from "./api";
import {
  PublicBlogListResponse,
  BlogDetailResponse,
  AdminBlogListResponse,
  CreateBlogPostInput,
  UpdateBlogPostInput,
  BlogPost,
} from "@/types/blog";

/**
 * 1. Lấy danh sách bài viết blog công khai
 */
export async function getPublicBlogPosts(params?: {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
}): Promise<PublicBlogListResponse> {
  return httpClient.get<PublicBlogListResponse>("/blog", params);
}

/**
 * 2. Lấy chi tiết bài viết theo Slug hoặc ID
 */
export async function getBlogPostBySlug(slugOrId: string): Promise<BlogDetailResponse> {
  return httpClient.get<BlogDetailResponse>(`/blog/${encodeURIComponent(slugOrId)}`);
}

/**
 * 3. [Admin] Lấy toàn bộ bài viết (kèm bài nháp)
 */
export async function getAdminBlogPosts(params?: {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  status?: string;
}): Promise<AdminBlogListResponse> {
  return httpClient.get<AdminBlogListResponse>("/blog/admin/all", params);
}

/**
 * 4. [Admin] Tạo bài viết mới
 */
export async function createBlogPost(data: CreateBlogPostInput): Promise<{
  success: boolean;
  message: string;
  data: BlogPost;
}> {
  return httpClient.post<{ success: boolean; message: string; data: BlogPost }>("/blog", data);
}

/**
 * 5. [Admin] Cập nhật bài viết
 */
export async function updateBlogPost(
  id: string,
  data: UpdateBlogPostInput
): Promise<{ success: boolean; message: string; data: BlogPost }> {
  return httpClient.put<{ success: boolean; message: string; data: BlogPost }>(`/blog/${id}`, data);
}

/**
 * 6. [Admin] Xóa bài viết
 */
export async function deleteBlogPost(id: string): Promise<{ success: boolean; message: string }> {
  return httpClient.delete<{ success: boolean; message: string }>(`/blog/${id}`);
}

/**
 * 7. [Admin] Chuyển đổi trạng thái xuất bản
 */
export async function togglePublishStatus(id: string): Promise<{
  success: boolean;
  message: string;
  isPublished: boolean;
  data: BlogPost;
}> {
  return httpClient.patch<{
    success: boolean;
    message: string;
    isPublished: boolean;
    data: BlogPost;
  }>(`/blog/${id}/status`, {});
}

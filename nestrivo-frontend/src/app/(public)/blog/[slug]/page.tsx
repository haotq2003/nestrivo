"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { 
  Home, 
  ChevronRight, 
  Calendar, 
  Eye, 
  Clock, 
  ArrowLeft, 
  Share2, 
  Check, 
  Copy, 
  BookOpen, 
  ArrowRight,
  Sparkles,
  Tag
} from "lucide-react";
import { useBlogDetailQuery } from "@/hooks/queries";
import MarkdownContent from "@/components/common/MarkdownContent";

export default function BlogPostDetailPage() {
  const params = useParams();
  const slug = (params?.slug as string) || "";
  const [copied, setCopied] = useState(false);

  const { data: detailRes, isLoading, error: queryError } = useBlogDetailQuery(slug);

  const post = detailRes?.data || null;
  const relatedPosts = detailRes?.relatedPosts || [];
  const error = queryError
    ? queryError instanceof Error
      ? queryError.message
      : "Lỗi khi tải bài viết"
    : detailRes && !detailRes.success
      ? detailRes.message || "Không tìm thấy bài viết"
      : null;

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  const calculateReadTime = (content: string) => {
    const words = content ? content.trim().split(/\s+/).length : 0;
    const minutes = Math.max(1, Math.ceil(words / 200));
    return `${minutes} phút đọc`;
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "Mới đăng";
    try {
      const d = new Date(dateStr);
      return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`;
    } catch {
      return "Mới đăng";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FFFAEF] py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6 animate-pulse">
          <div className="h-4 bg-stone-200 rounded w-1/4" />
          <div className="h-10 bg-stone-200 rounded w-3/4" />
          <div className="h-6 bg-stone-200 rounded w-1/2" />
          <div className="aspect-[16/9] bg-stone-200 rounded-3xl" />
          <div className="space-y-3 pt-6">
            <div className="h-4 bg-stone-200 rounded w-full" />
            <div className="h-4 bg-stone-200 rounded w-5/6" />
            <div className="h-4 bg-stone-200 rounded w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-[#FFFAEF] py-20 flex items-center justify-center">
        <div className="bg-white rounded-3xl border border-[#EDE5D5] p-10 text-center max-w-md mx-4 space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
            <BookOpen className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-[#292524]">Bài viết không tồn tại</h2>
            <p className="text-xs text-[#78716C]">
              {error || "Bài viết này có thể đã bị xóa hoặc đường dẫn không chính xác."}
            </p>
          </div>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#F4CD65] hover:bg-[#ebbf4d] text-[#292524] text-xs font-semibold shadow-xs transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại trang Blog</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFAEF] text-[#292524] pb-24">
      {/* Breadcrumb Header */}
      <div className="bg-white border-b border-[#EDE5D5]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-[#77715F] min-w-0">
            <Link href="/" className="hover:text-[#373523] transition-colors flex items-center gap-1 shrink-0">
              <Home className="w-3.5 h-3.5" />
              <span>Trang chủ</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#A8A190] shrink-0" />
            <Link href="/blog" className="hover:text-[#373523] transition-colors shrink-0">
              Blog
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#A8A190] shrink-0" />
            <span className="font-semibold text-[#373523] truncate max-w-[200px] sm:max-w-xs">
              {post.title}
            </span>
          </div>

          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-50 hover:bg-stone-100 border border-[#EDE5D5] text-xs font-medium text-[#292524] transition-colors cursor-pointer shrink-0"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-semibold">Đã chép link</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-[#78716C]" />
                <span>Chia sẻ</span>
              </>
            )}
          </button>
        </div>
      </div>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 space-y-6">
        {/* Category & Title */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-xl bg-[#FFF7E5] border border-[#F4CD65]/60 text-xs font-semibold text-[#805B10]">
              {post.category}
            </span>
            <span className="text-xs text-[#78716C]">•</span>
            <span className="text-xs text-[#78716C] flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#A8A190]" />
              {calculateReadTime(post.content)}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-bold text-[#292524] tracking-tight leading-snug">
            {post.title}
          </h1>

          <p className="text-sm sm:text-base text-[#57534E] leading-relaxed italic border-l-4 border-[#F4CD65] pl-4 py-1">
            {post.summary}
          </p>
        </div>

        {/* Author & Meta Bar */}
        <div className="p-4 rounded-2xl bg-white border border-[#EDE5D5] flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#F4CD65] flex items-center justify-center font-bold text-sm text-[#292524] overflow-hidden shadow-2xs">
              {post.author?.avatarUrl ? (
                <img src={post.author.avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                post.author?.fullName?.charAt(0) || "N"
              )}
            </div>
            <div>
              <p className="font-semibold text-[#292524] text-sm">
                {post.author?.fullName || "Ban biên tập Nestrivo"}
              </p>
              <p className="text-[11px] text-[#78716C]">
                Cập nhật ngày {formatDate(post.publishedAt || post.createdAt)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-[#78716C]">
            <Eye className="w-4 h-4 text-[#A8A190]" />
            <span>{post.views || 0} lượt đọc</span>
          </div>
        </div>

        {/* Cover Image */}
        {post.coverImage && (
          <div className="relative aspect-[16/9] rounded-3xl overflow-hidden bg-stone-100 border border-[#EDE5D5] shadow-xs">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Article Body Content */}
        <div className="bg-white rounded-3xl border border-[#EDE5D5] p-6 sm:p-10 shadow-xs">
          <MarkdownContent content={post.content} />

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="pt-8 mt-8 border-t border-[#EDE5D5] flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-[#78716C] flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#805B10]" />
                <span>Từ khóa liên quan:</span>
              </span>
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full bg-[#FFF7E5] border border-[#F4CD65]/40 text-[#805B10] text-xs font-medium hover:bg-[#FDE68A] transition-colors"
                >
                  {tag.replace(/^#+/, "")}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Share & Back */}
        <div className="flex items-center justify-between pt-2">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#805B10] hover:text-[#5c4107] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Xem các bài viết khác</span>
          </Link>

          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F4CD65] hover:bg-[#ebbf4d] text-[#292524] text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copied ? "Đã sao chép liên kết" : "Chia sẻ bài viết"}</span>
          </button>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="pt-10 space-y-4 border-t border-[#EDE5D5]">
            <h2 className="text-lg sm:text-xl font-bold text-[#292524]">
              Bài viết cùng chuyên mục
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relatedPosts.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/blog/${rel.slug}`}
                  className="group bg-white rounded-2xl border border-[#EDE5D5] hover:border-[#DCA936] p-3.5 space-y-2.5 transition-all shadow-2xs block"
                >
                  <div className="aspect-[16/10] rounded-xl overflow-hidden bg-stone-100">
                    <img
                      src={
                        rel.coverImage ||
                        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80"
                      }
                      alt={rel.title || ""}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="text-xs sm:text-sm font-semibold text-[#292524] group-hover:text-[#805B10] line-clamp-2 leading-snug">
                    {rel.title}
                  </h3>
                  <span className="text-[11px] text-[#805B10] font-medium flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    <span>Đọc tiếp</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Bottom CTA Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#292524] to-[#44403C] text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md mt-10">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-base sm:text-lg font-bold">
              Đang tìm kiếm phòng trọ minh bạch, giá tốt?
            </h3>
            <p className="text-xs sm:text-sm text-stone-300">
              Khám phá hàng ngàn phòng trọ, studio và căn hộ dịch vụ đã được kiểm duyệt 100% trên Nestrivo.
            </p>
          </div>
          <Link
            href="/#listings"
            className="px-6 py-2.5 rounded-2xl bg-[#F4CD65] hover:bg-[#ebbf4d] text-[#292524] font-semibold text-xs sm:text-sm shrink-0 shadow-xs transition-colors"
          >
            Tìm phòng trọ ngay
          </Link>
        </div>
      </article>
    </div>
  );
}

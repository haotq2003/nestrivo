"use client";

import Link from "next/link";
import { useState } from "react";
import { 
  BookOpen, 
  Search, 
  Calendar, 
  Eye, 
  ArrowRight, 
  ChevronRight, 
  Home, 
  Sparkles, 
  Tag, 
  Clock 
} from "lucide-react";
import { useBlogsQuery } from "@/hooks/queries";

const DEFAULT_CATEGORIES = [
  "Tất cả",
  "Kinh nghiệm thuê phòng",
  "Pháp lý & Hợp đồng",
  "Mẹo không gian sống",
  "Thị trường bất động sản",
];

export default function BlogListingPage() {
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data: blogRes, isLoading } = useBlogsQuery({
    category: selectedCategory !== "Tất cả" ? selectedCategory : undefined,
    search: activeSearch.trim() || undefined,
    page,
    limit: 9,
  });

  const posts = blogRes?.data || [];
  const categories = blogRes?.categories || [];
  const totalPages = blogRes?.pagination?.totalPages || 1;
  const totalItems = blogRes?.pagination?.totalItems || 0;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setActiveSearch(searchQuery);
  };

  const handleCategoryClick = (cat: string) => {
    setSelectedCategory(cat);
    setPage(1);
  };

  const featuredPost = posts.length > 0 && page === 1 && !activeSearch && selectedCategory === "Tất cả" 
    ? posts[0] 
    : null;
  const gridPosts = featuredPost ? posts.slice(1) : posts;

  // Tính thời gian đọc ước tính
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

  return (
    <div className="min-h-screen bg-[#FFFAEF] text-[#292524] pb-24">
      {/* Breadcrumb Header */}
      <div className="bg-white border-b border-[#EDE5D5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-[#77715F]">
            <Link href="/" className="hover:text-[#373523] transition-colors flex items-center gap-1">
              <Home className="w-3.5 h-3.5" />
              <span>Trang chủ</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#A8A190]" />
            <span className="font-bold text-[#373523]">Blog &amp; Cẩm nang</span>
          </div>

          <span className="text-[#805B10] font-semibold bg-[#FFF7E5] px-2.5 py-1 rounded-full border border-[#F4CD65]/40 hidden sm:inline-block">
            {totalItems} bài viết kinh nghiệm
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Hero Section of Blog */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF7E5] border border-[#F4CD65]/60 text-xs font-semibold text-[#805B10]">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Góc chia sẻ &amp; Cẩm nang Nestrivo</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#292524]">
            Kiến thức &amp; Kinh nghiệm thuê phòng trọ
          </h1>
          <p className="text-xs sm:text-sm text-[#57534E] leading-relaxed">
            Tổng hợp bí quyết tìm phòng thông minh, cẩm nang pháp lý hợp đồng, cách tránh bẫy lừa đảo tiền cọc và mẹo tối ưu không gian sống cho sinh viên &amp; người đi làm.
          </p>

          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="pt-2 max-w-lg mx-auto">
            <div className="relative flex items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm bài viết (VD: hợp đồng, tiền cọc, TP.HCM)..."
                className="w-full h-11 pl-10 pr-24 rounded-2xl bg-white border border-[#EDE5D5] focus:outline-none focus:border-[#DCA936] text-xs sm:text-sm shadow-xs transition-all"
              />
              <Search className="w-4 h-4 text-[#78716C] absolute left-3.5" />
              <button
                type="submit"
                className="absolute right-1.5 px-3.5 py-1.5 rounded-xl bg-[#F4CD65] hover:bg-[#ebbf4d] text-[#292524] font-semibold text-xs transition-colors cursor-pointer shadow-2xs"
              >
                Tìm kiếm
              </button>
            </div>
          </form>
        </div>

        {/* Category Chips Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-[#EDE5D5]">
          {DEFAULT_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategoryClick(cat)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#292524] text-white shadow-xs font-semibold"
                    : "bg-white hover:bg-stone-50 border border-[#EDE5D5] text-[#57534E]"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Featured Top Post (Only on page 1 with all categories) */}
        {featuredPost && (
          <article className="group bg-white rounded-3xl border border-[#EDE5D5] overflow-hidden shadow-xs hover:border-[#DCA936] transition-all grid grid-cols-1 lg:grid-cols-12 gap-0">
            <Link
              href={`/blog/${featuredPost.slug}`}
              className="lg:col-span-7 relative aspect-[16/10] lg:aspect-auto overflow-hidden bg-stone-100 block"
            >
              <img
                src={
                  featuredPost.coverImage ||
                  "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1200&q=80"
                }
                alt={featuredPost.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 rounded-xl bg-[#F4CD65] text-[#292524] text-xs font-bold shadow-xs flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Bài viết nổi bật</span>
                </span>
              </div>
            </Link>

            <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs text-[#805B10] font-semibold">
                  <span className="bg-[#FFF7E5] px-2.5 py-0.5 rounded-md border border-[#F4CD65]/40">
                    {featuredPost.category}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-[#78716C] font-normal">
                    <Clock className="w-3 h-3" />
                    {calculateReadTime(featuredPost.content)}
                  </span>
                </div>

                <Link href={`/blog/${featuredPost.slug}`}>
                  <h2 className="text-lg sm:text-2xl font-bold text-[#292524] group-hover:text-[#805B10] transition-colors leading-snug">
                    {featuredPost.title}
                  </h2>
                </Link>

                <p className="text-xs sm:text-sm text-[#57534E] leading-relaxed line-clamp-3">
                  {featuredPost.summary}
                </p>
              </div>

              <div className="pt-4 border-t border-[#EDE5D5] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#F4CD65] flex items-center justify-center font-bold text-xs text-[#292524] overflow-hidden">
                    {featuredPost.author?.avatarUrl ? (
                      <img
                        src={featuredPost.author.avatarUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      featuredPost.author?.fullName?.charAt(0) || "N"
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#292524]">
                      {featuredPost.author?.fullName || "Ban biên tập Nestrivo"}
                    </p>
                    <p className="text-[11px] text-[#78716C]">
                      {formatDate(featuredPost.publishedAt)}
                    </p>
                  </div>
                </div>

                <Link
                  href={`/blog/${featuredPost.slug}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-[#F4CD65] text-[#292524] font-medium text-xs transition-colors"
                >
                  <span>Đọc ngay</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </article>
        )}

        {/* Blog Posts Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="bg-white rounded-3xl border border-[#EDE5D5] p-4 space-y-3 animate-pulse"
              >
                <div className="aspect-[16/10] bg-stone-200 rounded-2xl" />
                <div className="h-4 bg-stone-200 rounded w-1/3" />
                <div className="h-5 bg-stone-200 rounded w-3/4" />
                <div className="h-3 bg-stone-200 rounded w-full" />
                <div className="pt-2 border-t border-stone-100 flex justify-between">
                  <div className="h-4 bg-stone-200 rounded w-1/4" />
                  <div className="h-4 bg-stone-200 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : gridPosts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {gridPosts.map((post) => (
              <article
                key={post.id}
                className="group bg-white rounded-3xl border border-[#EDE5D5] hover:border-[#DCA936] hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
              >
                <div>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="relative block aspect-[16/10] overflow-hidden bg-stone-100"
                  >
                    <img
                      src={
                        post.coverImage ||
                        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80"
                      }
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-0.5 rounded-lg bg-white/95 backdrop-blur-sm text-[#805B10] text-[11px] font-semibold border border-[#EDE5D5] shadow-2xs">
                        {post.category}
                      </span>
                    </div>
                  </Link>

                  <div className="p-4 sm:p-5 space-y-2">
                    <div className="flex items-center gap-2 text-[11px] text-[#78716C]">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[#A8A190]" />
                        {formatDate(post.publishedAt)}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#A8A190]" />
                        {calculateReadTime(post.content)}
                      </span>
                    </div>

                    <Link href={`/blog/${post.slug}`}>
                      <h3 className="text-base font-semibold text-[#292524] group-hover:text-[#805B10] transition-colors line-clamp-2 leading-snug">
                        {post.title}
                      </h3>
                    </Link>

                    <p className="text-xs text-[#57534E] line-clamp-2 leading-relaxed">
                      {post.summary}
                    </p>
                  </div>
                </div>

                <div className="p-4 sm:p-5 pt-0 flex items-center justify-between border-t border-[#EDE5D5]/60 mt-2">
                  <div className="flex items-center gap-1.5 text-xs text-[#78716C]">
                    <Eye className="w-3.5 h-3.5" />
                    <span>{post.views || 0} lượt đọc</span>
                  </div>

                  <Link
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#805B10] group-hover:translate-x-0.5 transition-transform"
                  >
                    <span>Xem tiếp</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-[#EDE5D5] p-12 text-center space-y-4 max-w-lg mx-auto my-8">
            <div className="w-14 h-14 rounded-2xl bg-[#FFF7E5] text-[#805B10] flex items-center justify-center mx-auto">
              <BookOpen className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#292524]">Không tìm thấy bài viết nào</h3>
              <p className="text-xs text-[#78716C]">
                Thử tìm với từ khóa khác hoặc chuyển sang danh mục bài viết khác bạn nhé.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory("Tất cả");
                setSearchQuery("");
                setActiveSearch("");
              }}
              className="px-4 py-2 rounded-xl bg-[#F4CD65] hover:bg-[#ebbf4d] text-[#292524] text-xs font-semibold transition-colors cursor-pointer"
            >
              Xem tất cả bài viết
            </button>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pt-6 flex items-center justify-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPage(p)}
                className={`w-9 h-9 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  page === p
                    ? "bg-[#292524] text-white shadow-xs"
                    : "bg-white hover:bg-stone-100 border border-[#EDE5D5] text-[#57534E]"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

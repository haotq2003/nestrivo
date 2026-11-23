"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Plus,
  Search,
  Edit3,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  ExternalLink,
  X,
  AlertCircle,
  FileText,
  Filter,
  Sparkles,
  ChevronRight,
  Home,
  Save,
  RotateCcw
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  getAdminBlogPosts,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  togglePublishStatus,
} from "@/service/blog.service";
import { BlogPost, CreateBlogPostInput } from "@/types/blog";

const CATEGORIES = [
  "Kinh nghiệm thuê phòng",
  "Pháp lý & Hợp đồng",
  "Mẹo không gian sống",
  "Thị trường bất động sản",
  "Cẩm nang chủ nhà",
];

export default function AdminBlogManagementPage() {
  const router = useRouter();
  const { user, isAdmin, isLoading: authLoading } = useAuth();

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Modal State for Create & Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [modalForm, setModalForm] = useState<CreateBlogPostInput>({
    title: "",
    slug: "",
    summary: "",
    content: "",
    coverImage: "",
    category: "Kinh nghiệm thuê phòng",
    isPublished: true,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete State
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast feedback
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const res = await getAdminBlogPosts({
        page,
        limit: 15,
        category: categoryFilter !== "ALL" ? categoryFilter : undefined,
        status: statusFilter !== "ALL" ? statusFilter : undefined,
        search: search.trim() || undefined,
      });

      if (res.success) {
        setPosts(res.data);
        setTotalPages(res.pagination.totalPages || 1);
        setTotalItems(res.pagination.totalItems || 0);
      }
    } catch (err) {
      console.error("Lỗi khi tải danh sách quản trị blog:", err);
      showToast("Không thể tải danh sách bài viết", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push("/");
      return;
    }

    if (isAdmin) {
      fetchPosts();
    }
  }, [authLoading, isAdmin, page, categoryFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchPosts();
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingPost(null);
    setModalForm({
      title: "",
      slug: "",
      summary: "",
      content: "",
      coverImage: "",
      category: "Kinh nghiệm thuê phòng",
      isPublished: true,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (post: BlogPost) => {
    setEditingPost(post);
    setModalForm({
      title: post.title,
      slug: post.slug,
      summary: post.summary,
      content: post.content,
      coverImage: post.coverImage || "",
      category: post.category,
      isPublished: post.isPublished,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  // Save Modal
  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalForm.title.trim()) {
      setFormError("Vui lòng nhập tiêu đề bài viết.");
      return;
    }
    if (!modalForm.content.trim()) {
      setFormError("Vui lòng nhập nội dung bài viết.");
      return;
    }

    setIsSaving(true);
    setFormError(null);

    try {
      if (editingPost) {
        const res = await updateBlogPost(editingPost.id, modalForm);
        if (res.success) {
          showToast("Cập nhật bài viết thành công!");
          setIsModalOpen(false);
          fetchPosts();
        }
      } else {
        const res = await createBlogPost(modalForm);
        if (res.success) {
          showToast("Tạo bài viết mới thành công!");
          setIsModalOpen(false);
          fetchPosts();
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Có lỗi xảy ra khi lưu bài viết.";
      setFormError(message);
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle publish status
  const handleToggleStatus = async (post: BlogPost) => {
    try {
      const res = await togglePublishStatus(post.id);
      if (res.success) {
        showToast(res.isPublished ? "Đã xuất bản bài viết" : "Đã chuyển về bản nháp ẩn");
        setPosts((prev) =>
          prev.map((p) => (p.id === post.id ? { ...p, isPublished: res.isPublished } : p))
        );
      }
    } catch (err) {
      showToast("Lỗi khi đổi trạng thái bài viết", "error");
    }
  };

  // Delete post
  const handleDeletePost = async (id: string) => {
    setIsDeleting(true);
    try {
      const res = await deleteBlogPost(id);
      if (res.success) {
        showToast("Đã xóa bài viết vĩnh viễn");
        setDeleteConfirmId(null);
        fetchPosts();
      }
    } catch (err) {
      showToast("Lỗi khi xóa bài viết", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  // Calculate quick stats
  const totalPublished = posts.filter((p) => p.isPublished).length;
  const totalDraft = posts.filter((p) => !p.isPublished).length;
  const totalViews = posts.reduce((sum, p) => sum + (p.views || 0), 0);

  if (authLoading) {
    return <div className="min-h-screen bg-[#FFFAEF] flex items-center justify-center">Đang tải...</div>;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#292524] pb-24">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded-2xl shadow-lg border text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-top-2 ${
            toast.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Breadcrumb */}
      <div className="bg-white border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-[#78716C]">
            <Link href="/" className="hover:text-[#292524] transition-colors flex items-center gap-1">
              <Home className="w-3.5 h-3.5" />
              <span>Trang chủ</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#A8A29E]" />
            <Link href="/admin/dashboard" className="hover:text-[#292524] transition-colors">
              Quản trị viên
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#A8A29E]" />
            <span className="font-bold text-[#292524]">Quản lý Blog &amp; Cẩm nang</span>
          </div>

          <Link
            href="/blog"
            target="_blank"
            className="inline-flex items-center gap-1 text-xs text-[#805B10] font-semibold hover:underline"
          >
            <span>Xem trang Blog công khai</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Header Title & Create Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E5E7EB] shadow-2xs">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-[#292524]">
                  Quản lý Bài viết &amp; Cẩm nang
                </h1>
                <p className="text-xs text-[#78716C]">
                  Thêm mới, chỉnh sửa, xuất bản hoặc ẩn các bài viết kinh nghiệm và pháp lý trên Nestrivo
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-[#F4CD65] hover:bg-[#ebbf4d] text-[#292524] font-semibold text-xs sm:text-sm shadow-xs transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Viết bài mới</span>
          </button>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-2xs space-y-1">
            <span className="text-xs text-[#78716C] font-normal">Tổng bài viết</span>
            <p className="text-2xl font-bold text-[#292524]">{totalItems}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-2xs space-y-1">
            <span className="text-xs text-emerald-700 font-normal">Đã xuất bản (Live)</span>
            <p className="text-2xl font-bold text-emerald-700">{totalPublished}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-2xs space-y-1">
            <span className="text-xs text-amber-700 font-normal">Bản nháp (Ẩn)</span>
            <p className="text-2xl font-bold text-amber-700">{totalDraft}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-2xs space-y-1">
            <span className="text-xs text-[#805B10] font-normal">Tổng lượt đọc</span>
            <p className="text-2xl font-bold text-[#805B10]">{totalViews}</p>
          </div>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tiêu đề hoặc slug..."
              className="w-full h-10 pl-9 pr-4 rounded-xl bg-stone-50 border border-[#E5E7EB] focus:outline-none focus:border-[#DCA936] text-xs"
            />
            <Search className="w-4 h-4 text-[#78716C] absolute left-3 top-3" />
          </form>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              className="h-10 px-3 rounded-xl bg-stone-50 border border-[#E5E7EB] text-xs font-medium text-[#292524] focus:outline-none"
            >
              <option value="ALL">Tất cả danh mục</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="h-10 px-3 rounded-xl bg-stone-50 border border-[#E5E7EB] text-xs font-medium text-[#292524] focus:outline-none"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="PUBLISHED">Đã xuất bản</option>
              <option value="DRAFT">Bản nháp</option>
            </select>
          </div>
        </div>

        {/* Posts Table */}
        <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-[#E5E7EB] text-[#78716C] uppercase font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Bài viết</th>
                  <th className="px-4 py-3.5">Danh mục</th>
                  <th className="px-4 py-3.5">Tác giả</th>
                  <th className="px-4 py-3.5 text-center">Lượt xem</th>
                  <th className="px-4 py-3.5 text-center">Trạng thái</th>
                  <th className="px-4 py-3.5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-[#78716C]">
                      Đang tải danh sách bài viết...
                    </td>
                  </tr>
                ) : posts.length > 0 ? (
                  posts.map((post) => (
                    <tr key={post.id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="px-5 py-4 max-w-sm">
                        <div className="flex items-start gap-3">
                          <div className="w-14 h-10 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
                            {post.coverImage ? (
                              <img src={post.coverImage} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-stone-400">
                                <FileText className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-semibold text-sm text-[#292524] line-clamp-1">
                              {post.title}
                            </h3>
                            <p className="text-[11px] text-[#78716C] truncate mt-0.5">
                              Slug: <code className="text-[#805B10]">{post.slug}</code>
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-lg bg-stone-100 text-[#57534E] text-[11px] font-medium border border-stone-200">
                          {post.category}
                        </span>
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap text-[#57534E]">
                        {post.author?.fullName || "Admin"}
                      </td>

                      <td className="px-4 py-4 text-center font-semibold text-[#292524]">
                        {post.views || 0}
                      </td>

                      <td className="px-4 py-4 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(post)}
                          className={`px-3 py-1 rounded-full text-[11px] font-semibold cursor-pointer transition-colors border ${
                            post.isPublished
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                              : "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100"
                          }`}
                        >
                          {post.isPublished ? "Đã xuất bản" : "Bản nháp (Ẩn)"}
                        </button>
                      </td>

                      <td className="px-4 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {post.isPublished && (
                            <Link
                              href={`/blog/${post.slug}`}
                              target="_blank"
                              className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-[#57534E] transition-colors"
                              title="Xem trang công khai"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          )}
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(post)}
                            className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-[#292524] transition-colors cursor-pointer"
                            title="Chỉnh sửa bài viết"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(post.id)}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                            title="Xóa bài viết"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-[#78716C]">
                      Chưa có bài viết nào phù hợp với bộ lọc.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-[#E5E7EB] flex items-center justify-between text-xs text-[#78716C]">
              <span>
                Hiển thị trang {page} / {totalPages} (Tổng {totalItems} bài viết)
              </span>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPage(p)}
                    className={`w-7 h-7 rounded-lg font-semibold cursor-pointer ${
                      page === p
                        ? "bg-[#292524] text-white"
                        : "bg-stone-100 hover:bg-stone-200 text-[#57534E]"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CREATE & EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl border border-[#EDE5D5] shadow-2xl max-w-3xl w-full p-6 sm:p-8 space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
              <h2 className="text-lg font-bold text-[#292524] flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#805B10]" />
                <span>{editingPost ? "Chỉnh sửa bài viết" : "Viết bài cẩm nang mới"}</span>
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSavePost} className="space-y-4 text-xs sm:text-sm">
              {/* Title */}
              <div className="space-y-1">
                <label className="font-semibold text-[#292524] block">
                  Tiêu đề bài viết <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={modalForm.title}
                  onChange={(e) => setModalForm({ ...modalForm, title: e.target.value })}
                  placeholder="VD: 5 điều cần lưu ý khi ký hợp đồng thuê trọ..."
                  className="w-full h-11 px-3.5 rounded-xl border border-[#E5E7EB] bg-stone-50 focus:bg-white focus:outline-none focus:border-[#DCA936] text-xs sm:text-sm"
                />
              </div>

              {/* Category & Slug Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-[#292524] block">Danh mục chuyên đề</label>
                  <select
                    value={modalForm.category}
                    onChange={(e) => setModalForm({ ...modalForm, category: e.target.value })}
                    className="w-full h-11 px-3.5 rounded-xl border border-[#E5E7EB] bg-stone-50 focus:bg-white focus:outline-none focus:border-[#DCA936] text-xs sm:text-sm"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#292524] block">
                    Đường dẫn Slug (Tùy chọn)
                  </label>
                  <input
                    type="text"
                    value={modalForm.slug || ""}
                    onChange={(e) => setModalForm({ ...modalForm, slug: e.target.value })}
                    placeholder="Để trống hệ thống sẽ tự sinh từ tiêu đề"
                    className="w-full h-11 px-3.5 rounded-xl border border-[#E5E7EB] bg-stone-50 focus:bg-white focus:outline-none focus:border-[#DCA936] text-xs font-mono"
                  />
                </div>
              </div>

              {/* Cover Image URL */}
              <div className="space-y-1">
                <label className="font-semibold text-[#292524] block">Link ảnh bìa (Cover Image URL)</label>
                <input
                  type="url"
                  value={modalForm.coverImage || ""}
                  onChange={(e) => setModalForm({ ...modalForm, coverImage: e.target.value })}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full h-11 px-3.5 rounded-xl border border-[#E5E7EB] bg-stone-50 focus:bg-white focus:outline-none focus:border-[#DCA936] text-xs sm:text-sm"
                />
              </div>

              {/* Summary / Excerpt */}
              <div className="space-y-1">
                <label className="font-semibold text-[#292524] block">Tóm tắt ngắn (Excerpt)</label>
                <textarea
                  rows={2}
                  value={modalForm.summary}
                  onChange={(e) => setModalForm({ ...modalForm, summary: e.target.value })}
                  placeholder="Tóm tắt nội dung chính trong 1 - 2 câu ngắn gọn..."
                  className="w-full p-3 rounded-xl border border-[#E5E7EB] bg-stone-50 focus:bg-white focus:outline-none focus:border-[#DCA936] text-xs sm:text-sm resize-none"
                />
              </div>

              {/* Full Content */}
              <div className="space-y-1">
                <label className="font-semibold text-[#292524] block">
                  Nội dung chi tiết bài viết <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={8}
                  value={modalForm.content}
                  onChange={(e) => setModalForm({ ...modalForm, content: e.target.value })}
                  placeholder="Viết nội dung bài viết (hỗ trợ định dạng văn bản, tiêu đề, danh sách gạch đầu dòng)..."
                  className="w-full p-3.5 rounded-xl border border-[#E5E7EB] bg-stone-50 focus:bg-white focus:outline-none focus:border-[#DCA936] text-xs sm:text-sm font-sans resize-y leading-relaxed"
                />
              </div>

              {/* Publish Toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isPublishedCheck"
                  checked={modalForm.isPublished}
                  onChange={(e) => setModalForm({ ...modalForm, isPublished: e.target.checked })}
                  className="w-4 h-4 rounded text-[#DCA936] focus:ring-0 cursor-pointer"
                />
                <label htmlFor="isPublishedCheck" className="text-xs font-semibold text-[#292524] cursor-pointer">
                  Xuất bản ngay lập tức lên trang Blog công khai
                </label>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#E5E7EB]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-100 text-xs font-medium cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-[#F4CD65] hover:bg-[#ebbf4d] text-[#292524] text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? "Đang lưu..." : editingPost ? "Lưu thay đổi" : "Xuất bản bài viết"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-[#EDE5D5] shadow-xl max-w-sm w-full p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#292524]">Xác nhận xóa bài viết?</h3>
              <p className="text-xs text-[#78716C]">
                Bài viết này sẽ bị xóa vĩnh viễn khỏi hệ thống và không thể phục hồi.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                disabled={isDeleting}
                className="py-2.5 rounded-xl border border-stone-200 text-stone-600 text-xs font-medium hover:bg-stone-50 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => handleDeletePost(deleteConfirmId)}
                disabled={isDeleting}
                className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
              >
                {isDeleting ? "Đang xóa..." : "Xóa ngay"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

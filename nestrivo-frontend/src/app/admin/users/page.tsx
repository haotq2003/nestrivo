"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Image from "next/image";
import { 
  Users, 
  Search, 
  Lock, 
  Unlock, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  UserCheck, 
  Calendar, 
  Phone, 
  Mail, 
  Building2,
  Eye,
  BadgeCheck,
  Clock,
  UserPlus,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Shield,
  Edit,
  ExternalLink,
  Home
} from "lucide-react";
import { useAdminLayout } from "@/components/admin/AdminWorkspaceLayout";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { adminService } from "@/service/admin.service";
import { AdminUserItem, UserRole, UserStatus, KycStatus, AdminUserStats } from "@/types/admin";

export default function AdminUsersPage() {
  const { toggleMobileMenu } = useAdminLayout();

  // Data states
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [stats, setStats] = useState<AdminUserStats>({
    total: 0,
    landlords: 0,
    renters: 0,
    admins: 0,
    locked: 0,
    verified: 0,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 1,
  });

  // Filter & Search states
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string>("ALL");
  const [selectedKyc, setSelectedKyc] = useState<string>("ALL");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Modals state
  const [lockingUser, setLockingUser] = useState<AdminUserItem | null>(null);
  const [lockReason, setLockReason] = useState<string>("");
  const [inspectUser, setInspectUser] = useState<any | null>(null);
  const [inspectLoading, setInspectLoading] = useState<boolean>(false);
  const [roleEditingUser, setRoleEditingUser] = useState<AdminUserItem | null>(null);
  const [selectedRolesToEdit, setSelectedRolesToEdit] = useState<string[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<AdminUserItem | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Create Form State
  const [createForm, setCreateForm] = useState({
    fullName: "",
    email: "",
    password: "",
    phoneNumber: "",
    role: "RENTER" as "RENTER" | "LANDLORD" | "ADMIN",
  });

  // Edit Form State
  const [editForm, setEditForm] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
  });

  // Toast
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Fetch Users from API
  const fetchUsers = useCallback(async (pageToLoad = 1, silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      // Xác định role và status dựa vào activeTab hoặc filter dropdown
      let roleParam = selectedRole !== "ALL" ? selectedRole : undefined;
      let statusParam: string | undefined = undefined;

      if (activeTab === "LANDLORD") roleParam = "LANDLORD";
      else if (activeTab === "RENTER") roleParam = "RENTER";
      else if (activeTab === "ADMIN") roleParam = "ADMIN";
      else if (activeTab === "LOCKED") statusParam = "LOCKED";

      const res = await adminService.getUsers({
        page: pageToLoad,
        limit: 10,
        search: searchQuery.trim() || undefined,
        role: roleParam,
        status: statusParam,
        verificationStatus: selectedKyc !== "ALL" ? selectedKyc : undefined,
      });

      if (res && res.data) {
        setUsers(res.data);
        if (res.stats) {
          setStats(res.stats);
        }
        if (res.pagination) {
          setPagination(res.pagination);
        }
      }
    } catch (err: any) {
      showToast(err.message || "Không thể tải danh sách tài khoản.", "error");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [activeTab, searchQuery, selectedRole, selectedKyc]);

  // Load on filter / search changes
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchUsers(pagination.page, true);
  };

  // Open Lock / Unlock Modal
  const handleOpenLockModal = (user: AdminUserItem) => {
    if (user.roles?.includes("ADMIN") || user.role === "ADMIN") {
      showToast("Không thể khóa tài khoản Quản trị viên hệ thống.", "error");
      return;
    }
    setLockingUser(user);
    setLockReason(user.status === "ACTIVE" ? "Vi phạm quy chế minh bạch giá và tiền cọc" : "");
  };

  // Confirm Lock / Unlock
  const handleConfirmLockToggle = async () => {
    if (!lockingUser) return;
    setIsProcessing(true);
    try {
      const res = await adminService.toggleLock(lockingUser.id, lockReason);
      if (res && res.success) {
        showToast(res.message, "success");
        setLockingUser(null);
        await fetchUsers(pagination.page, true);
        if (inspectUser?.id === lockingUser.id) {
          handleInspectUser(lockingUser.id);
        }
      } else {
        showToast(res?.message || "Thao tác thất bại.", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Lỗi máy chủ khi cập nhật khóa tài khoản.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  // Inspect User Details
  const handleInspectUser = async (userId: string) => {
    setInspectLoading(true);
    setInspectUser({ id: userId }); // placeholder to show modal
    try {
      const res = await adminService.getUserDetail(userId);
      if (res && res.data) {
        setInspectUser(res.data);
      }
    } catch (err: any) {
      showToast(err.message || "Không thể lấy chi tiết thành viên.", "error");
      setInspectUser(null);
    } finally {
      setInspectLoading(false);
    }
  };

  // Quick KYC Toggle
  const handleToggleKyc = async (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "VERIFIED" ? "NOT_SUBMITTED" : "VERIFIED";
    setIsProcessing(true);
    try {
      const res = await adminService.updateKyc(userId, nextStatus);
      showToast(res.message, "success");
      await fetchUsers(pagination.page, true);
      if (inspectUser?.id === userId) {
        handleInspectUser(userId);
      }
    } catch (err: any) {
      showToast(err.message || "Không thể cập nhật trạng thái KYC.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  // Open Role Editing Modal
  const handleOpenRoleModal = (user: AdminUserItem) => {
    setRoleEditingUser(user);
    const existingRoles = user.roles || [user.role];
    setSelectedRolesToEdit(existingRoles);
  };

  // Save Roles
  const handleSaveRoles = async () => {
    if (!roleEditingUser) return;
    if (selectedRolesToEdit.length === 0) {
      showToast("Cần ít nhất một vai trò hợp lệ.", "error");
      return;
    }
    setIsProcessing(true);
    try {
      const res = await adminService.updateRoles(roleEditingUser.id, selectedRolesToEdit);
      showToast(res.message, "success");
      setRoleEditingUser(null);
      await fetchUsers(pagination.page, true);
      if (inspectUser?.id === roleEditingUser.id) {
        handleInspectUser(roleEditingUser.id);
      }
    } catch (err: any) {
      showToast(err.message || "Không thể cập nhật vai trò.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  // Open Edit User Modal
  const handleOpenEditModal = (user: AdminUserItem) => {
    setEditingUser(user);
    setEditForm({
      fullName: user.fullName || "",
      email: user.email || "",
      phoneNumber: user.phoneNumber || "",
    });
    setIsEditModalOpen(true);
  };

  // Save Edit User
  const handleSaveEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    if (!editForm.fullName.trim() || !editForm.email.trim()) {
      showToast("Họ tên và email không được để trống.", "error");
      return;
    }
    setIsProcessing(true);
    try {
      const res = await adminService.updateUser(editingUser.id, {
        fullName: editForm.fullName.trim(),
        email: editForm.email.trim(),
        phoneNumber: editForm.phoneNumber.trim() || undefined,
      });
      showToast(res.message || "Cập nhật tài khoản thành công.", "success");
      setIsEditModalOpen(false);
      setEditingUser(null);
      await fetchUsers(pagination.page, true);
    } catch (err: any) {
      showToast(err.message || "Lỗi khi cập nhật tài khoản.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  // Create User
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.fullName.trim() || !createForm.email.trim() || !createForm.password) {
      showToast("Vui lòng điền đầy đủ họ tên, email và mật khẩu.", "error");
      return;
    }
    if (createForm.password.length < 6) {
      showToast("Mật khẩu phải từ 6 ký tự trở lên.", "error");
      return;
    }
    setIsProcessing(true);
    try {
      const roles = createForm.role === "LANDLORD" 
        ? ["RENTER", "LANDLORD"] 
        : createForm.role === "ADMIN" 
        ? ["ADMIN"] 
        : ["RENTER"];

      const res = await adminService.createUser({
        fullName: createForm.fullName.trim(),
        email: createForm.email.trim(),
        password: createForm.password,
        phoneNumber: createForm.phoneNumber.trim() || undefined,
        roles,
      });
      showToast(res.message || "Đã tạo tài khoản thành công.", "success");
      setIsCreateModalOpen(false);
      setCreateForm({ fullName: "", email: "", password: "", phoneNumber: "", role: "RENTER" });
      await fetchUsers(1);
    } catch (err: any) {
      showToast(err.message || "Lỗi khi tạo tài khoản.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return "Mới tham gia";
    try {
      const d = new Date(isoString);
      return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`;
    } catch {
      return "Mới tham gia";
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#FFFAEF]/40 min-h-screen">
      {/* Header */}
      <AdminHeader
        onToggleMobileMenu={toggleMobileMenu}
        title="Quản lý tài khoản người dùng"
        subtitle="Danh sách thành viên thực tế, phân quyền tài khoản, xác thực eKYC và xử lý khóa vi phạm"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        placeholder="Tìm theo họ tên, email, số điện thoại..."
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      {/* Main Container */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 xl:px-10 py-6 sm:py-8 space-y-6 w-full max-w-[1920px] mx-auto">
        
        {/* Toast Alert */}
        {toast && (
          <div
            className={`fixed top-20 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl shadow-xl border animate-in slide-in-from-top-3 duration-200 ${
              toast.type === "success"
                ? "bg-[#FFF7E5] text-[#292524] border-[#F4CD65]"
                : "bg-rose-600 text-white border-rose-700"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-[#805B10]" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-white" />
            )}
            <span className="text-xs sm:text-sm font-medium">{toast.message}</span>
          </div>
        )}

        {/* ========================================================= */}
        {/* 1. KPI SUMMARY CARDS                                      */}
        {/* ========================================================= */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          <button
            type="button"
            onClick={() => setActiveTab("ALL")}
            className={`text-left p-4 sm:p-5 rounded-3xl bg-white border border-[#EDE5D5] transition-all cursor-pointer hover:border-[#DCA936] ${
              activeTab === "ALL" ? "ring-2 ring-[#F4CD65] bg-[#FFF7E5] shadow-xs" : ""
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-2xl bg-white border border-[#EDE5D5] flex items-center justify-center text-[#57534E]">
                <Users className="w-5 h-5 text-[#292524]" />
              </div>
              <span className="text-2xl sm:text-3xl font-bold text-[#292524]">{stats.total}</span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-[#292524]">Tất cả thành viên</p>
            <p className="text-[11px] text-[#57534E] mt-0.5">Toàn bộ tài khoản trên hệ thống</p>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("LANDLORD")}
            className={`text-left p-4 sm:p-5 rounded-3xl bg-white border border-[#EDE5D5] transition-all cursor-pointer hover:border-[#DCA936] ${
              activeTab === "LANDLORD" ? "ring-2 ring-[#F4CD65] bg-[#FFF7E5] shadow-xs" : ""
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FFF1CC] border border-[#F4CD65]/40 flex items-center justify-center text-[#805B10]">
                <Building2 className="w-5 h-5 text-[#DCA936]" />
              </div>
              <span className="text-2xl sm:text-3xl font-bold text-[#292524]">{stats.landlords}</span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-[#292524]">Chủ nhà (Landlord)</p>
            <p className="text-[11px] text-[#57534E] mt-0.5">Có quyền đăng tin cho thuê phòng</p>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("RENTER")}
            className={`text-left p-4 sm:p-5 rounded-3xl bg-white border border-[#EDE5D5] transition-all cursor-pointer hover:border-[#DCA936] ${
              activeTab === "RENTER" ? "ring-2 ring-[#F4CD65] bg-[#FFF7E5] shadow-xs" : ""
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FFF7E5] border border-[#EDE5D5] flex items-center justify-center text-[#292524]">
                <UserCheck className="w-5 h-5 text-[#DCA936]" />
              </div>
              <span className="text-2xl sm:text-3xl font-bold text-[#292524]">{stats.renters}</span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-[#292524]">Khách thuê (Renter)</p>
            <p className="text-[11px] text-[#57534E] mt-0.5">Khách tìm phòng và gửi yêu cầu hỏi thuê</p>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("LOCKED")}
            className={`text-left p-4 sm:p-5 rounded-3xl bg-white border border-[#EDE5D5] transition-all cursor-pointer hover:border-rose-300 ${
              activeTab === "LOCKED" ? "ring-2 ring-rose-400 bg-rose-50/50 shadow-xs" : ""
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-700">
                <Lock className="w-5 h-5 text-rose-600" />
              </div>
              <span className="text-2xl sm:text-3xl font-bold text-rose-700">{stats.locked}</span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-[#292524]">Đang bị khóa</p>
            <p className="text-[11px] text-rose-600 mt-0.5">Tài khoản vi phạm quy chế sàn</p>
          </button>
        </section>

        {/* ========================================================= */}
        {/* 2. TOOLBAR: TABS, FILTERS & ADD BUTTON                    */}
        {/* ========================================================= */}
        <div className="p-4 rounded-3xl bg-white border border-[#EDE5D5] shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3.5">
          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            {[
              { id: "ALL", label: "Tất cả", count: stats.total },
              { id: "LANDLORD", label: "Chủ nhà", count: stats.landlords },
              { id: "RENTER", label: "Khách thuê", count: stats.renters },
              { id: "ADMIN", label: "Quản trị viên", count: stats.admins },
              { id: "LOCKED", label: "Bị khóa", count: stats.locked },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-1.5 rounded-2xl text-xs font-medium transition-all shrink-0 cursor-pointer flex items-center gap-1.5 border ${
                    isActive
                      ? "bg-[#F4CD65] text-[#292524] border-[#DCA936] font-semibold shadow-2xs"
                      : "bg-[#FFFAEF] text-[#57534E] border-[#EDE5D5] hover:bg-[#FFF7E5] hover:text-[#292524]"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? "bg-[#292524]/10 text-[#292524] font-semibold" : "bg-white text-[#57534E] border border-[#EDE5D5]"}`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right Action Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Filter KYC */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-[#57534E] font-medium hidden sm:inline">eKYC:</span>
              <select
                value={selectedKyc}
                onChange={(e) => setSelectedKyc(e.target.value)}
                className="bg-[#FFFAEF] border border-[#EDE5D5] rounded-xl px-3 py-1.5 text-xs font-medium text-[#292524] focus:outline-none cursor-pointer"
              >
                <option value="ALL">Tất cả eKYC</option>
                <option value="VERIFIED">Đã xác minh (Verified)</option>
                <option value="PENDING">Chờ duyệt (Pending)</option>
                <option value="NOT_VERIFIED">Chưa xác minh</option>
                <option value="REJECTED">Bị từ chối</option>
              </select>
            </div>

            {/* Filter Role */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-[#57534E] font-medium hidden sm:inline">Vai trò:</span>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="bg-[#FFFAEF] border border-[#EDE5D5] rounded-xl px-3 py-1.5 text-xs font-medium text-[#292524] focus:outline-none cursor-pointer"
              >
                <option value="ALL">Tất cả vai trò</option>
                <option value="LANDLORD">Chủ nhà (LANDLORD)</option>
                <option value="RENTER">Khách thuê (RENTER)</option>
                <option value="ADMIN">Quản trị viên (ADMIN)</option>
              </select>
            </div>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-1.5 rounded-xl border border-[#EDE5D5] bg-[#FFFAEF] hover:bg-[#FFF7E5] text-[#292524] transition-colors"
              title="Làm mới dữ liệu"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-[#DCA936]" : ""}`} />
            </button>

            {/* Add User Button */}
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#292524] text-white hover:bg-[#44403C] text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Thêm tài khoản</span>
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 3. USERS TABLE                                            */}
        {/* ========================================================= */}
        <div className="bg-white rounded-3xl border border-[#EDE5D5] shadow-xs overflow-hidden">
          {isLoading ? (
            <div className="p-16 text-center space-y-3">
              <RefreshCw className="w-8 h-8 animate-spin text-[#DCA936] mx-auto" />
              <p className="text-sm font-medium text-[#57534E]">Đang tải dữ liệu tài khoản từ cơ sở dữ liệu...</p>
            </div>
          ) : users.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#EDE5D5] bg-[#FFF7E5]/75 text-[11px] font-semibold text-[#57534E] uppercase tracking-wider">
                    <th className="py-3.5 px-4 sm:px-6 min-w-[280px]">Thành viên</th>
                    <th className="py-3.5 px-4 w-36">Vai trò</th>
                    <th className="py-3.5 px-4 w-36">Trạng thái</th>
                    <th className="py-3.5 px-4 w-36">Định danh eKYC</th>
                    <th className="py-3.5 px-4 w-32">Tin đã đăng</th>
                    <th className="py-3.5 px-4 w-36">Ngày tham gia</th>
                    <th className="py-3.5 px-4 sm:px-6 w-44 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EDE5D5]/60 text-sm">
                  {users.map((user) => {
                    const isLocked = user.status === "LOCKED" || user.isActive === false;
                    const isKyc = user.verificationStatus === "VERIFIED";
                    const isLandlord = user.roles?.includes("LANDLORD") || user.role === "LANDLORD";

                    return (
                      <tr key={user.id} className="hover:bg-[#FFF7E5]/40 transition-colors group">
                        {/* 1. Member info */}
                        <td className="py-4 px-4 sm:px-6">
                          <div className="flex items-center gap-3">
                            <div className="relative w-10 h-10 rounded-2xl overflow-hidden bg-[#FFF1CC] border border-[#EDE5D5] flex items-center justify-center font-semibold text-sm text-[#292524] shrink-0">
                              {user.avatarUrl ? (
                                <Image src={user.avatarUrl} alt="" fill className="object-cover" />
                              ) : (
                                <span>{user.fullName?.charAt(0) || "U"}</span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-[#292524] text-sm truncate flex items-center gap-1.5">
                                <span>{user.fullName}</span>
                                {isKyc && (
                                  <span title="Chủ nhà đã xác thực eKYC" className="inline-flex">
                                    <BadgeCheck className="w-4 h-4 text-[#DCA936] shrink-0" />
                                  </span>
                                )}
                              </p>
                              <p className="text-xs text-[#57534E] truncate">{user.email}</p>
                              <p className="text-[11px] text-[#78716C] truncate">
                                {user.phoneNumber ? `SĐT: ${user.phoneNumber}` : "Chưa cập nhật SĐT"}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* 2. Role */}
                        <td className="py-4 px-4">
                          <div className="flex flex-wrap gap-1">
                            {user.roles && user.roles.length > 0 ? (
                              user.roles.map((r) => (
                                <span
                                  key={r}
                                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-xl text-[11px] font-medium border ${
                                    r === "ADMIN"
                                      ? "bg-purple-50 text-purple-800 border-purple-200"
                                      : r === "LANDLORD"
                                      ? "bg-[#FFF1CC] text-[#805B10] border-[#F4CD65]/40"
                                      : "bg-[#FFF7E5] text-[#292524] border-[#EDE5D5]"
                                  }`}
                                >
                                  {r === "ADMIN" && <ShieldCheck className="w-3 h-3 text-purple-600" />}
                                  {r === "LANDLORD" && <Building2 className="w-3 h-3 text-[#DCA936]" />}
                                  {r === "RENTER" && <UserCheck className="w-3 h-3 text-[#A8A29E]" />}
                                  <span>{r === "ADMIN" ? "Admin" : r === "LANDLORD" ? "Chủ nhà" : "Khách thuê"}</span>
                                </span>
                              ))
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-xl text-xs font-medium bg-[#FFF7E5] text-[#292524] border border-[#EDE5D5]">
                                <span>{user.role}</span>
                              </span>
                            )}
                          </div>
                        </td>

                        {/* 3. Account Status */}
                        <td className="py-4 px-4">
                          {isLocked ? (
                            <div>
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-800 border border-rose-200">
                                <Lock className="w-3 h-3 text-rose-600" />
                                <span>Bị khóa</span>
                              </span>
                              {user.lockReason && (
                                <p className="text-[10px] text-rose-600 mt-1 line-clamp-1 max-w-[150px]" title={user.lockReason}>
                                  {user.lockReason}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FFF1CC] text-[#805B10] border border-[#F4CD65]/40">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
                              <span>Hoạt động</span>
                            </span>
                          )}
                        </td>

                        {/* 4. KYC Status */}
                        <td className="py-4 px-4">
                          {isKyc ? (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-[#805B10]">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
                              <span>Đã duyệt</span>
                            </span>
                          ) : user.verificationStatus === "PENDING" ? (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700">
                              <Clock className="w-3.5 h-3.5 text-amber-500" />
                              <span>Chờ duyệt</span>
                            </span>
                          ) : user.verificationStatus === "REJECTED" ? (
                            <span className="text-xs text-rose-600 font-medium">Từ chối</span>
                          ) : (
                            <span className="text-xs text-[#57534E]">Chưa KYC</span>
                          )}
                        </td>

                        {/* 5. Total Listings */}
                        <td className="py-4 px-4 text-xs font-medium text-[#292524]">
                          {isLandlord ? (
                            <span>{user.totalListings ?? 0} tin</span>
                          ) : (
                            <span className="text-[#A8A29E]">-</span>
                          )}
                        </td>

                        {/* 6. Date Created */}
                        <td className="py-4 px-4 text-xs text-[#57534E]">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-[#A8A29E]" />
                            <span>{formatDate(user.createdAt)}</span>
                          </span>
                        </td>

                        {/* 7. Action Buttons */}
                        <td className="py-4 px-4 sm:px-6 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Inspect Details */}
                            <button
                              type="button"
                              onClick={() => handleInspectUser(user.id)}
                              className="p-1.5 rounded-xl border border-[#EDE5D5] bg-[#FFFAEF] hover:bg-[#FFF7E5] text-[#292524] text-xs font-medium transition-colors cursor-pointer"
                              title="Xem chi tiết hồ sơ thành viên"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* Edit Info */}
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(user)}
                              className="p-1.5 rounded-xl border border-[#EDE5D5] bg-[#FFFAEF] hover:bg-[#FFF7E5] text-[#292524] text-xs font-medium transition-colors cursor-pointer"
                              title="Chỉnh sửa thông tin cơ bản"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>

                            {/* Change Role */}
                            <button
                              type="button"
                              onClick={() => handleOpenRoleModal(user)}
                              className="p-1.5 rounded-xl border border-[#EDE5D5] bg-[#FFFAEF] hover:bg-[#FFF7E5] text-[#805B10] text-xs font-medium transition-colors cursor-pointer"
                              title="Phân quyền vai trò (Roles)"
                            >
                              <Shield className="w-3.5 h-3.5 text-[#DCA936]" />
                            </button>

                            {/* Lock / Unlock */}
                            {!user.roles?.includes("ADMIN") && user.role !== "ADMIN" && (
                              <button
                                type="button"
                                onClick={() => handleOpenLockModal(user)}
                                className={`p-1.5 rounded-xl border transition-all text-xs font-medium cursor-pointer ${
                                  isLocked
                                    ? "bg-[#FFF1CC] text-[#805B10] border-[#F4CD65] hover:bg-[#F4CD65] hover:text-[#292524]"
                                    : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-600 hover:text-white"
                                }`}
                                title={isLocked ? "Mở khóa tài khoản này" : "Khóa tài khoản vi phạm"}
                              >
                                {isLocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#FFF1CC] text-[#DCA936] flex items-center justify-center mx-auto">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-[#292524]">Không tìm thấy tài khoản phù hợp</h3>
              <p className="text-xs text-[#57534E]">Thử điều chỉnh lại từ khóa tìm kiếm hoặc chọn bộ lọc khác.</p>
            </div>
          )}

          {/* Pagination Bar */}
          {pagination.totalPages > 1 && (
            <div className="px-4 py-3.5 border-t border-[#EDE5D5] bg-[#FFF7E5]/30 flex items-center justify-between">
              <span className="text-xs text-[#57534E]">
                Trang <b className="text-[#292524]">{pagination.page}</b> / <b>{pagination.totalPages}</b> (Tổng cộng {pagination.totalItems} tài khoản)
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={pagination.page <= 1}
                  onClick={() => fetchUsers(pagination.page - 1)}
                  className="p-1.5 rounded-xl border border-[#EDE5D5] bg-white text-xs font-medium text-[#292524] hover:bg-[#FFF7E5] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => fetchUsers(pagination.page + 1)}
                  className="p-1.5 rounded-xl border border-[#EDE5D5] bg-white text-xs font-medium text-[#292524] hover:bg-[#FFF7E5] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* 4. MODAL: LOCK / UNLOCK USER                              */}
        {/* ========================================================= */}
        {lockingUser && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
            onClick={() => setLockingUser(null)}
          >
            <div
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#EDE5D5] overflow-hidden p-6 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#EDE5D5]">
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${lockingUser.status === "ACTIVE" ? "bg-rose-100 text-rose-700" : "bg-[#FFF1CC] text-[#805B10]"}`}>
                    {lockingUser.status === "ACTIVE" ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-[#292524]">
                      {lockingUser.status === "ACTIVE" ? "Khóa tài khoản vi phạm" : "Mở khóa tài khoản"}
                    </h3>
                    <p className="text-xs text-[#57534E]">Bảo vệ quyền lợi cộng đồng Nestrivo</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setLockingUser(null)}
                  className="p-1 rounded-lg text-[#78716C] hover:text-[#292524]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User summary */}
              <div className="p-3 rounded-2xl bg-[#FFFAEF] border border-[#EDE5D5] flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-[#EDE5D5] flex items-center justify-center font-semibold text-[#292524]">
                  {lockingUser.fullName?.charAt(0) || "U"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-[#292524] truncate">{lockingUser.fullName}</p>
                  <p className="text-[11px] text-[#57534E] truncate">{lockingUser.email} • {lockingUser.phoneNumber || "Không có SĐT"}</p>
                </div>
              </div>

              {lockingUser.status === "ACTIVE" ? (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#292524] block">
                    Lý do khóa tài khoản <span className="text-rose-600">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={lockReason}
                    onChange={(e) => setLockReason(e.target.value)}
                    placeholder="Nhập lý do cụ thể (VD: Cố tình đăng giá ảo, lừa đảo cọc, spam tin rác...)"
                    className="w-full p-3 rounded-xl border border-[#EDE5D5] bg-[#FFFAEF] text-xs sm:text-sm text-[#292524] placeholder:text-[#A8A29E] focus:outline-none focus:border-rose-400 focus:bg-white resize-none"
                  />
                  <p className="text-[11px] text-[#57534E]">
                    Khi bị khóa, người dùng sẽ không thể đăng tin mới hoặc tương tác trên sàn Nestrivo.
                  </p>
                </div>
              ) : (
                <p className="text-xs text-[#57534E] leading-relaxed">
                  Tài khoản đang bị khóa từ ngày: <b className="font-semibold text-[#292524]">{lockingUser.lockedAt ? formatDate(lockingUser.lockedAt) : "Trước đó"}</b>. Bạn có chắc chắn muốn mở khóa và khôi phục toàn bộ quyền hoạt động cho thành viên này?
                </p>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#EDE5D5]">
                <button
                  type="button"
                  onClick={() => setLockingUser(null)}
                  disabled={isProcessing}
                  className="px-4 py-2.5 rounded-xl border border-[#EDE5D5] text-xs font-medium text-[#57534E] hover:bg-[#FFF7E5]"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={handleConfirmLockToggle}
                  disabled={isProcessing || (lockingUser.status === "ACTIVE" && lockReason.trim().length < 3)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer ${
                    lockingUser.status === "ACTIVE"
                      ? "bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
                      : "bg-[#F4CD65] hover:bg-[#ebbf4d] text-[#292524] shadow-xs"
                  }`}
                >
                  {isProcessing ? "Đang xử lý..." : lockingUser.status === "ACTIVE" ? "Xác nhận khóa" : "Xác nhận mở khóa"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 5. MODAL: INSPECT USER DETAILS                            */}
        {/* ========================================================= */}
        {inspectUser && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
            onClick={() => setInspectUser(null)}
          >
            <div
              className="relative w-full max-w-xl max-h-[90vh] flex flex-col bg-white rounded-3xl shadow-2xl border border-[#EDE5D5] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 pb-4 border-b border-[#EDE5D5] flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-[#292524]">Hồ sơ thành viên Nestrivo</h3>
                  <p className="text-xs text-[#57534E]">Thông tin chi tiết, lịch sử tin đăng & định danh eKYC</p>
                </div>
                <button
                  type="button"
                  onClick={() => setInspectUser(null)}
                  className="p-1 rounded-lg text-[#78716C] hover:text-[#292524]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto space-y-5 flex-1">
                {inspectLoading ? (
                  <div className="py-12 text-center">
                    <RefreshCw className="w-6 h-6 animate-spin text-[#DCA936] mx-auto mb-2" />
                    <p className="text-xs text-[#57534E]">Đang tải thông tin chi tiết...</p>
                  </div>
                ) : (
                  <>
                    {/* User Card */}
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#FFF7E5] border border-[#EDE5D5]">
                      <div className="w-14 h-14 rounded-2xl bg-[#FFF1CC] border border-[#EDE5D5] flex items-center justify-center font-bold text-xl text-[#292524] shrink-0">
                        {inspectUser.fullName?.charAt(0) || "U"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-base text-[#292524] truncate">{inspectUser.fullName}</p>
                          {inspectUser.isActive === false && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-rose-100 text-rose-800 border border-rose-200">
                              Bị khóa
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#57534E] mt-0.5">{inspectUser.email}</p>
                        <p className="text-xs text-[#805B10] font-semibold mt-0.5">
                          Vai trò: {Array.isArray(inspectUser.roles) ? inspectUser.roles.join(", ") : inspectUser.role}
                        </p>
                      </div>
                    </div>

                    {/* eKYC Status & Action */}
                    <div className="p-4 rounded-2xl bg-[#FFFAEF] border border-[#EDE5D5] space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-semibold text-[#292524]">Trạng thái eKYC Chủ Nhà</p>
                          <p className="text-[11px] text-[#57534E]">Xác minh giấy tờ CCCD/CMND của chủ nhà</p>
                        </div>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold border ${
                          inspectUser.verificationStatus === "VERIFIED"
                            ? "bg-[#FFF1CC] text-[#805B10] border-[#F4CD65]"
                            : inspectUser.verificationStatus === "PENDING"
                            ? "bg-amber-50 text-amber-800 border-amber-200"
                            : "bg-slate-100 text-slate-700 border-slate-200"
                        }`}>
                          {inspectUser.verificationStatus === "VERIFIED" ? "ĐÃ XÁC MINH" : inspectUser.verificationStatus === "PENDING" ? "CHỜ DUYỆT" : "CHƯA XÁC MINH"}
                        </span>
                      </div>

                      <div className="pt-2 flex items-center justify-end">
                        <button
                          type="button"
                          onClick={() => handleToggleKyc(inspectUser.id, inspectUser.verificationStatus)}
                          disabled={isProcessing}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                            inspectUser.verificationStatus === "VERIFIED"
                              ? "bg-white text-rose-600 border-rose-300 hover:bg-rose-50"
                              : "bg-[#F4CD65] text-[#292524] border-[#DCA936] hover:bg-[#ebbf4d]"
                          }`}
                        >
                          {inspectUser.verificationStatus === "VERIFIED" ? "Thu hồi xác thực eKYC" : "Duyệt xác thực eKYC ngay"}
                        </button>
                      </div>
                    </div>

                    {/* Detail Items */}
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-2 border-b border-[#EDE5D5]">
                        <span className="text-[#57534E]">Số điện thoại:</span>
                        <b className="text-[#292524] font-medium">{inspectUser.phoneNumber || "Chưa cung cấp"}</b>
                      </div>
                      <div className="flex justify-between py-2 border-b border-[#EDE5D5]">
                        <span className="text-[#57534E]">Ngày đăng ký:</span>
                        <b className="text-[#292524] font-medium">{formatDate(inspectUser.createdAt)}</b>
                      </div>
                      <div className="flex justify-between py-2 border-b border-[#EDE5D5]">
                        <span className="text-[#57534E]">Tổng tin đăng:</span>
                        <b className="text-[#292524] font-medium">{inspectUser.totalListings || 0} phòng trọ</b>
                      </div>
                      {inspectUser.lockReason && (
                        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800">
                          <span className="font-semibold block mb-0.5">Lý do khóa tài khoản:</span>
                          <p>{inspectUser.lockReason}</p>
                        </div>
                      )}
                    </div>

                    {/* Recent Listings */}
                    {inspectUser.recentListings && inspectUser.recentListings.length > 0 && (
                      <div className="space-y-2 pt-1">
                        <p className="text-xs font-semibold text-[#292524]">Tin đăng gần đây ({inspectUser.recentListings.length}):</p>
                        <div className="space-y-2">
                          {inspectUser.recentListings.map((l: any) => (
                            <div key={l.id} className="p-3 rounded-xl bg-white border border-[#EDE5D5] flex items-center justify-between text-xs">
                              <div className="min-w-0 flex-1 pr-3">
                                <p className="font-semibold text-[#292524] truncate">{l.title}</p>
                                <p className="text-[11px] text-[#57534E]">{Number(l.price).toLocaleString("vi-VN")} đ/tháng</p>
                              </div>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#FFF7E5] text-[#805B10] border border-[#EDE5D5]">
                                {l.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-[#EDE5D5] bg-[#FFF7E5]/30 flex justify-end">
                <button
                  type="button"
                  onClick={() => setInspectUser(null)}
                  className="px-5 py-2.5 rounded-xl bg-[#F4CD65] text-[#292524] text-xs font-semibold hover:bg-[#ebbf4d]"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 6. MODAL: EDIT ROLES                                      */}
        {/* ========================================================= */}
        {roleEditingUser && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
            onClick={() => setRoleEditingUser(null)}
          >
            <div
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#EDE5D5] overflow-hidden p-6 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#EDE5D5]">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-[#DCA936]" />
                  <h3 className="text-base font-semibold text-[#292524]">Phân quyền vai trò</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setRoleEditingUser(null)}
                  className="p-1 rounded-lg text-[#78716C] hover:text-[#292524]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-[#57534E]">
                Cập nhật quyền hạn cho tài khoản: <b className="text-[#292524]">{roleEditingUser.fullName}</b>
              </p>

              <div className="space-y-2.5 pt-1">
                {[
                  { id: "RENTER", label: "Khách thuê (RENTER)", desc: "Tìm phòng, gửi yêu cầu liên hệ và lưu yêu thích" },
                  { id: "LANDLORD", label: "Chủ nhà (LANDLORD)", desc: "Được phép đăng tin cho thuê, quản lý phòng và mua gói tin nổi bật" },
                  { id: "ADMIN", label: "Quản trị viên (ADMIN)", desc: "Quyền quản trị toàn bộ hệ thống Nestrivo" },
                ].map((item) => {
                  const isChecked = selectedRolesToEdit.includes(item.id);
                  return (
                    <label
                      key={item.id}
                      className={`flex items-start gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                        isChecked ? "bg-[#FFF7E5] border-[#F4CD65]" : "bg-white border-[#EDE5D5] hover:bg-[#FFFAEF]"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedRolesToEdit((prev) => [...prev, item.id]);
                          } else {
                            setSelectedRolesToEdit((prev) => prev.filter((r) => r !== item.id));
                          }
                        }}
                        className="mt-0.5 rounded text-[#DCA936] focus:ring-[#F4CD65]"
                      />
                      <div>
                        <p className="text-xs font-semibold text-[#292524]">{item.label}</p>
                        <p className="text-[11px] text-[#57534E] mt-0.5">{item.desc}</p>
                      </div>
                    </label>
                  );
                })}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#EDE5D5]">
                <button
                  type="button"
                  onClick={() => setRoleEditingUser(null)}
                  disabled={isProcessing}
                  className="px-4 py-2 rounded-xl border border-[#EDE5D5] text-xs font-medium text-[#57534E] hover:bg-[#FFF7E5]"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleSaveRoles}
                  disabled={isProcessing || selectedRolesToEdit.length === 0}
                  className="px-5 py-2 rounded-xl bg-[#F4CD65] text-[#292524] text-xs font-semibold hover:bg-[#ebbf4d] disabled:opacity-50"
                >
                  {isProcessing ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 7. MODAL: CREATE USER                                     */}
        {/* ========================================================= */}
        {isCreateModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
            onClick={() => setIsCreateModalOpen(false)}
          >
            <div
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#EDE5D5] overflow-hidden p-6 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#EDE5D5]">
                <div className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-[#292524]" />
                  <h3 className="text-base font-semibold text-[#292524]">Thêm tài khoản người dùng</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-1 rounded-lg text-[#78716C] hover:text-[#292524]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-3.5">
                <div>
                  <label className="text-xs font-semibold text-[#292524] block mb-1">
                    Họ và tên <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={createForm.fullName}
                    onChange={(e) => setCreateForm({ ...createForm, fullName: e.target.value })}
                    placeholder="VD: Nguyễn Văn Nam"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EDE5D5] bg-[#FFFAEF] text-xs text-[#292524] focus:outline-none focus:border-[#DCA936] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#292524] block mb-1">
                    Địa chỉ Email <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                    placeholder="VD: nam.nguyen@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EDE5D5] bg-[#FFFAEF] text-xs text-[#292524] focus:outline-none focus:border-[#DCA936] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#292524] block mb-1">
                    Mật khẩu đăng nhập <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={createForm.password}
                    onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                    placeholder="Tối thiểu 6 ký tự"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EDE5D5] bg-[#FFFAEF] text-xs text-[#292524] focus:outline-none focus:border-[#DCA936] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#292524] block mb-1">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    value={createForm.phoneNumber}
                    onChange={(e) => setCreateForm({ ...createForm, phoneNumber: e.target.value })}
                    placeholder="VD: 0912345678"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EDE5D5] bg-[#FFFAEF] text-xs text-[#292524] focus:outline-none focus:border-[#DCA936] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#292524] block mb-1">
                    Vai trò khởi tạo
                  </label>
                  <select
                    value={createForm.role}
                    onChange={(e) => setCreateForm({ ...createForm, role: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EDE5D5] bg-[#FFFAEF] text-xs text-[#292524] focus:outline-none focus:border-[#DCA936] focus:bg-white cursor-pointer"
                  >
                    <option value="RENTER">Khách tìm phòng (RENTER)</option>
                    <option value="LANDLORD">Chủ nhà cho thuê (LANDLORD)</option>
                    <option value="ADMIN">Quản trị viên (ADMIN)</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#EDE5D5]">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    disabled={isProcessing}
                    className="px-4 py-2 rounded-xl border border-[#EDE5D5] text-xs font-medium text-[#57534E] hover:bg-[#FFF7E5]"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="px-5 py-2 rounded-xl bg-[#292524] text-white text-xs font-semibold hover:bg-[#44403C] disabled:opacity-50"
                  >
                    {isProcessing ? "Đang tạo..." : "Xác nhận tạo"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 8. MODAL: EDIT BASIC USER INFO                            */}
        {/* ========================================================= */}
        {isEditModalOpen && editingUser && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
            onClick={() => setIsEditModalOpen(false)}
          >
            <div
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#EDE5D5] overflow-hidden p-6 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#EDE5D5]">
                <div className="flex items-center gap-2">
                  <Edit className="w-5 h-5 text-[#292524]" />
                  <h3 className="text-base font-semibold text-[#292524]">Chỉnh sửa thông tin</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-1 rounded-lg text-[#78716C] hover:text-[#292524]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEditUser} className="space-y-3.5">
                <div>
                  <label className="text-xs font-semibold text-[#292524] block mb-1">
                    Họ và tên
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.fullName}
                    onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EDE5D5] bg-[#FFFAEF] text-xs text-[#292524] focus:outline-none focus:border-[#DCA936] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#292524] block mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EDE5D5] bg-[#FFFAEF] text-xs text-[#292524] focus:outline-none focus:border-[#DCA936] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#292524] block mb-1">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    value={editForm.phoneNumber}
                    onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                    placeholder="VD: 0912345678"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EDE5D5] bg-[#FFFAEF] text-xs text-[#292524] focus:outline-none focus:border-[#DCA936] focus:bg-white"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#EDE5D5]">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    disabled={isProcessing}
                    className="px-4 py-2 rounded-xl border border-[#EDE5D5] text-xs font-medium text-[#57534E] hover:bg-[#FFF7E5]"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="px-5 py-2 rounded-xl bg-[#F4CD65] text-[#292524] text-xs font-semibold hover:bg-[#ebbf4d] disabled:opacity-50"
                  >
                    {isProcessing ? "Đang lưu..." : "Lưu thay đổi"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

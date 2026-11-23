"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCheck,
  AlertTriangle,
  ShieldAlert,
  Clock,
  CheckCircle2,
  Info,
  MessageSquare,
  CalendarCheck,
  CalendarX,
  Trash2,
  ExternalLink,
  BellOff,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  AppNotification,
  NotificationType,
  fetchNotificationsApi,
  markNotificationAsReadApi,
  markAllNotificationsAsReadApi,
  deleteNotificationApi,
} from "@/service/notification.service";

function formatRelativeTime(dateString: string): string {
  try {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Vừa xong";
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} ngày trước`;

    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

function getNotificationVisuals(type: NotificationType) {
  switch (type) {
    case "ADMIN_WARNING_24H":
      return {
        icon: AlertTriangle,
        iconBg: "bg-amber-100 text-amber-800 border-amber-200",
        badge: "Cảnh báo 24h",
        badgeColor: "bg-amber-50 text-amber-800 border-amber-200",
      };
    case "ADMIN_HIDE_LISTING":
      return {
        icon: ShieldAlert,
        iconBg: "bg-rose-100 text-rose-700 border-rose-200",
        badge: "Gỡ tin",
        badgeColor: "bg-rose-50 text-rose-700 border-rose-200",
      };
    case "ADMIN_AUTO_HIDE":
      return {
        icon: Clock,
        iconBg: "bg-orange-100 text-orange-700 border-orange-200",
        badge: "Tự động gỡ",
        badgeColor: "bg-orange-50 text-orange-700 border-orange-200",
      };
    case "REPORT_RESOLVED":
      return {
        icon: CheckCircle2,
        iconBg: "bg-emerald-100 text-emerald-700 border-emerald-200",
        badge: "Đã giải quyết",
        badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      };
    case "REPORT_DISMISSED":
      return {
        icon: Info,
        iconBg: "bg-slate-100 text-slate-700 border-slate-200",
        badge: "Bác bỏ",
        badgeColor: "bg-slate-50 text-slate-700 border-slate-200",
      };
    case "INQUIRY_RECEIVED":
      return {
        icon: MessageSquare,
        iconBg: "bg-blue-100 text-blue-700 border-blue-200",
        badge: "Hỏi thuê",
        badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
      };
    case "INQUIRY_CONFIRMED":
      return {
        icon: CalendarCheck,
        iconBg: "bg-emerald-100 text-emerald-700 border-emerald-200",
        badge: "Xác nhận hẹn",
        badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      };
    case "INQUIRY_REJECTED":
      return {
        icon: CalendarX,
        iconBg: "bg-rose-100 text-rose-700 border-rose-200",
        badge: "Từ chối",
        badgeColor: "bg-rose-50 text-rose-700 border-rose-200",
      };
    case "SYSTEM_ANNOUNCEMENT":
    default:
      return {
        icon: Bell,
        iconBg: "bg-[#FFF7E5] text-[#805B10] border-[#F4CD65]/40",
        badge: "Hệ thống",
        badgeColor: "bg-[#FFFAEF] text-[#805B10] border-[#EDE5D5]",
      };
  }
}

interface NotificationBellProps {
  className?: string;
}

export function NotificationBell({ className = "" }: NotificationBellProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"ALL" | "UNREAD">("ALL");

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Tải danh sách thông báo từ API
  const loadNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setIsLoading(true);
      const res = await fetchNotificationsApi(30, false);
      if (res?.success) {
        setNotifications(res.data || []);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch (err) {
      // Bỏ qua lỗi kết nối nhẹ để không gián đoạn giao diện
      console.warn("Không thể tải thông báo:", err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Khởi tạo và thiết lập polling định kỳ mỗi 60s
  useEffect(() => {
    if (isAuthenticated) {
      loadNotifications();
      const interval = setInterval(loadNotifications, 60000);
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isAuthenticated, loadNotifications]);

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Xử lý khi click vào 1 thông báo
  const handleNotificationClick = async (notif: AppNotification) => {
    // 1. Đánh dấu đã đọc nếu chưa đọc
    if (!notif.isRead) {
      try {
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
        await markNotificationAsReadApi(notif.id);
      } catch (e) {
        console.error("Lỗi markNotificationAsRead:", e);
      }
    }

    // 2. Điều hướng nếu có link
    if (notif.link) {
      setIsOpen(false);
      router.push(notif.link);
    }
  };

  // Đánh dấu tất cả là đã đọc
  const handleMarkAllRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      await markAllNotificationsAsReadApi();
    } catch (e) {
      console.error("Lỗi markAllNotificationsAsRead:", e);
    }
  };

  // Xóa 1 thông báo
  const handleDeleteNotification = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      const target = notifications.find((n) => n.id === id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      if (target && !target.isRead) {
        setUnreadCount((c) => Math.max(0, c - 1));
      }
      await deleteNotificationApi(id);
    } catch (e) {
      console.error("Lỗi deleteNotification:", e);
    }
  };

  if (!isAuthenticated) return null;

  const filteredNotifications =
    activeTab === "UNREAD"
      ? notifications.filter((n) => !n.isRead)
      : notifications;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Quả chuông kích hoạt */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) loadNotifications();
        }}
        className="relative p-2.5 rounded-xl text-[#57534E] hover:text-[#292524] hover:bg-[#FFF7E5] border border-transparent hover:border-[#EDE5D5] transition-all focus:outline-none flex items-center justify-center min-w-[40px] min-h-[40px]"
        aria-label="Thông báo"
        title="Thông báo"
      >
        <Bell className="w-5 h-5" />

        {/* Badge số lượng thông báo chưa đọc */}
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-600 text-[10px] font-bold text-white flex items-center justify-center shadow-xs animate-in zoom-in-75 ring-2 ring-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu Danh Sách Thông Báo */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-[#EDE5D5] shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header Panel */}
          <div className="px-4 py-3 border-b border-[#EDE5D5]/80 bg-[#FFFAEF]/80 backdrop-blur-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#292524]">Thông báo</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-[#805B10]/10 text-[#805B10] text-[11px] font-semibold">
                  {unreadCount} mới
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="flex items-center gap-1 text-[11px] font-semibold text-[#805B10] hover:text-[#5c4007] transition-colors"
                title="Đánh dấu tất cả là đã đọc"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Đã đọc tất cả</span>
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="px-3 pt-2 pb-1.5 flex gap-1 border-b border-stone-100 bg-white">
            <button
              type="button"
              onClick={() => setActiveTab("ALL")}
              className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors ${
                activeTab === "ALL"
                  ? "bg-[#FFF7E5] text-[#805B10] font-semibold"
                  : "text-stone-500 hover:text-stone-800"
              }`}
            >
              Tất cả ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("UNREAD")}
              className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors ${
                activeTab === "UNREAD"
                  ? "bg-[#FFF7E5] text-[#805B10] font-semibold"
                  : "text-stone-500 hover:text-stone-800"
              }`}
            >
              Chưa đọc ({unreadCount})
            </button>
          </div>

          {/* Body: Danh sách thông báo */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-stone-100">
            {isLoading && notifications.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-stone-400 gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-[#805B10]" />
                <span className="text-xs">Đang tải thông báo...</span>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="py-12 px-6 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-400 mb-3">
                  <BellOff className="w-6 h-6" />
                </div>
                <p className="text-xs font-semibold text-stone-700">
                  {activeTab === "UNREAD"
                    ? "Tuyệt vời! Bạn không có thông báo chưa đọc nào."
                    : "Chưa có thông báo nào"}
                </p>
                <p className="text-[11px] text-stone-400 mt-1">
                  Các thông báo duyệt tin, cảnh báo và hỏi thuê phòng sẽ hiển thị ở đây.
                </p>
              </div>
            ) : (
              filteredNotifications.map((notif) => {
                const visual = getNotificationVisuals(notif.type);
                const IconComponent = visual.icon;

                return (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`p-3.5 flex gap-3 transition-colors cursor-pointer group relative ${
                      notif.isRead
                        ? "bg-white hover:bg-stone-50/80"
                        : "bg-[#FFFDF7] hover:bg-[#FFF7E5]/50 border-l-3 border-[#805B10]"
                    }`}
                  >
                    {/* Visual Icon Badge */}
                    <div
                      className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${visual.iconBg}`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.2 rounded border ${visual.badgeColor}`}
                        >
                          {visual.badge}
                        </span>
                        <span className="text-[10px] text-stone-400">
                          {formatRelativeTime(notif.createdAt)}
                        </span>
                      </div>

                      <h4
                        className={`text-xs mt-1 leading-snug line-clamp-2 ${
                          notif.isRead
                            ? "font-medium text-stone-800"
                            : "font-bold text-[#292524]"
                        }`}
                      >
                        {notif.title}
                      </h4>

                      <p className="text-[11px] text-stone-600 mt-1 leading-relaxed line-clamp-3 whitespace-pre-line">
                        {notif.message}
                      </p>

                      {notif.link && (
                        <div className="flex items-center gap-1 text-[11px] font-medium text-[#805B10] mt-1.5 group-hover:underline">
                          <span>Xem chi tiết</span>
                          <ExternalLink className="w-3 h-3" />
                        </div>
                      )}
                    </div>

                    {/* Right action: Delete */}
                    <div className="absolute right-2.5 top-2.5 flex items-center gap-1">
                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full bg-[#805B10] shrink-0" />
                      )}
                      <button
                        type="button"
                        onClick={(e) => handleDeleteNotification(e, notif.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-stone-400 hover:text-rose-600 rounded transition-opacity"
                        title="Xóa thông báo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Panel */}
          {notifications.length > 0 && (
            <div className="px-4 py-2 bg-stone-50 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
              <span>Tự động cập nhật mỗi phút</span>
              <button
                type="button"
                onClick={loadNotifications}
                className="text-[#805B10] font-medium hover:underline"
              >
                Làm mới
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

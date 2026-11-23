import { AdminReportItem, ReportStatus } from "@/types/admin";

export const ADMIN_REPORTS_STORAGE_KEY = "nestrivo_admin_reports_v1";

export const INITIAL_ADMIN_REPORTS: AdminReportItem[] = [
  {
    id: "rep-001",
    listingId: "sample-bad-1",
    listingTitle: "Phòng Trọ Giá Rẻ 1.2 Triệu Gần ĐH Sư Phạm, Cầu Giấy",
    listingThumbnailUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=300",
    landlordId: "landlord-bad-1",
    landlordName: "Hoàng Văn Nam",
    landlordPhone: "0987111222",
    reporterName: "Nguyễn Thu Hà",
    reporterPhone: "0912334455",
    reporterEmail: "thuha.student@gmail.com",
    reason: "WRONG_PRICE",
    reasonLabel: "Báo sai giá niêm yết",
    description: "Tin đăng ghi 1.2 triệu/tháng nhưng khi mình gọi điện tới xem phòng thì chủ nhà bảo giá đó chỉ áp dụng cho người ở ghép 4 người, phòng riêng thực tế đòi 3.8 triệu. Bẫy giá sai quy định!",
    status: "PENDING",
    createdAt: "2026-11-03T14:20:00.000Z",
  },
  {
    id: "rep-002",
    listingId: "sample-2",
    listingTitle: "Căn Hộ Dịch Vụ 1PN Cao Cấp View Sông, Phú Mỹ Hưng Quận 7",
    listingThumbnailUrl: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=300",
    landlordId: "landlord-2",
    landlordName: "Trần Minh Tâm",
    landlordPhone: "0987654321",
    reporterName: "Trần Anh Quân",
    reporterPhone: "0977889900",
    reporterEmail: "quan.tran@fpt.com",
    reason: "HIDDEN_FEES",
    reasonLabel: "Phụ phí ẩn ngoài bảng niêm yết",
    description: "Bảng phí của Nestrivo ghi miễn phí xe máy, nhưng khi đến làm hợp đồng chủ nhà bắt nộp thêm 150k/xe máy/tháng và tiền rác 100k/tháng. Đề nghị Admin nhắc nhở chủ nhà cập nhật lại bảng phụ phí.",
    status: "PENDING",
    createdAt: "2026-11-03T18:45:00.000Z",
  },
  {
    id: "rep-003",
    listingId: "sample-1",
    listingTitle: "Phòng Studio Ban Công Thoáng Mát Gần ĐH HUTECH, Bình Thạnh",
    listingThumbnailUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=300",
    landlordId: "landlord-1",
    landlordName: "Nguyễn Văn Hùng",
    landlordPhone: "0901234567",
    reporterName: "Đặng Minh Trí",
    reporterPhone: "0933556677",
    reporterEmail: "tri.dang@gmail.com",
    reason: "UNAVAILABLE_ROOM",
    reasonLabel: "Phòng đã có người thuê",
    description: "Mình liên hệ thì chủ nhà báo phòng này đã có bạn ký hợp đồng thuê hôm qua rồi. Nhờ ban quản trị ẩn tin này đi để các bạn khác không mất công gọi.",
    status: "RESOLVED",
    resolutionAction: "HIDE_LISTING",
    resolutionNotes: "Đã liên hệ xác minh với chủ nhà Nguyễn Văn Hùng và tạm chuyển tin đăng sang trạng thái RENTED.",
    createdAt: "2026-11-02T10:15:00.000Z",
    resolvedAt: "2026-11-02T11:30:00.000Z",
  },
  {
    id: "rep-004",
    listingId: "sample-3",
    listingTitle: "Phòng Trọ Có Gác Lửng Giá Sinh Viên, Gần ĐH Sư Phạm Kỹ Thuật",
    listingThumbnailUrl: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=300",
    landlordId: "landlord-3",
    landlordName: "Lê Hoàng Long",
    landlordPhone: "0912888999",
    reporterName: "Vũ Hải Nam",
    reporterPhone: "0944112233",
    reporterEmail: "hainam.spkt@gmail.com",
    reason: "FAKE_IMAGES",
    reasonLabel: "Hình ảnh phòng không giống thật",
    description: "Ảnh trên app chụp phòng có tủ lạnh và máy giặt riêng, nhưng khi tới xem thì thực tế là máy giặt chung dưới tầng trệt.",
    status: "DISMISSED",
    resolutionAction: "DISMISS",
    resolutionNotes: "Kiểm tra lại bài đăng: Chủ nhà đã ghi rõ trong mục mô tả máy giặt để khu vực giặt chung tầng 1. Báo cáo không có căn cứ vi phạm.",
    createdAt: "2026-11-01T16:00:00.000Z",
    resolvedAt: "2026-11-01T17:10:00.000Z",
  },
];

export function getStoredAdminReports(): AdminReportItem[] {
  if (typeof window === "undefined") return INITIAL_ADMIN_REPORTS;
  try {
    const raw = localStorage.getItem(ADMIN_REPORTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(ADMIN_REPORTS_STORAGE_KEY, JSON.stringify(INITIAL_ADMIN_REPORTS));
      return INITIAL_ADMIN_REPORTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_ADMIN_REPORTS;
  } catch {
    return INITIAL_ADMIN_REPORTS;
  }
}

export function saveStoredAdminReports(reports: AdminReportItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ADMIN_REPORTS_STORAGE_KEY, JSON.stringify(reports));
  } catch {
    // Ignore quota error
  }
}

export function resolveReport(
  reportId: string,
  action: "HIDE_LISTING" | "WARN_LANDLORD" | "LOCK_LANDLORD",
  notes: string
): { success: boolean; message: string; report?: AdminReportItem } {
  const reports = getStoredAdminReports();
  const index = reports.findIndex((r) => r.id === reportId);
  if (index === -1) {
    return { success: false, message: "Không tìm thấy báo cáo." };
  }

  const updated: AdminReportItem = {
    ...reports[index],
    status: "RESOLVED",
    resolutionAction: action,
    resolutionNotes: notes,
    resolvedAt: new Date().toISOString(),
  };

  reports[index] = updated;
  saveStoredAdminReports(reports);

  let actionText = "Đã giải quyết báo cáo.";
  if (action === "HIDE_LISTING") actionText = "Đã giải quyết báo cáo và tạm ẩn tin đăng vi phạm khỏi sàn.";
  if (action === "LOCK_LANDLORD") actionText = "Đã giải quyết báo cáo và khóa tài khoản chủ nhà vi phạm.";

  return { success: true, message: actionText, report: updated };
}

export function dismissReport(
  reportId: string,
  reason: string
): { success: boolean; message: string; report?: AdminReportItem } {
  const reports = getStoredAdminReports();
  const index = reports.findIndex((r) => r.id === reportId);
  if (index === -1) {
    return { success: false, message: "Không tìm thấy báo cáo." };
  }

  const updated: AdminReportItem = {
    ...reports[index],
    status: "DISMISSED",
    resolutionAction: "DISMISS",
    resolutionNotes: reason,
    resolvedAt: new Date().toISOString(),
  };

  reports[index] = updated;
  saveStoredAdminReports(reports);

  return { success: true, message: "Đã bác bỏ báo cáo vi phạm.", report: updated };
}


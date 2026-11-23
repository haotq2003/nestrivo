import { httpClient } from "./api";
import {
  PromotionPlan,
  PromotionOrder,
  AdminPromotionOrder,
  MoMoPaymentResponse,
  PromotionOrderStatusResponse,
  CreatePromotionPlanPayload,
  UpdatePromotionPlanPayload,
} from "@/types/promotion";

export const promotionService = {
  /**
   * Lấy danh sách các gói quảng bá (Tin Nổi Bật)
   */
  async getPlans(): Promise<PromotionPlan[]> {
    const res = await httpClient.get<{ data: PromotionPlan[] }>("/promotions/plans");
    return res.data || [];
  },

  /**
   * Admin: Lấy danh sách toàn bộ các gói quảng bá (cả đang bán và tạm ẩn)
   */
  async getAdminPlans(): Promise<PromotionPlan[]> {
    const res = await httpClient.get<{ data: PromotionPlan[] }>("/promotions/admin/plans");
    return res.data || [];
  },

  /**
   * Admin: Tạo gói quảng bá mới
   */
  async createAdminPlan(payload: CreatePromotionPlanPayload): Promise<{ message: string; plan: PromotionPlan }> {
    return httpClient.post<{ message: string; plan: PromotionPlan }>("/promotions/admin/plans", payload);
  },

  /**
   * Admin: Cập nhật gói quảng bá
   */
  async updateAdminPlan(id: string, payload: UpdatePromotionPlanPayload): Promise<{ message: string; plan: PromotionPlan }> {
    return httpClient.put<{ message: string; plan: PromotionPlan }>(`/promotions/admin/plans/${id}`, payload);
  },

  /**
   * Admin: Bật / Tắt trạng thái mở bán gói
   */
  async toggleAdminPlanStatus(id: string): Promise<{ message: string; plan: PromotionPlan }> {
    return httpClient.patch<{ message: string; plan: PromotionPlan }>(`/promotions/admin/plans/${id}/toggle`, {});
  },

  /**
   * Admin: Xóa gói quảng bá
   */
  async deleteAdminPlan(id: string): Promise<{ message: string; deactivated?: boolean; deleted?: boolean }> {
    return httpClient.delete<{ message: string; deactivated?: boolean; deleted?: boolean }>(`/promotions/admin/plans/${id}`);
  },

  /**
   * Admin: Lấy danh sách đơn hàng & báo cáo doanh thu MoMo
   */
  async getAdminOrders(params?: { status?: string; page?: number; limit?: number }): Promise<{
    data: AdminPromotionOrder[];
    stats: {
      totalRevenue: number;
      paidOrdersCount: number;
    };
    pagination: {
      totalItems: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    return httpClient.get("/promotions/admin/orders", params);
  },

  /**
   * Tạo đơn hàng mua gói quảng bá
   */
  async createOrder(payload: { listingId: string; planId: string }): Promise<{ message: string; order: PromotionOrder }> {
    return httpClient.post<{ message: string; order: PromotionOrder }>("/promotions/orders", payload);
  },

  /**
   * Khởi tạo liên kết thanh toán MoMo (lấy payUrl & qrCodeUrl)
   */
  async createMoMoPayment(orderId: string, requestType: "payWithATM" | "captureWallet" = "payWithATM"): Promise<{ success: boolean; data: MoMoPaymentResponse }> {
    return httpClient.post<{ success: boolean; data: MoMoPaymentResponse }>(`/promotions/orders/${orderId}/momo`, { requestType });
  },

  /**
   * Xác nhận thanh toán khi MoMo chuyển hướng quay lại web
   */
  async handleMoMoReturn(payload: { orderCode: string; resultCode: string | number; transId?: string }): Promise<{ success: boolean; message: string }> {
    return httpClient.post<{ success: boolean; message: string }>("/promotions/momo-return", payload);
  },

  /**
   * Kiểm tra trạng thái đơn hàng (polling xem đã nhận tiền MoMo chưa)
   */
  async getOrderStatus(orderId: string): Promise<{ success: boolean; data: PromotionOrderStatusResponse }> {
    return httpClient.get<{ success: boolean; data: PromotionOrderStatusResponse }>(`/promotions/orders/${orderId}/status`);
  },

  /**
   * Thanh toán thủ công / chuyển khoản / sandbox test
   */
  async payOrder(orderId: string, payload?: { paymentMethod?: string; transactionCode?: string }): Promise<{ message: string }> {
    return httpClient.post<{ message: string }>(`/promotions/orders/${orderId}/pay`, payload || {});
  },

  /**
   * Lấy lịch sử đơn hàng của chủ nhà
   */
  async getMyOrders(): Promise<PromotionOrder[]> {
    const res = await httpClient.get<{ data: PromotionOrder[] }>("/promotions/orders/my");
    return res.data || [];
  },
};


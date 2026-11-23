export interface PromotionPlan {
  id: string;
  code: string;
  tier: "FREE" | "HOT" | "VIP";
  name: string;
  description?: string;
  durationDays: number;
  price: number | string;
  isActive: boolean;
  priority: number;
  badgeColor?: string;
  _count?: {
    orders: number;
  };
}

export interface CreatePromotionPlanPayload {
  name: string;
  code?: string;
  tier?: "FREE" | "HOT" | "VIP";
  description?: string;
  durationDays: number;
  price: number;
  priority?: number;
  badgeColor?: string;
  isActive?: boolean;
}

export interface UpdatePromotionPlanPayload {
  name?: string;
  code?: string;
  tier?: "FREE" | "HOT" | "VIP";
  description?: string;
  durationDays?: number;
  price?: number;
  priority?: number;
  badgeColor?: string;
  isActive?: boolean;
}

export interface PromotionOrder {
  id: string;
  orderCode: string;
  landlordId: string;
  listingId: string;
  planId: string;
  amount: number | string;
  status: "PENDING_PAYMENT" | "PAID" | "CANCELLED" | "REFUNDED";
  createdAt: string;
  listing?: {
    id: string;
    title: string;
    currentTier?: string;
  };
  plan?: PromotionPlan;
}

export interface AdminPromotionOrder extends PromotionOrder {
  landlord?: {
    id: string;
    fullName?: string | null;
    email: string;
  };
  payment?: {
    id: string;
    paymentMethod: string;
    transactionCode: string;
    amount: number | string;
    status: string;
    paidAt: string;
  } | null;
  listingPromotion?: {
    id: string;
    tier: string;
    priority: number;
    startDate: string;
    endDate: string;
    status: string;
  } | null;
}

export interface MoMoPaymentResponse {
  orderCode: string;
  amount: number;
  payUrl: string;
  qrCodeUrl: string;
  deeplink?: string;
}

export interface PromotionOrderStatusResponse {
  orderId: string;
  orderCode: string;
  status: string;
  isPaid: boolean;
  listing?: {
    id: string;
    title: string;
    currentTier?: string;
  };
  plan?: PromotionPlan;
}

export interface AdminPromotionOrder extends PromotionOrder {
  landlord?: {
    id: string;
    fullName?: string | null;
    email: string;
  };
  payment?: {
    id: string;
    paymentMethod: string;
    transactionCode: string;
    amount: number | string;
    status: string;
    paidAt: string;
  } | null;
  listingPromotion?: {
    id: string;
    tier: string;
    priority: number;
    startDate: string;
    endDate: string;
    status: string;
  } | null;
}

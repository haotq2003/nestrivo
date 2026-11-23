import { ListingStatus, PropertyType, ListingFee, ListingImage, ListingAmenity } from "./listing";

export interface AdminLandlordInfo {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string | null;
  avatarUrl?: string | null;
  isActive?: boolean;
  createdAt?: string;
  isKycVerified?: boolean;
  landlordProfile?: {
    displayName?: string | null;
    verificationStatus?: "PENDING" | "VERIFIED" | "REJECTED";
  } | null;
  verificationRequests?: Array<{
    status?: string;
  }>;
}

export interface AdminListingItem {
  id: string;
  landlordId: string;
  title: string;
  description: string;
  propertyType: PropertyType;
  status: ListingStatus;
  availabilityStatus: "AVAILABLE" | "RENTED" | "UNAVAILABLE";
  price: number | string;
  deposit: number | string;
  area: number | string;
  bedrooms: number;
  bathrooms: number;
  maxOccupants: number;
  address: string;
  ward?: string | null;
  district: string;
  city: string;
  thumbnailUrl?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string | null;
  rejectionReason?: string | null;
  allowsPets?: boolean;
  hasMezzanine?: boolean;
  isFurnished?: boolean;
  minimumStayMonths?: number | null;
  images?: ListingImage[];
  amenities?: ListingAmenity[];
  fees?: ListingFee[];
  landlord?: AdminLandlordInfo;
  _count?: {
    favorites?: number;
    inquiries?: number;
    reports?: number;
  };
}

export interface AdminAuditLogItem {
  id: string;
  adminId: string;
  action: "APPROVE_LISTING" | "REJECT_LISTING" | "HIDE_LISTING" | "UNHIDE_LISTING" | "LOCK_USER" | "UNLOCK_USER" | "RESOLVE_REPORT" | "DISMISS_REPORT";
  entityType: string;
  entityId: string;
  details: {
    listingTitle?: string;
    landlordId?: string;
    previousStatus?: string;
    reason?: string | null;
  };
  createdAt: string;
}

export type UserRole = "RENTER" | "LANDLORD" | "ADMIN";
export type UserStatus = "ACTIVE" | "LOCKED";
export type KycStatus = "NOT_VERIFIED" | "PENDING" | "VERIFIED" | "REJECTED";

export interface AdminUserItem {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: UserRole;
  roles?: UserRole[];
  status: UserStatus;
  isActive?: boolean;
  verificationStatus: KycStatus;
  createdAt: string;
  updatedAt?: string;
  avatarUrl?: string | null;
  totalListings?: number;
  reportsReceived?: number;
  lockReason?: string | null;
  lockedAt?: string | null;
  landlordProfile?: {
    id?: string;
    displayName?: string | null;
    verificationStatus?: string;
    averageRating?: number | string | null;
    reviewCount?: number;
  } | null;
}

export interface AdminUserStats {
  total: number;
  landlords: number;
  renters: number;
  admins: number;
  locked: number;
  verified: number;
}

export interface AdminUsersResponse {
  success: boolean;
  data: AdminUserItem[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
  stats: AdminUserStats;
}

export type ReportReasonType = 
  | "FAKE_LISTING"
  | "FAKE_IMAGES" 
  | "WRONG_PRICE" 
  | "INCORRECT_AMENITIES" 
  | "WRONG_ADDRESS"
  | "ALREADY_RENTED" 
  | "MISLEADING_INFO"
  | "SCAM" 
  | "OTHER"
  | "UNAVAILABLE_ROOM"
  | "SCAM_DEPOSIT"
  | "HIDDEN_FEES"
  | "UNREACHABLE_LANDLORD";

export type ReportStatus = "PENDING" | "RESOLVED" | "DISMISSED";

export interface AdminReportItem {
  id: string;
  listingId: string;
  listingTitle: string;
  listingPrice?: number | string;
  listingAddress?: string;
  listingThumbnailUrl?: string;
  landlordId?: string;
  landlordName: string;
  landlordPhone: string;
  landlordEmail?: string;
  landlordIsActive?: boolean;
  reporterId?: string;
  reporterName: string;
  reporterPhone: string;
  reporterEmail: string;
  reporterTotalReports?: number;
  reporterDismissedReports?: number;
  reporterStats?: {
    total: number;
    pending: number;
    resolved: number;
    dismissed: number;
  };
  reason: ReportReasonType;
  reasonLabel: string;
  description: string;
  evidenceUrls?: string[];
  status: ReportStatus;
  adminNote?: string | null;
  resolutionAction?: "HIDE_LISTING" | "WARN_LANDLORD" | "LOCK_LANDLORD" | "DISMISS" | "REQUEST_EDIT" | null;
  resolutionNotes?: string | null;
  createdAt: string;
  resolvedAt?: string | null;
  warningExpiresAt?: string | null;
  isWarningActive?: boolean;
  isFixed?: boolean;
  isExpired?: boolean;
  remainingHours?: number;
  remainingMinutes?: number;
  listingStatus?: string;
  listingUpdatedAt?: string | null;
}

export interface AdminReportsResponse {
  success: boolean;
  data: AdminReportItem[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
  stats: {
    pending: number;
    resolved: number;
    dismissed: number;
    total: number;
  };
}

export interface AdminDashboardMetrics {
  totalListings: number;
  pendingModerationListings: number;
  publishedListings: number;
  rejectedListings: number;
  totalUsers: number;
  landlordCount: number;
  renterCount: number;
  lockedUsersCount: number;
  pendingReportsCount: number;
  resolvedReportsCount: number;
  avgModerationMinutes: number;
}

export interface AdminDashboardTimelineItem {
  date: string;
  day: string;
  label: string;
  revenue: number;
  orders: number;
  listings: number;
  users: number;
  listingsHeight: string;
  usersHeight: string;
  revenueHeight: string;
}

export interface AdminListingStatusBreakdownItem {
  status: string;
  label: string;
  count: number;
  percent: number;
  color: string;
  badgeColor: string;
}

export interface AdminPropertyDistributionItem {
  type: string;
  label: string;
  count: number;
  percent: number;
  color: string;
  hexColor: string;
}

export interface AdminTopDistrictItem {
  district: string;
  count: number;
  percent: number;
}

export interface AdminReportReasonBreakdownItem {
  reason: string;
  label: string;
  count: number;
  percent: number;
}

export interface AdminDashboardStatsResponse {
  success: boolean;
  timeRange: "7d" | "30d";
  days: number;
  summary: {
    pendingListingsCount: number;
    totalListingsCount: number;
    publishedListingsCount: number;
    rejectedListingsCount: number;
    hiddenListingsCount: number;
    totalUsersCount: number;
    landlordsCount: number;
    rentersCount: number;
    lockedUsersCount: number;
    pendingKycCount: number;
    pendingReportsCount: number;
    resolvedReportsCount: number;
    totalReportsCount: number;
    totalRevenue: number;
    paidOrdersCount: number;
    activePromosCount: number;
    activePromosByTier: {
      VIP: number;
      HOT: number;
    };
  };
  charts: {
    growthChart: AdminDashboardTimelineItem[];
    listingStatusBreakdown: AdminListingStatusBreakdownItem[];
    propertyDistribution: AdminPropertyDistributionItem[];
    topDistricts: AdminTopDistrictItem[];
    reportReasonsBreakdown: AdminReportReasonBreakdownItem[];
  };
}


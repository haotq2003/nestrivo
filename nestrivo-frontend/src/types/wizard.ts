import { PropertyType, ListingStatus, AvailabilityStatus } from "./listing";
import { VIETNAM_LOCATIONS } from "@/lib/vietnam-locations";

export interface WizardFeeItem {
  id: string;
  type: "ELECTRICITY" | "WATER" | "INTERNET" | "SERVICE" | "PARKING" | "OTHER";
  name: string;
  amount: number;
  unit: "PER_KWH" | "PER_M3" | "PER_MONTH" | "PER_PERSON" | "PER_VEHICLE" | "FIXED";
  isIncluded: boolean; // Đã bao gồm trong giá thuê / Miễn phí
}

export interface WizardImageItem {
  id: string;
  imageUrl: string;
  caption?: string;
  isCover?: boolean;
}

export interface WizardAmenityItem {
  id: string;
  name: string;
  iconName: string;
  category: "essential" | "comfort" | "building";
}

export interface WizardFormData {
  // Step 1: Type & Address
  propertyType: PropertyType;
  city: string;
  district: string;
  ward: string;
  address: string;

  // Step 2: Property Details
  area: number;
  bedrooms: number;
  bathrooms: number;
  maxOccupants: number;
  hasMezzanine: boolean;
  allowsPets: boolean;
  isFurnished: boolean;
  minimumStayMonths: number | null; // 0, 3, 6, 12, or null
  amenities: string[]; // List of amenity IDs

  // Step 3: Pricing & Fees
  price: number; // Base monthly rent in VND
  deposit: number; // Deposit amount in VND
  fees: WizardFeeItem[];

  // Step 4: Images
  images: WizardImageItem[];

  // Step 5: Title & Description
  title: string;
  description: string;

  // Metadata
  currentStep: number; // 1 to 6
  lastSavedAt?: string;
}

export const INITIAL_WIZARD_FORM_DATA: WizardFormData = {
  propertyType: "STUDIO",
  city: "Hồ Chí Minh",
  district: "Bình Thạnh",
  ward: "Phường 25",
  address: "",

  area: 30,
  bedrooms: 1,
  bathrooms: 1,
  maxOccupants: 2,
  hasMezzanine: false,
  allowsPets: true,
  isFurnished: true,
  minimumStayMonths: 6,
  amenities: [
    "air-con",
    "water-heater",
    "wifi",
    "free-hours",
    "fingerprint",
  ],

  price: 4500000,
  deposit: 4500000,
  fees: [
    {
      id: "fee-elec",
      type: "ELECTRICITY",
      name: "Điện sinh hoạt",
      amount: 3500,
      unit: "PER_KWH",
      isIncluded: false,
    },
    {
      id: "fee-water",
      type: "WATER",
      name: "Nước sinh hoạt",
      amount: 100000,
      unit: "PER_PERSON",
      isIncluded: false,
    },
    {
      id: "fee-internet",
      type: "INTERNET",
      name: "Internet / WiFi",
      amount: 100000,
      unit: "PER_MONTH",
      isIncluded: false,
    },
    {
      id: "fee-service",
      type: "SERVICE",
      name: "Phí dịch vụ chung (vệ sinh, thang máy)",
      amount: 150000,
      unit: "FIXED",
      isIncluded: false,
    },
    {
      id: "fee-parking",
      type: "PARKING",
      name: "Gửi xe máy",
      amount: 100000,
      unit: "PER_VEHICLE",
      isIncluded: false,
    },
  ],

  images: [],

  title: "Phòng Studio Ban Công Thoáng Mát Gần ĐH HUTECH, Bình Thạnh",
  description: "Phòng mới 100%, full nội thất cao cấp: tủ lạnh, máy giặt riêng, điều hòa, khóa vân tay, giờ giấc tự do không chung chủ. Vị trí thuận tiện gần ngã tư Hàng Xanh, chỉ 5 phút sang Quận 1.",

  currentStep: 1,
};

export const CITIES_AND_DISTRICTS: Record<string, { label: string; districts: string[] }> = VIETNAM_LOCATIONS;

export const WIZARD_AMENITIES: WizardAmenityItem[] = [
  { id: "air-con", name: "Điều hòa / Máy lạnh", iconName: "Wind", category: "essential" },
  { id: "water-heater", name: "Bình nóng lạnh", iconName: "Flame", category: "essential" },
  { id: "fridge", name: "Tủ lạnh riêng", iconName: "Refrigerator", category: "comfort" },
  { id: "washer", name: "Máy giặt riêng", iconName: "WashingMachine", category: "comfort" },
  { id: "wifi", name: "WiFi riêng từng phòng", iconName: "Wifi", category: "essential" },
  { id: "fingerprint", name: "Khóa vân tay / Thẻ từ", iconName: "KeyRound", category: "building" },
  { id: "balcony", name: "Ban công / Cửa sổ lớn", iconName: "Sun", category: "comfort" },
  { id: "elevator", name: "Thang máy", iconName: "ArrowUpDown", category: "building" },
  { id: "parking", name: "Chỗ để xe an ninh", iconName: "Car", category: "building" },
  { id: "kitchen", name: "Kệ bếp & Chậu rửa", iconName: "ChefHat", category: "comfort" },
  { id: "free-hours", name: "Giờ giấc tự do 24/7", iconName: "Clock", category: "essential" },
  { id: "security", name: "Bảo vệ & Camera an ninh", iconName: "ShieldCheck", category: "building" },
  { id: "bed", name: "Giường & Nệm sẵn", iconName: "Bed", category: "comfort" },
  { id: "wardrobe", name: "Tủ quần áo", iconName: "DoorClosed", category: "comfort" },
];

export const SAMPLE_PHOTOS = [
  {
    url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&auto=format&fit=crop&q=80",
    label: "Phòng ngủ ban công hiện đại",
  },
  {
    url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&auto=format&fit=crop&q=80",
    label: "Căn hộ Studio thoáng sáng",
  },
  {
    url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&auto=format&fit=crop&q=80",
    label: "Phòng ngủ ấm cúng",
  },
  {
    url: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=1200&auto=format&fit=crop&q=80",
    label: "Bàn làm việc & ánh sáng tự nhiên",
  },
  {
    url: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=1200&auto=format&fit=crop&q=80",
    label: "Phòng tắm & WC sạch sẽ",
  },
  {
    url: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1200&auto=format&fit=crop&q=80",
    label: "Khu vực bếp tiện nghi",
  },
];

export function getListingDraftKey(userId?: string): string {
  return userId ? `nestrivo_listing_draft_${userId}` : "nestrivo_listing_draft_guest";
}

export function clearListingDraft(userId?: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(getListingDraftKey(userId));
    localStorage.removeItem("nestrivo_new_listing_draft_v1");
  } catch {}
}

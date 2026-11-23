import { LandlordListingItem } from "@/types/landlord";
import { INITIAL_LANDLORD_LISTINGS } from "@/lib/landlord-mock-data";
import { FALLBACK_LISTINGS } from "@/lib/fallback-data";

export const RECOGNIZED_SAMPLE_IDS = [
  "sample-1",
  "sample-2",
  "sample-3",
  "sample-4",
  "sample-5",
  "sample-6",
];

export function getFallbackLandlordListing(id: string): LandlordListingItem | null {
  const landlordItem = INITIAL_LANDLORD_LISTINGS.find((item) => item.id === id);
  if (!landlordItem) return null;

  const fallbackItem = FALLBACK_LISTINGS.find((item) => item.id === id);

  return {
    ...landlordItem,
    description: fallbackItem?.description || landlordItem.description,
    images: fallbackItem?.images || [
      {
        id: `img-${id}-1`,
        listingId: id,
        imageUrl: landlordItem.thumbnailUrl,
        sortOrder: 0,
      },
    ],
    amenities: fallbackItem?.amenities || [
      { amenityId: "a1", amenity: { id: "a1", name: "Điều hòa / Máy lạnh", icon: "air-conditioner" } },
      { amenityId: "a2", amenity: { id: "a2", name: "Bình nóng lạnh", icon: "water-heater" } },
      { amenityId: "a3", amenity: { id: "a3", name: "Máy giặt riêng", icon: "washing-machine" } },
      { amenityId: "a4", amenity: { id: "a4", name: "Tủ lạnh riêng", icon: "refrigerator" } },
      { amenityId: "a5", amenity: { id: "a5", name: "Khóa vân tay / Thẻ từ", icon: "fingerprint" } },
      { amenityId: "a8", amenity: { id: "a8", name: "Giờ giấc tự do 24/7", icon: "clock" } },
    ],
    fees: fallbackItem?.fees || [
      { id: `fee-elec-${id}`, type: "ELECTRICITY", name: "Điện sinh hoạt", amount: 3500, unit: "PER_KWH" },
      { id: `fee-water-${id}`, type: "WATER", name: "Nước sinh hoạt", amount: 100000, unit: "PER_PERSON" },
      { id: `fee-net-${id}`, type: "INTERNET", name: "Internet / WiFi", amount: 100000, unit: "PER_MONTH" },
      { id: `fee-svc-${id}`, type: "SERVICE", name: "Dịch vụ chung", amount: 150000, unit: "FIXED" },
    ],
    allowsPets: fallbackItem?.allowsPets ?? true,
    hasMezzanine: fallbackItem?.hasMezzanine ?? false,
    isFurnished: fallbackItem?.isFurnished ?? true,
    minimumStayMonths: fallbackItem?.minimumStayMonths ?? 6,
    rejectionReason: landlordItem.rejectionReason || null,
  };
}

export function formatListingDate(isoString?: string | null): string {
  if (!isoString) return "Chưa xác định";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "Chưa xác định";
    const day = d.getDate().toString().padStart(2, "0");
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const year = d.getFullYear();
    const hours = d.getHours().toString().padStart(2, "0");
    const minutes = d.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes} - ${day}/${month}/${year}`;
  } catch {
    return "Chưa xác định";
  }
}

export function formatPriceVnd(price: number | string): string {
  const num = typeof price === "string" ? parseFloat(price) : price;
  if (isNaN(num)) return "0 ₫";
  return `${num.toLocaleString("vi-VN")} ₫`;
}


"use client";

import { useState } from "react";
import { 
  MapPin, 
  ExternalLink, 
  Navigation, 
  Copy, 
  Check, 
  Layers, 
  Maximize2 
} from "lucide-react";

interface ListingMapLocationProps {
  address: string;
  ward?: string | null;
  district: string;
  city: string;
  latitude?: number | null;
  longitude?: number | null;
  title?: string;
}

export default function ListingMapLocation({
  address,
  ward,
  district,
  city,
  latitude,
  longitude,
  title,
}: ListingMapLocationProps) {
  const [mapType, setMapType] = useState<"roadmap" | "satellite">("roadmap");
  const [copied, setCopied] = useState(false);
  const [isIframeLoading, setIsIframeLoading] = useState(true);

  // Ghép nối địa chỉ chi tiết đầy đủ
  const fullAddress = [address, ward, district, city, "Việt Nam"]
    .filter(Boolean)
    .join(", ");

  // Truy vấn bản đồ: ưu tiên tọa độ chính xác nếu có, ngược lại dùng địa chỉ thực tế
  const queryParam =
    latitude && longitude && !isNaN(Number(latitude)) && !isNaN(Number(longitude))
      ? `${latitude},${longitude}`
      : fullAddress;

  // URL Google Maps Embed (t='' là Roadmap thông thường, t='k' là Vệ tinh Satellite)
  const embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(
    queryParam
  )}&t=${mapType === "satellite" ? "k" : "m"}&z=16&ie=UTF8&iwloc=&output=embed`;

  // URL mở trực tiếp trên Google Maps app / web
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    queryParam
  )}`;

  // URL tìm đường đi (Directions)
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    queryParam
  )}`;

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(fullAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <div className="bg-white rounded-3xl border border-[#E5E7EB] p-5 sm:p-7 shadow-xs space-y-4">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5E7EB]">
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-[#292524] flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#805B10]" />
            <span>Xem trên bản đồ</span>
          </h2>
          <p className="text-xs text-[#57534E] mt-0.5 line-clamp-1">
            {fullAddress}
          </p>
        </div>

        {/* Quick action buttons on header */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleCopyAddress}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-50 hover:bg-stone-100 border border-[#E5E7EB] text-xs font-medium text-[#292524] transition-colors cursor-pointer"
            title="Sao chép địa chỉ"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-semibold">Đã chép</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-[#78716C]" />
                <span>Sao chép</span>
              </>
            )}
          </button>

          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFF7E5] hover:bg-[#FDE68A] border border-[#F4CD65]/60 text-xs font-semibold text-[#805B10] transition-colors"
          >
            <Navigation className="w-3.5 h-3.5 text-[#805B10]" />
            <span>Chỉ đường</span>
          </a>
        </div>
      </div>

      {/* Map Display Frame Container */}
      <div className="relative w-full h-[320px] sm:h-[400px] rounded-2xl overflow-hidden border border-[#E5E7EB] bg-stone-100 shadow-inner group">
        {/* Floating "Open in Maps" pill button (Exact match to June Homes reference image) */}
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-3.5 left-3.5 z-20 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-stone-50 text-[#1E40AF] hover:text-[#1D4ED8] text-xs font-semibold shadow-md border border-[#E5E7EB] transition-all duration-200 cursor-pointer"
        >
          <span>Open in Maps</span>
          <ExternalLink className="w-3.5 h-3.5 text-[#1E40AF]" />
        </a>

        {/* Floating Map View Switcher: Roadmap vs Satellite */}
        <div className="absolute top-3.5 right-3.5 z-20 flex items-center bg-white/95 backdrop-blur-sm p-1 rounded-xl shadow-md border border-[#E5E7EB]">
          <button
            type="button"
            onClick={() => setMapType("roadmap")}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer ${
              mapType === "roadmap"
                ? "bg-[#292524] text-white shadow-xs"
                : "text-[#57534E] hover:text-[#292524]"
            }`}
          >
            Bản đồ
          </button>
          <button
            type="button"
            onClick={() => setMapType("satellite")}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer ${
              mapType === "satellite"
                ? "bg-[#292524] text-white shadow-xs"
                : "text-[#57534E] hover:text-[#292524]"
            }`}
          >
            Vệ tinh
          </button>
        </div>

        {/* Loading skeleton placeholder */}
        {isIframeLoading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-stone-100 text-[#78716C] animate-pulse">
            <MapPin className="w-8 h-8 text-[#DCA936] mb-2 animate-bounce" />
            <span className="text-xs font-medium">Đang tải bản đồ khu vực...</span>
          </div>
        )}

        {/* Interactive Google Maps iframe */}
        <iframe
          src={embedUrl}
          title={title ? `Bản đồ vị trí: ${title}` : "Bản đồ vị trí phòng trọ"}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen={false}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          onLoad={() => setIsIframeLoading(false)}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Helpful Location Notes Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#78716C] pt-1">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Vị trí được xác định dựa theo địa chỉ số nhà &amp; tuyến đường chính xác</span>
        </div>
        <span className="text-[11px] text-[#A8A29E]">
          Có thể cuộn chuột để phóng to / thu nhỏ bản đồ
        </span>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, ArrowLeftRight, ArrowRight, ChevronDown, ChevronUp } from "lucide-react";
import { useCompare } from "@/context/CompareContext";
import { resolveListingThumbnail, DEFAULT_LISTING_IMAGE } from "@/lib/image";
import { formatVND } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function CompareBar() {
  const { compareItems, compareCount, removeFromCompare, clearCompare, maxLimit } = useCompare();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || compareCount === 0 || pathname === "/compare") return null;

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300",
        collapsed ? "translate-y-[calc(100%-40px)]" : "translate-y-0"
      )}
    >
      {/* Handle bar */}
      <div
        className="mx-auto w-fit cursor-pointer"
        onClick={() => setCollapsed((prev) => !prev)}
      >
        <div className="flex items-center gap-2 bg-[#292524] text-white px-5 py-2 rounded-t-2xl text-sm font-medium shadow-lg select-none">
          <ArrowLeftRight className="w-4 h-4 text-[#F4CD65]" />
          <span>So sánh phòng</span>
          <span className="ml-1 w-5 h-5 rounded-full bg-[#F4CD65] text-[#292524] text-[11px] font-bold flex items-center justify-center">
            {compareCount}
          </span>
          {collapsed ? (
            <ChevronUp className="w-4 h-4 ml-1 text-[#F4CD65]" />
          ) : (
            <ChevronDown className="w-4 h-4 ml-1 text-[#F4CD65]" />
          )}
        </div>
      </div>

      {/* Main bar */}
      <div className="bg-white border-t border-[#E5E7EB] shadow-[0_-4px_24px_-4px_rgba(0,0,0,0.12)] px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-3 flex-wrap sm:flex-nowrap">
          {/* Items */}
          <div className="flex flex-1 items-center gap-3 overflow-x-auto pb-1 sm:pb-0">
            {compareItems.map((item) => {
              const imgUrl = item.images?.[0]?.imageUrl || DEFAULT_LISTING_IMAGE;
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-2 bg-[#FFFAEF] border border-[#E5E7EB] rounded-xl px-2.5 py-1.5 min-w-[180px] max-w-[220px] shrink-0"
                >
                  <img
                    src={imgUrl}
                    alt={item.title}
                    className="w-10 h-10 rounded-lg object-cover shrink-0 border border-[#E5E7EB]"
                    onError={(e) => {
                      e.currentTarget.src = DEFAULT_LISTING_IMAGE;
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[#292524] line-clamp-1">{item.title}</p>
                    <p className="text-xs text-[#78716C]">{formatVND(item.price)}/th</p>
                  </div>
                  <button
                    onClick={() => removeFromCompare(item.id)}
                    className="shrink-0 w-5 h-5 rounded-full bg-[#E5E7EB] hover:bg-rose-100 hover:text-rose-500 flex items-center justify-center transition-colors"
                    title="Xóa khỏi so sánh"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}

            {/* Empty slots */}
            {Array.from({ length: maxLimit - compareCount }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="flex items-center justify-center min-w-[180px] h-[52px] bg-stone-50 border border-dashed border-[#D6D3D1] rounded-xl text-xs text-[#A8A29E] shrink-0"
              >
                + Thêm phòng để so sánh
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0 ml-auto">
            <button
              onClick={clearCompare}
              className="px-3 py-1.5 text-xs font-medium text-[#57534E] hover:text-rose-500 border border-[#E5E7EB] rounded-xl hover:border-rose-200 transition-colors"
            >
              Xóa tất cả
            </button>
            <Link
              href="/compare"
              className="flex items-center gap-1.5 px-4 py-1.5 bg-[#F4CD65] hover:bg-[#ebbf4d] text-[#292524] font-semibold text-sm rounded-xl transition-colors shadow-xs"
            >
              <ArrowLeftRight className="w-4 h-4" />
              <span>So sánh ngay</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

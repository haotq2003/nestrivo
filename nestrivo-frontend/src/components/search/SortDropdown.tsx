"use client";

import { useRouter } from "next/navigation";

interface SortDropdownProps {
  currentSort: string;
  baseUrl: string;
}

export default function SortDropdown({ currentSort, baseUrl }: SortDropdownProps) {
  const router = useRouter();

  const handleSortChange = (newSort: string) => {
    const url = new URL(baseUrl, window.location.origin);
    if (newSort && newSort !== "newest") {
      url.searchParams.set("sortBy", newSort);
    } else {
      url.searchParams.delete("sortBy");
    }
    router.push(url.pathname + url.search);
  };

  return (
    <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
      <span className="text-xs text-[#77715F] font-semibold">Sắp xếp:</span>
      <select
        value={currentSort || "newest"}
        onChange={(e) => handleSortChange(e.target.value)}
        className="text-xs sm:text-sm font-bold text-[#373523] bg-[#FFFAEF] border border-[#EDE5D5] rounded-xl px-3.5 py-2 focus:outline-none focus:border-[#DCA936] hover:border-[#F4CD65] transition-colors cursor-pointer"
      >
        <option value="newest">Mới nhất</option>
        <option value="price_asc">Giá: Thấp đến cao</option>
        <option value="price_desc">Giá: Cao đến thấp</option>
        <option value="area_desc">Diện tích: Lớn nhất</option>
        <option value="area_asc">Diện tích: Nhỏ nhất</option>
      </select>
    </div>
  );
}

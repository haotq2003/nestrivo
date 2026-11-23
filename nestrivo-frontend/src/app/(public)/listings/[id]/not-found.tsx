import Link from "next/link";
import Image from "next/image";
import { Home, Search } from "lucide-react";

export default function ListingNotFound() {
  return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-6">
      <Link href="/" className="inline-block hover:scale-105 transition-transform">
        <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-md shadow-[#F4CD65]/30 mx-auto">
          <Image
            src="/logo.png"
            alt="Nestrivo Logo"
            width={64}
            height={64}
            className="w-full h-full object-contain"
          />
        </div>
      </Link>
      <div className="w-16 h-16 rounded-2xl bg-[#FFF1CC] border border-[#EDE5D5] text-[#DCA936] mx-auto flex items-center justify-center">
        <Search className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-[#292524]">
          Không tìm thấy phòng trọ
        </h1>
        <p className="text-sm text-[#57534E] leading-relaxed font-normal">
          Phòng trọ bạn đang tìm không tồn tại, đã có người thuê hoặc chủ nhà tạm ẩn tin đăng.
        </p>
      </div>

      <div className="pt-2">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#F4CD65] hover:bg-[#ebbf4d] text-[#292524] text-sm font-medium shadow-xs transition-all"
        >
          <Home className="w-4 h-4" />
          <span>Về trang chủ tìm phòng khác</span>
        </Link>
      </div>
    </div>
  );
}


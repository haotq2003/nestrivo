import Link from "next/link";
import Image from "next/image";
import { Home } from "lucide-react";

export const dynamic = "force-dynamic";

export default function RootNotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-[#EDE5D5] text-center space-y-6 shadow-xl shadow-[#373523]/5">
        <Link href="/" className="inline-block hover:scale-105 transition-transform">
          <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-md shadow-[#F4CD65]/30 mx-auto">
            <Image
              src="/logo.png"
              alt="Nestrivo Logo"
              width={64}
              height={64}
              className="w-full h-full object-contain"
              priority
            />
          </div>
        </Link>
        <div className="w-16 h-16 rounded-2xl bg-[#FFF1CC] text-[#805B10] flex items-center justify-center mx-auto text-2xl font-bold border border-[#F4CD65]/40">
          404
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-[#292524]">Không tìm thấy trang</h1>
          <p className="text-xs sm:text-sm text-[#57534E] leading-relaxed font-normal">
            Đường dẫn bạn truy cập có thể đã thay đổi hoặc không tồn tại trên hệ thống Nestrivo.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-[#F4CD65] hover:bg-[#ebbf4d] text-[#292524] text-xs sm:text-sm font-semibold shadow-xs transition-all min-h-[44px]"
          >
            <Home className="w-4 h-4" />
            <span>Về trang chủ</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

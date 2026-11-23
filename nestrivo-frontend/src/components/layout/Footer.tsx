import Link from "next/link";
import Image from "next/image";
import { Mail, Clock, ShieldCheck, Building } from "lucide-react";

export default function Footer() {
  return (
    <footer id="footer" className="bg-[#FFF7E5] text-[#77715F] text-sm mt-auto border-t border-[#EDE5D5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-xs shadow-[#F4CD65]/40 group-hover:scale-105 transition-transform shrink-0">
                <Image
                  src="/logo.png"
                  alt="Nestrivo Logo"
                  width={40}
                  height={40}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-[#292524] group-hover:text-[#805B10] transition-colors leading-tight">
                  Nestrivo
                </span>
                <span className="text-[11px] font-medium text-[#805B10] -mt-0.5">
                  Thuê phòng thông minh
                </span>
              </div>
            </Link>
            <p className="text-[#57534E] text-sm leading-relaxed max-w-sm font-normal">
              Nền tảng tìm kiếm phòng trọ, studio và căn hộ dịch vụ tại Việt Nam với thông tin minh bạch và người đăng được xác minh danh tính.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#805B10] bg-[#FFF1CC] border border-[#F4CD65]/40 px-3.5 py-1.5 rounded-xl w-fit font-medium">
              <ShieldCheck className="w-4 h-4 text-[#805B10]" />
              <span>Kiểm duyệt tin đăng &amp; chi phí trước khi xuất bản</span>
            </div>
          </div>

          {/* Col 1: Khu vực */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-[#292524]">
              Khu vực tìm kiếm
            </h4>
            <ul className="space-y-2 text-sm text-[#57534E]">
              <li>
                <Link href="/?city=Hồ Chí Minh&district=Bình Thạnh" className="hover:text-[#805B10] transition-colors">
                  Phòng trọ Bình Thạnh
                </Link>
              </li>
              <li>
                <Link href="/?city=Hồ Chí Minh&district=Quận 1" className="hover:text-[#805B10] transition-colors">
                  Phòng trọ Quận 1
                </Link>
              </li>
              <li>
                <Link href="/?city=Hồ Chí Minh&district=Quận 7" className="hover:text-[#805B10] transition-colors">
                  Căn hộ Quận 7
                </Link>
              </li>
              <li>
                <Link href="/?city=Hà Nội&district=Cầu Giấy" className="hover:text-[#805B10] transition-colors">
                  Phòng trọ Cầu Giấy (Hà Nội)
                </Link>
              </li>
              <li>
                <Link href="/?city=Đà Nẵng&district=Hải Châu" className="hover:text-[#805B10] transition-colors">
                  Phòng trọ Hải Châu (Đà Nẵng)
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 2: Loại hình */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-[#292524]">
              Loại hình phòng
            </h4>
            <ul className="space-y-2 text-sm text-[#57534E]">
              <li>
                <Link href="/?propertyType=STUDIO" className="hover:text-[#805B10] transition-colors">
                  Phòng Studio khép kín
                </Link>
              </li>
              <li>
                <Link href="/?propertyType=SERVICE_APARTMENT" className="hover:text-[#805B10] transition-colors">
                  Căn hộ dịch vụ
                </Link>
              </li>
              <li>
                <Link href="/?propertyType=ROOM_SHARE" className="hover:text-[#805B10] transition-colors">
                  Phòng ở ghép
                </Link>
              </li>
              <li>
                <Link href="/?propertyType=WHOLE_HOUSE" className="hover:text-[#805B10] transition-colors">
                  Nhà nguyên căn
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Dành cho chủ nhà & Hỗ trợ */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-[#292524]">
              Chủ nhà &amp; Trợ giúp
            </h4>
            <ul className="space-y-2.5 text-sm text-[#57534E]">
              <li>
                <Link
                  href="/landlord/listings/create"
                  className="text-[#805B10] hover:text-[#5c4109] font-medium flex items-center gap-1.5 transition-colors"
                >
                  <Building className="w-4 h-4 text-[#805B10]" />
                  <span>Đăng tin cho thuê phòng</span>
                </Link>
              </li>
              <li className="flex items-center gap-2 pt-1 text-xs text-[#78716C]">
                <Mail className="w-4 h-4 text-[#805B10] shrink-0" />
                <span>hotro@nestrivo.vn</span>
              </li>
              <li className="flex items-center gap-2 text-xs text-[#78716C]">
                <Clock className="w-4 h-4 text-[#805B10] shrink-0" />
                <span>Hỗ trợ trực tuyến 8h00 - 21h00</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[#EDE5D5] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#78716C]">
          <p>© 2026 Nestrivo. Nền tảng kết nối người thuê và chủ nhà minh bạch.</p>
          <div className="flex gap-6">
            <Link href="/terms" className="hover:text-[#292524] transition-colors">Điều khoản</Link>
            <Link href="/privacy" className="hover:text-[#292524] transition-colors">Bảo mật</Link>
            <Link href="/rules" className="hover:text-[#292524] transition-colors">Quy chế kiểm duyệt</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

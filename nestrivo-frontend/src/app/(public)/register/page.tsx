"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Mail, 
  Lock, 
  User, 
  Phone, 
  Building2, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  // Role selection
  const [isLandlord, setIsLandlord] = useState<boolean>(false);

  // Form fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Landlord specific fields
  const [landlordDisplayName, setLandlordDisplayName] = useState("");
  const [landlordDescription, setLandlordDescription] = useState("");

  const [agreeTerms, setAgreeTerms] = useState(true);

  // Loading & status
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Validation
    if (!fullName.trim()) {
      setErrorMessage("Vui lòng nhập họ và tên của bạn.");
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Vui lòng nhập địa chỉ email hợp lệ.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Mật khẩu phải chứa ít nhất 8 ký tự.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Xác nhận mật khẩu không trùng khớp.");
      return;
    }

    if (!agreeTerms) {
      setErrorMessage("Vui lòng đồng ý với Điều khoản dịch vụ để tiếp tục.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await register({
        fullName: fullName.trim(),
        email: email.trim(),
        phoneNumber: phoneNumber.trim() || undefined,
        password,
        isLandlord,
        landlordDisplayName: isLandlord ? (landlordDisplayName.trim() || fullName.trim()) : undefined,
        landlordDescription: isLandlord ? landlordDescription.trim() || undefined : undefined,
      });

      setSuccessMessage(res.message || "Đăng ký thành công!");
      setTimeout(() => {
        if (isLandlord) {
          router.push("/landlord/dashboard");
        } else {
          router.push("/");
        }
      }, 800);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Đăng ký không thành công. Vui lòng kiểm tra lại thông tin.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-8 sm:py-14 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center min-h-[calc(100vh-160px)]">
      <div className="w-full max-w-lg space-y-6">
        {/* Role Toggle Selector */}
        <div className="p-1.5 rounded-2xl bg-[#FFF1CC]/60 border border-[#EDE5D5] grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => setIsLandlord(false)}
            className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              !isLandlord
                ? "bg-white text-[#373523] shadow-xs border border-[#EDE5D5]"
                : "text-[#77715F] hover:text-[#373523]"
            }`}
          >
            <User className="w-4 h-4 text-[#DCA936]" />
            <span>Tôi tìm phòng thuê</span>
          </button>

          <button
            type="button"
            onClick={() => setIsLandlord(true)}
            className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
              isLandlord
                ? "bg-[#F4CD65] text-[#292524] shadow-xs font-semibold"
                : "text-[#57534E] hover:text-[#292524]"
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Tôi là Chủ nhà / Đăng tin</span>
          </button>
        </div>

        {/* Form Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#EDE5D5] shadow-xl shadow-[#373523]/5 space-y-5">
          {/* Role badge description */}
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-[#FFF7E5] border border-[#EDE5D5] text-xs text-[#77715F]">
            {isLandlord ? (
              <>
                <Building2 className="w-4 h-4 text-[#DCA936] shrink-0" />
                <span>
                  Đăng ký với tư cách <strong className="text-[#373523]">Chủ nhà</strong>: Bạn sẽ có quyền tạo tin đăng, quản lý phòng và tiếp nhận yêu cầu hỏi thuê.
                </span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 text-[#DCA936] shrink-0" />
                <span>
                  Đăng ký với tư cách <strong className="text-[#373523]">Khách thuê</strong>: Dễ dàng lưu tin yêu thích, gửi yêu cầu xem phòng và nhận hỗ trợ từ chủ nhà.
                </span>
              </>
            )}
          </div>

          {/* Alert messages */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-medium flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-2xl bg-[#FFF1CC] border border-[#F4CD65]/50 text-[#5A450C] text-xs sm:text-sm font-semibold flex items-center gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-[#DCA936] shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label htmlFor="fullName" className="block text-xs font-bold text-[#373523]">
                Họ và tên <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#A8A190] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="fullName"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn Hùng"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-[#FFFAEF] border border-[#EDE5D5] rounded-xl text-[#373523] placeholder:text-[#A8A190] focus:outline-none focus:border-[#DCA936] focus:bg-white transition-all min-h-[44px]"
                />
              </div>
            </div>

            {/* Email & Phone grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="regEmail" className="block text-xs font-bold text-[#373523]">
                  Địa chỉ Email <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#A8A190] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="regEmail"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-[#FFFAEF] border border-[#EDE5D5] rounded-xl text-[#373523] placeholder:text-[#A8A190] focus:outline-none focus:border-[#DCA936] focus:bg-white transition-all min-h-[44px]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="regPhone" className="block text-xs font-bold text-[#373523]">
                  Số điện thoại
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#A8A190] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="regPhone"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="0901234567"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-[#FFFAEF] border border-[#EDE5D5] rounded-xl text-[#373523] placeholder:text-[#A8A190] focus:outline-none focus:border-[#DCA936] focus:bg-white transition-all min-h-[44px]"
                  />
                </div>
              </div>
            </div>

            {/* Conditional Landlord Fields */}
            {isLandlord && (
              <div className="p-4 rounded-2xl bg-[#FFF7E5] border border-[#EDE5D5] space-y-3 animate-in fade-in">
                <div className="space-y-1.5">
                  <label htmlFor="landlordDisplayName" className="block text-xs font-bold text-[#373523]">
                    Tên thương hiệu / Nhà trọ hiển thị
                  </label>
                  <input
                    id="landlordDisplayName"
                    type="text"
                    value={landlordDisplayName}
                    onChange={(e) => setLandlordDisplayName(e.target.value)}
                    placeholder="Ví dụ: Hùng Apartment, Nhà Trọ Hoa Sen..."
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-[#EDE5D5] rounded-xl text-[#373523] placeholder:text-[#A8A190] focus:outline-none focus:border-[#DCA936] transition-all min-h-[44px]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="landlordDescription" className="block text-xs font-bold text-[#373523]">
                    Mô tả ngắn về hoạt động cho thuê (Tùy chọn)
                  </label>
                  <input
                    id="landlordDescription"
                    type="text"
                    value={landlordDescription}
                    onChange={(e) => setLandlordDescription(e.target.value)}
                    placeholder="Chuyên quản lý chuỗi phòng studio tại Bình Thạnh & Quận 7..."
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-[#EDE5D5] rounded-xl text-[#373523] placeholder:text-[#A8A190] focus:outline-none focus:border-[#DCA936] transition-all min-h-[44px]"
                  />
                </div>
              </div>
            )}

            {/* Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="regPassword" className="block text-xs font-bold text-[#373523]">
                  Mật khẩu <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#A8A190] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="regPassword"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Ít nhất 8 ký tự..."
                    className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-[#FFFAEF] border border-[#EDE5D5] rounded-xl text-[#373523] placeholder:text-[#A8A190] focus:outline-none focus:border-[#DCA936] focus:bg-white transition-all min-h-[44px]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1.5 rounded-lg text-[#A8A190] hover:text-[#373523] absolute right-2.5 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="confirmPassword" className="block text-xs font-bold text-[#373523]">
                  Xác nhận mật khẩu <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#A8A190] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu..."
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-[#FFFAEF] border border-[#EDE5D5] rounded-xl text-[#373523] placeholder:text-[#A8A190] focus:outline-none focus:border-[#DCA936] focus:bg-white transition-all min-h-[44px]"
                  />
                </div>
              </div>
            </div>

            {/* Terms Agreement */}
            <div className="pt-1">
              <label className="flex items-start gap-2 cursor-pointer text-xs text-[#77715F] leading-relaxed">
                <input
                  type="checkbox"
                  required
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded text-[#DCA936] focus:ring-[#DCA936] border-[#EDE5D5] accent-[#DCA936]"
                />
                <span>
                  Tôi đồng ý với{" "}
                  <a href="#terms" className="font-bold text-[#DCA936] hover:underline">
                    Quy chế hoạt động
                  </a>{" "}
                  và{" "}
                  <a href="#privacy" className="font-bold text-[#DCA936] hover:underline">
                    Chính sách bảo mật
                  </a>{" "}
                  của Nestrivo.
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#F4CD65] hover:bg-[#ebbf4d] active:bg-[#e0b03b] text-[#292524] font-semibold text-sm shadow-xs transition-all disabled:opacity-50 min-h-[44px]"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-[#292524] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Hoàn tất đăng ký</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Switch to Login */}
          <div className="pt-4 border-t border-[#EDE5D5] text-center">
            <p className="text-xs sm:text-sm text-[#77715F]">
              Đã có tài khoản?{" "}
              <Link
                href="/login"
                className="font-bold text-[#DCA936] hover:text-[#b8861b] underline underline-offset-2 ml-1"
              >
                Đăng nhập ngay
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

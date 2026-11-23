"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles,
  ShieldCheck,
  Building2,
  UserCheck
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { DEMO_ACCOUNTS } from "@/lib/demo-accounts";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const redirectAfterLogin = (roles: string[]) => {
    if (roles.includes("ADMIN")) {
      router.push("/admin/dashboard");
    } else if (roles.includes("LANDLORD")) {
      router.push("/landlord/dashboard");
    } else {
      router.push("/");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setErrorMessage("Vui lòng nhập đầy đủ địa chỉ Email và Mật khẩu.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await login({ email: trimmedEmail, password });
      setSuccessMessage(res.message || "Đăng nhập thành công!");
      setTimeout(() => {
        redirectAfterLogin(res.user.roles);
      }, 700);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = async (demo: typeof DEMO_ACCOUNTS[0]) => {
    setEmail(demo.email);
    setPassword(demo.password);
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await login({ email: demo.email, password: demo.password });
      setSuccessMessage(`Đăng nhập thành công với vai trò ${demo.roleLabel}!`);
      setTimeout(() => {
        redirectAfterLogin(res.user.roles);
      }, 600);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Không thể đăng nhập tài khoản mẫu.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-8 sm:py-14 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center min-h-[calc(100vh-160px)]">
      <div className="w-full max-w-md space-y-6">
        {/* Demo Accounts Quick-Select */}
        <div className="p-4 rounded-3xl bg-[#FFF7E5] border border-[#EDE5D5] shadow-xs space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#373523]">
            <Sparkles className="w-4 h-4 text-[#DCA936]" />
            <span>Trải nghiệm nhanh (1-Click Login):</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {DEMO_ACCOUNTS.map((demo, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleQuickDemoLogin(demo)}
                disabled={isLoading}
                className="p-2.5 rounded-2xl bg-white border border-[#EDE5D5] hover:border-[#DCA936] hover:bg-[#FFFAEF] hover:shadow-xs transition-all text-left flex flex-col justify-between group disabled:opacity-50"
              >
                <div className="flex items-center gap-1">
                  {demo.user.roles.includes("ADMIN") ? (
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                  ) : demo.user.roles.includes("LANDLORD") ? (
                    <Building2 className="w-3.5 h-3.5 text-[#DCA936]" />
                  ) : (
                    <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                  )}
                  <span className="text-[11px] font-bold text-[#373523] truncate">
                    {demo.roleLabel.split(" ")[0]}
                  </span>
                </div>
                <span className="text-[10px] text-[#77715F] font-medium truncate mt-1 group-hover:text-[#DCA936]">
                  {demo.email.split("@")[0]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Login Form Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#EDE5D5] shadow-xl shadow-[#373523]/5 space-y-5">
          {/* Alert feedback */}
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
            {/* Email Field */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-xs font-bold text-[#373523]">
                Địa chỉ Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#A8A190] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-[#FFFAEF] border border-[#EDE5D5] rounded-xl text-[#373523] placeholder:text-[#A8A190] focus:outline-none focus:border-[#DCA936] focus:bg-white transition-all min-h-[44px]"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-xs font-bold text-[#373523]">
                  Mật khẩu
                </label>
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    alert("Tính năng quên mật khẩu: Vui lòng sử dụng các tài khoản mẫu hoặc đăng ký tài khoản mới.");
                  }}
                  className="text-xs font-semibold text-[#DCA936] hover:text-[#b8861b]"
                >
                  Quên mật khẩu?
                </a>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#A8A190] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu..."
                  className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-[#FFFAEF] border border-[#EDE5D5] rounded-xl text-[#373523] placeholder:text-[#A8A190] focus:outline-none focus:border-[#DCA936] focus:bg-white transition-all min-h-[44px]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1.5 rounded-lg text-[#A8A190] hover:text-[#373523] absolute right-2.5 top-1/2 -translate-y-1/2 focus:outline-none"
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-[#77715F]">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-[#DCA936] focus:ring-[#DCA936] border-[#EDE5D5] accent-[#DCA936]"
                />
                <span>Ghi nhớ đăng nhập</span>
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
                  <span>Đăng nhập</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Switch to Register */}
          <div className="pt-4 border-t border-[#EDE5D5] text-center">
            <p className="text-xs sm:text-sm text-[#77715F]">
              Chưa có tài khoản Nestrivo?{" "}
              <Link
                href="/register"
                className="font-bold text-[#DCA936] hover:text-[#b8861b] underline underline-offset-2 ml-1"
              >
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { 
  Home, 
  Search, 
  Menu, 
  X, 
  User, 
  Heart, 
  Building, 
  LogOut, 
  ShieldCheck, 
  LayoutDashboard,
  ChevronDown,
  BookOpen,
  ArrowLeftRight
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useFavorites } from "@/context/FavoritesContext";
import { useCompare } from "@/context/CompareContext";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { user, isAuthenticated, isAdmin, isLandlord, logout } = useAuth();
  const { favoritesCount } = useFavorites();
  const { compareCount } = useCompare();

  // Scroll detection on homepage to switch from transparent overlay to solid cream
  useEffect(() => {
    if (!isHome) {
      setIsScrolled(true);
      return;
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHome]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isOverlay = isHome && !isScrolled;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        isOverlay
          ? "bg-gradient-to-b from-black/75 via-black/35 to-transparent border-transparent -mb-16 sm:-mb-20 text-white"
          : "bg-[#FFFAEF]/95 backdrop-blur-md border-b border-[#EDE5D5] shadow-[0_1px_3px_rgba(55,53,35,0.03)] text-[#292524]"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Slogan */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-xs shadow-[#F4CD65]/40 group-hover:scale-105 transition-transform shrink-0">
              <Image
                src="/logo.png"
                alt="Nestrivo Logo"
                width={40}
                height={40}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span
                className={cn(
                  "text-xl font-bold tracking-tight transition-colors leading-tight",
                  isOverlay ? "text-white group-hover:text-[#F4CD65]" : "text-[#292524] group-hover:text-[#805B10]"
                )}
              >
                Nestrivo
              </span>
              <span
                className={cn(
                  "text-[11px] font-medium -mt-0.5",
                  isOverlay ? "text-[#F4CD65]" : "text-[#805B10]"
                )}
              >
                Thuê phòng thông minh
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <Link
              href="/#listings"
              className={cn(
                "px-3.5 py-2 text-sm font-medium rounded-xl transition-colors",
                isOverlay
                  ? "text-stone-100 hover:text-white hover:bg-white/15"
                  : "text-[#57534E] hover:text-[#292524] hover:bg-[#FFF7E5]"
              )}
            >
              Tìm phòng
            </Link>
            <Link
              href="/?city=H%E1%BB%93+Ch%C3%AD+Minh"
              className={cn(
                "px-3.5 py-2 text-sm font-medium rounded-xl transition-colors",
                isOverlay
                  ? "text-stone-100 hover:text-white hover:bg-white/15"
                  : "text-[#57534E] hover:text-[#292524] hover:bg-[#FFF7E5]"
              )}
            >
              TP. Hồ Chí Minh
            </Link>
            <Link
              href="/?city=H%C3%A0+N%E1%BB%99i"
              className={cn(
                "px-3.5 py-2 text-sm font-medium rounded-xl transition-colors",
                isOverlay
                  ? "text-stone-100 hover:text-white hover:bg-white/15"
                  : "text-[#57534E] hover:text-[#292524] hover:bg-[#FFF7E5]"
              )}
            >
              Hà Nội
            </Link>
            <Link
              href="/blog"
              className={cn(
                "px-3.5 py-2 text-sm font-medium rounded-xl transition-colors",
                pathname.startsWith("/blog")
                  ? isOverlay
                    ? "text-[#F4CD65] bg-white/10 font-semibold"
                    : "text-[#805B10] bg-[#FFF7E5] font-semibold"
                  : isOverlay
                  ? "text-stone-100 hover:text-white hover:bg-white/15"
                  : "text-[#57534E] hover:text-[#292524] hover:bg-[#FFF7E5]"
              )}
            >
              Blog
            </Link>
          </nav>

          {/* Action Buttons: Favorites & Auth */}
          <div className="hidden sm:flex items-center gap-2 lg:gap-3">
            {/* Compare CTA */}
            {compareCount > 0 && (
              <Link
                href="/compare"
                className={cn(
                  "relative p-2.5 rounded-xl transition-colors",
                  isOverlay
                    ? "text-[#F4CD65] hover:text-white hover:bg-white/15"
                    : "text-[#805B10] hover:text-[#292524] hover:bg-[#FFF7E5]"
                )}
                title="So sánh phòng"
                aria-label="So sánh phòng"
              >
                <ArrowLeftRight className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#F4CD65] text-[#292524] text-[10px] font-bold flex items-center justify-center shadow-xs border border-[#DCA936]">
                  {compareCount}
                </span>
              </Link>
            )}

            <Link
              href="/favorites"
              className={cn(
                "relative p-2.5 rounded-xl transition-colors",
                isOverlay
                  ? "text-stone-100 hover:text-white hover:bg-white/15"
                  : "text-[#57534E] hover:text-[#292524] hover:bg-[#FFF7E5]"
              )}
              title="Tin đã lưu"
              aria-label="Tin đã lưu"
            >
              <Heart className="w-5 h-5" />
              {favoritesCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                  {favoritesCount > 99 ? "99+" : favoritesCount}
                </span>
              )}
            </Link>

            {/* Notification Bell */}
            {isAuthenticated && (
              <NotificationBell
                className={isOverlay ? "[&_button]:text-white [&_button]:hover:bg-white/15" : ""}
              />
            )}

            {isAuthenticated && user ? (
              /* User logged in: Profile Dropdown */
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className={cn(
                    "flex items-center gap-2 p-1.5 pr-2.5 rounded-xl border transition-all focus:outline-none",
                    isOverlay
                      ? "border-white/30 bg-black/20 hover:bg-white/20 text-white"
                      : "border-[#EDE5D5] bg-white hover:bg-[#FFF7E5] text-[#292524]"
                  )}
                >
                  <div className="w-8 h-8 rounded-lg bg-[#F4CD65] text-[#292524] font-semibold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                    {user.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left hidden lg:block max-w-[120px]">
                    <p className="text-xs font-semibold truncate leading-tight">
                      {user.fullName}
                    </p>
                    <p
                      className={cn(
                        "text-[11px] font-medium truncate",
                        isOverlay ? "text-amber-300" : "text-[#805B10]"
                      )}
                    >
                      {isAdmin ? "Quản trị viên" : isLandlord ? "Chủ nhà" : "Khách thuê"}
                    </p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 opacity-80" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-[#EDE5D5] shadow-xl py-2 z-50 text-[#292524] animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2 border-b border-[#EDE5D5]/60 bg-[#FFFAEF]/40">
                      <p className="text-xs font-semibold text-[#292524] truncate">
                        {user.fullName}
                      </p>
                      <p className="text-[11px] text-[#78716C] truncate">
                        {user.email}
                      </p>
                    </div>

                    <div className="py-1">
                      {isAdmin && (
                        <>
                          <Link
                            href="/admin/dashboard"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-purple-800 hover:bg-purple-50 transition-colors"
                          >
                            <LayoutDashboard className="w-4 h-4 text-purple-600" />
                            <span>Bảng quản trị (Dashboard)</span>
                          </Link>
                          <Link
                            href="/admin/moderation"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-purple-800 hover:bg-purple-50 transition-colors"
                          >
                            <ShieldCheck className="w-4 h-4 text-purple-600" />
                            <span>Kiểm duyệt tin (Admin)</span>
                          </Link>
                          <Link
                            href="/admin/blog"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-purple-800 hover:bg-purple-50 transition-colors"
                          >
                            <BookOpen className="w-4 h-4 text-purple-600" />
                            <span>Quản lý Blog bài viết</span>
                          </Link>
                        </>
                      )}

                      {isLandlord && (
                        <Link
                          href="/landlord/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-[#292524] hover:bg-[#FFF7E5] transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4 text-[#805B10]" />
                          <span>Bảng điều khiển Chủ nhà</span>
                        </Link>
                      )}

                      <Link
                        href="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-[#57534E] hover:text-[#292524] hover:bg-[#FFF7E5] transition-colors"
                      >
                        <User className="w-4 h-4 text-[#78716C]" />
                        <span>Hồ sơ cá nhân</span>
                      </Link>

                      <Link
                        href="/favorites"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-[#57534E] hover:text-[#292524] hover:bg-[#FFF7E5] transition-colors"
                      >
                        <Heart className="w-4 h-4 text-[#78716C]" />
                        <span>Tin đã lưu</span>
                      </Link>
                    </div>

                    <div className="pt-1 border-t border-[#EDE5D5]/60">
                      <button
                        type="button"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* User not logged in */
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className={cn(
                    "px-3.5 py-2 text-sm font-medium rounded-xl transition-colors flex items-center gap-1.5",
                    isOverlay
                      ? "text-white hover:bg-white/15"
                      : "text-[#292524] hover:bg-[#FFF7E5]"
                  )}
                >
                  <User className="w-4 h-4" />
                  <span>Đăng nhập</span>
                </Link>

                <Link
                  href="/register"
                  className="px-4 py-2 text-xs font-bold text-[#292524] bg-[#F4CD65] hover:bg-[#ebbf4d] active:bg-[#dda934] rounded-xl shadow-xs transition-all"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex sm:hidden items-center gap-1">
            {isAuthenticated && (
              <NotificationBell
                className={isOverlay ? "[&_button]:text-white [&_button]:hover:bg-white/15" : ""}
              />
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={cn(
                "p-2 rounded-xl transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center",
                isOverlay
                  ? "text-white hover:bg-white/15"
                  : "text-[#373523] hover:bg-[#FFF7E5]"
              )}
              aria-label="Mở menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-[#EDE5D5] bg-[#FFFAEF] text-[#292524] px-4 pt-3 pb-6 space-y-3 shadow-xl">
          {isAuthenticated && user && (
            <div className="p-3 rounded-2xl bg-white border border-[#EDE5D5] flex items-center gap-3 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-[#F4CD65] text-[#292524] font-semibold flex items-center justify-center">
                {user.fullName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#292524] truncate">{user.fullName}</p>
                <p className="text-xs text-[#805B10]">{isAdmin ? "Quản trị viên" : isLandlord ? "Chủ nhà" : "Khách thuê"}</p>
              </div>
            </div>
          )}

          <nav className="flex flex-col space-y-1">
            <Link
              href="/#listings"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-2.5 rounded-xl text-sm font-medium text-[#57534E] hover:bg-[#FFF7E5]"
            >
              Tìm phòng
            </Link>
            <Link
              href="/?city=H%E1%BB%93+Ch%C3%AD+Minh"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-2.5 rounded-xl text-sm font-medium text-[#57534E] hover:bg-[#FFF7E5]"
            >
              TP. Hồ Chí Minh
            </Link>
            <Link
              href="/?city=H%C3%A0+N%E1%BB%99i"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-2.5 rounded-xl text-sm font-medium text-[#57534E] hover:bg-[#FFF7E5]"
            >
              Hà Nội
            </Link>
            <Link
              href="/blog"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-2.5 rounded-xl text-sm font-medium text-[#57534E] hover:bg-[#FFF7E5]"
            >
              Blog
            </Link>
            <Link
              href="/favorites"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-2.5 rounded-xl text-sm font-medium text-[#57534E] hover:bg-[#FFF7E5] flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-500" />
                <span>Tin đã lưu</span>
              </div>
              {favoritesCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-600 font-semibold text-xs">
                  {favoritesCount}
                </span>
              )}
            </Link>
            <Link
              href="/compare"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-2.5 rounded-xl text-sm font-medium text-[#57534E] hover:bg-[#FFF7E5] flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <ArrowLeftRight className="w-4 h-4 text-[#DCA936]" />
                <span>So sánh phòng</span>
              </div>
              {compareCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-[#FFF7E5] text-[#805B10] font-semibold text-xs border border-[#F4CD65]">
                  {compareCount}
                </span>
              )}
            </Link>
            {isAdmin && (
              <>
                <Link
                  href="/admin/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3.5 py-2.5 rounded-xl text-sm font-medium text-purple-700 hover:bg-purple-50"
                >
                  Bảng quản trị (Admin)
                </Link>
                <Link
                  href="/admin/blog"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3.5 py-2.5 rounded-xl text-sm font-medium text-purple-700 hover:bg-purple-50"
                >
                  Quản lý Blog (Admin)
                </Link>
              </>
            )}
            {isLandlord && (
              <Link
                href="/landlord/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3.5 py-2.5 rounded-xl text-sm font-medium text-[#805B10] hover:bg-[#FFF7E5]"
              >
                Khu vực Chủ nhà
              </Link>
            )}
          </nav>

          <div className="pt-2 border-t border-[#EDE5D5]/60 flex flex-col gap-2">
            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full py-2.5 rounded-xl text-sm font-semibold text-rose-600 bg-rose-50 flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Đăng xuất</span>
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 text-center text-sm font-semibold text-[#292524] bg-white border border-[#EDE5D5] rounded-xl"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 text-center text-sm font-semibold text-[#292524] bg-[#F4CD65] rounded-xl shadow-xs"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

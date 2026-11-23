import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { FavoritesProvider } from "@/context/FavoritesContext";
import { CompareProvider } from "@/context/CompareContext";
import { QueryProvider } from "@/components/providers/QueryProvider";

export const metadata: Metadata = {
  title: "Nestrivo - Nền tảng tìm kiếm & Cho thuê phòng trọ minh bạch",
  description:
    "Tìm kiếm phòng trọ, căn hộ dịch vụ, phòng studio, nhà nguyên căn giá tốt, hình ảnh thật, thông tin rõ ràng và được kiểm duyệt 100%.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="h-full antialiased" suppressHydrationWarning>
      <body
        className="min-h-full bg-[#FFFAEF] text-[#292524] font-sans"
        suppressHydrationWarning
      >
        <QueryProvider>
          <AuthProvider>
            <FavoritesProvider>
              <CompareProvider>{children}</CompareProvider>
            </FavoritesProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}

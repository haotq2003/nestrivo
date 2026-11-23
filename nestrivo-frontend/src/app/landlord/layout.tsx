import type { Metadata } from "next";
import { LandlordWorkspaceLayout } from "@/components/landlord/layout/LandlordWorkspaceLayout";

export const metadata: Metadata = {
  title: "Kênh Chủ Nhà - Quản trị tin đăng Nestrivo",
  description:
    "Bảng điều khiển và quy trình tạo tin đăng phòng trọ cho Chủ nhà trên nền tảng Nestrivo.",
};

export default function LandlordRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LandlordWorkspaceLayout>{children}</LandlordWorkspaceLayout>;
}


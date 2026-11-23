import type { Metadata } from "next";
import { AdminWorkspaceLayout } from "@/components/admin/AdminWorkspaceLayout";

export const metadata: Metadata = {
  title: "Kênh Quản Trị Viên - Kiểm Duyệt Tin Đăng Nestrivo",
  description:
    "Hệ thống kiểm duyệt, phê duyệt và quản trị tin đăng phòng trọ dành cho Quản trị viên Nestrivo.",
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminWorkspaceLayout>{children}</AdminWorkspaceLayout>;
}


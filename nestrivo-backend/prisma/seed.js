import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma.js";

async function main() {
  console.log("--- BẮT ĐẦU KHỞI TẠO DỮ LIỆU MẪU (SEEDING) ---");

  // 1. Tạo tài khoản Admin mặc định
  const adminEmail = "admin@nestrivo.vn";
  const adminPassword = "Admin@123456";
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      roles: ["ADMIN"],
      isActive: true,
    },
    create: {
      email: adminEmail,
      passwordHash,
      fullName: "Quản Trị Viên Hệ Thống",
      phoneNumber: "0900000000",
      roles: ["ADMIN"],
      isActive: true,
    },
  });

  console.log(`✅ Đã tạo tài khoản Admin:`);
  console.log(`   - Email: ${admin.email}`);
  console.log(`   - Mật khẩu: ${adminPassword}`);
  console.log(`   - Roles: ${JSON.stringify(admin.roles)}`);

  // 2. Tạo danh mục Tiện ích mặc định (Amenities)
  const defaultAmenities = [
    { name: "WiFi tốc độ cao", icon: "wifi" },
    { name: "Điều hòa nhiệt độ", icon: "air-conditioner" },
    { name: "Bình nóng lạnh", icon: "water-heater" },
    { name: "Máy giặt chung / riêng", icon: "washing-machine" },
    { name: "Tủ lạnh", icon: "refrigerator" },
    { name: "Bãi để xe máy", icon: "parking" },
    { name: "Khóa vân tay / Thẻ từ", icon: "fingerprint" },
    { name: "Camera an ninh 24/7", icon: "cctv" },
    { name: "Giờ giấc tự do", icon: "clock" },
    { name: "Ban công / Cửa sổ thoáng", icon: "balcony" },
    { name: "Kệ bếp / Bếp nấu ăn", icon: "kitchen" },
    { name: "Cho phép nuôi thú cưng", icon: "pet" },
    { name: "Thang máy", icon: "elevator" },
    { name: "Giường & Nệm sẵn", icon: "bed" },
    { name: "Tủ quần áo", icon: "wardrobe" },
  ];

  for (const amenity of defaultAmenities) {
    await prisma.amenity.upsert({
      where: { name: amenity.name },
      update: {},
      create: amenity,
    });
  }
  console.log(`✅ Đã khởi tạo ${defaultAmenities.length} tiện ích phòng trọ mặc định.`);

  console.log("--- KHỞI TẠO DỮ LIỆU HOÀN TẤT ---");
}

main()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (e) => {
    console.error("Lỗi khi seed dữ liệu:", e);
    await prisma.$disconnect();
    process.exit(1);
  });

import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma.js";

async function main() {
  const landlordPasswordHash = await bcrypt.hash("Landlord@123", 12);
  const renterPasswordHash = await bcrypt.hash("Renter@123", 12);
  const adminPasswordHash = await bcrypt.hash("Admin@123456", 12);

  // 1. Admin
  const admin = await prisma.user.upsert({
    where: { email: "admin@nestrivo.vn" },
    update: { passwordHash: adminPasswordHash, roles: ["ADMIN"] },
    create: {
      email: "admin@nestrivo.vn",
      passwordHash: adminPasswordHash,
      fullName: "Quản Trị Viên Hệ Thống",
      phoneNumber: "0900000000",
      roles: ["ADMIN"],
      isActive: true,
    },
  });

  // 2. Landlord
  const landlord = await prisma.user.upsert({
    where: { email: "chutro1@gmail.com" },
    update: { passwordHash: landlordPasswordHash, roles: ["RENTER", "LANDLORD"] },
    create: {
      email: "chutro1@gmail.com",
      passwordHash: landlordPasswordHash,
      fullName: "Nguyễn Văn Tuấn (Chủ Trọ)",
      phoneNumber: "0912345678",
      roles: ["RENTER", "LANDLORD"],
      isActive: true,
    },
  });

  // Ensure landlord profile exists
  await prisma.landlordProfile.upsert({
    where: { userId: landlord.id },
    update: {},
    create: {
      userId: landlord.id,
      displayName: "Nguyễn Văn Tuấn",
      verificationStatus: "VERIFIED",
    },
  });

  // 3. Renter
  const renter = await prisma.user.upsert({
    where: { email: "test@example.com" },
    update: { passwordHash: renterPasswordHash, roles: ["RENTER"] },
    create: {
      email: "test@example.com",
      passwordHash: renterPasswordHash,
      fullName: "Nguyễn Văn Thuê (Renter)",
      phoneNumber: "0987654321",
      roles: ["RENTER"],
      isActive: true,
    },
  });

  console.log("Standard test accounts synchronized:");
  console.log("Admin:", admin.email, "pass: Admin@123456");
  console.log("Landlord:", landlord.email, "pass: Landlord@123");
  console.log("Renter:", renter.email, "pass: Renter@123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());


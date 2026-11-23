import { prisma } from "../src/lib/prisma.js";

async function main() {
  const listings = await prisma.listing.findMany({
    include: { landlord: true },
  });

  const renters = await prisma.user.findMany({
    where: { roles: { has: "RENTER" } },
  });

  if (listings.length === 0 || renters.length === 0) {
    console.log("Not enough data to seed inquiries");
    return;
  }

  const sampleInquiries = [
    {
      message: "Chào anh/chị, em là sinh viên mới lên Hà Nội học, muốn thuê phòng từ đầu tuần sau. Cho em hỏi phòng có chỗ để xe máy an toàn không và em có thể hẹn xem phòng chiều nay lúc 17h30 được không ạ?",
      moveInDate: new Date("2026-11-15T00:00:00.000Z"),
      occupantsCount: 2,
      status: "PENDING",
    },
    {
      message: "Dạ em chào chủ nhà, em vừa chuyển công tác về khu Cầu Giấy. Căn hộ này có bao gồm phí dọn phòng và internet tốc độ cao không ạ? Em muốn ký hợp đồng 1 năm.",
      moveInDate: new Date("2026-11-20T00:00:00.000Z"),
      occupantsCount: 1,
      status: "CONTACTED",
      contactedAt: new Date(),
    },
  ];

  for (const listing of listings) {
    // Pick a renter different from landlord
    const renter = renters.find((r) => r.id !== listing.landlordId) || renters[0];
    
    for (const [idx, sample] of sampleInquiries.entries()) {
      const created = await prisma.inquiry.create({
        data: {
          listingId: listing.id,
          renterId: renter.id,
          landlordId: listing.landlordId,
          message: `${sample.message} (Tin: ${listing.title})`,
          moveInDate: sample.moveInDate,
          occupantsCount: sample.occupantsCount,
          status: sample.status,
          contactedAt: sample.contactedAt || null,
        },
      });
      console.log(`Created live inquiry: ${created.id} for Landlord: ${listing.landlordId}`);
    }
  }

  console.log("Seeding real inquiries completed successfully!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

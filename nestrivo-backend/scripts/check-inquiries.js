import { prisma } from "../src/lib/prisma.js";

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, roles: true, fullName: true },
  });
  console.log("Users count:", users.length);
  users.forEach((u) => console.log(`- ${u.roles.join(",")}: ${u.fullName} (${u.email}) [${u.id}]`));

  const listings = await prisma.listing.findMany({
    select: { id: true, title: true, landlordId: true, status: true },
    take: 5,
  });
  console.log("\nListings count:", listings.length);
  listings.forEach((l) => console.log(`- ${l.title} (Landlord: ${l.landlordId})`));

  const inquiries = await prisma.inquiry.findMany({
    include: {
      listing: { select: { title: true } },
      renter: { select: { fullName: true } },
    },
  });
  console.log("\nInquiries in DB:", inquiries.length);
  inquiries.forEach((i) =>
    console.log(`- [${i.status}] ${i.renter.fullName} -> ${i.listing.title}: "${i.message}"`)
  );
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

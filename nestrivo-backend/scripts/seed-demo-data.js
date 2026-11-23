import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma.js";

const DEMO_LISTINGS = [
  {
    landlordEmail: "chutro1@gmail.com",
    title: "Căn hộ dịch vụ Studio Full Nội Thất – Ban công thoáng mát Quận 7",
    description:
      "Phòng Studio mới xây 100%, thiết kế hiện đại tông gỗ ấm. Có ban công lớn đón nắng sáng, bếp riêng tách mùi, máy giặt riêng trong phòng. Khu vực an ninh yên tĩnh, gần Đại học Tôn Đức Thắng, Lotte Mart Quận 7, di chuyển sang Quận 1 chỉ 10 phút.",
    propertyType: "SERVICE_APARTMENT",
    price: 5500000,
    deposit: 5500000,
    area: 32,
    bedrooms: 1,
    bathrooms: 1,
    maxOccupants: 2,
    address: "128 Nguyễn Thị Thập",
    ward: "Tân Phong",
    district: "Quận 7",
    city: "Hồ Chí Minh",
    latitude: 10.7376,
    longitude: 106.7124,
    minimumStayMonths: 6,
    allowsPets: true,
    hasMezzanine: false,
    isFurnished: true,
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1000&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1000&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1000&auto=format&fit=crop&q=80",
    ],
    amenityNames: [
      "WiFi tốc độ cao",
      "Điều hòa nhiệt độ",
      "Bình nóng lạnh",
      "Tủ lạnh",
      "Máy giặt chung / riêng",
      "Thang máy",
      "Khóa vân tay / Thẻ từ",
      "Ban công / Cửa sổ thoáng",
      "Kệ bếp / Bếp nấu ăn",
      "Giờ giấc tự do",
    ],
    fees: [
      { type: "ELECTRICITY", amount: 3800, unit: "PER_KWH" },
      { type: "WATER", amount: 100000, unit: "PER_PERSON" },
      { type: "INTERNET", amount: 100000, unit: "PER_MONTH" },
      { type: "PARKING", amount: 150000, unit: "PER_VEHICLE" },
    ],
  },
  {
    landlordEmail: "chutro1@gmail.com",
    title: "Phòng Studio gác lửng cao ráo gần Landmark 81 – Bình Thạnh",
    description:
      "Phòng gác lửng trần cao 4m2 đứng thoải mái không đụng đầu. Trang bị sẵn máy lạnh Inverter tiết kiệm điện, tủ lạnh, nệm cao su, kệ bếp đá hoa cương. Giờ giấc tự do 24/7, khóa vân tay 2 lớp, camera an ninh từng tầng.",
    propertyType: "STUDIO",
    price: 4600000,
    deposit: 4600000,
    area: 28,
    bedrooms: 1,
    bathrooms: 1,
    maxOccupants: 2,
    address: "45 Điện Biên Phủ",
    ward: "Phường 22",
    district: "Bình Thạnh",
    city: "Hồ Chí Minh",
    latitude: 10.7952,
    longitude: 106.7186,
    minimumStayMonths: 6,
    allowsPets: false,
    hasMezzanine: true,
    isFurnished: true,
    images: [
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1000&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=1000&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1000&auto=format&fit=crop&q=80",
    ],
    amenityNames: [
      "WiFi tốc độ cao",
      "Điều hòa nhiệt độ",
      "Bình nóng lạnh",
      "Tủ lạnh",
      "Bãi để xe máy",
      "Khóa vân tay / Thẻ từ",
      "Camera an ninh 24/7",
      "Giờ giấc tự do",
      "Giường & Nệm sẵn",
      "Tủ quần áo",
    ],
    fees: [
      { type: "ELECTRICITY", amount: 3500, unit: "PER_KWH" },
      { type: "WATER", amount: 90000, unit: "PER_PERSON" },
      { type: "INTERNET", amount: 80000, unit: "PER_MONTH" },
      { type: "PARKING", amount: 120000, unit: "PER_VEHICLE" },
    ],
  },
  {
    landlordEmail: "chutro1@gmail.com",
    title: "Căn hộ 1PN tách bếp trung tâm Quận 3 – Hẻm xe hơi yên tĩnh",
    description:
      "Căn hộ dịch vụ 1 phòng ngủ riêng biệt, phòng khách đón ánh sáng tự nhiên cực đẹp. Phù hợp nhân viên văn phòng hoặc cặp đôi làm việc tại Quận 1, Quận 3. Bảo vệ trực 24/24, dọn phòng miễn phí 1 lần/tuần.",
    propertyType: "SERVICE_APARTMENT",
    price: 7800000,
    deposit: 7800000,
    area: 42,
    bedrooms: 1,
    bathrooms: 1,
    maxOccupants: 3,
    address: "210 Cách Mạng Tháng 8",
    ward: "Phường 10",
    district: "Quận 3",
    city: "Hồ Chí Minh",
    latitude: 10.7797,
    longitude: 106.6805,
    minimumStayMonths: 12,
    allowsPets: true,
    hasMezzanine: false,
    isFurnished: true,
    images: [
      "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=1000&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=1000&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?w=1000&auto=format&fit=crop&q=80",
    ],
    amenityNames: [
      "WiFi tốc độ cao",
      "Điều hòa nhiệt độ",
      "Bình nóng lạnh",
      "Tủ lạnh",
      "Máy giặt chung / riêng",
      "Thang máy",
      "Khóa vân tay / Thẻ từ",
      "Camera an ninh 24/7",
      "Ban công / Cửa sổ thoáng",
      "Cho phép nuôi thú cưng",
    ],
    fees: [
      { type: "ELECTRICITY", amount: 4000, unit: "PER_KWH" },
      { type: "WATER", amount: 100000, unit: "PER_PERSON" },
      { type: "INTERNET", amount: 100000, unit: "PER_MONTH" },
      { type: "PARKING", amount: 150000, unit: "PER_VEHICLE" },
    ],
  },
  {
    landlordEmail: "chutro1@gmail.com",
    title: "Phòng trọ sinh viên sạch đẹp gần Làng Đại Học – TP. Thủ Đức",
    description:
      "Phòng mới sơn sửa sạch sẽ, cửa sổ lớn cực kỳ thoáng mát, không chung chủ, giờ giấc tự do. Bãi để xe tầng trệt rộng rãi có camera giám sát. Cách tuyến Metro và trạm xe buýt chỉ 5 phút đi bộ.",
    propertyType: "ROOM_SHARE",
    price: 2900000,
    deposit: 2900000,
    area: 22,
    bedrooms: 1,
    bathrooms: 1,
    maxOccupants: 2,
    address: "88 Võ Văn Ngân",
    ward: "Bình Thọ",
    district: "Thủ Đức",
    city: "Hồ Chí Minh",
    latitude: 10.8505,
    longitude: 106.7621,
    minimumStayMonths: 3,
    allowsPets: false,
    hasMezzanine: true,
    isFurnished: false,
    images: [
      "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=1000&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1000&auto=format&fit=crop&q=80",
    ],
    amenityNames: [
      "WiFi tốc độ cao",
      "Điều hòa nhiệt độ",
      "Bãi để xe máy",
      "Camera an ninh 24/7",
      "Giờ giấc tự do",
      "Ban công / Cửa sổ thoáng",
    ],
    fees: [
      { type: "ELECTRICITY", amount: 3500, unit: "PER_KWH" },
      { type: "WATER", amount: 70000, unit: "PER_PERSON" },
      { type: "INTERNET", amount: 50000, unit: "PER_MONTH" },
    ],
  },
  {
    landlordEmail: "chutro1@gmail.com",
    title: "Nhà nguyên căn 2PN hẻm rộng gần sân bay Tân Sơn Nhất – Tân Bình",
    description:
      "Nhà nguyên căn 1 trệt 1 lầu, 2 phòng ngủ, 2 WC, sân để xe riêng cho 4 xe máy. Phù hợp gia đình nhỏ hoặc nhóm bạn 3-4 người ở ghép tiết kiệm. Điện nước tính theo giá nhà nước cực rẻ.",
    propertyType: "WHOLE_HOUSE",
    price: 9500000,
    deposit: 9500000,
    area: 65,
    bedrooms: 2,
    bathrooms: 2,
    maxOccupants: 4,
    address: "312 Cộng Hòa",
    ward: "Phường 13",
    district: "Tân Bình",
    city: "Hồ Chí Minh",
    latitude: 10.8019,
    longitude: 106.6472,
    minimumStayMonths: 12,
    allowsPets: true,
    hasMezzanine: false,
    isFurnished: true,
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1000&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1000&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1000&auto=format&fit=crop&q=80",
    ],
    amenityNames: [
      "WiFi tốc độ cao",
      "Điều hòa nhiệt độ",
      "Bình nóng lạnh",
      "Tủ lạnh",
      "Bãi để xe máy",
      "Kệ bếp / Bếp nấu ăn",
      "Cho phép nuôi thú cưng",
      "Giờ giấc tự do",
    ],
    fees: [
      { type: "ELECTRICITY", amount: 3000, unit: "PER_KWH" },
      { type: "WATER", amount: 15000, unit: "PER_M3" },
    ],
  },
  {
    landlordEmail: "chutro2@gmail.com",
    title: "Phòng trọ sinh viên Cầu Giấy khép kín, có gác lửng & ban công",
    description:
      "Phòng khép kín sạch sẽ tại Dịch Vọng Hậu, cách ĐH Quốc Gia và ĐH Sư Phạm 5 phút. Đầy đủ điều hòa, nóng lạnh, giường tủ, kệ bếp. Không chung chủ, ra vào bằng vân tay, sân phơi tầng thượng cực rộng.",
    propertyType: "STUDIO",
    price: 3800000,
    deposit: 3800000,
    area: 25,
    bedrooms: 1,
    bathrooms: 1,
    maxOccupants: 2,
    address: "68 Xuân Thủy",
    ward: "Dịch Vọng Hậu",
    district: "Cầu Giấy",
    city: "Hà Nội",
    latitude: 21.0368,
    longitude: 105.7826,
    minimumStayMonths: 6,
    allowsPets: false,
    hasMezzanine: true,
    isFurnished: true,
    images: [
      "https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=1000&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=1000&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1000&auto=format&fit=crop&q=80",
    ],
    amenityNames: [
      "WiFi tốc độ cao",
      "Điều hòa nhiệt độ",
      "Bình nóng lạnh",
      "Máy giặt chung / riêng",
      "Khóa vân tay / Thẻ từ",
      "Camera an ninh 24/7",
      "Giờ giấc tự do",
      "Giường & Nệm sẵn",
      "Tủ quần áo",
    ],
    fees: [
      { type: "ELECTRICITY", amount: 3800, unit: "PER_KWH" },
      { type: "WATER", amount: 100000, unit: "PER_PERSON" },
      { type: "INTERNET", amount: 100000, unit: "PER_MONTH" },
      { type: "PARKING", amount: 100000, unit: "PER_VEHICLE" },
    ],
  },
  {
    landlordEmail: "chutro2@gmail.com",
    title: "Chung cư mini Full đồ cao cấp ngõ Thái Hà – Đống Đa, có thang máy",
    description:
      "Tòa nhà CCMN 7 tầng có thang máy tốc độ cao, hầm để xe rộng. Phòng tràn ngập ánh sáng tự nhiên, full nội thất mới tinh: tivi, tủ lạnh 2 cánh, máy giặt, bếp từ đôi, sofa. Gần rạp chiếu phim Quốc Gia và nhiều tòa văn phòng.",
    propertyType: "SERVICE_APARTMENT",
    price: 5200000,
    deposit: 5200000,
    area: 30,
    bedrooms: 1,
    bathrooms: 1,
    maxOccupants: 2,
    address: "115 Thái Hà",
    ward: "Trung Liệt",
    district: "Đống Đa",
    city: "Hà Nội",
    latitude: 21.0119,
    longitude: 105.8224,
    minimumStayMonths: 6,
    allowsPets: false,
    hasMezzanine: false,
    isFurnished: true,
    images: [
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1000&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=1000&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1560448075-bb485b067938?w=1000&auto=format&fit=crop&q=80",
    ],
    amenityNames: [
      "WiFi tốc độ cao",
      "Điều hòa nhiệt độ",
      "Bình nóng lạnh",
      "Tủ lạnh",
      "Máy giặt chung / riêng",
      "Thang máy",
      "Khóa vân tay / Thẻ từ",
      "Ban công / Cửa sổ thoáng",
      "Kệ bếp / Bếp nấu ăn",
    ],
    fees: [
      { type: "ELECTRICITY", amount: 3800, unit: "PER_KWH" },
      { type: "WATER", amount: 100000, unit: "PER_PERSON" },
      { type: "INTERNET", amount: 100000, unit: "PER_MONTH" },
      { type: "PARKING", amount: 150000, unit: "PER_VEHICLE" },
    ],
  },
  {
    landlordEmail: "chutro2@gmail.com",
    title: "Phòng Studio ban công chill gần Royal City – Thanh Xuân",
    description:
      "Phòng thiết kế tối giản phong cách Bắc Âu, có ban công đặt bàn trà cực chill. Gần Ngã Tư Sở, Royal City, thuận tiện đi lại các quận nội thành Hà Nội. Đầy đủ nội thất chỉ việc xách vali vào ở ngay.",
    propertyType: "STUDIO",
    price: 4400000,
    deposit: 4400000,
    area: 27,
    bedrooms: 1,
    bathrooms: 1,
    maxOccupants: 2,
    address: "72 Nguyễn Trãi",
    ward: "Thượng Đình",
    district: "Thanh Xuân",
    city: "Hà Nội",
    latitude: 20.9998,
    longitude: 105.8147,
    minimumStayMonths: 6,
    allowsPets: true,
    hasMezzanine: false,
    isFurnished: true,
    images: [
      "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=1000&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1000&auto=format&fit=crop&q=80",
    ],
    amenityNames: [
      "WiFi tốc độ cao",
      "Điều hòa nhiệt độ",
      "Bình nóng lạnh",
      "Tủ lạnh",
      "Ban công / Cửa sổ thoáng",
      "Cho phép nuôi thú cưng",
      "Giờ giấc tự do",
      "Giường & Nệm sẵn",
    ],
    fees: [
      { type: "ELECTRICITY", amount: 3700, unit: "PER_KWH" },
      { type: "WATER", amount: 90000, unit: "PER_PERSON" },
      { type: "INTERNET", amount: 100000, unit: "PER_MONTH" },
    ],
  },
];

async function main() {
  console.log("🚀 Bắt đầu seed Users + Phòng trọ mẫu...");

  const landlordHash = await bcrypt.hash("Landlord@123", 12);
  const renterHash = await bcrypt.hash("Renter@123", 12);

  // 1. Seed Users (2 Landlords đã xác minh + 2 Renters)
  const landlord1 = await prisma.user.upsert({
    where: { email: "chutro1@gmail.com" },
    update: { isActive: true, roles: ["RENTER", "LANDLORD"] },
    create: {
      email: "chutro1@gmail.com",
      passwordHash: landlordHash,
      fullName: "Nguyễn Văn Tuấn",
      phoneNumber: "0912345678",
      roles: ["RENTER", "LANDLORD"],
      isActive: true,
    },
  });

  await prisma.landlordProfile.upsert({
    where: { userId: landlord1.id },
    update: { verificationStatus: "VERIFIED" },
    create: {
      userId: landlord1.id,
      displayName: "Hệ thống Nhà trọ Minh Tuấn",
      description: "Chuyên cho thuê căn hộ Studio & phòng trọ cao cấp tại TP.HCM, minh bạch hợp đồng.",
      verificationStatus: "VERIFIED",
    },
  });

  const landlord2 = await prisma.user.upsert({
    where: { email: "chutro2@gmail.com" },
    update: { isActive: true, roles: ["RENTER", "LANDLORD"] },
    create: {
      email: "chutro2@gmail.com",
      passwordHash: landlordHash,
      fullName: "Trần Minh Anh",
      phoneNumber: "0934567890",
      roles: ["RENTER", "LANDLORD"],
      isActive: true,
    },
  });

  await prisma.landlordProfile.upsert({
    where: { userId: landlord2.id },
    update: { verificationStatus: "VERIFIED" },
    create: {
      userId: landlord2.id,
      displayName: "Minh Anh Home Hà Nội",
      description: "Chuỗi phòng trọ khép kín và CCMN trung tâm Cầu Giấy, Đống Đa, Thanh Xuân.",
      verificationStatus: "VERIFIED",
    },
  });

  const renter1 = await prisma.user.upsert({
    where: { email: "renter1@nestrivo.vn" },
    update: { isActive: true, roles: ["RENTER"] },
    create: {
      email: "renter1@nestrivo.vn",
      passwordHash: renterHash,
      fullName: "Lê Hoàng Nam",
      phoneNumber: "0977112233",
      roles: ["RENTER"],
      isActive: true,
    },
  });

  const renter2 = await prisma.user.upsert({
    where: { email: "test@example.com" },
    update: { isActive: true, roles: ["RENTER"] },
    create: {
      email: "test@example.com",
      passwordHash: renterHash,
      fullName: "Nguyễn Minh Thư",
      phoneNumber: "0987654321",
      roles: ["RENTER"],
      isActive: true,
    },
  });

  const landlordByEmail = {
    "chutro1@gmail.com": landlord1,
    "chutro2@gmail.com": landlord2,
  };

  // Lấy toàn bộ amenities đã có trong DB
  const amenities = await prisma.amenity.findMany();
  const amenityByName = new Map(amenities.map((a) => [a.name, a.id]));

  // 2. Seed 8 Listings (idempotent theo title)
  const createdListings = [];
  for (const item of DEMO_LISTINGS) {
    const existing = await prisma.listing.findFirst({
      where: { title: item.title },
    });

    if (existing) {
      createdListings.push(existing);
      console.log(`⏭️  Đã tồn tại: ${item.title}`);
      continue;
    }

    const landlord = landlordByEmail[item.landlordEmail];
    const amenityConnects = item.amenityNames
      .map((name) => amenityByName.get(name))
      .filter(Boolean)
      .map((amenityId) => ({ amenity: { connect: { id: amenityId } } }));

    const created = await prisma.listing.create({
      data: {
        landlordId: landlord.id,
        title: item.title,
        description: item.description,
        propertyType: item.propertyType,
        price: item.price,
        deposit: item.deposit,
        area: item.area,
        bedrooms: item.bedrooms,
        bathrooms: item.bathrooms,
        maxOccupants: item.maxOccupants,
        address: item.address,
        ward: item.ward,
        district: item.district,
        city: item.city,
        latitude: item.latitude,
        longitude: item.longitude,
        minimumStayMonths: item.minimumStayMonths,
        allowsPets: item.allowsPets,
        hasMezzanine: item.hasMezzanine,
        isFurnished: item.isFurnished,
        status: "PUBLISHED",
        availabilityStatus: "AVAILABLE",
        publishedAt: new Date(),
        images: {
          create: item.images.map((url, idx) => ({
            imageUrl: url,
            sortOrder: idx,
          })),
        },
        amenities: {
          create: amenityConnects,
        },
        fees: {
          create: item.fees,
        },
      },
    });

    createdListings.push(created);
    console.log(`✅ Đã tạo phòng: ${created.title}`);
  }

  // 3. Seed một số Favorites & Inquiries để hiển thị section Trending / Yêu thích trên trang chủ
  if (createdListings.length >= 4) {
    const favPairs = [
      { userId: renter1.id, listingId: createdListings[0].id },
      { userId: renter2.id, listingId: createdListings[0].id },
      { userId: renter1.id, listingId: createdListings[1].id },
      { userId: renter2.id, listingId: createdListings[5].id },
    ];

    for (const pair of favPairs) {
      await prisma.favorite.upsert({
        where: {
          userId_listingId: {
            userId: pair.userId,
            listingId: pair.listingId,
          },
        },
        update: {},
        create: pair,
      });
    }

    const existingInquiry = await prisma.inquiry.findFirst({
      where: { renterId: renter1.id, listingId: createdListings[0].id },
    });

    if (!existingInquiry) {
      await prisma.inquiry.createMany({
        data: [
          {
            renterId: renter1.id,
            landlordId: createdListings[0].landlordId,
            listingId: createdListings[0].id,
            message: "Chào anh, em muốn hẹn xem phòng vào 18h chiều mai được không ạ?",
            status: "PENDING",
            occupantsCount: 1,
          },
          {
            renterId: renter2.id,
            landlordId: createdListings[5].landlordId,
            listingId: createdListings[5].id,
            message: "Phòng này còn trống không ạ? Em muốn thuê ở ngay đầu tháng tới.",
            status: "CONFIRMED",
            occupantsCount: 2,
          },
        ],
      });
    }
  }

  console.log("\n🎉 SEED DỮ LIỆU DEMO HOÀN TẤT!");
}

main()
  .catch((err) => {
    console.error("❌ Lỗi seed demo data:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

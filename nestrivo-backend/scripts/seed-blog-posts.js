import "dotenv/config";
import { prisma } from "../src/lib/prisma.js";

async function seedBlogPosts() {
  console.log("Seeding initial blog posts...");

  // Find admin user to set as author
  let admin = await prisma.user.findFirst({
    where: { roles: { has: "ADMIN" } },
  });

  if (!admin) {
    admin = await prisma.user.findFirst();
  }

  if (!admin) {
    console.error("No user found in DB to assign as author.");
    return;
  }

  const posts = [
    {
      title: "5 điều tuyệt đối phải kiểm tra kỹ trong hợp đồng thuê phòng trọ",
      slug: "5-dieu-tuyet-doi-phai-kiem-tra-trong-hop-dong-thue-phong-tro",
      summary: "Ký hợp đồng thuê trọ vội vàng có thể khiến bạn mất cọc oan uổng hoặc chịu các khoản phí phát sinh vô lý. Cùng Nestrivo điểm qua 5 điều khoản quan trọng nhất.",
      category: "Pháp lý & Hợp đồng",
      coverImage: "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1200&q=80",
      tags: ["hợp đồng", "tiền cọc", "kinh nghiệm"],
      isPublished: true,
      publishedAt: new Date("2026-11-15T09:00:00Z"),
      content: `### 1. Khoản tiền đặt cọc và điều kiện hoàn cọc

Tiền đặt cọc là vấn đề nhạy cảm nhất khi thuê phòng. Bạn cần làm rõ trong hợp đồng:
- Số tiền cọc chính xác là bao nhiêu tháng (thường là 1 - 2 tháng).
- Điều kiện được hoàn lại 100% tiền cọc (báo trước bao nhiêu ngày khi muốn chuyển đi, tình trạng bàn giao phòng ra sao).
- Thời gian chủ nhà phải hoàn cọc sau khi thanh lý hợp đồng (thường từ 1 - 3 ngày làm việc).

### 2. Biểu giá điện, nước và các loại phụ phí cố định

Đừng chỉ nhìn vào giá thuê niêm yết mà quên các phụ phí kèm theo. Hợp đồng cần ghi chi tiết:
- **Giá điện**: Tính theo công tơ riêng bao nhiêu VNĐ/kWh hay tính giá nhà nước?
- **Giá nước**: Theo khối ($/m³) hay theo đầu người ($/người/tháng)?
- **Phí dịch vụ cố định**: Tiền vệ sinh hành lang, phí gửi xe máy, phí wifi/internet, tiền thang máy, tiền rác.

### 3. Hiện trạng trang thiết bị khi nhận phòng (Biên bản bàn giao)

Trước khi ký nhận phòng, hãy chụp ảnh hoặc quay video toàn bộ hiện trạng:
- Tường, sàn gạch, trần nhà có bị ẩm mốc, bong tróc hay nứt nẻ không.
- Kiểm tra các thiết bị: điều hòa, bình nóng lạnh, bóng đèn, vòi sen, khóa cửa xem có hoạt động trơn tru không.
- Ghi rõ những hỏng hóc có sẵn vào phụ lục hợp đồng để tránh việc bị trừ cọc vô lý sau này.

### 4. Quy định về việc chấm dứt hợp đồng trước hạn

Cuộc sống sinh viên và người đi làm thường có nhiều biến động (chuyển chỗ làm, đổi trường học). Bạn nên đàm phán rõ:
- Nếu bạn cần chuyển đi trước hạn hợp đồng, báo trước tối thiểu 30 ngày thì có được hỗ trợ tìm người thế phòng hoặc chịu mức phạt hợp lý hay không.
- Trường hợp chủ nhà đột ngột lấy lại phòng trước hạn thì chủ nhà phải bồi thường thế nào cho bạn.

### 5. Giờ giấc sinh hoạt và quy định tiếp khách, an ninh

- Khu trọ có giờ giới nghiêm đóng cổng không, hay tự do giờ giấc bằng khóa vân tay / thẻ từ?
- Người thân, bạn bè có được ở lại qua đêm không, thủ tục đăng ký tạm trú thế nào?
- Việc nuôi thú cưng (chó, mèo) có được cho phép hay không?`,
    },
    {
      title: "Kinh nghiệm tìm phòng trọ tại TP.HCM cho tân sinh viên và người mới đi làm",
      slug: "kinh-nghiem-tim-phong-tro-tai-tphcm-cho-sinh-vien",
      summary: "Bỏ túi ngay cẩm nang chọn khu vực thuê trọ tại Sài Gòn: ưu nhược điểm từng quận, cách tránh bẫy tin ảo và mẹo tiết kiệm chi phí sinh hoạt.",
      category: "Kinh nghiệm thuê phòng",
      coverImage: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
      tags: ["TP.HCM", "sinh viên", "thuê trọ"],
      isPublished: true,
      publishedAt: new Date("2026-11-18T14:30:00Z"),
      content: `### Tìm hiểu đặc thù các khu vực thuê trọ tại TP.HCM

- **Quận Bình Thạnh & Phú Nhuận**: Vị trí đắc địa, giáp Quận 1, Quận 3, gần nhiều trường ĐH như HUTECH, Ngoại Thương, Kinh Tế Tài Chính. Giá phòng trung bình từ 3.5 - 6.5 triệu/tháng.
- **Quận 10 & Quận 5**: Khu vực trung tâm, ẩm thực phong phú, gần ĐH Bách Khoa, ĐH Sư Phạm, ĐH Y Dược. Phòng trọ ở đây tiện nghi nhưng hẻm thường sâu, giá từ 3 - 5.5 triệu/tháng.
- **Thủ Đức & Quận 9**: Làng đại học Quốc Gia, không gian thoáng đãng, nhiều cây xanh, chi phí sinh hoạt rẻ. Phù hợp sinh viên muốn tiết kiệm ngân sách, giá từ 1.8 - 3.5 triệu/tháng.
- **Quận Tân Bình & Tân Phú**: Gần sân bay, giao thông thuận lợi, nhiều khu căn hộ dịch vụ và phòng studio mới xây với giá hợp lý (3 - 5 triệu/tháng).

### 3 chiêu trò lừa đảo thuê phòng cần cảnh giác

1. **Đòi chuyển cọc giữ chỗ khi chưa xem phòng thực tế**: Tuyệt đối không chuyển khoản trước khi bạn đến tận nơi xem phòng và gặp trực tiếp chủ nhà hoặc người được ủy quyền hợp pháp.
2. **Hình ảnh phòng studio lung linh giá chỉ 1.5 triệu**: Đây thường là chiêu mồi chài của môi giới lừa đảo để lấy thông tin của bạn rồi dẫn đi xem các phòng trọ tồi tàn khác.
3. **Mập mờ về tiền điện nước**: Báo giá thuê rẻ nhưng điện tính 5.000đ - 6.000đ/số và bắt buộc mỗi tháng dùng tối thiểu tiền triệu.

### Lời khuyên vàng: Ưu tiên phòng đã xác minh trên Nestrivo

Trên Nestrivo, những tin đăng có huy hiệu **Chủ nhà đã xác minh eKYC** và được cộng đồng đánh giá trải nghiệm thực tế sau khi đi xem phòng sẽ giúp bạn yên tâm tuyệt đối về tính minh bạch và an toàn.`,
    },
    {
      title: "Cách decor phòng trọ nhỏ hẹp thành không gian sống chill như quán cà phê",
      slug: "cach-decor-phong-tro-nho-hep-thanh-khong-gian-song-chill",
      summary: "Biến căn phòng trọ 15 - 20m² thành không gian nghỉ ngơi thư giãn và tràn đầy năng lượng với chi phí tiết kiệm dưới 2 triệu đồng.",
      category: "Mẹo không gian sống",
      coverImage: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
      tags: ["decor", "phòng nhỏ", "tiết kiệm"],
      isPublished: true,
      publishedAt: new Date("2026-11-20T10:15:00Z"),
      content: `### 1. Tận dụng tối đa gam màu sáng và ánh sáng tự nhiên

- Sơn tường hoặc dán decal tông màu trắng ấm, be hoặc xám nhạt để tạo cảm giác không gian rộng mở và thoáng đãng hơn.
- Mở rộng rèm cửa đón ánh nắng ban mai, kết hợp rèm voan trắng nhẹ nhàng giúp căn phòng thêm phần thơ mộng.

### 2. Sử dụng nội thất đa năng và tối giản

- **Giường pallet hoặc giường có ngăn kéo**: Giúp bạn tận dụng khoảng trống dưới gầm giường để chứa đồ đạc ít dùng tới.
- **Kệ treo tường**: Giải phóng diện tích mặt sàn, vừa để sách, vừa đặt vài chậu cây cảnh nhỏ xinh.
- **Gương đứng toàn thân**: Chiếc gương phản chiếu ánh sáng và tạo chiều sâu thị giác, giúp căn phòng như rộng gấp đôi.

### 3. Điểm nhấn với đèn vàng ấm áp và cây xanh

- Đèn ngủ để bàn ánh sáng vàng dịu hoặc dây đèn led đom đóm sẽ lập tức biến căn phòng thành góc chill sau một ngày dài học tập và làm việc căng thẳng.
- Thêm một vài chậu cây lọc không khí như trầu bà, lưỡi hổ hoặc sen đá trên bàn làm việc giúp không gian tươi mát và giàu sức sống.`,
    },
  ];

  for (const post of posts) {
    const existing = await prisma.blogPost.findUnique({
      where: { slug: post.slug },
    });
    if (!existing) {
      await prisma.blogPost.create({
        data: {
          ...post,
          authorId: admin.id,
        },
      });
      console.log(`- Created post: ${post.title}`);
    } else {
      console.log(`- Post already exists: ${post.slug}`);
    }
  }

  console.log("Seeding blog posts complete!");
}

seedBlogPosts()
  .catch((err) => {
    console.error("Error seeding blog posts:", err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

# Nestrivo Design System & Guidelines (Impeccable Standard)

Tài liệu định hình chuẩn mực thiết kế (UI/UX) cho nền tảng bất động sản **Nestrivo**, ngăn chặn các mẫu thiết kế rập khuôn của AI (*AI Slop*) và mang lại trải nghiệm chuyên nghiệp, thực tế.

---

## 1. Bản sắc thương hiệu (Brand Identity)

* **Sứ mệnh**: Giúp người thuê tìm được nơi an cư lý tưởng, an toàn, minh bạch về chi phí; giúp chủ nhà quản lý và tiếp cận khách thuê văn minh.
* **Cảm xúc mang lại**: **An tâm, Ấm cúng, Rõ ràng, Tinh tế**.
* **Nguyên tắc cốt lõi**:
  * **Minh bạch là số 1**: Giá thuê, tiền cọc, chi phí dịch vụ (điện, nước, xe) phải được hiển thị rõ ràng, không mập mờ.
  * **Hình ảnh & Vị trí trực quan**: Ảnh phòng trọ rõ nét, có bản đồ/địa chỉ quận huyện cụ thể.
  * **Tránh AI Slop**: Tuyệt đối không dùng gradient tím xanh vô nghĩa, không đổ bóng mờ mịt, không dùng chữ xám nhạt khó đọc.

---

## 2. Bảng màu chuẩn (Color Palette)

### Primary (Màu chủ đạo - An cư & Tin cậy)
* `brand-50`: `#F0FDF4`
* `brand-100`: `#DCFCE7`
* `brand-600`: `#16A34A` (Emerald / Forest Green - biểu tượng sự sống, mái ấm bền vững)
* `brand-700`: `#15803D` (Màu nút tương tác chính, hover)
* `brand-900`: `#14532D`

### Accent (Màu điểm nhấn - Giá tiền & Huy hiệu)
* `accent-500`: `#EA580C` (Warm Orange / Amber - Nổi bật giá tiền, tag "Phòng mới", "Chủ nhà uy tín")
* `accent-600`: `#C2410C`

### Neutrals (Màu nền & Phân cấp chữ - Tương phản cao)
* Canvas / Body: `#F8FAFC` (`slate-50`)
* Card Surface: `#FFFFFF` (`white`) với viền nét nhẹ `#E2E8F0` (`slate-200`)
* Text Primary: `#0F172A` (`slate-900`) - Chữ đen đậm rõ ràng cho tiêu đề, giá tiền.
* Text Secondary: `#334155` (`slate-700`) - Nội dung mô tả chính.
* Text Muted: `#64748B` (`slate-500`) - Thời gian, địa chỉ phụ (vẫn đạt chuẩn tương phản > 4.5:1).

---

## 3. Hệ thống Typography (Phông chữ & Phân cấp)

* **Font Sans**: `Geist Sans` hoặc `Inter` kết hợp `Plus Jakarta Sans`.
* **Phân cấp**:
  * **Display Title (Hero)**: `text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900`
  * **Section Title**: `text-2xl font-bold text-slate-900`
  * **Card Title**: `text-base font-semibold text-slate-900 line-clamp-2 hover:text-emerald-700`
  * **Price Tag**: `text-lg font-bold text-emerald-700` (hoặc `text-orange-600`)
  * **Body**: `text-sm sm:text-base text-slate-700 leading-relaxed`
  * **Meta / Details**: `text-xs font-medium text-slate-500`

---

## 4. Bố cục Component chuẩn (Component Guidelines)

### Thẻ phòng trọ (Listing Card)
* Tỉ lệ ảnh: `aspect-[16/10]` hoặc `aspect-[4/3]`, bo góc `rounded-2xl` hoặc `rounded-xl`, `overflow-hidden`.
* Nút yêu thích: Tròn, nền trắng mờ nhẹ `bg-white/90 backdrop-blur-sm`, đặt góc trên cùng bên phải ảnh.
* Thông tin quan trọng theo thứ tự:
  1. Loại hình & Quận/Huyện (tag nhỏ trên ảnh hoặc ngay dưới ảnh)
  2. Giá thuê hàng tháng (in to, đậm)
  3. Tiêu đề tin
  4. Thông số phòng: Diện tích ($m^2$), số PN, số WC, người ở tối đa (có icon minh họa).
  5. Địa chỉ tóm tắt & Ngày đăng.

### Bộ lọc tìm kiếm (Search & Filter Bar)
* Đặt nổi bật ở Hero banner.
* Chia thành các tab nhanh: Loại phòng, Khoảng giá, Khu vực (Thành phố / Quận), Tiện ích (Điều hòa, Nóng lạnh, Máy giặt...).
* Tương tác mượt mà, hỗ trợ cả Desktop lẫn Mobile responsive.

---

## 5. Quy tắc kiểm tra (Impeccable Checklist)

- [ ] Không có hiệu ứng gradient tím - xanh lam lòe loẹt.
- [ ] Mọi nút bấm đều có chiều cao tối thiểu 44px (chuẩn mobile touch target).
- [ ] Tương phản màu chữ đạt chuẩn WCAG AA (đặc biệt không dùng text xám nhạt trên nền xám).
- [ ] Ảnh phòng trọ có trạng thái ảnh fallback (nếu link ảnh lỗi hoặc đang load).
- [ ] Định dạng tiền tệ đúng chuẩn Việt Nam (`3.500.000 ₫/tháng`).


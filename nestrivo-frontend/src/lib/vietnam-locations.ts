/**
 * Danh sách Tỉnh / Thành phố và Quận / Huyện tại Việt Nam
 * Dành cho bộ lọc tìm kiếm và tạo tin đăng Nestrivo
 */

export interface ProvinceData {
  name: string;
  districts: string[];
}

export const VIETNAM_LOCATIONS: Record<string, { label: string; districts: string[] }> = {
  "Hồ Chí Minh": {
    label: "Hồ Chí Minh",
    districts: [
      "Quận 1",
      "Quận 3",
      "Quận 4",
      "Quận 5",
      "Quận 6",
      "Quận 7",
      "Quận 8",
      "Quận 10",
      "Quận 11",
      "Quận 12",
      "Bình Thạnh",
      "TP. Thủ Đức",
      "Gò Vấp",
      "Phú Nhuận",
      "Tân Bình",
      "Tân Phú",
      "Bình Tân",
      "Bình Chánh",
      "Hóc Môn",
      "Nhà Bè",
      "Củ Chi",
      "Cần Giờ",
    ],
  },
  "Hà Nội": {
    label: "Hà Nội",
    districts: [
      "Cầu Giấy",
      "Đống Đa",
      "Ba Đình",
      "Hai Bà Trưng",
      "Thanh Xuân",
      "Hoàn Kiếm",
      "Tây Hồ",
      "Hoàng Mai",
      "Long Biên",
      "Nam Từ Liêm",
      "Bắc Từ Liêm",
      "Hà Đông",
      "Gia Lâm",
      "Đông Anh",
      "Thanh Trì",
      "Hoài Đức",
      "Sóc Sơn",
      "Thạch Thất",
      "Chương Mỹ",
      "Sơn Tây",
      "Mê Linh",
      "Đan Phượng",
    ],
  },
  "Đà Nẵng": {
    label: "Đà Nẵng",
    districts: [
      "Hải Châu",
      "Thanh Khê",
      "Sơn Trà",
      "Ngũ Hành Sơn",
      "Liên Chiểu",
      "Cẩm Lệ",
      "Hòa Vang",
      "Hoàng Sa",
    ],
  },
  "Bình Dương": {
    label: "Bình Dương",
    districts: [
      "TP. Thủ Dầu Một",
      "TP. Thuận An",
      "TP. Dĩ An",
      "TP. Tân Uyên",
      "TP. Bến Cát",
      "Bàu Bàng",
      "Bắc Tân Uyên",
      "Dầu Tiếng",
      "Phú Giáo",
    ],
  },
  "Cần Thơ": {
    label: "Cần Thơ",
    districts: [
      "Ninh Kiều",
      "Bình Thủy",
      "Cái Răng",
      "Ô Môn",
      "Thốt Nốt",
      "Phong Điền",
      "Cờ Đỏ",
      "Thới Lai",
      "Vĩnh Thạnh",
    ],
  },
  "Hải Phòng": {
    label: "Hải Phòng",
    districts: [
      "Hồng Bàng",
      "Ngô Quyền",
      "Lê Chân",
      "Hải An",
      "Kiến An",
      "Đồ Sơn",
      "Dương Kinh",
      "Thủy Nguyên",
      "An Dương",
      "An Lão",
      "Kiến Thụy",
      "Tiên Lãng",
      "Vĩnh Bảo",
      "Cát Hải",
    ],
  },
  "Đồng Nai": {
    label: "Đồng Nai",
    districts: [
      "TP. Biên Hòa",
      "TP. Long Khánh",
      "Long Thành",
      "Nhơn Trạch",
      "Trảng Bom",
      "Vĩnh Cửu",
      "Thống Nhất",
      "Cẩm Mỹ",
      "Xuân Lộc",
      "Định Quán",
      "Tân Phú",
    ],
  },
  "Bà Rịa - Vũng Tàu": {
    label: "Bà Rịa - Vũng Tàu",
    districts: [
      "TP. Vũng Tàu",
      "TP. Bà Rịa",
      "TX. Phú Mỹ",
      "Châu Đức",
      "Xuyên Mộc",
      "Đất Đỏ",
      "Long Điền",
      "Côn Đảo",
    ],
  },
  "Khánh Hòa": {
    label: "Khánh Hòa",
    districts: [
      "TP. Nha Trang",
      "TP. Cam Ranh",
      "TX. Ninh Hòa",
      "Diên Khánh",
      "Vạn Ninh",
      "Cam Lâm",
      "Khánh Vĩnh",
      "Khánh Sơn",
    ],
  },
  "Lâm Đồng": {
    label: "Lâm Đồng",
    districts: [
      "TP. Đà Lạt",
      "TP. Bảo Lộc",
      "Đức Trọng",
      "Di Linh",
      "Đơn Dương",
      "Lạc Dương",
      "Lâm Hà",
      "Bảo Lâm",
      "Đam Rông",
    ],
  },
  "Thừa Thiên Huế": {
    label: "Thừa Thiên Huế",
    districts: [
      "TP. Huế",
      "TX. Hương Thủy",
      "TX. Hương Trà",
      "Phú Vang",
      "Phú Lộc",
      "Phong Điền",
      "Quảng Điền",
      "A Lưới",
      "Nam Đông",
    ],
  },
  "Quảng Nam": {
    label: "Quảng Nam",
    districts: [
      "TP. Tam Kỳ",
      "TP. Hội An",
      "TX. Điện Bàn",
      "Núi Thành",
      "Duy Xuyên",
      "Thăng Bình",
      "Đại Lộc",
      "Quế Sơn",
    ],
  },
  "Bắc Ninh": {
    label: "Bắc Ninh",
    districts: [
      "TP. Bắc Ninh",
      "TP. Từ Sơn",
      "Yên Phong",
      "Tiên Du",
      "Quế Võ",
      "Thuận Thành",
      "Gia Bình",
      "Lương Tài",
    ],
  },
  "Quảng Ninh": {
    label: "Quảng Ninh",
    districts: [
      "TP. Hạ Long",
      "TP. Cẩm Phả",
      "TP. Uông Bí",
      "TP. Móng Cái",
      "TX. Quảng Yên",
      "TX. Đông Triều",
      "Vân Đồn",
    ],
  },
  "Nghệ An": {
    label: "Nghệ An",
    districts: [
      "TP. Vinh",
      "TX. Cửa Lò",
      "TX. Thái Hòa",
      "Diễn Châu",
      "Nghi Lộc",
      "Quỳnh Lưu",
      "Hưng Nguyên",
      "Nam Đàn",
      "Đô Lương",
    ],
  },
  "Thanh Hóa": {
    label: "Thanh Hóa",
    districts: [
      "TP. Thanh Hóa",
      "TP. Sầm Sơn",
      "TX. Bỉm Sơn",
      "TX. Nghi Sơn",
      "Hoằng Hóa",
      "Quảng Xương",
      "Đông Sơn",
      "Triệu Sơn",
    ],
  },
  "An Giang": {
    label: "An Giang",
    districts: ["TP. Long Xuyên", "TP. Châu Đốc", "TX. Tân Châu", "Châu Phú", "Chợ Mới", "Phú Tân"],
  },
  "Kiên Giang": {
    label: "Kiên Giang",
    districts: ["TP. Rạch Giá", "TP. Phú Quốc", "TP. Hà Tiên", "Châu Thành", "Kiên Lương", "Hòn Đất"],
  },
  "Tiền Giang": {
    label: "Tiền Giang",
    districts: ["TP. Mỹ Tho", "TX. Gò Công", "TX. Cai Lậy", "Châu Thành", "Chợ Gạo", "Cái Bè"],
  },
  "Bình Định": {
    label: "Bình Định",
    districts: ["TP. Quy Nhơn", "TX. An Nhơn", "TX. Hoài Nhơn", "Tuy Phước", "Phù Cát", "Phù Mỹ"],
  },
  "Đắk Lắk": {
    label: "Đắk Lắk",
    districts: ["TP. Buôn Ma Thuột", "TX. Buôn Hồ", "Cư M'gar", "Krông Pắc", "Ea Kar", "Krông Năng"],
  },
  "Gia Lai": {
    label: "Gia Lai",
    districts: ["TP. Pleiku", "TX. An Khê", "TX. Ayun Pa", "Chư Sê", "Đak Đoa", "Ia Grai"],
  },
  "Vĩnh Long": {
    label: "Vĩnh Long",
    districts: ["TP. Vĩnh Long", "TX. Bình Minh", "Long Hồ", "Mang Thít", "Tam Bình", "Trà Ôn"],
  },
  "Tây Ninh": {
    label: "Tây Ninh",
    districts: ["TP. Tây Ninh", "TX. Trảng Bàng", "TX. Hòa Thành", "Gò Dầu", "Bến Cầu", "Dương Minh Châu"],
  },
  "Bình Phước": {
    label: "Bình Phước",
    districts: ["TP. Đồng Xoài", "TX. Phước Long", "TX. Bình Long", "TX. Chơn Thành", "Đồng Phú", "Hớn Quản"],
  },
  "Long An": {
    label: "Long An",
    districts: ["TP. Tân An", "TX. Kiến Tường", "Bến Lức", "Đức Hòa", "Cần Giuộc", "Cần Đước", "Châu Thành"],
  },
};

// Danh sách tất cả các Tỉnh/Thành phố
export const ALL_PROVINCES: string[] = Object.keys(VIETNAM_LOCATIONS);

// Lấy danh sách quận/huyện dựa theo Tỉnh/Thành phố
export function getDistrictsByProvince(provinceName?: string): string[] {
  if (!provinceName || provinceName === "Tất cả tỉnh/thành" || !VIETNAM_LOCATIONS[provinceName]) {
    // Nếu chưa chọn tỉnh thành cụ thể, trả về các quận huyện trọng điểm phổ biến
    return [
      "Quận 1",
      "Quận 3",
      "Quận 7",
      "Bình Thạnh",
      "TP. Thủ Đức",
      "Gò Vấp",
      "Tân Bình",
      "Cầu Giấy",
      "Đống Đa",
      "Ba Đình",
      "Thanh Xuân",
      "Hai Bà Trưng",
      "Hải Châu",
      "Sơn Trà",
      "Thanh Khê",
      "TP. Thủ Dầu Một",
      "Ninh Kiều",
    ];
  }
  return VIETNAM_LOCATIONS[provinceName].districts;
}

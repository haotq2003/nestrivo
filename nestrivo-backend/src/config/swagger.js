export const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "Nestrivo (RentFlow) API Documentation",
    version: "1.0.0",
    description:
      "Tài liệu API nền tảng marketplace cho thuê bất động sản Nestrivo. Hỗ trợ đầy đủ các role: Khách (Guest), Người thuê (Renter), Chủ nhà (Landlord) và Quản trị viên (Admin).",
  },
  servers: [
    {
      url: "http://localhost:5000",
      description: "Development Server",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Nhập token JWT nhận được sau khi đăng nhập (không cần gõ chữ 'Bearer ')",
      },
    },
  },
  tags: [
    {
      name: "1. Authentication & Profile",
      description: "Đăng ký, Đăng nhập, Xem thông tin và Cập nhật hồ sơ (gộp Renter & Landlord)",
    },
    {
      name: "2. Master Data (Amenities)",
      description: "Danh mục tiện ích phòng trọ dùng chung toàn hệ thống",
    },
    {
      name: "3. Public Listings & Search",
      description: "Tìm kiếm, lọc đa tiêu chí và xem chi tiết phòng trọ (công khai cho Khách & Người thuê)",
    },
    {
      name: "4. Landlord Listings",
      description: "Quản lý tin cho thuê dành riêng cho Chủ nhà (Role: LANDLORD)",
    },
    {
      name: "5. Admin Listings Moderation",
      description: "Kiểm duyệt và quản trị tin đăng dành riêng cho Admin (Role: ADMIN)",
    },
    {
      name: "6. Admin User Management",
      description: "Quản lý tài khoản người dùng, phân quyền, khóa tài khoản và duyệt eKYC (Role: ADMIN)",
    },
  ],
  paths: {
    // ==========================================
    // 1. AUTH & PROFILE
    // ==========================================
    "/api/auth/register": {
      post: {
        tags: ["1. Authentication & Profile"],
        summary: "Đăng ký tài khoản (hỗ trợ chọn làm Chủ nhà hoặc Người thuê)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password", "fullName"],
                properties: {
                  email: { type: "string", example: "chutro1@gmail.com" },
                  password: { type: "string", example: "Password123@" },
                  fullName: { type: "string", example: "Nguyễn Văn Tuấn" },
                  phoneNumber: { type: "string", example: "0987654321" },
                  isLandlord: { type: "boolean", example: true },
                  landlordDisplayName: {
                    type: "string",
                    example: "Hệ thống Căn hộ Xanh Tuấn Phát",
                  },
                  landlordDescription: {
                    type: "string",
                    example: "Chuyên phòng trọ studio và chung cư mini cao cấp tại Cầu Giấy",
                  },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Đăng ký thành công" },
          400: { description: "Dữ liệu không hợp lệ" },
          409: { description: "Email đã tồn tại" },
        },
      },
    },
    "/api/auth/login": {
      post: {
        tags: ["1. Authentication & Profile"],
        summary: "Đăng nhập tài khoản",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", example: "chutro1@gmail.com" },
                  password: { type: "string", example: "Password123@" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Đăng nhập thành công, trả về user và token" },
          401: { description: "Sai email hoặc mật khẩu" },
        },
      },
    },
    "/api/auth/me": {
      get: {
        tags: ["1. Authentication & Profile"],
        summary: "Lấy thông tin cá nhân & hồ sơ chủ nhà của tài khoản hiện tại",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Thông tin tài khoản hiện tại" },
          401: { description: "Chưa xác thực hoặc token không hợp lệ" },
        },
      },
    },
    "/api/auth/profile": {
      put: {
        tags: ["1. Authentication & Profile"],
        summary: "Cập nhật hồ sơ cá nhân / Nâng cấp tài khoản thành Chủ nhà",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  fullName: { type: "string", example: "Nguyễn Văn Tuấn (Cập nhật)" },
                  phoneNumber: { type: "string", example: "0999888777" },
                  avatarUrl: { type: "string", example: "https://example.com/avatar.jpg" },
                  isLandlord: { type: "boolean", example: true },
                  landlordDisplayName: {
                    type: "string",
                    example: "Trọ Xanh Tuấn Phát - Cơ sở 2",
                  },
                  landlordDescription: {
                    type: "string",
                    example: "Phòng đẹp giá rẻ, bảo vệ 24/24, giờ giấc tự do.",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Cập nhật hồ sơ thành công" },
        },
      },
    },

    // ==========================================
    // 2. MASTER DATA (AMENITIES)
    // ==========================================
    "/api/amenities": {
      get: {
        tags: ["2. Master Data (Amenities)"],
        summary: "Lấy danh sách tất cả tiện ích hệ thống (công khai)",
        responses: {
          200: { description: "Danh sách tiện ích (WiFi, Điều hòa, Nóng lạnh, Máy giặt...)" },
        },
      },
    },

    // ==========================================
    // 3. PUBLIC LISTINGS & SEARCH
    // ==========================================
    "/api/listings": {
      get: {
        tags: ["3. Public Listings & Search"],
        summary: "Tìm kiếm & lọc danh sách bất động sản công khai (Khách & Người thuê)",
        description: "Chỉ hiển thị các tin đã được kiểm duyệt (PUBLISHED) và còn phòng trống (AVAILABLE).",
        parameters: [
          {
            name: "page",
            in: "query",
            schema: { type: "integer", default: 1 },
            description: "Trang hiện tại",
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", default: 12 },
            description: "Số tin mỗi trang",
          },
          {
            name: "search",
            in: "query",
            schema: { type: "string" },
            description: "Từ khóa tìm kiếm (theo tiêu đề, mô tả, địa chỉ, đường, phường, quận)",
          },
          {
            name: "city",
            in: "query",
            schema: { type: "string" },
            description: "Lọc theo Tỉnh/Thành phố (ví dụ: Hà Nội, Hồ Chí Minh)",
          },
          {
            name: "district",
            in: "query",
            schema: { type: "string" },
            description: "Lọc theo Quận/Huyện (ví dụ: Cầu Giấy, Quận 1)",
          },
          {
            name: "ward",
            in: "query",
            schema: { type: "string" },
            description: "Lọc theo Phường/Xã (ví dụ: Dịch Vọng Hậu)",
          },
          {
            name: "propertyType",
            in: "query",
            schema: {
              type: "string",
              enum: ["ROOM_SHARE", "STUDIO", "SERVICE_APARTMENT", "WHOLE_HOUSE"],
            },
            description: "Lọc theo loại hình BĐS",
          },
          {
            name: "minPrice",
            in: "query",
            schema: { type: "number" },
            description: "Giá thuê tối thiểu (VNĐ)",
          },
          {
            name: "maxPrice",
            in: "query",
            schema: { type: "number" },
            description: "Giá thuê tối đa (VNĐ)",
          },
          {
            name: "minArea",
            in: "query",
            schema: { type: "number" },
            description: "Diện tích tối thiểu (m2)",
          },
          {
            name: "maxArea",
            in: "query",
            schema: { type: "number" },
            description: "Diện tích tối đa (m2)",
          },
          {
            name: "bedrooms",
            in: "query",
            schema: { type: "integer" },
            description: "Số phòng ngủ tối thiểu",
          },
          {
            name: "bathrooms",
            in: "query",
            schema: { type: "integer" },
            description: "Số phòng tắm tối thiểu",
          },
          {
            name: "allowsPets",
            in: "query",
            schema: { type: "boolean" },
            description: "Cho phép nuôi thú cưng (true/false)",
          },
          {
            name: "hasMezzanine",
            in: "query",
            schema: { type: "boolean" },
            description: "Có gác lửng (true/false)",
          },
          {
            name: "isFurnished",
            in: "query",
            schema: { type: "boolean" },
            description: "Đầy đủ nội thất (true/false)",
          },
          {
            name: "amenityIds",
            in: "query",
            schema: { type: "string" },
            description: "Lọc theo tiện ích (danh sách ID cách nhau bằng dấu phẩy)",
          },
          {
            name: "sortBy",
            in: "query",
            schema: {
              type: "string",
              enum: ["newest", "price_asc", "price_desc", "area_desc", "area_asc", "oldest"],
              default: "newest",
            },
            description: "Thứ tự sắp xếp",
          },
        ],
        responses: {
          200: { description: "Danh sách phòng trọ kèm thông tin phân trang" },
        },
      },
    },
    "/api/listings/{id}": {
      get: {
        tags: ["3. Public Listings & Search"],
        summary: "Xem chi tiết 1 phòng trọ + 4 phòng gợi ý tương tự",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "ID phòng trọ",
          },
        ],
        responses: {
          200: { description: "Chi tiết phòng trọ, danh sách ảnh, phí dịch vụ, SĐT chủ nhà và các phòng tương tự" },
          404: { description: "Không tìm thấy phòng trọ này" },
        },
      },
    },

    // ==========================================
    // 4. LANDLORD LISTINGS
    // ==========================================
    "/api/landlord/listings": {
      post: {
        tags: ["4. Landlord Listings"],
        summary: "Tạo tin cho thuê mới (Lưu nháp hoặc gửi duyệt luôn)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: [
                  "title",
                  "description",
                  "propertyType",
                  "price",
                  "area",
                  "address",
                  "district",
                  "city",
                ],
                properties: {
                  title: {
                    type: "string",
                    example: "Phòng trọ sinh viên Cầu Giấy khép kín, có gác lửng",
                  },
                  description: {
                    type: "string",
                    example: "Phòng mới sơn sửa, sạch sẽ thoáng mát, giờ giấc tự do, bảo vệ 24/7, bãi xe vân tay.",
                  },
                  propertyType: {
                    type: "string",
                    enum: ["ROOM_SHARE", "STUDIO", "SERVICE_APARTMENT", "WHOLE_HOUSE"],
                    example: "ROOM_SHARE",
                  },
                  price: { type: "number", example: 3800000 },
                  deposit: { type: "number", example: 3800000 },
                  area: { type: "number", example: 25 },
                  bedrooms: { type: "integer", example: 1 },
                  bathrooms: { type: "integer", example: 1 },
                  maxOccupants: { type: "integer", example: 3 },
                  address: { type: "string", example: "Số 15 ngõ 123 Xuân Thủy" },
                  ward: { type: "string", example: "Dịch Vọng Hậu" },
                  district: { type: "string", example: "Cầu Giấy" },
                  city: { type: "string", example: "Hà Nội" },
                  allowsPets: { type: "boolean", example: true },
                  hasMezzanine: { type: "boolean", example: true },
                  isFurnished: { type: "boolean", example: true },
                  submitForReview: {
                    type: "boolean",
                    example: true,
                    description: "true = Gửi duyệt luôn (PENDING_APPROVAL); false = Lưu nháp (DRAFT)",
                  },
                  images: {
                    type: "array",
                    items: { type: "string" },
                    example: [
                      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267",
                      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688",
                    ],
                  },
                  fees: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        type: {
                          type: "string",
                          enum: ["ELECTRICITY", "WATER", "INTERNET", "SERVICE", "PARKING", "OTHER"],
                        },
                        name: { type: "string" },
                        amount: { type: "number" },
                        unit: {
                          type: "string",
                          enum: ["PER_KWH", "PER_M3", "PER_MONTH", "PER_PERSON", "PER_VEHICLE", "FIXED"],
                        },
                      },
                    },
                    example: [
                      { type: "ELECTRICITY", amount: 4000, unit: "PER_KWH" },
                      { type: "WATER", amount: 100000, unit: "PER_PERSON" },
                      { type: "INTERNET", amount: 100000, unit: "PER_MONTH" },
                    ],
                  },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Tạo tin thành công" },
          400: { description: "Thông tin không hợp lệ" },
        },
      },
      get: {
        tags: ["4. Landlord Listings"],
        summary: "Lấy danh sách các tin của chính chủ nhà (hỗ trợ lọc và phân trang)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "page",
            in: "query",
            schema: { type: "integer", default: 1 },
            description: "Số trang",
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", default: 10 },
            description: "Số mục mỗi trang",
          },
          {
            name: "status",
            in: "query",
            schema: {
              type: "string",
              enum: ["DRAFT", "PENDING_APPROVAL", "PUBLISHED", "REJECTED", "HIDDEN", "EXPIRED"],
            },
            description: "Lọc theo trạng thái tin",
          },
          {
            name: "availabilityStatus",
            in: "query",
            schema: {
              type: "string",
              enum: ["AVAILABLE", "RENTED", "UNAVAILABLE"],
            },
            description: "Lọc theo tình trạng phòng",
          },
          {
            name: "search",
            in: "query",
            schema: { type: "string" },
            description: "Tìm kiếm theo tiêu đề hoặc địa chỉ",
          },
        ],
        responses: {
          200: { description: "Danh sách tin của chủ nhà" },
        },
      },
    },
    "/api/landlord/listings/{id}": {
      get: {
        tags: ["4. Landlord Listings"],
        summary: "Xem chi tiết 1 tin của chính mình",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "ID tin đăng",
          },
        ],
        responses: {
          200: { description: "Chi tiết tin đăng" },
          404: { description: "Không tìm thấy tin" },
        },
      },
      put: {
        tags: ["4. Landlord Listings"],
        summary: "Chỉnh sửa nội dung tin đăng",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "ID tin đăng cần sửa",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  title: { type: "string", example: "Phòng trọ Cầu Giấy (Cập nhật giá mới)" },
                  price: { type: "number", example: 3600000 },
                  submitForReview: {
                    type: "boolean",
                    example: true,
                    description: "true nếu muốn gửi duyệt lại sau khi chỉnh sửa",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Cập nhật thành công" },
        },
      },
      delete: {
        tags: ["4. Landlord Listings"],
        summary: "Xóa tin đăng (Chỉ được xóa khi là Bản nháp DRAFT hoặc Bị từ chối REJECTED)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "ID tin đăng",
          },
        ],
        responses: {
          200: { description: "Xóa thành công" },
          400: { description: "Không được phép xóa tin đang hiển thị" },
        },
      },
    },
    "/api/landlord/listings/{id}/submit": {
      patch: {
        tags: ["4. Landlord Listings"],
        summary: "Gửi duyệt tin đăng (dành cho tin DRAFT hoặc REJECTED)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "ID tin đăng",
          },
        ],
        responses: {
          200: { description: "Đã gửi tin đăng lên hệ thống để Admin kiểm duyệt" },
        },
      },
    },
    "/api/landlord/listings/{id}/availability": {
      patch: {
        tags: ["4. Landlord Listings"],
        summary: "Bật/tắt tình trạng phòng (Còn trống AVAILABLE ⇄ Đã cho thuê RENTED)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "ID tin đăng",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["availabilityStatus"],
                properties: {
                  availabilityStatus: {
                    type: "string",
                    enum: ["AVAILABLE", "RENTED", "UNAVAILABLE"],
                    example: "RENTED",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Cập nhật tình trạng phòng thành công" },
        },
      },
    },
    "/api/landlord/listings/{id}/visibility": {
      patch: {
        tags: ["4. Landlord Listings"],
        summary: "Tạm ẩn hoặc Bật hiển thị lại tin đã duyệt (HIDDEN ⇄ PUBLISHED)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "ID tin đăng",
          },
        ],
        responses: {
          200: { description: "Đổi trạng thái hiển thị thành công" },
        },
      },
    },

    // ==========================================
    // 5. ADMIN LISTINGS MODERATION
    // ==========================================
    "/api/admin/listings/pending": {
      get: {
        tags: ["5. Admin Listings Moderation"],
        summary: "Lấy danh sách tin đang chờ duyệt trên toàn hệ thống (sắp xếp tin cũ duyệt trước)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "page",
            in: "query",
            schema: { type: "integer", default: 1 },
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", default: 10 },
          },
          {
            name: "city",
            in: "query",
            schema: { type: "string" },
            description: "Lọc theo thành phố",
          },
          {
            name: "propertyType",
            in: "query",
            schema: {
              type: "string",
              enum: ["ROOM_SHARE", "STUDIO", "SERVICE_APARTMENT", "WHOLE_HOUSE"],
            },
          },
          {
            name: "search",
            in: "query",
            schema: { type: "string" },
            description: "Tìm kiếm theo tiêu đề, địa chỉ hoặc tên/email chủ nhà",
          },
        ],
        responses: {
          200: { description: "Danh sách tin chờ duyệt" },
        },
      },
    },
    "/api/admin/listings": {
      get: {
        tags: ["5. Admin Listings Moderation"],
        summary: "Lấy toàn bộ tin trên sàn (quản lý tổng quát)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "page",
            in: "query",
            schema: { type: "integer", default: 1 },
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", default: 10 },
          },
          {
            name: "status",
            in: "query",
            schema: {
              type: "string",
              enum: ["DRAFT", "PENDING_APPROVAL", "PUBLISHED", "REJECTED", "HIDDEN", "EXPIRED"],
            },
          },
          {
            name: "city",
            in: "query",
            schema: { type: "string" },
          },
          {
            name: "search",
            in: "query",
            schema: { type: "string" },
          },
        ],
        responses: {
          200: { description: "Danh sách toàn bộ tin" },
        },
      },
    },
    "/api/admin/listings/{id}": {
      get: {
        tags: ["5. Admin Listings Moderation"],
        summary: "Xem chi tiết 1 tin bất kỳ để Admin kiểm tra",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "ID tin đăng",
          },
        ],
        responses: {
          200: { description: "Chi tiết tin đăng kèm thông tin chủ nhà" },
        },
      },
    },
    "/api/admin/listings/{id}/approve": {
      patch: {
        tags: ["5. Admin Listings Moderation"],
        summary: "Phê duyệt tin đăng (Chuyển thành PUBLISHED, lưu AuditLog)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "ID tin đăng",
          },
        ],
        responses: {
          200: { description: "Phê duyệt tin đăng thành công" },
        },
      },
    },
    "/api/admin/listings/{id}/reject": {
      patch: {
        tags: ["5. Admin Listings Moderation"],
        summary: "Từ chối tin đăng kèm lý do (Chuyển thành REJECTED, lưu AuditLog)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "ID tin đăng",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["rejectionReason"],
                properties: {
                  rejectionReason: {
                    type: "string",
                    example: "Ảnh bị mờ và giá thuê chưa rõ tiền cọc, vui lòng bổ sung.",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Đã từ chối tin đăng" },
        },
      },
    },
    "/api/admin/listings/{id}/hide": {
      patch: {
        tags: ["5. Admin Listings Moderation"],
        summary: "Cưỡng chế ẩn tin vi phạm khỏi sàn (hoặc khôi phục lại)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "ID tin đăng",
          },
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  reason: {
                    type: "string",
                    example: "Nhiều người dùng báo cáo có dấu hiệu gian lận cọc.",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Đã đổi trạng thái ẩn/hiện tin" },
        },
      },
    },

    // ==========================================
    // 6. ADMIN USER MANAGEMENT
    // ==========================================
    "/api/admin/users": {
      get: {
        tags: ["6. Admin User Management"],
        summary: "Lấy danh sách tài khoản người dùng kèm phân trang, lọc và thống kê KPI",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 10 } },
          { name: "search", in: "query", schema: { type: "string" }, description: "Tìm theo tên, email, SĐT" },
          { name: "role", in: "query", schema: { type: "string", enum: ["ALL", "LANDLORD", "RENTER", "ADMIN"] } },
          { name: "status", in: "query", schema: { type: "string", enum: ["ALL", "ACTIVE", "LOCKED"] } },
          { name: "verificationStatus", in: "query", schema: { type: "string", enum: ["ALL", "VERIFIED", "PENDING", "NOT_VERIFIED", "REJECTED"] } },
        ],
        responses: {
          200: { description: "Danh sách tài khoản và số liệu KPI" },
        },
      },
      post: {
        tags: ["6. Admin User Management"],
        summary: "Tạo mới tài khoản người dùng trực tiếp từ Admin",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["fullName", "email", "password"],
                properties: {
                  fullName: { type: "string", example: "Nguyễn Văn Nam" },
                  email: { type: "string", example: "nam.nguyen@example.com" },
                  password: { type: "string", example: "Password@123" },
                  phoneNumber: { type: "string", example: "0912345678" },
                  roles: { type: "array", items: { type: "string", enum: ["RENTER", "LANDLORD", "ADMIN"] } },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Tài khoản đã được tạo thành công" },
        },
      },
    },
    "/api/admin/users/{id}": {
      get: {
        tags: ["6. Admin User Management"],
        summary: "Chi tiết tài khoản, tin đăng và hồ sơ eKYC",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" }, description: "ID người dùng" },
        ],
        responses: {
          200: { description: "Chi tiết tài khoản" },
        },
      },
      put: {
        tags: ["6. Admin User Management"],
        summary: "Cập nhật thông tin cơ bản người dùng",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" }, description: "ID người dùng" },
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  fullName: { type: "string" },
                  email: { type: "string" },
                  phoneNumber: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Đã cập nhật thông tin" },
        },
      },
    },
    "/api/admin/users/{id}/lock": {
      patch: {
        tags: ["6. Admin User Management"],
        summary: "Khóa hoặc Mở khóa tài khoản người dùng",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" }, description: "ID người dùng" },
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  lockReason: { type: "string", example: "Đăng giá sai lệch, thu tiền cọc bất chính" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Đã cập nhật trạng thái khóa" },
        },
      },
    },
    "/api/admin/users/{id}/roles": {
      patch: {
        tags: ["6. Admin User Management"],
        summary: "Cập nhật phân quyền vai trò (Roles) cho tài khoản",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" }, description: "ID người dùng" },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["roles"],
                properties: {
                  roles: { type: "array", items: { type: "string", enum: ["RENTER", "LANDLORD", "ADMIN"] } },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Đã cập nhật vai trò" },
        },
      },
    },
    "/api/admin/users/{id}/kyc": {
      patch: {
        tags: ["6. Admin User Management"],
        summary: "Duyệt hoặc Thu hồi trạng thái xác thực eKYC",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" }, description: "ID người dùng" },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["verificationStatus"],
                properties: {
                  verificationStatus: { type: "string", enum: ["VERIFIED", "PENDING", "NOT_SUBMITTED", "REJECTED"] },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Đã cập nhật trạng thái eKYC" },
        },
      },
    },
  },
};

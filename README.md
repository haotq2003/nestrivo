# Nestrivo — Nền tảng Tìm kiếm & Quản lý Phòng trọ Minh bạch

**Nestrivo** là nền tảng PropTech toàn diện kết nối **Khách thuê (Renter)**, **Chủ nhà (Landlord)** và **Quản trị viên (Admin)** với trải nghiệm tìm phòng minh bạch chi phí, kiểm duyệt tin đăng chặt chẽ, xác minh danh tính chủ nhà (eKYC), so sánh phòng trực quan và cẩm nang thuê trọ.

---

## Kiến trúc hệ thống

```text
┌─────────────────────────────────────────────┐
│             FRONTEND (Port 3000)            │
│  Next.js 16 (App Router) · React 19 · TS    │
│  Tailwind CSS v4 · TanStack Query v5 · Axios│
└──────────────────────┬──────────────────────┘
                       │ REST API (JWT Bearer)
                       ▼
┌─────────────────────────────────────────────┐
│             BACKEND (Port 5000)             │
│  Node.js (ESM) · Express 5 · Swagger UI     │
│  Auth (JWT + bcrypt) · RBAC · Cache Layer   │
└──────────┬───────────────────────┬──────────┘
           │                       │
           ▼                       ▼
┌─────────────────────┐  ┌────────────────────┐
│  PostgreSQL +       │  │  Redis 7 (Docker)  │
│  Prisma ORM v7      │  │  ioredis Cache     │
│  (Primary Database) │  │  (X-Cache HIT/MISS)│
└─────────────────────┘  └────────────────────┘
```

---

## Tech Stack

### Frontend (`nestrivo-frontend`)
- **Framework:** Next.js 16 (App Router), React 19, TypeScript 5
- **Data Fetching & Caching:** TanStack Query v5 (`@tanstack/react-query`) + Axios (Interceptors tự gắn JWT & xử lý 401 tập trung)
- **UI & Styling:** Tailwind CSS v4, Lucide React, `clsx`, `tailwind-merge`
- **Media Storage:** Cloudinary SDK (upload ảnh phòng & hồ sơ eKYC)
- **Package Manager:** pnpm 10

### Backend (`nestrivo-backend`)
- **Runtime & Framework:** Node.js (ES Modules), Express 5
- **Database & ORM:** PostgreSQL, Prisma ORM v7 (`@prisma/adapter-pg`)
- **Caching:** Redis 7 (`ioredis`) với cơ chế **Graceful Fallback** & tự động xóa cache theo prefix bằng `SCAN`
- **Security & Docs:** JWT (`jsonwebtoken`), `bcryptjs`, CORS, Swagger UI Express (`/api-docs`)
- **Testing & CI:** Vitest + Supertest (27 test cases cho Auth, CRUD, RBAC, Redis Cache) + GitHub Actions CI

---

## Tính năng nổi bật

- **Khách thuê (Public / Renter):**
  - Tìm kiếm & lọc phòng đa tiêu chí (Tỉnh/thành, quận/huyện, loại phòng, mức giá, sắp xếp).
  - **So sánh phòng trọ** song song tối đa 4 phòng (diện tích, giá thuê, ma trận tiện nghi, chi phí điện/nước/net, chủ nhà).
  - Lưu tin yêu thích, đặt lịch xem phòng, đánh giá sau xem phòng, báo cáo tin vi phạm.
  - Xem bản đồ vị trí phòng và đọc **Blog & Cẩm nang thuê trọ**.
- **Chủ nhà (Landlord Workspace):**
  - **Wizard đăng tin 6 bước** chuẩn PropTech (auto-save bản nháp theo tài khoản trên trình duyệt).
  - Quản lý trạng thái phòng (`DRAFT`, `PENDING_APPROVAL`, `PUBLISHED`, `HIDDEN`, `RENTED`).
  - Xác minh danh tính chủ nhà (eKYC), quản lý yêu cầu xem phòng và đẩy tin nổi bật.
- **Quản trị viên (Admin Dashboard):**
  - Kiểm duyệt tin đăng, xử lý báo cáo vi phạm, xét duyệt eKYC chủ nhà.
  - Quản lý người dùng & CRUD bài viết Blog.

---

## Cấu trúc thư mục

```text
Nestrivo/
├── .github/workflows/ci.yml   # GitHub Actions CI (Backend tests + Frontend tsc)
├── nestrivo-backend/
│   ├── docker-compose.yml     # Redis 7 container
│   ├── prisma/                # Schema & seed scripts
│   ├── src/
│   │   ├── app.js             # Express app (tách riêng để test)
│   │   ├── server.js          # Entry point & background jobs
│   │   ├── controller/        # Business logic
│   │   ├── routes/            # REST API routes + cache middleware
│   │   ├── middleware/        # Auth JWT, RBAC, Redis Cache
│   │   └── lib/               # Prisma & Redis clients
│   └── tests/                 # Vitest + Supertest suites
└── nestrivo-frontend/
    └── src/
        ├── app/               # Route groups: (public), landlord, admin
        ├── components/        # Modular UI: layout, listings, search, compare, landlord, admin
        ├── hooks/queries/     # TanStack Query custom hooks
        ├── context/           # Auth, Favorites, Compare contexts
        ├── lib/               # Axios client, utils, image helpers
        └── service/           # API services
```

---

## Hướng dẫn cài đặt & chạy dự án

### Yêu cầu môi trường
- Node.js `>= 20`
- `pnpm` (`>= 10`) và `npm`
- PostgreSQL
- Docker Desktop (khuyên dùng để bật Redis; nếu không bật, backend vẫn tự fallback về PostgreSQL)

### 1. Chạy Backend (`nestrivo-backend`)

```bash
cd nestrivo-backend

# 1. Cài dependencies
npm install

# 2. Tạo file .env từ mẫu và điền DATABASE_URL, JWT_SECRET...
cp .env.example .env

# 3. Bật Redis bằng Docker (tùy chọn nhưng khuyên dùng)
docker compose up -d

# 4. Sinh Prisma Client và đồng bộ database
npx prisma generate
npx prisma db push

# 5. (Tùy chọn) Seed dữ liệu mẫu
npm run seed

# 6. Khởi động Backend (http://localhost:5000)
npm run dev
```

- **Health check:** `http://localhost:5000/api/health`
- **Swagger API Docs:** `http://localhost:5000/api-docs`

### 2. Chạy Frontend (`nestrivo-frontend`)

```bash
cd nestrivo-frontend

# 1. Cài dependencies
pnpm install

# 2. Tạo file .env.local từ mẫu
cp .env.example .env.local

# 3. Khởi động Frontend (http://localhost:3000)
pnpm dev
```

---

## Chạy Kiểm thử (Testing & Type Check)

```bash
# Chạy toàn bộ test suite Backend (Vitest + Supertest)
cd nestrivo-backend
npm test

# Kiểm tra TypeScript toàn bộ Frontend
cd nestrivo-frontend
npx tsc --noEmit
```

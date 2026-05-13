# PROJECT PLAN — ShoppeDemo (Web Bán Hàng Đa Người Bán)

> Tài liệu này lên ý tưởng tổng thể cho dự án website thương mại điện tử (theo mô hình Shopee/Lazada) dựa trên source `ThanhluanGif/ShoppeDemo`. Mục tiêu: xác định **các nghiệp vụ cần có cho 1 chương trình của công ty**, **quan điểm thiết kế** cho mỗi nghiệp vụ, **hướng phát triển tối ưu**, và **plan bàn giao rõ ràng**.

---

## 0. Tóm tắt nhanh (TL;DR)

- **Loại sản phẩm:** Website Marketplace đa người bán (Customer / Vendor / Admin) — fullstack MERN.
- **Stack hiện tại:** React (Vite) + Tailwind ở client; Node/Express + MongoDB (Mongoose) + Socket.io ở server; JWT + Passport (Google/Facebook); Cloudinary (ảnh); VNPAY (thanh toán).
- **Hiện trạng:** Đã có ~7 model, 9 controller, 9 nhóm route, 18 trang React. Đủ khung MVP nhưng còn thiếu test, CI/CD, monitoring, tài liệu API, observability, và một số nghiệp vụ thương mại quan trọng (review, voucher nâng cao, shipping integration, refund/return, RBAC chi tiết).
- **Định hướng bàn giao:** 6 phase trong **~12 tuần**, mỗi phase có **Definition of Done (DoD)** rõ ràng, kết thúc bằng **UAT + handover package**.

---

## 1. Bối cảnh & Mục tiêu dự án

### 1.1 Bối cảnh
Source `ShoppeDemo` là một bản dựng học tập theo mô hình Shopee: cho phép khách hàng (customer) mua hàng từ nhiều người bán (vendor), admin quản trị toàn hệ thống. Codebase đã có sẵn các module cốt lõi (user, product, order, category, coupon, message, payment) nhưng cần được **chuẩn hóa thành sản phẩm bàn giao được cho công ty** — tức là phải đạt mức **production-ready**, không còn là demo.

### 1.2 Mục tiêu
- **M1 — Sản phẩm hoàn chỉnh:** Đầy đủ nghiệp vụ thương mại điện tử cốt lõi của 1 marketplace (mua/bán/thanh toán/giao hàng/đánh giá/CSKH).
- **M2 — Chất lượng kỹ thuật:** Có test (unit + integration), CI/CD, logging, monitoring, tài liệu API (OpenAPI), tuân thủ chuẩn bảo mật cơ bản (OWASP Top 10).
- **M3 — Vận hành được:** Có quy trình deploy, backup DB, rollback, on-call runbook.
- **M4 — Mở rộng được:** Kiến trúc cho phép tách service (chat, payment, search) khi traffic tăng — không phải viết lại từ đầu.

### 1.3 Người liên quan (Stakeholders)
| Vai trò | Quan tâm chính |
|---|---|
| Product Owner / Khách hàng nội bộ | Time-to-market, tính năng đúng nhu cầu, ROI |
| Khách hàng cuối (Customer) | Mua hàng nhanh, trải nghiệm mượt, thanh toán an toàn |
| Người bán (Vendor) | Đăng sản phẩm dễ, quản lý đơn, nhận tiền đúng hạn |
| Admin / Vận hành | Kiểm soát hệ thống, xử lý tranh chấp, báo cáo |
| Dev team | Code rõ ràng, dễ test, dễ deploy |

---

## 2. Hiện trạng codebase (As-Is)

### 2.1 Backend (`/server`)
- **Models:** `User`, `Product`, `Order`, `Category`, `Coupon`, `Message`.
- **Controllers:** user, product, category, order, coupon, message, payment, config.
- **Routes:** `/api/users`, `/api/products`, `/api/categories`, `/api/orders`, `/api/upload`, `/api/coupons`, `/api/config`, `/api/payment`, `/api/messages`.
- **Middleware:** auth (JWT), error, upload (Multer + Cloudinary).
- **Realtime:** Socket.io xử lý chat (lưu socket trong RAM — chưa Redis adapter).
- **Auth:** JWT + Passport (Google, Facebook).
- **Thanh toán:** VNPAY (logic trong `paymentController.js`).

### 2.2 Frontend (`/client`)
- React 19 + Vite + Tailwind + React Router 7.
- 18 trang (Home, ProductDetails, Cart, Checkout, Login, Register, MyOrders, Profile, Auth callback, PaymentResult, RegisterVendor, và 8 trang Admin).
- Global state qua `AuthContext` + `CartContext` (Cart lưu LocalStorage).
- API client tập trung ở `services/api.js` (axios).

### 2.3 Gap đã nhận diện
| Hạng mục | Có sẵn? | Ghi chú |
|---|---|---|
| Đăng nhập email/password + social | Có | OK |
| Đăng nhập 2FA / OTP SMS | Không | Cần cho vendor/admin |
| Review & Rating sản phẩm | Không có model `Review` | **Thiếu** |
| Wishlist | Có (trong User model) | OK |
| Coupon | Có (cơ bản) | Cần thêm coupon shop-only, flash-sale |
| Flash Sale / Đếm ngược | Có component `CountdownTimer` | Chưa có model riêng |
| Shipping integration (GHN/GHTK) | Không | **Thiếu** |
| Return / Refund (RMA) | Không | **Thiếu** — bắt buộc cho marketplace thật |
| Notification (email/push/in-app) | Một phần (email reset password) | Cần queue + template |
| Search & Filter nâng cao | Có search text | Nên dùng Elasticsearch/MeiliSearch khi scale |
| Test (unit/integration/e2e) | Không có | **Thiếu** |
| CI/CD | Không có workflow | **Thiếu** |
| Logging / Monitoring | `console.log` | Cần Winston/Pino + Sentry |
| API Documentation | Không | Cần OpenAPI / Swagger |
| Rate limiting / Helmet / CORS chặt | CORS `*` | **Rủi ro bảo mật** |
| Image optimization | Cloudinary OK | OK |
| Multi-language (i18n) | Không | Tùy chiến lược |
| Audit log (admin actions) | Không | Cần cho compliance |

---

## 3. Các nghiệp vụ cần có (Business Modules)

Phần này liệt kê **đầy đủ các nghiệp vụ một website thương mại điện tử của công ty cần có**. Với mỗi nghiệp vụ: nêu **mô tả**, **yêu cầu thiết kế**, và **quan điểm/ưu tiên** cho dự án này.

---

### 3.1 Quản lý Tài khoản & Phân quyền (Identity & Access Management)

**Mô tả:** Đăng ký, đăng nhập, quên mật khẩu, xác minh email/SĐT, social login, phân quyền theo vai trò (Customer / Vendor / Admin / Staff), quản lý phiên (session).

**Thiết kế:**
- **Auth flow:** JWT access token (15 phút) + Refresh token (7 ngày, lưu HttpOnly cookie) — hiện tại đang dùng JWT trong response body, **nên đổi sang HttpOnly cookie** để chống XSS đánh cắp token.
- **Mật khẩu:** bcrypt cost 12, chính sách độ mạnh tối thiểu 8 ký tự, có chữ + số.
- **RBAC:** dùng `role` + `permissions[]` mở rộng (tránh hardcode `if role === 'admin'`). Đặt middleware `requirePermission('product:create')`.
- **2FA:** TOTP (Google Authenticator) bật mặc định cho Admin/Vendor có doanh thu > ngưỡng.
- **Social login:** Google, Facebook (đã có). Bổ sung Apple Sign-in nếu có app iOS.
- **Audit log:** mọi hành động admin (xóa user, đổi role, hoàn tiền) phải ghi log bất biến.

**Quan điểm cho project này:**
- Codebase hiện đã có JWT + Passport, đủ tốt làm nền. **Refactor sang HttpOnly cookie + refresh token rotation** trước khi go-live.
- **CORS hiện đang `*`** — phải siết lại whitelist domain ngay.
- Phân quyền hiện chỉ check `isAdmin` — nên mở rộng schema `User.permissions` để Admin có thể tạo "Staff" với quyền hạn chế (vd: chỉ quản lý đơn hàng, không quản lý user).

---

### 3.2 Quản lý Danh mục & Sản phẩm (Catalog Management)

**Mô tả:** CRUD danh mục (cây nhiều cấp), CRUD sản phẩm, biến thể (size/màu), thuộc tính, tồn kho, ảnh, video, SEO meta.

**Thiết kế:**
- **Category cây:** dùng `parentId` + `path` (materialized path) để truy vấn nhanh `/Thời trang/Nam/Áo thun`.
- **Product schema:**
  - Trường cơ bản: `name`, `slug`, `description` (rich text — dùng TipTap/Quill), `brand`, `categoryId`.
  - **Biến thể (variants):** mảng `{ sku, color, size, price, stock, image }`. Mỗi variant có **SKU duy nhất** — bắt buộc cho khi tích hợp ERP/kho.
  - **Media:** mảng URL ảnh (Cloudinary), max 9 ảnh + 1 video.
  - **SEO:** `metaTitle`, `metaDescription`, `slug` (auto + chỉnh tay).
  - **Trạng thái:** `draft | pending_review | active | hidden | banned`. Sản phẩm vendor đăng phải qua admin duyệt (chống hàng giả).
- **Soft delete:** dùng `deletedAt` thay vì xóa cứng (giữ lịch sử đơn hàng cũ).

**Quan điểm cho project này:**
- Đã có model `Product` với variants. **Bổ sung trạng thái duyệt** (`pending_review`) và workflow approve của Admin.
- Hiện tại slug có thể chưa unique — cần index unique + auto-resolve trùng (`ao-thun-2`).
- Tách rời `Product` (master) và `ProductVariant` (collection riêng) khi số biến thể lớn — hiện embedded vẫn OK cho MVP.

---

### 3.3 Tìm kiếm & Khám phá (Search & Discovery)

**Mô tả:** Tìm kiếm theo từ khóa, lọc theo giá/danh mục/đánh giá/vị trí, sắp xếp, gợi ý từ khóa, sản phẩm liên quan, sản phẩm xem gần đây.

**Thiết kế:**
- **Giai đoạn 1 (MVP):** MongoDB text index trên `name`, `description`, `brand`.
- **Giai đoạn 2 (scale):** MeiliSearch hoặc Elasticsearch — index riêng, sync qua change stream.
- **Filter chuẩn:** giá (range), rating (>= n sao), tồn kho, có khuyến mãi, shop tỉnh/TP.
- **Recommend:** "Sản phẩm liên quan" dựa trên `categoryId`; "Xem gần đây" lưu LocalStorage; "Có thể bạn thích" dùng collaborative filter đơn giản (later).

**Quan điểm cho project này:**
- Bắt đầu bằng MongoDB text index — đơn giản, miễn phí, đủ cho < 100k sản phẩm.
- Thiết kế lớp `SearchService` abstract để sau này swap sang MeiliSearch không phải sửa controller.

---

### 3.4 Giỏ hàng & Đặt hàng (Cart & Checkout)

**Mô tả:** Thêm/xóa/sửa giỏ hàng, áp coupon, tách đơn theo vendor, chọn địa chỉ, chọn vận chuyển, đặt hàng.

**Thiết kế:**
- **Cart lưu kép:** Guest → LocalStorage; User đăng nhập → merge vào DB (collection `Cart`) để xem trên nhiều thiết bị.
- **Tách đơn theo shop:** giữ logic hiện tại (1 checkout → N orders cho N vendor). Quan trọng: **giá và tồn kho phải được "lock" tại thời điểm checkout** (snapshot vào `OrderItem.priceAtPurchase`), tránh user mua xong vendor đổi giá.
- **Idempotency:** API `POST /api/orders` phải nhận `Idempotency-Key` để chống double-submit khi user nhấn 2 lần.
- **Tồn kho:** dùng transaction (MongoDB replica set) khi tạo order — trừ stock và tạo order atomically. Nếu fail thì rollback.

**Quan điểm cho project này:**
- Logic tách đơn đã có — tốt. **Bổ sung idempotency-key** và **MongoDB transaction** cho tạo đơn (hiện đang trừ stock kiểu non-atomic, có race condition khi 2 user mua cùng lúc).
- Coupon hiện áp dụng global — nên thêm `scope: 'platform' | 'shop' | 'product'`.

---

### 3.5 Thanh toán (Payment)

**Mô tả:** Thanh toán COD, VNPAY, MoMo, ZaloPay, thẻ quốc tế (Stripe sau), ví nội bộ (vendor balance).

**Thiết kế:**
- **Cổng thanh toán:** abstract qua interface `PaymentGateway` với các method `createPaymentUrl`, `verifyCallback`, `refund`. Mỗi gateway (VNPAY/MoMo) là 1 adapter.
- **Webhook/IPN:** xử lý bất đồng bộ, **verify chữ ký** bắt buộc, lưu `paymentTransactions` collection để audit.
- **Trạng thái payment:** `pending → paid → refunded | failed`. Tách khỏi trạng thái đơn hàng (`order.status`).
- **Reconciliation:** job nightly so khớp `paymentTransactions` với báo cáo gateway (download CSV) — tránh thất thoát.

**Quan điểm cho project này:**
- Đã có VNPAY. **Refactor `paymentController.js`** thành `PaymentService` + adapter pattern để dễ thêm MoMo/ZaloPay.
- Bổ sung **bảng `PaymentTransaction`** riêng (hiện đang gắn vào `Order`) — tách trách nhiệm rõ ràng và phục vụ kế toán.

---

### 3.6 Quản lý Đơn hàng & Vận chuyển (Order & Fulfillment)

**Mô tả:** Trạng thái đơn, in vận đơn, tích hợp đơn vị vận chuyển (GHN, GHTK, J&T), tracking, xác nhận giao thành công.

**Thiết kế:**
- **State machine:** `Pending → Confirmed → Packed → Shipping → Delivered → Completed`, branch `Cancelled`, `Returning`, `Refunded`. Mỗi chuyển trạng thái ghi `OrderTimeline`.
- **Shipping integration:**
  - Gọi API GHN/GHTK để: tính cước, tạo vận đơn, in label, lấy tracking number.
  - Webhook nhận cập nhật trạng thái → auto cập nhật `order.status`.
- **SLA:** vendor không xác nhận trong X giờ → auto-cancel (cronjob).

**Quan điểm cho project này:**
- Trạng thái hiện đơn giản (`Pending → Processing → Shipped → Delivered`). **Bổ sung Confirmed, Cancelled, Returning, Refunded** + bảng `OrderTimeline` để hiển thị tiến trình.
- Tích hợp **GHN** trước (phổ biến VN, API tốt) — đặt sau khi xong MVP đặt hàng nội bộ.

---

### 3.7 Đánh giá & Bình luận (Review & Rating)

**Mô tả:** Khách đánh giá sản phẩm sau khi nhận hàng, sao + ảnh + text, vendor phản hồi, admin kiểm duyệt review spam.

**Thiết kế:**
- **Model `Review`:** `{ productId, orderId, userId, rating (1-5), comment, images[], reply, status: 'visible'|'hidden'|'reported' }`.
- **Điều kiện:** chỉ user **đã mua và đơn đã Delivered** mới được đánh giá (kiểm tra qua `orderId`).
- **Aggregate:** lưu `Product.ratingAvg` + `Product.ratingCount` (denormalize) để query nhanh, update bằng background job hoặc trigger.

**Quan điểm cho project này:**
- **Thiếu hoàn toàn** — phải làm trong Phase 2. Đây là tính năng cực kỳ quan trọng cho marketplace (build trust).

---

### 3.8 Chat & CSKH (Customer Support)

**Mô tả:** Chat realtime customer ↔ vendor, customer ↔ admin, tạo ticket khiếu nại, FAQ.

**Thiết kế:**
- **Socket.io** (đã có) — nhưng cần **Redis adapter** khi chạy nhiều instance backend (hiện đang lưu `users[]` in-memory → mất khi restart, không scale).
- **Persistent:** mọi tin nhắn lưu `Message` collection (đã có).
- **Ticket khiếu nại:** model `Ticket` riêng cho dispute (đơn hàng có vấn đề) — workflow Customer mở → Vendor trả lời → Admin trung gian → Đóng.

**Quan điểm cho project này:**
- Chat đã chạy được. **Bổ sung Redis adapter** + **Ticket model** trong Phase 3.

---

### 3.9 Khuyến mãi & Marketing (Promotion)

**Mô tả:** Coupon, flash sale, voucher freeship, combo, banner trang chủ, email marketing, push notification.

**Thiết kế:**
- **Coupon nâng cao:**
  - `scope`: platform / shop / product / category.
  - `type`: percentage / fixed / freeship.
  - `conditions`: `minOrderValue`, `firstOrderOnly`, `userSegment`.
  - `limits`: `maxUsage`, `maxUsagePerUser`, `validFrom/validTo`.
- **Flash sale:** model `FlashSale` với `startAt`, `endAt`, danh sách `productIds` + `salePrice` + `stockLimit`. Frontend hiển thị countdown.
- **Banner CMS:** admin upload banner + link, sort thứ tự, ẩn/hiện theo lịch.

**Quan điểm cho project này:**
- Coupon hiện tại đơn giản. **Mở rộng schema** trong Phase 3.
- Flash sale: tận dụng `CountdownTimer` component đã có, chỉ cần thêm model + admin UI.

---

### 3.10 Quản lý Người bán (Vendor / Seller Center)

**Mô tả:** Đăng ký vendor, KYC (CMND, mã số thuế), dashboard riêng (doanh thu, đơn, sản phẩm), rút tiền (payout), commission.

**Thiết kế:**
- **Đăng ký:** form thông tin shop + upload giấy tờ → trạng thái `pending` → Admin duyệt.
- **Commission:** cấu hình `commissionRate` per-vendor hoặc per-category. Đã có default 5%.
- **Payout:**
  - Vendor có `balance` (đã có).
  - Tạo yêu cầu rút tiền → Admin duyệt → đánh dấu đã chuyển khoản → log `PayoutTransaction`.
  - **Không tự động chuyển tiền** — cần con người duyệt để tránh fraud trong giai đoạn đầu.

**Quan điểm cho project này:**
- Đã có register-vendor flow và balance. **Bổ sung Payout request workflow** + KYC fields trong Phase 4.

---

### 3.11 Thông báo (Notification)

**Mô tả:** Email transactional (xác nhận đơn, OTP, password reset), in-app notification, push notification (PWA), SMS quan trọng.

**Thiết kế:**
- **Queue-based:** dùng BullMQ (Redis) hoặc Agenda — không gửi email synchronous trong request (gây timeout).
- **Template:** Handlebars/MJML, version trong git.
- **In-app:** model `Notification` + Socket.io push realtime.

**Quan điểm cho project này:**
- Đã có `sendEmail.js` (Nodemailer) gửi sync. **Refactor sang queue** khi có Redis (kèm Socket.io adapter — tận dụng cùng Redis instance).

---

### 3.12 Báo cáo & Phân tích (Reporting & Analytics)

**Mô tả:** Dashboard doanh thu, đơn hàng, sản phẩm bán chạy, top vendor, conversion funnel, retention.

**Thiết kế:**
- **Real-time (Admin):** đã có endpoint `advanced-stats` — đủ cho MVP.
- **Báo cáo lịch sử:** aggregation pipeline pre-computed nightly vào collection `ReportDaily` (tránh aggregate trên dữ liệu lớn mỗi lần mở dashboard).
- **External:** push event tới Google Analytics 4 + Meta Pixel cho marketing.

**Quan điểm cho project này:**
- Dashboard đã có với Recharts. **Bổ sung pre-aggregation job** khi data > 100k đơn.

---

### 3.13 Bảo mật & Tuân thủ (Security & Compliance)

**Mô tả:** OWASP Top 10, GDPR/Nghị định 13/2023 (bảo vệ dữ liệu cá nhân), PCI-DSS (không lưu thẻ — dùng gateway).

**Thiết kế:**
- **Helmet, rate-limit, CORS whitelist, input validation** (Joi/Zod), output encoding.
- **Mã hóa at-rest:** trường nhạy cảm (CMND, số tài khoản vendor) mã hóa AES-256 trước khi lưu.
- **HTTPS only** + HSTS.
- **Audit log** mọi hành động admin/vendor.
- **Quyền của user:** cho phép xem/sửa/xóa dữ liệu cá nhân (export JSON + delete account) — yêu cầu pháp lý.

**Quan điểm cho project này:**
- **Phải làm trước go-live:** CORS whitelist, Helmet, rate-limit login (`5/min/IP`), validate input, ẩn stack trace trong production.

---

### 3.14 Vận hành (DevOps & SRE)

**Mô tả:** CI/CD, monitoring, logging, backup, deploy, scaling.

**Thiết kế:**
- **CI:** GitHub Actions — lint + test + build mỗi PR.
- **CD:** auto deploy `main` → staging; tag `v*` → production.
- **Hosting:** Docker + 1 trong (Fly.io / Render / Railway / VPS + Caddy) cho MVP; chuyển K8s khi cần.
- **DB:** MongoDB Atlas (free tier MVP, paid khi prod). Backup hằng ngày, point-in-time recovery.
- **Logging:** Pino + ship lên Better Stack / Datadog free tier.
- **Monitoring:** Sentry (error), UptimeRobot (uptime), Grafana Cloud (metrics) — đều có free tier.
- **CDN:** Cloudflare trước domain (free, đỡ DDoS, cache static).

**Quan điểm cho project này:**
- **Thiếu hoàn toàn** — Phase 5 sẽ ưu tiên CI + Docker + Sentry trước; monitoring chi tiết sau.

---

### 3.15 Tài liệu & Bàn giao (Documentation)

**Mô tả:** README, API docs, ADR (architecture decision records), runbook, user manual.

**Thiết kế:**
- **API:** OpenAPI 3 (Swagger UI mount tại `/api/docs`).
- **ADR:** thư mục `/docs/adr/` ghi quyết định kiến trúc lớn (vì sao chọn Mongo, vì sao Socket.io...).
- **Runbook:** `/docs/runbook.md` — cách restart, rollback, restore DB, xử lý các incident thường gặp.
- **User manual:** Notion/Docs cho team vận hành.

---

## 4. Quan điểm thiết kế tổng thể (Cross-cutting Design Principles)

1. **API-first:** mọi tính năng định nghĩa qua OpenAPI trước, frontend mock-server để chạy song song.
2. **Modular monolith trước, microservice sau:** giữ 1 codebase (monolith) nhưng tách module rõ ràng (auth/, catalog/, order/, payment/...). Khi 1 module quá tải thì tách thành service riêng — không vội chia nhỏ ngay từ đầu.
3. **Stateless backend:** không lưu state trong RAM process (chat users hiện đang lưu RAM — cần đổi sang Redis).
4. **12-Factor App:** config qua env, log ra stdout, port từ env, không hard-code.
5. **Immutable data when possible:** đơn hàng sau khi tạo không sửa giá/sp, chỉ thêm `timeline` event.
6. **Optimistic UI + server confirm:** UX nhanh, dữ liệu chính xác từ server.
7. **Mobile-first responsive:** > 70% traffic e-commerce VN từ mobile.
8. **i18n-ready từ đầu:** dùng key thay vì hardcode string ngay cả khi chỉ có tiếng Việt.
9. **Feature flag:** dùng env hoặc bảng `featureFlags` để bật/tắt tính năng không cần redeploy.
10. **Code review bắt buộc:** mọi PR phải có ít nhất 1 approver, CI xanh trước khi merge.

---

## 5. Hướng phát triển tối ưu (Optimization Strategy)

### 5.1 Tối ưu performance
- **DB:**
  - Index đầy đủ: `Product.slug`, `Product.categoryId`, `Order.userId+createdAt`, `Order.vendorId+status`, `User.email`.
  - Aggregation pipeline + `$lookup` thay vì N+1 query.
  - Read replica khi traffic đọc lớn.
- **Cache:**
  - Redis cho: session, danh mục cây, sản phẩm chi tiết (TTL 5 phút), kết quả search phổ biến.
  - HTTP cache headers cho static (Cloudflare).
- **Frontend:**
  - Code-split theo route (Vite tự làm).
  - Lazy load image (Cloudinary `f_auto,q_auto`).
  - Skeleton loader thay spinner.
  - Service Worker (PWA) cache shell.

### 5.2 Tối ưu chi phí
- Tận dụng free tier: MongoDB Atlas, Cloudinary, Cloudflare, Sentry, Better Stack.
- Cloudinary tự transform ảnh → không cần lưu nhiều size.
- Static frontend deploy Vercel/Netlify free.

### 5.3 Tối ưu trải nghiệm dev
- **Conventional Commits + Semantic Release** (auto changelog).
- **Pre-commit hook:** lint + format (Husky + lint-staged).
- **Docker Compose** local: Mongo + Redis + app, 1 lệnh `docker compose up`.
- **Seed data** đầy đủ (đã có `seeder.js`) — bổ sung user/vendor/product mẫu.
- **Storybook** cho UI components dùng chung.

### 5.4 Tối ưu chất lượng
- **Test pyramid:**
  - Unit (Jest/Vitest): utils, controllers (mock model) — mục tiêu 60% coverage.
  - Integration (supertest + MongoDB Memory Server): full request lifecycle các endpoint quan trọng.
  - E2E (Playwright): 5–10 happy path (login → mua → thanh toán → đánh giá).
- **Static analysis:** ESLint strict, Prettier, optional TypeScript migration cho `/server` (incremental).

---

## 6. Lộ trình phát triển & Plan bàn giao

Tổng thời gian dự kiến: **~12 tuần** (3 tháng), team 3 người (1 BE, 1 FE, 1 fullstack/QA). Có thể co giãn ±20% tùy scope.

### Phase 0 — Khởi động & Chuẩn hóa (Tuần 1)
**Mục tiêu:** Codebase sẵn sàng cho phát triển production.

- [ ] Viết `README.md` chuẩn (setup, env, scripts, kiến trúc).
- [ ] `.env.example` đầy đủ, không commit `.env` (hiện đang commit `.env` — **rủi ro lộ secret**).
- [ ] Docker Compose: `mongo`, `redis`, `app`, `client`.
- [ ] Cấu hình ESLint + Prettier + Husky pre-commit (lint-staged).
- [ ] GitHub Actions: `lint + test + build` trên mỗi PR.
- [ ] Setup Sentry (FE + BE), Pino logger.
- [ ] Setup OpenAPI skeleton + Swagger UI tại `/api/docs`.
- [ ] Tách `.env` ra khỏi git history (BFG hoặc `git filter-repo`), rotate secrets.

**DoD:** `npm run dev`, `npm run lint`, `npm run test` chạy clean; PR trigger CI; Swagger hiện endpoint hiện có.

---

### Phase 1 — Bảo mật & Auth nâng cao (Tuần 2)
**Mục tiêu:** Khóa các lỗ hổng bảo mật cơ bản.

- [ ] CORS whitelist domain cụ thể (không `*`).
- [ ] `helmet`, `express-rate-limit`, `express-mongo-sanitize`, `hpp`.
- [ ] Refactor JWT → HttpOnly cookie + refresh token rotation.
- [ ] Validate request: `zod` hoặc `joi` cho toàn bộ body/query.
- [ ] Password policy + brute-force protect (`5/min/IP` cho `/login`).
- [ ] Hash refresh token trước khi lưu DB.
- [ ] Thêm `permissions[]` vào User + middleware `requirePermission`.
- [ ] Audit log model + middleware ghi action admin.

**DoD:** Pass kiểm tra OWASP ZAP cơ bản; không còn warning bảo mật chính từ `npm audit`.

---

### Phase 2 — Catalog, Search, Review (Tuần 3–4)
**Mục tiêu:** Hoàn thiện trải nghiệm mua hàng cốt lõi.

- [ ] Bổ sung trạng thái `pending_review` cho Product + admin approval flow.
- [ ] Slug unique + auto-resolve trùng.
- [ ] MongoDB text index + filter chuẩn (giá, rating, category, có khuyến mãi).
- [ ] **Model `Review`** + endpoint CRUD review (gate bằng `orderId.status === 'delivered'`).
- [ ] Aggregate `ratingAvg`/`ratingCount` lưu trên Product (background job).
- [ ] FE: trang ProductDetails hiển thị review + form đánh giá.
- [ ] Wishlist UI hoàn chỉnh (đã có model).

**DoD:** Customer mua hàng → giao thành công → đánh giá → hiển thị trên Product page; admin duyệt được sản phẩm mới.

---

### Phase 3 — Đặt hàng, Thanh toán, Khuyến mãi nâng cao (Tuần 5–7)
**Mục tiêu:** Quy trình thương mại an toàn và hấp dẫn.

- [ ] MongoDB transaction cho tạo đơn (trừ stock atomic).
- [ ] Idempotency-Key cho `POST /api/orders`.
- [ ] `OrderTimeline` model + UI hiển thị tiến trình đơn cho customer.
- [ ] Tách `PaymentTransaction` model + adapter pattern `PaymentGateway`.
- [ ] Tích hợp **MoMo** (cộng VNPAY đã có) — qua adapter chung.
- [ ] Mở rộng `Coupon`: `scope`, `userSegment`, `maxUsagePerUser`.
- [ ] **`FlashSale`** model + admin UI + frontend countdown banner.
- [ ] **Return/Refund:** model `RefundRequest` + workflow Customer mở → Vendor xử lý → Admin trung gian → hoàn tiền.
- [ ] Email transactional qua queue (BullMQ + Redis).

**DoD:** Demo flow đầy đủ: áp coupon → thanh toán MoMo → đơn hàng có timeline → yêu cầu hoàn tiền → admin duyệt → tiền trả lại customer.

---

### Phase 4 — Vendor Center, Vận chuyển, CSKH (Tuần 8–9)
**Mục tiêu:** Vendor tự vận hành; tích hợp ship; CSKH thực sự.

- [ ] Vendor KYC fields + flow Admin duyệt.
- [ ] **Payout request** workflow + `PayoutTransaction`.
- [ ] Tích hợp **GHN** API: tính cước, tạo vận đơn, webhook tracking.
- [ ] Chat: Socket.io **Redis adapter** (đa instance).
- [ ] **`Ticket`** model + UI khiếu nại + thông báo in-app.
- [ ] Notification system (email + in-app + Socket.io push).

**DoD:** Vendor đăng ký → admin duyệt → đăng sản phẩm → bán → in vận đơn GHN → nhận tiền qua payout; customer mở ticket khiếu nại được xử lý.

---

### Phase 5 — Test, DevOps, Performance (Tuần 10–11)
**Mục tiêu:** Sẵn sàng production.

- [ ] Unit tests coverage ≥ 60% cho services/controllers.
- [ ] Integration tests cho 10 endpoint quan trọng nhất.
- [ ] E2E Playwright: 5 flow (đăng ký, mua hàng, hoàn tiền, vendor đăng SP, admin duyệt).
- [ ] Load test (k6/Artillery): mục tiêu 200 RPS cho `/api/products`, p95 < 300ms.
- [ ] Redis cache layer (category tree, product detail).
- [ ] Index audit + slow query log review.
- [ ] CDN Cloudflare trước.
- [ ] Backup script + restore drill (test khôi phục từ backup).
- [ ] Runbook + ADR.

**DoD:** Test xanh trên CI; load test pass; tài liệu vận hành đầy đủ.

---

### Phase 6 — UAT & Bàn giao (Tuần 12)
**Mục tiêu:** Bàn giao chính thức cho khách hàng nội bộ.

- [ ] UAT với stakeholder (checklist tính năng + bug log).
- [ ] Fix bug priority cao/trung từ UAT.
- [ ] Train vận hành (Admin/CSKH) — 2 buổi.
- [ ] Handover package:
  - Source code + git tag `v1.0.0`.
  - Hướng dẫn deploy (production + staging).
  - Credentials (qua password manager — không qua chat).
  - Tài liệu API (Swagger).
  - User manual (Notion).
  - SLA + on-call rotation đề xuất.
- [ ] Deploy production + smoke test.
- [ ] Họp retrospective + đề xuất roadmap v1.1.

**DoD:** Khách hàng ký nghiệm thu; hệ thống chạy production ổn định 7 ngày liên tục không incident nghiêm trọng.

---

## 7. Rủi ro & Giải pháp

| Rủi ro | Xác suất | Tác động | Giải pháp |
|---|---|---|---|
| Lộ `.env` đã commit | Cao | Cao | Rotate secrets ngay + `git filter-repo` xóa lịch sử |
| Race condition tạo đơn (oversell) | Trung | Cao | MongoDB transaction + version key |
| Vendor gian lận (đăng SP cấm, nâng giá ảo) | Trung | Trung | Approval flow + audit log + threshold cảnh báo |
| Cổng thanh toán fail/đổi API | Thấp | Cao | Adapter pattern, fallback gateway, alert ngay |
| Quá tải mùa sale | Trung | Trung | Cache Redis + autoscale + flash-sale stock limit |
| Lộ dữ liệu cá nhân | Thấp | Cực cao | Encrypt at-rest + audit log + giới hạn quyền |
| Phụ thuộc deps không maintain | Trung | Thấp | Renovate bot + audit định kỳ |
| Đội ngũ rotate, mất kiến thức | Trung | Trung | ADR + runbook + pair programming |

---

## 8. KPI / Tiêu chí thành công

- **Tính năng:** 100% nghiệp vụ trong mục 3 đã làm hoặc đã có quyết định defer rõ ràng.
- **Chất lượng:**
  - Test coverage ≥ 60%.
  - 0 lỗi nghiêm trọng (P0/P1) tồn đọng khi go-live.
  - `npm audit` không còn high/critical.
- **Hiệu năng:**
  - p95 < 300ms cho API đọc.
  - LCP < 2.5s trên 4G mobile.
- **Vận hành:**
  - Uptime ≥ 99.5%/tháng.
  - MTTR (mean time to recovery) < 30 phút.
- **Người dùng:**
  - Đăng ký → mua hàng đầu tiên < 5 phút.
  - Tỉ lệ rớt giỏ hàng < 70%.

---

## 9. Quyết định kiến trúc cần chốt sớm (ADR candidates)

1. **Chốt giữ MongoDB hay đổi PostgreSQL?** — Khuyến nghị giữ MongoDB cho MVP (đã có code), cân nhắc Postgres cho v2 nếu cần transaction phức tạp + reporting.
2. **Monolith hay microservices?** — Khuyến nghị **modular monolith**, tách service chỉ khi cần (chat, search, payment có thể tách trước).
3. **TypeScript migration?** — Khuyến nghị migrate incremental cho `/server` từ Phase 2, `/client` từ Phase 4. Không bắt buộc cho v1.
4. **Hosting:** VPS + Caddy/Docker (rẻ, control cao) vs PaaS (Fly.io/Render — nhanh, đắt hơn). Khuyến nghị **Fly.io** cho MVP, chuyển VPS khi tối ưu chi phí.
5. **Realtime adapter:** Socket.io + Redis adapter (đã đề xuất) vs migrating sang Pusher/Ably (managed). Khuyến nghị tự host Redis trong Phase 4.

---

## 10. Checklist bàn giao (Handover Checklist)

- [ ] Source code đã merge `main`, gắn tag `v1.0.0`.
- [ ] CI/CD xanh, deploy production thành công.
- [ ] `.env.production.example` đầy đủ key, có chú thích.
- [ ] Mọi secret đã set trong secret manager (không trong git).
- [ ] Backup DB chạy auto, đã test restore.
- [ ] Monitoring + alert đã gắn vào Slack/Telegram của khách hàng.
- [ ] Tài liệu: README, API (Swagger), Runbook, User manual.
- [ ] Quyền truy cập: admin/owner đã chuyển cho khách hàng, dev team giữ quyền hạn chế (hoặc xoá tùy thoả thuận).
- [ ] 2 buổi training cho team vận hành (record video).
- [ ] Báo cáo kết thúc dự án + retrospective.

---

## 11. Phụ lục

### 11.1 Cấu trúc thư mục đề xuất sau refactor
```
/server
  /src
    /modules
      /auth        (controller + service + route + dto)
      /catalog
      /order
      /payment
      /review
      /vendor
      /chat
      /notification
    /shared        (middleware, utils, errors)
    /config
    app.ts
    server.ts
  /tests
/client
  /src
    /features    (cùng tên với module BE)
    /shared      (ui, hooks, lib)
    /pages
    /routes
```

### 11.2 Lệnh hay dùng
```bash
# Dev
npm run dev              # backend (nodemon)
cd client && npm run dev # frontend (vite)

# Seed
npm run data:import
npm run data:destroy

# Test (sau khi setup)
npm test
npm run test:e2e

# Docker
docker compose up -d
```

### 11.3 Tham khảo
- [12-Factor App](https://12factor.net/)
- [OWASP Top 10](https://owasp.org/Top10/)
- [VNPAY docs](https://sandbox.vnpayment.vn/apis/)
- [GHN API](https://api.ghn.vn/home/docs/)
- [MongoDB best practices](https://www.mongodb.com/docs/manual/administration/production-notes/)

---

_Tài liệu được lập ngày 2026-05-13. Cập nhật theo sprint review._

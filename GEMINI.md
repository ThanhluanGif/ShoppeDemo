# Project Context: Web Bán Hàng (E-commerce Fullstack)

## 🚀 Tech Stack & Architecture
- **Frontend:** React (Vite), Tailwind CSS, Lucide React (Icons).
- **Backend:** Node.js, Express.js.
- **Database:** MongoDB (Mongoose).
- **Authentication:** JWT (JSON Web Token) + Cookies, Bcrypt để hash mật khẩu.
- **Architecture:** Modular Pattern (Controllers, Models, Routes, Middlewares).

## 🔐 Business Logic & Roles
- **Roles:** `admin` (toàn quyền CRUD), `customer` (xem hàng, mua hàng, quản lý profile).
- **Security:** Luôn có middleware xác thực JWT cho các route nhạy cảm. Admin route phải qua lớp kiểm tra `isAdmin`.

## 🎨 Coding Standards & Vibe
- **Clean Code:** Ưu tiên async/await, try-catch để xử lý lỗi.
- **UI/UX:** Tối giản, hiện đại, responsive (mobile-first). Sử dụng Tailwind class trực tiếp.
- **Language:** Code và comment bằng tiếng Anh (hoặc tiếng Việt tùy bạn chọn), nhưng giải thích logic cho tôi bằng tiếng Việt.
- **Response Format:** Chỉ cung cấp code cần thiết, giải thích ngắn gọn, đi thẳng vào vấn đề.

## 📁 Project Structure (Strict)
- `/server`: Chứa logic Backend (models, routes, controllers, middleware).
- `/client`: Chứa logic Frontend (components, pages, hooks, services).
- `.env`: Chứa các biến môi trường như `MONGO_URI`, `JWT_SECRET`.

---

## 🗺️ Lộ Trình Phát Triển (Roadmap)

### Phase 1: Hoàn thiện Authentication & UI Cơ bản
1.  **Backend:** Thêm route `GET /api/users/profile` để lấy thông tin user hiện tại.
2.  **Frontend:** Xây dựng trang Login và Register hoàn chỉnh (UI + Logic kết nối API).
3.  **Frontend:** Cập nhật `App.jsx` để bảo vệ các route cần đăng nhập.

### Phase 2: Quản lý Sản phẩm (Full CRUD & Image)
1.  **Backend:** Thêm controller/route cho Update và Delete sản phẩm.
2.  **Backend:** Tích hợp Multer hoặc Cloudinary để upload ảnh sản phẩm.
3.  **Frontend:** Hoàn thiện trang Admin Product (Thêm/Sửa/Xóa sản phẩm, hiển thị danh sách dạng bảng).

### Phase 3: Trải nghiệm Người dùng (Catalog & Search)
1.  **Frontend:** Xây dựng trang Home với danh sách sản phẩm đẹp mắt (Grid layout).
2.  **Frontend:** Xây dựng trang Chi tiết sản phẩm (Product Details).
3.  **Backend/Frontend:** Thêm chức năng tìm kiếm sản phẩm và lọc theo danh mục (Category).

### Phase 4: Giỏ hàng & Thanh toán (Cart & Checkout)
1.  **Frontend:** Quản lý giỏ hàng (sử dụng LocalStorage hoặc Context API). Xây dựng trang Cart.
2.  **Backend:** Tạo Model `Order` để lưu thông tin đơn hàng.
3.  **Frontend:** Xây dựng trang Checkout (Nhập địa chỉ, chọn phương thức thanh toán).
4.  **Backend:** Route xử lý tạo đơn hàng mới.

### Phase 5: Quản lý Đơn hàng & Admin Dashboard
1.  **Frontend/Backend:** Trang quản lý đơn hàng cho khách hàng (Xem lịch sử mua hàng).
2.  **Admin:** Trang quản lý tất cả đơn hàng cho Admin (Cập nhật trạng thái giao hàng).
3.  **Admin:** Dashboard thống kê doanh thu, số lượng user, sản phẩm bán chạy.

---

## 💬 Cách Prompt để code hiệu quả

Khi bạn muốn làm bước tiếp theo, hãy copy các mẫu prompt dưới đây:

### Prompt cho Phase 1 (Auth):
> "Dựa trên `AuthContext.jsx` và `userRoutes.js` hiện có, hãy tạo trang Login và Register hoàn chỉnh trong thư mục `client/src/pages`. Sau đó cập nhật `App.jsx` để thay thế các placeholder routes."

### Prompt cho Phase 2 (Admin CRUD):
> "Hãy hoàn thiện chức năng CRUD sản phẩm. Cụ thể: 1. Thêm hàm `updateProduct` và `deleteProduct` vào `productController.js`. 2. Cập nhật `productRoutes.js`. 3. Hoàn thiện `AdminProductPage.jsx` để có thể sửa và xóa sản phẩm trực tiếp từ giao diện."

### Prompt cho Phase 3 (Product UI):
> "Hãy tạo trang Home (`HomePage.jsx`) hiển thị danh sách sản phẩm dưới dạng Grid card sử dụng Tailwind CSS. Mỗi card có nút 'Xem chi tiết'. Sau đó tạo trang `ProductDetails.jsx` để hiển thị thông tin chi tiết khi click vào."

### Prompt cho Phase 4 (Cart):
> "Xây dựng hệ thống giỏ hàng. Hãy tạo `CartContext.jsx` để quản lý state giỏ hàng (lưu vào LocalStorage). Sau đó tạo trang `CartPage.jsx` cho phép tăng/giảm số lượng và xóa sản phẩm khỏi giỏ."

### Prompt cho Phase 5 (Orders):
> "Tạo model `Order.js` trong server. Viết route và controller để khách hàng có thể đặt hàng từ giỏ hàng. Sau đó xây dựng trang `CheckoutPage.jsx` để thu thập địa chỉ giao hàng và xác nhận đơn hàng."
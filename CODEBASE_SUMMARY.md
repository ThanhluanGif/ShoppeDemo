# Tổng Quan Hệ Thống Web Bán Hàng (E-commerce Fullstack)

Tài liệu này tóm tắt cấu trúc, logic nghiệp vụ và các tính năng chính đã được triển khai trong dự án **Web Bán Hàng**.

## 🚀 Công Nghệ Sử Dụng (Tech Stack)

*   **Frontend:** React (Vite), Tailwind CSS, Lucide React (Icons), React Router DOM (Routing), Socket.io-client.
*   **Backend:** Node.js, Express.js, MongoDB (Mongoose), Socket.io (Real-time).
*   **Xác thực:** JWT (JSON Web Token), Passport.js (Social Login), Bcryptjs (Hash mật khẩu).
*   **Lưu trữ & Ảnh:** Multer, Cloudinary (đang tích hợp).
*   **Thanh toán:** VNPAY (logic tích hợp trong controller).

---

## 📂 Cấu Trúc Thư Mục (Project Structure)

### Backend (`/server`)
*   `server.js`: Điểm khởi đầu, thiết lập Socket.io và kết nối Database.
*   `app.js`: Cấu hình Express, Middlewares và định nghĩa các Route API.
*   `/models`: Định nghĩa cấu trúc dữ liệu (User, Product, Order, Category, Coupon, Message).
*   `/controllers`: Xử lý logic nghiệp vụ cho từng thực thể.
*   `/routes`: Định nghĩa các endpoint API.
*   `/middleware`: Các lớp kiểm tra (Auth, Admin, Error, Upload).
*   `/utils`: Các hàm tiện ích (Gửi email, xử lý async).

### Frontend (`/client`)
*   `App.jsx`: Quản lý Routing và bảo vệ các tuyến đường (Private/Admin Route).
*   `/context`: Quản lý trạng thái toàn cục (AuthContext, CartContext).
*   `/pages`: Chứa giao diện các trang (Home, Admin, Cart, Checkout, Profile...).
*   `/components`: Các thành phần giao diện dùng chung (Navbar, Footer, ChatBox, Modals).
*   `/services`: Định nghĩa các hàm gọi API.

---

## 🔐 Logic Nghiệp Vụ Chính (Core Business Logic)

### 1. Hệ Thống Người Dùng & Xác Thực
*   **Phân quyền (Roles):** `admin` (quản trị), `vendor` (người bán), `customer` (khách hàng).
*   **Đăng ký/Đăng nhập:** Hỗ trợ đăng ký truyền thống (có xác thực email qua mã token) và đăng nhập qua Google/Facebook.
*   **Quản lý Profile:** Người dùng có thể cập nhật thông tin cá nhân, quản lý danh sách địa chỉ và sản phẩm yêu thích (Wishlist).
*   **Người bán (Vendor):** Khách hàng có thể đăng ký trở thành người bán, yêu cầu sẽ được Admin phê duyệt.

### 2. Quản lý Sản Phẩm
*   Hỗ trợ CRUD sản phẩm với đầy đủ thông tin: tên, giá, ảnh, danh mục, số lượng tồn kho.
*   **Biến thể (Variations):** Hỗ trợ sản phẩm có nhiều màu sắc và kích cỡ, mỗi biến thể quản lý tồn kho riêng.

### 3. Quy Trình Đơn Hàng & Thanh Toán
*   **Tách đơn hàng:** Khi khách hàng mua sản phẩm từ nhiều shop khác nhau, hệ thống tự động tách thành các đơn hàng riêng biệt cho từng Vendor.
*   **Quản lý tồn kho:** Tự động trừ kho khi đặt hàng và hoàn kho khi hủy đơn.
*   **Hoa hồng (Commission):** Admin thu phí hoa hồng trên mỗi đơn hàng thành công (mặc định 5%). Số tiền còn lại được cộng vào số dư (balance) của Vendor.
*   **Trạng thái đơn hàng:** `Pending` -> `Processing` -> `Shipped` -> `Delivered`. Hỗ trợ xác nhận thanh toán (`Paid`).

### 4. Giao Tiếp Real-time (Chat)
*   Sử dụng Socket.io để hỗ trợ chat trực tiếp giữa khách hàng và người bán/admin.
*   Tin nhắn được lưu trữ trong database và cập nhật tức thời trên giao diện.

### 5. Marketing & Thống Kê
*   **Mã giảm giá (Coupon):** Hệ thống tạo và áp dụng mã giảm giá.
*   **Dashboard Thống kê:** Cung cấp biểu đồ doanh thu hàng ngày, phân bổ danh mục, sản phẩm bán chạy và top người bán (dành cho Admin/Vendor).

---

## 🛠️ Các Endpoint API Quan Trọng

*   `POST /api/users/login`: Đăng nhập.
*   `POST /api/users`: Đăng ký tài khoản mới.
*   `GET /api/products`: Lấy danh sách sản phẩm (hỗ trợ lọc/tìm kiếm).
*   `POST /api/orders`: Tạo đơn hàng mới.
*   `GET /api/orders/advanced-stats`: Lấy dữ liệu thống kê chuyên sâu.

---

Tài liệu này phản ánh trạng thái hiện tại của codebase tính đến ngày **09/05/2026**.

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load models
const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Coupon = require('../models/Coupon');
const Order = require('../models/Order');

dotenv.config();

// Kết nối Database
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected for Seeding...'))
  .catch(err => console.error(err));

const importData = async () => {
  try {
    // 1. Xóa dữ liệu cũ
    await User.deleteMany();
    await Product.deleteMany();
    await Category.deleteMany();
    await Coupon.deleteMany();
    await Order.deleteMany();

    console.log('Old Data Cleaned...');

    // 2. Tạo User mẫu
    await User.create([
      {
        username: 'admin',
        email: 'admin@example.com',
        password: 'admin12345', 
        role: 'admin',
        isVerified: true
      },
      {
        username: 'customer01',
        email: 'customer@example.com',
        password: 'user12345',
        role: 'customer',
        isVerified: true
      }
    ]);

    // 3. Tạo Category mẫu (Công nghệ)
    const categories = await Category.insertMany([
      { 
        name: 'Điện thoại', 
        slug: 'dien-thoai', 
        image: 'https://images.unsplash.com/photo-1598327105666-5b89351cb315?q=80&w=400&auto=format&fit=crop',
        description: 'Smartphone chính hãng' 
      },
      { 
        name: 'Laptop', 
        slug: 'laptop', 
        image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=400&auto=format&fit=crop',
        description: 'Máy tính xách tay các loại' 
      },
      { 
        name: 'Phụ kiện', 
        slug: 'phu-kien', 
        image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=400&auto=format&fit=crop',
        description: 'Cáp, sạc, ốp lưng, sạc dự phòng' 
      },
      { 
        name: 'Âm thanh', 
        slug: 'am-thanh', 
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=400&auto=format&fit=crop',
        description: 'Tai nghe, loa Bluetooth' 
      },
      { 
        name: 'Đồng hồ', 
        slug: 'dong-ho', 
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400&auto=format&fit=crop',
        description: 'Smartwatch, vòng đeo tay thông minh' 
      }
    ]);

    console.log('Categories Created...');

    // 4. Tạo Product mẫu
    const products = [
      {
        name: 'Apple iPhone 15 Pro Max 256GB - Chính hãng VN/A',
        slug: 'apple-iphone-15-pro-max-256gb',
        brand: 'Apple',
        price: 29500000,
        description: 'iPhone 15 Pro Max với thiết kế titan nguyên khối, chip A17 Pro mạnh mẽ và camera zoom quang học 5x.',
        category: categories[0]._id,
        image: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?q=80&w=800&auto=format&fit=crop',
        countInStock: 50,
        rating: 4.9,
        numReviews: 320,
        isFlashSale: true,
        flashSalePrice: 28900000,
        flashSaleStartTime: new Date(Date.now() - 86400000),
        flashSaleEndTime: new Date(Date.now() + 86400000 * 3)
      },
      {
        name: 'Samsung Galaxy S24 Ultra 5G 256GB',
        slug: 'samsung-galaxy-s24-ultra',
        brand: 'Samsung',
        price: 27990000,
        description: 'Galaxy AI is here. Sức mạnh vi xử lý Snapdragon 8 Gen 3 for Galaxy, khung viền Titanium.',
        category: categories[0]._id,
        image: 'https://images.unsplash.com/photo-1706114408101-35222b467610?q=80&w=800&auto=format&fit=crop',
        countInStock: 30,
        rating: 4.8,
        numReviews: 215,
        isFlashSale: false
      },
      {
        name: 'MacBook Air 13 inch M3 2024 8 CPU - 8 GPU/8GB/256GB',
        slug: 'macbook-air-13-m3',
        brand: 'Apple',
        price: 27490000,
        description: 'Mỏng nhẹ, mạnh mẽ với chip Apple M3. Pin dùng cả ngày dài.',
        category: categories[1]._id,
        image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=800&auto=format&fit=crop',
        countInStock: 15,
        rating: 5.0,
        numReviews: 89,
        isFlashSale: true,
        flashSalePrice: 26500000,
        flashSaleStartTime: new Date(Date.now() - 86400000),
        flashSaleEndTime: new Date(Date.now() + 86400000 * 2)
      },
      {
        name: 'Tai nghe Bluetooth AirPods Pro (Thế hệ 2) MagSafe (USB-C)',
        slug: 'airpods-pro-2-usb-c',
        brand: 'Apple',
        price: 5490000,
        description: 'Chống ồn chủ động (ANC) tốt hơn gấp 2 lần. Hộp sạc hỗ trợ USB-C.',
        category: categories[3]._id,
        image: 'https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?q=80&w=800&auto=format&fit=crop',
        countInStock: 100,
        rating: 4.7,
        numReviews: 540,
        isFlashSale: false
      },
      {
        name: 'Đồng hồ thông minh Apple Watch Series 9 GPS 41mm Viền nhôm Dây cao su',
        slug: 'apple-watch-series-9-41mm',
        brand: 'Apple',
        price: 9490000,
        description: 'Màn hình sáng hơn, thao tác chạm hai lần mới mẻ. Chăm sóc sức khỏe toàn diện.',
        category: categories[4]._id,
        image: 'https://images.unsplash.com/photo-1434494870572-09c7d0b66820?q=80&w=800&auto=format&fit=crop',
        countInStock: 25,
        rating: 4.6,
        numReviews: 120,
        isFlashSale: true,
        flashSalePrice: 8990000,
        flashSaleStartTime: new Date(Date.now() - 86400000),
        flashSaleEndTime: new Date(Date.now() + 86400000 * 5)
      },
      {
        name: 'Củ sạc nhanh Anker 20W PD Type-C',
        slug: 'sac-nhanh-anker-20w',
        brand: 'Anker',
        price: 350000,
        description: 'Sạc nhanh, an toàn, tương thích tốt với iPhone và thiết bị hỗ trợ PD.',
        category: categories[2]._id,
        image: 'https://images.unsplash.com/photo-1610945264803-c22b62d2a7b3?q=80&w=800&auto=format&fit=crop',
        countInStock: 200,
        rating: 4.8,
        numReviews: 850,
        isFlashSale: false
      },
      {
        name: 'Laptop ASUS ROG Strix G15 (2022)',
        slug: 'asus-rog-strix-g15',
        brand: 'ASUS',
        price: 25990000,
        description: 'Laptop gaming cực đỉnh, màn hình 144Hz, tản nhiệt tốt.',
        category: categories[1]._id,
        image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?q=80&w=800&auto=format&fit=crop',
        countInStock: 20,
        rating: 4.7,
        numReviews: 95,
        isFlashSale: false
      },
      {
        name: 'Chuột không dây Logitech G Pro X Superlight',
        slug: 'logitech-g-pro-x-superlight',
        brand: 'Logitech',
        price: 2890000,
        description: 'Chuột gaming siêu nhẹ, cảm biến HERO 25K.',
        category: categories[2]._id,
        image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?q=80&w=800&auto=format&fit=crop',
        countInStock: 50,
        rating: 4.9,
        numReviews: 210,
        isFlashSale: true,
        flashSalePrice: 2490000,
        flashSaleStartTime: new Date(Date.now() - 86400000),
        flashSaleEndTime: new Date(Date.now() + 86400000 * 4)
      },
      {
        name: 'Tai nghe Bluetooth Sony WH-1000XM5',
        slug: 'sony-wh-1000xm5',
        brand: 'Sony',
        price: 7990000,
        description: 'Tai nghe chụp tai chống ồn hàng đầu từ Sony.',
        category: categories[3]._id,
        image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=800&auto=format&fit=crop',
        countInStock: 40,
        rating: 4.8,
        numReviews: 180,
        isFlashSale: false
      },
      {
        name: 'Bàn phím cơ Akko 3098B Multi-modes Black Gold',
        slug: 'akko-3098b-black-gold',
        brand: 'Akko',
        price: 1990000,
        description: 'Bàn phím cơ kết nối 3 chế độ, switch chất lượng cao.',
        category: categories[2]._id,
        image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=800&auto=format&fit=crop',
        countInStock: 60,
        rating: 4.6,
        numReviews: 150,
        isFlashSale: true,
        flashSalePrice: 1790000,
        flashSaleStartTime: new Date(Date.now() - 86400000),
        flashSaleEndTime: new Date(Date.now() + 86400000 * 2)
      },
      {
        name: 'iPad Pro M2 11 inch WiFi 128GB',
        slug: 'ipad-pro-m2-11-inch',
        brand: 'Apple',
        price: 20490000,
        description: 'Máy tính bảng sức mạnh vượt trội từ Apple M2.',
        category: categories[1]._id,
        image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=800&auto=format&fit=crop',
        countInStock: 25,
        rating: 4.9,
        numReviews: 110,
        isFlashSale: false
      },
      {
        name: 'Loa Bluetooth Marshall Acton III',
        slug: 'marshall-acton-3',
        brand: 'Marshall',
        price: 6990000,
        description: 'Thiết kế cổ điển, âm thanh đặc trưng của Marshall.',
        category: categories[3]._id,
        image: 'https://images.unsplash.com/photo-1629813098670-6da76bcdafb0?q=80&w=800&auto=format&fit=crop',
        countInStock: 30,
        rating: 4.8,
        numReviews: 85,
        isFlashSale: true,
        flashSalePrice: 6290000,
        flashSaleStartTime: new Date(Date.now() - 86400000),
        flashSaleEndTime: new Date(Date.now() + 86400000 * 5)
      },
      {
        name: 'Màn hình máy tính LG 27UP600 27" 4K IPS',
        slug: 'lg-27up600-4k',
        brand: 'LG',
        price: 7490000,
        description: 'Màn hình 4K sắc nét, hỗ trợ VESA DisplayHDR 400.',
        category: categories[2]._id,
        image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=800&auto=format&fit=crop',
        countInStock: 15,
        rating: 4.7,
        numReviews: 65,
        isFlashSale: false
      },
      {
        name: 'Đồng hồ thông minh Samsung Galaxy Watch 6 Classic',
        slug: 'galaxy-watch-6-classic',
        brand: 'Samsung',
        price: 8490000,
        description: 'Viền bezel xoay vật lý, theo dõi sức khỏe chi tiết.',
        category: categories[4]._id,
        image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?q=80&w=800&auto=format&fit=crop',
        countInStock: 35,
        rating: 4.6,
        numReviews: 140,
        isFlashSale: false
      },
      {
        name: 'Sạc dự phòng Baseus Bipow 20000mAh 20W',
        slug: 'baseus-bipow-20000mah',
        brand: 'Baseus',
        price: 490000,
        description: 'Dung lượng lớn, sạc nhanh tiện lợi mang theo.',
        category: categories[2]._id,
        image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?q=80&w=800&auto=format&fit=crop',
        countInStock: 150,
        rating: 4.8,
        numReviews: 320,
        isFlashSale: true,
        flashSalePrice: 350000,
        flashSaleStartTime: new Date(Date.now() - 86400000),
        flashSaleEndTime: new Date(Date.now() + 86400000 * 3)
      },
      {
        name: 'Điện thoại Xiaomi Redmi Note 13 Pro 5G',
        slug: 'xiaomi-redmi-note-13-pro',
        brand: 'Xiaomi',
        price: 8990000,
        description: 'Camera 200MP, màn hình OLED 120Hz mượt mà.',
        category: categories[0]._id,
        image: 'https://images.unsplash.com/photo-1598327105666-5b89351cb315?q=80&w=800&auto=format&fit=crop',
        countInStock: 80,
        rating: 4.7,
        numReviews: 245,
        isFlashSale: false
      },
      {
        name: 'Ốp lưng iPhone 15 Pro Max UAG Monarch',
        slug: 'uag-monarch-iphone-15-pro-max',
        brand: 'UAG',
        price: 1350000,
        description: 'Bảo vệ chống sốc quân đội 5 lớp siêu bền.',
        category: categories[2]._id,
        image: 'https://images.unsplash.com/photo-1601593346740-925612772716?q=80&w=800&auto=format&fit=crop',
        countInStock: 100,
        rating: 4.8,
        numReviews: 120,
        isFlashSale: false
      },
      {
        name: 'MacBook Pro 14 M3 Pro 2023 11CPU - 14GPU/18GB/512GB',
        slug: 'macbook-pro-14-m3-pro',
        brand: 'Apple',
        price: 48990000,
        description: 'Sức mạnh M3 Pro đỉnh cao cho dân chuyên nghiệp.',
        category: categories[1]._id,
        image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=800&auto=format&fit=crop',
        countInStock: 10,
        rating: 5.0,
        numReviews: 45,
        isFlashSale: true,
        flashSalePrice: 47500000,
        flashSaleStartTime: new Date(Date.now() - 86400000),
        flashSaleEndTime: new Date(Date.now() + 86400000 * 1)
      }
    ];

    await Product.insertMany(products);
    console.log('Products Created...');

    // 5. Tạo Coupon mẫu
    await Coupon.create({
      code: 'TECH10',
      discountType: 'percentage',
      discountAmount: 10,
      minPurchase: 1000000,
      expiryDate: new Date('2026-12-31'),
      isActive: true
    });

    console.log('Data Imported Successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error with data import: ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await User.deleteMany();
    await Product.deleteMany();
    await Category.deleteMany();
    await Coupon.deleteMany();
    await Order.deleteMany();

    console.log('Data Destroyed!');
    process.exit();
  } catch (error) {
    console.error(`Error with data destruction: ${error.message}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
